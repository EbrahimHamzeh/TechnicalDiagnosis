using System.ComponentModel.DataAnnotations;

namespace TechnicalDiagnosis.ViewModels
{
    public class UserViewModel
    {  
        public int Id { get; set; }

        [Required(ErrorMessage = "نام‌کاربری الزامی می‌باشد.")]
        public string Username { get; set; }

        [Required(ErrorMessage = "نام نمایشی الزامی می‌باشد.")]
        public string DisplayName { get; set; }

        [Required(ErrorMessage = "رمزعبور الزامی می‌باشد.")]
        public string Password { get; set; }
        public bool IsActive { get; set; }
    }
}
