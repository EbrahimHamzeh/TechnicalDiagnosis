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

namespace TechnicalDiagnosis.Services
{
    public interface IPlatesService
    {
        Task<bool> Insert(Plate plate);
        Task<PagedQueryResult<Plate>> DataTableList(int Page = 1, int size = 10);
    }

    public class PlatesService : IPlatesService
    {
        private readonly IUnitOfWork _uow;
        private readonly DbSet<Plate> _plates;

        public PlatesService(
            IUnitOfWork uow,
            ISecurityService securityService,
            IHttpContextAccessor contextAccessor)
        {
            _uow = uow;
            _uow.CheckArgumentIsNull(nameof(_uow));

            _plates = _uow.Set<Plate>();
        }

        public async Task<PagedQueryResult<Plate>> DataTableList(int page = 1, int size = 10)
        {
            var query = _plates.AsNoTracking().AsQueryable();

            var total = await query.CountAsync();

            var data = _plates.ApplyPaging(page, size);

            return new PagedQueryResult<Plate> { Total = total, Rows = await query.ToListAsync() };
        }

        public async Task<bool> Insert(Plate plate)
        {
            try
            {
                await _plates.AddAsync(plate);
                return true;
            }
            catch (System.Exception)
            {
                return false;
            }
        }


    }
}
