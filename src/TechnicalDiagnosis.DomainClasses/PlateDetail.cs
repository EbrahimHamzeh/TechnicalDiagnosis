using System;

namespace TechnicalDiagnosis.DomainClasses
{
    public class PlateDetail
    {

        public int Id { get; set; }

        public DateTime Date { get; set; }

        public bool IsTechnicalDiagnosis { get; set; }

        public string Description { get; set; }

        public virtual int? PlateId { get; set; }
        public virtual Plate Plate { get; set; }

        public virtual int? MessageId { get; set; }
        public virtual Message Message { get; set; }

    }
}
