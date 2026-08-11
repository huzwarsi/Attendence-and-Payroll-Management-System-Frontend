'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';
import {
  QrCode,
  LogIn,
  LogOut,
  Coffee,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Lock,
  Phone,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { ThemeToggleBtn } from '../../../lib/themeContext';

export default function MobileScanPage() {
  const params = useParams();
  const token = params.token;
  const router = useRouter();

  const { user, loginStaff } = useAuth();

  const [validating, setValidating] = useState(true);
  const [qrValid, setQrValid] = useState(false);
  const [qrError, setQrError] = useState('');

  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [currentTime, setCurrentTime] = useState('');
  const [attendanceState, setAttendanceState] = useState({
    has_checked_in: false,
    has_checked_out: false,
    is_on_break: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString());

    if (token) {
      validateToken();
    }

    return () => clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (user && user.role === 'staff') {
      fetchAttendanceState();
    }
  }, [user]);

  const fetchAttendanceState = async () => {
    try {
      const res = await api.get('/portal/dashboard');
      if (res.data?.today) {
        setAttendanceState({
          has_checked_in: res.data.today.has_checked_in,
          has_checked_out: res.data.today.has_checked_out,
          is_on_break: res.data.today.is_on_break
        });
      }
    } catch (err) {
      console.error('Error fetching today attendance state:', err);
    }
  };

  const validateToken = async () => {
    setValidating(true);
    try {
      const res = await api.get(`/qr/validate/${token}`);
      if (res.data?.valid) {
        setQrValid(true);
      } else {
        setQrValid(false);
        setQrError(res.data?.error || 'Invalid or expired QR code.');
      }
    } catch (err) {
      setQrValid(false);
      setQrError(err.response?.data?.error || 'Failed to validate QR code.');
    } finally {
      setValidating(false);
    }
  };

  const handleMobileLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await loginStaff(loginInput, loginPassword, true);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid phone/email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAttendanceAction = async (actionType) => {
    setFeedback({ type: '', message: '' });
    setActionLoading(true);

    let endpoint = '';
    if (actionType === 'checkin') endpoint = '/attendance/checkin';
    else if (actionType === 'checkout') endpoint = '/attendance/checkout';
    else if (actionType === 'break-start') endpoint = '/attendance/break-start';
    else if (actionType === 'break-end') endpoint = '/attendance/break-end';

    try {
      const res = await api.post(endpoint, { qr_token: token });
      setFeedback({
        type: 'success',
        message: res.data?.message || 'Action executed successfully!'
      });
      // Refresh state immediately from API to update UI
      await fetchAttendanceState();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to complete attendance action.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-750 dark:text-slate-400 text-sm animate-pulse">Validating QR Code...</p>
      </div>
    );
  }

  if (!qrValid) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Invalid or Expired QR</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs mb-8">{qrError}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-black dark:text-white font-bold rounded-xl text-sm border border-slate-300 dark:border-slate-700 transition-all"
        >
          Return to Portal Login
        </button>
      </div>
    );
  }

  const isStaffLoggedIn = user && user.role === 'staff';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative transition-colors duration-200">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggleBtn />
      </div>
      <div className="w-full max-w-sm">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-black dark:text-white">Attendance Scan Station</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Scan verified for Today&apos;s Shift</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-full text-xs text-black dark:text-slate-300 font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {currentTime}
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
          {!isStaffLoggedIn ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-2">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-black dark:text-white">Staff Login Required</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Please enter your credentials to mark attendance</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 text-red-800 dark:text-red-400 text-xs text-center font-bold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleMobileLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-slate-300 mb-1">Phone / Email</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder="03001234567"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-black dark:text-white text-xs font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-black dark:text-white text-xs font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {loginLoading ? 'Authenticating...' : 'Authenticate & Continue'}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginInput('ali@company.com');
                    setLoginPassword('staff123');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Fill Demo Staff Credentials
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Authenticated Staff Header */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">Authenticated Staff</p>
                  <p className="text-sm font-black text-black dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{user.designation}</p>
                </div>
                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Active
                </span>
              </div>

              {/* Feedback Toast Banner */}
              {feedback.message && (
                <div
                  className={`p-3 rounded-xl text-xs text-center font-bold flex items-center justify-center gap-2 border ${
                    feedback.type === 'success'
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/20 text-red-800 dark:text-red-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  )}
                  {feedback.message}
                </div>
              )}

              {/* 4 Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleAttendanceAction('checkin')}
                  disabled={actionLoading || attendanceState.has_checked_in}
                  className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl transition-all font-bold text-xs gap-2 group shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LogIn className="w-5 h-5" />
                  </div>
                  Check-in
                </button>

                <button
                  onClick={() => handleAttendanceAction('checkout')}
                  disabled={actionLoading || !attendanceState.has_checked_in || attendanceState.has_checked_out || attendanceState.is_on_break}
                  className="flex flex-col items-center justify-center p-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-600/20 dark:hover:bg-rose-600/30 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 rounded-xl transition-all font-bold text-xs gap-2 group shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LogOut className="w-5 h-5" />
                  </div>
                  Check-out
                </button>

                <button
                  onClick={() => handleAttendanceAction('break-start')}
                  disabled={actionLoading || !attendanceState.has_checked_in || attendanceState.has_checked_out || attendanceState.is_on_break}
                  className="flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-600/20 dark:hover:bg-amber-600/30 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-xl transition-all font-bold text-xs gap-2 group shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Coffee className="w-5 h-5" />
                  </div>
                  Break Start
                </button>

                <button
                  onClick={() => handleAttendanceAction('break-end')}
                  disabled={actionLoading || !attendanceState.has_checked_in || attendanceState.has_checked_out || !attendanceState.is_on_break}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 border border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 rounded-xl transition-all font-bold text-xs gap-2 group shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  Break End
                </button>
              </div>

              <div className="pt-4 text-center border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => router.push('/portal/dashboard')}
                  className="text-xs text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-slate-200 transition-colors font-bold"
                >
                  Go to My Staff Portal Dashboard &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
