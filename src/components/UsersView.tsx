import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  Mail,
  Building2,
  Key,
  ArrowLeft,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import {
  INITIAL_USERS,
  getActiveUserRole,
  setActiveUserRole,
  fetchServerUsers,
  updateServerUserRole,
} from '../data/institutionData';

interface UsersViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onBack?: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ currentRole, onRoleChange, onBack }) => {
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roleUpdateMsg, setRoleUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchServerUsers()
      .then((data) => {
        if (data && data.length > 0) setUsers(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectRole = (role: UserRole) => {
    setActiveUserRole(role);
    onRoleChange(role);
  };

  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    const updated = await updateServerUserRole(userId, newRole);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setRoleUpdateMsg(`Updated ${updated.name}'s role to ${newRole}`);
      setTimeout(() => setRoleUpdateMsg(null), 3000);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'faculty':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reviewer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Access Control & Security</span>
            <span>•</span>
            <span>Institutional Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">
            Institutional Users & Role Switcher
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic personnel, inspect role-based access permissions, and switch personas to preview Administrator, Faculty, or Reviewer workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Courses</span>
            </button>
          )}

          {/* Current Active Persona Pill */}
          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 font-medium">Active Persona:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-md border capitalize ${getRoleBadge(currentRole)}`}>
              {currentRole === 'faculty' ? 'Course Designer (Faculty)' : currentRole}
            </span>
          </div>
        </div>
      </div>

      {roleUpdateMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{roleUpdateMsg}</span>
        </div>
      )}

      {/* Role Switcher Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Quick Switch Persona
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              role: 'faculty' as UserRole,
              title: 'Course Designer / Faculty',
              name: 'Prof. Shahid Soomro',
              email: 'ShahidSoomro786@gmail.com',
              desc: 'Author courses, formulate measurable CLOs, build 16-week schedules, configure 100% assessments, and generate syllabi.',
            },
            {
              role: 'reviewer' as UserRole,
              title: 'Peer Reviewer & BoS Chair',
              name: 'Dr. Margaret Hamilton',
              email: 'm.hamilton@apex.edu',
              desc: 'Audit course alignment, inspect Internal Readiness Scores, add section feedback comments, and approve or request changes.',
            },
            {
              role: 'admin' as UserRole,
              title: 'Accreditation Administrator',
              name: 'Dr. Eleanor Vance',
              email: 'e.vance@apex.edu',
              desc: 'Manage institutional settings, accreditation framework defaults, academic calendar parameters, and institutional users.',
            },
          ].map((item) => {
            const isSelected = currentRole === item.role;
            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadge(
                        item.role
                      )}`}
                    >
                      {item.title}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-3">{item.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 text-[10px] font-mono">{item.email}</span>
                  <span className={`text-[11px] ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {isSelected ? 'Active' : 'Switch'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Institutional Personnel Directory */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Institutional Academic Personnel Roster
            </h3>
            <p className="text-xs text-slate-500">
              Live faculty and governance personnel registered on the institution server.
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
            {users.length} Registered Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3">Name & Title</th>
                <th className="p-3">Department</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isCurrent = (currentRole === 'admin' && u.role === 'admin') ||
                  (currentRole === 'faculty' && u.role === 'faculty') ||
                  (currentRole === 'reviewer' && u.role === 'reviewer');

                return (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.title}</div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {u.department}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {u.email}
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value as UserRole)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${getRoleBadge(u.role)}`}
                      >
                        <option value="faculty">Faculty (Course Designer)</option>
                        <option value="reviewer">Reviewer (BoS Chair)</option>
                        <option value="admin">Administrator (QA Director)</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectRole(u.role)}
                        className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Current' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Role-Based Access Control (RBAC) Permissions Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3">Capability / Operation</th>
                <th className="p-3 text-center">Administrator</th>
                <th className="p-3 text-center">Course Designer</th>
                <th className="p-3 text-center">Reviewer</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  cap: 'Create & Edit Course Syllabi',
                  admin: true,
                  faculty: true,
                  reviewer: false,
                },
                {
                  cap: 'Export Professional Syllabus (PDF / DOCX)',
                  admin: true,
                  faculty: true,
                  reviewer: true,
                },
                {
                  cap: 'Run Constructive Alignment Audit',
                  admin: true,
                  faculty: true,
                  reviewer: true,
                },
                {
                  cap: 'Submit Course to Board of Studies',
                  admin: true,
                  faculty: true,
                  reviewer: false,
                },
                {
                  cap: 'Formally Approve / Request Changes',
                  admin: true,
                  faculty: false,
                  reviewer: true,
                },
                {
                  cap: 'Add Peer Review Comments',
                  admin: true,
                  faculty: true,
                  reviewer: true,
                },
                {
                  cap: 'Modify Institutional Settings & Policy',
                  admin: true,
                  faculty: false,
                  reviewer: false,
                },
                {
                  cap: 'Manage Accreditation Frameworks',
                  admin: true,
                  faculty: false,
                  reviewer: false,
                },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-800">{row.cap}</td>
                  <td className="p-3 text-center">
                    {row.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.faculty ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.reviewer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
