import React from 'react';
import { Link } from 'react-router-dom';
import { getUserData } from '../../utils/tokenStorage';

const GymOwnerDashboard = () => {
  const user = getUserData();
  const ownerName = user?.firstName || 'Owner';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#dce4f0] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a]">
            Hi, {ownerName} 👋
          </h1>
          <p className="text-[13.5px] text-[#64748b] mt-1 font-medium">
            Welcome to the management portal for{' '}
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

      {/* Main Overview Welcome Container */}
      <div className="bg-white border border-[#dce4f0] rounded-2xl p-7 sm:p-10 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 bg-[#ecfdf3] text-[#12b76a] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-[#a6f4c5]">
          ✓
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4ff] text-[#116dff] border border-[#d0e1fd] mb-1">
            <span>🎉 Gym Portal Activated</span>
          </div>
          <h2 className="text-xl font-bold text-[#0f172a]">
            Ready to set up your gym operations
          </h2>
          <p className="text-[13.5px] text-[#475467] max-w-lg mx-auto leading-relaxed">
            Your gym account is verified and ready. Start by adding your receptionists so they can log in, register members, and manage front-desk activities.
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
          <Link
            to="/owner/receptionists/add"
            className="p-5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl transition group no-underline"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                👤+
              </div>
              <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#116dff] transition">
                Add Receptionist
              </h3>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Create login credentials for your front-desk staff to handle check-ins.
            </p>
          </Link>

          <Link
            to="/owner/receptionists"
            className="p-5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl transition group no-underline"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                📋
              </div>
              <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#116dff] transition">
                Manage Staff
              </h3>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              View your existing receptionists, check statuses, or manage access.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GymOwnerDashboard;
