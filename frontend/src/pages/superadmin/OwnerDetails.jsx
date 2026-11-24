import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';
import { userApi } from '../../api/user';
import { UserStatus } from '../../types/entities';

const GYM_COLORS = ['#00bfa5', '#116dff', '#f59e0b', '#8b5cf6', '#ec4899', '#0284c7', '#10b981', '#6366f1'];

const getGymColor = (str) => {
  if (!str) return '#116dff';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GYM_COLORS[Math.abs(hash) % GYM_COLORS.length];
};

const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

const OwnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [owner, setOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDetails = useCallback(async () => {
    if (!id) {
      setError('No owner ID specified.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsLoading(true);
    setError('');

    try {
      const res = await userApi.getGymOwnerById(id);
      if (res.success && res.data) {
        setOwner(res.data);
      } else {
        setError(res.message || 'Gym owner details could not be loaded.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while fetching details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const copyToClipboard = (text, label) => {
    if (!text || text === '—') return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(`Copied ${label}`);
      })
      .catch(() => {
        showToast(`Copied: ${text}`);
      });
  };

  const getInitials = (firstName, lastName, fullName) => {
    const name = fullName || `${firstName || ''} ${lastName || ''}`.trim();
    if (!name) return 'GO';
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStatusBadge = (status, statusName) => {
    const isApproved = status === UserStatus.Active || statusName === 'Active' || statusName === 'Approved';
    const isPending = status === UserStatus.Pending || statusName === 'Pending';
    const isRejected = status === UserStatus.Rejected || statusName === 'Rejected';
    const isInactive = status === UserStatus.Inactive || statusName === 'Inactive';

    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#edf3ec] text-[#1c3829]">
          <span className="w-2 h-2 rounded-full bg-[#448361]"></span>
          <span>Approved</span>
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fbf3db] text-[#402c1b]">
          <span className="w-2 h-2 rounded-full bg-[#d9730d]"></span>
          <span>Pending Review</span>
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fbe4e4] text-[#491b19]">
          <span className="w-2 h-2 rounded-full bg-[#d44c47]"></span>
          <span>Rejected</span>
        </span>
      );
    }
    if (isInactive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#ebeced] text-[#37352f]">
          <span className="w-2 h-2 rounded-full bg-[#787774]"></span>
          <span>Inactive</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#eae4f8] text-[#412d56]">
        <span className="w-2 h-2 rounded-full bg-[#9065b0]"></span>
        <span>{statusName || 'Status'}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <svg className="w-8 h-8 animate-spin text-[#116dff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Loading gym owner details...</p>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white border border-[#eaecf0] rounded-xl shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#101828] mb-2">Gym Owner Not Found</h2>
        <p className="text-sm text-[#475467] mb-6">{error || 'The requested gym owner details could not be retrieved from the database.'}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/admin/owners')}
            className="px-4 py-2 text-xs font-semibold text-[#344054] bg-white border border-[#d0d5dd] rounded-lg hover:bg-slate-50 transition"
          >
            ← Back to Gym Owners
          </button>
          <button
            onClick={() => fetchDetails()}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#116dff] rounded-lg hover:bg-[#0057e6] transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const gym = owner.gym || {};
  const ownerFullName = owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Gym Owner';
  const gymName = gym.name || 'Unassigned Gym';
  const gymInitial = gymName.charAt(0).toUpperCase();
  const gymColor = getGymColor(gymName);
  const isApproved = owner.status === UserStatus.Active || owner.statusName === 'Active' || owner.statusName === 'Approved';
  const isRejected = owner.status === UserStatus.Rejected || owner.statusName === 'Rejected';

  const handleApprove = async () => {
    if (!id || isApproved || isSubmittingAction) return;
    setIsSubmittingAction(true);
    try {
      const res = await userApi.approveGymOwner(id);
      if (res.success && res.data) {
        setOwner(res.data);
        showToast(res.message || 'Gym owner approved successfully.');
      } else {
        showToast(res.message || 'Failed to approve gym owner.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'An error occurred during approval.', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!id || isSubmittingAction) return;
    setIsSubmittingAction(true);
    try {
      const res = await userApi.rejectGymOwner(id, rejectionReason);
      if (res.success && res.data) {
        setOwner(res.data);
        setShowRejectModal(false);
        setRejectionReason('');
        showToast(res.message || 'Gym owner application rejected.');
      } else {
        showToast(res.message || 'Failed to reject gym owner.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'An error occurred during rejection.', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-12">
      {/* 1. Breadcrumb & Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-[#667085]">
          <Link to="/admin/dashboard" className="hover:text-[#116dff] transition">Home</Link>
          <span>/</span>
          <Link to="/admin/owners" className="hover:text-[#116dff] transition">Gym Owners</Link>
          <span>/</span>
          <span className="font-semibold text-[#101828]">{ownerFullName}</span>
        </div>

        <button
          onClick={() => navigate('/admin/owners')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#344054] bg-white border border-[#d0d5dd] rounded-lg hover:bg-slate-50 transition"
        >
          <svg className="w-3.5 h-3.5 text-[#667085]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Directory</span>
        </button>
      </div>

      {/* 2. Hero Profile Card */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className="w-14 h-14 rounded-[30px] flex items-center justify-center font-bold text-lg text-white shadow-sm shrink-0"
              style={{ backgroundColor: gymColor }}
            >
              {getInitials(owner.firstName, owner.lastName, owner.fullName)}
            </div>

            <div>
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-xl font-bold text-[#101828] tracking-tight">{ownerFullName}</h1>
                {renderStatusBadge(owner.status, owner.statusName)}
              </div>
              <p className="text-xs text-[#475467] mt-0.5 flex items-center gap-1.5">
                <span className="font-medium text-[#101828]">{gymName}</span>
                <span>•</span>
                <span>Registered {formatDate(owner.createdAt)}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-4 self-start sm:self-center">
            <a
              href={`mailto:${owner.email}?subject=Gym Application Update - ${gymName}`}
              className="text-xs font-medium text-[#475467] hover:text-[#101828] hover:underline cursor-pointer transition no-underline"
            >
              Email
            </a>

            {gym.websiteUrl && (
              <a
                href={gym.websiteUrl.startsWith('http') ? gym.websiteUrl : `https://${gym.websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#116dff] hover:text-[#0057e6] hover:underline cursor-pointer transition no-underline"
              >
                Website
              </a>
            )}

            <button
              onClick={handleApprove}
              disabled={isApproved || isSubmittingAction}
              className={`text-xs font-medium cursor-pointer border-none bg-transparent p-0 transition ${
                isApproved || isSubmittingAction ? 'opacity-40 cursor-not-allowed text-[#12b76a]' : 'text-[#12b76a] hover:text-[#027a48] hover:underline'
              }`}
            >
              {isSubmittingAction ? 'Processing...' : 'Approve'}
            </button>

            <button
              onClick={() => {
                setRejectionReason(gym.rejectionReason || '');
                setShowRejectModal(true);
              }}
              disabled={isRejected || isSubmittingAction}
              className={`text-xs font-medium cursor-pointer border-none bg-transparent p-0 transition ${
                isRejected || isSubmittingAction ? 'opacity-40 cursor-not-allowed text-[#f04438]' : 'text-[#f04438] hover:text-[#b42318] hover:underline'
              }`}
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* Rejection Alert Banner (if rejected and has reason) */}
      {gym.rejectionReason && (
        <div className="p-4 rounded-xl bg-[#fff1f0] border border-[#ffccc7] flex items-start gap-3">
          <svg className="w-5 h-5 text-[#f5222d] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <h3 className="text-xs font-bold text-[#cf1322]">Application Rejection Reason</h3>
            <p className="text-xs text-[#a8071a] mt-0.5">{gym.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* 3. Main Detail Cards (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Gym Business Information */}
        <div className="bg-white border border-[#eaecf0]  shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eaecf0]">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-[20px] flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: gymColor }}
                >
                  {gymInitial}
                </div>
                <h2 className="text-sm font-semibold text-[#101828]">Gym Business Information</h2>
              </div>
              <span className="text-[11px] font-semibold text-[#667085] bg-[#f2f4f7] px-2 py-0.5 rounded">Gym Profile</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Business Name</span>
                <span className="font-semibold text-[#101828] text-right">{gym.name || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Official Contact Email</span>
                <div className="inline-flex items-center gap-1.5">
                  <a href={`mailto:${gym.email}`} className="font-semibold text-[#116dff] hover:underline">{gym.email || '—'}</a>
                  {gym.email && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(gym.email, 'Gym Email')}
                      className="text-[#98a2b3] hover:text-[#116dff] p-0.5 rounded border-none bg-transparent cursor-pointer"
                      title="Copy Gym Email"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Gym Phone Number</span>
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-[#101828]">{gym.phoneNumber || '—'}</span>
                  {gym.phoneNumber && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(gym.phoneNumber, 'Gym Phone')}
                      className="text-[#98a2b3] hover:text-[#116dff] p-0.5 rounded border-none bg-transparent cursor-pointer"
                      title="Copy Gym Phone"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Official Website</span>
                <span className="font-medium text-right">
                  {gym.websiteUrl ? (
                    <a
                      href={gym.websiteUrl.startsWith('http') ? gym.websiteUrl : `https://${gym.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#116dff] hover:underline"
                    >
                      {gym.websiteUrl}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Registered Address</span>
                <span className="font-medium text-[#101828] text-right max-w-[260px]">
                  {gym.addressLine1 || '—'}
                  {gym.addressLine2 ? `, ${gym.addressLine2}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">City, State, Country</span>
                <span className="font-medium text-[#101828] text-right">
                  {[gym.city, gym.state, gym.country].filter(Boolean).join(', ') || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">PIN / Postal Code</span>
                <span className="font-semibold text-[#101828] text-right">{gym.pinCode || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#667085] font-medium">Gym System ID</span>
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-[#475467]">{gym.id || '—'}</span>
                  {gym.id && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(gym.id, 'Gym ID')}
                      className="text-[#98a2b3] hover:text-[#116dff] p-0.5 rounded border-none bg-transparent cursor-pointer"
                      title="Copy Gym ID"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eaecf0] text-[11px] text-[#667085] flex items-center justify-between">
            <span>Registration Created</span>
            <span className="font-medium text-[#101828]">{formatDate(gym.createdAt)}</span>
          </div>
        </div>

        {/* Card 2: Gym Owner Account & Security */}
        <div className="bg-white border border-[#eaecf0] shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eaecf0]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#116dff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h2 className="text-sm font-semibold text-[#101828]">Owner Account & Security</h2>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Owner Full Name</span>
                <span className="font-semibold text-[#101828] text-right">{ownerFullName}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">First & Last Name</span>
                <span className="font-medium text-[#101828] text-right">
                  {owner.firstName} {owner.lastName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Login & Communication Email</span>
                <div className="inline-flex items-center gap-1.5">
                  <a href={`mailto:${owner.email}`} className="font-semibold text-[#116dff] hover:underline">{owner.email}</a>
                  {owner.email && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(owner.email, 'Owner Email')}
                      className="text-[#98a2b3] hover:text-[#116dff] p-0.5 rounded border-none bg-transparent cursor-pointer"
                      title="Copy Email"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Personal Contact Phone</span>
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-[#101828]">{owner.phoneNumber || '—'}</span>
                  {owner.phoneNumber && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(owner.phoneNumber, 'Phone')}
                      className="text-[#98a2b3] hover:text-[#116dff] p-0.5 rounded border-none bg-transparent cursor-pointer"
                      title="Copy Phone"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Must Change Password</span>
                <span className="font-medium text-[#101828] text-right">{owner.mustChangePassword ? 'Yes' : 'No'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Last Login Timestamp</span>
                <span className="font-medium text-[#101828] text-right">{formatDate(owner.lastLoginAt) || 'Never logged in'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-[#667085] font-medium">Account Status</span>
                <div className="text-right">{renderStatusBadge(owner.status, owner.statusName)}</div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#667085] font-medium">User System ID</span>
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-[#475467]">{owner.id}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(owner.id, 'User ID')}
                    className="text-[#98a2b3] hover:text-[#116dff] p-0.5 rounded border-none bg-transparent cursor-pointer"
                    title="Copy User ID"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eaecf0] text-[11px] text-[#667085] flex items-center justify-between">
            <span>Account Created</span>
            <span className="font-medium text-[#101828]">{formatDate(owner.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#eaecf0] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaecf0]">
              <h3 className="text-sm font-bold text-[#101828]">Reject Gym Registration</h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-[#98a2b3] hover:text-[#475467] border-none bg-transparent cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#475467]">
              Are you sure you want to reject the application for <span className="font-semibold text-[#101828]">{gymName}</span> ({ownerFullName})?
              You can optionally enter a reason below.
            </p>

            <div>
              <label className="block text-xs font-medium text-[#344054] mb-1">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Incomplete documentation, business verification unconfirmed..."
                rows={3}
                className="w-full text-xs p-2.5 border border-[#d0d5dd] rounded-lg focus:outline-none focus:border-[#116dff] focus:ring-1 focus:ring-[#116dff]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={isSubmittingAction}
                className="px-3.5 py-2 text-xs font-medium text-[#344054] bg-white border border-[#d0d5dd] rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingAction}
                className="px-3.5 py-2 text-xs font-medium text-white bg-[#f04438] hover:bg-[#d92d20] rounded-lg transition cursor-pointer border-none"
              >
                {isSubmittingAction ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDetails;
