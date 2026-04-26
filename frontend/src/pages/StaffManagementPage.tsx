import { useState, useEffect } from 'react';
import { Shield, CheckCircle, ClipboardList, Plus, Search, X, UserPlus, MapPin, Clock } from 'lucide-react';

// --- Types ---
interface StaffMember {
  id: string;
  name: string;
  rank?: string;
  status: 'ON PATROL' | 'STATIONARY' | 'BREAK' | 'OFFLINE';
  location: string;
  shift: string;
  avatar: string;
  selected: boolean;
}

interface PatrolAssignment {
  id: string;
  title: string;
  status: 'ACTIVE' | 'PENDING';
  personnel: string;
  icon: 'shield' | 'clipboard';
}

// --- Initial Data ---
const INITIAL_STAFF: StaffMember[] = [
  { id: 'AS-9921', name: 'SGT. MARCUS VANE', rank: 'Sergeant', status: 'ON PATROL', location: 'Aisle 4 - Logistics Sector', shift: '04:32:15', avatar: 'MV', selected: false },
  { id: 'AS-8812', name: 'ELENA RODRIGUEZ', status: 'STATIONARY', location: 'Main Gate Control Room', shift: '06:15:00', avatar: 'ER', selected: false },
  { id: 'AS-1104', name: 'JAXON THORNE', status: 'BREAK', location: 'Recreation Hub C', shift: '09:45:18', avatar: 'JT', selected: false },
  { id: 'AS-4429', name: 'SARAH CHEN', status: 'OFFLINE', location: 'OFF_SITE', shift: '--:--:--', avatar: 'SC', selected: false },
];

const INITIAL_ASSIGNMENTS: PatrolAssignment[] = [
  { id: 'pa-1', title: 'SECTOR 4 SWEEP', status: 'ACTIVE', personnel: 'Personnel: Marcus V., Elena R.', icon: 'shield' },
  { id: 'pa-2', title: 'WAREHOUSE B INVENTORY', status: 'PENDING', personnel: 'Awaiting personnel availability', icon: 'clipboard' },
];

const statusColor: Record<string, { dot: string; text: string }> = {
  'ON PATROL': { dot: 'bg-emerald-500', text: 'text-emerald-400' },
  'STATIONARY': { dot: 'bg-blue-500', text: 'text-blue-400' },
  'BREAK': { dot: 'bg-orange-500', text: 'text-orange-400' },
  'OFFLINE': { dot: 'bg-slate-600', text: 'text-slate-500' },
};

// --- Live Clock Hook ---
const useShiftTimers = (staff: StaffMember[]) => {
  const [timers, setTimers] = useState<Record<string, string>>({});
  useEffect(() => {
    const base: Record<string, number> = {};
    staff.forEach(s => {
      if (s.shift !== '--:--:--') {
        const parts = s.shift.split(':').map(Number);
        base[s.id] = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    });
    const interval = setInterval(() => {
      setTimers(() => {
        const next: Record<string, number> = {};
        Object.entries(base).forEach(([id, sec]) => { base[id] = sec + 1; next[id] = sec + 1; });
        const formatted: Record<string, string> = {};
        Object.entries(next).forEach(([id, sec]) => {
          const h = String(Math.floor(sec / 3600)).padStart(2, '0');
          const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
          const s = String(sec % 60).padStart(2, '0');
          formatted[id] = `${h}:${m}:${s}`;
        });
        return formatted;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [staff]);
  return timers;
};

// --- New Assignment Modal ---
const NewAssignmentModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (a: PatrolAssignment) => void }) => {
  const [title, setTitle] = useState('');
  const [personnel, setPersonnel] = useState('');
  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      id: `pa-${Date.now()}`,
      title: title.toUpperCase(),
      status: 'PENDING',
      personnel: personnel || 'Awaiting personnel availability',
      icon: 'clipboard',
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1522] border border-slate-700 rounded-sm w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">New Patrol Assignment</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Assignment Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. PERIMETER CHECK ALPHA" className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono" />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Assigned Personnel</label>
            <input value={personnel} onChange={e => setPersonnel(e.target.value)} placeholder="e.g. Marcus V., Elena R." className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono" />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-slate-200 border border-slate-700 rounded-sm transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-white bg-blue-600 hover:bg-blue-500 rounded-sm transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <span className="flex items-center gap-2"><Plus className="w-3 h-3" /> Create Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export const StaffManagementPage = () => {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const timers = useShiftTimers(staff);

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.id.toLowerCase().includes(filter.toLowerCase()) ||
    s.status.toLowerCase().includes(filter.toLowerCase()) ||
    s.location.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleAddAssignment = (a: PatrolAssignment) => {
    setAssignments(prev => [...prev, a]);
  };

  const handleRemoveAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const toggleAssignmentStatus = (id: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'ACTIVE' ? 'PENDING' : 'ACTIVE' } : a));
  };

  const avgResponseTime = '01:42';
  const incidentsResolved = 24;

  return (
    <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
      {showModal && <NewAssignmentModal onClose={() => setShowModal(false)} onAdd={handleAddAssignment} />}

      {/* Header */}
      <header className="flex justify-between items-start border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-wider text-slate-100 uppercase">Staff_Logistics</h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest mt-2 uppercase">Personnel Deployment & Oversight</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-sm">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase font-mono">Encrypted_Comms_Active</span>
        </div>
      </header>

      {/* Metrics + Patrol Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Performance Metrics */}
        <div className="col-span-5 bg-[#0f1522] border border-slate-800 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-slate-400">📊</span>
            <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">Performance Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Avg Response Time</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-100 font-mono">{avgResponseTime}</span>
                <span className="block text-[9px] text-emerald-400 font-bold tracking-wider">-12s from avg</span>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Incidents Resolved</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-100 font-mono">{incidentsResolved}</span>
                <span className="block text-[9px] text-emerald-400 font-bold tracking-wider">92% success rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patrol Assignments */}
        <div className="col-span-7 bg-[#0f1522] border border-slate-800 rounded-sm p-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">Patrol Assignments</h3>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-bold tracking-widest uppercase transition-colors">
              <Plus className="w-3 h-3" /> New Assignment
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {assignments.map(a => (
              <div key={a.id} className="min-w-[220px] bg-slate-900/60 border border-slate-800 rounded-sm p-4 flex gap-3 shrink-0 group">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700/50 rounded-sm flex items-center justify-center shrink-0">
                  {a.icon === 'shield' ? <CheckCircle className="w-5 h-5 text-blue-400" /> : <ClipboardList className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-200 tracking-wider uppercase truncate">{a.title}</span>
                    <button onClick={() => toggleAssignmentStatus(a.id)} className={`text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm cursor-pointer transition-colors ${a.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30'}`}>
                      {a.status}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{a.personnel}</p>
                </div>
                <button onClick={() => handleRemoveAssignment(a.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all self-start">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Status Table */}
      <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5 flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase">Staff Status</h3>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter personnel..." className="bg-slate-900/60 border border-slate-700 text-slate-300 text-xs pl-9 pr-3 py-2 rounded-sm focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600 w-[200px]" />
            {filter && (
              <button onClick={() => setFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-[9px] text-slate-500 font-bold tracking-widest uppercase pb-3 pr-4 w-[30%]">Personnel</th>
                <th className="text-[9px] text-slate-500 font-bold tracking-widest uppercase pb-3 pr-4 w-[18%]">Status</th>
                <th className="text-[9px] text-slate-500 font-bold tracking-widest uppercase pb-3 pr-4 w-[30%]">Current Location</th>
                <th className="text-[9px] text-slate-500 font-bold tracking-widest uppercase pb-3 w-[22%]">Active Shift</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(s => {
                const sc = statusColor[s.status];
                return (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors cursor-pointer group">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-800 border border-slate-700/50 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider shrink-0">{s.avatar}</div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 tracking-wider">{s.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${sc.text}`}>{s.status}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-400 py-4 pr-4">{s.location}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span className="text-xs text-slate-300 font-mono">{timers[s.id] || s.shift}</span>
                        </div>
                        <input type="checkbox" checked={s.selected} onChange={() => toggleSelect(s.id)} className="w-4 h-4 accent-blue-500 cursor-pointer bg-slate-800 border-slate-600 rounded-sm" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStaff.length === 0 && (
                <tr><td colSpan={4} className="text-center text-xs text-slate-600 py-8 tracking-widest uppercase">No personnel match filter criteria</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[9px] text-slate-600 font-mono shrink-0 pt-2">
        <span>AEGIS OS V4.2.0 // KERNEL_STAFF_SECURE</span>
        <span>LAST SYNCED: 2023.10.27_14:02:45_UTC</span>
      </div>
    </main>
  );
};
