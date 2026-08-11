'use client';

import { useAuth } from '../../lib/authContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CircleDollarSign,
  QrCode,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { ThemeToggleBtn } from '../../lib/themeContext';

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop sidebar collapse state (ChatGPT style)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Staff Management', href: '/admin/staff', icon: Users },
    { label: 'Attendance Monitoring', href: '/admin/attendance', icon: CalendarCheck },
    { label: 'Payroll Engine', href: '/admin/payroll', icon: CircleDollarSign },
    { label: 'QR Station', href: '/admin/qr', icon: QrCode },
    { label: 'Reports Hub', href: '/admin/reports', icon: FileSpreadsheet },
  ];

  const handleCloseSidebar = () => {
    setMobileOpen(false);
    setDesktopCollapsed(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-black dark:text-slate-100 font-sans transition-colors duration-200">
      {/* ═══ Mobile Top Header ═══ */}
      <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-black dark:text-white">Admin Portal</span>
          </div>
          <ThemeToggleBtn />
        </div>
      </header>

      {/* ═══ Mobile Backdrop Overlay ═══ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden sidebar-overlay-enter"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══ Fixed Sidebar (Screen Height 100vh, Fixed Left) ═══ */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 h-screen w-72 bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col justify-between
          shadow-xl lg:shadow-none
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${desktopCollapsed ? 'lg:-translate-x-full lg:opacity-0 lg:pointer-events-none' : 'lg:translate-x-0 lg:opacity-100'}
        `}
      >
        {/* Top Header + Navigation (Scrolls inside if viewport is short) */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Top Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h2 className="text-xs font-bold text-black dark:text-white tracking-wide truncate">ADMIN PORTAL</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Attendance & Payroll</p>
              </div>
            </div>

            {/* Close Sidebar Button (ChatGPT style) */}
            <button
              onClick={handleCloseSidebar}
              className="p-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              title="Close Sidebar"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer — User Profile & Appearance (Fixed Flush at Bottom) */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate min-w-0">
              <p className="text-xs font-bold text-black dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden lg:flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Appearance</span>
            <ThemeToggleBtn />
          </div>
        </div>
      </aside>

      {/* ═══ Main Content Area (Offset by left padding on desktop) ═══ */}
      <main
        className={`
          min-h-screen transition-all duration-300 ease-in-out
          ${desktopCollapsed ? 'lg:pl-0' : 'lg:pl-72'}
        `}
      >
        {/* Desktop Top Control Bar when Sidebar is Collapsed */}
        {desktopCollapsed && (
          <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm transition-all">
            <button
              onClick={() => setDesktopCollapsed(false)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
              title="Open Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Open Sidebar</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-black dark:text-white">System Admin</span>
              <ThemeToggleBtn />
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
