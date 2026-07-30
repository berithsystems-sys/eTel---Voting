import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  ShieldAlert,
  Users,
  Vote,
  Boxes,
  Settings,
  Calendar,
  SlidersHorizontal,
  MessageSquare,
  Mail,
  Copy,
  Archive,
  Trash2,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Election } from '../types';

export type AdminTab = 'overview' | 'results' | 'fraud' | 'voters' | 'ballot' | 'addons' | 'settings';
export type SettingsSubTab = 'general' | 'dates' | 'voters' | 'messages' | 'email' | 'results' | 'duplicate' | 'archive' | 'delete';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  activeSettingsSubTab: SettingsSubTab;
  setActiveSettingsSubTab: (sub: SettingsSubTab) => void;
  election: Election;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeSettingsSubTab,
  setActiveSettingsSubTab,
  election,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const mainNavItems = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'results' as AdminTab, label: 'Results', icon: BarChart3 },
    { id: 'fraud' as AdminTab, label: 'Fraud Analysis', icon: ShieldAlert, badge: 'Audit' },
    { id: 'voters' as AdminTab, label: 'Voters', icon: Users },
    { id: 'ballot' as AdminTab, label: 'Ballot', icon: Vote },
    { id: 'addons' as AdminTab, label: 'Add-ons', icon: Boxes },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  const settingsSubNavItems = [
    { id: 'general' as SettingsSubTab, label: 'General', icon: SlidersHorizontal },
    { id: 'dates' as SettingsSubTab, label: 'Dates', icon: Calendar },
    { id: 'voters' as SettingsSubTab, label: 'Voters Settings', icon: Users },
    { id: 'messages' as SettingsSubTab, label: 'Messages', icon: MessageSquare },
    { id: 'email' as SettingsSubTab, label: 'Email', icon: Mail },
    { id: 'results' as SettingsSubTab, label: 'Results Settings', icon: BarChart3 },
    { id: 'duplicate' as SettingsSubTab, label: 'Duplicate', icon: Copy },
    { id: 'archive' as SettingsSubTab, label: 'Archive', icon: Archive },
    { id: 'delete' as SettingsSubTab, label: 'Delete', icon: Trash2, danger: true },
  ];

  const handleNavClick = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const handleSettingsSubClick = (sub: SettingsSubTab) => {
    setActiveTab('settings');
    setActiveSettingsSubTab(sub);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 w-64 lg:shrink-0 h-[calc(100vh-4rem)] bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col justify-between ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          
          {/* Main Navigation */}
          <div>
            <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Election Navigation
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && !isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Expandable Sub-navigation (Visible when Settings tab is active) */}
          {activeTab === 'settings' && (
            <div className="pt-2 border-t border-slate-800">
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Settings Menu
              </div>
              <div className="space-y-1 pl-2 border-l-2 border-indigo-500/30 ml-3">
                {settingsSubNavItems.map((sub) => {
                  const Icon = sub.icon;
                  const isSubActive = activeSettingsSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      id={`sidebar-sublink-${sub.id}`}
                      onClick={() => handleSettingsSubClick(sub.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isSubActive
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                          : sub.danger
                          ? 'text-rose-400 hover:bg-rose-500/10'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSubActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Footer Election Schedule Info */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Start Date:</span>
            <span className="font-mono text-slate-200">{new Date(election.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>End Date:</span>
            <span className="font-mono text-slate-200">{new Date(election.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Timezone:</span>
            <span className="font-mono text-indigo-300">{election.timezone}</span>
          </div>
        </div>

      </aside>
    </>
  );
};
