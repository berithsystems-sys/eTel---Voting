import React, { useState } from 'react';
import {
  Vote,
  Plus,
  Edit3,
  Trash2,
  Share2,
  Copy,
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  ChevronDown,
  AlertTriangle,
  X
} from 'lucide-react';
import { Election } from '../types';

interface ElectionManagerHeaderProps {
  elections: Election[];
  activeElection: Election;
  onSelectElection: (id: string) => void;
  onCreateElection: (data: { title: string; description?: string; startDate?: string; endDate?: string; timezone?: string }) => Promise<void>;
  onUpdateElection: (data: Partial<Election>) => Promise<void>;
  onDeleteElection: (id: string) => Promise<void>;
  onOpenVoterPortal: () => void;
}

export const ElectionManagerHeader: React.FC<ElectionManagerHeaderProps> = ({
  elections,
  activeElection,
  onSelectElection,
  onCreateElection,
  onUpdateElection,
  onDeleteElection,
  onOpenVoterPortal
}) => {
  const [copied, setCopied] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [newEndDate, setNewEndDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));
  const [newTimezone, setNewTimezone] = useState('Asia/Kolkata');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState(activeElection.title);
  const [editDesc, setEditDesc] = useState(activeElection.description || '');
  const [editStartDate, setEditStartDate] = useState(activeElection.startDate.slice(0, 16));
  const [editEndDate, setEditEndDate] = useState(activeElection.endDate.slice(0, 16));
  const [editTimezone, setEditTimezone] = useState(activeElection.timezone);

  const voterLink = `${window.location.origin}/?electionId=${activeElection.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(voterLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateElection({
        title: newTitle.trim(),
        description: newDesc.trim(),
        startDate: new Date(newStartDate).toISOString(),
        endDate: new Date(newEndDate).toISOString(),
        timezone: newTimezone
      });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to create election');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateElection({
        title: editTitle.trim(),
        description: editDesc.trim(),
        startDate: new Date(editStartDate).toISOString(),
        endDate: new Date(editEndDate).toISOString(),
        timezone: editTimezone
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update election');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onDeleteElection(activeElection.id);
      setIsDeleteConfirmOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to delete election');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm mb-6 space-y-4">
      
      {/* Top Row: Election Switcher + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Current Active Election Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Vote className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Election Portal ({elections.length} Total)
            </div>
            <div className="relative inline-block w-full max-w-md mt-0.5">
              <select
                value={activeElection.id}
                onChange={e => onSelectElection(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 font-bold text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer truncate transition-colors appearance-none"
              >
                {elections.map(el => (
                  <option key={el.id} value={el.id}>
                    {el.title} [{el.status}]
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Actions (New Election, Edit, Delete, Copy Share Link) */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/80 transition-colors cursor-pointer"
            title="Copy Shareable Voting Link for this election"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-600" />
                <span>Copy Shareable Voter Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditTitle(activeElection.title);
              setEditDesc(activeElection.description || '');
              setEditStartDate(activeElection.startDate.slice(0, 16));
              setEditEndDate(activeElection.endDate.slice(0, 16));
              setEditTimezone(activeElection.timezone);
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Election</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Election</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200/90 transition-colors cursor-pointer"
            title="Permanently Delete Selected Election Campaign"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete Election</span>
          </button>
        </div>
      </div>

      {/* CREATE ELECTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Create New Election Portal
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Election Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Council Election"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Official voting portal for electing council representatives..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEndDate}
                    onChange={e => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Timezone</label>
                <input
                  type="text"
                  value={newTimezone}
                  onChange={e => setNewTimezone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Create Election'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ELECTION MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Election Details
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Election Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Purpose</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editStartDate}
                    onChange={e => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editEndDate}
                    onChange={e => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Timezone</label>
                <input
                  type="text"
                  value={editTimezone}
                  onChange={e => setEditTimezone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">Delete Election Portal?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{activeElection.title}"</span>? All associated candidates and ballot configuration for this election will be permanently removed.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                {isSubmitting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
