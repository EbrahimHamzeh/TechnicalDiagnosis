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
using DNTPersianUtils.Core;

namespace TechnicalDiagnosis.Services
{
    public interface ITypeVehicleService
    {
        Task<bool> InsertAsync(TypeVehicle typeVehicle);
        Task<TypeVehicle> FindByIdAsync(int typeVehicleId);
        Task<bool> Delete(int typeVehicleId);
        Task<PagedQueryResult<TypeVehicle>> DataTableListAsync(int page = 1, int size = 10);
    }

    public class TypeVehicleService : ITypeVehicleService
    {
        private readonly IUnitOfWork _uow;
        private readonly DbSet<TypeVehicle> _typeVehicles;

        public TypeVehicleService(IUnitOfWork uow, ISecurityService securityService, IHttpContextAccessor contextAccessor)
        {
            _uow = uow;
            _uow.CheckArgumentIsNull(nameof(_uow));

            _typeVehicles = _uow.Set<TypeVehicle>();
        }

        public async Task<PagedQueryResult<TypeVehicle>> DataTableListAsync(int page = 1, int size = 10)
        {
            var query = _typeVehicles.AsNoTracking().AsQueryable();

            var total = await query.CountAsync();

            query = query.ApplyPaging(page, size);

            return new PagedQueryResult<TypeVehicle> { Total = total, Rows = await query.ToListAsync() };
        }

        public async Task<bool> InsertAsync(TypeVehicle typeVehicle)
        {
            try
            {
                await _typeVehicles.AddAsync(typeVehicle);
                return true;
            }
            catch (System.Exception)
            {
                return false;
            }
        }

        public async Task<TypeVehicle> FindByIdAsync(int typeVehicleId)
        {
            return await _typeVehicles.FindAsync(typeVehicleId);
        }

        public async Task<bool> Delete(int typeVehicleId)
        {
            var typeVehicle = await _typeVehicles.FindAsync(typeVehicleId);
            if (typeVehicle == null) return false;
            try
            {
                _typeVehicles.Remove(typeVehicle);
                return true;
            }
            catch (System.Exception)
            {
                return false;
            }
        }
    }
}
