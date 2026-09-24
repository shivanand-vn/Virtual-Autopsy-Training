import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Check,
  X,
  Download,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Sparkles,
  UserCheck,
  UserX,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { ApplicantRecord } from '../../types/admin';

export interface ExtendedApplicant extends ApplicantRecord {
  phone: string;
  cvFileName: string;
  notes?: string;
  country: string;
  rejectionReason?: string;
}

export const EXTENDED_MOCK_APPLICANTS: ExtendedApplicant[] = [
  {
    id: 'app-101',
    applicantName: 'Dr. Helena Vance',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    email: 'h.vance@stjude.org',
    phone: '+44 7911 123456',
    qualification: 'MBBS / MD (Medical Doctor)',
    organization: 'St. Jude Forensic Imaging Hub',
    country: 'United Kingdom',
    appliedDate: 'Oct 14, 2024',
    status: 'pending',
    cvFileName: 'Vance_Helena_CV_Credentials.pdf',
    notes: 'Candidate has 6 years post-registration pathology experience at St. Jude.',
  },
  {
    id: 'app-102',
    applicantName: 'Dr. Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    email: 'm.thorne@berninquest.ch',
    phone: '+41 22 712 3456',
    qualification: 'FRCR (Royal College Radiologist)',
    organization: 'Bern Medico-Legal Center',
    country: 'Switzerland',
    appliedDate: 'Oct 12, 2024',
    status: 'pending',
    cvFileName: 'Thorne_Marcus_Radiology_Cert.pdf',
    notes: 'Specializes in multi-slice cranial CT post-mortem reconstructions.',
  },
  {
    id: 'app-103',
    applicantName: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1594824813566-78a933f443e6?w=150&auto=format&fit=crop&q=80',
    email: 's.jenkins@melbourneforensic.au',
    phone: '+61 3 9123 4567',
    qualification: 'Certified Forensic Pathologist',
    organization: 'Melbourne Forensic Institute',
    country: 'Australia',
    appliedDate: 'Oct 10, 2024',
    status: 'approved',
    cvFileName: 'Jenkins_Sarah_Forensic_Board.pdf',
    notes: 'Verified against Australian Medical Council registry. Full clearance.',
  },
  {
    id: 'app-104',
    applicantName: 'Dr. Aris Thorne',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'a.thorne@nordicforensic.se',
    phone: '+46 8 123 4567',
    qualification: 'Ph.D. Forensic Pathology',
    organization: 'Nordic Forensic Sciences',
    country: 'Sweden',
    appliedDate: 'Oct 08, 2024',
    status: 'approved',
    cvFileName: 'Thorne_Aris_PhD_Credentials.pdf',
    notes: 'ISFRI senior member. Approved for Advanced Fellowship track.',
  },
  {
    id: 'app-105',
    applicantName: 'Dr. Kenji Sato',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'k.sato@tokyomed.jp',
    phone: '+81 3 1234 5678',
    qualification: 'Senior CT/DICOM Radiographer',
    organization: 'Tokyo Metropolitan Mortuary',
    country: 'Japan',
    appliedDate: 'Oct 05, 2024',
    status: 'rejected',
    cvFileName: 'Sato_Kenji_Radiography_License.pdf',
    notes: 'Applicant medical degree registration could not be verified by registry.',
    rejectionReason: 'Unverified Medical Registration / License Number',
  },
  {
    id: 'app-106',
    applicantName: 'Dr. Emily Carter',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'e.carter@oxfordpathology.ac.uk',
    phone: '+44 1865 234567',
    qualification: 'MBBS / MD (Medical Doctor)',
    organization: 'Oxford University Hospitals NHS Foundation',
    country: 'United Kingdom',
    appliedDate: 'Oct 03, 2024',
    status: 'pending',
    cvFileName: 'Carter_Emily_Oxford_GMC.pdf',
    notes: 'GMC Registration #6129845 active. Pending faculty panel sign-off.',
  }
];

export const AdminApplicationsPage: React.FC = () => {
  const [applicants, setApplicants] = useState<ExtendedApplicant[]>(EXTENDED_MOCK_APPLICANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [qualificationFilter, setQualificationFilter] = useState('all');
  
  // Selected Applicant for Detail Modal
  const [selectedApplicant, setSelectedApplicant] = useState<ExtendedApplicant | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirmation Modal States
  const [pendingActionApplicant, setPendingActionApplicant] = useState<ExtendedApplicant | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Approval Confirmation Card
  const initiateApprove = (app: ExtendedApplicant) => {
    setPendingActionApplicant(app);
    setActionType('approve');
  };

  // Open Rejection Confirmation Card
  const initiateReject = (app: ExtendedApplicant) => {
    setPendingActionApplicant(app);
    setActionType('reject');
    setRejectionReasonText('');
  };

  // Confirm Approval
  const handleConfirmApproval = () => {
    if (!pendingActionApplicant) return;

    setApplicants(
      applicants.map((app) =>
        app.id === pendingActionApplicant.id ? { ...app, status: 'approved' } : app
      )
    );

    if (selectedApplicant && selectedApplicant.id === pendingActionApplicant.id) {
      setSelectedApplicant({ ...selectedApplicant, status: 'approved' });
    }

    showToast(`Application for ${pendingActionApplicant.applicantName} APPROVED successfully! Login credentials dispatched.`);
    setPendingActionApplicant(null);
    setActionType(null);
  };

  // Confirm Rejection with Typed Reason
  const handleConfirmRejection = () => {
    if (!pendingActionApplicant) return;

    const finalReason = rejectionReasonText.trim() || 'Medical registration or credential requirements not met';

    setApplicants(
      applicants.map((app) =>
        app.id === pendingActionApplicant.id
          ? { ...app, status: 'rejected', rejectionReason: finalReason }
          : app
      )
    );

    if (selectedApplicant && selectedApplicant.id === pendingActionApplicant.id) {
      setSelectedApplicant({ ...selectedApplicant, status: 'rejected', rejectionReason: finalReason });
    }

    showToast(`Application for ${pendingActionApplicant.applicantName} REJECTED. Reason: "${finalReason}"`);
    setPendingActionApplicant(null);
    setActionType(null);
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.organization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : app.status === statusFilter;
    const matchesQual = qualificationFilter === 'all' ? true : app.qualification.includes(qualificationFilter);

    return matchesSearch && matchesStatus && matchesQual;
  });

  const totalCount = applicants.length;
  const pendingCount = applicants.filter((a) => a.status === 'pending').length;
  const approvedCount = applicants.filter((a) => a.status === 'approved').length;
  const rejectedCount = applicants.filter((a) => a.status === 'rejected').length;

  return (
    <AdminLayout title="Candidate Applications" subtitle="Applications">
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#0A192F] text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/60 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* 1. TOP METRICS CARDS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Received</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{totalCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cohort 2024/2025</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{pendingCount}</h3>
              <p className="text-xs text-amber-600 font-bold mt-0.5">Action Required</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved Fellows</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{approvedCount}</h3>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">Credentials Verified</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{rejectedCount}</h3>
              <p className="text-xs text-rose-600 font-bold mt-0.5">Ineligible / Unverified</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2. FILTER & SEARCH CONTROL BAR */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => {
              const count =
                st === 'all' ? totalCount : st === 'pending' ? pendingCount : st === 'approved' ? approvedCount : rejectedCount;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input & Qualification Select */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applicant name, email, or hospital..."
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
              />
            </div>

            <select
              value={qualificationFilter}
              onChange={(e) => setQualificationFilter(e.target.value)}
              className="w-full sm:w-auto text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-slate-700 font-semibold"
            >
              <option value="all">All Qualifications</option>
              <option value="MBBS">MBBS / MD</option>
              <option value="FRCR">FRCR Radiologist</option>
              <option value="Pathologist">Forensic Pathologist</option>
              <option value="Radiographer">CT Radiographer</option>
            </select>
          </div>
        </div>

        {/* 3. MAIN APPLICATIONS TABLE CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">APPLICANT</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">QUALIFICATION & ROLE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ORGANIZATION</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">APPLIED DATE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">STATUS</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.length > 0 ? (
                  filteredApplicants.map((app) => (
                    <tr key={app.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <img
                            src={app.avatar}
                            alt={app.applicantName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/40 shrink-0"
                          />
                          <div className="min-w-0 text-left">
                            <div className="font-extrabold text-slate-900 text-sm truncate">{app.applicantName}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{app.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="font-bold text-slate-800 truncate">{app.qualification}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Clinical Specialist</div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="font-semibold text-slate-800 truncate">{app.organization}</div>
                        <div className="text-[11px] text-slate-500">{app.country}</div>
                      </td>

                      <td className="py-4 px-4 text-center text-slate-600 font-mono text-[11px]">{app.appliedDate}</td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'pending'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              app.status === 'approved'
                                ? 'bg-emerald-600'
                                : app.status === 'pending'
                                ? 'bg-amber-600'
                                : 'bg-rose-600'
                            }`}
                          />
                          {app.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setSelectedApplicant(app)}
                          className="inline-flex items-center space-x-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>View Application</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No applications match the current filter or search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. APPLICANT DETAIL MODAL */}
        {selectedApplicant && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedApplicant.avatar}
                    alt={selectedApplicant.applicantName}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-amber-400/50 shadow-sm"
                  />
                  <div>
                    <h2 className="text-xl font-black text-[#0A192F]">{selectedApplicant.applicantName}</h2>
                    <p className="text-xs text-slate-500">{selectedApplicant.qualification}</p>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 ${
                        selectedApplicant.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedApplicant.status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Status: {selectedApplicant.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    <span>EMAIL ADDRESS</span>
                  </div>
                  <p className="font-mono font-bold text-slate-800">{selectedApplicant.email}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span>PHONE NUMBER</span>
                  </div>
                  <p className="font-mono font-bold text-slate-800">{selectedApplicant.phone}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold">
                    <Building className="w-3.5 h-3.5 text-amber-500" />
                    <span>ORGANIZATION</span>
                  </div>
                  <p className="font-bold text-slate-800">{selectedApplicant.organization}</p>
                  <p className="text-[10px] text-slate-400">{selectedApplicant.country}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>APPLIED TIMESTAMP</span>
                  </div>
                  <p className="font-mono font-bold text-slate-800">{selectedApplicant.appliedDate}</p>
                </div>
              </div>

              {/* Attached CV Box */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
                    PDF
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{selectedApplicant.cvFileName}</p>
                    <p className="text-[10px] text-slate-500">Verified Medical License & CV Attachment</p>
                  </div>
                </div>

                <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CV</span>
                </button>
              </div>

              {/* Rejection reason if already rejected */}
              {selectedApplicant.rejectionReason && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-rose-800 uppercase">REJECTION REASON ON FILE</span>
                  <p className="text-slate-700">{selectedApplicant.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="w-full sm:w-auto text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  disabled={selectedApplicant.status === 'approved' || selectedApplicant.status === 'rejected'}
                  onClick={() => initiateReject(selectedApplicant)}
                  title={
                    selectedApplicant.status === 'approved'
                      ? 'Approved applications cannot be rejected'
                      : selectedApplicant.status === 'rejected'
                      ? 'Application is already rejected'
                      : undefined
                  }
                  className={`w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors ${
                    selectedApplicant.status === 'approved' || selectedApplicant.status === 'rejected'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>

                <button
                  disabled={selectedApplicant.status === 'rejected' || selectedApplicant.status === 'approved'}
                  onClick={() => initiateApprove(selectedApplicant)}
                  title={
                    selectedApplicant.status === 'rejected'
                      ? 'Rejected applications cannot be approved'
                      : selectedApplicant.status === 'approved'
                      ? 'Application is already approved'
                      : undefined
                  }
                  className={`w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 text-xs font-bold px-6 py-2.5 rounded-xl transition-colors ${
                    selectedApplicant.status === 'rejected' || selectedApplicant.status === 'approved'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Issue Access</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. APPROVAL CONFIRMATION MODAL CARD */}
        {actionType === 'approve' && pendingActionApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-5 text-center transform transition-all scale-100">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-[#0A192F]">Confirm Candidate Approval</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to approve <strong>{pendingActionApplicant.applicantName}</strong> ({pendingActionApplicant.qualification}) for enrollment in the Virtual Autopsy Fellowship Program?
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 text-left space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mr-1" />
                  <span>Automatic Access Dispatch:</span>
                </p>
                <p className="text-slate-700">
                  Upon confirmation, an automated onboarding email containing temporary login credentials will be dispatched to <strong>{pendingActionApplicant.email}</strong>.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    setPendingActionApplicant(null);
                    setActionType(null);
                  }}
                  className="flex-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApproval}
                  className="flex-1 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 py-3 rounded-xl shadow-md transition-colors inline-flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Approval</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. REJECTION CONFIRMATION MODAL CARD WITH REASON */}
        {actionType === 'reject' && pendingActionApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-5 text-left transform transition-all scale-100">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <XCircle className="w-7 h-7" />
              </div>

              <div className="space-y-1 text-center">
                <h3 className="text-xl font-extrabold text-[#0A192F]">Confirm Application Rejection</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to reject the application for <strong>{pendingActionApplicant.applicantName}</strong>? Please type the reason for rejection below.
                </p>
              </div>

              {/* Rejection Reason Text Box */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Reason for Rejection *</label>
                  <textarea
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    rows={3}
                    placeholder="Enter specific explanation for rejecting this candidate (e.g. Unverified license, qualification mismatch)..."
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-slate-50 text-slate-800 leading-relaxed"
                    required
                  />
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-[11px] text-rose-900 space-y-1">
                  <p className="font-bold">Notice to Candidate:</p>
                  <p className="text-slate-700">
                    A formal notification email containing this rejection feedback will be sent to <strong>{pendingActionApplicant.email}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    setPendingActionApplicant(null);
                    setActionType(null);
                  }}
                  className="flex-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRejection}
                  className="flex-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 py-3 rounded-xl shadow-md transition-colors text-center inline-flex items-center justify-center space-x-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
