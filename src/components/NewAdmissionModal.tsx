import React, { useState } from 'react';
import { Room, Resident } from '../types/hostel';
import { Users, X } from 'lucide-react';
import { api } from '../services/api';

interface NewAdmissionModalProps {
  rooms: Room[];
  onClose: () => void;
  onSuccess: () => void;
}

export const NewAdmissionModal: React.FC<NewAdmissionModalProps> = ({
  rooms,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    rollNo: `HST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    email: '',
    phone: '',
    course: 'B.Tech Computer Science',
    emergencyName: '',
    emergencyRelation: 'Parent',
    emergencyPhone: '',
    roomId: '',
    bedNumber: 1,
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOutDate: '2028-05-30',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available rooms with free beds
  const availableRooms = rooms.filter((r) => r.status !== 'Maintenance' && r.occupiedBeds < r.capacity);

  // When room is selected, calculate available beds in that room
  const selectedRoom = rooms.find((r) => r.id === formData.roomId);
  const vacantBedSlots = selectedRoom
    ? selectedRoom.bedSlots.filter((b) => !b.residentId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Full name, email, and phone are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.createResident({
        fullName: formData.fullName,
        rollNo: formData.rollNo,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        course: formData.course,
        emergencyContact: {
          name: formData.emergencyName || 'Guardian',
          relation: formData.emergencyRelation || 'Parent',
          phone: formData.emergencyPhone || formData.phone,
        },
        roomId: formData.roomId || null,
        roomNumber: selectedRoom?.roomNumber || null,
        bedNumber: formData.roomId ? Number(formData.bedNumber) : null,
        checkInDate: formData.checkInDate,
        expectedCheckOutDate: formData.expectedCheckOutDate,
        status: 'Active',
        kycStatus: 'Verified',
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error admitting resident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">New Resident Admission</h2>
            <p className="text-xs text-slate-500">Student enrollment and dormitory bed allocation</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Maya Thorne"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Roll / ID Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course / Department
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@campus.edu"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Emergency Guardian */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                placeholder="Parent's Name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Relation
              </label>
              <input
                type="text"
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                placeholder="e.g. Father"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Guardian Phone
              </label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Room Allocation */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assign Dormitory Room
              </label>
              <select
                value={formData.roomId}
                onChange={(e) => {
                  const rId = e.target.value;
                  const found = rooms.find((r) => r.id === rId);
                  const firstFree = found?.bedSlots.find((b) => !b.residentId)?.bedNumber || 1;
                  setFormData({ ...formData, roomId: rId, bedNumber: firstFree });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              >
                <option value="">-- Assign Later --</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} ({r.block} - {r.capacity - r.occupiedBeds} beds free)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bed Number
              </label>
              <select
                disabled={!formData.roomId}
                value={formData.bedNumber}
                onChange={(e) => setFormData({ ...formData, bedNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 font-mono"
              >
                {vacantBedSlots.length === 0 ? (
                  <option value="1">Bed 1</option>
                ) : (
                  vacantBedSlots.map((b) => (
                    <option key={b.bedNumber} value={b.bedNumber}>
                      Bed {b.bedNumber} (Vacant)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Check-In Date
              </label>
              <input
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Expected Check-Out Date
              </label>
              <input
                type="date"
                value={formData.expectedCheckOutDate}
                onChange={(e) => setFormData({ ...formData, expectedCheckOutDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
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
              {isSubmitting ? 'Admitting...' : 'Complete Admission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
