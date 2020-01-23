using System;

namespace TechnicalDiagnosis.DomainClasses
{
    public class TemplateMessage
    {

        public int Id { get; set; }

        public DateTime CreateDate { get; set; }

        public TemplateType Type { get; set; }

        public string Content { get; set; }

        public bool IsActive { get; set; }

        public string Description { get; set; }
    }

    public enum TemplateType
    {
       Welcome,
       Reminder,
       Successful,
    }
}
