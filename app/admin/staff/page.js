'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Briefcase,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Form Field Touch & Validation Error States
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const initialForm = {
    full_name: '',
    phone: '',
    email: '',
    address: '',
    cnic: '',
    emergency_contact: '',
    designation: '',
    joining_date: new Date().toISOString().split('T')[0],
    basic_salary: 100000,
    allowance_transport: 5000,
    allowance_food: 4000,
    allowance_other: 2000,
    deduction_late_amount: 500,
    deduction_absence_amount: 2500,
    deduction_other: 0,
    check_in_time: '09:00',
    check_out_time: '17:00',
    allowed_monthly_leaves: 2,
    allowed_paid_leaves: 1,
    password: '',
    is_active: true
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchStaff(1);
  }, [search, designationFilter]);

  const fetchStaff = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/staff', {
        params: {
          page,
          limit: pagination.limit,
          search,
          designation: designationFilter
        }
      });
      setStaffList(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Fetch staff error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateSingleField = (field, value, currentFormData = formData) => {
    const val = (value !== undefined && value !== null ? value : currentFormData[field] || '').toString().trim();
    let error = '';

    switch (field) {
      case 'full_name':
        if (!val) error = 'Full name is required.';
        break;
      case 'email':
        if (!val) {
          error = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          error = 'Invalid email address format.';
        }
        break;
      case 'phone':
        if (!val) error = 'Phone number is required.';
        break;
      case 'cnic':
        if (!val) error = 'CNIC is required.';
        break;
      case 'designation':
        if (!val) error = 'Designation is required.';
        break;
      default:
        break;
    }
    return error;
  };

  const validateAllFields = (dataToValidate = formData) => {
    const errors = {};
    const requiredFields = ['full_name', 'email', 'phone', 'cnic', 'designation'];

    requiredFields.forEach((field) => {
      const err = validateSingleField(field, dataToValidate[field], dataToValidate);
      if (err) errors[field] = err;
    });

    return errors;
  };

  const handleInputChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    setFormData(updatedForm);

    if (modalError) setModalError('');

    // Re-validate field on input if it has been touched or has an active error
    if (touched[field] || fieldErrors[field]) {
      const err = validateSingleField(field, value, updatedForm);
      setFieldErrors((prev) => ({
        ...prev,
        [field]: err
      }));
    }
  };

  const handleInputBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateSingleField(field, formData[field], formData);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: err
    }));
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData(initialForm);
    setTouched({});
    setFieldErrors({});
    setModalError('');
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      full_name: staff.full_name || '',
      phone: staff.phone || '',
      email: staff.email || '',
      address: staff.address || '',
      cnic: staff.cnic || '',
      emergency_contact: staff.emergency_contact || '',
      designation: staff.designation || '',
      joining_date: staff.joining_date ? new Date(staff.joining_date).toISOString().split('T')[0] : '',
      basic_salary: staff.basic_salary || 0,
      allowance_transport: staff.allowance_transport || 0,
      allowance_food: staff.allowance_food || 0,
      allowance_other: staff.allowance_other || 0,
      deduction_late_amount: staff.deduction_late_amount || 0,
      deduction_absence_amount: staff.deduction_absence_amount || 0,
      deduction_other: staff.deduction_other || 0,
      check_in_time: staff.check_in_time || '09:00',
      check_out_time: staff.check_out_time || '17:00',
      allowed_monthly_leaves: staff.allowed_monthly_leaves || 2,
      allowed_paid_leaves: staff.allowed_paid_leaves || 1,
      password: '',
      is_active: staff.is_active ?? true
    });
    setTouched({});
    setFieldErrors({});
    setModalError('');
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setModalError('');

    // Mark all required fields as touched
    const allRequired = ['full_name', 'email', 'phone', 'cnic', 'designation'];
    const newTouched = { ...touched };
    allRequired.forEach((f) => (newTouched[f] = true));
    setTouched(newTouched);

    // Perform validation
    const errors = validateAllFields(formData);
    setFieldErrors(errors);

    // If validation fails, stay on modal and switch to tab containing first error
    if (Object.keys(errors).length > 0) {
      const basicFields = ['full_name', 'email', 'phone', 'cnic'];
      const jobFields = ['designation'];

      const hasBasicErr = basicFields.some((f) => errors[f]);
      const hasJobErr = jobFields.some((f) => errors[f]);

      if (hasBasicErr && activeTab !== 'basic') {
        setActiveTab('basic');
      } else if (!hasBasicErr && hasJobErr && activeTab !== 'job') {
        setActiveTab('job');
      }
      return;
    }

    setModalLoading(true);

    // Trim whitespace for required & text fields before saving
    const payload = {
      ...formData,
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      cnic: formData.cnic.trim(),
      designation: formData.designation.trim(),
      address: formData.address ? formData.address.trim() : '',
      emergency_contact: formData.emergency_contact ? formData.emergency_contact.trim() : ''
    };

    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, payload);
      } else {
        await api.post('/staff', payload);
      }
      setIsModalOpen(false);
      fetchStaff(pagination.page);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save staff record.';
      if (errorMsg.toLowerCase().includes('email')) {
        setFieldErrors((prev) => ({ ...prev, email: errorMsg }));
        setActiveTab('basic');
      } else if (errorMsg.toLowerCase().includes('cnic')) {
        setFieldErrors((prev) => ({ ...prev, cnic: errorMsg }));
        setActiveTab('basic');
      } else {
        setModalError(errorMsg);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/staff/${id}`);
      fetchStaff(pagination.page);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete staff member.');
    }
  };

  const designations = Array.from(new Set(staffList.map((s) => s.designation))).filter(Boolean);

  const hasBasicErrors = Boolean(
    (touched.full_name && fieldErrors.full_name) ||
    (touched.email && fieldErrors.email) ||
    (touched.phone && fieldErrors.phone) ||
    (touched.cnic && fieldErrors.cnic)
  );

  const hasJobErrors = Boolean(
    touched.designation && fieldErrors.designation
  );

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600 dark:text-blue-500" /> Staff Directory & Management
          </h1>
          <p className="text-xs text-black/80 dark:text-slate-400 mt-1">Manage employee profiles, shift schedules, salary formulas, and leave quotas.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, CNIC, email, phone..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-black dark:text-white font-medium placeholder-slate-500 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-black dark:text-white font-medium focus:outline-none focus:border-blue-600 appearance-none"
            >
              <option value="">All Designations</option>
              {designations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-100 dark:bg-slate-900/90 text-black dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Shift Timings</th>
                <th className="py-3.5 px-4">Basic Salary</th>
                <th className="py-3.5 px-4">Leaves (M / P)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-black/80 dark:text-slate-400">Loading staff records...</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-black/80 dark:text-slate-400">No staff members found matching criteria.</td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-extrabold text-black dark:text-white text-sm">{s.full_name}</p>
                        <p className="text-[11px] font-mono font-semibold text-black/80 dark:text-slate-400">CNIC: {s.cnic}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-300">{s.designation}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">
                      <p>{s.email}</p>
                      <p className="text-[11px] text-black/80 dark:text-slate-400">{s.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-300 dark:border-slate-800 text-blue-700 dark:text-blue-300">
                        <Clock className="w-3 h-3" /> {s.check_in_time} - {s.check_out_time}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-700 dark:text-emerald-400">
                      PKR {s.basic_salary?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-300">
                        {s.allowed_monthly_leaves} Monthly / {s.allowed_paid_leaves} Paid
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.is_active ? (
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
                          title="Edit Staff"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id)}
                          className="p-1.5 bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                          title="Delete Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-400">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total staff)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchStaff(pagination.page - 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 disabled:opacity-50 text-black dark:text-white rounded-lg transition-all font-bold"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchStaff(pagination.page + 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 disabled:opacity-50 text-black dark:text-white rounded-lg transition-all font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto transition-all">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingStaff ? `Edit Staff: ${editingStaff.full_name}` : 'Add New Staff Member'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure employee profiles, shift schedules, salary formulas, and leave quotas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 px-6 pt-3 gap-2 text-xs font-bold shrink-0 overflow-x-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 relative ${
                  activeTab === 'basic'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Basic Info
                {hasBasicErrors && (
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0 animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('job')}
                className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 relative ${
                  activeTab === 'job'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> Job & Shift
                {hasJobErrors && (
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0 animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('salary')}
                className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'salary'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" /> Salary & Deductions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('leave')}
                className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'leave'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Leave Settings
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStaff} noValidate className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                {modalError && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{modalError}</span>
                  </div>
                )}

                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    {/* Full Name */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        onBlur={() => handleInputBlur('full_name')}
                        placeholder="e.g. Muhammad Ali"
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none transition-all ${
                          touched.full_name && fieldErrors.full_name
                            ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                        }`}
                      />
                      {touched.full_name && fieldErrors.full_name && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.full_name}
                        </p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleInputBlur('email')}
                        placeholder="ali@company.com"
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none transition-all ${
                          touched.email && fieldErrors.email
                            ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                        }`}
                      />
                      {touched.email && fieldErrors.email && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleInputBlur('phone')}
                        placeholder="03001234567"
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none transition-all ${
                          touched.phone && fieldErrors.phone
                            ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                        }`}
                      />
                      {touched.phone && fieldErrors.phone && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* CNIC */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        CNIC (National ID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.cnic}
                        onChange={(e) => handleInputChange('cnic', e.target.value)}
                        onBlur={() => handleInputBlur('cnic')}
                        placeholder="37405-1234567-1"
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none transition-all ${
                          touched.cnic && fieldErrors.cnic
                            ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                        }`}
                      />
                      {touched.cnic && fieldErrors.cnic && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.cnic}
                        </p>
                      )}
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Emergency Contact</label>
                      <input
                        type="text"
                        value={formData.emergency_contact}
                        onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                        placeholder="03009998877"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Islamabad, Pakistan"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Portal Password */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Portal Password {editingStaff && '(Leave blank to keep unchanged)'}
                      </label>
                      <input
                        type="password"
                        placeholder={editingStaff ? '••••••••' : 'Default password: staff123'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'job' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    {/* Designation */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        onBlur={() => handleInputBlur('designation')}
                        placeholder="Senior Software Engineer..."
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none transition-all ${
                          touched.designation && fieldErrors.designation
                            ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                        }`}
                      />
                      {touched.designation && fieldErrors.designation && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.designation}
                        </p>
                      )}
                    </div>

                    {/* Joining Date */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Joining Date</label>
                      <input
                        type="date"
                        value={formData.joining_date}
                        onChange={(e) => handleInputChange('joining_date', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Check in time */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Assigned Shift Start (Check-in)</label>
                      <input
                        type="time"
                        value={formData.check_in_time}
                        onChange={(e) => handleInputChange('check_in_time', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Check out time */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Assigned Shift End (Check-out)</label>
                      <input
                        type="time"
                        value={formData.check_out_time}
                        onChange={(e) => handleInputChange('check_out_time', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Account Status */}
                    <div className="sm:col-span-2 pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-bold">Account Status: Active Employee</span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'salary' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Basic Salary (PKR / Month) *</label>
                      <input
                        type="number"
                        value={formData.basic_salary}
                        onChange={(e) => handleInputChange('basic_salary', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Transport Allowance</label>
                      <input
                        type="number"
                        value={formData.allowance_transport}
                        onChange={(e) => handleInputChange('allowance_transport', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Food Allowance</label>
                      <input
                        type="number"
                        value={formData.allowance_food}
                        onChange={(e) => handleInputChange('allowance_food', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Other Allowances</label>
                      <input
                        type="number"
                        value={formData.allowance_other}
                        onChange={(e) => handleInputChange('allowance_other', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <p className="font-extrabold text-xs text-slate-900 dark:text-slate-200 mb-3">Deduction Rules Configuration</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Deduction per Late Shift (PKR)</label>
                      <input
                        type="number"
                        value={formData.deduction_late_amount}
                        onChange={(e) => handleInputChange('deduction_late_amount', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400 font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Deduction per Absent Day (PKR)</label>
                      <input
                        type="number"
                        value={formData.deduction_absence_amount}
                        onChange={(e) => handleInputChange('deduction_absence_amount', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400 font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Flat Other Deduction (PKR)</label>
                      <input
                        type="number"
                        value={formData.deduction_other}
                        onChange={(e) => handleInputChange('deduction_other', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400 font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'leave' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Allowed Monthly Leaves (Quota)</label>
                      <input
                        type="number"
                        value={formData.allowed_monthly_leaves}
                        onChange={(e) => handleInputChange('allowed_monthly_leaves', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Allowed Paid Leaves (Quota)</label>
                      <input
                        type="number"
                        value={formData.allowed_paid_leaves}
                        onChange={(e) => handleInputChange('allowed_paid_leaves', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">
                      <p className="font-bold text-xs text-blue-600 dark:text-blue-400 mb-1">Total Leave Quota Info:</p>
                      <p className="text-[11px] leading-relaxed font-medium">
                        Total allowed leaves = <strong>{(parseInt(formData.allowed_monthly_leaves) || 0) + (parseInt(formData.allowed_paid_leaves) || 0)} days</strong>.
                        If monthly absences remain within this combined quota, no absence deduction will be applied. Excess absences beyond this total are penalized using the <em>Absence Deduction Rate</em>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {modalLoading ? 'Saving...' : editingStaff ? 'Update Staff Member' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
