import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardHeader,
  Spinner,
  EmptyState,
} from '@/components/ui';
import type { Payroll } from '@/lib/types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';

export function EmployeePayroll() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState<Payroll | null>(null);

  useEffect(() => {
    if (profile) {
      loadPayroll();
    }
  }, [profile]);

  async function loadPayroll() {
    if (!profile) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', profile.id)
      .order('payroll_month', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Failed to load payroll:', error);
      setPayroll(null);
    } else {
      setPayroll(data as Payroll | null);
    }

    setLoading(false);
  }

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  /* ---------------- NO PAYROLL ---------------- */

  if (!payroll) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payroll
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            View your salary and payroll information
          </p>
        </div>

        <Card>
          <EmptyState
            icon={<Wallet size={24} />}
            title="No payroll records"
            message="Your salary information will appear here once HR sets up your payroll."
          />
        </Card>
      </div>
    );
  }

  /* ---------------- EARNINGS ---------------- */

  const earnings = [
    {
      label: 'Base Salary',
      value: payroll.base_salary,
    },
    {
      label: 'House Rent Allowance',
      value: payroll.hra,
    },
    {
      label: 'Dearness Allowance',
      value: payroll.da,
    },
    {
      label: 'Transport Allowance',
      value: payroll.transport_allowance,
    },
    {
      label: 'Medical Allowance',
      value: payroll.medical_allowance,
    },
  ];

  const totalEarnings = earnings.reduce(
    (total, item) => total + Number(item.value || 0),
    0
  );

  /* ---------------- DEDUCTIONS ---------------- */

  const deductions = [
    {
      label: 'Tax Deduction',
      value: payroll.tax_deduction,
    },
    {
      label: 'Provident Fund',
      value: payroll.provident_fund,
    },
  ];

  const totalDeductions = deductions.reduce(
    (total, item) => total + Number(item.value || 0),
    0
  );

  /* ---------------- NET SALARY ---------------- */

  const calculatedNetSalary =
    totalEarnings - totalDeductions;

  const netSalary =
    Number(payroll.net_salary ?? calculatedNetSalary);

  /* ---------------- FORMAT MONEY ---------------- */

  function formatMoney(value: number) {
    return `$${Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Payroll
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          Your salary structure for {payroll.payroll_month}
        </p>
      </div>

      {/* NET SALARY */}

      <Card className="overflow-hidden">
        <div className="bg-slate-900 text-white p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-300">
                Net Monthly Salary
              </p>

              <p className="text-4xl font-bold mt-1">
                {formatMoney(netSalary)}
              </p>
            </div>

            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <Wallet size={28} />
            </div>

          </div>

          {/* SUMMARY */}

          <div className="flex flex-wrap gap-8 mt-6">

            <div>
              <p className="text-xs text-slate-400">
                Gross Earnings
              </p>

              <p className="text-lg font-semibold">
                {formatMoney(totalEarnings)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Total Deductions
              </p>

              <p className="text-lg font-semibold">
                {formatMoney(totalDeductions)}
              </p>
            </div>

          </div>
        </div>
      </Card>

      {/* EARNINGS + DEDUCTIONS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* EARNINGS */}

        <Card>

          <CardHeader
            title="Earnings"
            subtitle="Monthly salary components"
          />

          <div className="p-6 space-y-3">

            {earnings.map((item) => (

              <div
                key={item.label}
                className="flex items-center justify-between"
              >

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>

                  <span className="text-sm text-slate-700">
                    {item.label}
                  </span>

                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {formatMoney(Number(item.value))}
                </span>

              </div>

            ))}

            {/* TOTAL */}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">

              <span className="text-sm font-semibold text-slate-900">
                Total Earnings
              </span>

              <span className="text-base font-bold text-emerald-600">
                {formatMoney(totalEarnings)}
              </span>

            </div>

          </div>

        </Card>

        {/* DEDUCTIONS */}

        <Card>

          <CardHeader
            title="Deductions"
            subtitle="Monthly deductions"
          />

          <div className="p-6 space-y-3">

            {deductions.map((item) => (

              <div
                key={item.label}
                className="flex items-center justify-between"
              >

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <TrendingDown size={16} />
                  </div>

                  <span className="text-sm text-slate-700">
                    {item.label}
                  </span>

                </div>

                <span className="text-sm font-semibold text-rose-600">
                  -{formatMoney(Number(item.value))}
                </span>

              </div>

            ))}

            {/* TOTAL */}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">

              <span className="text-sm font-semibold text-slate-900">
                Total Deductions
              </span>

              <span className="text-base font-bold text-rose-600">
                -{formatMoney(totalDeductions)}
              </span>

            </div>

          </div>

        </Card>

      </div>

      {/* SALARY SLIP */}

      <Card>

        <CardHeader
          title="Salary Slip Summary"
          subtitle={`For the month of ${payroll.payroll_month}`}
        />

        <div className="p-6">

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">

            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Receipt size={20} />
            </div>

            <div className="flex-1">

              <p className="text-sm font-semibold text-slate-900">
                Net Pay
              </p>

              <p className="text-xs text-slate-500">
                Gross earnings minus total deductions
              </p>

            </div>

            <p className="text-2xl font-bold text-slate-900">
              {formatMoney(netSalary)}
            </p>

          </div>

        </div>

      </Card>

    </div>
  );
}
