import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Calendar,
  Users,
  MessageSquare,
  Mail,
  BarChart3,
  Copy,
  Archive,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { Election, ElectionSettings } from '../types';
import { SettingsSubTab } from './Sidebar';

interface SettingsTabProps {
  election: Election;
  activeSubTab: SettingsSubTab;
  setActiveSubTab: (sub: SettingsSubTab) => void;
  onUpdateElection: (data: Partial<Election>) => Promise<void>;
  onDuplicateElection: () => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  election,
  activeSubTab,
  setActiveSubTab,
  onUpdateElection,
  onDuplicateElection
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Local form states
  const [title, setTitle] = useState(election.title);
  const [timezone, setTimezone] = useState(election.timezone);
  const [startDate, setStartDate] = useState(election.startDate.slice(0, 16));
  const [endDate, setEndDate] = useState(election.endDate.slice(0, 16));

  const [settings, setSettings] = useState<ElectionSettings>({ ...election.settings });

  const handleToggle = (key: keyof ElectionSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangeText = (key: keyof ElectionSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await onUpdateElection({
      title,
      timezone,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      settings
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Sub-Nav */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              Election Settings & Preferences
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure voter verification, ballot confirmations, email invite templates, and results visibility.
            </p>
          </div>

          <button
            id="settings-btn-save-main"
            onClick={() => handleSaveAll()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Settings Saved!' : 'Save All Changes'}
          </button>
        </div>

        {/* Sub-Nav Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {[
            { id: 'general' as SettingsSubTab, label: 'General' },
            { id: 'dates' as SettingsSubTab, label: 'Dates' },
            { id: 'voters' as SettingsSubTab, label: 'Voters' },
            { id: 'messages' as SettingsSubTab, label: 'Messages' },
            { id: 'email' as SettingsSubTab, label: 'Email' },
            { id: 'results' as SettingsSubTab, label: 'Results' },
            { id: 'duplicate' as SettingsSubTab, label: 'Duplicate' },
            { id: 'archive' as SettingsSubTab, label: 'Archive' },
            { id: 'delete' as SettingsSubTab, label: 'Delete' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-SECTION 1: GENERAL */}
      {activeSubTab === 'general' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">General Settings</h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Election Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: DATES */}
      {activeSubTab === 'dates' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Election Schedule & Timings</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: VOTERS SETTINGS (Exact matching screenshot 1) */}
      {activeSubTab === 'voters' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Voters Settings
          </h3>

          <div className="space-y-6 text-xs">
            
            {/* Weighted Voting */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  Weighted Voting
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-slate-500">
                  Enabling this option will allow you to assign weights to each voter's vote.
                </p>
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/80 text-[11px] font-medium flex items-center gap-2 mt-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This setting cannot be changed after the election has been launched.</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.weightedVoting}
                onChange={() => handleToggle('weightedVoting')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* Ballot Receipt */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  Ballot Receipt
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-slate-500">
                  Enabling this option will allow voters to download a receipt that confirms their ballot has been received.
                </p>
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/80 text-[11px] font-medium flex items-center gap-2 mt-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This setting cannot be changed after the election has been launched.</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.ballotReceipt}
                onChange={() => handleToggle('ballotReceipt')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* Submit Ballot Confirmation */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    Submit Ballot Confirmation
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-slate-500">
                    When this option is enabled, voters will receive an alert when they submit their ballot that allows them to continue or cancel and make additional changes.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.submitBallotConfirmation}
                  onChange={() => handleToggle('submitBallotConfirmation')}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0 mt-1"
                />
              </div>

              {settings.submitBallotConfirmation && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Submit Ballot Confirmation Message</label>
                  <textarea
                    rows={2}
                    value={settings.submitBallotConfirmationMessage}
                    onChange={e => handleChangeText('submitBallotConfirmationMessage', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUB-SECTION 4: MESSAGES (Exact matching screenshot 2) */}
      {activeSubTab === 'messages' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            Election Messages
          </h3>

          <div className="space-y-5 text-xs">
            
            {/* Login Instructions */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 flex items-center gap-1">
                Login Instructions
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <p className="text-slate-500">This is the text that will appear on the election login page.</p>
              <textarea
                rows={3}
                value={settings.loginInstructions}
                onChange={e => handleChangeText('loginInstructions', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Vote Confirmation */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 flex items-center gap-1">
                Vote Confirmation
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <p className="text-slate-500">This is the text that your voters will see after successfully submitting their ballot.</p>
              <textarea
                rows={3}
                value={settings.voteConfirmationMessage}
                onChange={e => handleChangeText('voteConfirmationMessage', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* After Election */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 flex items-center gap-1">
                After Election
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <p className="text-slate-500">This is the text that your voters will see when they visit your election after it has ended. You can use this field to post the winners of the election.</p>
              <textarea
                rows={3}
                value={settings.afterElectionMessage}
                onChange={e => handleChangeText('afterElectionMessage', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

          </div>
        </div>
      )}

      {/* SUB-SECTION 5: EMAIL (Exact matching screenshot 3) */}
      {activeSubTab === 'email' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            Email Settings & Templates
          </h3>

          <div className="space-y-6 text-xs">
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Enable Email</div>
                  <p className="text-slate-500">Enabling this option will allow you to add email addresses for each of your voters.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableEmail}
                  onChange={() => handleToggle('enableEmail')}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Enable Automatic Voter Login</div>
                  <p className="text-slate-500">When this setting is enabled, then voters will be automatically logged in to vote upon clicking the link in the email they receive.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.automaticVoterLogin}
                  onChange={() => handleToggle('automaticVoterLogin')}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0"
                />
              </div>
            </div>

            {/* Voting Invite Template */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-900 text-sm">Voting Invite Template</div>
              <div className="p-2.5 bg-sky-50 text-sky-800 rounded-xl text-[11px] font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>This is the email that is sent out to voters when the election starts.</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">From Name</label>
                  <input
                    type="text"
                    value={settings.emailFromName}
                    onChange={e => handleChangeText('emailFromName', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={settings.emailSubject}
                    onChange={e => handleChangeText('emailSubject', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Body</label>
                  <textarea
                    rows={6}
                    value={settings.emailBodyTemplate}
                    onChange={e => handleChangeText('emailBodyTemplate', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono text-[11px]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">You can add the token <code className="bg-slate-200 px-1 py-0.5 rounded">%name%</code> to the email body and it will automatically be replaced by the voter's name.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-SECTION 6: RESULTS SETTINGS (Exact matching screenshot 4) */}
      {activeSubTab === 'results' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Results Settings
          </h3>

          <div className="space-y-6 text-xs">
            
            {/* Hide Results */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Hide Results During Election</div>
                <p className="text-slate-500">
                  Enabling this option will hide the election results from the election administrator until the election has ended. Voters will not be able to view election results regardless of this setting.
                </p>
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/80 text-[11px] font-medium flex items-center gap-2 mt-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This option cannot be changed after the election has been launched.</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.hideResultsDuringElection}
                onChange={() => handleToggle('hideResultsDuringElection')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* Allow Duplicate Write-Ins */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Allow Duplicate Write-In Values</div>
                <p className="text-slate-500">
                  Enabling this option will allow voters to provide the same values for all write-in options on a given ballot question.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowDuplicateWriteIn}
                onChange={() => handleToggle('allowDuplicateWriteIn')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0 mt-1"
              />
            </div>

          </div>
        </div>
      )}

      {/* SUB-SECTION 7: DUPLICATE */}
      {activeSubTab === 'duplicate' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Copy className="w-4 h-4 text-indigo-600" />
            Duplicate Election
          </h3>
          <p className="text-xs text-slate-500">
            Create a fresh draft clone of this election with all candidate options, ballot questions, and message configurations intact.
          </p>
          <button
            onClick={onDuplicateElection}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Duplicate Election Template
          </button>
        </div>
      )}

      {/* SUB-SECTION 8: ARCHIVE */}
      {activeSubTab === 'archive' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Archive className="w-4 h-4 text-slate-600" />
            Archive Election
          </h3>
          <p className="text-xs text-slate-500">
            Move this election into historical archive storage. Archived elections remain readable for audit reports but accept no further votes.
          </p>
          <button
            onClick={() => onUpdateElection({ status: 'Completed' })}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Archive Election Record
          </button>
        </div>
      )}

      {/* SUB-SECTION 9: DELETE */}
      {activeSubTab === 'delete' && (
        <div className="bg-rose-50 rounded-2xl p-6 border border-rose-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            Delete Election
          </h3>
          <p className="text-xs text-rose-700">
            Warning: Deleting this election permanently removes all associated ballot responses, candidate profiles, and audit records. This action cannot be undone.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to permanently delete this election?')) {
                onUpdateElection({ title: 'New Election (Reset)', status: 'Draft' });
              }
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Delete Election
          </button>
        </div>
      )}

    </div>
  );
};
