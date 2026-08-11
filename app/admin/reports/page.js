'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  FileSpreadsheet,
  Download,
  Users,
  CalendarCheck,
  CircleDollarSign
} from 'lucide-react';

export default function ReportsHubPage() {
  const [activeReport, setActiveReport] = useState('attendance');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [designation, setDesignation] = useState('');
  const [staffId, setStaffId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [staffOptions, setStaffOptions] = useState([]);

  useEffect(() => {
    fetchStaffOptions();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [activeReport, designation, staffId, fromDate, toDate]);

  const fetchStaffOptions = async () => {
    try {
      const res = await api.get('/staff', { params: { limit: 100 } });
      setStaffOptions(res.data.data || []);
    } catch (err) {
      console.error('Fetch staff options error:', err);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = `/reports/${activeReport}`;
      const params = {};
      if (designation) params.designation = designation;
      if (staffId) params.staff_id = staffId;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await api.get(endpoint, { params });
      setData(res.data?.data || []);
    } catch (err) {
      console.error('Fetch report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    let query = `format=csv`;
    if (designation) query += `&designation=${encodeURIComponent(designation)}`;
    if (staffId) query += `&staff_id=${staffId}`;
    if (fromDate) query += `&from=${fromDate}`;
    if (toDate) query += `&to=${toDate}`;

    const csvUrl = `${backendUrl}/reports/${activeReport}?${query}`;
    window.open(csvUrl, '_blank');
  };

  const designations = Array.from(new Set(staffOptions.map((s) => s.designation))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-blue-600 dark:text-blue-500" /> Executive Reports Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generate and export filterable audit reports for Staff, Attendance, and Payroll.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Report CSV
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 glass-card rounded-2xl">
        <button
          onClick={() => setActiveReport('attendance')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeReport === 'attendance'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-black/70 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> Attendance Report
        </button>

        <button
          onClick={() => setActiveReport('payroll')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeReport === 'payroll'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-black/70 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <CircleDollarSign className="w-4 h-4" /> Payroll Summary Report
        </button>

        <button
          onClick={() => setActiveReport('staff')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeReport === 'staff'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-black/70 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" /> Staff Directory Report
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Designation</label>
          <select
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Designations</option>
            {designations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {activeReport !== 'staff' && (
          <>
            <div>
              <label className="block font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Staff Member</label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Staff</option>
                {staffOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Report Table Display */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          {activeReport === 'attendance' && (
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-black/70 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Staff Name</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Check-In</th>
                  <th className="py-3.5 px-4">Check-Out</th>
                  <th className="py-3.5 px-4">Working Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-black dark:text-slate-200">
                {loading ? (
                  <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">Loading report data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">No report records found.</td></tr>
                ) : (
                  data.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono font-medium text-black dark:text-slate-300">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold text-black dark:text-white">{r.staff?.full_name}</td>
                      <td className="py-3 px-4 text-black/80 dark:text-slate-300">{r.staff?.designation}</td>
                      <td className="py-3 px-4 uppercase font-semibold text-black dark:text-slate-300">{r.status}</td>
                      <td className="py-3 px-4 font-mono">{r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : '—'}</td>
                      <td className="py-3 px-4 font-mono">{r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : '—'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{r.total_working_hours || 0} hrs</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeReport === 'payroll' && (
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-black/70 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Pay Period</th>
                  <th className="py-3.5 px-4">Staff Name</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Present / Absent</th>
                  <th className="py-3.5 px-4">Basic Salary</th>
                  <th className="py-3.5 px-4">Deductions</th>
                  <th className="py-3.5 px-4">Net Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-black dark:text-slate-200">
                {loading ? (
                  <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">Loading report data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">No report records found.</td></tr>
                ) : (
                  data.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{p.month}/{p.year}</td>
                      <td className="py-3 px-4 font-bold text-black dark:text-white">{p.staff?.full_name}</td>
                      <td className="py-3 px-4 text-black/80 dark:text-slate-300">{p.staff?.designation}</td>
                      <td className="py-3 px-4 font-mono">{p.present_days} Pres / {p.absent_days} Abs</td>
                      <td className="py-3 px-4 font-mono text-black dark:text-slate-300">PKR {p.basic_salary?.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-red-600 dark:text-red-400">- PKR {p.total_deduction?.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">PKR {p.net_salary?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeReport === 'staff' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-black/70 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">CNIC</th>
                  <th className="py-3.5 px-4">Shift Start/End</th>
                  <th className="py-3.5 px-4">Basic Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-black dark:text-slate-200">
                {loading ? (
                  <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">Loading report data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">No staff members found.</td></tr>
                ) : (
                  data.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono">EMP-{s.id}</td>
                      <td className="py-3 px-4 font-bold text-black dark:text-white">{s.full_name}</td>
                      <td className="py-3 px-4 text-black/80 dark:text-slate-300">{s.designation}</td>
                      <td className="py-3 px-4 text-black dark:text-slate-300">{s.email} | {s.phone}</td>
                      <td className="py-3 px-4 font-mono">{s.cnic}</td>
                      <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-300">{s.check_in_time} - {s.check_out_time}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">PKR {s.basic_salary?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

