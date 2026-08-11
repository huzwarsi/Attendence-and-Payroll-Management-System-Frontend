'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  LogIn,
  LogOut,
  Coffee,
  Users,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit3,
  UserX,
  Sparkles,
  Search
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// ADMIN ATTENDANCE MONITORING PAGE
// ═══════════════════════════════════════════════════════

export default function AttendanceMonitoringPage() {
  // ──────────── State ────────────
  const [todayData, setTodayData] = useState([]);
  const [meta, setMeta] = useState({ date: '', total_staff: 0, marked_count: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [staffSearch, setStaffSearch] = useState('');
  const [showUnmarkedOnly, setShowUnmarkedOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Historical view
  const [showHistorical, setShowHistorical] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [histPagination, setHistPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Manual Attendance Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffOptions, setStaffOptions] = useState([]);
  const [modalForm, setModalForm] = useState({
    staff_id: '',
    date: new Date().toISOString().split('T')[0],
    action_type: 'checkin',
    check_in_time: '',
    check_out_time: '',
    status: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // ──────────── Data Fetching ────────────
  const fetchTodayAttendance = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/attendance/today', { params: { date: selectedDate } });
      setTodayData(res.data?.data || []);
      setMeta({
        date: res.data?.date || selectedDate,
        total_staff: res.data?.total_staff || 0,
        marked_count: res.data?.marked_count || 0
      });
    } catch (err) {
      console.error('Fetch today attendance error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  const fetchStaffOptions = async () => {
    try {
      const res = await api.get('/staff', { params: { limit: 100 } });
      setStaffOptions(res.data.data || []);
    } catch (err) {
      console.error('Fetch staff options error:', err);
    }
  };

  const fetchHistorical = async (page = 1) => {
    setHistoricalLoading(true);
    try {
      const res = await api.get('/attendance', {
        params: { page, limit: histPagination.limit, from: fromDate, to: toDate }
      });
      setHistoricalData(res.data.data || []);
      setHistPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Fetch historical error:', err);
    } finally {
      setHistoricalLoading(false);
    }
  };

  useEffect(() => { fetchStaffOptions(); }, []);
  useEffect(() => { fetchTodayAttendance(); }, [fetchTodayAttendance]);
  useEffect(() => { if (showHistorical && (fromDate || toDate)) fetchHistorical(1); }, [fromDate, toDate]);

  // ──────────── Filter Logic ────────────
  const filteredData = todayData.filter((row) => {
    // Staff name search
    if (staffSearch) {
      const q = staffSearch.toLowerCase();
      const nameMatch = row.staff?.full_name?.toLowerCase().includes(q);
      const designationMatch = row.staff?.designation?.toLowerCase().includes(q);
      if (!nameMatch && !designationMatch) return false;
    }
    // Show unmarked only
    if (showUnmarkedOnly && row.status !== 'not_marked') return false;
    // Status filter
    if (statusFilter) {
      if (statusFilter === 'not_marked' && row.status !== 'not_marked') return false;
      if (statusFilter === 'present' && row.status !== 'present' && row.status !== 'late') return false;
      if (statusFilter === 'late' && row.status !== 'late') return false;
      if (statusFilter === 'absent' && row.status !== 'absent') return false;
      if (statusFilter === 'completed' && row.status !== 'completed') return false;
      if (statusFilter === 'on_break' && row.status !== 'on_break') return false;
    }
    return true;
  });

  // ──────────── Summary Counts ────────────
  const counts = {
    present: todayData.filter(r => r.status === 'present' || r.status === 'completed' || r.status === 'on_break' || r.status === 'late').length,
    late: todayData.filter(r => r.status === 'late').length,
    absent: todayData.filter(r => r.status === 'absent').length,
    not_marked: todayData.filter(r => r.status === 'not_marked').length,
    on_break: todayData.filter(r => r.status === 'on_break').length
  };

  // ──────────── Manual Attendance Modal Handlers ────────────
  const openModalForAction = (staffRow, actionType) => {
    setModalForm({
      staff_id: staffRow?.staff_id || staffOptions[0]?.id || '',
      date: selectedDate,
      action_type: actionType || 'checkin',
      check_in_time: actionType === 'edit' && staffRow?.check_in_time
        ? new Date(staffRow.check_in_time).toTimeString().slice(0, 5)
        : '',
      check_out_time: actionType === 'edit' && staffRow?.check_out_time
        ? new Date(staffRow.check_out_time).toTimeString().slice(0, 5)
        : '',
      status: ''
    });
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    // Client-side validation
    if (modalForm.action_type === 'checkin' && !modalForm.check_in_time) {
      setModalError('Please enter a check-in time.');
      return;
    }
    if (modalForm.action_type === 'checkout' && !modalForm.check_out_time) {
      setModalError('Please enter a check-out time.');
      return;
    }
    if (modalForm.action_type === 'edit' && modalForm.check_in_time && modalForm.check_out_time) {
      if (modalForm.check_out_time <= modalForm.check_in_time) {
        setModalError('Check-out time must be after check-in time.');
        return;
      }
    }
    if (modalForm.action_type === 'edit' && !modalForm.check_in_time && modalForm.check_out_time) {
      setModalError('Check-out cannot exist without a check-in time.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        staff_id: modalForm.staff_id,
        date: modalForm.date,
        action_type: modalForm.action_type
      };
      if (modalForm.action_type === 'checkin' || modalForm.action_type === 'edit') {
        payload.check_in_time = modalForm.check_in_time || undefined;
      }
      if (modalForm.action_type === 'checkout' || modalForm.action_type === 'edit') {
        payload.check_out_time = modalForm.check_out_time || undefined;
      }
      if (modalForm.action_type === 'edit' && modalForm.status) {
        payload.status = modalForm.status;
      }

      const res = await api.post('/attendance/manual', payload);
      setModalSuccess(res.data?.message || 'Saved successfully.');
      // Auto-close after 1.2s and refresh
      setTimeout(() => {
        setIsModalOpen(false);
        fetchTodayAttendance(true);
      }, 1200);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to save attendance.');
    } finally {
      setModalLoading(false);
    }
  };

  // ──────────── Status Badge Component ────────────
  const StatusBadge = ({ status }) => {
    const badges = {
      present: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Present' },
      late: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: <AlertCircle className="w-3 h-3" />, label: 'Late' },
      absent: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-600 dark:text-rose-400', icon: <XCircle className="w-3 h-3" />, label: 'Absent' },
      not_marked: { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-500 dark:text-slate-400', icon: <Clock className="w-3 h-3" />, label: 'Not Marked' },
      completed: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Completed' },
      on_break: { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-600 dark:text-orange-400', icon: <Coffee className="w-3 h-3" />, label: 'On Break' }
    };
    const b = badges[status] || badges.not_marked;
    return (
      <span className={`px-2.5 py-1 ${b.bg} ${b.text} border rounded-full text-[10px] font-semibold inline-flex items-center gap-1 whitespace-nowrap ${status === 'on_break' ? 'animate-pulse' : ''}`}>
        {b.icon} {b.label}
      </span>
    );
  };

  // ──────────── Action Button Component ────────────
  const ActionButton = ({ row }) => {
    const { next_action } = row;

    if (next_action === 'completed') {
      return (
        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Done
        </span>
      );
    }

    if (next_action === 'none') {
      return (
        <span className="px-3 py-1.5 bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Absent
        </span>
      );
    }

    const configs = {
      checkin: { label: 'Check In', icon: <LogIn className="w-3 h-3" />, color: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' },
      checkout: { label: 'Check Out', icon: <LogOut className="w-3 h-3" />, color: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' },
      end_break: { label: 'End Break', icon: <Coffee className="w-3 h-3" />, color: 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20' }
    };
    const cfg = configs[next_action] || configs.checkin;

    return (
      <button
        onClick={() => openModalForAction(row, next_action === 'end_break' ? 'checkout' : next_action)}
        className={`px-3 py-1.5 ${cfg.color} text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1 shadow-md transition-all hover:scale-105 active:scale-95`}
      >
        {cfg.icon} {cfg.label}
      </button>
    );
  };

  // ──────────── Render ────────────
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-500" /> Attendance Monitoring
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isToday ? 'Live' : 'Historical'} attendance for {displayDate}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchTodayAttendance(true)}
            disabled={refreshing}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => openModalForAction(null, 'checkin')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Manual Entry
          </button>
        </div>
      </div>

      {/* ═══ Summary Cards ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {[
          { label: 'Total Staff', value: meta.total_staff, color: 'text-slate-800 dark:text-white', icon: <Users className="w-4 h-4 text-slate-500" /> },
          { label: 'Present', value: counts.present, color: 'text-emerald-600 dark:text-emerald-400', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
          { label: 'Late', value: counts.late, color: 'text-amber-600 dark:text-amber-400', icon: <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> },
          { label: 'Absent', value: counts.absent, color: 'text-rose-600 dark:text-rose-400', icon: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> },
          { label: 'Not Marked', value: counts.not_marked, color: 'text-slate-500 dark:text-slate-400', icon: <Clock className="w-4 h-4 text-slate-400" /> }
        ].map((card, i) => (
          <div key={card.label} className={`glass-card rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase truncate">{card.label}</p>
              <p className={`text-base sm:text-lg font-bold ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Filters Bar ═══ */}
      <div className="glass-card rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Search Staff</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Name or designation..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="not_marked">Not Marked</option>
              <option value="completed">Completed</option>
              <option value="on_break">On Break</option>
            </select>
          </div>

          {/* Show Unmarked Toggle */}
          <div className="flex items-end">
            <button
              onClick={() => setShowUnmarkedOnly(!showUnmarkedOnly)}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                showUnmarkedOnly
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              {showUnmarkedOnly ? 'Showing Unmarked Only' : 'Show Unmarked Only'}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Today's Attendance Table ═══ */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-black/70 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Breaks</th>
                <th className="py-3.5 px-4">Break Mins</th>
                <th className="py-3.5 px-4">Net Hours</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-black dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Loading attendance...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No staff members match your filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.staff_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    {/* Staff */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-black dark:text-white text-sm">{row.staff?.full_name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{row.staff?.designation}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Check-in */}
                    <td className="py-3 px-4 font-mono text-black dark:text-slate-300">
                      {row.check_in_time
                        ? new Date(row.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : <span className="text-slate-400 dark:text-slate-600">—</span>}
                    </td>

                    {/* Check-out */}
                    <td className="py-3 px-4 font-mono text-black dark:text-slate-300">
                      {row.check_out_time
                        ? new Date(row.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : row.has_checked_in && !row.has_checked_out
                          ? <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold animate-pulse">Working...</span>
                          : <span className="text-slate-400 dark:text-slate-600">—</span>}
                    </td>

                    {/* Breaks */}
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                      {row.breaks?.length || 0}
                    </td>

                    {/* Break Minutes */}
                    <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-300">
                      {row.total_break_minutes ? `${row.total_break_minutes.toFixed(0)}m` : '0m'}
                    </td>

                    {/* Net Hours */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {row.total_working_hours ? `${row.total_working_hours}h` : '0h'}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton row={row} />
                        {row.attendance_id && (
                          <button
                            onClick={() => openModalForAction(row, 'edit')}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredData.length} of {meta.total_staff} staff members</span>
          <span className="font-mono">{meta.marked_count} / {meta.total_staff} marked</span>
        </div>
      </div>

      {/* ═══ Historical View (Collapsible) ═══ */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => { setShowHistorical(!showHistorical); if (!showHistorical && !historicalData.length) fetchHistorical(1); }}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Historical / Report View
          </span>
          {showHistorical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistorical && (
          <div className="border-t border-slate-200 dark:border-slate-800">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-black/70 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Staff</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Breaks</th>
                    <th className="py-3 px-4">Net Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-black dark:text-slate-200">
                  {historicalLoading ? (
                    <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">Loading records...</td></tr>
                  ) : historicalData.length === 0 ? (
                    <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">Select a date range to view historical records.</td></tr>
                  ) : (
                    historicalData.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-black dark:text-slate-300">
                          {new Date(att.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-black dark:text-white text-sm">{att.staff?.full_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{att.staff?.designation}</p>
                        </td>
                        <td className="py-3 px-4"><StatusBadge status={att.status} /></td>
                        <td className="py-3 px-4 font-mono">{att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        <td className="py-3 px-4 font-mono">{att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-300">{att.total_break_minutes || 0}m</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{att.total_working_hours || 0}h</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {historicalData.length > 0 && (
              <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Page {histPagination.page} of {histPagination.totalPages} ({histPagination.total} records)</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={histPagination.page <= 1}
                    onClick={() => fetchHistorical(histPagination.page - 1)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-50 text-slate-800 dark:text-white rounded-lg transition-all"
                  >Previous</button>
                  <button
                    disabled={histPagination.page >= histPagination.totalPages}
                    onClick={() => fetchHistorical(histPagination.page + 1)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-50 text-slate-800 dark:text-white rounded-lg transition-all"
                  >Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Manual Attendance Modal ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> Manual Attendance Entry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin override — all changes saved to database.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs">
              {/* Error/Success Messages */}
              {modalError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {modalSuccess}
                </div>
              )}

              {/* Staff Selection */}
              <div>
                <label className="block text-black dark:text-slate-300 font-semibold mb-1">Staff Member *</label>
                <select
                  required
                  value={modalForm.staff_id}
                  onChange={(e) => setModalForm({ ...modalForm, staff_id: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-black dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select staff...</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.designation})</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-black dark:text-slate-300 font-semibold mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={modalForm.date}
                  onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-black dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Type */}
              <div>
                <label className="block text-black dark:text-slate-300 font-semibold mb-2">Action Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'checkin', label: 'Check-in', icon: <LogIn className="w-3.5 h-3.5" />, color: 'emerald' },
                    { value: 'checkout', label: 'Check-out', icon: <LogOut className="w-3.5 h-3.5" />, color: 'rose' },
                    { value: 'mark_absent', label: 'Mark Absent', icon: <XCircle className="w-3.5 h-3.5" />, color: 'slate' },
                    { value: 'edit', label: 'Edit Record', icon: <Edit3 className="w-3.5 h-3.5" />, color: 'blue' }
                  ].map((opt) => {
                    const selected = modalForm.action_type === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setModalForm({ ...modalForm, action_type: opt.value, check_in_time: '', check_out_time: '', status: '' })}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          selected
                            ? `bg-${opt.color}-500/10 border-${opt.color}-500/30 text-${opt.color}-600 dark:text-${opt.color}-400 ring-1 ring-${opt.color}-500/20`
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Time Inputs */}
              {(modalForm.action_type === 'checkin' || modalForm.action_type === 'edit') && (
                <div>
                  <label className="block text-black dark:text-slate-300 font-semibold mb-1">
                    Check-in Time {modalForm.action_type === 'checkin' ? '*' : ''}
                  </label>
                  <input
                    type="time"
                    value={modalForm.check_in_time}
                    onChange={(e) => setModalForm({ ...modalForm, check_in_time: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-black dark:text-white focus:outline-none focus:border-emerald-500"
                    required={modalForm.action_type === 'checkin'}
                  />
                </div>
              )}

              {(modalForm.action_type === 'checkout' || modalForm.action_type === 'edit') && (
                <div>
                  <label className="block text-black dark:text-slate-300 font-semibold mb-1">
                    Check-out Time {modalForm.action_type === 'checkout' ? '*' : ''}
                  </label>
                  <input
                    type="time"
                    value={modalForm.check_out_time}
                    onChange={(e) => setModalForm({ ...modalForm, check_out_time: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-black dark:text-white focus:outline-none focus:border-emerald-500"
                    required={modalForm.action_type === 'checkout'}
                  />
                </div>
              )}

              {modalForm.action_type === 'mark_absent' && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  <p className="font-bold">⚠ Mark as Absent</p>
                  <p className="mt-1 text-[11px] opacity-80">This will mark the staff member as absent for the selected date and clear any existing check-in/check-out times.</p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-black dark:text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !!modalSuccess}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                >
                  {modalLoading ? 'Saving...' : modalSuccess ? '✓ Saved' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
