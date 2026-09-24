import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  DollarSign,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export interface PaymentRecord {
  id: string;
  transactionRef: string;
  candidateName: string;
  email: string;
  tier: 'Full Fellowship Program (£2,499)' | 'Single Module PMCT (£499)' | 'PMCTA Specialization (£750)';
  amount: string;
  paymentMethod: 'Stripe Credit Card' | 'Bank Wire Transfer' | 'NHS Institutional Sponsor';
  date: string;
  status: 'completed' | 'processing' | 'refunded';
}

export const MOCK_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay-701',
    transactionRef: 'TXN-8820194',
    candidateName: 'Dr. Helena Vance',
    email: 'h.vance@stjude.org',
    tier: 'Full Fellowship Program (£2,499)',
    amount: '£2,499.00',
    paymentMethod: 'Stripe Credit Card',
    date: 'Oct 14, 2024',
    status: 'completed',
  },
  {
    id: 'pay-702',
    transactionRef: 'TXN-8820195',
    candidateName: 'Dr. Marcus Thorne',
    email: 'm.thorne@berninquest.ch',
    tier: 'Full Fellowship Program (£2,499)',
    amount: '£2,499.00',
    paymentMethod: 'Bank Wire Transfer',
    date: 'Oct 12, 2024',
    status: 'completed',
  },
  {
    id: 'pay-703',
    transactionRef: 'TXN-8820196',
    candidateName: 'Dr. Sarah Jenkins',
    email: 's.jenkins@melbourneforensic.au',
    tier: 'PMCTA Specialization (£750)',
    amount: '£750.00',
    paymentMethod: 'Stripe Credit Card',
    date: 'Oct 10, 2024',
    status: 'completed',
  },
  {
    id: 'pay-704',
    transactionRef: 'TXN-8820197',
    candidateName: 'Dr. Aris Thorne',
    email: 'a.thorne@nordicforensic.se',
    tier: 'Single Module PMCT (£499)',
    amount: '£499.00',
    paymentMethod: 'NHS Institutional Sponsor',
    date: 'Oct 08, 2024',
    status: 'processing',
  },
];

export const AdminPaymentsPage: React.FC = () => {
  const [payments] = useState<PaymentRecord[]>(MOCK_PAYMENT_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<PaymentRecord | null>(null);

  const filteredPayments = payments.filter((p) =>
    p.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Financial Transactions & Payments" subtitle="Payments">
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue (£)</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">£184,250.00</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold text-lg">
              £
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fellowship Sales</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">74 Enrollments</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Wires</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">£1,249.00</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payer Security</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">Stripe 3D Secure</h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-slate-700 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or TXN Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <button className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold rounded-2xl text-xs transition-colors shadow-xs inline-flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Transactions (CSV)</span>
          </button>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">TXN REFERENCE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">CANDIDATE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">PROGRAM TIER</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">AMOUNT (£)</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">PAYMENT METHOD</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">{p.transactionRef}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-slate-900">{p.candidateName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.email}</div>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-700 font-medium truncate">{p.tier}</td>
                    <td className="py-4 px-4 text-center font-mono font-extrabold text-amber-700 text-sm">{p.amount}</td>
                    <td className="py-4 px-4 text-center text-slate-600">{p.paymentMethod}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          p.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
