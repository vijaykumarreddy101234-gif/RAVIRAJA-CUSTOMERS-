import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  Building,
  FileSpreadsheet,
  Download,
  MessageCircle,
} from 'lucide-react';
import { Employee, EmployeeStatus, UserRole } from '../types/employee';
import { CustomerVisit } from '../types/customerVisit';
import { EmployeeService } from '../services/employeeService';
import { INDIAN_STATES } from '../data/indiaLocations';

interface EmployeeManagementViewProps {
  employees: Employee[];
  visits: CustomerVisit[];
  onUpdateEmployees: (updated: Employee[]) => void;
  onUpdateVisits: (updatedVisits: CustomerVisit[]) => void;
  showToast: (msg: string) => void;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  visits,
  onUpdateEmployees,
  onUpdateVisits,
  showToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [reassigningEmployee, setReassigningEmployee] = useState<Employee | null>(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('');

  // Form state for add/edit employee
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('+91 ');
  const [employeeCode, setEmployeeCode] = useState(`SC-EMP-${Math.floor(100 + Math.random() * 900)}`);
  const [designation, setDesignation] = useState('Sales Executive');
  const [assignedState, setAssignedState] = useState('Gujarat');
  const [assignedDistrict, setAssignedDistrict] = useState('Surat');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [role, setRole] = useState<UserRole>('sales');
  const [status, setStatus] = useState<EmployeeStatus>('Active');

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setMobileNumber('+91 ');
    setEmployeeCode(`SC-EMP-${Math.floor(100 + Math.random() * 900)}`);
    setDesignation('Sales Executive');
    setAssignedState('Gujarat');
    setAssignedDistrict('Surat');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setRole('sales');
    setStatus('Active');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setMobileNumber(emp.mobileNumber);
    setEmployeeCode(emp.employeeCode);
    setDesignation(emp.designation);
    setAssignedState(emp.assignedState);
    setAssignedDistrict(emp.assignedDistrict);
    setJoiningDate(emp.joiningDate);
    setRole(emp.role);
    setStatus(emp.status);
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobileNumber.trim()) {
      showToast('Please enter employee name and mobile number.');
      return;
    }

    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        employeeCode: employeeCode.trim(),
        designation: designation.trim(),
        assignedState,
        assignedDistrict,
        joiningDate,
        role,
        status,
      };
      const newEmpList = EmployeeService.updateEmployee(updated);
      onUpdateEmployees(newEmpList);
      showToast(`✓ Employee "${name}" updated successfully`);
    } else {
      const newEmpList = EmployeeService.addEmployee({
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        employeeCode: employeeCode.trim(),
        designation: designation.trim(),
        assignedState,
        assignedDistrict,
        joiningDate,
        role,
        status,
      });
      onUpdateEmployees(newEmpList);
      showToast(`✓ New employee "${name}" added successfully`);
    }

    setIsAddModalOpen(false);
  };

  const handleToggleStatus = (emp: Employee, newStatus: EmployeeStatus) => {
    const updated: Employee = { ...emp, status: newStatus };
    const newEmpList = EmployeeService.updateEmployee(updated);
    onUpdateEmployees(newEmpList);
    showToast(`Employee "${emp.name}" status changed to ${newStatus}`);
  };

  // Reassign customers from resigned/inactive employee to another active employee
  const handleReassignCustomers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningEmployee || !targetEmployeeId) {
      showToast('Please select a target active employee for reassignment.');
      return;
    }

    const targetEmp = employees.find((e) => e.id === targetEmployeeId);
    if (!targetEmp) return;

    // Reassign all visits where salesExecutiveName matches reassigningEmployee.name
    let count = 0;
    const updatedVisits = visits.map((v) => {
      if (
        v.salesExecutiveName === reassigningEmployee.name ||
        v.executiveEmail === reassigningEmployee.email
      ) {
        count++;
        return {
          ...v,
          salesExecutiveName: targetEmp.name,
          executiveEmail: targetEmp.email || v.executiveEmail,
          updatedAt: Date.now(),
        };
      }
      return v;
    });

    onUpdateVisits(updatedVisits);
    showToast(`✓ Successfully transferred ${count} customer records from ${reassigningEmployee.name} to ${targetEmp.name}!`);
    setReassigningEmployee(null);
    setTargetEmployeeId('');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Sales Employee & Team Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage permissions, territories, account status, and customer reassignments
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employee Cards / Table List */}
      <div className="space-y-3">
        {employees.map((emp) => {
          // Count customers and visits for this employee
          const empVisits = visits.filter(
            (v) => v.salesExecutiveName === emp.name || v.executiveEmail === emp.email
          );
          const uniqueCustomers = new Set(empVisits.map((v) => v.customerName || v.companyName)).size;

          const isActive = emp.status === 'Active';
          const isResigned = emp.status === 'Resigned';

          return (
            <div
              key={emp.id}
              className={`border rounded-2xl p-4 space-y-3 transition shadow-sm ${
                isResigned
                  ? 'bg-slate-950/70 border-rose-900/40 opacity-80'
                  : isActive
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-900/50 border-amber-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      {emp.employeeCode}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        emp.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}
                    >
                      {emp.role.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isResigned
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1.5 flex-wrap">
                    <span className="font-semibold text-slate-200">{emp.designation}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-sky-400 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {emp.mobileNumber}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" /> {emp.assignedDistrict}, {emp.assignedState}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`https://wa.me/${emp.mobileNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `*SCRAFT uPVC Sales Employee Profile*\n` +
                      `Name: ${emp.name}\n` +
                      `Code: ${emp.employeeCode}\n` +
                      `Designation: ${emp.designation}\n` +
                      `Territory: ${emp.assignedDistrict}, ${emp.assignedState}\n` +
                      `Mobile: ${emp.mobileNumber}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 transition text-xs flex items-center gap-1 font-semibold"
                    title="Share employee profile via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(emp)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition text-xs"
                    title="Edit Employee / Territory"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setReassigningEmployee(emp)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-xs font-semibold flex items-center gap-1 shadow-sm"
                    title="Reassign customers to another executive"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="hidden sm:inline">Reassign</span>
                  </button>
                </div>
              </div>

              {/* Stats & Status Toggle Bar */}
              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
                <div className="flex items-center gap-3 text-slate-400">
                  <span>Joined: <strong className="text-white">{emp.joiningDate}</strong></span>
                  <span>•</span>
                  <span>Customers: <strong className="text-emerald-400">{uniqueCustomers}</strong></span>
                  <span>•</span>
                  <span>Visits Logged: <strong className="text-sky-400">{empVisits.length}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isActive ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(emp, 'Inactive')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-semibold transition"
                      >
                        Deactivate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(emp, 'Resigned')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-semibold transition"
                      >
                        Mark Resigned
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(emp, 'Active')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-semibold transition"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveEmployee}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingEmployee ? 'Edit Sales Employee Profile' : 'Add New Sales Employee'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Employee Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Suresh Sharma"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mobile Number (+91) *</label>
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98250 00000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="SC-EMP-001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Sales Executive"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Assigned State</label>
                  <select
                    value={assignedState}
                    onChange={(e) => setAssignedState(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="All-India">All-India</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Assigned District / City</label>
                  <input
                    type="text"
                    value={assignedDistrict}
                    onChange={(e) => setAssignedDistrict(e.target.value)}
                    placeholder="Surat / Ahmedabad / All"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Role Permission</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-sky-500"
                  >
                    <option value="sales">Sales Person</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
              >
                {editingEmployee ? 'Save Changes' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reassign Customers Modal */}
      {reassigningEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleReassignCustomers}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>Reassign Customers</span>
              </h3>
              <button
                type="button"
                onClick={() => setReassigningEmployee(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                <span className="font-bold text-amber-300 block">Resigned / Inactive Executive:</span>
                <span className="text-white font-bold text-sm block">{reassigningEmployee.name} ({reassigningEmployee.employeeCode})</span>
                <p className="text-[11px] text-slate-300">
                  Transferring customer visits to another active sales executive will preserve all historical visit logs, conversation dialogues, and lead statuses.
                </p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Select Target Active Sales Executive *</label>
                <select
                  required
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choose Target Executive --</option>
                  {employees
                    .filter((e) => e.id !== reassigningEmployee.id && e.status === 'Active')
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation} - {emp.assignedState})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReassigningEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                Confirm Reassignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
