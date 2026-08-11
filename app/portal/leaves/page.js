'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  Clock,
  Info
} from 'lucide-react';

export default function StaffPortalLeavesPage() {
  const [leaves, setLeaves] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portal/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Fetch portal leaves error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading leave quota data...
      </div>
    );
  }

  const statCards = [
    {
      label: 'Allowed Monthly Leaves',
      value: `${leaves?.allowed_monthly_leaves || 0} Days`,
      desc: 'Standard monthly quota',
      color: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10'
    },
    {
      label: 'Allowed Paid Leaves',
      value: `${leaves?.allowed_paid_leaves || 0} Days`,
      desc: 'Paid leave allowance',
      color: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'
    },
    {
      label: 'Combined Total Quota',
      value: `${leaves?.total_allowed_leaves || 0} Days`,
      desc: 'Monthly + Paid Quota',
      color: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10'
    },
    {
      label: 'Leaves Used This Month',
      value: `${leaves?.leaves_used || 0} Days`,
      desc: 'Approved / Absences used',
      color: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
    },
    {
      label: 'Excess Penalized Leaves',
      value: `${leaves?.excess_leaves || 0} Days`,
      desc: 'Leaves over quota (Deducted)',
      color: 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10'
    },
    {
      label: 'Remaining Leave Quota',
      value: `${leaves?.remaining_leaves || 0} Days`,
      desc: 'Available for use',
      color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
            <Clock className="w-5 h-5" />
          </div>
          Leave Balance & Quota Breakdown
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track monthly leave allocations, paid leaves, utilized days, and remaining balances.</p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <p className="text-3xl font-black text-black dark:text-white mt-2 font-mono">{card.value}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{card.desc}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${card.color}`}>
                Quota Metric
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Explanation Banner */}
      <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
        <div className="p-3 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div className="text-xs text-black dark:text-slate-300 space-y-1">
          <h3 className="text-sm font-bold text-black dark:text-white">Leave Deduction Rule Notice</h3>
          <p className="leading-relaxed">
            Your monthly leave allowance equals <strong>{leaves?.allowed_monthly_leaves} Monthly + {leaves?.allowed_paid_leaves} Paid = {leaves?.total_allowed_leaves} Total Allowed Leaves</strong>.
            Absences up to this combined limit incur <strong>NO salary deduction</strong>. Any additional absences exceeding {leaves?.total_allowed_leaves} days are classified as <em>Excess Leaves</em> and will be deducted at the daily absence deduction rate on your monthly payslip.
          </p>
        </div>
      </div>
    </div>
  );
}

