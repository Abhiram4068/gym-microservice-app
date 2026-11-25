import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/common/useToast';
import { authApi } from '../../api/auth';

const GymOwnerRegister = () => {
  const { showToast } = useToast();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1: Gym Verification / Registration Code
    gymRegistrationNumber: '',
    gymName: '',
    gymEmail: '',
    gymPhoneNumber: '',

    // Step 2: Gym Address Details (Single Address as requested)
    registeredAddress: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
    websiteUrl: '',

    // Step 3: Gym Owner Account Credentials
    firstName: '',
    lastName: '',
    ownerEmail: '',
    ownerPhoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextFromStep1 = (e) => {
    e.preventDefault();
    if (!formData.gymName.trim()) {
      setError('Please provide your Gym Business Name.');
      return;
    }
    if (!formData.gymEmail.trim()) {
      setError('Please provide your Gym Official Email.');
      return;
    }
    if (!formData.gymPhoneNumber.trim()) {
      setError('Please provide your Gym Phone Number.');
      return;
    }
    setError('');
    setFieldErrors([]);
    setStep(2);
  };

  const handleNextFromStep2 = (e) => {
    e.preventDefault();
    if (!formData.registeredAddress.trim()) {
      setError('Please enter your Gym Registered Address.');
      return;
    }
    if (!formData.pinCode.trim()) {
      setError('Please enter the Pincode / Postal Code.');
      return;
    }
    if (!formData.city.trim()) {
      setError('Please enter the City.');
      return;
    }
    setError('');
    setFieldErrors([]);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter Gym Owner first and last name.');
      return;
    }
    if (!formData.ownerEmail.trim()) {
      setError('Please enter Gym Owner login email.');
      return;
    }
    if (!formData.password) {
      setError('Please create a password for your account.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('Please agree to the platform Terms & Conditions.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Direct request payload for POST /api/user/gym-register
      const payload = {
        gymName: formData.gymName.trim(),
        gymRegistrationNumber: formData.gymRegistrationNumber?.trim() || null,
        gymEmail: formData.gymEmail.trim(),
        gymPhoneNumber: formData.gymPhoneNumber.trim(),
        addressLine1: formData.registeredAddress.trim(),
        addressLine2: null,
        city: formData.city.trim(),
        state: formData.state?.trim() || 'Default State',
        country: formData.country || 'India',
        pinCode: formData.pinCode.trim(),
        websiteUrl: formData.websiteUrl?.trim() || null,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerPhoneNumber: formData.ownerPhoneNumber?.trim() || formData.gymPhoneNumber.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      const result = await authApi.registerGym(payload);

      if (result.success) {
        setSuccess(true);
        showToast('Gym registration submitted! SuperAdmin approval is pending.');
      } else {
        setError(result.message || 'Failed to submit registration.');
        if (result.errors && result.errors.length > 0) {
          setFieldErrors(result.errors);
        }
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#eaf2fd] via-[#f3f7fd] to-[#ffffff] flex items-center justify-center p-4">
        <div className="w-full max-w-[560px] bg-white border border-[#dce4f0] rounded-2xl p-8 sm:p-10 shadow-lg text-center space-y-5">
          <div className="w-16 h-16 bg-[#ecfdf3] text-[#12b76a] rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-[#a6f4c5]">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a]">Registration Submitted</h2>
          <p className="text-[13.5px] text-[#475467] leading-relaxed">
            Your gym <strong className="text-[#0f172a] font-semibold">{formData.gymName}</strong> and owner profile have been created in <span className="text-[#b54708] bg-[#fffaeb] px-2 py-0.5 rounded font-semibold border border-[#fedf89]">Pending</span> status.
          </p>

          <div className="bg-[#f8fafc] border border-[#eaecf0] rounded-xl p-5 text-left text-xs space-y-2.5 text-[#475467]">
            <div className="flex justify-between py-1 border-b border-[#eaecf0]">
              <span className="font-medium text-[#667085]">Gym Name:</span>
              <span className="font-semibold text-[#0f172a]">{formData.gymName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#eaecf0]">
              <span className="font-medium text-[#667085]">Gym Contact:</span>
              <span className="text-[#0f172a]">{formData.gymEmail} | {formData.gymPhoneNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#eaecf0]">
              <span className="font-medium text-[#667085]">Registered Address:</span>
              <span className="text-[#0f172a]">{formData.registeredAddress}, {formData.city} - {formData.pinCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#eaecf0]">
              <span className="font-medium text-[#667085]">Owner Account:</span>
              <span className="font-semibold text-[#0f172a]">{formData.firstName} {formData.lastName} ({formData.ownerEmail})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-[#667085]">Account Access:</span>
              <span className="text-[#b54708] font-semibold">Inactive (Awaiting SuperAdmin approval)</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block bg-[#0b1727] hover:bg-[#16273e] text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf2fd] via-[#f3f7fd] to-[#ffffff] flex flex-col items-center justify-center p-4 sm:p-8 font-sans antialiased text-[#101828]">
      {/* Top Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#0f172a]">
          Gym Registration
        </h1>
        <p className="text-[13px] text-[#64748b] mt-1">
          Already registered?{' '}
          <Link to="/login" className="text-[#116dff] hover:underline font-medium">
            Sign in to gym portal
          </Link>
        </p>
      </div>

      {/* Interactive Breadcrumb Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-7 text-xs sm:text-[13px] font-medium text-[#64748b]">
        {/* Step 1 Button */}
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
        >
          {step > 1 ? (
            <div className="w-5 h-5 rounded-full bg-[#12b76a] text-white flex items-center justify-center text-[11px] font-bold">
              ✓
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#0b1727] text-white flex items-center justify-center text-[11px] font-bold">
              1
            </div>
          )}
          <span className={step === 1 ? 'font-bold text-[#0f172a]' : step > 1 ? 'text-[#0f172a] font-medium hover:underline' : ''}>
            Gym Information
          </span>
        </button>

        <div className={`w-8 sm:w-12 h-[2px] transition-colors ${step >= 2 ? 'bg-[#12b76a]' : 'bg-[#cbd5e1]'}`}></div>

        {/* Step 2 Button */}
        <button
          type="button"
          onClick={() => {
            if (formData.gymName && formData.gymEmail) setStep(2);
          }}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
        >
          {step > 2 ? (
            <div className="w-5 h-5 rounded-full bg-[#12b76a] text-white flex items-center justify-center text-[11px] font-bold">
              ✓
            </div>
          ) : step === 2 ? (
            <div className="w-5 h-5 rounded-full bg-[#0b1727] text-white flex items-center justify-center text-[11px] font-bold">
              2
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#e2e8f0] text-[#64748b] flex items-center justify-center text-[11px] font-bold">
              2
            </div>
          )}
          <span className={step === 2 ? 'font-bold text-[#0f172a]' : step > 2 ? 'text-[#0f172a] font-medium hover:underline' : ''}>
            Gym Address
          </span>
        </button>

        <div className={`w-8 sm:w-12 h-[2px] transition-colors ${step >= 3 ? 'bg-[#12b76a]' : 'bg-[#cbd5e1]'}`}></div>

        {/* Step 3 Button */}
        <button
          type="button"
          onClick={() => {
            if (formData.gymName && formData.gymEmail && formData.registeredAddress) setStep(3);
          }}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 3 ? 'bg-[#0b1727] text-white' : 'bg-[#e2e8f0] text-[#64748b]'}`}>
            {step === 3 ? '3' : '🔒'}
          </div>
          <span className={step === 3 ? 'font-bold text-[#0f172a]' : ''}>
            Owner Credentials
          </span>
        </button>
      </div>

      {/* Main Two-Column Card Grid */}
      <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Multi-Step Interactive Form */}
        <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <div className="font-semibold">{error}</div>
              {fieldErrors.length > 0 && (
                <ul className="mt-1.5 list-disc list-inside space-y-0.5">
                  {fieldErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* STEP 1: Gym Information */}
          {step === 1 && (
            <form onSubmit={handleNextFromStep1} className="space-y-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#0f172a]">Gym Business Information</h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Enter your gym facility details to begin your onboarding.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Gym Name *
                </label>
                <input
                  type="text"
                  name="gymName"
                  value={formData.gymName}
                  onChange={handleChange}
                  placeholder="e.g. Iron Fitness Hub"
                  required
                  className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Gym Business Registration Number / License Code
                </label>
                <input
                  type="text"
                  name="gymRegistrationNumber"
                  value={formData.gymRegistrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. GYM-IND-2024-8891 (optional)"
                  className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Gym Official Email *
                  </label>
                  <input
                    type="email"
                    name="gymEmail"
                    value={formData.gymEmail}
                    onChange={handleChange}
                    placeholder="contact@ironfitness.com"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Gym Phone Number *
                  </label>
                  <input
                    type="text"
                    name="gymPhoneNumber"
                    value={formData.gymPhoneNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Website URL
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://ironfitness.com (optional)"
                  className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#0b1727] hover:bg-[#16273e] text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Next: Gym Address</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Gym Address (Single Address requirement) */}
          {step === 2 && (
            <form onSubmit={handleNextFromStep2} className="space-y-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#0f172a]">Gym Address Details</h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Complete the single physical address where your gym facility is situated.
                </p>
              </div>

              {/* Verified Gym Info Summary */}
              <div className="bg-[#f8fafc] border border-[#eaecf0] rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#64748b]">Selected Gym: </span>
                  <strong className="text-[#0f172a]">{formData.gymName || 'Gym Name'}</strong>
                  {formData.gymRegistrationNumber && (
                    <span className="text-[#64748b] ml-1.5">({formData.gymRegistrationNumber})</span>
                  )}
                </div>
                <span className="text-[#12b76a] font-semibold flex items-center gap-1">
                  ✓ Verified
                </span>
              </div>

              {/* Single Registered Address */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Registered Address *
                </label>
                <input
                  type="text"
                  name="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={handleChange}
                  placeholder="Building No., Street, Floor, Landmark"
                  required
                  className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15 placeholder:text-[#94a3b8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="India"
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Pincode / Postal Code *
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="e.g. 400001"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15"
                  />
                </div>
              </div>

              {/* Navigation row */}
              <div className="pt-3 flex items-center justify-between border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#64748b] hover:text-[#0f172a] cursor-pointer bg-transparent border-none font-medium flex items-center gap-1"
                >
                  ← Back to Gym Info
                </button>

                <button
                  type="submit"
                  className="bg-[#0b1727] hover:bg-[#16273e] text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Next: Owner Credentials</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Gym Owner Account Details */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#0f172a]">Gym Owner Credentials</h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Set up the master administrator account for your gym workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Owner First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none focus:border-[#116dff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Owner Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Sharma"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none focus:border-[#116dff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Owner Login Email *
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  placeholder="e.g. rahul@ironfitness.com"
                  required
                  className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none focus:border-[#116dff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Owner Personal Phone Number
                </label>
                <input
                  type="text"
                  name="ownerPhoneNumber"
                  value={formData.ownerPhoneNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210 (or same as gym phone)"
                  className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none focus:border-[#116dff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none focus:border-[#116dff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none focus:border-[#116dff]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-[#64748b] cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded accent-[#116dff] cursor-pointer"
                  />
                  <span>I agree to the Gym Platform Terms & Conditions and Privacy Policy.</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-[#64748b] hover:text-[#0f172a] cursor-pointer bg-transparent border-none font-medium flex items-center gap-1"
                >
                  ← Back to Address
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0b1727] hover:bg-[#16273e] text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  {isSubmitting ? 'Registering Gym...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Card: Informational Panels */}
        <div className="lg:col-span-5 space-y-5">
          {/* Gym Registration Guidelines */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[14px] font-bold text-[#0f172a] mb-3">
              Registration Notes
            </h3>
            <ul className="space-y-3 text-xs text-[#64748b] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#94a3b8] mt-1">•</span>
                <span>Enter genuine gym details to ensure fast verification by the SuperAdmin team.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#94a3b8] mt-1">•</span>
                <span>The single registered gym address provided will be listed in member bookings and invoicing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#94a3b8] mt-1">•</span>
                <span>The Gym Owner account will be in <strong>Inactive</strong> status initially and activated automatically upon SuperAdmin approval.</span>
              </li>
            </ul>
          </div>

          {/* Multi-Tenant Gym Architecture */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[14px] font-bold text-[#0f172a] mb-2">
              Multi-Tenant Gym Isolation
            </h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Each gym operates with dedicated data isolation. Once approved, you can add Receptionists, Trainers, and manage Members under your unique Gym ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymOwnerRegister;
