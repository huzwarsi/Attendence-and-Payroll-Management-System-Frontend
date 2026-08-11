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
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total_staff: 0,
    present_today: 0,
    late_today: 0,
    absent_today: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Staff',
      value: stats.total_staff,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-700 dark:text-blue-400',
      badge: 'Active Staff'
    },
    {
      label: 'Present Today',
      value: stats.present_today,
      icon: CheckCircle2,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      badge: 'Checked In'
    },
    {
      label: 'Late Today',
      value: stats.late_today,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-700 dark:text-amber-400',
      badge: 'After Shift Time'
    },
    {
      label: 'Absent Today',
      value: stats.absent_today,
      icon: UserX,
      color: 'from-rose-600 to-red-600',
      textColor: 'text-rose-700 dark:text-rose-400',
      badge: 'Unmarked / Absent'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> Real-time System Dashboard
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">Overview & Metrics</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Live tracking of staff attendance, shift timings, and payroll readiness.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <Link
              href="/admin/qr"
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all whitespace-nowrap"
            >
              <QrCode className="w-4 h-4" /> Live QR Station
            </Link>
            <Link
              href="/admin/payroll"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-black dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all whitespace-nowrap"
            >
              <CircleDollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Process Payroll
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">{card.label}</span>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <div className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                  {loading ? '...' : card.value}
                </div>
                <span className={`inline-block mt-2 text-[10px] sm:text-[11px] font-bold ${card.textColor} bg-slate-50 dark:bg-slate-800/80 px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700`}>
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Hub & System Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-4">Quick Management Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/admin/staff"
              className="p-4 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/40 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Add New Staff</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Create employee profiles with salary & leave rules.</p>
              <div className="mt-3 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                Open Directory <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            <Link
              href="/admin/attendance"
              className="p-4 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500/40 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Manual Attendance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Override shift statuses & adjust time entries.</p>
              <div className="mt-3 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                View Attendance <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            <Link
              href="/admin/payroll"
              className="p-4 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/40 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-black dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Generate Payroll</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Bulk calculate monthly salaries & export PDF/CSV.</p>
              <div className="mt-3 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Run Engine <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          </div>
        </div>

        {/* Info & Rule Summary Card */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-black dark:text-white mb-3">Automated Policy Rules</h2>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span><strong className="text-black dark:text-white">Shift Late Calculation:</strong> Staff checking in past assigned shift start time are automatically flagged as <em>Late</em>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong className="text-black dark:text-white">Dual Leave Formula:</strong> Total Allowed Leaves = Allowed Monthly + Paid Leaves. Excess leaves are treated as absent days.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span><strong className="text-black dark:text-white">Daily Absence Cron:</strong> Node-cron runs at 23:55 daily to mark unrecorded staff as <em>Absent</em>.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">System v1.0.0 &bull; Node + Express + PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
