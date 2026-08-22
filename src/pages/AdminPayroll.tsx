import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Button, Badge, Spinner, EmptyState, Avatar, Modal, Input } from '@/components/ui';
import type { PayrollWithProfile } from '@/lib/types';
import {
  Wallet,
  Search,
  Pencil,
  TrendingUp,
  TrendingDown,
  Save,
} from 'lucide-react';

export function AdminPayroll() {
  const [loading, setLoading] = useState(true);
  const [payrolls, setPayrolls] = useState<PayrollWithProfile[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<PayrollWithProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [baseSalary, setBaseSalary] = useState('');
  const [hra, setHra] = useState('');
  const [da, setDa] = useState('');
  const [transport, setTransport] = useState('');
  const [medical, setMedical] = useState('');
  const [tax, setTax] = useState('');
  const [pf, setPf] = useState('');

  useEffect(() => {
    loadPayrolls();
  }, []);

  async function loadPayrolls() {
    setLoading(true);
    const { data } = await supabase
      .from('payroll')
      .select('*, profiles(full_name, employee_id, avatar_url), employees(department, designation)')
      .order('payroll_month', { ascending: false });
    setPayrolls((data || []) as PayrollWithProfile[]);
    setLoading(false);
  }

  const filtered = payrolls.filter((p) => {
    return !search ||
      p.profiles?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.profiles?.employee_id?.toLowerCase().includes(search.toLowerCase());
  });

  // Deduplicate: show only latest payroll per employee
  const seenEmployees = new Set<string>();
  const latestPayrolls = filtered.filter((p) => {
    if (seenEmployees.has(p.employee_id)) return false;
    seenEmployees.add(p.employee_id);
    return true;
  });

  function openEdit(p: PayrollWithProfile) {
    setEditing(p);
    setBaseSalary(String(p.base_salary));
    setHra(String(p.hra));
    setDa(String(p.da));
    setTransport(String(p.transport_allowance));
    setMedical(String(p.medical_allowance));
    setTax(String(p.tax_deduction));
    setPf(String(p.provident_fund));
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setSaveMsg(null);
    const { error } = await supabase
      .from('payroll')
      .update({
        base_salary: parseFloat(baseSalary) || 0,
        hra: parseFloat(hra) || 0,
        da: parseFloat(da) || 0,
        transport_allowance: parseFloat(transport) || 0,
        medical_allowance: parseFloat(medical) || 0,
        tax_deduction: parseFloat(tax) || 0,
        provident_fund: parseFloat(pf) || 0,
      })
      .eq('id', editing.id);

    if (!error) {
      setSaveMsg('Payroll updated successfully');
      setTimeout(() => {
        setEditing(null);
        setSaveMsg(null);
        loadPayrolls();
      }, 1000);
    } else {
      setSaveMsg('Failed to update payroll');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage salary structures for all employees</p>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <Input value={search} onChange={setSearch} placeholder="Search by name or ID..." icon={<Search size={18} />} />
      </div>

      {/* Payroll table */}
      <Card>
        <CardHeader title="Employee Payroll" subtitle={`Current month: ${new Date().toISOString().slice(0, 7)}`} />
        {latestPayrolls.length === 0 ? (
          <EmptyState icon={<Wallet size={24} />} title="No payroll records" message="No payroll records found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Department</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Base</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Allowances</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Deductions</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Net Salary</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {latestPayrolls.map((p) => {
                  const allowances = p.hra + p.da + p.transport_allowance + p.medical_allowance;
                  const deductions = p.tax_deduction + p.provident_fund;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.profiles?.full_name || 'User'} src={p.profiles?.avatar_url} size={32} />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{p.profiles?.full_name}</p>
                            <p className="text-xs text-slate-500">{p.profiles?.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-600 hidden md:table-cell">{p.employees?.department || '—'}</td>
                      <td className="px-6 py-3.5 text-sm text-slate-600 text-right hidden sm:table-cell">${p.base_salary.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-sm text-emerald-600 text-right hidden lg:table-cell">+${allowances.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-sm text-rose-600 text-right hidden lg:table-cell">-${deductions.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-sm font-bold text-slate-900 text-right">${p.net_salary.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => { setEditing(null); setSaveMsg(null); }} title="Edit Payroll" size="lg">
        {saveMsg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${saveMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {saveMsg}
          </div>
        )}
        {editing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Avatar name={editing.profiles?.full_name || 'User'} src={editing.profiles?.avatar_url} size={40} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{editing.profiles?.full_name}</p>
                <p className="text-xs text-slate-500">{editing.profiles?.employee_id} · {editing.employees?.designation}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Earnings</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Base Salary" type="number" value={baseSalary} onChange={setBaseSalary} />
                <Input label="House Rent Allowance" type="number" value={hra} onChange={setHra} />
                <Input label="Dearness Allowance" type="number" value={da} onChange={setDa} />
                <Input label="Transport Allowance" type="number" value={transport} onChange={setTransport} />
                <Input label="Medical Allowance" type="number" value={medical} onChange={setMedical} />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><TrendingDown size={16} className="text-rose-500" /> Deductions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Tax Deduction" type="number" value={tax} onChange={setTax} />
                <Input label="Provident Fund" type="number" value={pf} onChange={setPf} />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 text-white flex items-center justify-between">
              <span className="text-sm text-slate-300">Net Salary</span>
              <span className="text-xl font-bold">
                ${((parseFloat(baseSalary) || 0) + (parseFloat(hra) || 0) + (parseFloat(da) || 0) + (parseFloat(transport) || 0) + (parseFloat(medical) || 0) - (parseFloat(tax) || 0) - (parseFloat(pf) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setEditing(null); setSaveMsg(null); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
