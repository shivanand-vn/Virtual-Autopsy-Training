import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
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

export type DateFilterType = '7days' | '30days' | '90days' | '1year' | 'all' | 'custom';

export interface DateFilterOption {
  id: DateFilterType;
  label: string;
}

const DATE_FILTER_OPTIONS: DateFilterOption[] = [
  { id: '7days', label: '7 Days' },
  { id: '30days', label: '30 Days' },
  { id: '90days', label: '90 Days' },
  { id: '1year', label: '1 Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom Date Range' },
];

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<string>('£0.00');
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Date Range Filter State (30 Days default selection)
  const [dateFilter, setDateFilter] = useState<DateFilterType>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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

  const filteredPayments = payments.filter((p) => {
    // 1. Search Query Filter
    const matchesSearch =
      p.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Date Range Filter (based on actual payment createdAt transaction date)
    const paymentTimestamp = new Date(p.createdAt).getTime();
    if (isNaN(paymentTimestamp)) return true;

    if (dateFilter === '7days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
      return paymentTimestamp >= cutoff.getTime();
    }

    if (dateFilter === '30days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      cutoff.setHours(0, 0, 0, 0);
      return paymentTimestamp >= cutoff.getTime();
    }

    if (dateFilter === '90days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      cutoff.setHours(0, 0, 0, 0);
      return paymentTimestamp >= cutoff.getTime();
    }

    if (dateFilter === '1year') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 365);
      cutoff.setHours(0, 0, 0, 0);
      return paymentTimestamp >= cutoff.getTime();
    }

    if (dateFilter === 'custom') {
      // When custom date is selected, initially list is empty until date is inserted
      if (!customStartDate && !customEndDate) {
        return false;
      }

      if (customStartDate) {
        const [sYear, sMonth, sDay] = customStartDate.split('-').map(Number);
        const startTime = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0).getTime();
        if (paymentTimestamp < startTime) return false;
      }
      if (customEndDate) {
        const [eYear, eMonth, eDay] = customEndDate.split('-').map(Number);
        const endTime = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999).getTime();
        if (paymentTimestamp > endTime) return false;
      }
      return true;
    }

    // 'all'
    return true;
  });

  const emptyStateMessage =
    payments.length === 0
      ? 'No payment transactions recorded in the database yet.'
      : dateFilter === 'custom' && !customStartDate && !customEndDate
      ? 'Please select a date range above to view transactions.'
      : 'No payment transactions found matching the selected date range or search criteria.';

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

        {/* Date Range Filter Buttons (Placed above the payments table) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date Range:</span>
            </span>
            <div className="inline-flex flex-wrap items-center bg-slate-100 p-1 rounded-2xl gap-1">
              {DATE_FILTER_OPTIONS.map((opt) => {
                const isSelected = dateFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDateFilter(opt.id);
                      if (opt.id === 'custom') {
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  max={customEndDate || undefined}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  min={customStartDate || undefined}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                />
              </div>
              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer px-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Payments Table: Responsive Cards on Mobile, Table on Desktop */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Mobile Card View (md:hidden - no horizontal scroll needed) */}
          <div className="md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  <span>Fetching financial ledger from database...</span>
                </div>
              </div>
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((p) => {
                const dateFormatted = new Date(p.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    {/* Top Row: Candidate Name, Email & Amount + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate" title={p.candidateName}>
                          {p.candidateName}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5" title={p.email}>
                          {p.email}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-amber-700 text-base">
                          {p.amount}
                        </div>
                        <span
                          className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mt-1"
                          title={p.status}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>

                    {/* Transaction Details Box */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="col-span-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Program Tier</span>
                        <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5" title={p.tier}>
                          {p.tier}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Payment Method</span>
                        <span className="text-xs font-medium text-slate-700 block mt-0.5 truncate" title={p.paymentMethod}>
                          {p.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">TXN Reference</span>
                        <span className="text-[11px] font-mono text-slate-800 font-bold block mt-0.5 truncate" title={p.transactionRef}>
                          {p.transactionRef}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal block">{dateFormatted}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs px-4">
                {emptyStateMessage}
              </div>
            )}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="w-[16%] py-3.5 px-4 font-bold text-center">TXN REFERENCE</th>
                  <th className="w-[25%] py-3.5 px-4 font-bold text-center">CANDIDATE</th>
                  <th className="w-[23%] py-3.5 px-4 font-bold text-center">PROGRAM TIER</th>
                  <th className="w-[11%] py-3.5 px-4 font-bold text-center">AMOUNT (£)</th>
                  <th className="w-[14%] py-3.5 px-4 font-bold text-center">PAYMENT METHOD</th>
                  <th className="w-[11%] py-3.5 px-4 font-bold text-center">STATUS</th>
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
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-800 max-w-0 overflow-hidden">
                          <div className="truncate [overflow-wrap:anywhere] break-all" title={p.transactionRef}>
                            {p.transactionRef}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal truncate">{dateFormatted}</div>
                        </td>
                        <td className="py-4 px-4 text-center max-w-0 overflow-hidden">
                          <div
                            className="font-bold text-slate-900 truncate [overflow-wrap:anywhere] break-words"
                            title={p.candidateName}
                          >
                            {p.candidateName}
                          </div>
                          <div
                            className="text-[10px] text-slate-400 font-mono truncate [overflow-wrap:anywhere] break-all"
                            title={p.email}
                          >
                            {p.email}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-slate-700 font-medium max-w-0 overflow-hidden">
                          <div className="truncate [overflow-wrap:anywhere] break-words" title={p.tier}>
                            {p.tier}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-extrabold text-amber-700 text-sm max-w-0 overflow-hidden">
                          <div className="truncate">{p.amount}</div>
                        </td>
                        <td className="py-4 px-4 text-center text-slate-600 max-w-0 overflow-hidden">
                          <div className="truncate [overflow-wrap:anywhere] break-words" title={p.paymentMethod}>
                            {p.paymentMethod}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center max-w-0 overflow-hidden">
                          <span
                            className="inline-flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 truncate max-w-full"
                            title={p.status}
                          >
                            <span className="truncate">{p.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      {emptyStateMessage}
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
