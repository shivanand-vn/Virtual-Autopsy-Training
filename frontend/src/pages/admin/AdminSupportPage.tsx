import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Eye,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export interface SupportTicket {
  id: string;
  ticketId: string;
  senderName: string;
  email: string;
  subject: string;
  category: 'Technical DICOM' | 'Billing & Invoice' | 'Certificate Verification' | 'Exam Issue';
  priority: 'High' | 'Medium' | 'Low';
  createdDate: string;
  status: 'open' | 'resolved';
  description: string;
}

export const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-801',
    ticketId: 'SUP-4019',
    senderName: 'Dr. Helena Vance',
    email: 'h.vance@stjude.org',
    subject: 'DICOM Viewer WebGL Rendering Delay on Safari',
    category: 'Technical DICOM',
    priority: 'High',
    createdDate: 'Oct 14, 2024',
    status: 'open',
    description: 'When switching to 3D surface reconstruction slice windowing in Module 2, the viewer experiences a frame drop on macOS Safari.',
  },
  {
    id: 'tkt-802',
    ticketId: 'SUP-4020',
    senderName: 'Dr. Marcus Thorne',
    email: 'm.thorne@berninquest.ch',
    subject: 'NHS Hospital Group Invoice Request (£2,499)',
    category: 'Billing & Invoice',
    priority: 'Medium',
    createdDate: 'Oct 13, 2024',
    status: 'open',
    description: 'Please issue a VAT itemized institutional invoice for Bern Medico-Legal Center accounting department.',
  },
  {
    id: 'tkt-803',
    ticketId: 'SUP-4021',
    senderName: 'Dr. Sarah Jenkins',
    email: 's.jenkins@melbourneforensic.au',
    subject: 'CME Accreditation Certificate QR Code Verification',
    category: 'Certificate Verification',
    priority: 'Low',
    createdDate: 'Oct 11, 2024',
    status: 'resolved',
    description: 'Verification QR code successfully scanned and validated against RCPath registry node.',
  },
];

export const AdminSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter((t) =>
    t.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t))
    );
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: 'resolved' } : null));
    }
  };

  return (
    <AdminLayout title="Help & Support Desk" subtitle="Support">
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tickets</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{tickets.length}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Inquiries</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {tickets.filter((t) => t.status === 'open').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Tickets</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {tickets.filter((t) => t.status === 'resolved').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Response Time</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">1.4 Hours</h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-slate-700 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search support tickets by ID, sender, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">TICKET ID</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">SENDER</th>
                  <th className="w-2/6 py-3.5 px-4 font-bold text-center">SUBJECT & CATEGORY</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">PRIORITY</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">STATUS</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">{t.ticketId}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-slate-900">{t.senderName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.email}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-extrabold text-slate-900 truncate">{t.subject}</div>
                      <div className="text-[10px] text-amber-800 font-bold mt-0.5">{t.category}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : t.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  {selectedTicket.ticketId}
                </span>
                <h3 className="text-lg font-black text-[#0A192F] mt-2">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500">{selectedTicket.senderName} ({selectedTicket.email})</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="font-bold text-slate-400 uppercase text-[10px]">TICKET DESCRIPTION</p>
                <p className="text-slate-800 mt-1 leading-relaxed">{selectedTicket.description}</p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800">Admin Response:</label>
                <textarea
                  rows={3}
                  placeholder="Type response to candidate..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {selectedTicket.status !== 'resolved' && (
                <button
                  onClick={() => resolveTicket(selectedTicket.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    resolveTicket(selectedTicket.id);
                    setSelectedTicket(null);
                    setReplyText('');
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md inline-flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Response</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
