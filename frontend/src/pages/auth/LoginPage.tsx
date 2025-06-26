import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';
import logo from '../../assets/Niyo Logo 02.jpg'; // Use your provided logo
import salonImage from '../../assets/Login/LoginBg.jpg';

const roles = [
  { label: 'Customer', value: 'customer' },
  { label: 'Staff', value: 'staff' },
  { label: 'Admin', value: 'admin' },
];

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<{ phone?: boolean; password?: boolean }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (role: string) => {
    setUserType(role);
    setError('');
    setFieldError({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError({});
    let hasError = false;
    if (!phoneNumber) {
      setFieldError((prev) => ({ ...prev, phone: true }));
      hasError = true;
    }
    if (!password) {
      setFieldError((prev) => ({ ...prev, password: true }));
      hasError = true;
    }
    if (hasError) return;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { phoneNumber, password, role: userType },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const role = response.data.user.role;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', role);
        location.reload();
        navigate(`/dashboard/${role}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      if (err.response?.data?.message?.toLowerCase().includes('phone')) {
        setFieldError((prev) => ({ ...prev, phone: true }));
      }
      if (err.response?.data?.message?.toLowerCase().includes('password')) {
        setFieldError((prev) => ({ ...prev, password: true }));
      }
    }
  };

  // Simulate forgot password (replace with real logic)
  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotOpen(false);
      setForgotSent(false);
      setForgotPhone('');
    }, 2000);
  };

  return (
    <div className="min-h-screen py-10 bg-black flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#181511] shadow-lg mb-3 border-1 border-white">
        {/* Left Panel: Salon Image with dark overlay */}
        <div className="md:w-1/2 w-full relative min-h-[350px] md:min-h-[600px] flex items-center justify-center">
          <img
            src={salonImage}
            alt="Salon"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-gray-900/40" />
        </div>

        {/* Right Panel: Login Form */}
        <div className="md:w-1/2 w-full flex items-center justify-center py-12 px-6 bg-[#151515]">
          <div className="w-full max-w-md mx-auto bg-[#151515]  shadow-xl px-8 py-10 border border-[#23201a] rounded-2xl">
            {/* Logo and tagline */}
            <div className="flex flex-col items-center mb-8">
              <img src={logo} alt="Niyo Salon Logo" className="w-24 h-24 rounded-md shadow-lg mb-3 border-2 border-[#FFC20A] bg-black object-contain"/>
              <h1 className="text-3xl font-inter font-extrabold text-white tracking-tight mb-1">Niyo Salon</h1>
              <p className="text-gray-300 text-base mb-2"><i>Experience Style and Comfort</i></p>
            </div>

            {/* Role selection */}
            <div className="flex justify-center gap-2 mb-8">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  aria-label={role.label}
                  className={`transition-all duration-300 px-5 py-2 rounded-md font-semibold text-sm focus:outline-none
                    ${userType === role.value
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg scale-105"
                      : "bg-[#151515] text-yellow-300 hover:bg-yellow-900/30 hover:text-yellow-400"
                    }`}
                  onClick={() => handleRoleChange(role.value)}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-yellow-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-yellow-400" />
                  </span>
                  <input
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 rounded-lg bg-[#151515] border transition-all duration-200 shadow-sm
                      ${fieldError.phone ? "border-[#]focus:border-red-500" : "border-[#FFC20A] focus:border-yellow-400"}
                      text-yellow-100 placeholder-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                    placeholder="Enter your phone number"
                    required
                    aria-invalid={!!fieldError.phone}
                    aria-describedby={fieldError.phone ? "phone-error" : undefined}
                  />
                  {fieldError.phone && (
                    <span id="phone-error" className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </span>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-yellow-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-yellow-400" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-2 rounded-lg bg-[#151515] border transition-all duration-200 shadow-sm
                      ${fieldError.password ? "border-red-400 focus:border-red-500" : "border-[#FFC20A] focus:border-yellow-400"}
                      text-yellow-100 placeholder-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                    placeholder="Enter your password"
                    required
                    aria-invalid={!!fieldError.password}
                    aria-describedby={fieldError.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-yellow-400 hover:text-yellow-600 transition"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                  {fieldError.password && (
                    <span id="password-error" className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </span>
                  )}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-900/80 text-yellow-200 rounded-lg px-4 py-2 shadow animate-fade-in mb-2">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-yellow-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="form-checkbox h-4 w-4 rounded border-yellow-900 bg-[#23201a] text-yellow-400 focus:ring-yellow-400 transition"
                    aria-checked={rememberMe}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-yellow-400 hover:underline hover:text-yellow-300 transition"
                  onClick={() => setForgotOpen(true)}
                  tabIndex={0}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-md hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                Sign In
              </button>
            </form>

            {/* Social Login (Optional) */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                className="w-full py-2 rounded-lg bg-[#23201a] text-yellow-200 font-semibold shadow hover:bg-yellow-900/30 hover:text-yellow-400 transition-all flex items-center justify-center gap-2"
                aria-label="Sign in with Google"
                disabled
              >
                <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7.5-10.3 7.5-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.1-6.1C35.1 6.5 29.8 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/><path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.6 0 5 .9 6.9 2.4l6.1-6.1C35.1 6.5 29.8 4 24 4c-7.1 0-13.2 3.1-17.7 8.1z"/><path fill="#FBBC05" d="M24 44c5.8 0 11.1-2.2 15.1-5.9l-7-5.7c-2 1.4-4.5 2.2-7.1 2.2-4.6 0-8.7-3.2-10.3-7.5l-6.9 5.3C10.8 39.9 17 44 24 44z"/><path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-.7 2-2.1 3.8-3.8 5l7 5.7C41.9 41.1 44 37 44 32c0-1.3-.1-2.7-.4-4z"/></g></svg>
                Sign in with Google
              </button>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-yellow-200">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-yellow-400 hover:text-yellow-300 transition">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#181511] rounded-2xl shadow-2xl p-8 w-full max-w-sm relative border border-yellow-400">
            <button
              className="absolute top-3 right-3 text-yellow-400 hover:text-yellow-200 transition"
              onClick={() => setForgotOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-yellow-400 mb-2">Forgot Password?</h2>
            <p className="text-yellow-200 mb-4 text-sm">
              Enter your phone number and we'll send you a reset link.
            </p>
            {forgotSent ? (
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                Reset link sent!
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <input
                  type="text"
                  value={forgotPhone}
                  onChange={e => setForgotPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#23201a] border border-yellow-400 text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Phone Number"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold shadow hover:from-yellow-500 hover:to-yellow-700 transition-all"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;