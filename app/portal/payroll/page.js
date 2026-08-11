'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  CircleDollarSign,
  FileText
} from 'lucide-react';

export default function StaffPortalPayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, selectedYear]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;

      const res = await api.get('/portal/payroll', { params });
      setPayrolls(res.data || []);
    } catch (err) {
      console.error('Fetch portal payroll error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (payroll_id) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const pdfUrl = `${backendUrl}/payroll/export/pdf/${payroll_id}`;
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
            <CircleDollarSign className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> My Salary Payslips
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View net payable salary breakdowns, allowance details, and download PDF payslips.</p>
        </div>
      </div>

      {/* Payslips Cards / List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">Loading salary slips...</div>
        ) : payrolls.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            No generated payslips found.
          </div>
        ) : (
          payrolls.map((p) => (
            <div key={p.id} className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Pay Period</span>
                  <h3 className="text-lg font-extrabold text-black dark:text-white">
                    Month {p.month} / Year {p.year}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">Net Salary</span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      PKR {p.net_salary?.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(p.id)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
                  >
                    <FileText className="w-4 h-4" /> Download PDF Slips
                  </button>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-sans text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Attendance Summary</p>
                  <p className="text-black dark:text-slate-200">Present: {p.present_days} days</p>
                  <p className="text-amber-600 dark:text-amber-400">Late Count: {p.late_count} times</p>
                  <p className="text-rose-600 dark:text-rose-400">Absent: {p.absent_days} days</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-sans text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Earnings & Allowances</p>
                  <p className="text-black dark:text-slate-200">Basic: PKR {p.basic_salary?.toLocaleString()}</p>
                  <p className="text-emerald-600 dark:text-emerald-400">Allowances: PKR {p.total_allowances?.toLocaleString()}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-sans text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Deduction Breakdown</p>
                  <p className="text-rose-600 dark:text-rose-400">Late Deductions: PKR {p.late_deduction?.toLocaleString()}</p>
                  <p className="text-rose-600 dark:text-rose-400">Absence Deductions: PKR {p.absence_deduction?.toLocaleString()}</p>
                  <p className="text-slate-500 dark:text-slate-400">Other Deductions: PKR {p.other_deduction?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

