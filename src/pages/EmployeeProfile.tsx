import { useEffect, useState, type ChangeEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Textarea,
  Avatar,
  Spinner,
  Badge,
} from '@/components/ui';
import type { Employee, Payroll } from '@/lib/types';

import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  User as UserIcon,
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

  // --------------------------------------------------
  // LOAD EMPLOYEE + PAYROLL DATA
  // --------------------------------------------------

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  async function loadData() {
    if (!profile) return;

    setLoading(true);

    const [employeeResult, payrollResult] = await Promise.all([
      supabase
        .from('employees')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle(),

      supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', profile.id)
        .order('payroll_month', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (employeeResult.error) {
      console.error(
        'Employee loading error:',
        employeeResult.error.message
      );
    }

    if (payrollResult.error) {
      console.error(
        'Payroll loading error:',
        payrollResult.error.message
      );
    }

    setEmployee(employeeResult.data as Employee | null);
    setPayroll(payrollResult.data as Payroll | null);

    setPhone(profile.phone || '');
    setAddress(profile.address || '');
    setAvatarUrl(profile.avatar_url || '');

    setLoading(false);
  }

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    setSaveMsg(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        phone: phone.trim(),
        address: address.trim(),
        avatar_url: avatarUrl || null,
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Profile update error:', error);

      setSaveMsg('Failed to update profile');
      setSaving(false);
      return;
    }

    await refreshProfile();

    setEditing(false);
    setSaveMsg('Profile updated successfully');

    setTimeout(() => {
      setSaveMsg(null);
    }, 3000);

    setSaving(false);
  }

  // --------------------------------------------------
  // AVATAR UPLOAD
  // --------------------------------------------------

  function handleAvatarUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    // Limit file size to 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setSaveMsg('Image size must be less than 2 MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSaveMsg('Please select a valid image');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  // --------------------------------------------------
  // CANCEL EDIT
  // --------------------------------------------------

  function handleCancel() {
    if (!profile) return;

    setEditing(false);

    setPhone(profile.phone || '');
    setAddress(profile.address || '');
    setAvatarUrl(profile.avatar_url || '');

    setSaveMsg(null);
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          View and manage your personal information
        </p>
      </div>

      {/* SUCCESS / ERROR MESSAGE */}

      {saveMsg && (
        <div
          className={`p-3 rounded-lg text-sm ${
            saveMsg.includes('success')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {saveMsg}
        </div>
      )}

      {/* ==========================================
          PROFILE HEADER
      ========================================== */}

      <Card className="p-6">

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* PROFILE IMAGE */}

          <div className="relative">

            <Avatar
              name={profile?.full_name || 'User'}
              src={avatarUrl || profile?.avatar_url}
              size={96}
            />

            {editing && (
              <label
                className="
                  absolute
                  bottom-0
                  right-0
                  w-8
                  h-8
                  bg-slate-900
                  text-white
                  rounded-full
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  hover:bg-slate-800
                "
              >
                <Upload size={14} />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}

          </div>

          {/* USER DETAILS */}

          <div className="flex-1 text-center sm:text-left">

            <h2 className="text-xl font-bold text-slate-900">
              {profile?.full_name || 'User'}
            </h2>

            <p className="text-slate-500 text-sm">
              {employee?.designation || 'Employee'}
            </p>

            <div
              className="
                flex
                flex-wrap
                gap-2
                justify-center
                sm:justify-start
                mt-2
              "
            >

              <Badge variant="info">
                {profile?.role === 'admin'
                  ? 'Administrator'
                  : 'Employee'}
              </Badge>

              {employee?.department && (
                <Badge variant="neutral">
                  {employee.department}
                </Badge>
              )}

              {employee?.status === 'active' && (
                <Badge variant="success">
                  Active
                </Badge>
              )}

            </div>

          </div>

          {/* EDIT / SAVE BUTTONS */}

          <div>

            {!editing ? (

              <Button
                variant="secondary"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>

            ) : (

              <div className="flex gap-2">

                <Button
                  variant="ghost"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} />

                  {saving
                    ? 'Saving...'
                    : 'Save'}
                </Button>

              </div>

            )}

          </div>

        </div>

      </Card>

      {/* ==========================================
          PERSONAL + JOB INFORMATION
      ========================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PERSONAL INFORMATION */}

        <Card>

          <CardHeader title="Personal Information" />

          <div className="p-6 space-y-4">

            {/* FULL NAME */}

            <ProfileRow
              icon={<UserIcon size={18} />}
              label="Full Name"
              value={profile?.full_name}
            />

            {/* EMAIL */}

            <ProfileRow
              icon={<Mail size={18} />}
              label="Email"
              value={profile?.email}
            />

            {/* PHONE */}

            <div className="flex items-start gap-3">

              <Phone
                size={18}
                className="text-slate-400 mt-0.5 shrink-0"
              />

              <div className="flex-1">

                <p className="text-xs text-slate-500">
                  Phone
                </p>

                {editing ? (

                  <Input
                    value={phone}
                    onChange={setPhone}
                    placeholder="Enter phone number"
                  />

                ) : (

                  <p className="text-sm font-medium text-slate-900">
                    {profile?.phone || 'Not set'}
                  </p>

                )}

              </div>

            </div>

            {/* ADDRESS */}

            <div className="flex items-start gap-3">

              <MapPin
                size={18}
                className="text-slate-400 mt-0.5 shrink-0"
              />

              <div className="flex-1">

                <p className="text-xs text-slate-500">
                  Address
                </p>

                {editing ? (

                  <Textarea
                    value={address}
                    onChange={setAddress}
                    placeholder="Enter your address"
                    rows={2}
                  />

                ) : (

                  <p className="text-sm font-medium text-slate-900">
                    {profile?.address || 'Not set'}
                  </p>

                )}

              </div>

            </div>

          </div>

        </Card>

        {/* JOB INFORMATION */}

        <Card>

          <CardHeader title="Job Information" />

          <div className="p-6 space-y-4">

            <ProfileRow
              icon={<Briefcase size={18} />}
              label="Employee ID"
              value={profile?.employee_id}
            />

            <ProfileRow
              icon={<Building2 size={18} />}
              label="Department"
              value={employee?.department}
            />

            <ProfileRow
              icon={<Briefcase size={18} />}
              label="Designation"
              value={employee?.designation}
            />

            <ProfileRow
              icon={<Calendar size={18} />}
              label="Join Date"
              value={
                employee?.join_date
                  ? new Date(
                      employee.join_date
                    ).toLocaleDateString(
                      'en-IN',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )
                  : null
              }
            />

            <ProfileRow
              icon={<UserIcon size={18} />}
              label="Manager"
              value={employee?.manager}
            />

            <ProfileRow
              icon={<MapPin size={18} />}
              label="Work Location"
              value={employee?.work_location}
            />

            <ProfileRow
              icon={<FileText size={18} />}
              label="Employment Type"
              value={employee?.employment_type}
            />

          </div>

        </Card>

      </div>

      {/* ==========================================
          SALARY INFORMATION
      ========================================== */}

      {payroll && (

        <Card>

          <CardHeader
            title="Salary Information"
            subtitle={`Payroll for ${payroll.payroll_month}`}
          />

          <div className="p-6">

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                gap-4
              "
            >

              <SalaryItem
                label="Base Salary"
                value={payroll.base_salary}
              />

              <SalaryItem
                label="House Rent Allowance"
                value={payroll.hra}
              />

              <SalaryItem
                label="Dearness Allowance"
                value={payroll.da}
              />

              <SalaryItem
                label="Transport Allowance"
                value={payroll.transport_allowance}
              />

              <SalaryItem
                label="Medical Allowance"
                value={payroll.medical_allowance}
              />

              {/* TAX */}

              <div
                className="
                  p-4
                  rounded-lg
                  bg-rose-50
                  border
                  border-rose-100
                "
              >

                <p className="text-xs text-rose-600">
                  Tax Deduction
                </p>

                <p className="text-lg font-bold text-rose-700">
                  -₹{payroll.tax_deduction.toLocaleString('en-IN')}
                </p>

              </div>

              {/* PF */}

              <div
                className="
                  p-4
                  rounded-lg
                  bg-rose-50
                  border
                  border-rose-100
                "
              >

                <p className="text-xs text-rose-600">
                  Provident Fund
                </p>

                <p className="text-lg font-bold text-rose-700">
                  -₹{payroll.provident_fund.toLocaleString('en-IN')}
                </p>

              </div>

              {/* NET SALARY */}

              <div
                className="
                  p-4
                  rounded-lg
                  bg-slate-900
                  text-white
                "
              >

                <p className="text-xs text-slate-300">
                  Net Salary
                </p>

                <p className="text-lg font-bold">
                  ₹{payroll.net_salary.toLocaleString('en-IN')}
                </p>

              </div>

            </div>

          </div>

        </Card>

      )}

      {/* ==========================================
          DOCUMENTS
      ========================================== */}

      <Card>

        <CardHeader
          title="Documents"
          subtitle="Your employment documents"
        />

        <div className="p-6">

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
            "
          >

            {[
              {
                name: 'Employment Contract',
                date: 'Signed on join date',
              },
              {
                name: 'Offer Letter',
                date: 'Issued by HR',
              },
              {
                name: 'ID Verification',
                date: 'Verified',
              },
            ].map((doc) => (

              <div
                key={doc.name}
                className="
                  flex
                  items-center
                  gap-3
                  p-4
                  rounded-lg
                  border
                  border-slate-200
                  hover:border-slate-300
                  transition-colors
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    rounded-lg
                    bg-slate-100
                    text-slate-500
                    flex
                    items-center
                    justify-center
                  "
                >
                  <FileText size={20} />
                </div>

                <div className="flex-1 min-w-0">

                  <p className="text-sm font-medium text-slate-900 truncate">
                    {doc.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {doc.date}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </Card>

    </div>
  );
}

// ==================================================
// REUSABLE PROFILE ROW
// ==================================================

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="text-slate-400 mt-0.5 shrink-0">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="text-sm font-medium text-slate-900">
          {value || '—'}
        </p>

      </div>

    </div>
  );
}

// ==================================================
// SALARY ITEM
// ==================================================

function SalaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      className="
        p-4
        rounded-lg
        bg-slate-50
        border
        border-slate-100
      "
    >

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="text-lg font-bold text-slate-900">
        ₹{value.toLocaleString('en-IN')}
      </p>

    </div>
  );
}
