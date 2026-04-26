import { AlertCircle } from 'lucide-react';

interface IncidentDetailsSidebarProps {
  items?: any[];
  selectedItemId?: number | null;
  onSelectItem?: (itemId: number) => void;
}

export const IncidentDetailsSidebar = ({ items = [], selectedItemId, onSelectItem }: IncidentDetailsSidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-[#0d121c] overflow-y-auto">
      {/* Notification Panel Header */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xs font-bold tracking-widest text-orange-400 uppercase flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Incidents ({items.length})
        </h2>
      </div>

      {/* Incident Items */}
      {items.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem?.(item.id)}
                className={`p-3 rounded-sm border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/30'
                    : !item.viewed
                      ? 'bg-slate-800/80 border-orange-500/50 hover:bg-slate-800/60'
                      : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {!item.viewed ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Unviewed"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" title="Viewed"></span>
                    )}
                    <span className="text-[10px] font-bold text-orange-400">SHOPLIFTING ALERT</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.date} {item.time}</span>
                </div>
                <p className={`text-xs ${!item.viewed ? 'text-slate-200' : 'text-slate-400'}`}>
                  Suspicious activity detected at {item.location}.
                </p>
                <div className="mt-2 text-[9px] text-slate-400 font-mono">
                  Camera: <span className="text-blue-400">{item.camera}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-xs text-slate-500 tracking-widest uppercase">No incidents recorded</p>
        </div>
      )}
    </div>
  );
};
