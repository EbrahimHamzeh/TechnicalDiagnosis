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
        public PlateController(
            IPlatesService platesService,
            IUnitOfWork uow)
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
                var result = await _plateService.Insert(new Plate
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
        public async Task<IActionResult> List([FromQuery] int page,[FromQuery] int size)
        {
            var result = await _plateService.DataTableList(page, size);
            return Json(result);
        }

        // [AllowAnonymous]
        // [IgnoreAntiforgeryToken]
        // [HttpPost("[action]")]
        // public async Task<IActionResult> Login([FromBody]  User loginUser)
        // {
        //     if (loginUser == null)
        //     {
        //         return BadRequest("user is not set.");
        //     }

        //     var user = await _usersService.FindUserAsync(loginUser.Username, loginUser.Password);
        //     if (user == null || !user.IsActive)
        //     {
        //         return Unauthorized();
        //     }

        //     var result = await _tokenFactoryService.CreateJwtTokensAsync(user);
        //     await _tokenStoreService.AddUserTokenAsync(user, result.RefreshTokenSerial, result.AccessToken, null);
        //     await _uow.SaveChangesAsync();

        //     _antiforgery.RegenerateAntiForgeryCookies(result.Claims);

        //     return Ok(new { access_token = result.AccessToken, refresh_token = result.RefreshToken, display_name = user.DisplayName  });
        // }

        // [AllowAnonymous]
        // [HttpPost("[action]")]
        // public async Task<IActionResult> RefreshToken([FromBody]JToken jsonBody)
        // {
        //     var refreshTokenValue = jsonBody.Value<string>("refreshToken");
        //     if (string.IsNullOrWhiteSpace(refreshTokenValue))
        //     {
        //         return BadRequest("refreshToken is not set.");
        //     }

        //     var token = await _tokenStoreService.FindTokenAsync(refreshTokenValue);
        //     if (token == null)
        //     {
        //         return Unauthorized();
        //     }

        //     var result = await _tokenFactoryService.CreateJwtTokensAsync(token.User);
        //     await _tokenStoreService.AddUserTokenAsync(token.User, result.RefreshTokenSerial, result.AccessToken, _tokenFactoryService.GetRefreshTokenSerial(refreshTokenValue));
        //     await _uow.SaveChangesAsync();

        //     _antiforgery.RegenerateAntiForgeryCookies(result.Claims);

        //     return Ok(new { access_token = result.AccessToken, refresh_token = result.RefreshToken });
        // }

        // [AllowAnonymous]
        // [HttpGet("[action]")]
        // public async Task<bool> Logout(string refreshToken)
        // {
        //     var claimsIdentity = this.User.Identity as ClaimsIdentity;
        //     var userIdValue = claimsIdentity.FindFirst(ClaimTypes.UserData)?.Value;

        //     // The Jwt implementation does not support "revoke OAuth token" (logout) by design.
        //     // Delete the user's tokens from the database (revoke its bearer token)
        //     await _tokenStoreService.RevokeUserBearerTokensAsync(userIdValue, refreshToken);
        //     await _uow.SaveChangesAsync();

        //     _antiforgery.DeleteAntiForgeryCookies();

        //     return true;
        // }

        // [HttpGet("[action]"), HttpPost("[action]")]
        // public bool IsAuthenticated()
        // {
        //     return User.Identity.IsAuthenticated;
        // }

        // [HttpGet("[action]"), HttpPost("[action]")]
        // public IActionResult GetUserInfo()
        // {
        //     var claimsIdentity = User.Identity as ClaimsIdentity;
        //     return Json(new { Username = claimsIdentity.Name });
        // }
    }
}
