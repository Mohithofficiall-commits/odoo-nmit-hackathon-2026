import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button, Input } from '@/components/ui';
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  Eye,
  EyeOff,
} from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Extra feature
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email.trim(), password);

    setLoading(false);

    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
  }

  function fillDemo(role: 'admin' | 'employee') {
    if (role === 'admin') {
      setEmail('admin@dayflow.com');
      setPassword('Dayflow2026!');
    } else {
      setEmail('john.davis@dayflow.com');
      setPassword('Dayflow2026!');
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <CalendarClock size={20} className="text-slate-900" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Dayflow
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Human Resource
            <br />
            Management System
          </h1>

          <p className="text-slate-400 text-lg max-w-md">
            Attendance, leaves, payroll, and employee management — all in one place.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Track attendance with check-in / check-out',
              'Apply and manage leave requests',
              'View and manage payroll records',
              'Role-based access for employees and HR',
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2.5 text-slate-300"
              >
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2026 Dayflow HRMS
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <CalendarClock size={20} className="text-white" />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Dayflow
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome back
          </h2>

          <p className="text-slate-500 text-sm mb-8">
            Sign in to your account to continue
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              required
              icon={<Mail size={18} />}
            />

            {/* Password with Show/Hide */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                required
                icon={<Lock size={18} />}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 rounded-lg bg-slate-100 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-2">
              Demo accounts (click to fill):
            </p>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex-1 text-xs px-3 py-2 rounded-md bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
              >
                <div className="font-semibold text-slate-800">
                  Admin / HR
                </div>

                <div className="text-slate-500">
                  admin@dayflow.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('employee')}
                className="flex-1 text-xs px-3 py-2 rounded-md bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
              >
                <div className="font-semibold text-slate-800">
                  Employee
                </div>

                <div className="text-slate-500">
                  john.davis@dayflow.com
                </div>
              </button>

            </div>

            <p className="text-xs text-slate-400 mt-2">
              Password: Dayflow2026!
            </p>
          </div>

          {/* Signup */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}

            <Link
              to="/signup"
              className="font-semibold text-slate-900 hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
