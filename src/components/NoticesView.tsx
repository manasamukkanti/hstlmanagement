import React, { useState } from 'react';
import { Notice } from '../types/hostel';
import { Bell, Plus, Trash2, Calendar, AlertTriangle, Users, Tag, X } from 'lucide-react';
import { api } from '../services/api';

interface NoticesViewProps {
  notices: Notice[];
  onRefresh: () => void;
}

export const NoticesView: React.FC<NoticesViewProps> = ({ notices, onRefresh }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isPostOpen, setIsPostOpen] = useState(false);

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'General' as Notice['category'],
    priority: 'Normal' as Notice['priority'],
    targetAudience: 'All Residents',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredNotices = notices.filter(
    (n) => categoryFilter === 'All' || n.category === categoryFilter
  );

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      setFormError('Title and announcement content are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.createNotice(newNotice);
      setIsPostOpen(false);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error posting notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete announcement "${title}"?`)) return;
    try {
      await api.deleteNotice(id);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting notice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hostel Notice Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official circulars, curfew rules, maintenance advisories, and campus student events
          </p>
        </div>

        <button
          onClick={() => {
            setNewNotice({
              title: '',
              content: '',
              category: 'General',
              priority: 'Normal',
              targetAudience: 'All Residents',
            });
            setFormError('');
            setIsPostOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none shadow-xs">
        {['All', 'General', 'Rules & Curfew', 'Maintenance', 'Mess', 'Event'].map((cat) => {
          const isSelected = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Notices Grid */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No active announcements</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Check back later for updates from the Warden's office.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotices.map((notice) => {
            const isUrgent = notice.priority === 'Urgent';
            const isHigh = notice.priority === 'High';

            return (
              <div
                key={notice.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {notice.priority}
                    </span>

                    <button
                      onClick={() => handleDelete(notice.id, notice.title)}
                      title="Delete notice"
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {notice.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>{notice.category}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono tabular-nums">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{notice.postedDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Notice Modal */}
      {isPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Publish New Announcement</h2>
              <button
                onClick={() => setIsPostOpen(false)}
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

            <form onSubmit={handlePostNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="e.g. Campus Wi-Fi Scheduled Maintenance"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="General">General</option>
                    <option value="Rules & Curfew">Rules & Curfew</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Mess">Mess</option>
                    <option value="Event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={newNotice.targetAudience}
                  onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All Residents">All Residents</option>
                  <option value="Block A & B">Block A & B</option>
                  <option value="Block C & D">Block C & D</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Body <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Type official details, timings, guidelines..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Posting...' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
