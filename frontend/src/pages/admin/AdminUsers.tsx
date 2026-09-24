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
  X
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
}

export const MOCK_USERS: UserRecord[] = [
  {
    id: 'usr-201',
    name: 'Dr. Helena Vance',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    email: 'h.vance@stjude.org',
    role: 'Fellow / Student',
    institution: 'St. Jude Forensic Hub',
    country: 'United Kingdom',
    joinedDate: 'Oct 14, 2024',
    status: 'active',
    cmeCredits: 24,
  },
  {
    id: 'usr-202',
    name: 'Dr. Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    email: 'm.thorne@berninquest.ch',
    role: 'Pathologist',
    institution: 'Bern Medico-Legal Center',
    country: 'Switzerland',
    joinedDate: 'Oct 12, 2024',
    status: 'active',
    cmeCredits: 48,
  },
  {
    id: 'usr-203',
    name: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1594824813566-78a933f443e6?w=150&auto=format&fit=crop&q=80',
    email: 's.jenkins@melbourneforensic.au',
    role: 'Faculty / Admin',
    institution: 'Melbourne Forensic Institute',
    country: 'Australia',
    joinedDate: 'Aug 10, 2024',
    status: 'active',
    cmeCredits: 60,
  },
  {
    id: 'usr-204',
    name: 'Dr. Aris Thorne',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'a.thorne@nordicforensic.se',
    role: 'Fellow / Student',
    institution: 'Nordic Forensic Sciences',
    country: 'Sweden',
    joinedDate: 'Sep 08, 2024',
    status: 'active',
    cmeCredits: 18,
  },
  {
    id: 'usr-205',
    name: 'Dr. Kenji Sato',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'k.sato@tokyomed.jp',
    role: 'Fellow / Student',
    institution: 'Tokyo Mortuary Center',
    country: 'Japan',
    joinedDate: 'Oct 05, 2024',
    status: 'suspended',
    cmeCredits: 0,
  },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

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
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">USER</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ROLE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ORGANIZATION</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">JOINED DATE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">STATUS</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ACTIONS</th>
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
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`px-3 py-1.5 font-bold rounded-xl text-xs transition-colors text-white ${
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
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No users match the search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full space-y-6">
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

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">CME CREDITS EARNED</span>
                <p className="font-bold text-amber-700 text-sm">{selectedUser.cmeCredits} Hours</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
