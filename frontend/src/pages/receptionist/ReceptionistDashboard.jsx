import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUserData } from '../../utils/tokenStorage';
import { getInitials } from '../../utils/initials';
import { useToast } from '../../components/common/useToast';
import { membersApi } from '../../api/members';

const ReceptionistDashboard = () => {
  const { showToast } = useToast();
  const user = getUserData();

  const [members, setMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [sortBy, setSortBy] = useState('CreatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber,
        pageSize,
        sortBy,
        sortOrder
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (statusFilter === 'pending') {
        params.status = 1;
      } else if (statusFilter === 'active') {
        params.status = 2;
      } else if (statusFilter === 'inactive') {
        params.status = 3;
      }

      const res = await membersApi.getMembers(params);
      if (res.success && res.data) {
        setMembers(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
        setHasPreviousPage(Boolean(res.data.hasPreviousPage));
        setHasNextPage(Boolean(res.data.hasNextPage));
      } else {
        setMembers([]);
        setTotalCount(0);
        setTotalPages(1);
        setHasPreviousPage(false);
        setHasNextPage(false);
        if (res.message) {
          showToast(res.message, 'error');
        }
      }
    } catch {
      setMembers([]);
      showToast('Failed to load members.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, searchTerm, statusFilter, sortBy, sortOrder, showToast]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(debounce);
  }, [fetchMembers]);

  const handleStatusTabChange = (tab) => {
    setStatusFilter(tab);
    setPageNumber(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPageNumber(1);
  };

  const handleSortChange = (e) => {
    const [nextSortBy, nextSortOrder] = e.target.value.split(':');
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    setPageNumber(1);
  };

  const activeInPage = members.filter((m) => m.status === 2).length;
  const pendingInPage = members.filter((m) => m.status === 1).length;
  const recentSignups = members.filter(
    (m) => m.createdAt && new Date(m.createdAt) >= new Date(Date.now() - 7 * 86400000)
  ).length;

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedClock = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-4 space-y-4 text-slate-900 no-scrollbar">
      {/* 1. Top Front-Office Command Header */}
      <div className="px-5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Front Desk Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.gymName || 'Gym Front Desk'} &middot; Shift:{' '}
            <span className="font-medium text-slate-700">{user?.firstName || 'Receptionist'}</span>{' '}
            &middot; {formattedDate} ({formattedClock})
          </p>
        </div>
      </div>

      {/* 2. Unified Operational Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Members
            </p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {totalCount}
            </p>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active (This Page)
            </p>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums mt-1">
              {activeInPage}
            </p>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Pending (This Page)
            </p>
            <p className="text-2xl font-bold text-amber-600 tabular-nums mt-1">
              {pendingInPage}
            </p>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              New Signups (7d)
            </p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {recentSignups}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Member Directory Console */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Console Toolbar */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Members' },
              { key: 'pending', label: 'Pending' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleStatusTabChange(tab.key)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer border-none ${
                  statusFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="relative w-full sm:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
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
                placeholder="Search code, name, email, phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={handleSortChange}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900"
            >
              <option value="CreatedAt:desc">Newest First</option>
              <option value="CreatedAt:asc">Oldest First</option>
              <option value="Name:asc">Name (A-Z)</option>
              <option value="Name:desc">Name (Z-A)</option>
              <option value="MemberCode:asc">Member Code (Asc)</option>
              <option value="Email:asc">Email (A-Z)</option>
            </select>
          </div>
        </div>

        {/* High-Density Front Desk Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-4">Member</th>
                <th className="py-2.5 px-4">Contact</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4">Emergency Contact</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No member records found.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const fullName = member.fullName || `${member.firstName} ${member.lastName}`.trim();
                  const initials = getInitials(member.firstName, member.lastName, fullName) || 'M';

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#116dff] font-bold text-[11px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight">
                              {fullName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              {member.memberCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium tabular-nums">
                          {member.phoneNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {member.email || '—'}
                        </div>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">
                          {member.genderName || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          Joined: {member.joiningDate || '—'}
                        </div>
                      </td>

                      {/* Emergency Contact */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">
                          {[member.emergencyContactName, member.emergencyContactRelation].filter(Boolean).join(' · ') || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          {member.emergencyContactPhone || '—'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {member.status === 2 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : member.status === 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {member.statusName || 'Inactive'}
                          </span>
                        )}
                      </td>

                      {/* Registered */}
                      <td className="py-3 px-4 text-right text-slate-600 font-medium tabular-nums">
                        {formatDate(member.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/40 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{members.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalCount}</span> members &middot; Page{' '}
            <span className="font-semibold text-slate-900">{pageNumber}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPreviousPage || isLoading}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-md border border-slate-300 bg-white text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!hasNextPage || isLoading}
              onClick={() => setPageNumber((p) => p + 1)}
              className="px-3 py-1 rounded-md border border-slate-300 bg-white text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
