using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TechnicalDiagnosis.Common
{
    public static class ErrorExtensions
    {
        public static string AllMessage(this ModelStateDictionary modelStat)
        {
            return string.Join("</br>", modelStat.Values.SelectMany(v => v.Errors).Select(x => x.ErrorMessage));
        }
    }
}
