import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Spinner, EmptyState } from '@/components/ui';
import type { Payroll } from '@/lib/types';
import { Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

export function EmployeePayroll() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState<Payroll | null>(null);

  useEffect(() => {
    if (profile) loadPayroll();
  }, [profile]);

  async function loadPayroll() {
    setLoading(true);
    const { data } = await supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', profile!.id)
      .order('payroll_month', { ascending: false })
      .limit(1)
      .maybeSingle();
    setPayroll(data as Payroll | null);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
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

  const earnings = [
    { label: 'Base Salary', value: payroll.base_salary },
    { label: 'House Rent Allowance', value: payroll.hra },
    { label: 'Dearness Allowance', value: payroll.da },
    { label: 'Transport Allowance', value: payroll.transport_allowance },
    { label: 'Medical Allowance', value: payroll.medical_allowance },
  ];
  const totalEarnings = earnings.reduce((s, e) => s + e.value, 0);

  const deductions = [
    { label: 'Tax Deduction', value: payroll.tax_deduction },
    { label: 'Provident Fund', value: payroll.provident_fund },
  ];
  const totalDeductions = deductions.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
        <p className="text-slate-500 text-sm mt-1">Your salary structure for {payroll.payroll_month}</p>
      </div>

      {/* Net salary hero card */}
      <Card className="overflow-hidden">
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Net Monthly Salary</p>
              <p className="text-4xl font-bold mt-1">${payroll.net_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <Wallet size={28} />
            </div>
          </div>
          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-xs text-slate-400">Gross Earnings</p>
              <p className="text-lg font-semibold">${totalEarnings.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Deductions</p>
              <p className="text-lg font-semibold">${totalDeductions.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings */}
        <Card>
          <CardHeader title="Earnings" subtitle="Monthly salary components" />
          <div className="p-6 space-y-3">
            {earnings.map((e) => (
              <div key={e.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-sm text-slate-700">{e.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">${e.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Total Earnings</span>
              <span className="text-base font-bold text-emerald-600">${totalEarnings.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader title="Deductions" subtitle="Monthly deductions" />
          <div className="p-6 space-y-3">
            {deductions.map((d) => (
              <div key={d.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <TrendingDown size={16} />
                  </div>
                  <span className="text-sm text-slate-700">{d.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">-${d.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Total Deductions</span>
              <span className="text-base font-bold text-rose-600">-${totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Salary slip summary */}
      <Card>
        <CardHeader title="Salary Slip Summary" subtitle={`For the month of ${payroll.payroll_month}`} />
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Net Pay</p>
              <p className="text-xs text-slate-500">Gross earnings minus total deductions</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">${payroll.net_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
