import React, { useState } from 'react';
import { FeeRecord, Resident } from '../types/hostel';
import {
  CreditCard,
  Search,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  X,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

interface FeesViewProps {
  fees: FeeRecord[];
  residents: Resident[];
  onRefresh: () => void;
  onOpenCreateFeeModal?: () => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  fees,
  residents,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FeeRecord | null>(null);

  // New Invoice form state
  const [newInvoice, setNewInvoice] = useState({
    residentId: '',
    amount: 400,
    type: 'Room Rent' as FeeRecord['type'],
    billingMonth: 'November 2026',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: '',
  });

  // Payment record form state
  const [payMethod, setPayMethod] = useState<'UPI' | 'Bank Transfer' | 'Credit Card' | 'Cash'>('UPI');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Totals
  const totalBilled = fees.reduce((acc, f) => acc + f.amount, 0);
  const totalCollected = fees.filter((f) => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
  const totalPending = fees
    .filter((f) => f.status === 'Pending' || f.status === 'Overdue')
    .reduce((acc, f) => acc + f.amount, 0);
  const overdueCount = fees.filter((f) => f.status === 'Overdue').length;

  // Filtered list
  const filteredFees = fees.filter((f) => {
    const query = search.toLowerCase();
    const matchesSearch =
      f.residentName.toLowerCase().includes(query) ||
      f.roomNumber.toLowerCase().includes(query) ||
      f.invoiceNumber.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchesType = typeFilter === 'All' || f.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.residentId) {
      setFormError('Please select a resident');
      return;
    }

    const selectedResident = residents.find((r) => r.id === newInvoice.residentId);
    if (!selectedResident) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.createFee({
        residentId: selectedResident.id,
        residentName: selectedResident.fullName,
        roomNumber: selectedResident.roomNumber || 'N/A',
        amount: Number(newInvoice.amount),
        type: newInvoice.type,
        billingMonth: newInvoice.billingMonth,
        dueDate: newInvoice.dueDate,
        notes: newInvoice.notes,
        status: 'Pending',
      });

      setIsCreateOpen(false);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating fee invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFee) return;

    try {
      setIsSubmitting(true);
      const paid = await api.recordPayment(payingFee.id, payMethod, payNotes);
      setPayingFee(null);
      onRefresh();
      // Open receipt automatically for instant confirmation
      if (paid) {
        setViewingReceipt(paid);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error recording payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Billing & Fee Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated room rent invoices, mess dues, receipts, and collection tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={api.getExportUrl('fees')}
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => {
              setNewInvoice({
                residentId: residents[0]?.id || '',
                amount: 400,
                type: 'Room Rent',
                billingMonth: 'November 2026',
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                notes: '',
              });
              setFormError('');
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Billed</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            ${totalBilled.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">All registered charges</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Collected Revenue</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            ${totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Cleared payments</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Outstanding Balance</span>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono tabular-nums">
            ${totalPending.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Pending & overdue</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Invoices</span>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono tabular-nums">
            {overdueCount}
          </p>
          <span className="text-[11px] text-slate-400">Requires follow-up</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, room, invoice #..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Fee Categories</option>
              <option value="Room Rent">Room Rent</option>
              <option value="Mess Charges">Mess Charges</option>
              <option value="Security Deposit">Security Deposit</option>
              <option value="Utility/Maintenance">Utility / Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Resident</th>
                <th className="py-3 px-4 font-semibold">Room</th>
                <th className="py-3 px-4 font-semibold">Fee Type</th>
                <th className="py-3 px-4 font-semibold">Billing Month</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No fee invoices found.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const isPaid = fee.status === 'Paid';
                  const isOverdue = fee.status === 'Overdue';

                  return (
                    <tr
                      key={fee.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {fee.invoiceNumber}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {fee.residentName}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                        {fee.roomNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {fee.type}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {fee.billingMonth}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                        {fee.dueDate}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                        ${fee.amount.toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isPaid
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : isOverdue ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>{fee.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid ? (
                            <button
                              onClick={() => setViewingReceipt(fee)}
                              title="Print / View Receipt"
                              className="flex items-center gap-1 px-2.5 py-1 font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Receipt</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setPayingFee(fee);
                                setPayNotes('');
                              }}
                              className="px-2.5 py-1 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded transition-colors cursor-pointer"
                            >
                              Collect Fee
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Record Fee Collection</h2>
                <p className="text-xs text-slate-500">Invoice: {payingFee.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setPayingFee(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900 dark:text-white">{payingFee.residentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room:</span>
                <span className="font-mono text-slate-900 dark:text-white">{payingFee.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Type:</span>
                <span className="text-slate-900 dark:text-white">{payingFee.type}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-900 dark:text-white">Amount Due:</span>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                  ${payingFee.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="UPI">UPI / Instant QR Payment</option>
                  <option value="Bank Transfer">Bank Wire / NEFT Transfer</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Cash">Cash at Warden Desk</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Notes / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. UPI Ref #482910"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingFee(null)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Receipt & Clear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Fee Invoice Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Generate Fee Invoice</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Resident <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newInvoice.residentId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, residentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Resident --</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.roomNumber ? `Room ${r.roomNumber}` : 'No room'}) - {r.rollNo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fee Category
                  </label>
                  <select
                    value={newInvoice.type}
                    onChange={(e) => setNewInvoice({ ...newInvoice, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Room Rent">Room Rent</option>
                    <option value="Mess Charges">Mess Charges</option>
                    <option value="Security Deposit">Security Deposit</option>
                    <option value="Utility/Maintenance">Utility / Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Billing Cycle
                  </label>
                  <input
                    type="text"
                    value={newInvoice.billingMonth}
                    onChange={(e) => setNewInvoice({ ...newInvoice, billingMonth: e.target.value })}
                    placeholder="e.g. November 2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  placeholder="Optional memo..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {viewingReceipt && (
        <InvoiceReceiptModal fee={viewingReceipt} onClose={() => setViewingReceipt(null)} />
      )}
    </div>
  );
};
