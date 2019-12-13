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
    public interface IPlatesService
    {
        Task<bool> InsertAsync(Plate plate);
        Task<Plate> FindByIdAsync(int plateId);
        Task<bool> Delete(int plateId);
        Task<PagedQueryResult<Plate>> DataTableListAsync(int Page = 1, int size = 10);
        Task<Plate> FindBYPlateAsync(string plateFirstNumber, string plateAlphabet, string plateLastNumber, string plateState);
    }

    public class PlatesService : IPlatesService
    {
        private readonly IUnitOfWork _uow;
        private readonly DbSet<Plate> _plates;

        public PlatesService(IUnitOfWork uow, ISecurityService securityService, IHttpContextAccessor contextAccessor)
        {
            _uow = uow;
            _uow.CheckArgumentIsNull(nameof(_uow));

            _plates = _uow.Set<Plate>();
        }

        public async Task<PagedQueryResult<Plate>> DataTableListAsync(int page = 1, int size = 10)
        {
            var query = _plates.AsNoTracking().AsQueryable();

            var total = await query.CountAsync();

            var data = _plates.ApplyPaging(page, size);

            return new PagedQueryResult<Plate> { Total = total, Rows = await query.ToListAsync() };
        }

        public async Task<Plate> FindBYPlateAsync(string plateFirstNumber, string plateAlphabet, string plateLastNumber, string plateState)
        {
            return await _plates.Where(x => x.PlateFirstNumber == plateFirstNumber &&
              x.PlateAlphabet == plateAlphabet &&
              x.PlateLastNumber == plateLastNumber &&
              x.PlateState == plateState).FirstOrDefaultAsync();
        }

        public async Task<bool> InsertAsync(Plate plate)
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

        public async Task<Plate> FindByIdAsync(int plateId)
        {
            return await _plates.FindAsync(plateId);
        }

        public async Task<bool> Delete(int plateId)
        {
            var plate = await _plates.FindAsync(plateId);
            if (plate == null) return false;
            try
            {
                _plates.Remove(plate);
                return true;
            }
            catch (System.Exception)
            {
                return false;
            }
        }
    }
}
