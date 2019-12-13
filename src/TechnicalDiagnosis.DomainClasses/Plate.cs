using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using DNTPersianUtils.Core;

namespace TechnicalDiagnosis.DomainClasses
{
    public class Plate
    {

        public int Id { get; set; }

        public string FullName { get; set; }

        public string Mobile { get; set; }

        /// <summary>
        /// ایران 12
        /// </summary>
        /// <value></value>
        public string PlateState { get; set; }

        public string PlateFirstNumber { get; set; }

        public string PlateAlphabet { get; set; }

        public string PlateLastNumber { get; set; }

        public bool IsActive { get; set; }

        public DateTime ServiceDate { get; set; }

        [NotMapped]
        public string ServiceDatePersian
        {
            get
            {
                return ServiceDate.ToShortPersianDateString();
            }  
        }

        public bool IsTechnicalDiagnosis { get; set; }

        public virtual int? TypeVehicleId { get; set; }
        public virtual TypeVehicle TypeVehicle { get; set; }

        public string Description { get; set; }
    }
}
