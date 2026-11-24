import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/auth";
import {
  getUserRole,
  isAuthenticated,
  UserRole,
} from "../../utils/tokenStorage";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@gymapp.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Check if user is already logged in or session expired query param present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("expired") === "true") {
      setNotification("Your session has expired. Please log in again.");
    }

    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === UserRole.SuperAdmin) {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotification("");
    setIsLoading(true);

    try {
      const result = await authApi.login(email.trim(), password);

      if (result.success) {
        const roleNum = getUserRole();

        if (roleNum === UserRole.SuperAdmin) {
          const redirectTo =
            location.state?.from?.pathname || "/admin/dashboard";
          navigate(redirectTo, { replace: true });
        } else if (roleNum === UserRole.GymOwner) {
          navigate("/owner/dashboard", { replace: true });
        } else if (roleNum === UserRole.Receptionist) {
          navigate("/receptionist/dashboard", { replace: true });
        } else if (roleNum === UserRole.Trainer) {
          navigate("/trainer/dashboard", { replace: true });
        } else {
          setError("User authenticated, but role permission is unrecognized.");
        }
      } else {
        setError(result.message);
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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white border border-gray-100 rounded-xl p-8 sm:p-9 shadow-xl shadow-slate-100">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <h1 className="font-extrabold text-[24px] tracking-[-0.5px] text-[#0f172a] leading-tight mb-1">
            Super Admin Portal
          </h1>
          <p className="text-[13px] font-medium text-[#64748b]">
            Sign in to manage the platform
          </p>
        </div>

        {/* Notifications */}
        {notification && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
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

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
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
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[12.5px] font-semibold text-[#1e293b] mb-1.5"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gymapp.com"
              required
              disabled={isLoading}
              className="w-full h-10 px-3.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] outline-none transition duration-150 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 placeholder:text-[#94a3b8] disabled:bg-slate-50 disabled:opacity-75"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-[12.5px] font-semibold text-[#1e293b]"
              >
                Password
              </label>
            </div>
            <input
              type="password"
              id="password"
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
            className="w-full h-10 mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-[13.5px] rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11.5px] text-[#64748b]">
            Platform Administration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
