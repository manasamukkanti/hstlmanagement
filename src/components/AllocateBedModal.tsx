import React, { useState } from 'react';
import { Room, Resident } from '../types/hostel';
import { Bed, X, UserPlus } from 'lucide-react';
import { api } from '../services/api';

interface AllocateBedModalProps {
  roomId: string;
  bedNumber: number;
  rooms: Room[];
  residents: Resident[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AllocateBedModal: React.FC<AllocateBedModalProps> = ({
  roomId,
  bedNumber,
  rooms,
  residents,
  onClose,
  onSuccess,
}) => {
  const room = rooms.find((r) => r.id === roomId);
  const [selectedResidentId, setSelectedResidentId] = useState<string>(
    residents.find((r) => !r.roomId)?.id || residents[0]?.id || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!room) return null;

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) {
      setFormError('Please select a student resident');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.updateResident(selectedResidentId, {
        roomId: room.id,
        roomNumber: room.roomNumber,
        bedNumber: bedNumber,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error allocating bed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Allocate Bed {bedNumber}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Room:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{room.roomNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Wing / Floor:</span>
            <span className="text-slate-800 dark:text-slate-200">{room.block} · Floor {room.floor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Monthly Rent:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              ${room.monthlyRent}/month
            </span>
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleAllocate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Resident to Assign
            </label>
            <select
              required
              value={selectedResidentId}
              onChange={(e) => setSelectedResidentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <optgroup label="Unallocated Residents">
                {residents
                  .filter((r) => !r.roomId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.rollNo}) - Unassigned
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Active Residents (Transfer)">
                {residents
                  .filter((r) => r.roomId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.rollNo}) - Current: Room {r.roomNumber}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Allocating...' : 'Confirm Bed Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
