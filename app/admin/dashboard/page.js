'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  Clock,
  UserX,
  QrCode,
  CircleDollarSign,
  UserPlus,
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Coffee,
  LogOut,
  FileText,
  Calendar,
  AlertCircle,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total_staff: 0,
    present_today: 0,
    late_today: 0,
    absent_today: 0
  });
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, attendanceRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/attendance/today').catch(() => ({ data: { data: [] } }))
      ]);
      setStats(statsRes.data || { total_staff: 0, present_today: 0, late_today: 0, absent_today: 0 });
      setTodayAttendance(attendanceRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentlyWorking = todayAttendance.filter(a => a.check_in_time && !a.check_out_time && !a.is_on_break).length;
  const onBreak = todayAttendance.filter(a => a.is_on_break).length;
  const checkedOut = todayAttendance.filter(a => a.check_out_time).length;
  const attendanceRate = stats.total_staff ? Math.round((stats.present_today / stats.total_staff) * 100) : 0;

  return (
    <div className="space-y-6 mesh-gradient-light">

      {/* ═══ Hero Welcome Banner ═══ */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-300/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Admin Console</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋</h1>
            <p className="text-blue-100/80 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/qr"
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <QrCode className="w-4 h-4" /> QR Station
            </Link>
            <Link
              href="/admin/payroll"
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all hover:-translate-y-0.5"
            >
              <CircleDollarSign className="w-4 h-4" /> Payroll
            </Link>
          </div>
        </div>

        {/* Attendance rate highlight strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-3xl font-black font-mono">{loading ? '—' : attendanceRate}%</p>
              <p className="text-blue-200/70 text-xs font-medium">Attendance Rate</p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Users className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <p className="text-3xl font-black font-mono">{loading ? '—' : stats.total_staff}</p>
              <p className="text-blue-200/70 text-xs font-medium">Total Employees</p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-3xl font-black font-mono">{loading ? '—' : currentlyWorking}</p>
              <p className="text-blue-200/70 text-xs font-medium">Working Right Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 4 KPI Stat Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: stats.present_today, icon: CheckCircle2, color: '#10b981', gradient: 'from-emerald-500 to-teal-500', glow: 'stat-card-green', accent: 'bg-emerald-500' },
          { label: 'Late', value: stats.late_today, icon: Clock, color: '#f59e0b', gradient: 'from-amber-500 to-orange-500', glow: 'stat-card-amber', accent: 'bg-amber-500' },
          { label: 'Absent', value: stats.absent_today, icon: UserX, color: '#ef4444', gradient: 'from-rose-500 to-red-500', glow: 'stat-card-rose', accent: 'bg-rose-500' },
          { label: 'On Break', value: onBreak, icon: Coffee, color: '#6366f1', gradient: 'from-indigo-500 to-violet-500', glow: 'stat-card-blue', accent: 'bg-indigo-500' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`glass-card glass-card-hover ${card.glow} rounded-2xl p-5 relative overflow-hidden group`}>
              {/* Colored top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${card.accent} opacity-80`} />

              {/* Background glow */}
              <div className={`absolute -bottom-6 -right-6 w-28 h-28 bg-gradient-to-br ${card.gradient} rounded-full opacity-[0.06] group-hover:opacity-[0.12] blur-2xl transition-opacity duration-700`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg`}
                    style={{ boxShadow: `0 4px 14px ${card.color}33` }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</span>
                </div>

                <p className="text-4xl font-black text-black dark:text-white tracking-tight font-mono leading-none">
                  {loading ? <span className="inline-block w-12 h-9 rounded-lg shimmer" /> : card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Workforce Pulse ═══ */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Workforce Pulse
          </h2>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Checked In', val: stats.present_today, icon: CheckCircle2, c: 'emerald' },
            { label: 'Working', val: currentlyWorking, icon: Activity, c: 'blue' },
            { label: 'On Break', val: onBreak, icon: Coffee, c: 'amber' },
            { label: 'Checked Out', val: checkedOut, icon: LogOut, c: 'indigo' },
            { label: 'Absent', val: stats.absent_today, icon: UserX, c: 'rose' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`relative p-4 rounded-xl border border-${item.c}-500/10 bg-${item.c}-500/[0.04] dark:bg-${item.c}-500/[0.06] hover:bg-${item.c}-500/[0.08] transition-all group`}>
                <Icon className={`w-4 h-4 text-${item.c}-500 mb-2`} />
                <p className="text-2xl font-black text-black dark:text-white font-mono leading-none">
                  {loading ? '—' : item.val}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Main Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 sm:p-6 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-500" /> Today&apos;s Attendance
              </h2>
              <Link href="/admin/attendance" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-5 sm:p-6 pt-4">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl shimmer" />)}
                </div>
              ) : todayAttendance.length === 0 ? (
                <div className="py-14 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                  <CalendarCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No attendance recorded today</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar -mx-1">
                  <table className="w-full text-left text-xs min-w-[520px]">
                    <thead>
                      <tr className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                        <th className="py-2 px-3">Employee</th>
                        <th className="py-2 px-3">Shift</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">In</th>
                        <th className="py-2 px-3">Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAttendance.slice(0, 6).map((att, i) => {
                        let bc = 'badge-neutral';
                        if (att.status === 'present') bc = 'badge-present';
                        else if (att.status === 'late') bc = 'badge-late';
                        else if (att.status === 'absent') bc = 'badge-absent';
                        return (
                          <tr key={att.staff_id} className={`${i > 0 ? 'border-t border-slate-100 dark:border-slate-800/50' : ''} hover:bg-blue-500/[0.02] dark:hover:bg-blue-500/[0.04] transition-colors`}>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-black dark:text-white text-[13px]">{att.full_name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{att.designation}</p>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                              {att.shift_start || '09:00'} – {att.shift_end || '17:00'}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`badge ${bc}`}>{att.status || 'Not Marked'}</span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                              {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                              {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1/3 — Quick Actions + Policies */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-bold text-black dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Staff', href: '/admin/staff', icon: UserPlus, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
                { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck, gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25' },
                { label: 'Payroll', href: '/admin/payroll', icon: CircleDollarSign, gradient: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-500/25' },
                { label: 'QR Station', href: '/admin/qr', icon: QrCode, gradient: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/25' },
              ].map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    href={action.href}
                    className="group p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/30 hover:border-blue-500/25 transition-all hover:-translate-y-1 text-center flex flex-col items-center gap-3"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Policies + System (combined, compact) */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Active Policies
            </h2>
            <div className="space-y-0.5">
              {[
                { icon: Clock, color: 'text-amber-500', text: 'Late deduction on shift overdue' },
                { icon: Calendar, color: 'text-emerald-500', text: 'Prorated salary on joining date' },
                { icon: FileText, color: 'text-indigo-500', text: 'Dual leave quota applied' },
                { icon: AlertCircle, color: 'text-rose-500', text: 'Auto-absent at end of day' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">System</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 text-[10px] font-bold rounded-full">
                  <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                  Online
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                {[{ l: 'DB', v: 'PostgreSQL' }, { l: 'API', v: 'Express' }, { l: 'UI', v: 'Next.js' }].map((s, i) => (
                  <div key={i} className="py-1.5 px-1 rounded-lg bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-700/30">
                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">{s.l}</p>
                    <p className="text-[10px] font-bold text-black dark:text-white">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
