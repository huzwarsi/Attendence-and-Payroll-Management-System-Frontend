'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Coffee,
  Check
} from 'lucide-react';

export default function StaffPortalAttendancePage() {
  const { user } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portal/attendance', {
        params: { month: selectedMonth, year: selectedYear }
      });
      setRecords(res.data?.records || []);
    } catch (err) {
      console.error('Fetch portal attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  // Compute summary stats for selected month
  const stats = {
    present: records.filter(r => r.status === 'present').length,
    late: records.filter(r => r.status === 'late').length,
    absent: records.filter(r => r.status === 'absent').length,
    totalHours: records.reduce((acc, r) => acc + (r.total_working_hours || 0), 0).toFixed(1)
  };

  const StatusBadge = ({ status }) => {
    const badges = {
      present: {
        cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: 'Present'
      },
      late: {
        cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Late'
      },
      absent: {
        cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        icon: <XCircle className="w-3 h-3" />,
        label: 'Absent'
      },
      not_marked: {
        cls: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
        icon: <Clock className="w-3 h-3" />,
        label: 'Not Marked'
      }
    };

    const b = badges[status] || badges.not_marked;
    return (
      <span className={`px-2.5 py-1 ${b.cls} border rounded-full text-[10px] font-bold inline-flex items-center gap-1`}>
        {b.icon} {b.label}
      </span>
    );
  };

  const staffName = user?.name || user?.full_name || 'Staff Member';

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
              <CalendarCheck className="w-5 h-5" />
            </div>
            My Attendance History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monthly log for <strong className="text-black dark:text-white">{staffName}</strong>. Managed strictly via QR scan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 font-bold transition-all"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 font-bold transition-all"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══ Monthly Statistics Summary Cards ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card glass-card-hover stat-card-green rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Days</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{stats.present}</p>
        </div>
        <div className="glass-card glass-card-hover stat-card-amber rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Count</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">{stats.late}</p>
        </div>
        <div className="glass-card glass-card-hover stat-card-rose rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent Days</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">{stats.absent}</p>
        </div>
        <div className="glass-card glass-card-hover stat-card-blue rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Worked</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">{stats.totalHours} hrs</p>
        </div>
      </div>

      {/* ═══ Attendance History Table ═══ */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Breaks</th>
                <th className="py-3.5 px-4">Break Minutes</th>
                <th className="py-3.5 px-4">Net Work Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-black dark:text-slate-200">
              {loading ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">Loading attendance history...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">No attendance records for {months.find(m=>m.value===selectedMonth)?.name} {selectedYear}.</td></tr>
              ) : (
                records.map((r) => {
                  const rDate = new Date(r.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });

                  let displayStatus = r.status || 'not_marked';
                  if (!r.check_in_time && r.status !== 'absent') {
                    displayStatus = 'not_marked';
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-black dark:text-slate-300">{rDate}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={displayStatus} />
                      </td>
                      <td className="py-3 px-4 font-mono">{r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="py-3 px-4 font-mono">{r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {r.breaks?.length || 0}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-300">{r.total_break_minutes || 0}m</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.total_working_hours || 0}h</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
