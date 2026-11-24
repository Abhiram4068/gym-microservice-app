import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';

const initialOwnersData = [
  {
    id: 1,
    name: "Rashmi Mittal",
    gym: "Travelport Fitness Club",
    gymInitial: "T",
    gymColor: "#00bfa5",
    role: "Founder & Managing Director",
    email: "rashmi.mittal@travelport.com",
    phone: "+91 98112 44321",
    status: "Approved",
    selected: false,
    saved: true
  },
  {
    id: 2,
    name: "Jonathan Morrisons",
    gym: "IronForge Athletics",
    gymInitial: "I",
    gymColor: "#116dff",
    role: "Head Coach & Owner",
    email: "j.morrisons@ironforgegym.com",
    phone: "+1 (555) 349-8821",
    status: "Approved",
    selected: false,
    saved: true
  },
  {
    id: 3,
    name: "Jacob Jones",
    gym: "Bumanji Liverpool Gym",
    gymInitial: "B",
    gymColor: "#f59e0b",
    role: "Regional Director / Owner",
    email: "jacob.jones@bumanjigym.co.uk",
    phone: "+44 20 7946 0912",
    status: "Pending",
    selected: true,
    saved: false
  },
  {
    id: 4,
    name: "Bessie Cooper",
    gym: "Bongo Vibe Studio",
    gymInitial: "B",
    gymColor: "#ef4444",
    role: "Co-Founder & General Partner",
    email: "bessie.cooper@bongovibe.com",
    phone: "+1 (555) 782-9901",
    status: "Pending",
    selected: false,
    saved: true
  },
  {
    id: 5,
    name: "Devon Lane",
    gym: "Shield Synergy Health",
    gymInitial: "S",
    gymColor: "#8b5cf6",
    role: "Managing Partner",
    email: "devon.lane@shieldsynergy.org",
    phone: "+1 (555) 438-2109",
    status: "Pending",
    selected: true,
    saved: false
  },
  {
    id: 6,
    name: "Albert Flores",
    gym: "Pulse Power House",
    gymInitial: "P",
    gymColor: "#ec4899",
    role: "Owner & Principal Trainer",
    email: "albert.flores@pulsepower.io",
    phone: "+1 (555) 902-1144",
    status: "Approved",
    selected: false,
    saved: true
  },
  {
    id: 7,
    name: "Elena Rostova",
    gym: "Apex Pulse Fitness",
    gymInitial: "A",
    gymColor: "#0284c7",
    role: "Founder & Lead Coach",
    email: "elena@apexpulsefit.com",
    phone: "+1 (555) 892-3412",
    status: "Pending",
    selected: false,
    saved: false
  },
  {
    id: 8,
    name: "Guy Hawkins",
    gym: "Titan CrossFit Box",
    gymInitial: "T",
    gymColor: "#000000",
    role: "Gym Owner & Operator",
    email: "guy.hawkins@titancrossfit.de",
    phone: "+49 30 2219 0182",
    status: "Approved",
    selected: false,
    saved: false
  },
  {
    id: 9,
    name: "Robert Fox",
    gym: "Burnt Toast Wellness",
    gymInitial: "B",
    gymColor: "#f97316",
    role: "Franchise Owner",
    email: "robert.fox@burnttoastfit.com",
    phone: "+1 (555) 674-8890",
    status: "Rejected",
    selected: false,
    saved: false
  },
  {
    id: 10,
    name: "Jerome Bell",
    gym: "Metro Barbell Club",
    gymInitial: "M",
    gymColor: "#1e293b",
    role: "Owner / Strength Coach",
    email: "jerome.bell@metrobarbell.io",
    phone: "+1 (555) 419-7721",
    status: "Approved",
    selected: false,
    saved: true
  },
  {
    id: 11,
    name: "Darrell Steward",
    gym: "Zenith Strength Hub",
    gymInitial: "Z",
    gymColor: "#14b8a6",
    role: "Managing Owner",
    email: "darrell@zenithstrength.com",
    phone: "+1 (555) 238-9923",
    status: "Approved",
    selected: false,
    saved: false
  },
  {
    id: 12,
    name: "Chloe Sterling",
    gym: "Velocity Cycle Studio",
    gymInitial: "V",
    gymColor: "#dc2626",
    role: "Studio Director & Owner",
    email: "chloe@velocityhub.co",
    phone: "+1 (555) 308-9455",
    status: "Rejected",
    selected: false,
    saved: false
  }
];

const ViewOwners = () => {
  const { showToast } = useToast();
  const outletCtx = useOutletContext();
  const globalSearch = outletCtx?.globalSearch || '';

  const [owners, setOwners] = useState(initialOwnersData);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [tableSearch, setTableSearch] = useState('');

  const getInitials = (name) => {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${label}: ${text}`);
    }).catch(() => {
      showToast(`Copied: ${text}`);
    });
  };

  const toggleSelectAll = (checked) => {
    setOwners((prev) => prev.map((o) => ({ ...o, selected: checked })));
  };

  const toggleSelectRow = (id, checked) => {
    setOwners((prev) =>
      prev.map((o) => (o.id === id ? { ...o, selected: checked } : o))
    );
  };

  const updateStatus = (id, newStatus) => {
    setOwners((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    showToast(`Owner status updated to ${newStatus}`);
  };

  const batchApproveSelected = () => {
    const selected = owners.filter((o) => o.selected);
    if (selected.length === 0) {
      showToast('Please select at least one gym owner.');
      return;
    }
    setOwners((prev) =>
      prev.map((o) => (o.selected ? { ...o, status: 'Approved' } : o))
    );
    showToast(`Approved ${selected.length} gym owner(s).`);
  };

  const batchRejectSelected = () => {
    const selected = owners.filter((o) => o.selected);
    if (selected.length === 0) {
      showToast('Please select at least one gym owner.');
      return;
    }
    setOwners((prev) =>
      prev.map((o) => (o.selected ? { ...o, status: 'Rejected' } : o))
    );
    showToast(`Rejected ${selected.length} gym owner(s).`);
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
    const headers = ['Name', 'Gym', 'Role', 'Email', 'Phone', 'Status'];
    const rows = targets.map((o) => [o.name, o.gym, o.role, o.email, o.phone, o.status]);
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
    const total = owners.length;
    const pending = owners.filter((o) => o.status === 'Pending').length;
    const approved = owners.filter((o) => o.status === 'Approved').length;
    const rejected = owners.filter((o) => o.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [owners]);

  const filteredOwners = useMemo(() => {
    const query = (tableSearch || globalSearch || '').toLowerCase().trim();
    return owners.filter((owner) => {
      let matchesFilter = true;
      if (currentFilter === 'Pending') matchesFilter = owner.status === 'Pending';
      else if (currentFilter === 'Approved') matchesFilter = owner.status === 'Approved';
      else if (currentFilter === 'Rejected') matchesFilter = owner.status === 'Rejected';
      else if (currentFilter === 'Saved') matchesFilter = !!owner.saved;

      const matchesQuery =
        owner.name.toLowerCase().includes(query) ||
        owner.gym.toLowerCase().includes(query) ||
        owner.email.toLowerCase().includes(query) ||
        owner.phone.toLowerCase().includes(query) ||
        owner.role.toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });
  }, [owners, currentFilter, tableSearch, globalSearch]);

  const selectedCount = owners.filter((o) => o.selected).length;
  const allSelected = filteredOwners.length > 0 && filteredOwners.every((o) => o.selected);

  return (
    <div className="bg-white border border-[#eaecf0] rounded-lg shadow-sm flex flex-col">
      {/* 1. Subheader Bar */}
      <div className="flex items-center justify-between px-4 sm:px-4.5 py-2.5 border-b border-[#eaecf0] text-[12.5px] bg-white">
        <div className="inline-flex items-center gap-1.5 text-[#475467] font-medium cursor-pointer">
          <svg className="w-3.5 h-3.5 text-[#98a2b3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <span>Saved Searches</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:inline-flex items-center gap-1.5 text-[#475467] text-[12.5px] font-medium bg-transparent border-none cursor-pointer hover:text-[#116dff]" title="Status updates">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span>2 Status Changes</span>
          </button>

          <button className="hidden md:inline-flex items-center gap-1 text-[#475467] text-[12.5px] font-medium bg-transparent border-none cursor-pointer hover:text-[#116dff]">
            <span>Table Settings</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>

          <button onClick={exportSelected} className="inline-flex items-center gap-1.5 text-[#116dff] text-[12.5px] font-medium bg-transparent border-none cursor-pointer hover:underline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Import / Export</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>

          <div className="inline-flex items-center gap-1.5 text-[#475467] text-xs font-semibold">
            <button className="bg-transparent border-none text-[#475467] cursor-pointer px-1 rounded hover:bg-[#f1f5f9]">‹</button>
            <span>Page: 1</span>
            <button className="bg-transparent border-none text-[#475467] cursor-pointer px-1 rounded hover:bg-[#f1f5f9]">›</button>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs Row */}
      <div className="flex items-center px-4 sm:px-4.5 border-b border-[#eaecf0] bg-white gap-5 overflow-x-auto">
        <button
          onClick={() => setCurrentFilter('All')}
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
          onClick={() => setCurrentFilter('Pending')}
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
          onClick={() => setCurrentFilter('Approved')}
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
          onClick={() => setCurrentFilter('Rejected')}
          className={`py-3 bg-transparent border-b-2 text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition ${
            currentFilter === 'Rejected' ? 'text-[#116dff] border-[#116dff]' : 'text-[#475467] border-transparent hover:text-[#116dff]'
          }`}
        >
          <span>Rejected</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${currentFilter === 'Rejected' ? 'bg-[#eff8ff] text-[#116dff]' : 'bg-[#f2f4f7] text-[#475467]'}`}>
            {counts.rejected}
          </span>
        </button>

        <button
          onClick={() => setCurrentFilter('Saved')}
          className={`py-3 bg-transparent border-b-2 text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition ${
            currentFilter === 'Saved' ? 'text-[#116dff] border-[#116dff]' : 'text-[#475467] border-transparent hover:text-[#116dff]'
          }`}
        >
          <span>Saved</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f2f4f7] text-[#475467]">★</span>
        </button>
      </div>

      {/* 3. Action Ribbon Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-4.5 py-2.5 bg-[#fafbfc] border-b border-[#eaecf0]">
        <div className="flex items-center flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 bg-white border border-[#d0d5dd] rounded-md px-3 py-1.5 text-[12.5px] font-semibold text-[#101828]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#116dff] cursor-pointer"
            />
            <span>{selectedCount} Selected</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>

          <button onClick={batchApproveSelected} className="inline-flex items-center gap-1.5 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition">
            <svg className="w-3.5 h-3.5 text-[#12b76a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Approve</span>
          </button>

          <button onClick={batchRejectSelected} className="inline-flex items-center gap-1.5 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition">
            <svg className="w-3.5 h-3.5 text-[#f04438]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Reject</span>
          </button>

          <button onClick={sendBatchEmail} className="inline-flex items-center gap-1.5 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition">
            <svg className="w-3.5 h-3.5 text-[#667085]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>Send Email</span>
          </button>

          <button onClick={() => showToast('Sequence workflow triggered')} className="inline-flex items-center gap-1 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition">
            <svg className="w-3.5 h-3.5 text-[#667085]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Sequence</span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>

          <button onClick={() => showToast('Lists view opened')} className="inline-flex items-center gap-1 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition">
            <svg className="w-3.5 h-3.5 text-[#667085]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>
            <span>Lists</span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>

          <button onClick={exportSelected} className="inline-flex items-center gap-1.5 bg-white border border-[#d0d5dd] hover:border-slate-400 hover:bg-slate-50 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#475467] transition">
            <svg className="w-3.5 h-3.5 text-[#667085]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Export</span>
          </button>
        </div>

        <div className="relative w-full sm:w-[260px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98a2b3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Filter gym owners, phone, email..."
            className="w-full h-8 pl-8 pr-2.5 bg-white border border-[#d0d5dd] rounded-md text-[12.5px] outline-none transition focus:border-[#116dff] focus:ring-1 focus:ring-[#116dff]"
          />
        </div>
      </div>

      {/* 4. Table List View */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left whitespace-nowrap">
          <thead className="bg-[#f8fafc] border-b border-[#eaecf0]">
            <tr>
              <th className="w-10 text-center pl-3 pr-1 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#116dff] cursor-pointer align-middle"
                />
              </th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467] uppercase tracking-wider">Gym Owner Name</th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467] uppercase tracking-wider">Gym Organization</th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467] uppercase tracking-wider">Email Address</th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467] uppercase tracking-wider">Phone Number</th>
              <th className="px-3 py-2 text-[11.5px] font-semibold text-[#475467] uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-[11.5px] font-semibold text-[#475467] uppercase tracking-wider text-right pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecf0]">
            {filteredOwners.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-[#475467] text-sm">
                  No gym owners found matching your filter or query.
                </td>
              </tr>
            ) : (
              filteredOwners.map((owner) => {
                const isApproved = owner.status === 'Approved';
                const isRejected = owner.status === 'Rejected';

                return (
                  <tr
                    key={owner.id}
                    className={`transition-colors ${owner.selected ? 'bg-[#f0f7ff]' : 'hover:bg-[#f9fbfd]'}`}
                  >
                    <td className="w-10 text-center pl-3 pr-1 py-2">
                      <input
                        type="checkbox"
                        checked={!!owner.selected}
                        onChange={(e) => toggleSelectRow(owner.id, e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#116dff] cursor-pointer align-middle"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[26px] h-[26px] rounded-full bg-[#eff8ff] text-[#116dff] border border-[#d1e9ff] font-semibold text-[10.5px] flex items-center justify-center shrink-0">
                          {getInitials(owner.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-[#101828] block leading-tight">{owner.name}</span>
                          <span className="text-[11px] text-[#667085] flex items-center gap-1">{owner.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-2">
                        <div
                          className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center font-semibold text-[10px] text-white shrink-0"
                          style={{ backgroundColor: owner.gymColor }}
                        >
                          {owner.gymInitial}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#101828]">{owner.gym}</div>
                          <div className="text-[10.5px] text-[#667085]">Primary Facility</div>
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-1 text-[#101828] font-medium text-xs">
                        <a href={`tel:${owner.phone.replace(/[^0-9+]/g, '')}`} className="text-[#101828] hover:text-[#116dff] no-underline">
                          {owner.phone}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(owner.phone, 'Phone')}
                          className="text-[#98a2b3] hover:text-[#116dff] hover:bg-slate-100 p-0.5 rounded cursor-pointer border-none bg-transparent"
                          title="Copy Phone"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {owner.status === 'Approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#12b76a]"></span>
                          <span>Approved</span>
                        </span>
                      )}
                      {owner.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#fffaeb] text-[#b54708] border border-[#fedf89]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f79009]"></span>
                          <span>Pending</span>
                        </span>
                      )}
                      {owner.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#fef3f2] text-[#b42318] border border-[#fecdca]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f04438]"></span>
                          <span>Rejected</span>
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
                          onClick={() => showToast(`Viewing profile: ${owner.name} (${owner.gym})`)}
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
        <div>Showing 1 to {filteredOwners.length} of {owners.length} gym owners</div>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-[#d0d5dd] rounded-md px-3 py-1 text-xs font-semibold text-[#475467] opacity-50 cursor-not-allowed" disabled>
            Previous
          </button>
          <span className="font-semibold px-1">1</span>
          <button className="bg-white border border-[#d0d5dd] rounded-md px-3 py-1 text-xs font-semibold text-[#475467] opacity-50 cursor-not-allowed" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOwners;
