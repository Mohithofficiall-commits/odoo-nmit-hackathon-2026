import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button, Input, Select } from '@/components/ui';
import { Mail, Lock, User, AlertCircle, CalendarClock, CheckCircle2 } from 'lucide-react';

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp({
      email: email.trim(),
      password,
      full_name: fullName.trim(),
      employee_id: employeeId.trim(),
      role: role as 'admin' | 'employee',
    });
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account created</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your account has been created successfully. Please sign in with your credentials.
          </p>
          <Button onClick={() => navigate('/login')} fullWidth size="lg">
            Go to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <CalendarClock size={20} className="text-slate-900" />
            </div>
            <span className="text-xl font-bold tracking-tight">Dayflow</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Join the<br />workforce
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Create your account to start managing attendance, leaves, and payroll.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-500">© 2026 Dayflow HRMS</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <CalendarClock size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Dayflow</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-6">Fill in your details to get started</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              value={fullName}
              onChange={setFullName}
              placeholder="John Doe"
              required
              icon={<User size={18} />}
            />
            <Input
              label="Employee ID"
              value={employeeId}
              onChange={setEmployeeId}
              placeholder="EMP-009"
              required
              icon={<User size={18} />}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              required
              icon={<Mail size={18} />}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="At least 6 characters"
              required
              icon={<Lock size={18} />}
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter password"
              required
              icon={<Lock size={18} />}
            />
            <Select
              label="Role"
              value={role}
              onChange={setRole}
              required
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'admin', label: 'Admin / HR' },
              ]}
            />
            <Button type="submit" fullWidth disabled={loading} size="lg">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
