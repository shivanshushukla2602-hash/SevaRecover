import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  LogIn,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileWarning,
  Search,
  Route,
  ShieldCheck,
  Sparkles,
  Shield,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api-client';

interface AuthPageProps {
  initialStep?: 'LOGIN' | 'REGISTER';
  onLogin?: (data: any) => void;
}

export default function AuthPage({ initialStep = 'LOGIN', onLogin }: AuthPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  const [step, setStep] = useState<'LOGIN' | 'REGISTER' | 'CONFIRM'>(initialStep);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [occupation, setOccupation] = useState('Farmer');
  const [income, setIncome] = useState('250000');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'LOGIN' | 'REGISTER'>(initialStep);
  const [sessionId, setSessionId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('India');

  const indiaStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 
    'Lakshadweep', 'Puducherry'
  ];

  // Custom Inline Validation Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateLoginForm = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Please enter your email or username.';
    if (!password.trim()) errors.password = 'Please enter your password.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!username.trim()) {
      errors.username = 'Citizen name is required.';
    } else if (!/^[A-Za-z\s\-']+$/.test(username)) {
      errors.username = 'Name contains invalid characters.';
    }

    if (!email.trim() || !emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number.';
    }

    if (!stateName) errors.stateName = 'State is required.';
    if (!country) errors.country = 'Country is required.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validateLoginForm()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || email.split('@')[0], email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          // Platform Owner — direct login, no OTP required
          completeLogin(data);
          if (onLogin) onLogin(data);
          const destination = data.user?.grantedRoles?.includes('ADMIN') ? '/admin' : '/dashboard';
          navigate(destination);
        } else if (data.status === 'CONFIRMATION_REQUIRED') {
          // Standard user — proceed to OTP verification
          setOtpPurpose('LOGIN');
          setSessionId(data.session || '');
          setUsername(data.username || username || email.split('@')[0]);
          setStep('CONFIRM');
          setInfoMsg(`A verification code was sent to ${email}. Check your email inbox.`);
        } else {
          setErrorMsg('Unexpected login response.');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMsg(errorData.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMsg('The authentication service is unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!validateRegisterForm()) return;

    setLoading(true);
    const citizenUsername = username || email.split('@')[0] || 'citizen';

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: citizenUsername,
          email,
          password,
          profile: {
            age: 30,
            gender: 'Male',
            income,
            category: 'General',
            state: stateName,
            country: country,
            occupation,
          },
        }),
      });

      if (res.ok) {
        setStep('CONFIRM');
        setOtpPurpose('REGISTER');
        setInfoMsg(`Verification code sent to ${email}. Enter the 6-digit code to verify.`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMsg(errorData.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Register failed:', err);
      setErrorMsg('The registration service is unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otp || otp.length < 6) {
      setFieldErrors({ otp: 'Please enter a valid 6-digit code.' });
      return;
    }

    setLoading(true);
    const citizenUsername = username || email.split('@')[0] || 'citizen';

    try {
      const endpoint = otpPurpose === 'LOGIN' ? '/auth/login' : '/auth/confirm';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          otpPurpose === 'LOGIN'
            ? { username: citizenUsername, email, password, otp, session: sessionId }
            : { username: citizenUsername, email, otp }
        ),
      });

      if (res.ok) {
        if (otpPurpose === 'LOGIN') {
          const data = await res.json();
          if (!data.token) throw new Error('Verification response did not include an authenticated session.');
          completeLogin(data);
          if (onLogin) onLogin(data);
          const destination = location.state?.from || (data.user?.grantedRoles?.includes('ADMIN') ? '/admin' : '/dashboard');
          navigate(destination);
        } else {
          setStep('LOGIN');
          setInfoMsg('Email verified successfully! Sign in with your password.');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || errData.error || 'Invalid OTP code. Please check code and try again.');
      }
    } catch (err) {
      console.error('Confirm failed:', err);
      setErrorMsg('Invalid OTP code or backend offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 lg:py-14 px-4 sm:px-8 text-[#F2F1EC] relative font-body flex items-center justify-center min-h-[calc(100vh-80px)] w-full">
      
      {/* 1. Ambient Background Particle Drift & Soft Gold Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#22C55E]/30 shadow-[0_0_10px_#22C55E]"
            style={{
              top: `${15 + (i * 11) % 70}%`,
              left: `${10 + (i * 13) % 80}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Creative Split-Screen Container */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[min(680px,calc(100vh-10rem))] bg-[#141416] rounded-3xl border border-[rgba(34,197,94,0.25)] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(34,197,94,0.2)] relative z-10">
        
        {/* Left Side: Creative Animated Visual Panel */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5 }}
          className="relative min-w-0 overflow-hidden p-7 sm:p-10 lg:p-12 bg-[#0A0A0B] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[rgba(34,197,94,0.2)]"
        >
          {/* Animated Background Mesh & Gold Radial Pulse */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22C55E]/20 rounded-full blur-[100px]" 
            />
          </div>

          <div className="relative z-10 space-y-6">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 text-[#A8ABB3] hover:text-[#22C55E] transition-colors text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
            <div>
              <span className="eyebrow">CIVIC RECOVERY NETWORK</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-[#F2F1EC] leading-[1.1] tracking-tight">
                Turn a rejection into a <span className="text-[#22C55E]">route forward.</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[#A8ABB3] max-w-md">
                SevaRecover connects your notice to authoritative evidence, then maps the next practical move.
              </p>
            </div>
          </div>

          {/* 2. Animated "Notice -> Route" Diagram Illustration */}
          <div className="relative z-10 my-6 py-5 px-4 bg-[#141416] rounded-2xl border border-[#22C55E]/30 shadow-xl space-y-4">
            
            <div className="relative w-full h-36 bg-[#0A0A0B] rounded-xl border border-[rgba(34,197,94,0.2)] overflow-hidden flex items-center justify-center p-3">
              <svg className="w-full h-full text-[#22C55E]" viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Grid Lines */}
                <path d="M0 20 H320 M0 60 H320 M0 100 H320" stroke="rgba(34,197,94,0.12)" strokeWidth="1" />
                <path d="M40 0 V120 M120 0 V120 M200 0 V120 M280 0 V120" stroke="rgba(34,197,94,0.12)" strokeWidth="1" />
                
                {/* Animated Central Emblem Shield with Pulsing Scale & Glow */}
                <motion.g 
                  transform="translate(130, 20)"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  <polygon points="30,0 60,15 60,50 30,70 0,50 0,15" fill="url(#goldGrad)" opacity="0.25" stroke="#22C55E" strokeWidth="1.5" />
                  <motion.circle 
                    cx="30" cy="35" r="14" fill="#22C55E" opacity="0.2"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <path d="M22 35 L28 41 L38 29" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.g>
                
                {/* Animated Connecting Dashed Lines */}
                <circle cx="50" cy="60" r="8" fill="var(--surface)" stroke="#22C55E" strokeWidth="1.5" />
                <motion.path 
                  d="M58 60 H130" 
                  stroke="#22C55E" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4"
                  initial={{ strokeDashoffset: 40 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                
                <circle cx="270" cy="60" r="8" fill="var(--surface)" stroke="#22C55E" strokeWidth="1.5" />
                <motion.path 
                  d="M190 60 H262" 
                  stroke="#22C55E" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4"
                  initial={{ strokeDashoffset: 40 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />

                {/* Left Badge */}
                <rect x="25" y="45" width="54" height="28" rx="8" fill="var(--surface-alt)" stroke="var(--gold-1)" strokeWidth="1.5" />
                <text x="34" y="63" fill="var(--text-primary)" fontSize="11" fontWeight="bold">Notice</text>

                {/* Right Badge */}
                <rect x="243" y="45" width="54" height="28" rx="8" fill="var(--surface-alt)" stroke="var(--gold-1)" strokeWidth="1.5" />
                <text x="254" y="63" fill="var(--text-primary)" fontSize="11" fontWeight="bold">Route</text>

                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#22C55E" />
                    <stop offset="1" stopColor="#4ADE80" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#22C55E]">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#22C55E]" /> Protected Citizen Session
              </span>
              <span className="text-[10px] uppercase font-mono text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded border border-[#22C55E]/30 font-bold">
                Cognito + Cedar
              </span>
            </div>

            {/* 3. Mini-cards with Staggered Entrance & Lift Hover Animation */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: FileWarning, label: '1. Notice', delay: 0.1 },
                { icon: Search, label: '2. Evidence', delay: 0.2 },
                { icon: Route, label: '3. Recovery', delay: 0.3 },
              ].map(({ icon: Icon, label, delay }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay, duration: 0.4 }}
                  whileHover={{ y: -3, boxShadow: '0 0 16px rgba(34,197,94,0.25)', borderColor: '#22C55E' }}
                  className="bg-[#0A0A0B] p-3 rounded-xl border border-[rgba(34,197,94,0.2)] text-center transition-all cursor-pointer shadow-sm"
                >
                  <Icon className="mx-auto mb-1.5 text-[#22C55E]" size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8ABB3] block">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 5. Animated Icon Row for Trust Badges */}
          <div className="relative z-10 flex items-center justify-center gap-2 text-xs text-[#A8ABB3] bg-[#141416] p-2.5 rounded-xl border border-[rgba(34,197,94,0.2)] shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span className="truncate font-medium">Zero hardcoded backdoors</span>
            <span className="text-[#22C55E]">&bull;</span>
            <Lock className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
            <span className="truncate font-medium">Authentic OTP verification</span>
          </div>
        </motion.aside>

        {/* Right Side: Form Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5 }}
          className="min-w-0 p-7 sm:p-10 lg:p-12 bg-[#141416] flex flex-col justify-center"
        >
          <div className="mb-6">
            <span className="eyebrow">SECURE CITIZEN ACCESS</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-heading font-extrabold text-[#F2F1EC]">
              {step === 'LOGIN' ? 'Citizen Authentication' : step === 'REGISTER' ? 'Register New Account' : 'Verify Email OTP'}
            </h2>
            <p className="mt-1.5 text-xs text-[#A8ABB3]">
              {step === 'LOGIN'
                ? 'Sign in to access your saved analyses & action plans.'
                : step === 'REGISTER'
                ? 'Create a citizen profile to discover schemes & analyze failures.'
                : 'Enter the 6-digit code sent to your email address.'}
            </p>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-300 flex items-center gap-2 font-semibold"
            >
              <AlertCircle size={16} className="shrink-0" /> {errorMsg}
            </motion.div>
          )}

          {infoMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-[#22C55E]/15 border border-[#22C55E]/30 p-3 rounded-xl text-xs text-[#4ADE80] flex items-center gap-2 font-semibold"
            >
              <CheckCircle2 size={16} className="shrink-0" /> {infoMsg}
            </motion.div>
          )}

          {/* Form 1: LOGIN with noValidate and Custom Inline Errors */}
          {step === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">Email or Username</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  className={`bg-[#0A0A0B] text-[#F2F1EC] border rounded-xl p-3 w-full text-xs placeholder:text-[#A8ABB3]/60 outline-none transition-all duration-200 ${
                    fieldErrors.email
                      ? 'border-red-500 ring-1 ring-red-500/30'
                      : 'border-[rgba(34,197,94,0.25)] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30'
                  }`}
                  placeholder="user1@india.gov or user1"
                />
                {/* 4. Custom Inline Validation Message with Subtle Shake Animation */}
                {fieldErrors.email && (
                  <motion.p
                    initial={{ x: -4 }}
                    animate={{ x: [ -4, 4, -2, 2, 0 ] }}
                    transition={{ duration: 0.3 }}
                    className="mt-1 text-[11px] text-red-400 font-semibold flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> {fieldErrors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    className={`bg-[#0A0A0B] text-[#F2F1EC] border rounded-xl p-3 w-full text-xs placeholder:text-[#A8ABB3]/60 outline-none transition-all duration-200 pr-10 ${
                      fieldErrors.password
                        ? 'border-red-500 ring-1 ring-red-500/30'
                        : 'border-[rgba(34,197,94,0.25)] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ABB3] hover:text-[#22C55E] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <motion.p
                    initial={{ x: -4 }}
                    animate={{ x: [ -4, 4, -2, 2, 0 ] }}
                    transition={{ duration: 0.3 }}
                    className="mt-1 text-[11px] text-red-400 font-semibold flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> {fieldErrors.password}
                  </motion.p>
                )}
              </div>

              {/* 4. Button Press Animation */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-[#052E16] p-3.5 rounded-xl font-heading font-bold text-sm transition-all hover:bg-[#16A34A] disabled:opacity-50 cursor-pointer mt-2"
              >
                <LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In & Request OTP'}
              </button>

              {/* Quick Demo Credentials */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <span className="text-[10px] font-semibold text-[#A8ABB3] uppercase tracking-wider text-center">One-Click Demo Credentials</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('shivanshushukla1919@gmail.com');
                      setPassword('shivanshu2602');
                      setFieldErrors({});
                    }}
                    className="p-2.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-left hover:bg-[#22C55E]/20 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#22C55E] flex items-center gap-1">🛡️ Owner (No OTP)</div>
                    <div className="text-[10px] text-[#A8ABB3] truncate mt-0.5">Instant all-role access</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('ananya@india.gov');
                      setPassword('citizen123');
                      setFieldErrors({});
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#F2F1EC] flex items-center gap-1">👤 Citizen Role</div>
                    <div className="text-[10px] text-[#A8ABB3] truncate mt-0.5">ananya@india.gov</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Form 2: REGISTER */}
          {step === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">Username / Citizen Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#0A0A0B] text-[#F2F1EC] placeholder:text-[#A8ABB3]/60 border border-[rgba(34,197,94,0.25)] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30 rounded-xl p-3 w-full text-xs outline-none transition-all"
                  placeholder="e.g. ananya"
                />
                {fieldErrors.username && (
                  <motion.p initial={{ x: -4 }} animate={{ x: [ -4, 4, 0 ] }} className="mt-1 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.username}
                  </motion.p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0A0A0B] text-[#F2F1EC] placeholder:text-[#A8ABB3]/60 border border-[rgba(34,197,94,0.25)] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30 rounded-xl p-3 w-full text-xs outline-none transition-all"
                  placeholder="ananya@india.gov"
                />
                {fieldErrors.email && (
                  <motion.p initial={{ x: -4 }} animate={{ x: [ -4, 4, 0 ] }} className="mt-1 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.email}
                  </motion.p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#0A0A0B] text-[#F2F1EC] placeholder:text-[#A8ABB3]/60 border border-[rgba(34,197,94,0.25)] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30 rounded-xl p-3 w-full text-xs outline-none transition-all pr-10"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ABB3] hover:text-[#22C55E] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <motion.p initial={{ x: -4 }} animate={{ x: [ -4, 4, 0 ] }} className="mt-1 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.password}
                  </motion.p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">Country</label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (e.target.value !== 'India') setStateName(''); // Clear state if not India
                    }}
                    className="bg-[#0A0A0B] text-[#F2F1EC] border border-[rgba(34,197,94,0.25)] rounded-xl p-3 w-full text-xs focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30 outline-none transition-all"
                  >
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">State / UT</label>
                  {country === 'India' ? (
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="bg-[#0A0A0B] text-[#F2F1EC] border border-[rgba(34,197,94,0.25)] rounded-xl p-3 w-full text-xs focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30 outline-none transition-all"
                    >
                      <option value="" disabled>Select State</option>
                      {indiaStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="bg-[#0A0A0B] text-[#F2F1EC] placeholder:text-[#A8ABB3]/60 border border-[rgba(34,197,94,0.25)] rounded-xl p-3 w-full text-xs focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30 outline-none transition-all"
                      placeholder="State/Region"
                    />
                  )}
                  {fieldErrors.stateName && (
                    <motion.p initial={{ x: -4 }} animate={{ x: [ -4, 4, 0 ] }} className="mt-1 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.stateName}
                    </motion.p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">Occupation</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="bg-[#0A0A0B] text-[#F2F1EC] border border-[rgba(34,197,94,0.25)] rounded-xl p-3 w-full text-xs focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30 outline-none transition-all"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Student">Student</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Salaried IT Employee">Salaried IT Employee</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-[#052E16] p-3.5 rounded-xl font-heading font-bold text-sm transition-all hover:bg-[#16A34A] disabled:opacity-50 cursor-pointer mt-2"
              >
                <UserPlus size={16} /> {loading ? 'Registering...' : 'Register & Request Verification OTP'}
              </button>
            </form>
          )}

          {/* Form 3: CONFIRM */}
          {step === 'CONFIRM' && (
            <form onSubmit={handleConfirmSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#F2F1EC] mb-1.5">Enter 6-Digit Verification Code (OTP)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-[#0A0A0B] text-[#22C55E] border border-[#22C55E]/40 rounded-xl p-3.5 w-full text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#22C55E] placeholder:text-[#A8ABB3]/50"
                  placeholder="123456"
                />
                <p className="mt-1.5 text-[11px] text-center text-[#A8ABB3]">
                  Code sent to <span className="text-[#22C55E]">{email}</span>. Demo OTP is <strong className="text-[#22C55E]">123456</strong>.
                </p>
                {fieldErrors.otp && (
                  <motion.p initial={{ x: -4 }} animate={{ x: [ -4, 4, 0 ] }} className="mt-1 text-[11px] text-red-400 font-semibold flex items-center gap-1 justify-center">
                    <AlertCircle size={12} /> {fieldErrors.otp}
                  </motion.p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#22C55E] text-[#052E16] p-3.5 rounded-xl font-heading font-bold text-sm transition-all hover:bg-[#16A34A] disabled:opacity-50 cursor-pointer"
              >
                <KeyRound size={16} /> {loading ? 'Verifying Code...' : 'Verify OTP & Sign In'}
              </button>
            </form>
          )}

          <div className="pt-5 mt-6 border-t border-[rgba(34,197,94,0.15)] text-center">
            <button
              type="button"
              onClick={() => {
                setStep(step === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                setErrorMsg('');
                setInfoMsg('');
                setFieldErrors({});
              }}
              className="text-xs transition-colors cursor-pointer group"
            >
              {step === 'LOGIN' ? (
                <span>
                  <span className="text-[#A8ABB3]">Don't have an account? </span>
                  <span className="text-[#22C55E] font-bold group-hover:underline">Create a Citizen Account</span>
                </span>
              ) : (
                <span>
                  <span className="text-[#A8ABB3]">Already registered? </span>
                  <span className="text-[#22C55E] font-bold group-hover:underline">Sign In</span>
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
