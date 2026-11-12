import React, { useState } from 'react';
import { MessDay } from '../types/hostel';
import { UtensilsCrossed, Edit2, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { api } from '../services/api';

interface MessViewProps {
  mess: MessDay[];
  onRefresh: () => void;
}

export const MessView: React.FC<MessViewProps> = ({ mess, onRefresh }) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = daysOfWeek[new Date().getDay()];

  const [selectedDayName, setSelectedDayName] = useState<string>(
    mess.some((m) => m.day.toLowerCase() === todayDayName.toLowerCase())
      ? todayDayName
      : 'Monday'
  );

  const [editingDay, setEditingDay] = useState<MessDay | null>(null);
  const [editForm, setEditForm] = useState({
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: '',
    specialDiet: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDayData =
    mess.find((m) => m.day.toLowerCase() === selectedDayName.toLowerCase()) || mess[0];

  const handleOpenEdit = (day: MessDay) => {
    setEditingDay(day);
    setEditForm({
      breakfast: day.breakfast,
      lunch: day.lunch,
      snacks: day.snacks,
      dinner: day.dinner,
      specialDiet: day.specialDiet,
    });
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    try {
      setIsSubmitting(true);
      await api.updateMessDay(editingDay.day, editForm);
      setEditingDay(null);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating mess menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header with dining image */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xs">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hostel_dining_hall_1794453269412.jpg"
            alt="Dining Hall"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 dark:opacity-20"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Hostel Dining & Catering Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Weekly Dining Hall & Mess Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Nutritious, multi-cuisine meal plans prepared daily with certified hygiene standards and dedicated dietary accommodation counters.
          </p>
        </div>
      </div>

      {/* 7-Day Navigation Tabs (Single line with clean styling) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none shadow-xs">
        {mess.map((m) => {
          const isSelected = m.day.toLowerCase() === selectedDayName.toLowerCase();
          const isToday = m.day.toLowerCase() === todayDayName.toLowerCase();

          return (
            <button
              key={m.day}
              onClick={() => setSelectedDayName(m.day)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{m.day}</span>
              {isToday && (
                <span className="text-[10px] px-1 py-0.2 rounded font-bold bg-rose-500 text-white">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day View */}
      {currentDayData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {currentDayData.day} Dining Schedule
              </h2>
              {currentDayData.day.toLowerCase() === todayDayName.toLowerCase() && (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  (Active Menu Today)
                </span>
              )}
            </div>

            <button
              onClick={() => handleOpenEdit(currentDayData)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify Day Menu</span>
            </button>
          </div>

          {/* 4 Meals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breakfast */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Breakfast
                </span>
                <span className="text-xs text-slate-400 font-mono">07:30 AM – 09:30 AM</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentDayData.breakfast}
              </p>
            </div>

            {/* Lunch */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Lunch
                </span>
                <span className="text-xs text-slate-400 font-mono">12:30 PM – 02:30 PM</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentDayData.lunch}
              </p>
            </div>

            {/* Snacks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Evening Snacks & Tea
                </span>
                <span className="text-xs text-slate-400 font-mono">05:00 PM – 06:15 PM</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentDayData.snacks}
              </p>
            </div>

            {/* Dinner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Dinner
                </span>
                <span className="text-xs text-slate-400 font-mono">08:00 PM – 10:00 PM</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentDayData.dinner}
              </p>
            </div>
          </div>

          {/* Dietary Accommodation Callout */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Special Dietary Preferences & Allergies
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                {currentDayData.specialDiet}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Day Menu Modal */}
      {editingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Menu for {editingDay.day}
              </h2>
              <button
                onClick={() => setEditingDay(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Breakfast Items
                </label>
                <textarea
                  rows={2}
                  required
                  value={editForm.breakfast}
                  onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Lunch Items
                </label>
                <textarea
                  rows={2}
                  required
                  value={editForm.lunch}
                  onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Evening Snacks & Drinks
                </label>
                <textarea
                  rows={2}
                  required
                  value={editForm.snacks}
                  onChange={(e) => setEditForm({ ...editForm, snacks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dinner Items
                </label>
                <textarea
                  rows={2}
                  required
                  value={editForm.dinner}
                  onChange={(e) => setEditForm({ ...editForm, dinner: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Special Dietary Instructions
                </label>
                <textarea
                  rows={2}
                  value={editForm.specialDiet}
                  onChange={(e) => setEditForm({ ...editForm, specialDiet: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Updating...' : 'Save Meal Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
