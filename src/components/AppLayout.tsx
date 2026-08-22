import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Avatar } from '@/components/ui';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarDays,
  Wallet,
  Users,
  ClipboardCheck,
  CalendarClock,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const employeeNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/profile', label: 'My Profile', icon: <User size={20} /> },
  { to: '/attendance', label: 'Attendance', icon: <CalendarCheck size={20} /> },
  { to: '/leave', label: 'Leave', icon: <CalendarDays size={20} /> },
  { to: '/payroll', label: 'Payroll', icon: <Wallet size={20} /> },
];

const adminNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/employees', label: 'Employees', icon: <Users size={20} /> },
  { to: '/admin/attendance', label: 'Attendance', icon: <CalendarCheck size={20} /> },
  { to: '/admin/leaves', label: 'Leave Approval', icon: <ClipboardCheck size={20} /> },
  { to: '/admin/payroll', label: 'Payroll', icon: <Wallet size={20} /> },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const navItems = isAdmin ? adminNav : employeeNav;

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - desktop */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <CalendarClock size={18} className="text-slate-900" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Dayflow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{isAdmin ? 'Administrator' : 'Employee'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
              <CalendarClock size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">Dayflow</span>
          </div>
          <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={32} />
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
