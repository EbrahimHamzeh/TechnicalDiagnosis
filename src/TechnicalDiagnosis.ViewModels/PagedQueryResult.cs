using System;
using System.Collections.Generic;

namespace TechnicalDiagnosis.ViewModels
{
    public class PagedQueryResult<T>
    {
        public int Total { get; set; }
        public List<T> Rows { get; set; }
    }
}
