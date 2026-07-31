import React, { useState } from 'react';
import {
  Boxes,
  KeyRound,
  MessageCircle,
  Globe,
  FileCheck2,
  Scale,
  Server,
  Sparkles,
  Check,
  ShieldCheck,
  Lock,
  Edit3,
  Save,
  Megaphone,
  BellRing
} from 'lucide-react';
import { UserProfile } from '../types';

interface AddonItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
  tag: string;
  category: 'core' | 'notification' | 'hosting';
}

interface AddonsTabProps {
  currentUser?: UserProfile;
  onOpenAuthModal?: () => void;
  onOpenCpanelModal: () => void;
}

export const AddonsTab: React.FC<AddonsTabProps> = ({
  currentUser,
  onOpenAuthModal,
  onOpenCpanelModal
}) => {
  const isAdmin = !!currentUser?.isLoggedIn;

  // Addons state managed by Admin
  const [addonsList, setAddonsList] = useState<AddonItem[]>([
    {
      id: 'weighted-voting',
      title: 'Weighted Voting System',
      description: 'Assign custom voting power weights to different voter categories or shareholding classes.',
      icon: Scale,
      enabled: true,
      tag: 'Included',
      category: 'core'
    },
    {
      id: 'magic-link',
      title: 'Automatic Voter Magic Links',
      description: 'Voters bypass manual key entry by clicking personalized, secure single-use voting links.',
      icon: KeyRound,
      enabled: true,
      tag: 'Enabled',
      category: 'core'
    },
    {
      id: 'receipts',
      title: 'Cryptographic Ballot Receipts',
      description: 'Generates SHA-256 verifiable receipts allowing voters to independently confirm ballot intake.',
      icon: FileCheck2,
      enabled: true,
      tag: 'Active',
      category: 'core'
    },
    {
      id: 'sms-notifications',
      title: 'SMS & WhatsApp Voter Blast',
      description: 'Send automated vote invitation keys and deadline reminders directly to voter mobile phones.',
      icon: MessageCircle,
      enabled: true,
      tag: 'Add-on Enabled',
      category: 'notification'
    },
    {
      id: 'custom-domain',
      title: 'Custom Brand Subdomain',
      description: 'Host your election on your custom organization domain name (e.g., vote.yourorg.org).',
      icon: Globe,
      enabled: false,
      tag: 'Add-on Available',
      category: 'hosting'
    },
    {
      id: 'cpanel-bundle',
      title: 'cPanel / Hostinger Express Launcher',
      description: 'Self-host this entire Node.js Express platform on your cPanel or Hostinger shared hosting account.',
      icon: Server,
      enabled: true,
      tag: 'Included',
      category: 'hosting'
    }
  ]);

  // Admin Updates Notice state
  const [adminNotice, setAdminNotice] = useState('System Notice: All elections are equipped with cryptographic SHA-256 receipt verification, SMTP email invite integration, and automated magic links.');
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState(adminNotice);

  const handleToggleAddon = (id: string) => {
    if (!isAdmin) {
      alert('Only System Administrators and Organizers can enable or disable platform add-ons.');
      return;
    }
    setAddonsList(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextState = !item.enabled;
          return {
            ...item,
            enabled: nextState,
            tag: nextState ? 'Enabled by Admin' : 'Disabled'
          };
        }
        return item;
      })
    );
  };

  const handleSaveNotice = () => {
    setAdminNotice(noticeDraft);
    setIsEditingNotice(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Admin Badge */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Platform Add-ons & Updates Control</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure system modules, enable communication integrations, and publish platform notices for election managers.
          </p>
        </div>

        {isAdmin ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shrink-0 self-start md:self-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin Status Control Active</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold shrink-0 self-start md:self-center">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Managed by System Administrator</span>
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="ml-1 text-[11px] underline font-extrabold text-amber-900 hover:text-indigo-600 cursor-pointer"
              >
                Log in
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Updates & Notices Box */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-indigo-200">
            <Megaphone className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>System Notice & Platform Updates (Admin Managed)</span>
          </div>
          {isAdmin && !isEditingNotice && (
            <button
              onClick={() => { setNoticeDraft(adminNotice); setIsEditingNotice(true); }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Notice</span>
            </button>
          )}
        </div>

        {isEditingNotice ? (
          <div className="space-y-2">
            <textarea
              rows={2}
              value={noticeDraft}
              onChange={e => setNoticeDraft(e.target.value)}
              className="w-full p-3 bg-slate-800 text-white border border-indigo-400/50 rounded-xl text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingNotice(false)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotice}
                className="px-4 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notice</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-indigo-100 flex items-start gap-2.5">
            <BellRing className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{adminNotice}</p>
          </div>
        )}
      </div>

      {/* Add-ons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addonsList.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                item.enabled ? 'border-slate-200/90 shadow-xs' : 'border-slate-200/60 opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${item.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.id === 'cpanel-bundle' ? (
                  <button
                    onClick={onOpenCpanelModal}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    View Hostinger / cPanel Launcher
                  </button>
                ) : (
                  <>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Status: <strong className={item.enabled ? 'text-emerald-700' : 'text-slate-600'}>{item.enabled ? 'Enabled' : 'Disabled'}</strong>
                    </span>

                    {isAdmin ? (
                      <button
                        onClick={() => handleToggleAddon(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          item.enabled
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                        }`}
                      >
                        {item.enabled ? 'Disable' : 'Enable Add-on'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        Admin Only Toggle
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
