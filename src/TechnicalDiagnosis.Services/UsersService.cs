using System;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using TechnicalDiagnosis.DomainClasses;
using TechnicalDiagnosis.DataLayer.Context;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TechnicalDiagnosis.Common;
using TechnicalDiagnosis.ViewModels;
using System.Linq;
using System.Collections.Generic;

namespace TechnicalDiagnosis.Services
{
    public interface IUsersService
    {
        Task<string> GetSerialNumberAsync(int userId);
        Task<User> FindUserAsync(string username, string password);
        Task<User> FindUserAsync(int userId);
        Task UpdateUserLastActivityDateAsync(int userId);
        Task<User> GetCurrentUserAsync();
        int GetCurrentUserId();
        Task<(bool Succeeded, string Error)> ChangePasswordAsync(User user, string currentPassword, string newPassword);
        Task<PagedQueryResult<User>> DataTableListAsync(int page = 1, int size = 10);
        Task<bool> InsertAsync(UserViewModel model);
    }

    public class UsersService : IUsersService
    {
        private readonly IUnitOfWork _uow;
        private readonly DbSet<User> _users;
        private readonly DbSet<UserRole> _userRole;
        private readonly DbSet<Role> _role;
        private readonly ISecurityService _securityService;
        private readonly IHttpContextAccessor _contextAccessor;

        public UsersService(
            IUnitOfWork uow,
            ISecurityService securityService,
            IHttpContextAccessor contextAccessor)
        {
            _uow = uow;
            _uow.CheckArgumentIsNull(nameof(_uow));

            _users = _uow.Set<User>();
            _role = _uow.Set<Role>();
            _userRole = _uow.Set<UserRole>();

            _securityService = securityService;
            _securityService.CheckArgumentIsNull(nameof(_securityService));

            _contextAccessor = contextAccessor;
            _contextAccessor.CheckArgumentIsNull(nameof(_contextAccessor));
        }

        public async Task<User> FindUserAsync(int userId)
        {
            return await _users.FindAsync(userId);
        }

        public Task<User> FindUserAsync(string username, string password)
        {
            var passwordHash = _securityService.GetSha256Hash(password);
            return _users.FirstOrDefaultAsync(x => x.Username == username && x.Password == passwordHash);
        }

        public async Task<string> GetSerialNumberAsync(int userId)
        {
            var user = await FindUserAsync(userId);
            return user.SerialNumber;
        }

        public async Task UpdateUserLastActivityDateAsync(int userId)
        {
            var user = await FindUserAsync(userId);
            if (user.LastLoggedIn != null)
            {
                var updateLastActivityDate = TimeSpan.FromMinutes(2);
                var currentUtc = DateTimeOffset.UtcNow;
                var timeElapsed = currentUtc.Subtract(user.LastLoggedIn.Value);
                if (timeElapsed < updateLastActivityDate)
                {
                    return;
                }
            }
            user.LastLoggedIn = DateTimeOffset.UtcNow;
            await _uow.SaveChangesAsync();
        }

        public int GetCurrentUserId()
        {
            var claimsIdentity = _contextAccessor.HttpContext.User.Identity as ClaimsIdentity;
            var userDataClaim = claimsIdentity?.FindFirst(ClaimTypes.UserData);
            var userId = userDataClaim?.Value;
            return string.IsNullOrWhiteSpace(userId) ? 0 : int.Parse(userId);
        }

        public Task<User> GetCurrentUserAsync()
        {
            var userId = GetCurrentUserId();
            return FindUserAsync(userId);
        }

        public async Task<(bool Succeeded, string Error)> ChangePasswordAsync(User user, string currentPassword, string newPassword)
        {
            var currentPasswordHash = _securityService.GetSha256Hash(currentPassword);
            if (user.Password != currentPasswordHash)
            {
                return (false, "Current password is wrong.");
            }

            user.Password = _securityService.GetSha256Hash(newPassword);
            // user.SerialNumber = Guid.NewGuid().ToString("N"); // To force other logins to expire.
            await _uow.SaveChangesAsync();
            return (true, string.Empty);
        }

        public async Task<PagedQueryResult<User>> DataTableListAsync(int page = 1, int size = 10)
        {
            var query = _users.AsNoTracking().AsQueryable();

            var total = await query.CountAsync();

            query = query.ApplyPaging(page, size);

            return new PagedQueryResult<User> { Total = total, Rows = await query.ToListAsync() };
        }

        private async Task<List<Role>> GetAllRoles(){
            return await _role.ToListAsync();
        }

        public async Task<bool> InsertAsync(UserViewModel model)
        {
            try
            {
                var roles = await this.GetAllRoles();
                var userRole = roles.Where(x => x.Name == CustomRoles.User).FirstOrDefault();
                var adminRole = roles.Where(x => x.Name == CustomRoles.Admin).FirstOrDefault();
                var user = new User {
                    Username = model.Username,
                    Password =  _securityService.GetSha256Hash(model.Password),
                    DisplayName = model.DisplayName,
                    IsActive = model.IsActive,
                    SerialNumber = Guid.NewGuid().ToString("N")
                };

                await _users.AddAsync(user);

                await _userRole.AddAsync(new UserRole { Role = userRole, User = user });

                if(model.IsAdmin)
                   await _userRole.AddAsync(new UserRole { Role = adminRole, User = user });

                return true;
            }
            catch (System.Exception)
            {
                return false;
            }
        }


    }
}
