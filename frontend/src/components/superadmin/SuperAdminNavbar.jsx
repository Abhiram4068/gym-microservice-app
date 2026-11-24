import React from 'react';
import { Link } from 'react-router-dom';

const SuperAdminNavbar = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-[54px] bg-white border-b border-[#eaecf0] flex items-center justify-between px-[18px] z-50">
      <div className="flex items-center gap-[18px]">
        <Link to="/admin/dashboard" className="font-extrabold text-[21px] tracking-[-0.5px] text-black no-underline flex items-center">
          WIX
        </Link>
        <div className="flex items-center gap-1.5 text-[13.5px] font-medium text-[#101828] cursor-pointer px-2 py-1.5 rounded-md hover:bg-[#f4f6f8] transition">
          <span>Superadmin</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[13.5px] font-medium text-[#101828] cursor-pointer px-2 py-1.5 rounded-md hover:bg-[#f4f6f8] transition">
          <span>Explore</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <a href="#discover" className="hidden md:inline text-[13.5px] font-medium text-[#101828] no-underline hover:text-[#116dff] transition">
          Discover Wix Studio
        </a>
        <div className="hidden sm:flex items-center gap-1.5 text-[13.5px] font-medium text-[#101828] cursor-pointer px-2 py-1.5 rounded-md hover:bg-[#f4f6f8] transition">
          <span>Help</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <button className="bg-[#8833ff] hover:opacity-90 text-white border-none rounded-full px-4 py-1.5 text-[13px] font-semibold cursor-pointer transition">
          Upgrade
        </button>
      </div>

      <div className="flex-1 max-w-[440px] mx-6 hidden lg:block">
        <div className="relative w-full">
          <svg className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#4f81c7] w-[15px] height-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search for tools, gym owners, phone, email..."
            className="w-full h-9 bg-[#f1f5f9] border border-transparent rounded-full pl-[38px] pr-4 text-[13px] text-[#101828] outline-none transition focus:bg-white focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15 placeholder:text-[#6b7b8f]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <button className="p-1.5 text-[#101828] hover:bg-[#f1f5f9] rounded-full transition" title="Messages">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button className="relative p-1.5 text-[#101828] hover:bg-[#f1f5f9] rounded-full transition" title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="absolute top-[1px] right-[1px] bg-[#e11d48] text-white text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1">
            3
          </span>
        </button>
        <button className="p-1.5 text-[#101828] hover:bg-[#f1f5f9] rounded-full transition hidden sm:inline-flex" title="Announcements">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
        </button>
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-[30px] h-[30px] rounded-full bg-[#dbeafe] text-[#1e40af] flex items-center justify-center font-bold text-xs">
            SA
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <button className="bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-white border-none rounded-lg px-3.5 py-[7px] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm">
          <span>✦ AI</span>
        </button>
      </div>
    </header>
  );
};

export default SuperAdminNavbar;
