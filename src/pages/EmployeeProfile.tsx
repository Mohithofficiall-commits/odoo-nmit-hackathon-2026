import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Button, Input, Textarea, Avatar, Spinner, Badge } from '@/components/ui';
import type { Employee, Payroll } from '@/lib/types';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  User as UserIcon,
  Wallet,
  FileText,
  Save,
  Upload,
} from 'lucide-react';

export function EmployeeProfile() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  async function loadData() {
    setLoading(true);
    const [empRes, payrollRes] = await Promise.all([
      supabase.from('employees').select('*').eq('profile_id', profile!.id).maybeSingle(),
      supabase.from('payroll').select('*').eq('employee_id', profile!.id).order('payroll_month', { ascending: false }).limit(1).maybeSingle(),
    ]);
    setEmployee(empRes.data as Employee | null);
    setPayroll(payrollRes.data as Payroll | null);
    setPhone(profile!.phone || '');
    setAddress(profile!.address || '');
    setAvatarUrl(profile!.avatar_url || '');
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    const { error } = await supabase
      .from('profiles')
      .update({ phone, address, avatar_url: avatarUrl || null })
      .eq('id', profile!.id);

    if (!error) {
      await refreshProfile();
      setEditing(false);
      setSaveMsg('Profile updated successfully');
      setTimeout(() => setSaveMsg(null), 3000);
    } else {
      setSaveMsg('Failed to update profile');
    }
    setSaving(false);
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
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
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage your personal information</p>
      </div>

      {saveMsg && (
        <div className={`p-3 rounded-lg text-sm ${saveMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {saveMsg}
        </div>
      )}

      {/* Profile header card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <Avatar name={profile?.full_name || 'User'} src={avatarUrl || profile?.avatar_url} size={96} />
            {editing && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-800">
                <Upload size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">{profile?.full_name}</h2>
            <p className="text-slate-500 text-sm">{employee?.designation || 'Employee'}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
              <Badge variant="info">{profile?.role === 'admin' ? 'Administrator' : 'Employee'}</Badge>
              {employee?.department && <Badge variant="neutral">{employee.department}</Badge>}
              {employee?.status === 'active' && <Badge variant="success">Active</Badge>}
            </div>
          </div>
          <div>
            {!editing ? (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setEditing(false); setPhone(profile?.phone || ''); setAddress(profile?.address || ''); setAvatarUrl(profile?.avatar_url || ''); }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader title="Personal Information" />
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <UserIcon size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Phone</p>
                {editing ? (
                  <Input value={phone} onChange={setPhone} placeholder="Enter phone number" />
                ) : (
                  <p className="text-sm font-medium text-slate-900">{profile?.phone || 'Not set'}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Address</p>
                {editing ? (
                  <Textarea value={address} onChange={setAddress} placeholder="Enter your address" rows={2} />
                ) : (
                  <p className="text-sm font-medium text-slate-900">{profile?.address || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Job Information */}
        <Card>
          <CardHeader title="Job Information" />
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Employee ID</p>
                <p className="text-sm font-medium text-slate-900">{profile?.employee_id || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Department</p>
                <p className="text-sm font-medium text-slate-900">{employee?.department || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Designation</p>
                <p className="text-sm font-medium text-slate-900">{employee?.designation || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Join Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee?.join_date ? new Date(employee.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserIcon size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Manager</p>
                <p className="text-sm font-medium text-slate-900">{employee?.manager || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Work Location</p>
                <p className="text-sm font-medium text-slate-900">{employee?.work_location || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Employment Type</p>
                <p className="text-sm font-medium text-slate-900">{employee?.employment_type || '—'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Salary Information */}
      {payroll && (
        <Card>
          <CardHeader title="Salary Information" subtitle={`Payroll for ${payroll.payroll_month}`} />
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SalaryItem label="Base Salary" value={payroll.base_salary} />
              <SalaryItem label="House Rent Allowance" value={payroll.hra} />
              <SalaryItem label="Dearness Allowance" value={payroll.da} />
              <SalaryItem label="Transport Allowance" value={payroll.transport_allowance} />
              <SalaryItem label="Medical Allowance" value={payroll.medical_allowance} />
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                <p className="text-xs text-rose-600">Tax Deduction</p>
                <p className="text-lg font-bold text-rose-700">-${payroll.tax_deduction.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                <p className="text-xs text-rose-600">Provident Fund</p>
                <p className="text-lg font-bold text-rose-700">-${payroll.provident_fund.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-900 text-white">
                <p className="text-xs text-slate-300">Net Salary</p>
                <p className="text-lg font-bold">${payroll.net_salary.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Documents section */}
      <Card>
        <CardHeader title="Documents" subtitle="Your employment documents" />
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Employment Contract', date: 'Signed on join date', icon: <FileText size={20} /> },
              { name: 'Offer Letter', date: 'Issued by HR', icon: <FileText size={20} /> },
              { name: 'ID Verification', date: 'Verified', icon: <FileText size={20} /> },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function SalaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900">${value.toLocaleString()}</p>
    </div>
  );
}
