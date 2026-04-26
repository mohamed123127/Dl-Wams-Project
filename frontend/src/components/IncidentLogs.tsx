import { Snowflake } from 'lucide-react';

interface IncidentLogsProps {
  onInitiateLockdown: () => void;
}

const LOGS = [
  {
    type: 'CRITICAL ALERT',
    time: '14:22:04',
    content: 'Unusual behavior detected in LIQUOR_DEPT. Item concealment pattern flagged.',
    badges: ['CAM_03', 'PID_0744'],
    color: 'border-red-500',
    titleColor: 'text-red-400'
  },
  {
    type: 'MOTION WARNING',
    time: '14:21:50',
    content: 'Multiple people entering restricted area: LOADING_DOCK.',
    badges: ['CAM_08'],
    color: 'border-orange-500',
    titleColor: 'text-orange-400'
  },
  {
    type: 'SYSTEM UPDATE',
    time: '14:18:22',
    content: 'AI Model re-calibrated for low-light conditions on Sector A.',
    badges: [],
    color: 'border-blue-500',
    titleColor: 'text-blue-400'
  },
  {
    type: 'FACE RECOGNITION',
    time: '14:15:10',
    content: 'Known frequent shopper identified at ENTRANCE_MAIN.',
    badges: ['CAM_05'],
    color: 'border-indigo-400',
    titleColor: 'text-indigo-400'
  }
];

export const IncidentLogs = ({ onInitiateLockdown }: IncidentLogsProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-lg font-bold tracking-widest text-slate-200">INCIDENT LOGS</h2>
        <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-widest">Real-time AI Analysis</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {LOGS.map((log, i) => (
          <div key={i} className={`bg-slate-900/50 border border-slate-800/80 border-l-2 ${log.color} p-4 text-sm cursor-pointer hover:bg-slate-800/40 transition-colors`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold tracking-wider ${log.titleColor} uppercase`}>{log.type}</span>
              <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-3">
              {log.content}
            </p>
            {log.badges.length > 0 && (
              <div className="flex space-x-2">
                {log.badges.map(badge => (
                  <span key={badge} className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 text-slate-400 text-[9px] font-mono rounded-full">
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onInitiateLockdown}
          className="w-full flex items-center justify-center space-x-2 bg-blue-300/10 hover:bg-red-500/20 text-blue-400 hover:text-red-400 hover:border-red-500/50 border border-blue-400/30 py-3 rounded-xs font-bold tracking-widest text-xs uppercase transition-all duration-300"
        >
          <Snowflake className="w-4 h-4" />
          <span>Initiate Lockdown</span>
        </button>
      </div>
    </div>
  );
};
