using FluentValidation;
using Identity.Application.DTOs.Auth;

namespace Identity.Application.Validators;

public class GymLoginRequestValidator : AbstractValidator<GymLoginRequestDto>
{
    public GymLoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MaximumLength(100).WithMessage("Password must not exceed 100 characters.");
    }
}
