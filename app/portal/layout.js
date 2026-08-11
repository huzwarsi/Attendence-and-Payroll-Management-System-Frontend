'use client';

import { useAuth } from '../../lib/authContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  UserCheck,
  LayoutDashboard,
  CalendarCheck,
  CircleDollarSign,
  Clock,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { ThemeToggleBtn } from '../../lib/themeContext';

export default function PortalLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'staff')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (loading || !user || user.role !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const staffName = user.name || user.full_name || 'Staff Member';
  const staffInitials = staffName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const navItems = [
    { label: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', href: '/portal/attendance', icon: CalendarCheck },
    { label: 'My Payslips', href: '/portal/payroll', icon: CircleDollarSign },
    { label: 'Leave Balance', href: '/portal/leaves', icon: Clock },
  ];

  return (
    <div className="min-h-screen text-black dark:text-slate-100 font-sans flex flex-col transition-colors duration-200" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Header Bar — Glassmorphism */}
      <header className="glass-card border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black dark:text-white tracking-wide">STAFF PORTAL</h2>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hidden sm:block">Self-Service Workspace</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                {staffInitials}
              </div>
              <div className="text-left hidden sm:block max-w-[140px] truncate">
                <p className="text-xs font-bold text-black dark:text-white truncate leading-tight">{staffName}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate leading-tight">{user.designation || 'Staff'}</p>
              </div>
            </div>

            <ThemeToggleBtn />

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 rounded-xl transition-colors md:hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 dark:border-slate-800/60 px-4 py-3 space-y-1">
            <div className="px-3 py-2 mb-2 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-600/20">
                {staffInitials}
              </div>
              <div>
                <p className="text-xs font-bold text-black dark:text-white">{staffName}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{user.designation || 'Staff'}</p>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {children}
      </main>
    </div>
  );
}
