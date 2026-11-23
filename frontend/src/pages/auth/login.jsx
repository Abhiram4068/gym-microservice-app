import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, setUserData } from '../../utils/tokenStorage';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'admin@wixstudio.com',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Set auth state
      const token = 'demo_superadmin_token_' + Date.now();
      const user = {
        email: formData.email,
        role: 1,
        name: 'SuperAdmin'
      };

      setToken(token);
      setUserData(user);

      navigate('/superadmin/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] bg-white border border-[#dfe5eb] rounded-[10px] p-8 sm:p-9 shadow-xs">
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
              value={formData.email}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full h-10 px-3.5 bg-white border border-[#dfe5eb] rounded-lg text-[13.5px] text-[#161b22] outline-none transition duration-150 focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15 placeholder:text-[#8692a6]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 bg-[#116dff] hover:bg-[#0057e6] text-white rounded-full text-[13.5px] font-semibold transition duration-150 flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
