using FluentValidation;
using Identity.Application.DTOs.Request;

namespace Identity.Application.Validators;

public class GymRegisterRequestValidator : AbstractValidator<GymRegisterRequestDto>
{
    public GymRegisterRequestValidator()
    {
        // Gym Information Validations
        RuleFor(x => x.GymName)
            .NotEmpty().WithMessage("Gym name is required.")
            .MaximumLength(200).WithMessage("Gym name must not exceed 200 characters.");

        RuleFor(x => x.GymEmail)
            .NotEmpty().WithMessage("Gym official email is required.")
            .EmailAddress().WithMessage("A valid gym official email is required.")
            .MaximumLength(255).WithMessage("Gym email must not exceed 255 characters.");

        RuleFor(x => x.GymPhoneNumber)
            .NotEmpty().WithMessage("Gym phone number is required.")
            .MaximumLength(30).WithMessage("Gym phone number must not exceed 30 characters.");

        RuleFor(x => x.AddressLine1)
            .NotEmpty().WithMessage("Registered address is required.")
            .MaximumLength(300).WithMessage("Address must not exceed 300 characters.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100).WithMessage("City must not exceed 100 characters.");

        RuleFor(x => x.PinCode)
            .NotEmpty().WithMessage("Pincode / Postal code is required.")
            .MaximumLength(20).WithMessage("Pincode must not exceed 20 characters.");

        // Owner Information Validations
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Owner first name is required.")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Owner last name is required.")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

        RuleFor(x => x.OwnerEmail)
            .NotEmpty().WithMessage("Owner login email is required.")
            .EmailAddress().WithMessage("A valid owner login email is required.")
            .MaximumLength(255).WithMessage("Owner email must not exceed 255 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Confirm password is required.")
            .Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}
