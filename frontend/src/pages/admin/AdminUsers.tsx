import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users as UsersIcon,
  Search,
  Filter,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  Phone,
  Download,
  ExternalLink,
  X,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { VatAnimatedLogo } from '../../components/common/VatAnimatedLogo';
import { api, API_BASE_URL, getAuthToken } from '../../lib/api';

export interface UserRecord {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  institution: string;
  country: string;
  status: 'active' | 'suspended';
  cmeCredits: number;
  qualification?: string;
  phoneNumber?: string;
  countryCode?: string;
  consent?: boolean;
  marketingConsent?: boolean;
  cvUrl?: string;
  cvDocument?: {
    title: string;
    fileName: string;
    fileSize: string;
    uploadedDate: string;
    downloadUrl: string;
    qualifications?: string;
    medicalLicense?: string;
  };
}

/**
 * Formats a phone number safely without duplicating country codes (e.g. "+44 +44 123456" -> "+44 123456")
 */
export const formatPhoneNumber = (countryCode?: string, phoneNumber?: string): string => {
  if (!phoneNumber) return '';
  const trimmedPhone = phoneNumber.trim();
  const trimmedCode = (countryCode || '+44').trim();

  // If already starts with '+', clean any accidental duplicate prefix
  if (trimmedPhone.startsWith('+')) {
    return trimmedPhone.replace(/^(\+\d{1,4})\s*\1\s*/, '$1 ');
  }

  return `${trimmedCode} ${trimmedPhone}`;
};

export const mapBackendUserToRecord = (bu: any): UserRecord => {
  const roleName =
    bu.title?.toLowerCase().includes('pathologist') ||
    bu.application?.professionalRole?.toLowerCase().includes('pathologist')
      ? 'Pathologist'
      : 'Fellow / Student';

  const defaultAvatar = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80`;

  const cvFileName = bu.application?.cvFileUrl
    ? bu.application.cvFileUrl.split('/').pop()?.split('?')[0] || `${bu.fullName || 'User'}_CV.pdf`
    : `${(bu.fullName || 'User').replace(/\s+/g, '_')}_Credentials.pdf`;

  const cvUrl = bu.application?.cvFileUrl || '';

  const phoneNumber = bu.application?.phoneNumber || '';
  const countryCode = bu.application?.countryCode || '+44';
  const consent = Boolean(bu.application?.consent);
  const marketingConsent = Boolean(bu.application?.marketingConsent);

  return {
    id: bu.id,
    name: bu.fullName || bu.email.split('@')[0],
    avatar: bu.avatar || defaultAvatar,
    email: bu.email,
    role: roleName,
    institution: bu.organization || bu.application?.organization || '—',
    country: bu.application?.countryCode || 'UK',
    status: bu.isActive ? 'active' : 'suspended',
    cmeCredits: (bu._count?.certificates || 0) * 12 || (bu._count?.courseProgress || 0) * 4 || 12,
    qualification: bu.application?.qualification || bu.title || (bu.role === 'ADMIN' ? 'Head of Education' : 'Medical Practitioner'),
    phoneNumber,
    countryCode,
    consent,
    marketingConsent,
    cvUrl,
    cvDocument: {
      title: `Curriculum Vitae - ${bu.fullName || 'Candidate'}`,
      fileName: cvFileName,
      fileSize: '1.4 MB',
      uploadedDate: bu.application?.createdAt
        ? new Date(bu.application.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Recently',
      downloadUrl: cvUrl,
      qualifications: bu.application?.qualification || bu.title || 'Forensic Medical Qualifications',
      medicalLicense: bu.application?.professionalRole || 'GMC / National Board Certified',
    },
  };
};

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic CV Document viewer modal
  const [viewingCvUser, setViewingCvUser] = useState<UserRecord | null>(null);
  const [cvBlobUrl, setCvBlobUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await api.get('/users');
      if (res && res.data && Array.isArray(res.data.users)) {
        const studentOnly = res.data.users.filter((u: any) => u.role !== 'ADMIN');
        const mapped = studentOnly.map(mapBackendUserToRecord);
        setUsers(mapped);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching users from backend:', err);
      setFetchError(err?.message || 'Failed to load users from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Click outside to close filter popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const toggleUserStatus = async (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    const nextIsActive = targetUser.status !== 'active';
    const nextStatus = nextIsActive ? 'active' : 'suspended';

    setActionLoadingId(id);

    // Optimistic local update
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );

    try {
      const res = await api.patch(`/users/${id}/status`, { isActive: nextIsActive });
      if (res && res.success) {
        showToast(`User ${targetUser.name} ${nextIsActive ? 'activated' : 'suspended'} successfully.`);
      } else {
        throw new Error(res?.message || 'Failed to update user status');
      }
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      // Revert optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: targetUser.status } : u))
      );
      showToast(err?.message || 'Failed to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getCvStreamUrl = (userId: string, directUrl?: string) => {
    const token = getAuthToken() || '';
    if (token) {
      return `${API_BASE_URL}/users/${userId}/cv?token=${encodeURIComponent(token)}`;
    }
    return directUrl || `${API_BASE_URL}/users/${userId}/cv`;
  };

  const handleViewCv = (user: UserRecord) => {
    setViewingCvUser(user);
    if (!user.cvUrl || !user.cvUrl.trim()) {
      showToast(`No CV document was uploaded for ${user.name}.`);
    }
  };

  // Fetch CV PDF as a same-origin Blob URL to completely avoid cross-origin iframe blocking
  useEffect(() => {
    if (!viewingCvUser || !viewingCvUser.cvUrl || !viewingCvUser.cvUrl.trim()) {
      setCvBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setIsPdfLoading(false);
      setPdfLoadError(null);
      return;
    }

    let isCancelled = false;
    setIsPdfLoading(true);
    setPdfLoadError(null);

    const streamUrl = getCvStreamUrl(viewingCvUser.id, viewingCvUser.cvUrl);

    fetch(streamUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load candidate CV`);
        return res.blob();
      })
      .then((blob) => {
        if (!isCancelled) {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const url = URL.createObjectURL(pdfBlob);
          setCvBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          setIsPdfLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error loading CV blob:', err);
          setPdfLoadError('Unable to preview PDF document in frame.');
          setIsPdfLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [viewingCvUser]);

  const closeCvModal = () => {
    setCvBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setViewingCvUser(null);
  };

  // Derive dynamic list of roles from loaded users
  const dynamicRoles = Array.from(new Set(users.map((u) => u.role))).filter(Boolean);
  const availableRoles = ['all', ...Array.from(new Set(['Fellow / Student', 'Pathologist', ...dynamicRoles]))];

  const hasActiveFilters = roleFilter !== 'all' || statusFilter !== 'all';

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.qualification && u.qualification.toLowerCase().includes(q)) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
      u.institution.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.status === 'active') ||
      (statusFilter === 'inactive' && u.status === 'suspended') ||
      (statusFilter === 'suspended' && u.status === 'suspended');

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <AdminLayout title="User Management" subtitle="Users">
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#0A192F] text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/60 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* TOP BAR: Single Row containing the 2 Metric Cards on Left, and Search + Filter Icon + Refresh on Right */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* Left: 2 Cards (Total Users & Active Fellows) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Card 1: Total Users */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors p-3 px-4 rounded-2xl border border-slate-200/80 flex items-center space-x-3 min-w-[150px]">
              <div className="w-10 h-10 bg-amber-100 border border-amber-300 text-amber-900 rounded-xl flex items-center justify-center font-bold shrink-0">
                <UsersIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Total Users</p>
                <h3 className="text-xl font-black text-[#0A192F] mt-1 leading-none">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500 inline" /> : users.length}
                </h3>
              </div>
            </div>

            {/* Card 2: Active Fellows */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors p-3 px-4 rounded-2xl border border-slate-200/80 flex items-center space-x-3 min-w-[150px]">
              <div className="w-10 h-10 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Active Fellows</p>
                <h3 className="text-xl font-black text-emerald-600 mt-1 leading-none">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500 inline" /> : users.filter((u) => u.status === 'active').length}
                </h3>
              </div>
            </div>
          </div>

          {/* Right: Search Bar, Filter Icon Popover, Refresh */}
          <div className="flex items-center gap-2.5 flex-1 xl:max-w-xl xl:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Filter Dropdown Popover */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2.5 rounded-2xl text-xs font-bold inline-flex items-center space-x-1.5 transition-all cursor-pointer border ${
                  hasActiveFilters
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs ring-2 ring-amber-400/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Filter users by Status and Role"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-slate-950 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-amber-500" />
                      Filter Options
                    </span>
                    {hasActiveFilters && (
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setRoleFilter('all');
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Status</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: 'All', value: 'all' },
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setStatusFilter(opt.value)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-colors ${
                            statusFilter === opt.value
                              ? 'bg-[#0A192F] text-amber-400'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Role</label>
                    <div className="space-y-1">
                      {availableRoles.map((r) => (
                        <button
                          key={r}
                          onClick={() => setRoleFilter(r)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                            roleFilter === r
                              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{r === 'all' ? 'All Roles' : r}</span>
                          {roleFilter === r && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
              title="Refresh User List"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Fetch Error Banner */}
        {fetchError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchUsers}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed min-w-[1050px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 font-bold w-[220px] text-left">USER</th>
                  <th className="py-3.5 px-4 font-bold w-[210px] text-left">EMAIL & CONTACT</th>
                  <th className="py-3.5 px-4 font-bold w-[140px] text-center">ROLE</th>
                  <th className="py-3.5 px-4 font-bold w-[180px] text-left">ORGANIZATION</th>
                  <th className="py-3.5 px-4 font-bold w-[130px] text-center">CV DOCUMENT</th>
                  <th className="py-3.5 px-4 font-bold w-[210px] text-center">STATUS & ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 font-semibold text-xs">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                        <span>Loading registered users from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* 1. USER: Avatar + Full Name + Qualification below name */}
                      <td className="py-4 px-4 w-[220px] max-w-[220px] text-left">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/40 shrink-0"
                          />
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div
                              className="font-extrabold text-slate-900 text-sm truncate"
                              title={user.name}
                            >
                              {user.name}
                            </div>
                            <div
                              className="text-[11px] text-amber-700 font-semibold mt-0.5 truncate"
                              title={user.qualification}
                            >
                              {user.qualification || 'Forensic Pathologist / Fellow'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. EMAIL & CONTACT: Email on top, mobile shown ONLY if 2nd checkbox (marketingConsent) was accepted */}
                      <td className="py-4 px-4 w-[210px] max-w-[210px] text-left">
                        <div className="min-w-0 overflow-hidden">
                          <div className="font-mono font-bold text-slate-800 text-xs truncate" title={user.email}>
                            {user.email}
                          </div>
                          {user.marketingConsent && user.phoneNumber ? (
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center space-x-1.5 truncate">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{formatPhoneNumber(user.countryCode, user.phoneNumber)}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* 3. ROLE: Centered column aligned with header */}
                      <td className="py-4 px-4 w-[140px] max-w-[140px] text-center">
                        <div className="flex justify-center">
                          <span
                            className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[11px] truncate max-w-[130px] border border-slate-200/60"
                            title={user.role}
                          >
                            {user.role}
                          </span>
                        </div>
                      </td>

                      {/* 4. ORGANIZATION: Organization name ONLY (country code removed) */}
                      <td className="py-4 px-4 w-[180px] max-w-[180px] text-left">
                        <div className="font-semibold text-slate-800 text-xs truncate" title={user.institution}>
                          {user.institution || '—'}
                        </div>
                      </td>

                      {/* 5. CV DOCUMENT: Opens uploaded CV or credentials */}
                      <td className="py-4 px-4 w-[130px] max-w-[130px] text-center">
                        <button
                          type="button"
                          onClick={() => handleViewCv(user)}
                          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer border border-amber-400/30"
                          title={user.cvUrl ? `Open uploaded CV for ${user.name}` : `View credentials for ${user.name}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>View CV</span>
                        </button>
                      </td>

                      {/* 6. STATUS & ACTIONS: Fixed widths for badge (94px) and button (88px) centered under header */}
                      <td className="py-4 px-4 w-[210px] max-w-[210px] text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span
                            className={`w-[94px] inline-flex items-center justify-center text-[10px] py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                              user.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
                                user.status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            <span>{user.status === 'active' ? 'Active' : 'Suspended'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleUserStatus(user.id)}
                            disabled={actionLoadingId === user.id}
                            className={`w-[88px] py-1 font-bold rounded-xl text-xs transition-all text-white cursor-pointer disabled:opacity-50 inline-flex items-center justify-center space-x-1 shrink-0 shadow-xs ${
                              user.status === 'active'
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                            title={user.status === 'active' ? 'Suspend User Account' : 'Activate User Account'}
                          >
                            {actionLoadingId === user.id && <Loader2 className="w-3 h-3 animate-spin mr-1 shrink-0" />}
                            <span>{user.status === 'active' ? 'Suspend' : 'Activate'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                        ? 'No users match your search and filter criteria.'
                        : 'No users available in database.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DYNAMIC CURRICULUM VITAE (CV) VIEWER MODAL */}
      {viewingCvUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-4xl w-full space-y-5 max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center shadow-xs shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-[#0A192F] truncate">Candidate Curriculum Vitae (CV)</h3>
                  <p
                    className="text-xs text-slate-500 truncate"
                    title={`Applicant: ${viewingCvUser.name}${viewingCvUser.institution ? ` • ${viewingCvUser.institution}` : ''}`}
                  >
                    Applicant: <span className="font-semibold text-slate-700">{viewingCvUser.name}</span>
                    {viewingCvUser.institution ? ` • ${viewingCvUser.institution}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {viewingCvUser.cvUrl ? (
                  <a
                    href={cvBlobUrl || getCvStreamUrl(viewingCvUser.id, viewingCvUser.cvUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap"
                    title="Open CV in New Window"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>Open in New Tab</span>
                  </a>
                ) : null}
                <button
                  onClick={closeCvModal}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors shrink-0"
                  title="Close CV Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Live PDF Document Viewer */}
            {viewingCvUser.cvUrl ? (
              isPdfLoading ? (
                <div className="w-full h-[640px] rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center space-y-4">
                  <VatAnimatedLogo mode="orbit" size="md" priority={true} />
                  <p className="text-xs font-bold text-slate-800">Loading Candidate CV...</p>
                </div>
              ) : pdfLoadError ? (
                <div className="w-full h-[640px] rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                  <p className="text-xs font-bold text-slate-800">Preview Error</p>
                  <p className="text-xs text-slate-500">{pdfLoadError}</p>
                  <a
                    href={getCvStreamUrl(viewingCvUser.id, viewingCvUser.cvUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              ) : cvBlobUrl ? (
                <div className="w-full h-[640px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner relative">
                  <iframe
                    src={`${cvBlobUrl}#toolbar=0&navpanes=0`}
                    className="w-full h-full border-0 rounded-2xl"
                    title={`${viewingCvUser.name} Curriculum Vitae`}
                  />
                </div>
              ) : null
            ) : (
              <div className="py-16 px-6 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">No CV Document Attached</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Candidate {viewingCvUser.name} did not submit a CV document during registration.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <span
                className="text-[11px] text-slate-500 font-mono min-w-0 flex-1 truncate"
                title={`${viewingCvUser.email} • ${viewingCvUser.qualification || 'Forensic Medical Practitioner'}`}
              >
                {viewingCvUser.email} • {viewingCvUser.qualification || 'Forensic Medical Practitioner'}
              </span>
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={closeCvModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0"
                >
                  Close Preview
                </button>
                {viewingCvUser.cvUrl && (
                  <a
                    href={cvBlobUrl || getCvStreamUrl(viewingCvUser.id, viewingCvUser.cvUrl)}
                    download={`${viewingCvUser.name.replace(/\s+/g, '_')}_CV.pdf`}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer transition-colors inline-flex items-center space-x-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
