import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';
import { userApi } from '../../api/user';
import { getUserData } from '../../utils/tokenStorage';
import ViewReceptionistModal from '../../components/gymowner/ViewReceptionistModal';

const formatDate = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const ManageReceptionists = () => {
  const { showToast } = useToast();
  const user = getUserData();

  const [receptionists, setReceptionists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(null); // { id, type: 'activate' | 'deactivate' | 'delete' }
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // receptionist object pending confirmation
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const fetchReceptionists = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await userApi.getReceptionists();
      if (result.success) {
        setReceptionists(result.data || []);
      } else {
        setError(result.message || 'Failed to load receptionists.');
      }
    } catch (err) {
      setError(err?.message || 'An error occurred while fetching receptionists.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const handleStatusChange = async (rec, targetAction) => {
    if (busyAction) return;
    const isActive = rec.status === 1;
    if (targetAction === 'activate' && isActive) return;
    if (targetAction === 'deactivate' && !isActive) return;

    setBusyAction({ id: rec.id, type: targetAction });
    try {
      const result = await userApi.toggleStatus(rec.id);
      if (result.success) {
        const nextStatus = targetAction === 'activate' ? 1 : 2;
        const nextStatusName = targetAction === 'activate' ? 'Active' : 'Inactive';
        showToast(result.message || 'Status updated successfully.');
        setReceptionists((prev) =>
          prev.map((r) =>
            r.id === rec.id
              ? { ...r, status: nextStatus, statusName: nextStatusName }
              : r
          )
        );
        setSelectedReceptionist((prev) =>
          prev?.id === rec.id
            ? { ...prev, status: nextStatus, statusName: nextStatusName }
            : prev
        );
      } else {
        showToast(result.message || 'Failed to update status.', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'An error occurred while updating status.', 'error');
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || busyAction) return;
    const target = deleteTarget;
    setBusyAction({ id: target.id, type: 'delete' });
    try {
      const result = await userApi.deleteReceptionist(target.id);
      if (result.success) {
        showToast(result.message || 'Receptionist deleted successfully.');
        setReceptionists((prev) => prev.filter((r) => r.id !== target.id));
        setSelectedReceptionist((prev) => (prev?.id === target.id ? null : prev));
        setDeleteTarget(null);
      } else {
        showToast(result.message || 'Failed to delete receptionist.', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'An error occurred while deleting receptionist.', 'error');
    } finally {
      setBusyAction(null);
    }
  };

  const handleCopyValue = (value, label = 'email') => {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => showToast(`Copied ${label}: ${value}`))
      .catch(() => showToast(`Could not copy ${label}.`, 'error'));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const counts = useMemo(() => {
    const active = receptionists.filter((r) => r.status === 1).length;
    const inactive = receptionists.filter((r) => r.status === 2).length;
    return { all: receptionists.length, active, inactive };
  }, [receptionists]);

  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = receptionists.filter((r) => {
      if (statusFilter === 'ACTIVE' && r.status !== 1) return false;
      if (statusFilter === 'INACTIVE' && r.status !== 2) return false;

      if (!query) return true;
      const fullName = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
      const email = (r.email || '').toLowerCase();
      const phone = (r.phoneNumber || '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });

    return [...filtered].sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'name') {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB) * dir;
      }
      if (sortConfig.key === 'status') {
        return ((a.status || 0) - (b.status || 0)) * dir;
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (timeA - timeB) * dir;
    });
  }, [receptionists, searchQuery, statusFilter, sortConfig]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  const renderSortIcon = (columnKey) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <svg
        aria-hidden="true"
        className={`w-3.5 h-3.5 transition-transform ${
          isActive ? 'text-[#2563eb]' : 'text-[#94a3b8] opacity-60 group-hover:opacity-100'
        } ${isActive && sortConfig.direction === 'asc' ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Page Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#2563eb] mb-2">
            <Link to="/owner/dashboard" className="hover:underline">
              Staff
            </Link>
            <span className="text-[#94a3b8]" aria-hidden="true">›</span>
            <span className="text-[#64748b]">Receptionists</span>
          </div>
          <h1 className="text-3xl sm:text-[34px] font-bold tracking-tight text-[#0f172a]">
            Receptionists
          </h1>
          <p className="text-[13.5px] text-[#64748b] mt-1">
            Manage front desk staff accounts and portal access for{' '}
            <span className="font-medium text-[#0f172a]">{user?.gymName || 'your gym'}</span>.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            to="/owner/receptionists/add"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold rounded-xl shadow-sm transition-colors duration-150 no-underline"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Receptionist</span>
          </Link>
        </div>
      </div>

      {/* Unified Table Surface */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Integrated Toolbar */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Status Tabs */}
          <div
            role="tablist"
            aria-label="Filter receptionists by status"
            className="inline-flex items-center gap-1 bg-[#f8fafc] border border-[#e2e8f0] p-1 rounded-lg self-start"
          >
            {[
              { id: 'ALL', label: 'All', count: counts.all },
              { id: 'ACTIVE', label: 'Active', count: counts.active },
              { id: 'INACTIVE', label: 'Inactive', count: counts.inactive }
            ].map((tab) => {
              const selected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    selected
                      ? 'bg-white text-[#0f172a] shadow-xs ring-1 ring-[#e2e8f0]'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`tabular-nums text-[11px] px-1.5 py-0.2 rounded-full ${
                      selected ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#e2e8f0]/60 text-[#64748b]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Refresh Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, or phone..."
                aria-label="Search receptionists"
                className="w-full h-9 pl-9 pr-8 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[13px] text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/10 placeholder:text-[#94a3b8]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475467] p-0.5 rounded cursor-pointer"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={fetchReceptionists}
              disabled={isLoading}
              aria-label="Refresh receptionists list"
              title="Refresh list"
              className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] transition cursor-pointer disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2563eb]' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg aria-hidden="true" className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchReceptionists}
              className="font-semibold text-red-700 hover:underline cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table Content */}
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wider text-[#64748b] whitespace-nowrap">
                  <th scope="col" className="py-3 px-5 text-center">Staff Member</th>
                  <th scope="col" className="py-3 px-4 text-center">Login Email</th>
                  <th scope="col" className="py-3 px-4 text-center">Phone</th>
                  <th scope="col" className="py-3 px-4 text-center">Status</th>
                  <th scope="col" className="py-3 px-4 text-center">Added &amp; Activity</th>
                  <th scope="col" className="py-3 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {[1, 2, 3, 4].map((row) => (
                  <tr key={row} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="w-44 mx-auto flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-full bg-slate-200/80 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-24 bg-slate-200/80 rounded" />
                          <div className="h-2.5 w-16 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-36 bg-slate-200/70 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-24 bg-slate-100 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-14 bg-slate-100 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 bg-slate-200/70 rounded mx-auto" />
                        <div className="h-2.5 w-24 bg-slate-100 rounded mx-auto" />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="h-7 w-44 bg-slate-100 rounded-lg mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] flex items-center justify-center mx-auto">
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#0f172a]">
                {hasActiveFilters ? 'No matching receptionists' : 'No receptionists added yet'}
              </h3>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">
                {hasActiveFilters
                  ? 'No staff members match your current search or status filter.'
                  : 'Create your first receptionist account to delegate member check-ins and front desk operations.'}
              </p>
            </div>
            <div className="pt-1">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-9 px-4 inline-flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#0f172a] transition cursor-pointer"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/owner/receptionists/add"
                  className="h-9 px-4 inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg shadow-sm transition no-underline"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add First Receptionist</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
                  <th scope="col" className="py-3 px-5 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="group inline-flex items-center justify-center gap-1 uppercase tracking-wider font-bold text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                    >
                      <span>Staff Member</span>
                      {renderSortIcon('name')}
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">Login Email</th>
                  <th scope="col" className="py-3 px-4 text-center">Phone</th>
                  <th scope="col" className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="group inline-flex items-center justify-center gap-1 uppercase tracking-wider font-bold text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                    >
                      <span>Status</span>
                      {renderSortIcon('status')}
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('createdAt')}
                      className="group inline-flex items-center justify-center gap-1 uppercase tracking-wider font-bold text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                    >
                      <span>Added &amp; Activity</span>
                      {renderSortIcon('createdAt')}
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[13px]">
                {filteredAndSorted.map((rec) => {
                  const initials = `${rec.firstName?.[0] || 'R'}${rec.lastName?.[0] || 'S'}`.toUpperCase();
                  const isActive = rec.status === 1;
                  const isRowBusy = busyAction?.id === rec.id;

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedReceptionist(rec)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedReceptionist(rec);
                        }
                      }}
                      className="group hover:bg-[#f8fafc]/90 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-[#eff6ff]/50"
                    >
                      {/* Staff Member — fixed inner block width so avatars align vertically across all rows */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="w-44 mx-auto flex items-center gap-2.5 text-left">
                          <div
                            className={`w-8 h-8 rounded-full font-semibold flex items-center justify-center text-[11px] shrink-0 border ${
                              isActive
                                ? 'bg-[#eff6ff] text-[#2563eb] border-[#dbeafe]'
                                : 'bg-slate-100 text-[#64748b] border-[#e2e8f0]'
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[13px] text-[#0f172a] leading-tight truncate">
                              {rec.firstName} {rec.lastName}
                            </div>
                            <div className="text-[11px] text-[#64748b] mt-0.5 truncate">
                              Receptionist
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Login Email */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="relative inline-flex items-center justify-center">
                          <span className="font-mono text-[12px] text-[#334155]">
                            {rec.email}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyValue(rec.email, 'email');
                            }}
                            aria-label={`Copy email ${rec.email}`}
                            title="Copy email"
                            className="absolute -right-6 p-1 rounded-md text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] opacity-0 group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
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
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-center tabular-nums text-[12.5px] text-[#475467]">
                        {rec.phoneNumber || <span className="text-[#94a3b8]">—</span>}
                      </td>

                      {/* Status — Clean enterprise dot + label (Linear/Stripe style) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <span
                            aria-hidden="true"
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isActive
                                ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]'
                                : 'bg-slate-300'
                            }`}
                          />
                          <span
                            className={`text-[12.5px] font-medium ${
                              isActive ? 'text-[#0f172a]' : 'text-[#64748b]'
                            }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Added & Last Login */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="tabular-nums text-[12.5px] font-medium text-[#334155]">
                          {formatDate(rec.createdAt)}
                        </div>
                        <div className="tabular-nums text-[11px] text-[#64748b] mt-0.5">
                          {rec.lastLoginAt ? `Last login ${formatDate(rec.lastLoginAt)}` : 'Never signed in'}
                        </div>
                      </td>

                      {/* Actions — 3-button segmented control (Activate | Deactivate | Delete) */}
                      <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div
                          role="group"
                          aria-label={`Actions for ${rec.firstName} ${rec.lastName}`}
                          className="inline-flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white divide-x divide-[#e2e8f0] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          <button
                            type="button"
                            disabled={isActive || isRowBusy}
                            onClick={() => handleStatusChange(rec, 'activate')}
                            className={`h-7 px-2.5 inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                              isActive
                                ? 'bg-[#f8fafc] text-[#cbd5e1] cursor-not-allowed'
                                : 'text-[#334155] hover:bg-emerald-50/80 hover:text-emerald-700 cursor-pointer disabled:opacity-60'
                            }`}
                          >
                            {isRowBusy && busyAction?.type === 'activate' && (
                              <svg aria-hidden="true" className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                            )}
                            <span>Activate</span>
                          </button>

                          <button
                            type="button"
                            disabled={!isActive || isRowBusy}
                            onClick={() => handleStatusChange(rec, 'deactivate')}
                            className={`h-7 px-2.5 inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                              !isActive
                                ? 'bg-[#f8fafc] text-[#cbd5e1] cursor-not-allowed'
                                : 'text-[#334155] hover:bg-amber-50/80 hover:text-amber-700 cursor-pointer disabled:opacity-60'
                            }`}
                          >
                            {isRowBusy && busyAction?.type === 'deactivate' && (
                              <svg aria-hidden="true" className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                            )}
                            <span>Deactivate</span>
                          </button>

                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => setDeleteTarget(rec)}
                            className="h-7 px-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#334155] hover:bg-red-50/80 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!isLoading && !error && receptionists.length > 0 && (
          <div className="px-5 py-3 bg-[#f8fafc]/70 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
            <span className="tabular-nums">
              Showing <strong className="font-semibold text-[#0f172a]">{filteredAndSorted.length}</strong> of{' '}
              <strong className="font-semibold text-[#0f172a]">{receptionists.length}</strong>{' '}
              {receptionists.length === 1 ? 'receptionist' : 'receptionists'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-[#2563eb] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Receptionist Details Dialog */}
      <ViewReceptionistModal
        receptionist={selectedReceptionist}
        gymName={user?.gymName}
        busyAction={busyAction}
        onClose={() => setSelectedReceptionist(null)}
        onStatusChange={handleStatusChange}
        onRequestDelete={(rec) => setDeleteTarget(rec)}
        onCopy={handleCopyValue}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-receptionist-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-[1px] p-4"
        >
          <div className="w-full max-w-md bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <h2 id="delete-receptionist-title" className="text-base font-semibold text-[#0f172a]">
                  Delete receptionist account?
                </h2>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Are you sure you want to remove{' '}
                  <span className="font-semibold text-[#0f172a]">
                    {deleteTarget.firstName} {deleteTarget.lastName}
                  </span>{' '}
                  (<span className="font-mono">{deleteTarget.email}</span>)? They will immediately lose portal access.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={busyAction?.type === 'delete'}
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-4 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#475467] transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyAction?.type === 'delete'}
                onClick={handleConfirmDelete}
                className="h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {busyAction?.type === 'delete' && (
                  <svg aria-hidden="true" className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                <span>Delete Receptionist</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReceptionists;
