using System;

namespace TechnicalDiagnosis.DomainClasses
{
    public class Message
    {

        public int Id { get; set; }

        public string Mobile { get; set; }

        public string Content { get; set; }

        public DateTime CreateDate { get; set; }

        public DateTime SendDate { get; set; }

        public bool IsActive { get; set; }
        public bool Status { get; set; }

        public TemplateMessage TemplateMessage { get; set; }

        public virtual int? PlateId { get; set; }
        public virtual Plate Plate { get; set; }

        public string Description { get; set; }

    }
}
