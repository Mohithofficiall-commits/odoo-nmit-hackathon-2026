import { useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface PayslipData {
  employeeName?: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  payPeriod?: string;
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  netSalary?: number;
}

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip?: PayslipData;
}

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function PayslipModal({
  isOpen,
  onClose,
  payslip = {},
}: PayslipModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const basicSalary = payslip.basicSalary ?? 0;
  const allowances = payslip.allowances ?? 0;
  const deductions = payslip.deductions ?? 0;

  const grossSalary = basicSalary + allowances;
  const calculatedNetSalary = grossSalary - deductions;
  const netSalary = payslip.netSalary ?? calculatedNetSalary;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Payslip"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Payslip
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {payslip.payPeriod ?? 'Current Pay Period'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Print / Export
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close payslip"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row dark:border-slate-700">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Payslip
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Salary statement
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {payslip.employeeName ?? 'Employee'}
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Employee ID: {payslip.employeeId ?? '—'}
              </p>
            </div>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Employee
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {payslip.employeeName ?? '—'}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Designation
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {payslip.designation ?? '—'}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Department
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {payslip.department ?? '—'}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <span>Earnings</span>
              <span className="text-right">Amount</span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              <div className="grid grid-cols-2 px-5 py-4">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Basic Salary
                </span>

                <span className="text-right text-sm font-medium text-slate-900 dark:text-white">
                  {formatCurrency(basicSalary)}
                </span>
              </div>

              <div className="grid grid-cols-2 px-5 py-4">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Allowances
                </span>

                <span className="text-right text-sm font-medium text-slate-900 dark:text-white">
                  {formatCurrency(allowances)}
                </span>
              </div>

              <div className="grid grid-cols-2 bg-slate-50 px-5 py-4 dark:bg-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Gross Salary
                </span>

                <span className="text-right text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(grossSalary)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <span>Deductions</span>
              <span className="text-right">Amount</span>
            </div>

            <div className="grid grid-cols-2 px-5 py-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Total Deductions
              </span>

              <span className="text-right text-sm font-medium text-red-600">
                -{formatCurrency(deductions)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-900 px-5 py-5 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-300">
                Net Salary
              </p>

              <p className="text-xs text-slate-400">
                Amount payable
              </p>
            </div>

            <p className="text-2xl font-bold text-white">
              {formatCurrency(netSalary)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}