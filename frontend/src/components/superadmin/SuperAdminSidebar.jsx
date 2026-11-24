import React from 'react';
import { NavLink } from 'react-router-dom';

const SuperAdminSidebar = () => {
  return (
    <aside className="fixed top-[54px] left-0 bottom-0 w-[224px] bg-[#161b22] text-[#e2e8f0] flex flex-col z-40 overflow-hidden select-none">
      <button className="absolute top-3.5 -right-3 w-6 h-6 rounded-full bg-[#475569] text-white border-2 border-[#f4f6fa] flex items-center justify-center cursor-pointer text-[11px]" title="Collapse sidebar">
        ‹
      </button>

      <div className="p-3.5 pb-2.5 flex items-center gap-2">
        <button className="flex-1 bg-white text-[#101828] border-none rounded-full h-8 px-3.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
          <span>Quick Actions</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <button className="w-8 h-8 rounded-full bg-transparent border border-[#334155] text-[#cbd5e1] flex items-center justify-center cursor-pointer hover:border-slate-400" title="Favorites">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
      </div>

      <div className="px-4 py-2.5 pb-3.5 border-b border-[#262e3a]">
        <div className="flex items-center justify-between text-[12.5px] font-semibold text-white mb-2">
          <span>Let's set up your business</span>
          <span>›</span>
        </div>
        <div className="h-1 bg-[#2f3846] rounded-full overflow-hidden mb-2">
          <div className="w-[40%] h-full bg-[#5b8def] rounded-full"></div>
        </div>
        <div className="text-[11.5px] text-[#94a3b8]">2/5 completed</div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-1">
        <NavLink
          to="/admin/setup"
          className={({ isActive }) =>
            `flex items-center justify-between px-4 py-[9px] text-[13px] font-medium no-underline transition ${
              isActive ? 'bg-[#333a45] text-white font-semibold' : 'text-[#cbd5e1] hover:bg-[#212832] hover:text-white'
            }`
          }
        >
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>Setup</span>
          </span>
        </NavLink>

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center justify-between px-4 py-[9px] text-[13px] font-medium no-underline transition ${
              isActive ? 'bg-[#333a45] text-white font-semibold' : 'text-[#cbd5e1] hover:bg-[#212832] hover:text-white'
            }`
          }
        >
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span>Home</span>
          </span>
        </NavLink>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
            <span>AI Agents</span>
          </span>
          <span className="bg-[#f59e0b] text-[#161b22] text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-tight">NEW</span>
        </a>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Booking Calendar</span>
          </span>
          <span>›</span>
        </a>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 6v2m0 8v2"/></svg>
            <span>Sales</span>
          </span>
          <span>›</span>
        </a>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>
            <span>Catalog</span>
          </span>
          <span>›</span>
        </a>

        <NavLink
          to="/admin/owners"
          className={({ isActive }) =>
            `flex items-center justify-between px-4 py-[9px] text-[13px] font-medium no-underline transition ${
              isActive ? 'bg-[#333a45] text-white font-semibold' : 'text-[#cbd5e1] hover:bg-[#212832] hover:text-white'
            }`
          }
        >
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Gym Owners</span>
          </span>
          <span>›</span>
        </NavLink>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
            <span>Blog</span>
          </span>
          <span>›</span>
        </a>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Portfolio</span>
          </span>
        </a>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Apps</span>
          </span>
          <span className="bg-[#334155] text-[#e2e8f0] text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">1</span>
        </a>

        <div className="h-[1px] bg-[#262e3a] my-2"></div>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            <span>Site & Mobile App</span>
          </span>
          <span>›</span>
        </a>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span>Analytics</span>
          </span>
          <span>›</span>
        </a>

        <a className="flex items-center justify-between px-4 py-[9px] text-[13px] font-medium text-[#cbd5e1] hover:bg-[#212832] hover:text-white cursor-pointer transition">
          <span className="flex items-center gap-[11px]">
            <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Settings</span>
          </span>
        </a>
      </nav>

      <div className="border-t border-[#262e3a] p-3 flex items-center justify-center gap-2 text-[#e2e8f0] text-[13px] font-medium cursor-pointer hover:bg-[#212832] transition">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <span>Edit Site</span>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
