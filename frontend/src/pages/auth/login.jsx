import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { getUserRole } from '../../utils/tokenStorage';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@wixstudio.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authApi.login(email, password);
      if (result.success) {
        // Decode token or user data to get role
        const roleNum = getUserRole();

        if (roleNum === 1) {
          navigate('/admin/dashboard');
        } else if (roleNum === 2) {
          navigate('/manager/dashboard');
        } else if (roleNum === 3) {
          navigate('/employee/dashboard');
        } else {
          setError('Unable to determine user role.');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] bg-white border border-[#dfe5eb] rounded-[10px] p-8 sm:p-9 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <h1 className="font-extrabold text-[26px] tracking-[-0.6px] text-black leading-tight mb-1">
            WIX
          </h1>
          <p className="text-[13.5px] font-medium text-[#596573]">
            Superadmin Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[12.5px] font-semibold text-[#161b22] mb-1.5"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wixstudio.com"
              required
              className="w-full h-10 px-3.5 bg-white border border-[#dfe5eb] rounded-lg text-[13.5px] text-[#161b22] outline-none transition duration-150 focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15 placeholder:text-[#8692a6]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[12.5px] font-semibold text-[#161b22] mb-1.5"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-10 px-3.5 bg-white border border-[#dfe5eb] rounded-lg text-[13.5px] text-[#161b22] outline-none transition duration-150 focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15 placeholder:text-[#8692a6]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 mt-2 bg-[#116dff] hover:bg-[#0057e6] text-white rounded-full text-[13.5px] font-semibold transition duration-150 flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
