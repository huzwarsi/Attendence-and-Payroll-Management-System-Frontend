'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  CircleDollarSign,
  Download,
  FileText,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function PayrollProcessingPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, selectedYear]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll', {
        params: {
          month: selectedMonth,
          year: selectedYear
        }
      });
      setPayrollList(res.data || []);
    } catch (err) {
      console.error('Fetch payroll error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    setMessage({ type: '', text: '' });
    setGenerating(true);
    try {
      const res = await api.post('/payroll/generate-all', {
        month: selectedMonth,
        year: selectedYear
      });
      setMessage({ type: 'success', text: res.data?.message || 'Payroll generated for all active staff!' });
      fetchPayroll();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to bulk generate payroll.' });
    }
  };

  const handleGenerateSingle = async (staff_id) => {
    try {
      await api.post('/payroll/generate', {
        staff_id,
        month: selectedMonth,
        year: selectedYear
      });
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to calculate payroll.');
    }
  };

  const handleDownloadPDF = (payroll_id) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const pdfUrl = `${backendUrl}/payroll/export/pdf/${payroll_id}`;
    window.open(pdfUrl, '_blank');
  };

  const handleExportCSV = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const csvUrl = `${backendUrl}/payroll/export/csv?month=${selectedMonth}&year=${selectedYear}`;
    window.open(csvUrl, '_blank');
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            Automated Payroll Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Calculate prorated salaries based on joining dates, allowances, late penalties, excess leave deductions, and generate official PDF payslips.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 glass-card glass-card-hover text-slate-700 dark:text-white font-semibold rounded-xl text-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-500" /> Export Payroll CSV
          </button>
          <button
            onClick={handleGenerateAll}
            disabled={generating}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> Run Bulk Payroll Engine
          </button>
        </div>
      </div>

      {/* Month & Year Picker Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
          <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Select Pay Period:</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 font-semibold transition-all"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 font-semibold transition-all"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Payroll Records Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[950px]">
            <thead className="bg-slate-100/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-800/60 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Staff & Joining Date</th>
                <th className="py-3.5 px-4">Eligible Days</th>
                <th className="py-3.5 px-4">Attendance Log</th>
                <th className="py-3.5 px-4">Leave Quota</th>
                <th className="py-3.5 px-4">Prorated Basic + Allowances</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-black dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 dark:text-slate-400">Calculating payroll entries...</td>
                </tr>
              ) : payrollList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No payroll generated for {months.find(m => m.value === selectedMonth)?.name} {selectedYear}. Click &quot;Run Bulk Payroll Engine&quot; above to calculate.
                  </td>
                </tr>
              ) : (
                payrollList.map((p) => {
                  const joiningDateStr = p.staff?.joining_date ? new Date(p.staff.joining_date).toISOString().split('T')[0] : 'N/A';
                  const daysInMonth = p.days_in_month || 30;
                  const eligibleDays = p.eligible_days || 30;
                  const isProrated = eligibleDays < daysInMonth;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-black dark:text-white text-sm">{p.staff?.full_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.staff?.designation}</p>
                          <p className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">Joined: {joiningDateStr}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block border ${
                          isProrated
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {eligibleDays} / {daysInMonth} Days
                        </span>
                        {isProrated && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Prorated Shift</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <p className="text-emerald-700 dark:text-emerald-400 font-medium">Present: {p.present_days} days</p>
                          <p className="text-amber-700 dark:text-amber-400">Late: {p.late_count} times</p>
                          <p className="text-rose-700 dark:text-rose-400">Absent: {p.absent_days} days</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px] font-mono">
                          <p className="text-black dark:text-slate-300">Quota: {p.allowed_monthly_leaves + p.allowed_paid_leaves} days</p>
                          <p className="text-blue-700 dark:text-blue-300">Used: {p.leaves_used}</p>
                          {p.excess_leaves > 0 ? (
                            <p className="text-red-600 dark:text-red-400 font-bold">Excess: {p.excess_leaves} days</p>
                          ) : (
                            <p className="text-emerald-700 dark:text-emerald-400">Rem: {p.remaining_leaves} days</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <p className="font-bold text-black dark:text-white">
                          PKR {(p.prorated_basic_salary || p.basic_salary)?.toLocaleString()}
                        </p>
                        {isProrated && (
                          <p className="text-[10px] text-slate-400">
                            (Monthly: PKR {p.basic_salary?.toLocaleString()})
                          </p>
                        )}
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">+ PKR {p.total_allowances?.toLocaleString()} allow.</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-700 dark:text-rose-400">
                        <p className="font-semibold">- PKR {p.total_deduction?.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Late: {p.late_deduction} | Abs: {p.absence_deduction}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-block">
                          PKR {p.net_salary?.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleGenerateSingle(p.staff_id)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
                            title="Recalculate Single Staff Payroll"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(p.id)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-lg transition-all font-semibold flex items-center gap-1 text-[11px]"
                            title="Download PDF Payslip"
                          >
                            <FileText className="w-3.5 h-3.5" /> PDF Payslip
                          </button>
                        </div>
                      </td>
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
