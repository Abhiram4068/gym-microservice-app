import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/auth";
import {
  getUserRole,
  isAuthenticated,
  UserRole,
} from "../../utils/tokenStorage";

const GymLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  const isSessionExpired = new URLSearchParams(location.search).get("expired") === "true";
  const notification = !notificationDismissed && isSessionExpired
    ? "Your session has expired. Please log in again."
    : "";

  // Redirect if already logged in as gym owner/staff
  useEffect(() => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === UserRole.GymOwner) {
        navigate("/owner/dashboard", { replace: true });
      } else if (role === UserRole.Receptionist) {
        navigate("/receptionist/dashboard", { replace: true });
      } else if (role === UserRole.Trainer) {
        navigate("/trainer/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsPendingApproval(false);
    setNotificationDismissed(true);
    setIsLoading(true);

    try {
      const result = await authApi.gymLogin(email.trim(), password);

      if (result.success) {
        const roleNum = getUserRole();

        if (roleNum === UserRole.GymOwner) {
          const redirectTo = location.state?.from?.pathname || "/owner/dashboard";
          navigate(redirectTo, { replace: true });
        } else if (roleNum === UserRole.Receptionist) {
          navigate("/receptionist/dashboard", { replace: true });
        } else if (roleNum === UserRole.Trainer) {
          navigate("/trainer/dashboard", { replace: true });
        } else {
          navigate("/owner/dashboard", { replace: true });
        }
      } else {
        const errMsg = result.message || "Failed to sign in. Please verify your credentials.";
        setError(errMsg);
        if (errMsg.toLowerCase().includes("pending")) {
          setIsPendingApproval(true);
        }
      }
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf2fd] via-[#f3f7fd] to-[#ffffff] flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased text-[#101828]">
      <div className="w-full max-w-[420px] bg-white border border-[#dce4f0] rounded-2xl p-8 sm:p-9 shadow-xl shadow-slate-200/60">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white mb-3 shadow-lg shadow-blue-500/25">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Gym Portal Login
          </h1>
          <p className="text-[13px] text-[#64748b] mt-1 font-medium">
            Sign in to manage your gym operations
          </p>
        </div>

        {/* Notifications */}
        {notification && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{notification}</span>
          </div>
        )}

        {/* Pending Approval Notice */}
        {isPendingApproval ? (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-xs text-amber-800">
              <span className="text-sm">⏳</span>
              <span>Account Pending Approval</span>
            </div>
            <p className="text-[12px] leading-relaxed text-amber-700">
              Your gym registration has been submitted and is currently awaiting SuperAdmin review. Once approved, you will be able to access your dashboard.
            </p>
          </div>
        ) : error ? (
          /* General Error Alert */
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
            <svg
              className="w-4 h-4 shrink-0 text-red-500 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
            </svg>
            <span className="leading-tight">{error}</span>
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="gym-email"
              className="block text-[12.5px] font-semibold text-[#1e293b] mb-1.5"
            >
              Email Address
            </label>
            <input
              type="email"
              id="gym-email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@yourgym.com"
              required
              disabled={isLoading}
              className="w-full h-10 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition duration-150 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 placeholder:text-[#94a3b8] disabled:bg-slate-50 disabled:opacity-75"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="gym-password"
                className="block text-[12.5px] font-semibold text-[#1e293b]"
              >
                Password
              </label>
            </div>
            <input
              type="password"
              id="gym-password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full h-10 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition duration-150 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 placeholder:text-[#94a3b8] disabled:bg-slate-50 disabled:opacity-75"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 mt-2 bg-[#116dff] hover:bg-[#0b5de6] text-white font-semibold text-[13.5px] rounded-lg transition duration-150 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              "Sign In to Gym Portal"
            )}
          </button>
        </form>

        {/* Register Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
          <p className="text-[13px] text-[#475467]">
            Don't have a gym account?{" "}
            <Link
              to="/register"
              className="text-[#116dff] hover:underline font-semibold"
            >
              Register your gym
            </Link>
          </p>
          <p className="text-[11.5px] text-[#94a3b8]">
            Platform Administrator?{" "}
            <Link
              to="/superadmin/login"
              className="text-[#64748b] hover:text-[#0f172a] hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GymLogin;
