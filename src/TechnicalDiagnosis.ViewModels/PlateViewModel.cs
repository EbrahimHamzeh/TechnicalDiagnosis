using System.ComponentModel.DataAnnotations;

namespace TechnicalDiagnosis.ViewModels
{
    public class PlateViewModel
    {  
        public int Id { get; set; }

        [Required(ErrorMessage = "نام و نام‌خانوادگی الزامی می‌باشد.")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "شماره موبایل الزامی ‌می‌باشد.")]
        [MaxLength(11, ErrorMessage= "شماره موبایل باید 12 رقمی وارد شود.")]
        [MinLength(11, ErrorMessage= "شماره موبایل باید 12 رقمی وارد شود.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "شما فقط می‌توانید عدد وارد نمایید.")]
        public string Mobile { get; set; }

        [Required(ErrorMessage = "شماره پلاک نامعتبر است.")]
        [MaxLength(2, ErrorMessage= "شماره پلاک نامعتبر است.")]
        [MinLength(2, ErrorMessage= "شماره پلاک نامعتبر است.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "شماره پلاک نامعتبر است.")]
        public string PlateState { get; set; }

        [Required(ErrorMessage = "شماره پلاک نامعتبر است.")]
        [MaxLength(3, ErrorMessage= "شماره پلاک نامعتبر است.")]
        [MinLength(3, ErrorMessage= "شماره پلاک نامعتبر است.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "شماره پلاک نامعتبر است.")]
        public string PlateFirstNumber { get; set; }

        [Required(ErrorMessage = "شماره پلاک نامعتبر است.")]
        public string PlateAlphabet { get; set; }

        [Required(ErrorMessage = "شماره پلاک نامعتبر است.")]
        [MaxLength(2, ErrorMessage= "شماره پلاک نامعتبر است.")]
        [MinLength(2, ErrorMessage= "شماره پلاک نامعتبر است.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "شماره پلاک نامعتبر است.")]
        public string PlateLastNumber { get; set; }

        [Required(ErrorMessage = "تاریخ مراجعه نامعتبر می‌باشد.")]
        public string ServiceDate { get; set; }

        public bool IsTechnicalDiagnosis { get; set; }

        public string Description { get; set; }
    }
}
