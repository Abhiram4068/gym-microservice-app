import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/common/useToast';
import { membersApi } from '../../api/members';
import { getInitials } from '../../utils/initials';

const GENDER_OPTIONS = [
  { label: 'Select Gender (Optional)', value: '' },
  { label: 'Male', value: '1' },
  { label: 'Female', value: '2' },
  { label: 'Other', value: '3' },
  { label: 'Prefer not to say', value: '4' }
];

const PHONE_REGEX = /^[0-9+() -]{7,20}$/;

const getInputClasses = (hasError) =>
  `w-full px-3.5 py-2.5 text-sm font-medium text-[#0f172a] bg-white border rounded-lg outline-none transition ${
    hasError
      ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-[#cbd5e1] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]'
  }`;

const FormField = ({ label, required, error, children }) => (
  <div>
    <label className="block text-[11px] font-bold tracking-wider text-[#475569] uppercase mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
  </div>
);

const CreateCustomer = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};

    const firstName = formData.firstName.trim();
    if (!firstName) {
      errs.firstName = 'First name is required.';
    } else if (firstName.length > 100) {
      errs.firstName = 'First name must not exceed 100 characters.';
    }

    const lastName = formData.lastName.trim();
    if (!lastName) {
      errs.lastName = 'Last name is required.';
    } else if (lastName.length > 100) {
      errs.lastName = 'Last name must not exceed 100 characters.';
    }

    const email = formData.email.trim();
    if (!email) {
      errs.email = 'Email address is required.';
    } else if (email.length > 256) {
      errs.email = 'Email must not exceed 256 characters.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    const phone = formData.phoneNumber.trim();
    if (!phone) {
      errs.phoneNumber = 'Phone number is required.';
    } else if (phone.length > 20) {
      errs.phoneNumber = 'Phone number must not exceed 20 characters.';
    } else if (!PHONE_REGEX.test(phone)) {
      errs.phoneNumber = 'Please enter a valid phone number.';
    }

    if (formData.address.trim().length > 500) {
      errs.address = 'Address must not exceed 500 characters.';
    }

    if (formData.emergencyContactName.trim().length > 100) {
      errs.emergencyContactName = 'Emergency contact name must not exceed 100 characters.';
    }

    const emergencyPhone = formData.emergencyContactPhone.trim();
    if (emergencyPhone) {
      if (emergencyPhone.length > 20) {
        errs.emergencyContactPhone = 'Emergency contact phone must not exceed 20 characters.';
      } else if (!PHONE_REGEX.test(emergencyPhone)) {
        errs.emergencyContactPhone = 'Please enter a valid emergency contact phone number.';
      }
    }

    if (formData.emergencyContactRelation.trim().length > 50) {
      errs.emergencyContactRelation = 'Relation must not exceed 50 characters.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please correct the highlighted fields in the form.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender ? Number(formData.gender) : null,
        joiningDate: formData.joiningDate || null,
        address: formData.address.trim() || null,
        emergencyContactName: formData.emergencyContactName.trim() || null,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || null,
        emergencyContactRelation: formData.emergencyContactRelation.trim() || null
      };

      const res = await membersApi.createMember(payload);
      if (!res.success) {
        setIsSubmitting(false);
        const errMsg = res.errors && res.errors.length > 0
          ? res.errors.join(' ')
          : res.message || 'Failed to create member.';
        showToast(errMsg, 'error');
        return;
      }

      const createdMember = res.data;
      const fullName = createdMember?.fullName || `${payload.firstName} ${payload.lastName}`.trim();
      const assignedCode = createdMember?.memberCode || '';

      showToast(
        assignedCode
          ? `Member ${fullName} registered successfully! (Code: ${assignedCode})`
          : `Member ${fullName} registered successfully!`
      );

      setTimeout(() => {
        navigate('/receptionist/dashboard');
      }, 600);
    } catch (err) {
      showToast(err?.message || 'Failed to create customer.', 'error');
      setIsSubmitting(false);
    }
  };

  const initials = getInitials(formData.firstName, formData.lastName);
  const displayName = `${formData.firstName} ${formData.lastName}`.trim();

  return (
    <div className="max-w-[1300px] mx-auto pb-16">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[#2563eb] font-medium mb-3">
        <Link to="/receptionist/dashboard" className="hover:underline text-[#2563eb] no-underline">
          Dashboard
        </Link>
        <span className="text-[#94a3b8]">›</span>
        <span className="text-[#64748b]">Customers</span>
        <span className="text-[#94a3b8]">›</span>
        <span className="text-[#64748b] font-normal">Create customer</span>
      </nav>

      {/* 2. Page Header & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a]">
          Create a new customer
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/receptionist/dashboard')}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#cbd5e1] rounded-lg hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] rounded-lg transition shadow-sm inline-flex items-center gap-2 cursor-pointer border-none"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Create customer</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Initials Avatar Preview */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#eff6ff] border-2 border-[#bfdbfe] text-[#116dff] flex items-center justify-center shadow-xs select-none">
          {initials ? (
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">{initials}</span>
          ) : (
            <svg className="w-9 h-9 text-[#93c5fd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-base font-bold text-[#0f172a] m-0">
            {displayName || 'New Member'}
          </p>
          <p className="text-xs text-[#64748b] mt-0.5 m-0">
            Member code is generated automatically on registration
          </p>
        </div>
      </div>

      {/* 4. Member Information Form */}
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] tracking-tight mb-5">
          Member Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: First Name, Last Name, Email, Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="First Name" required error={errors.firstName}>
              <input
                type="text"
                name="firstName"
                maxLength={100}
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Rahul"
                className={getInputClasses(!!errors.firstName)}
              />
            </FormField>

            <FormField label="Last Name" required error={errors.lastName}>
              <input
                type="text"
                name="lastName"
                maxLength={100}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Sharma"
                className={getInputClasses(!!errors.lastName)}
              />
            </FormField>

            <FormField label="Email" required error={errors.email}>
              <input
                type="email"
                name="email"
                maxLength={256}
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                className={getInputClasses(!!errors.email)}
              />
            </FormField>

            <FormField label="Phone Number" required error={errors.phoneNumber}>
              <input
                type="tel"
                name="phoneNumber"
                maxLength={20}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={getInputClasses(!!errors.phoneNumber)}
              />
            </FormField>
          </div>

          {/* Row 2: Date of Birth, Gender, Joining Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Date of Birth" error={errors.dateOfBirth}>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={getInputClasses(!!errors.dateOfBirth)}
              />
            </FormField>

            <FormField label="Gender" error={errors.gender}>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`${getInputClasses(!!errors.gender)} cursor-pointer`}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Joining Date" required error={errors.joiningDate}>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className={getInputClasses(!!errors.joiningDate)}
              />
            </FormField>
          </div>

          {/* Row 3: Emergency Contact Name, Emergency Contact Phone, Relation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Emergency Contact Name" error={errors.emergencyContactName}>
              <input
                type="text"
                name="emergencyContactName"
                maxLength={100}
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                className={getInputClasses(!!errors.emergencyContactName)}
              />
            </FormField>

            <FormField label="Emergency Contact Phone" error={errors.emergencyContactPhone}>
              <input
                type="tel"
                name="emergencyContactPhone"
                maxLength={20}
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="+91 98765 00000"
                className={getInputClasses(!!errors.emergencyContactPhone)}
              />
            </FormField>

            <FormField label="Emergency Contact Relation" error={errors.emergencyContactRelation}>
              <input
                type="text"
                name="emergencyContactRelation"
                maxLength={50}
                value={formData.emergencyContactRelation}
                onChange={handleChange}
                placeholder="e.g. Spouse, Parent"
                className={getInputClasses(!!errors.emergencyContactRelation)}
              />
            </FormField>
          </div>

          {/* Row 4: Address */}
          <FormField label="Address" error={errors.address}>
            <textarea
              name="address"
              rows={2}
              maxLength={500}
              value={formData.address}
              onChange={handleChange}
              placeholder="Apartment, street, city, postal code..."
              className={`${getInputClasses(!!errors.address)} resize-none`}
            />
          </FormField>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/receptionist/dashboard')}
              className="px-5 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#cbd5e1] rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] rounded-lg transition shadow-sm inline-flex items-center gap-2 cursor-pointer border-none"
            >
              {isSubmitting ? 'Registering...' : 'Create customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomer;
