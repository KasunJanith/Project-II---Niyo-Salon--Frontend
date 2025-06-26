import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircle,
  Info,
} from "lucide-react";
import axios from "axios";
import logo from "../../assets/Niyo Logo 02.jpg";
import salonImage from "../../assets/Register/RegisterBg.jpg";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState<string>("customer");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation states
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return "Weak";
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/) && pwd.length >= 8)
      return "Strong";
    return "Medium";
  };
  const passwordStrength = getPasswordStrength(password);

  // Real-time validation
  const validateName = (val: string) => {
    setName(val);
    setNameError(val.trim().length < 2 ? "Name is too short" : "");
  };
  const validatePhone = (val: string) => {
    setPhoneNumber(val);
    setPhoneError(
      !/^94\d{9}$/.test(val) ? "Format: 94XXXXXXXXX (11 digits)" : ""
    );
  };
  const validatePassword = (val: string) => {
    setPassword(val);
    setPasswordError(val.length < 6 ? "At least 6 characters" : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess("");
    if (!name || !phoneNumber || !password || !agree) {
      setSubmitError("Please fill all fields and agree to the terms.");
      return;
    }
    if (nameError || phoneError || passwordError) {
      setSubmitError("Please fix the errors above.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        { name, phoneNumber, password, role },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200 || response.status === 201) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        setSubmitError("Registration failed.");
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setSubmitError(err.response.data.message);
      } else {
        setSubmitError("Registration failed due to a network error.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="py-10 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl bg-[#181511]/90 backdrop-blur-md border border-[#23201a]">
        {/* Left Panel: Registration Form */}
        <div className="md:w-1/2 w-full flex items-center justify-center py-12 px-6 bg-transparent bg-[#151515]">
          <div className="w-full max-w-md mx-auto bg-[#151515] backdrop-blur-md rounded-2xl shadow-xl px-8 py-10 border border-[#23201a]">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold font-inter text-yellow-400 tracking-tight mb-1">
                Sign up
              </h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-yellow-300 mb-1"
                >
                  Name<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-yellow-400" />
                  </span>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => validateName(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 rounded-lg bg-[#151515] border transition-all duration-200 shadow-sm
                      ${
                        nameError
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#FFC20A] focus:border-yellow-400"
                      }
                      text-yellow-100 placeholder-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                    placeholder="Enter your name"
                    required
                    aria-invalid={!!nameError}
                  />
                  {nameError && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={16} /> {nameError}
                    </span>
                  )}
                </div>
              </div>
              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-yellow-300 mb-1"
                >
                  Phone Number<span className="text-red-500">*</span>
                  <span
                    className="ml-1 text-yellow-500"
                    title="Format: 94XXXXXXXXX"
                  >
                    <Info
                      size={14}
                      className="inline-block align-text-bottom"
                    />
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-yellow-400" />
                  </span>
                  <input
                    type="text"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => validatePhone(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 rounded-lg bg-[#151515] border transition-all duration-200 shadow-sm
                      ${
                        phoneError
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#FFC20A] focus:border-yellow-400"
                      }
                      text-yellow-100 placeholder-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                    placeholder="94XXXXXXXXX"
                    required
                    aria-invalid={!!phoneError}
                  />
                  {phoneError && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={16} /> {phoneError}
                    </span>
                  )}
                </div>
              </div>
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-yellow-300 mb-1"
                >
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-yellow-400" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-2 rounded-lg bg-[#151515] border transition-all duration-200 shadow-sm
                      ${
                        passwordError
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#FFC20A] focus:border-yellow-400"
                      }
                      text-yellow-100 placeholder-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                    placeholder="Create a password"
                    required
                    aria-invalid={!!passwordError}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-yellow-400 hover:text-yellow-600 transition"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon size={18} />
                    ) : (
                      <EyeIcon size={18} />
                    )}
                  </button>
                  {/* Password strength meter */}
                  {password && (
                    <span
                      className={`absolute right-10 top-1/2 -translate-y-1/2 text-xs font-semibold
                      ${
                        passwordStrength === "Weak"
                          ? "text-red-400"
                          : passwordStrength === "Medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {passwordStrength}
                    </span>
                  )}
                  {passwordError && (
                    <span className="absolute right-3 bottom-[-1.5rem] text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={16} /> {passwordError}
                    </span>
                  )}
                </div>
              </div>
              {/* Terms and Conditions */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none text-yellow-200">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agree}
                    onChange={() => setAgree(!agree)}
                    className="form-checkbox h-4 w-4 rounded border-yellow-900 bg-[#23201a] text-yellow-400 focus:ring-yellow-400 transition"
                    aria-checked={agree}
                    required
                  />
                  <span>
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-yellow-400 underline hover:text-yellow-300 transition"
                      tabIndex={0}
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-yellow-400 underline hover:text-yellow-300 transition"
                      tabIndex={0}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
              {/* Error/Success Message */}
              {submitError && (
                <div className="flex items-center gap-2 bg-red-900/80 text-yellow-200 rounded-lg px-4 py-2 shadow animate-fade-in mb-2 mt-2">
                  <AlertCircle size={20} />
                  <span>{submitError}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 bg-green-900/80 text-green-200 rounded-lg px-4 py-2 shadow animate-fade-in mb-2 mt-2">
                  <span>{success}</span>
                </div>
              )}
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-md hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 flex items-center justify-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                )}
                Create Account
              </button>
              {/* Social Login */}
              <button
                type="button"
                className="w-full py-2 rounded-lg bg-[#23201a] text-yellow-200 font-semibold shadow hover:bg-yellow-900/30 hover:text-yellow-400 transition-all flex items-center justify-center gap-2"
                aria-label="Sign up with Google"
                disabled
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                  className="mr-2"
                >
                  <g>
                    <path
                      fill="#4285F4"
                      d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7.5-10.3 7.5-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.1-6.1C35.1 6.5 29.8 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.6 0 5 .9 6.9 2.4l6.1-6.1C35.1 6.5 29.8 4 24 4c-7.1 0-13.2 3.1-17.7 8.1z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 44c5.8 0 11.1-2.2 15.1-5.9l-7-5.7c-2 1.4-4.5 2.2-7.1 2.2-4.6 0-8.7-3.2-10.3-7.5l-6.9 5.3C10.8 39.9 17 44 24 44z"
                    />
                    <path
                      fill="#EA4335"
                      d="M43.6 20.5h-1.9V20H24v8h11.3c-.7 2-2.1 3.8-3.8 5l7 5.7C41.9 41.1 44 37 44 32c0-1.3-.1-2.7-.4-4z"
                    />
                  </g>
                </svg>
                Sign up with Google
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-yellow-200">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-yellow-400 hover:text-yellow-300 transition"
                >
                  Log in
                </Link>
              </p>
            </div>
            <div className="flex items-center justify-between mt-8 text-xs text-yellow-200/60">
              <span>© Niyo {new Date().getFullYear()}</span>
              <span>
                <a
                  href="mailto:info@niyo.salon"
                  className="hover:text-yellow-400 transition"
                >
                  info@niyo.salon
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Branding Image */}
        <div className="md:w-1/2 w-full relative min-h-[350px] md:min-h-[600px] flex items-center justify-center">
          <img
            src={salonImage}
            alt="Salon"
            className="absolute inset-0 w-full h-full object-cover grayscale"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-gray-900/40" />
          <div className="pt-40 relative z-10 flex flex-col items-center  w-full h-full">
            <img
              src={logo}
              alt="Niyo Salon Logo"
              className="w-24 h-24 rounded-md shadow-lg mb-3 border-2 border-[#FFC20A] bg-black object-contain"
            />
            <p className="text-white drop-shadow font-semibold font-inter text-3xl px-10 py-10 text-center">
              <i>Join Niyo Salon and experience premium services.</i>
            </p>  
          </div>
          
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
