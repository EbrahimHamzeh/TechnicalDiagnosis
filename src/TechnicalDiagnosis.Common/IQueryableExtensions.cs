using System;
using System.Linq;

namespace TechnicalDiagnosis.Common
{
    public static class IQueryableExtensions
    {
        public static IQueryable<T> ApplyPaging<T>(
          this IQueryable<T> query, int page, int size)
        {
            if (page <= 0)
            {
                page = 1;
            }

            if (size <= 0)
            {
                size = 10;
            }

            return query.Skip((page - 1) * size).Take(size);
        }
    }
}
