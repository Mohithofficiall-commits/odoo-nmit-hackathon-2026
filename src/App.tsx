import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { FullPageSpinner } from '@/components/ui';
import { AppLayout } from '@/components/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { EmployeeDashboard } from '@/pages/EmployeeDashboard';
import { EmployeeProfile } from '@/pages/EmployeeProfile';
import { EmployeeAttendance } from '@/pages/EmployeeAttendance';
import { EmployeeLeave } from '@/pages/EmployeeLeave';
import { EmployeePayroll } from '@/pages/EmployeePayroll';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminEmployees } from '@/pages/AdminEmployees';
import { AdminAttendance } from '@/pages/AdminAttendance';
import { AdminLeaveApproval } from '@/pages/AdminLeaveApproval';
import { AdminPayroll } from '@/pages/AdminPayroll';

function ProtectedLayout({ requireAdmin }: { requireAdmin?: boolean }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (requireAdmin && profile?.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeRoute() {
  const { profile, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (profile?.role === 'admin') return <AdminDashboard />;
  return <EmployeeDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

          {/* Employee / General Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/profile" element={<EmployeeProfile />} />
            <Route path="/attendance" element={<EmployeeAttendance />} />
            <Route path="/leave" element={<EmployeeLeave />} />
            <Route path="/payroll" element={<EmployeePayroll />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedLayout requireAdmin />}>
            <Route path="/employees" element={<AdminEmployees />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/leaves" element={<AdminLeaveApproval />} />
            <Route path="/admin/payroll" element={<AdminPayroll />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
