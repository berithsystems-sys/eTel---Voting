import React from 'react';
import {
  Boxes,
  KeyRound,
  MessageCircle,
  Globe,
  FileCheck2,
  Scale,
  Server,
  Sparkles,
  Check
} from 'lucide-react';

interface AddonsTabProps {
  onOpenCpanelModal: () => void;
}

export const AddonsTab: React.FC<AddonsTabProps> = ({ onOpenCpanelModal }) => {
  const addons = [
    {
      id: 'weighted-voting',
      title: 'Weighted Voting System',
      description: 'Assign custom voting power weights to different voter categories or shareholding classes.',
      icon: Scale,
      enabled: true,
      tag: 'Included'
    },
    {
      id: 'magic-link',
      title: 'Automatic Voter Magic Links',
      description: 'Voters bypass manual key entry by clicking personalized, secure single-use voting links.',
      icon: KeyRound,
      enabled: true,
      tag: 'Enabled'
    },
    {
      id: 'receipts',
      title: 'Cryptographic Ballot Receipts',
      description: 'Generates SHA-256 verifiable receipts allowing voters to independently confirm ballot intake.',
      icon: FileCheck2,
      enabled: true,
      tag: 'Active'
    },
    {
      id: 'sms-notifications',
      title: 'SMS & WhatsApp Voter Blast',
      description: 'Send automated vote invitation keys and deadline reminders directly to voter mobile phones.',
      icon: MessageCircle,
      enabled: false,
      tag: 'Add-on'
    },
    {
      id: 'custom-domain',
      title: 'Custom Brand Subdomain',
      description: 'Host your election on your organization domain (e.g., vote.visionlamka.org).',
      icon: Globe,
      enabled: false,
      tag: 'Add-on'
    },
    {
      id: 'cpanel-bundle',
      title: 'cPanel / Hostinger Express Launcher',
      description: 'Self-host this entire Node.js Express platform on your cPanel or Hostinger shared hosting account.',
      icon: Server,
      enabled: true,
      actionText: 'View Setup Guide',
      actionOnClick: onOpenCpanelModal
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Boxes className="w-5 h-5 text-indigo-600" />
          Platform Add-ons & Integrations
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enhance your election experience with automated notifications, weighted voting, and custom hosting connectors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
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

              <div className="pt-2 border-t border-slate-100">
                {item.actionOnClick ? (
                  <button
                    onClick={item.actionOnClick}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {item.actionText}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <Check className="w-4 h-4" />
                    <span>Configured in Settings</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
