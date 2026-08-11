'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';
import Link from 'next/link';
import {
  LogIn,
  LogOut,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Clock,
  QrCode,
  Briefcase,
  UserCheck
} from 'lucide-react';

export default function StaffPortalDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portal/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Fetch portal dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Loading staff workspace...</p>
      </div>
    );
  }

  const staff = data?.staff || {};
  const today = data?.today || {};
  const staffFullName = staff.full_name || user?.name || user?.full_name || 'Staff Member';

  return (
    <div className="space-y-6">
      {/* ═══ Welcome Banner ═══ */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Staff Self-Service Portal
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
              Welcome back, {staffFullName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-black dark:text-slate-200">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> {staff.designation || 'Staff'}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Assigned Shift: <strong className="text-black dark:text-white">{staff.check_in_time || '09:00'} - {staff.check_out_time || '17:00'}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-black dark:text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <Link
              href="/portal/attendance"
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <UserCheck className="w-4 h-4" /> My Attendance Log
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ Today's Shift Overview Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today Status Card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">Today&apos;s Shift Status</span>
            <div className="py-2">
              {today.has_checked_out ? (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <LogOut className="w-5 h-5 shrink-0" /> Shift Completed (Checked-out)
                </div>
              ) : today.is_on_break ? (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-600 dark:text-amber-400 font-bold text-sm animate-pulse">
                  <Coffee className="w-5 h-5 shrink-0" /> Currently On Break
                </div>
              ) : today.has_checked_in ? (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> Checked In ({today.status?.toUpperCase()})
                </div>
              ) : (
                <div className="p-3.5 bg-slate-500/10 border border-slate-500/20 rounded-xl flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" /> Not Marked Yet Today
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
            <span>Shift Target:</span>
            <span className="font-bold text-black dark:text-white">{staff.check_in_time} - {staff.check_out_time}</span>
          </div>
        </div>

        {/* Timestamps Card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">Today&apos;s Scan Timestamps</span>
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 font-sans font-semibold">
                <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Check-in:
              </span>
              <span className="font-bold text-black dark:text-white text-sm">
                {today.check_in_time ? new Date(today.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 font-sans font-semibold">
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Check-out:
              </span>
              <span className="font-bold text-black dark:text-white text-sm">
                {today.check_out_time ? new Date(today.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Scanned via verified daily QR Station.
          </div>
        </div>

        {/* Work Metrics Card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">Today&apos;s Work Metrics</span>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans font-bold">Net Work Hours</p>
              <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">{today.total_working_hours || 0} hrs</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans font-bold">Total Break</p>
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">{today.total_break_minutes || 0} mins</p>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Net work hours automatically exclude break time.
          </div>
        </div>
      </div>

      {/* ═══ Today's Break Logs Card ═══ */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm sm:text-base font-bold text-black dark:text-white mb-4 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Today&apos;s Break History
        </h2>

        {!today.breaks || today.breaks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            No breaks recorded for today&apos;s shift.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4"># Break</th>
                  <th className="py-3 px-4">Break Start</th>
                  <th className="py-3 px-4">Break End</th>
                  <th className="py-3 px-4">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-black dark:text-slate-200">
                {today.breaks.map((b, idx) => {
                  const start = new Date(b.break_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const end = b.break_end ? new Date(b.break_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing...';
                  let duration = 'Ongoing';
                  if (b.break_start && b.break_end) {
                    const diffMins = Math.round((new Date(b.break_end) - new Date(b.break_start)) / (1000 * 60));
                    duration = `${diffMins} mins`;
                  }
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-sans font-bold text-slate-500">Break #{idx + 1}</td>
                      <td className="py-3 px-4">{start}</td>
                      <td className="py-3 px-4">{end}</td>
                      <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">{duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
