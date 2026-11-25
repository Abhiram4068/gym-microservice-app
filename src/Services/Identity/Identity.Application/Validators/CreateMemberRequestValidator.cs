using FluentValidation;
using Identity.Application.DTOs.Member;

namespace Identity.Application.Validators;

public class CreateMemberRequestValidator : AbstractValidator<CreateMemberRequestDto>
{
    public CreateMemberRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Please enter a valid email address.")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .MaximumLength(30).WithMessage("Phone number must not exceed 30 characters.")
            .Matches(@"^[0-9+() -]{7,25}$").WithMessage("Please enter a valid phone number.");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Address));

        RuleFor(x => x.EmergencyContactName)
            .MaximumLength(150).WithMessage("Emergency contact name must not exceed 150 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.EmergencyContactName));

        RuleFor(x => x.EmergencyContactPhone)
            .MaximumLength(30).WithMessage("Emergency contact phone must not exceed 30 characters.")
            .Matches(@"^[0-9+() -]{7,25}$").WithMessage("Please enter a valid emergency contact phone number.")
            .When(x => !string.IsNullOrWhiteSpace(x.EmergencyContactPhone));
    }
}
