import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (requireAdmin && profile?.role !== 'admin') return <Navigate to="/" replace />;

  return <AppLayout>{children}</AppLayout>;
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
  if (profile?.role === 'admin') return <ProtectedRoute><AdminDashboard /></ProtectedRoute>;
  return <ProtectedRoute><EmployeeDashboard /></ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

          {/* Employee routes */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/profile" element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><EmployeeAttendance /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute><EmployeeLeave /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><EmployeePayroll /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/employees" element={<ProtectedRoute requireAdmin><AdminEmployees /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute requireAdmin><AdminAttendance /></ProtectedRoute>} />
          <Route path="/admin/leaves" element={<ProtectedRoute requireAdmin><AdminLeaveApproval /></ProtectedRoute>} />
          <Route path="/admin/payroll" element={<ProtectedRoute requireAdmin><AdminPayroll /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
