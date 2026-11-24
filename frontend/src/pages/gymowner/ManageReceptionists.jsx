import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';
import { userApi } from '../../api/user';
import { getUserData } from '../../utils/tokenStorage';

const ManageReceptionists = () => {
  const { showToast } = useToast();
  const user = getUserData();

  const [receptionists, setReceptionists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const result = await userApi.toggleStatus(id);
      if (result.success) {
        showToast(result.message || 'Status updated successfully.');
        // Update status locally
        setReceptionists((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: r.status === 1 ? 2 : 1,
                  statusName: r.status === 1 ? 'Inactive' : 'Active'
                }
              : r
          )
        );
      } else {
        showToast(result.message || 'Failed to update status.', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'An error occurred while toggling status.', 'error');
    }
  };

  // Filtered receptionists
  const filteredReceptionists = receptionists.filter((r) => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const email = (r.email || '').toLowerCase();
    const phone = (r.phoneNumber || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query) || phone.includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return r.status === 1;
    if (statusFilter === 'INACTIVE') return r.status === 2;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#dce4f0] gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Receptionists & Front Desk Staff
          </h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Manage staff accounts, statuses, and permissions for{' '}
            <strong className="text-[#0f172a] font-semibold">{user?.gymName || 'your gym'}</strong>.
          </p>
        </div>

        <div>
          <Link
            to="/owner/receptionists/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#116dff] hover:bg-[#0b5de6] text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Receptionist</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-[#dce4f0] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full h-9 pl-9 pr-3.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:bg-white placeholder:text-[#94a3b8]"
          />
          <svg className="w-4 h-4 text-[#94a3b8] absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-lg self-stretch sm:self-auto text-xs font-semibold text-[#64748b]">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-[#0f172a] shadow-xs' : 'hover:text-[#0f172a]'
            }`}
          >
            All ({receptionists.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              statusFilter === 'ACTIVE' ? 'bg-white text-[#0f172a] shadow-xs' : 'hover:text-[#0f172a]'
            }`}
          >
            Active ({receptionists.filter((r) => r.status === 1).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              statusFilter === 'INACTIVE' ? 'bg-white text-[#0f172a] shadow-xs' : 'hover:text-[#0f172a]'
            }`}
          >
            Inactive ({receptionists.filter((r) => r.status === 2).length})
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-[#dce4f0] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-medium text-[#64748b] flex flex-col items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-[#116dff]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>Loading receptionists...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600 space-y-2">
            <div>{error}</div>
            <button
              onClick={fetchReceptionists}
              className="text-xs text-[#116dff] hover:underline font-semibold"
            >
              Retry
            </button>
          </div>
        ) : filteredReceptionists.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto text-xl">
              📋
            </div>
            <h3 className="text-sm font-bold text-[#0f172a]">
              {searchQuery ? 'No matching receptionists found' : 'No receptionists registered yet'}
            </h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Add your first receptionist to help manage member registrations and check-ins.'}
            </p>
            {!searchQuery && (
              <div className="pt-1">
                <Link
                  to="/owner/receptionists/add"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#116dff] hover:bg-[#0b5de6] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add First Receptionist</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc] text-[#475467] font-semibold">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Login Email</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0] text-[#101828]">
                {filteredReceptionists.map((rec) => {
                  const initials = `${rec.firstName?.[0] || 'R'}${rec.lastName?.[0] || 'S'}`.toUpperCase();
                  const isActive = rec.status === 1;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0f172a] font-bold flex items-center justify-center text-[11px] shrink-0 border border-slate-200">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-[13px] text-[#0f172a]">
                              {rec.firstName} {rec.lastName}
                            </div>
                            <div className="text-[11px] text-[#64748b]">Receptionist</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#475467]">
                        {rec.email}
                      </td>

                      <td className="py-3.5 px-4 text-[#475467]">
                        {rec.phoneNumber || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf3] text-[#12b76a] border border-[#a6f4c5]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#12b76a]"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef3f2] text-[#b42318] border border-[#fecdca]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#b42318]"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#64748b]">
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(rec.id, rec.status)}
                          className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition cursor-pointer ${
                            isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReceptionists;
