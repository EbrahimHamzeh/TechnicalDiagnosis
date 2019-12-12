using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using DNTPersianUtils.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using TechnicalDiagnosis.Common;
using TechnicalDiagnosis.DataLayer.Context;
using TechnicalDiagnosis.DomainClasses;
using TechnicalDiagnosis.Services;
using TechnicalDiagnosis.ViewModels;

namespace TechnicalDiagnosis.WebApp.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize(Policy = CustomRoles.Admin)]
    public class PlateController : Controller
    {
        private readonly IUnitOfWork _uow;
        private readonly IPlatesService _plateService;

        public PlateController(IPlatesService platesService, IUnitOfWork uow)
        {

            _uow = uow;
            _uow.CheckArgumentIsNull(nameof(_uow));

            _plateService = platesService;
            _plateService.CheckArgumentIsNull(nameof(platesService));
        }

        [IgnoreAntiforgeryToken]
        [HttpPost("[action]")]
        public async Task<IActionResult> Add([FromBody] PlateViewModel model)
        {
            if (ModelState.IsValid)
            {
                var result = await _plateService.InsertAsync(new Plate
                {
                    FullName = model.FullName,
                    Mobile = model.Mobile,
                    PlateAlphabet = model.PlateAlphabet,
                    PlateFirstNumber = model.PlateFirstNumber,
                    PlateLastNumber = model.PlateLastNumber,
                    Description = model.Description,
                    IsTechnicalDiagnosis = model.IsTechnicalDiagnosis,
                    IsActive = true,
                    PlateState = model.PlateState,
                    ServiceDate = model.ServiceDate.ToGregorianDateTime() ?? DateTime.Now,
                });

                if (result)
                {
                    await _uow.SaveChangesAsync();
                    return Ok();
                }
                else return Ok(new { error = "متاسفانه مشکلی در ثبت اطلاعات به وجود آمده است." });
            }

            return Ok(new { error = ModelState.AllMessage() });
        }

        [IgnoreAntiforgeryToken]
        [HttpPost("[action]")]
        public async Task<IActionResult> List([FromQuery] int page, [FromQuery] int size)
        {
            var result = await _plateService.DataTableListAsync(page, size);
            return Json(result);
        }

        [IgnoreAntiforgeryToken]
        [HttpPost("[action]")]
        public async Task<IActionResult> search([FromQuery] string plateFirstNumber, [FromQuery] string plateAlphabet, [FromQuery] string plateLastNumber, [FromQuery] string plateState)
        {
            return Ok(await _plateService.FindBYPlateAsync(plateFirstNumber, plateAlphabet, plateLastNumber, plateState));
        }

        public async Task<IActionResult> update([FromBody] PlateViewModel model)
        {
            var plate = await _plateService.FindByIdAsync(model.Id);
            if (plate == null) return Ok(new { error = "پلاکی یافت نشد." });

            plate.Description = model.Description;
            plate.FullName = model.FullName;
            // plate.IsActive = model.IsActive;
            plate.IsTechnicalDiagnosis = model.IsTechnicalDiagnosis;
            plate.Mobile = model.Mobile;
            plate.PlateAlphabet = model.PlateAlphabet;
            plate.PlateFirstNumber = model.PlateFirstNumber;
            plate.PlateLastNumber = model.PlateLastNumber;
            plate.PlateState = model.PlateState;
            plate.ServiceDate = model.ServiceDate.ToGregorianDateTime() ?? DateTime.Now;

            await _uow.SaveChangesAsync();

            return Ok();
        }
    }
}
