import { Shield, Bell, Eye, Database, Lock, Wifi, Monitor, ChevronRight } from 'lucide-react';

const SETTING_GROUPS = [
  {
    title: 'System Configuration',
    icon: <Monitor className="w-4 h-4 text-blue-400" />,
    items: [
      { label: 'Camera Resolution Default', value: '1080P @ 30FPS', status: 'active' },
      { label: 'AI Model Version', value: 'AEGIS-v4.2.1-prod', status: 'active' },
      { label: 'Detection Sensitivity', value: 'HIGH (Threshold: 0.72)', status: 'warning' },
      { label: 'Frame Buffer Size', value: '256 MB', status: 'active' },
    ],
  },
  {
    title: 'Alert & Notification',
    icon: <Bell className="w-4 h-4 text-orange-400" />,
    items: [
      { label: 'Critical Alert Channel', value: 'SMS + Dashboard + Email', status: 'active' },
      { label: 'Motion Warning Cooldown', value: '30 Seconds', status: 'active' },
      { label: 'Escalation Timeout', value: '120 Seconds', status: 'active' },
      { label: 'Silent Hours', value: 'DISABLED', status: 'inactive' },
    ],
  },
  {
    title: 'Security & Access',
    icon: <Lock className="w-4 h-4 text-emerald-400" />,
    items: [
      { label: 'Authentication Mode', value: 'MFA + Biometric', status: 'active' },
      { label: 'Session Timeout', value: '15 Minutes', status: 'active' },
      { label: 'Audit Log Retention', value: '90 Days', status: 'active' },
      { label: 'Remote Access', value: 'VPN Required', status: 'warning' },
    ],
  },
  {
    title: 'Network & Storage',
    icon: <Wifi className="w-4 h-4 text-indigo-400" />,
    items: [
      { label: 'Storage Backend', value: 'NVMe RAID-5 (4.2 TB Free)', status: 'active' },
      { label: 'Backup Schedule', value: 'Daily @ 03:00 UTC', status: 'active' },
      { label: 'Network Throughput', value: '842 Mbps Avg', status: 'active' },
      { label: 'Cloud Sync', value: 'DISABLED', status: 'inactive' },
    ],
  },
];

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  inactive: 'bg-slate-700/30 text-slate-500 border-slate-600/30',
};

export const SettingsPage = () => {
  return (
    <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
      <header className="flex justify-between items-end border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-wider text-slate-100 uppercase">System Configuration</h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest mt-2 uppercase">
            Manager Auth Level &bull; Read-Only Mode
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-sm">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">System Healthy</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {SETTING_GROUPS.map((group) => (
          <div key={group.title} className="bg-[#0f1522] border border-slate-800 rounded-sm p-5">
            <div className="flex items-center gap-3 mb-5">
              {group.icon}
              <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">{group.title}</h3>
            </div>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between group/item py-2.5 px-3 rounded-sm hover:bg-slate-800/30 transition-colors cursor-pointer border border-transparent hover:border-slate-700/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{item.label}</span>
                    <span className="text-xs text-slate-300 font-medium">{item.value}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm border ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover/item:text-slate-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* System Info Footer */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-sm p-4 flex justify-between items-center">
        <div className="flex gap-6">
          {[
            { icon: <Eye className="w-3.5 h-3.5" />, label: 'Active Cameras', value: '8 / 9' },
            { icon: <Database className="w-3.5 h-3.5" />, label: 'Storage Used', value: '67.3%' },
            { icon: <Shield className="w-3.5 h-3.5" />, label: 'Uptime', value: '99.97%' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 text-slate-400">
              {stat.icon}
              <span className="text-[10px] font-semibold tracking-wider uppercase">{stat.label}:</span>
              <span className="text-[10px] font-bold text-slate-200">{stat.value}</span>
            </div>
          ))}
        </div>
        <span className="text-[9px] text-slate-600 font-mono">BUILD: AEGIS-2023.11.24-RC3</span>
      </div>
    </main>
  );
};
