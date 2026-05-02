import React, { useState, useEffect } from 'react';
import { Shield, LayoutGrid, AlertTriangle, BarChart2, Users, Settings, LogOut } from 'lucide-react';
import { authApi } from '../services/api';
import type { TabName } from '../frontend/Dashboard';

interface SidebarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  onLogout: () => void;
  hasIncidentNotification?: boolean;
}

export const Sidebar = ({ activeTab, onTabChange, onLogout, hasIncidentNotification }: SidebarProps) => {
  const [user, setUser] = useState<{ username: string, role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.verifyRole();
        setUser(data);
      } catch (e) {
        console.error('Failed to verify role', e);
      }
    };
    fetchUser();
  }, []);

  const navItems: { icon: React.ReactNode; label: TabName; hasNotification?: boolean }[] = [
    { icon: <LayoutGrid className="w-4 h-4" />, label: 'Camera Grid' },
    { icon: <AlertTriangle className="w-4 h-4" />, label: 'Incident Logs', hasNotification: hasIncidentNotification },
    // { icon: <BarChart2 className="w-4 h-4" />, label: 'Analytics' },
    { icon: <Users className="w-4 h-4" />, label: 'Staff Management' },
    { icon: <Users className="w-4 h-4" />, label: 'Inventory Log' },
    { icon: <Users className="w-4 h-4" />, label: 'POS Terminal' },
    // { icon: <Settings className="w-4 h-4" />, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-[#0a0f18] border-r border-slate-800 flex flex-col h-full justify-between">
      <div>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-10">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-bold tracking-widest text-slate-200">AEGIS SENTINEL</h2>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.filter((item) => {
            if (!user) return true; // Show all by default or wait? Better to filter
            const role = user.role.toLowerCase();
            const allowedTabs: Record<string, string[]> = {
              admin: ['Camera Grid', 'Incident Logs', 'Analytics', 'Staff Management', 'Inventory Log', 'POS Terminal', 'Settings'],
              manager: ['Camera Grid', 'Incident Logs', 'Analytics', 'Staff Management', 'Inventory Log', 'POS Terminal', 'Settings'],
              guard: ['Camera Grid', 'Incident Logs'],
              seller: ['POS Terminal'],
              inventorymanager: ['Inventory Log'],
            };
            const roleTabs = allowedTabs[role] || [];
            return roleTabs.includes(item.label);
          }).map((item, index) => (
            <button
              key={index}
              onClick={() => onTabChange(item.label)}
              className={`w-full flex items-center justify-between px-8 py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-200 ${activeTab === item.label
                ? 'bg-slate-800/40 text-blue-400 border-l-2 border-blue-500'
                : 'text-slate-500 hover:bg-slate-800/20 hover:text-slate-300 border-l-2 border-transparent'
                }`}
            >
              <div className="flex items-center space-x-4">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.hasNotification && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 mt-auto">
        {user && (
          <div className="mb-6 px-2">
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">Active User</p>
            <p className="text-xs text-slate-300 font-mono tracking-widest uppercase mb-2">{user.username}</p>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
              <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase">{user.role}</span>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-3 p-3 bg-slate-800/30 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 text-xs font-bold tracking-widest uppercase transition-colors border border-slate-700/50 rounded-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>System Logout</span>
        </button>
      </div>
    </aside>
  );
};
