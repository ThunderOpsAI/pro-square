'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hammer, LayoutDashboard, Users, PhoneCall, DollarSign, ExternalLink, LogOut, Calculator } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login page, render children without the admin shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Leads Pipeline', href: '/admin/leads', icon: Users },
    { name: 'Quotes & Estimator', href: '/admin/quotes', icon: Calculator },
    { name: 'Call Tracking Logs', href: '/admin/call-logs', icon: PhoneCall },
    { name: 'Budget & Ledger', href: '/admin/budget', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 font-sans antialiased flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-surface-900/90 backdrop-blur-xl border-b border-surface-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl shadow-md shadow-primary-600/20">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">Pro Square Admin</span>
                <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary-950 text-primary-400 border border-primary-800/80 rounded-full">
                  HQ
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-surface-800 text-white shadow-sm'
                        : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-400 hover:text-white bg-surface-800/60 hover:bg-surface-800 border border-surface-700/60 rounded-lg transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live Website
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/50 rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex border-t border-surface-800 px-4 py-2 gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white'
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
