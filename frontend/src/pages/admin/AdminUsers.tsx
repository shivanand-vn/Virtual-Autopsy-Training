import React, { useState } from 'react';
import {
  Users as UsersIcon,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Building,
  Calendar,
  MoreVertical,
  Edit3,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  FileText,
  Download,
  ExternalLink,
  Award,
  BookOpen
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export interface UserRecord {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: 'Fellow / Student' | 'Pathologist' | 'Faculty / Admin';
  institution: string;
  country: string;
  joinedDate: string;
  status: 'active' | 'suspended' | 'pending';
  cmeCredits: number;
  cvDocument: {
    title: string;
    fileName: string;
    fileSize: string;
    uploadedDate: string;
    downloadUrl: string;
    qualifications?: string;
    medicalLicense?: string;
  };
}

export const MOCK_USERS: UserRecord[] = [];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [viewingCv, setViewingCv] = useState<UserRecord | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.institution.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser((prev) => (prev ? { ...prev, status: prev.status === 'active' ? 'suspended' : 'active' } : null));
    }
  };

  return (
    <AdminLayout title="User Management" subtitle="Users">
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{users.length}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold">
              <UsersIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fellows</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {users.filter((u) => u.status === 'active').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty & Admins</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">
                {users.filter((u) => u.role === 'Faculty / Admin').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-slate-700 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspended Accounts</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                {users.filter((u) => u.status === 'suspended').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by name, email, or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'Fellow / Student', 'Pathologist', 'Faculty / Admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  roleFilter === role
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 font-bold text-center">USER</th>
                  <th className="py-3.5 px-4 font-bold text-center">ROLE</th>
                  <th className="py-3.5 px-4 font-bold text-center">ORGANIZATION</th>
                  <th className="py-3.5 px-4 font-bold text-center">JOINED DATE</th>
                  <th className="py-3.5 px-4 font-bold text-center">STATUS</th>
                  <th className="py-3.5 px-4 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/40 shrink-0"
                          />
                          <div className="min-w-0 text-left">
                            <div className="font-extrabold text-slate-900 text-sm truncate">{user.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[11px]">
                          {user.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="font-semibold text-slate-800 truncate">{user.institution}</div>
                        <div className="text-[11px] text-slate-500">{user.country}</div>
                      </td>

                      <td className="py-4 px-4 text-center text-slate-600 font-mono text-[11px]">{user.joinedDate}</td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            user.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              user.status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`px-3 py-1.5 font-bold rounded-xl text-xs transition-colors text-white cursor-pointer ${
                              user.status === 'active'
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No users available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal (Includes CV Section) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-amber-400/50"
                />
                <div>
                  <h3 className="text-lg font-black text-[#0A192F]">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General User Info */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">EMAIL</span>
                <p className="font-mono font-bold text-slate-800">{selectedUser.email}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">ORGANIZATION / INSTITUTION</span>
                <p className="font-bold text-slate-800">{selectedUser.institution}</p>
                <p className="text-slate-500">{selectedUser.country}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-400 uppercase">JOINED DATE</span>
                  <p className="font-bold text-slate-800">{selectedUser.joinedDate}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-400 uppercase">CME CREDITS</span>
                  <p className="font-bold text-amber-700 text-sm">{selectedUser.cmeCredits} Hours</p>
                </div>
              </div>
            </div>

            {/* CURRICULUM VITAE (CV) / APPLICATION DOCUMENT SECTION */}
            <div className="p-4 bg-gradient-to-r from-[#0A192F] to-[#112240] text-white rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Curriculum Vitae (CV)</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                  PDF Document
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white truncate">
                  {selectedUser.cvDocument.fileName}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {selectedUser.cvDocument.fileSize} • Uploaded {selectedUser.cvDocument.uploadedDate}
                </p>
                {selectedUser.cvDocument.qualifications && (
                  <p className="text-[11px] text-amber-200/90 mt-1 font-medium">
                    Qualifications: {selectedUser.cvDocument.qualifications}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setViewingCv(selectedUser)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>View CV</span>
                </button>
                <a
                  href={selectedUser.cvDocument.downloadUrl}
                  download
                  onClick={(e) => {
                    if (selectedUser.cvDocument.downloadUrl === '#') e.preventDefault();
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CV</span>
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV Document Viewer Modal */}
      {viewingCv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0A192F]">{viewingCv.cvDocument.title}</h3>
                  <p className="text-xs text-slate-500">Applicant: {viewingCv.name} ({viewingCv.institution})</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCv(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock CV Preview Content Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5 text-xs text-slate-800 leading-relaxed font-sans">
              <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#0A192F]">{viewingCv.name}</h2>
                  <p className="text-xs font-bold text-amber-700 mt-0.5">{viewingCv.role}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{viewingCv.email} • {viewingCv.country}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg">
                  Verified License
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Medical Qualifications</h4>
                <p className="font-bold text-slate-900">{viewingCv.cvDocument.qualifications || 'MBBS, FRCPath (Forensic Pathology)'}</p>
                <p className="text-slate-500 text-[11px]">License Registration: {viewingCv.cvDocument.medicalLicense || 'Verified Practitioner'}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Current Appointment</h4>
                <p className="font-bold text-slate-900">{viewingCv.institution}</p>
                <p className="text-slate-500 text-[11px]">Department of Forensic Medicine & PMCT Volumetric Evaluation</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Clinical Experience Summary</h4>
                <p className="text-slate-700 leading-relaxed">
                  Specialist in Post-Mortem Computed Tomography (PMCT) interpretation, cranial trauma reconstruction, and PMCT-Angiography protocols. Completed over 400+ volumetric CT autopsy scans in accredited forensic mortuary facilities.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400">Document ID: {viewingCv.id}-CV</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewingCv(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Close Preview
                </button>
                <a
                  href={viewingCv.cvDocument.downloadUrl}
                  download
                  onClick={(e) => {
                    if (viewingCv.cvDocument.downloadUrl === '#') e.preventDefault();
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
