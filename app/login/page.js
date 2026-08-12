'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, Lock, Mail, Phone, ArrowRight } from 'lucide-react';
import { ThemeToggleBtn } from '../../lib/themeContext';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [staffLogin, setStaffLogin] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginAdmin, loginStaff } = useAuth();
  const router = useRouter();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(adminEmail, adminPassword);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginStaff(staffLogin, staffPassword);
      router.push('/portal/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login as staff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-x-hidden transition-colors duration-200" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggleBtn />
      </div>

      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient-light pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] z-10 my-auto">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/30 mb-3">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">Attendance & Payroll</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Enterprise HR Management System</p>
        </div>

        {/* Glass Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-2xl">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl mb-5 border border-slate-200/60 dark:border-slate-700/40">
            <button
              onClick={() => { setActiveTab('admin'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
            <button
              onClick={() => { setActiveTab('staff'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'staff'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Staff Portal
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs text-center font-bold">
              {error}
            </div>
          )}

          {/* Admin Form */}
          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@system.com"
                    className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:-translate-y-0.5 mt-2"
              >
                {loading ? 'Authenticating...' : (<>Sign In as Admin <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStaffSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Phone or Email
                </label>
                <div className="relative">
                  <Phone className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={staffLogin}
                    onChange={(e) => setStaffLogin(e.target.value)}
                    placeholder="03001234567 or ali@company.com"
                    className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:-translate-y-0.5 mt-2"
              >
                {loading ? 'Authenticating...' : (<>Sign In to Staff Portal <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
