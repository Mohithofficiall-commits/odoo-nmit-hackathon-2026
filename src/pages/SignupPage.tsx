import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button, Input, Select } from '@/components/ui';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

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

  // NEW: Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!employeeId.trim()) {
      setError('Please enter your employee ID');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await signUp({
      email: email.trim(),
      password,
      full_name: fullName.trim(),
      employee_id: employeeId.trim().toUpperCase(),
      role: role as 'admin' | 'employee',
    });

    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
  }

  // Password strength
  function getPasswordStrength() {
    if (!password) return '';

    if (password.length < 6) {
      return 'Weak';
    }

    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return 'Strong';
    }

    return 'Medium';
  }

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm text-center">

          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2
              size={32}
              className="text-emerald-600"
            />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Account created
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            Your account has been created successfully.
            Please sign in with your credentials.
          </p>

          <Button
            onClick={() => navigate('/login')}
            fullWidth
            size="lg"
          >
            Go to sign in
          </Button>

        </div>
      </div>
    );
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
              <CalendarClock
                size={20}
                className="text-slate-900"
              />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Dayflow
            </span>

          </div>

        </div>

        <div className="relative z-10">

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Join the
            <br />
            workforce
          </h1>

          <p className="text-slate-400 text-lg max-w-md">
            Create your account to start managing
            attendance, leaves, and payroll.
          </p>

        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2026 Dayflow HRMS
        </div>

      </div>

      {/* Form section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">

        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">

            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">

              <CalendarClock
                size={20}
                className="text-white"
              />

            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Dayflow
            </span>

          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Create account
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            Fill in your details to get started
          </p>

          {/* Error */}
          {error && (

            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">

              <AlertCircle
                size={18}
                className="shrink-0 mt-0.5"
              />

              <span>{error}</span>

            </div>

          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Full name */}
            <Input
              label="Full name"
              value={fullName}
              onChange={setFullName}
              placeholder="John Doe"
              required
              icon={<User size={18} />}
            />

            {/* Employee ID */}
            <Input
              label="Employee ID"
              value={employeeId}
              onChange={(value) =>
                setEmployeeId(value.toUpperCase())
              }
              placeholder="EMP-009"
              required
              icon={<User size={18} />}
            />

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

            {/* Password */}
            <div>

              <div className="relative">

                <Input
                  label="Password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 6 characters"
                  required
                  icon={<Lock size={18} />}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {/* Password strength */}
              {password && (

                <div className="mt-2">

                  <div className="flex items-center justify-between mb-1">

                    <span className="text-xs text-slate-500">
                      Password strength
                    </span>

                    <span
                      className={`text-xs font-semibold ${
                        passwordStrength === 'Strong'
                          ? 'text-emerald-600'
                          : passwordStrength === 'Medium'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {passwordStrength}
                    </span>

                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className={`h-full transition-all ${
                        passwordStrength === 'Strong'
                          ? 'w-full bg-emerald-500'
                          : passwordStrength === 'Medium'
                          ? 'w-2/3 bg-amber-500'
                          : 'w-1/3 bg-rose-500'
                      }`}
                    />

                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Use 8+ characters with uppercase
                    letters and numbers for a strong password.
                  </p>

                </div>

              )}

            </div>

            {/* Confirm password */}
            <div className="relative">

              <Input
                label="Confirm password"
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter password"
                required
                icon={<Lock size={18} />}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700"
                aria-label={
                  showConfirmPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

              {/* Live password match */}
              {confirmPassword && (

                <div
                  className={`flex items-center gap-1 mt-1 text-xs ${
                    password === confirmPassword
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >

                  <CheckCircle2 size={13} />

                  {password === confirmPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'}

                </div>

              )}

            </div>

            {/* Role */}
            <Select
              label="Role"
              value={role}
              onChange={setRole}
              required
              options={[
                {
                  value: 'employee',
                  label: 'Employee',
                },
                {
                  value: 'admin',
                  label: 'Admin / HR',
                },
              ]}
            />

            {/* Security info */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">

              <ShieldCheck
                size={17}
                className="text-blue-600 shrink-0 mt-0.5"
              />

              <p className="text-xs text-blue-700">
                Your account information is securely
                stored and used only for HR management.
              </p>

            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              size="lg"
            >
              {loading
                ? 'Creating account...'
                : 'Create account'}
            </Button>

          </form>

          {/* Login */}
          <p className="text-center text-sm text-slate-500 mt-6">

            Already have an account?{' '}

            <Link
              to="/login"
              className="font-semibold text-slate-900 hover:underline"
            >
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}
