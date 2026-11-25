import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/common/useToast';
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

const ViewOwners = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const outletCtx = useOutletContext();
  const globalSearch = outletCtx?.globalSearch || '';

  const [owners, setOwners] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [tableSearch, setTableSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });

  const getInitials = (name) => {
    if (!name) return 'GO';
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const copyToClipboard = (text, label) => {
    if (!text || text === '—') return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(`Copied ${label}: ${text}`);
      })
      .catch(() => {
        showToast(`Copied: ${text}`);
      });
  };

  const mapApiOwner = (item) => {
    const isApproved = item.status === UserStatus.Active || item.statusName === 'Active' || item.statusName === 'Approved';
    const isRejected = item.status === UserStatus.Rejected || item.statusName === 'Rejected';

    let displayStatus = 'Pending';
    if (isApproved) displayStatus = 'Approved';
    else if (isRejected) displayStatus = 'Rejected';
    else if (item.status === UserStatus.Inactive || item.statusName === 'Inactive') displayStatus = 'Inactive';
    else if (item.status === UserStatus.Deleted || item.statusName === 'Deleted') displayStatus = 'Deleted';

    return {
      id: item.id,
      name: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unnamed Owner',
      firstName: item.firstName,
      lastName: item.lastName,
      gym: item.gymName || 'N/A',
      gymEmail: item.gymEmail || '',
      gymInitial: (item.gymName || 'G').charAt(0).toUpperCase(),
      gymColor: getGymColor(item.gymName),
      email: item.email,
      phone: item.phoneNumber || item.gymPhoneNumber || '—',
      status: displayStatus,
      rawStatus: item.status,
      rawStatusName: item.statusName,
      city: item.city,
      state: item.state,
      selected: false,
      saved: false,
      createdAt: item.createdAt
    };
  };

  const fetchGymOwners = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const activeSearch = (tableSearch || globalSearch || '').trim();

      let statusParam = null;
      if (currentFilter === 'Pending') statusParam = UserStatus.Pending;
      else if (currentFilter === 'Approved') statusParam = UserStatus.Active;
      else if (currentFilter === 'Rejected') statusParam = UserStatus.Rejected;

      const res = await userApi.getGymOwners({
        search: activeSearch || undefined,
        status: statusParam !== null ? statusParam : undefined,
        sortBy: 'CreatedAt',
        sortOrder: 'desc',
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize
      });

      if (res.success && res.data) {
        const rawItems = res.data.items || [];
        setOwners(rawItems.map(mapApiOwner));
        setPagination((prev) => ({
          ...prev,
          pageNumber: res.data.pageNumber || 1,
          pageSize: res.data.pageSize || 10,
          totalCount: res.data.totalCount || 0,
          totalPages: res.data.totalPages || 1,
          hasPreviousPage: !!res.data.hasPreviousPage,
          hasNextPage: !!res.data.hasNextPage
        }));
      } else {
        setError(res.message || 'Failed to load gym owners.');
        setOwners([]);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while loading gym owners.');
      setOwners([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilter, globalSearch, tableSearch, pagination.pageNumber, pagination.pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGymOwners();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchGymOwners]);

  const updateStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'Approved') {
        const res = await userApi.approveGymOwner(id);
        if (res.success) {
          setOwners((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: 'Approved', statusName: 'Active', statusCode: 1 } : o))
          );
          showToast(res.message || 'Gym owner approved successfully.');
        } else {
          showToast(res.message || 'Failed to approve gym owner.', 'error');
        }
      } else if (newStatus === 'Rejected') {
        const res = await userApi.rejectGymOwner(id);
        if (res.success) {
          setOwners((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: 'Rejected', statusName: 'Rejected', statusCode: 4 } : o))
          );
          showToast(res.message || 'Gym owner application rejected.');
        } else {
          showToast(res.message || 'Failed to reject gym owner.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const batchApproveSelected = async () => {
    const selected = owners.filter((o) => o.selected && o.status !== 'Approved');
    if (selected.length === 0) {
      showToast('Please select at least one pending or rejected gym owner.');
      return;
    }
    try {
      let successCount = 0;
      for (const owner of selected) {
        const res = await userApi.approveGymOwner(owner.id);
        if (res.success) {
          successCount++;
        }
      }
      showToast(`Approved ${successCount} gym owner(s).`);
      fetchGymOwners();
    } catch {
      showToast('Error during batch approval.', 'error');
    }
  };

  const batchRejectSelected = async () => {
    const selected = owners.filter((o) => o.selected && o.status !== 'Rejected');
    if (selected.length === 0) {
      showToast('Please select at least one gym owner to reject.');
      return;
    }
    try {
      let successCount = 0;
      for (const owner of selected) {
        const res = await userApi.rejectGymOwner(owner.id);
        if (res.success) {
          successCount++;
        }
      }
      showToast(`Rejected ${successCount} gym owner(s).`);
      fetchGymOwners();
    } catch {
      showToast('Error during batch rejection.', 'error');
    }
  };

  const sendBatchEmail = () => {
    const selected = owners.filter((o) => o.selected);
    if (selected.length === 0) {
      showToast('Please select gym owners to email.');
      return;
    }
    const emails = selected.map((o) => o.email).join('; ');
    window.location.href = `mailto:${emails}?subject=Update regarding your Gym Partner Account`;
    showToast(`Opening email client for ${selected.length} owner(s).`);
  };

  const exportSelected = () => {
    const targets = owners.filter((o) => o.selected).length > 0 ? owners.filter((o) => o.selected) : owners;
    if (targets.length === 0) {
      showToast('No gym owners to export.');
      return;
    }
    const headers = ['Owner Name', 'Gym Name', 'Gym Email', 'Email Address', 'Phone Number', 'Status'];
    const rows = targets.map((o) => [o.name, o.gym, o.gymEmail, o.email, o.phone, o.status]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((e) => e.map((v) => `"${v}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'gym_owners_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${targets.length} gym owners.`);
  };

  const counts = useMemo(() => {
    const total = pagination.totalCount || owners.length;
    const pending = owners.filter((o) => o.status === 'Pending').length;
    const approved = owners.filter((o) => o.status === 'Approved').length;
    const rejected = owners.filter((o) => o.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [owners, pagination.totalCount]);

  const startRecord = pagination.totalCount === 0 ? 0 : (pagination.pageNumber - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount);

  return (
    <div className="space-y-3.5">
      {/* Page Heading & Description - Outside of the Table Box */}
      <div>
        <h1 className="text-sm font-semibold text-[#101828]">Gym Owners</h1>
        <p className="text-xs text-[#667085] mt-0.5">Manage and review registered gym owners, facilities, and platform accounts.</p>
      </div>

      {/* Directory Table Box */}
      <div className="bg-white border border-[#eaecf0] rounded-lg shadow-sm flex flex-col">
        {/* 1. Subheader Bar */}
        <div className="flex items-center justify-between px-4 sm:px-4.5 py-2.5 border-b border-[#eaecf0] text-[12.5px] bg-white">
          <div className="inline-flex items-center gap-1.5 text-[#475467] font-medium">

          </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => fetchGymOwners()}
            className="inline-flex items-center gap-1 text-[#475467] text-[12.5px] font-medium bg-transparent border-none cursor-pointer hover:text-[#116dff]"
            title="Refresh list"
          >
            <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#116dff]' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Refresh</span>
          </button>

          <div className="inline-flex items-center gap-1.5 text-[#475467] text-xs font-semibold">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageNumber: Math.max(1, prev.pageNumber - 1) }))}
              disabled={!pagination.hasPreviousPage}
              className={`bg-transparent border-none px-1 rounded ${
                pagination.hasPreviousPage ? 'text-[#475467] cursor-pointer hover:bg-[#f1f5f9]' : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              ‹
            </button>
            <span>Page: {pagination.pageNumber}</span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
              disabled={!pagination.hasNextPage}
              className={`bg-transparent border-none px-1 rounded ${
                pagination.hasNextPage ? 'text-[#475467] cursor-pointer hover:bg-[#f1f5f9]' : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs Row */}
      <div className="flex items-center px-4 sm:px-4.5 border-b border-[#eaecf0] bg-white gap-5 overflow-x-auto">
        <button
          onClick={() => {
            setCurrentFilter('All');
            setPagination((p) => ({ ...p, pageNumber: 1 }));
          }}
          className={`py-3 bg-transparent border-b-2 text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition ${
            currentFilter === 'All' ? 'text-[#116dff] border-[#116dff]' : 'text-[#475467] border-transparent hover:text-[#116dff]'
          }`}
        >
          <span>All Results</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${currentFilter === 'All' ? 'bg-[#eff8ff] text-[#116dff]' : 'bg-[#f2f4f7] text-[#475467]'}`}>
            {counts.total}
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentFilter('Pending');
            setPagination((p) => ({ ...p, pageNumber: 1 }));
          }}
          className={`py-3 bg-transparent border-b-2 text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition ${
            currentFilter === 'Pending' ? 'text-[#116dff] border-[#116dff]' : 'text-[#475467] border-transparent hover:text-[#116dff]'
          }`}
        >
          <span>Pending Review</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${currentFilter === 'Pending' ? 'bg-[#eff8ff] text-[#116dff]' : 'bg-[#f2f4f7] text-[#475467]'}`}>
            {counts.pending}
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentFilter('Approved');
            setPagination((p) => ({ ...p, pageNumber: 1 }));
          }}
          className={`py-3 bg-transparent border-b-2 text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition ${
            currentFilter === 'Approved' ? 'text-[#116dff] border-[#116dff]' : 'text-[#475467] border-transparent hover:text-[#116dff]'
          }`}
        >
          <span>Approved</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${currentFilter === 'Approved' ? 'bg-[#eff8ff] text-[#116dff]' : 'bg-[#f2f4f7] text-[#475467]'}`}>
            {counts.approved}
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentFilter('Rejected');
            setPagination((p) => ({ ...p, pageNumber: 1 }));
          }}
          className={`py-3 bg-transparent border-b-2 text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition ${
            currentFilter === 'Rejected' ? 'text-[#116dff] border-[#116dff]' : 'text-[#475467] border-transparent hover:text-[#116dff]'
          }`}
        >
          <span>Rejected</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${currentFilter === 'Rejected' ? 'bg-[#eff8ff] text-[#116dff]' : 'bg-[#f2f4f7] text-[#475467]'}`}>
            {counts.rejected}
          </span>
        </button>
      </div>

      {/* 3. Action Ribbon Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-4.5 py-2.5 bg-[#fafbfc] border-b border-[#eaecf0]">
        <div className="flex items-center flex-wrap gap-2">

          <button
            onClick={batchApproveSelected}
            className="inline-flex items-center gap-1.5 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition"
          >
            <svg className="w-3.5 h-3.5 text-[#12b76a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Approve</span>
          </button>

          <button
            onClick={batchRejectSelected}
            className="inline-flex items-center gap-1.5 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition"
          >
            <svg className="w-3.5 h-3.5 text-[#f04438]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Reject</span>
          </button>

          <button
            onClick={sendBatchEmail}
            className="inline-flex items-center gap-1.5 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition"
          >
            <svg className="w-3.5 h-3.5 text-[#667085]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Send Email</span>
          </button>

          <button
            onClick={exportSelected}
            className="inline-flex items-center gap-1.5 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition"
          >
            <svg className="w-3.5 h-3.5 text-[#667085]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export</span>
          </button>
        </div>

        <div className="relative w-full sm:w-[260px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98a2b3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => {
              setTableSearch(e.target.value);
              setPagination((p) => ({ ...p, pageNumber: 1 }));
            }}
            placeholder="Search gym, owner, email, phone..."
            className="w-full h-8 pl-8 pr-2.5 bg-white border border-[#d0d5dd] rounded-md text-[12.5px] outline-none transition focus:border-[#116dff] focus:ring-1 focus:ring-[#116dff]"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchGymOwners()}
            className="text-red-700 font-semibold hover:underline bg-transparent border-none cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Table List View */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left whitespace-nowrap">
          <thead className="bg-[#f8fafc] border-b border-[#eaecf0]">
            <tr>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467]  tracking-wider">Gym Owner Name</th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467]  tracking-wider">Gym Organization</th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467]  tracking-wider">Email Address</th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467]  tracking-wider">Phone Number</th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467]  tracking-wider">Status</th>
              <th className="px-4 py-2 text-[11.5px] font-semibold text-[#475467]  tracking-wider text-right pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecf0]">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-[#475467] text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-6 h-6 animate-spin text-[#116dff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    <span className="text-xs font-medium text-slate-500">Loading gym owners...</span>
                  </div>
                </td>
              </tr>
            ) : owners.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-[#475467] text-sm">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-700">No gym owners found</span>
                    <span className="text-xs text-slate-500">Try adjusting your search criteria or filter.</span>
                  </div>
                </td>
              </tr>
            ) : (
              owners.map((owner) => {
                const isApproved = owner.status === 'Approved';
                const isRejected = owner.status === 'Rejected';

                return (
                  <tr
                    key={owner.id}
                    className={`transition-colors ${owner.selected ? 'bg-[#f0f7ff]' : 'hover:bg-[#f9fbfd]'}`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[26px] h-[26px] rounded-full text-[#116dff] font-semibold text-[10.5px] flex items-center justify-center shrink-0">
                          {getInitials(owner.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-[#101828] block leading-tight">{owner.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-2">
                        <div
                          className="w-[22px] h-[22px] rounded-[20px] flex items-center justify-center font-semibold text-[10px] text-white shrink-0"
                          style={{ backgroundColor: owner.gymColor }}
                        >
                          {owner.gymInitial}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#101828]">{owner.gym}</div>
                          <div className="text-[10.5px] text-[#667085]">{owner.gymEmail || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-1 text-[#101828] font-medium text-xs">
                        <a href={`mailto:${owner.email}`} className="text-[#101828] hover:text-[#116dff] no-underline">
                          {owner.email}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(owner.email, 'Email')}
                          className="text-[#98a2b3] hover:text-[#116dff] hover:bg-slate-100 p-0.5 rounded cursor-pointer border-none bg-transparent"
                          title="Copy Email"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-1 text-[#101828] font-medium text-xs">
                        <a href={`tel:${owner.phone.replace(/[^0-9+]/g, '')}`} className="text-[#101828] hover:text-[#116dff] no-underline">
                          {owner.phone}
                        </a>
                        {owner.phone !== '—' && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(owner.phone, 'Phone')}
                            className="text-[#98a2b3] hover:text-[#116dff] hover:bg-slate-100 p-0.5 rounded cursor-pointer border-none bg-transparent"
                            title="Copy Phone"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {owner.status === 'Approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#edf3ec] text-[#1c3829]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#448361]"></span>
                          <span>Approved</span>
                        </span>
                      )}
                      {owner.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fbf3db] text-[#402c1b]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d9730d]"></span>
                          <span>Pending</span>
                        </span>
                      )}
                      {owner.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fbe4e4] text-[#491b19]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d44c47]"></span>
                          <span>Rejected</span>
                        </span>
                      )}
                      {owner.status === 'Inactive' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#ebeced] text-[#37352f]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#787774]"></span>
                          <span>Inactive</span>
                        </span>
                      )}
                      {owner.status === 'Deleted' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#eae4f8] text-[#412d56]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9065b0]"></span>
                          <span>Deleted</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right pr-5">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => updateStatus(owner.id, 'Approved')}
                          disabled={isApproved}
                          className={`text-xs font-medium cursor-pointer border-none bg-transparent p-0 transition ${
                            isApproved ? 'opacity-40 cursor-not-allowed text-[#12b76a]' : 'text-[#12b76a] hover:text-[#027a48] hover:underline'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(owner.id, 'Rejected')}
                          disabled={isRejected}
                          className={`text-xs font-medium cursor-pointer border-none bg-transparent p-0 transition ${
                            isRejected ? 'opacity-40 cursor-not-allowed text-[#f04438]' : 'text-[#f04438] hover:text-[#b42318] hover:underline'
                          }`}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => navigate(`/admin/owners/${owner.id}`)}
                          className="text-xs font-medium text-[#116dff] hover:text-[#0057e6] hover:underline cursor-pointer border-none bg-transparent p-0"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Footer Bar */}
      <div className="flex items-center justify-between px-4 sm:px-4.5 py-3 border-t border-[#eaecf0] bg-white text-[12.5px] text-[#475467]">
        <div>
          Showing {startRecord} to {endRecord} of {pagination.totalCount} gym owners
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageNumber: Math.max(1, prev.pageNumber - 1) }))}
            disabled={!pagination.hasPreviousPage}
            className={`border border-[#d0d5dd] rounded-md px-3 py-1 text-xs font-semibold ${
              pagination.hasPreviousPage
                ? 'bg-white text-[#475467] hover:bg-slate-50 cursor-pointer'
                : 'bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          <span className="font-semibold px-1 text-slate-800">
            {pagination.pageNumber} / {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
            disabled={!pagination.hasNextPage}
            className={`border border-[#d0d5dd] rounded-md px-3 py-1 text-xs font-semibold ${
              pagination.hasNextPage
                ? 'bg-white text-[#475467] hover:bg-slate-50 cursor-pointer'
                : 'bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ViewOwners;
