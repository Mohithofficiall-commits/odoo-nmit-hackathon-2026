import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 24 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-slate-400" />;
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Spinner size={32} />
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' }) {
  const styles: Record<string, string> = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    error: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  type = 'button',
  className = '',
  fullWidth = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  fullWidth?: boolean;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50',
    ghost: 'text-slate-600 hover:bg-slate-100 disabled:opacity-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  icon,
}: {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 ${icon ? 'pl-10' : ''} ${error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400' : ''}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 3,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none resize-none"
      />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!open) return null;
  const sizes: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-slate-900">Something went wrong</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 text-sm font-medium text-slate-900 underline hover:text-slate-700">
          Try again
        </button>
      )}
    </div>
  );
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover" />;
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}
