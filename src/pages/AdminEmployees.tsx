import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Spinner,
  EmptyState,
  Avatar,
  Modal,
  Input,
  Select,
} from '@/components/ui';
import type { EmployeeWithProfile } from '@/lib/types';
import {
  Users,
  Search,
  Eye,
  Pencil,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  Download,
  UserCheck,
  UserX,
} from 'lucide-react';

export function AdminEmployees() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState<EmployeeWithProfile[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [viewing, setViewing] = useState<EmployeeWithProfile | null>(null);
  const [editing, setEditing] = useState<EmployeeWithProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Edit form state
  const [editDept, setEditDept] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editType, setEditType] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editManager, setEditManager] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);

    const { data } = await supabase
      .from('employees')
      .select(
        '*, profiles(full_name, email, phone, address, avatar_url, role)'
      )
      .order('employee_id', { ascending: true });

    const emps = (data || []) as EmployeeWithProfile[];

    setEmployees(emps);

    const depts = [
      ...new Set(
        emps.map((e) => e.department).filter(Boolean)
      ),
    ] as string[];

    setDepartments(depts);
    setLoading(false);
    setRefreshing(false);
  }

  // NEW: Refresh
  async function handleRefresh() {
    setRefreshing(true);
    await loadEmployees();
  }

  // NEW: Export CSV
  function exportEmployees() {
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Department',
      'Designation',
      'Employment Type',
      'Status',
      'Manager',
      'Work Location',
      'Phone',
    ];

    const rows = filtered.map((emp) => [
      emp.employee_id,
      emp.profiles?.full_name || '',
      emp.profiles?.email || '',
      emp.department || '',
      emp.designation || '',
      emp.employment_type || '',
      emp.status || '',
      emp.manager || '',
      emp.work_location || '',
      emp.profiles?.phone || '',
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'employees.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  const filtered = employees.filter((e) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      e.profiles?.full_name
        ?.toLowerCase()
        .includes(searchText) ||
      e.employee_id
        ?.toLowerCase()
        .includes(searchText) ||
      e.profiles?.email
        ?.toLowerCase()
        .includes(searchText);

    const matchesDept =
      !deptFilter || e.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  // NEW: Statistics
  const activeEmployees = employees.filter(
    (e) => e.status === 'active'
  ).length;

  const inactiveEmployees = employees.filter(
    (e) => e.status !== 'active'
  ).length;

  function openEdit(emp: EmployeeWithProfile) {
    setEditing(emp);
    setEditDept(emp.department || '');
    setEditDesignation(emp.designation || '');
    setEditType(emp.employment_type || 'Full-time');
    setEditStatus(emp.status || 'active');
    setEditManager(emp.manager || '');
    setEditLocation(emp.work_location || '');
    setEditPhone(emp.profiles?.phone || '');
    setEditAddress(emp.profiles?.address || '');
  }

  async function handleSaveEdit() {
    if (!editing) return;

    setSaving(true);
    setSaveMsg(null);

    const { error: empError } = await supabase
      .from('employees')
      .update({
        department: editDept,
        designation: editDesignation,
        employment_type: editType,
        status: editStatus,
        manager: editManager,
        work_location: editLocation,
      })
      .eq('id', editing.id);

    if (empError) {
      setSaveMsg('Failed to update employee');
      setSaving(false);
      return;
    }

    if (editing.profile_id) {
      await supabase
        .from('profiles')
        .update({
          phone: editPhone,
          address: editAddress,
        })
        .eq('id', editing.profile_id);
    }

    setSaveMsg('Employee updated successfully');
    setSaving(false);

    setTimeout(() => {
      setEditing(null);
      setSaveMsg(null);
      loadEmployees();
    }, 1000);
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Employees
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage and view all employee records
          </p>
        </div>

        {/* NEW: Header actions */}
        <div className="flex gap-2">

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={exportEmployees}
          >
            <Download size={16} />
            Export CSV
          </Button>

        </div>

      </div>

      {/* NEW: Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users size={20} />
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">
                {employees.length}
              </p>

              <p className="text-sm text-slate-500">
                Total Employees
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={20} />
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">
                {activeEmployees}
              </p>

              <p className="text-sm text-slate-500">
                Active Employees
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX size={20} />
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">
                {inactiveEmployees}
              </p>

              <p className="text-sm text-slate-500">
                Inactive Employees
              </p>
            </div>
          </div>
        </Card>

      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">

        <div className="flex-1">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search by name, ID, or email..."
            icon={<Search size={18} />}
          />
        </div>

        <div className="sm:w-56">
          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            placeholder="All Departments"
            options={departments.map((d) => ({
              value: d,
              label: d,
            }))}
          />
        </div>

      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {filtered.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-700">
            {employees.length}
          </span>{' '}
          employees
        </p>
      </div>

      {/* Employee table */}
      <Card>

        {filtered.length === 0 ? (

          <EmptyState
            icon={<Users size={24} />}
            title="No employees found"
            message="Try adjusting your search or filter criteria."
          />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-100">

                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Employee
                  </th>

                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                    Department
                  </th>

                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                    Designation
                  </th>

                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                    Status
                  </th>

                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">

                {filtered.map((emp) => (

                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-6 py-3.5">

                      <div className="flex items-center gap-3">

                        <Avatar
                          name={
                            emp.profiles?.full_name ||
                            'User'
                          }
                          src={
                            emp.profiles?.avatar_url
                          }
                          size={36}
                        />

                        <div>

                          <p className="text-sm font-medium text-slate-900">
                            {emp.profiles?.full_name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {emp.employee_id} ·{' '}
                            {emp.profiles?.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-3.5 text-sm text-slate-600 hidden md:table-cell">
                      {emp.department || '—'}
                    </td>

                    <td className="px-6 py-3.5 text-sm text-slate-600 hidden lg:table-cell">
                      {emp.designation || '—'}
                    </td>

                    <td className="px-6 py-3.5 hidden sm:table-cell">

                      <Badge
                        variant={
                          emp.status === 'active'
                            ? 'success'
                            : 'neutral'
                        }
                      >
                        {emp.status}
                      </Badge>

                    </td>

                    <td className="px-6 py-3.5">

                      <div className="flex items-center justify-end gap-1">

                        <button
                          onClick={() =>
                            setViewing(emp)
                          }
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() =>
                            openEdit(emp)
                          }
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* View Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Employee Details"
        size="lg"
      >

        {viewing && (

          <div className="space-y-6">

            <div className="flex items-center gap-4">

              <Avatar
                name={
                  viewing.profiles?.full_name ||
                  'User'
                }
                src={
                  viewing.profiles?.avatar_url
                }
                size={64}
              />

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {viewing.profiles?.full_name}
                </h3>

                <p className="text-sm text-slate-500">
                  {viewing.designation} ·{' '}
                  {viewing.department}
                </p>

                <div className="flex gap-2 mt-1">

                  <Badge variant="info">
                    {viewing.employee_id}
                  </Badge>

                  <Badge
                    variant={
                      viewing.status === 'active'
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {viewing.status}
                  </Badge>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <DetailItem
                icon={<Mail size={16} />}
                label="Email"
                value={viewing.profiles?.email}
              />

              <DetailItem
                icon={<Phone size={16} />}
                label="Phone"
                value={viewing.profiles?.phone}
              />

              <DetailItem
                icon={<Building2 size={16} />}
                label="Department"
                value={viewing.department}
              />

              <DetailItem
                icon={<Briefcase size={16} />}
                label="Designation"
                value={viewing.designation}
              />

              <DetailItem
                icon={<Briefcase size={16} />}
                label="Employment Type"
                value={viewing.employment_type}
              />

              <DetailItem
                icon={<Calendar size={16} />}
                label="Join Date"
                value={
                  viewing.join_date
                    ? new Date(
                        viewing.join_date
                      ).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )
                    : null
                }
              />

              <DetailItem
                icon={<Users size={16} />}
                label="Manager"
                value={viewing.manager}
              />

              <DetailItem
                icon={<MapPin size={16} />}
                label="Work Location"
                value={viewing.work_location}
              />

              <DetailItem
                icon={<MapPin size={16} />}
                label="Address"
                value={viewing.profiles?.address}
              />

            </div>

          </div>

        )}

      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setSaveMsg(null);
        }}
        title="Edit Employee"
        size="lg"
      >

        {saveMsg && (

          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              saveMsg.includes('success')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {saveMsg}
          </div>

        )}

        {editing && (

          <div className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Input
                label="Department"
                value={editDept}
                onChange={setEditDept}
                placeholder="e.g. Engineering"
              />

              <Input
                label="Designation"
                value={editDesignation}
                onChange={setEditDesignation}
                placeholder="e.g. Senior Engineer"
              />

              <Select
                label="Employment Type"
                value={editType}
                onChange={setEditType}
                options={[
                  {
                    value: 'Full-time',
                    label: 'Full-time',
                  },
                  {
                    value: 'Part-time',
                    label: 'Part-time',
                  },
                  {
                    value: 'Contract',
                    label: 'Contract',
                  },
                  {
                    value: 'Intern',
                    label: 'Intern',
                  },
                ]}
              />

              <Select
                label="Status"
                value={editStatus}
                onChange={setEditStatus}
                options={[
                  {
                    value: 'active',
                    label: 'Active',
                  },
                  {
                    value: 'inactive',
                    label: 'Inactive',
                  },
                ]}
              />

              <Input
                label="Manager"
                value={editManager}
                onChange={setEditManager}
                placeholder="Manager name"
              />

              <Input
                label="Work Location"
                value={editLocation}
                onChange={setEditLocation}
                placeholder="e.g. San Francisco HQ"
              />

              <Input
                label="Phone"
                value={editPhone}
                onChange={setEditPhone}
                placeholder="Phone number"
              />

              <Input
                label="Address"
                value={editAddress}
                onChange={setEditAddress}
                placeholder="Home address"
              />

            </div>

            <div className="flex gap-2 justify-end">

              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setSaveMsg(null);
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </Button>

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2.5">

      <div className="text-slate-400 mt-0.5">
        {icon}
      </div>

      <div>

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
