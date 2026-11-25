import { getUserData } from '../../utils/tokenStorage';
import { authApi } from '../../api/auth';

const GymOwnerNavbar = ({ onToggleMobileSidebar }) => {
  const user = getUserData();

  const handleLogout = async () => {
    await authApi.logout();
  };

  const initials = `${user?.firstName?.[0] || 'G'}${user?.lastName?.[0] || 'O'}`.toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] z-50 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand / Gym Info */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-slate-100 transition"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand Icon & Gym Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0b1727] to-[#116dff] flex items-center justify-center text-white shadow-sm font-bold text-sm">
            🏋️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] tracking-tight text-[#0f172a] leading-none">
                {user?.gymName || 'Gym Management'}
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#64748b]">
              Owner Portal
            </span>
          </div>
        </div>
      </div>

      {/* Right: Owner Profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Owner Profile Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100 sm:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#116dff] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-[13px] font-semibold text-[#0f172a] leading-tight">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[11px] text-[#64748b] font-medium">
              Gym Owner
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#475467] hover:text-[#0f172a] text-xs font-semibold transition shadow-sm cursor-pointer"
          title="Sign out of your gym account"
        >
          <svg className="w-3.5 h-3.5 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default GymOwnerNavbar;
