import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

export interface PaymentRecord {
  id: string;
  transactionRef: string;
  candidateName: string;
  email: string;
  tier: string;
  amount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<string>('£0.00');
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/payments/admin');
      if (response.data) {
        const list = response.data.payments || [];
        setPayments(list);
        setTotalRevenue(response.data.totalRevenue || '£0.00');
        setCompletedCount(response.data.completedCount || 0);
      }
    } catch (err: any) {
      console.error('Failed to load admin payments:', err);
      setError(err?.message || 'Failed to load real payment records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(
    (p) =>
      p.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Financial Transactions & Payments" subtitle="Payments">
      <div className="space-y-6">
        {/* Top Metrics Row (Calculated from Real Database Transactions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue (£)</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{totalRevenue}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold text-lg">
              £
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Payments</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Clearance</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">£0.00</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Sync</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">Live Supabase DB</h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-slate-700 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Search Bar & Live Refresh */}
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

          <button
            type="button"
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Transactions</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                        <span>Fetching financial ledger from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => {
                    const dateFormatted = new Date(p.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });
                    return (
                      <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                          {p.transactionRef}
                          <div className="text-[10px] text-slate-400 font-normal">{dateFormatted}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="font-bold text-slate-900">{p.candidateName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.email}</div>
                        </td>
                        <td className="py-4 px-4 text-center text-slate-700 font-medium truncate">{p.tier}</td>
                        <td className="py-4 px-4 text-center font-mono font-extrabold text-amber-700 text-sm">
                          {p.amount}
                        </td>
                        <td className="py-4 px-4 text-center text-slate-600">{p.paymentMethod}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No payment transactions recorded in the database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
