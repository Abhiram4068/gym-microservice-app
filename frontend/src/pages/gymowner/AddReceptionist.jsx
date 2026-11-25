import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/common/useToast';
import { userApi } from '../../api/user';

const AddReceptionist = () => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    shift: 'general',
    notes: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [createdReceptionist, setCreatedReceptionist] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please provide first and last name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please provide an official email address.');
      return;
    }
    if (!formData.password) {
      setError('Please create a temporary password.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      const result = await userApi.createReceptionist(payload);

      if (result.success) {
        setCreatedReceptionist({
          ...result.data,
          plainPassword: formData.password
        });
        showToast('Receptionist account created successfully!');
      } else {
        setError(result.message || 'Failed to create receptionist.');
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

  const handleCopyCredentials = () => {
    if (!createdReceptionist) return;
    const text = `Gym Portal Receptionist Login:\nEmail: ${createdReceptionist.email}\nTemporary Password: ${createdReceptionist.plainPassword}`;
    navigator.clipboard.writeText(text);
    showToast('Credentials copied to clipboard!');
  };

  const handleResetForm = () => {
    setCreatedReceptionist(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      shift: 'general',
      notes: ''
    });
    setError('');
    setFieldErrors([]);
  };

  if (createdReceptionist) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 bg-[#ecfdf3] text-[#12b76a] rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-[#a6f4c5]">
            ✓
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#0f172a]">Receptionist Account Created</h2>
            <p className="text-[13.5px] text-[#475467]">
              The receptionist can now log into the gym portal with the credentials below.
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-[#eaecf0] rounded-xl p-5 text-left text-xs space-y-2.5 text-[#475467]">
            <div className="flex justify-between py-1 border-b border-[#eaecf0]">
              <span className="font-medium text-[#667085]">Full Name:</span>
              <span className="font-semibold text-[#0f172a]">{createdReceptionist.firstName} {createdReceptionist.lastName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#eaecf0]">
              <span className="font-medium text-[#667085]">Login Email:</span>
              <span className="font-mono font-semibold text-[#0f172a]">{createdReceptionist.email}</span>
            </div>
            {createdReceptionist.phoneNumber && (
              <div className="flex justify-between py-1 border-b border-[#eaecf0]">
                <span className="font-medium text-[#667085]">Phone:</span>
                <span className="text-[#0f172a]">{createdReceptionist.phoneNumber}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-[#eaecf0]">
              <span className="font-medium text-[#667085]">Initial Password:</span>
              <span className="font-mono font-semibold text-[#2563eb]">{createdReceptionist.plainPassword}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-[#667085]">Account Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#12b76a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12b76a]"></span>
                Active
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0b1727] hover:bg-[#16273e] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Credentials</span>
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#0f172a] text-[13px] font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              <span>Add Another Receptionist</span>
            </button>
            <Link
              to="/owner/receptionists"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition"
            >
              <span>View All Receptionists</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-10">
      {/* Top Breadcrumb & Page Title (Faithful to inspiration) */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#2563eb] mb-2">
          <Link to="/owner/dashboard" className="hover:underline">
            Staff
          </Link>
          <span className="text-[#94a3b8]">›</span>
          <Link to="/owner/receptionists" className="hover:underline">
            Receptionists
          </Link>
          <span className="text-[#94a3b8]">›</span>
          <span className="text-[#64748b]">Default</span>
        </div>
        <h1 className="text-3xl sm:text-[34px] font-bold tracking-tight text-[#0f172a]">
          Create a receptionist
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
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

      {/* Main Flat-Canvas Open Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Email (8 cols) + Role Dropdown (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
            <label htmlFor="email" className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
              OFFICIAL EMAIL (LOGIN USERNAME) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="receptionist@yourgym.com"
              required
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 p-0 text-[14px] font-mono text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
            />
          </div>

          <div className="lg:col-span-4 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-center">
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
              STAFF ROLE
            </span>
            <div className="flex items-center justify-between text-[14px] font-medium text-[#0f172a] h-[22px]">
              <span>Front Desk Receptionist</span>
              
            </div>
          </div>
        </div>

        {/* Row 2: First Name, Last Name, Phone Number (3 equal columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
            <label htmlFor="firstName" className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
              FIRST NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Rahul"
              required
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 p-0 text-[14px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
            />
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
            <label htmlFor="lastName" className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
              LAST NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Sharma"
              required
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 p-0 text-[14px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
            />
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
            <label htmlFor="phoneNumber" className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
              PHONE NUMBER
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+91 9876543210"
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 p-0 text-[14px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
            />
          </div>
        </div>

        {/* Row 3: Temporary Password & Confirm Password (2 balanced columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                TEMPORARY PASSWORD <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-semibold text-[#2563eb] hover:underline cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 p-0 text-[14px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
            />
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="confirmPassword" className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                CONFIRM PASSWORD <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-semibold text-[#2563eb] hover:underline cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 p-0 text-[14px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
            />
          </div>
        </div>

        {/* Bottom Actions Bar (Exact alignment and proportion to inspiration screenshot) */}
        <div className="pt-6 mt-4 flex items-center justify-end gap-4">
          <Link
            to="/owner/receptionists"
            className="h-12 px-7 min-w-[100px] inline-flex items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[#475467] hover:bg-slate-50 hover:text-[#0f172a] hover:border-[#cbd5e1] text-[14px] font-medium transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)] no-underline leading-none cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 w-full sm:w-[308px] inline-flex items-center justify-center rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[14px] font-medium shadow-sm transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed leading-none cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Creating Account...</span>
              </span>
            ) : (
              'Create Receptionist'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReceptionist;
