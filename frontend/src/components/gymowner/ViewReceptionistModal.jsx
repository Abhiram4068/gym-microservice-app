import { useState, useEffect } from 'react';

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const ViewReceptionistModalContent = ({
  receptionist,
  gymName,
  isDetailLoading,
  busyAction,
  onClose,
  onStatusChange,
  onUpdateReceptionist,
  onRequestDelete,
  onCopy
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: receptionist.firstName || '',
    lastName: receptionist.lastName || ''
  });
  const [editError, setEditError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isEditing && busyAction?.type !== 'update') {
          setIsEditing(false);
          setEditError('');
          setEditFieldErrors([]);
        } else if (!busyAction) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, busyAction, onClose]);

  const isActive = receptionist.status === 1;
  const isRowBusy = busyAction?.id === receptionist.id;
  const isSaving = isRowBusy && busyAction?.type === 'update';
  const initials = `${receptionist.firstName?.[0] || 'R'}${receptionist.lastName?.[0] || 'S'}`.toUpperCase();

  const handleStartEdit = () => {
    setFormData({
      firstName: receptionist.firstName || '',
      lastName: receptionist.lastName || ''
    });
    setEditError('');
    setEditFieldErrors([]);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
    setEditFieldErrors([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditFieldErrors([]);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setEditError('First name and last name are required.');
      return;
    }

    const result = await onUpdateReceptionist(receptionist.id, {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim()
    });

    if (result?.success) {
      setIsEditing(false);
    } else {
      setEditError(result?.message || 'Failed to update receptionist details.');
      if (result?.errors?.length) {
        setEditFieldErrors(result.errors);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-receptionist-title"
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-[1px] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-[#e2e8f0] rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Dialog Header */}
        <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#f8fafc]/70 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-full font-semibold flex items-center justify-center text-sm shrink-0 border ${
                isActive
                  ? 'bg-[#eff6ff] text-[#2563eb] border-[#dbeafe]'
                  : 'bg-slate-100 text-[#64748b] border-[#e2e8f0]'
              }`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2.5">
                <h2
                  id="view-receptionist-title"
                  className="text-lg font-bold tracking-tight text-[#0f172a] truncate"
                >
                  {receptionist.firstName} {receptionist.lastName}
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0f172a]">
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span className={isActive ? 'text-[#0f172a]' : 'text-[#64748b]'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </span>
                {isDetailLoading && (
                  <svg aria-hidden="true" className="w-3.5 h-3.5 animate-spin text-[#2563eb]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-[#64748b] mt-0.5 truncate">
                Front Desk Receptionist · {gymName || 'Your Gym'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isEditing && (
              <button
                type="button"
                disabled={isRowBusy}
                onClick={handleStartEdit}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#0f172a] transition cursor-pointer disabled:opacity-50"
              >
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close receptionist details"
              className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-white border border-transparent hover:border-[#e2e8f0] transition cursor-pointer"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Details / Edit Form Body */}
        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 overflow-y-auto space-y-5">
              {editError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  <div className="font-semibold">{editError}</div>
                  {editFieldErrors.length > 0 && (
                    <ul className="mt-1.5 list-disc list-inside space-y-0.5">
                      {editFieldErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-3">
                  Edit Personal &amp; Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 transition focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
                    <label htmlFor="edit-firstName" className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      FIRST NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-firstName"
                      name="firstName"
                      type="text"
                      required
                      disabled={isSaving}
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] font-medium text-[#0f172a] outline-none"
                    />
                  </div>

                  <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 transition focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
                    <label htmlFor="edit-lastName" className="block text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      LAST NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-lastName"
                      name="lastName"
                      type="text"
                      required
                      disabled={isSaving}
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] font-medium text-[#0f172a] outline-none"
                    />
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 sm:col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                        LOGIN EMAIL (USERNAME)
                      </span>
                      <span className="text-[10.5px] font-semibold text-[#64748b] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">
                        Non-editable
                      </span>
                    </div>
                    <div className="font-mono text-[13px] font-medium text-[#475467] break-all">
                      {receptionist.email}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 sm:col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                        PHONE NUMBER
                      </span>
                      <span className="text-[10.5px] font-semibold text-[#64748b] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">
                        Non-editable
                      </span>
                    </div>
                    <div className="tabular-nums text-[13.5px] font-medium text-[#475467]">
                      {receptionist.phoneNumber || <span className="text-[#94a3b8]">Not provided</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]/70 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCancelEdit}
                className="h-9 px-4 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#475467] transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-9 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {isSaving && (
                  <svg aria-hidden="true" className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Section 1: Personal & Role Details */}
              <section aria-labelledby="section-personal">
                <h3
                  id="section-personal"
                  className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-3"
                >
                  Personal &amp; Role Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      FIRST NAME
                    </div>
                    <div className="text-[13.5px] font-medium text-[#0f172a] break-words">
                      {receptionist.firstName || '—'}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      LAST NAME
                    </div>
                    <div className="text-[13.5px] font-medium text-[#0f172a] break-words">
                      {receptionist.lastName || '—'}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      STAFF ROLE
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-medium text-[#0f172a]">
                        Front Desk Receptionist
                      </span>
                      <span className="text-[11px] font-semibold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/80 shrink-0">
                        Assigned
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      GYM BRANCH
                    </div>
                    <div className="text-[13.5px] font-medium text-[#0f172a] break-words">
                      {gymName || 'Current Gym'}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Contact & Login Credentials */}
              <section aria-labelledby="section-contact">
                <h3
                  id="section-contact"
                  className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-3"
                >
                  Contact &amp; Login Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                        LOGIN EMAIL (USERNAME)
                      </div>
                      <div className="font-mono text-[13px] font-medium text-[#0f172a] break-all">
                        {receptionist.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCopy(receptionist.email, 'email')}
                      aria-label="Copy login email"
                      title="Copy email"
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-[#2563eb] hover:bg-white border border-transparent hover:border-[#e2e8f0] transition cursor-pointer shrink-0"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                        PHONE NUMBER
                      </div>
                      <div className="tabular-nums text-[13.5px] font-medium text-[#0f172a] break-words">
                        {receptionist.phoneNumber || <span className="text-[#94a3b8]">Not provided</span>}
                      </div>
                    </div>
                    {receptionist.phoneNumber && (
                      <button
                        type="button"
                        onClick={() => onCopy(receptionist.phoneNumber, 'phone number')}
                        aria-label="Copy phone number"
                        title="Copy phone number"
                        className="p-1.5 rounded-lg text-[#64748b] hover:text-[#2563eb] hover:bg-white border border-transparent hover:border-[#e2e8f0] transition cursor-pointer shrink-0"
                      >
                        <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 3: Account Status & Activity */}
              <section aria-labelledby="section-activity">
                <h3
                  id="section-activity"
                  className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-3"
                >
                  Account Status &amp; Activity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 sm:col-span-2">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      PORTAL ACCESS STATUS
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-medium text-[#0f172a]">
                      <span
                        aria-hidden="true"
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]'
                            : 'bg-slate-300'
                        }`}
                      />
                      <span>
                        {isActive
                          ? 'Active — Receptionist can sign in and manage front desk operations.'
                          : 'Inactive — Portal login is currently suspended.'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      CREATED ON
                    </div>
                    <div className="tabular-nums text-[13px] font-medium text-[#0f172a]">
                      {formatDateTime(receptionist.createdAt)}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                      LAST SIGN-IN
                    </div>
                    <div className="tabular-nums text-[13px] font-medium text-[#0f172a]">
                      {receptionist.lastLoginAt ? formatDateTime(receptionist.lastLoginAt) : 'Never signed in'}
                    </div>
                  </div>

                  {receptionist.updatedAt && (
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 sm:col-span-2">
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                        LAST UPDATED
                      </div>
                      <div className="tabular-nums text-[13px] font-medium text-[#0f172a]">
                        {formatDateTime(receptionist.updatedAt)}
                      </div>
                    </div>
                  )}

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 sm:col-span-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] mb-1">
                        STAFF ACCOUNT ID
                      </div>
                      <div className="font-mono text-xs text-[#475467] break-all">
                        {receptionist.id}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCopy(receptionist.id, 'account ID')}
                      aria-label="Copy staff account ID"
                      title="Copy account ID"
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-[#2563eb] hover:bg-white border border-transparent hover:border-[#e2e8f0] transition cursor-pointer shrink-0"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Context-Aware Action Footer */}
            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]/70 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                disabled={isRowBusy}
                onClick={() => onRequestDelete(receptionist)}
                className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition cursor-pointer disabled:opacity-50"
              >
                <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Delete Receptionist</span>
              </button>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-4 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#475467] transition cursor-pointer"
                >
                  Close
                </button>

                {isActive ? (
                  <button
                    type="button"
                    disabled={isRowBusy}
                    onClick={() => onStatusChange(receptionist, 'deactivate')}
                    className="h-9 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-xs font-semibold text-amber-800 transition cursor-pointer disabled:opacity-60"
                  >
                    {isRowBusy && busyAction?.type === 'deactivate' && (
                      <svg aria-hidden="true" className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    )}
                    <span>Deactivate Account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isRowBusy}
                    onClick={() => onStatusChange(receptionist, 'activate')}
                    className="h-9 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-60"
                  >
                    {isRowBusy && busyAction?.type === 'activate' && (
                      <svg aria-hidden="true" className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    )}
                    <span>Activate Account</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ViewReceptionistModal = (props) => {
  if (!props.receptionist) return null;
  return <ViewReceptionistModalContent key={props.receptionist.id} {...props} />;
};

export default ViewReceptionistModal;
