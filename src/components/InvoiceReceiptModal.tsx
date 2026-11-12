import React from 'react';
import { FeeRecord } from '../types/hostel';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface InvoiceReceiptModalProps {
  fee: FeeRecord;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({ fee, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Official Payment Receipt</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 font-sans space-y-4">
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">HostelFlow Residence ERP</h3>
              <p className="text-[11px] text-slate-500">Campus Housing & Hall of Residence</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {fee.invoiceNumber}
              </span>
              <p className="text-[10px] text-slate-400">
                Date: {fee.paidDate || new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Resident Name</span>
              <strong className="text-slate-900 dark:text-white block font-medium">{fee.residentName}</strong>
              <span className="text-slate-500 font-mono text-[11px]">Room {fee.roomNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Billing Cycle</span>
              <strong className="text-slate-900 dark:text-white block font-medium">{fee.billingMonth}</strong>
              <span className="text-slate-500 text-[11px]">Due: {fee.dueDate}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs border-y border-slate-200 dark:border-slate-700 py-2">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="py-1.5 text-left font-medium">Description</th>
                <th className="py-1.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 text-slate-800 dark:text-slate-200">
                  {fee.type} - {fee.billingMonth}
                  {fee.notes && <span className="block text-[11px] text-slate-400">Note: {fee.notes}</span>}
                </td>
                <td className="py-2 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                  ${fee.amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total & Payment Method */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Payment Cleared</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Method: {fee.paymentMethod || 'Electronic Transfer'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Amount Paid</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                ${fee.amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer Seal */}
          <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p className="text-[10px] text-slate-400">
              This is a computer-generated transaction acknowledgement receipt. No signature required.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
