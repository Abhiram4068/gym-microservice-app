import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';
import { userApi } from '../../api/user';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
];

const GENDER_OPTIONS = [
  { label: 'Select Gender (Optional)', value: '' },
  { label: 'Male', value: '1' },
  { label: 'Female', value: '2' },
  { label: 'Other', value: '3' },
  { label: 'Prefer not to say', value: '4' }
];

const BLOOD_GROUP_OPTIONS = [
  { label: 'Select Blood Group (Optional)', value: '' },
  { label: 'A+ (A Positive)', value: '1' },
  { label: 'A- (A Negative)', value: '2' },
  { label: 'B+ (B Positive)', value: '3' },
  { label: 'B- (B Negative)', value: '4' },
  { label: 'AB+ (AB Positive)', value: '5' },
  { label: 'AB- (AB Negative)', value: '6' },
  { label: 'O+ (O Positive)', value: '7' },
  { label: 'O- (O Negative)', value: '8' }
];

const PHONE_REGEX = /^[0-9+() -]{7,25}$/;

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
  const [avatarIndex, setAvatarIndex] = useState(1);
  const [customAvatar, setCustomAvatar] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarCycle = () => {
    setCustomAvatar(null);
    setAvatarIndex((prev) => (prev + 1) % DEFAULT_AVATARS.length);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result);
      };
      reader.readAsDataURL(file);
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
    } else if (email.length > 255) {
      errs.email = 'Email must not exceed 255 characters.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    const phone = formData.phoneNumber.trim();
    if (!phone) {
      errs.phoneNumber = 'Phone number is required.';
    } else if (phone.length > 30) {
      errs.phoneNumber = 'Phone number must not exceed 30 characters.';
    } else if (!PHONE_REGEX.test(phone)) {
      errs.phoneNumber = 'Please enter a valid phone number.';
    }

    if (formData.address.trim().length > 500) {
      errs.address = 'Address must not exceed 500 characters.';
    }

    if (formData.emergencyContactName.trim().length > 150) {
      errs.emergencyContactName = 'Emergency contact name must not exceed 150 characters.';
    }

    const emergencyPhone = formData.emergencyContactPhone.trim();
    if (emergencyPhone) {
      if (emergencyPhone.length > 30) {
        errs.emergencyContactPhone = 'Emergency contact phone must not exceed 30 characters.';
      } else if (!PHONE_REGEX.test(emergencyPhone)) {
        errs.emergencyContactPhone = 'Please enter a valid emergency contact phone number.';
      }
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
        bloodGroup: formData.bloodGroup ? Number(formData.bloodGroup) : null,
        address: formData.address.trim() || null,
        emergencyContactName: formData.emergencyContactName.trim() || null,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || null
      };

      const res = await userApi.createMember(payload);
      if (!res.success) {
        setIsSubmitting(false);
        const errMsg = res.errors && res.errors.length > 0
          ? res.errors.join(' ')
          : res.message || 'Failed to create member.';
        showToast(errMsg, 'error');
        return;
      }

      const createdMember = res.data;
      const assignedCode = createdMember?.memberCode || 'MEM-SAVED';

      const newCustomer = {
        id: createdMember?.id || 'cust-' + Date.now(),
        memberCode: assignedCode,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: `${payload.firstName} ${payload.lastName}`.trim(),
        phone: payload.phoneNumber,
        avatarUrl: customAvatar || DEFAULT_AVATARS[avatarIndex],
        status: 'Active',
        createdAt: createdMember?.createdAt || new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('gym_customers') || '[]');
      existing.unshift(newCustomer);
      localStorage.setItem('gym_customers', JSON.stringify(existing));

      showToast(`Member ${newCustomer.fullName} registered successfully! (Code: ${assignedCode})`);
      setTimeout(() => {
        navigate('/receptionist/dashboard');
      }, 600);
    } catch (err) {
      showToast(err?.message || 'Failed to create customer.', 'error');
      setIsSubmitting(false);
    }
  };

  const activeAvatar = customAvatar || DEFAULT_AVATARS[avatarIndex];

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

      {/* 3. Circular Avatar Preview */}
      {/* <div className="mb-8">
        <div className="relative inline-block group">
          <img
            src={activeAvatar}
            alt="Customer Avatar"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <label className="cursor-pointer p-1.5 rounded-full bg-white/90 text-[#0f172a] hover:bg-white text-xs shadow-xs" title="Upload custom photo">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleAvatarCycle}
              className="p-1.5 rounded-full bg-white/90 text-[#0f172a] hover:bg-white text-xs shadow-xs border-none cursor-pointer"
              title="Next preset avatar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div> */}

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
                maxLength={255}
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
                maxLength={30}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={getInputClasses(!!errors.phoneNumber)}
              />
            </FormField>
          </div>

          {/* Row 2: Date of Birth, Gender, Blood Group */}
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

            <FormField label="Blood Group" error={errors.bloodGroup}>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className={`${getInputClasses(!!errors.bloodGroup)} cursor-pointer`}
              >
                {BLOOD_GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Row 3: Emergency Contact Name, Emergency Contact Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Emergency Contact Name" error={errors.emergencyContactName}>
              <input
                type="text"
                name="emergencyContactName"
                maxLength={150}
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma (Spouse)"
                className={getInputClasses(!!errors.emergencyContactName)}
              />
            </FormField>

            <FormField label="Emergency Contact Phone" error={errors.emergencyContactPhone}>
              <input
                type="tel"
                name="emergencyContactPhone"
                maxLength={30}
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="+91 98765 00000"
                className={getInputClasses(!!errors.emergencyContactPhone)}
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
        </form>
      </div>
    </div>
  );
};

export default CreateCustomer;
