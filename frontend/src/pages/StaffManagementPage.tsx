import { useState, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { staffApi } from '../services/api';

// --- Types ---
interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const roleStyle: Record<string, { bg: string; text: string; border: string }> = {
  'admin': { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  'manager': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  'guard': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  'seller': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'inventoryManager': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
};

// --- Add Staff Modal ---
const AddStaffModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Omit<StaffMember, 'id'>) => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('guard');

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    onAdd({
      first_name: firstName,
      last_name: lastName,
      email,
      role,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1522] border border-slate-700 rounded-sm w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">Add New Staff Member</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: 'First Name', value: firstName, onChange: setFirstName, placeholder: 'e.g. JOHN' },
            { label: 'Last Name', value: lastName, onChange: setLastName, placeholder: 'e.g. DOE' },
            { label: 'Email', value: email, onChange: setEmail, placeholder: 'e.g. john.doe@example.com', type: 'email' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">{f.label}</label>
              <input type={f.type || 'text'} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono" />
            </div>
          ))}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="guard">Guard</option>
              <option value="seller">Seller</option>
              <option value="inventoryManager">Inventory Manager</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-slate-200 border border-slate-700 rounded-sm transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-white bg-blue-600 hover:bg-blue-500 rounded-sm transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <span className="flex items-center gap-2"><Plus className="w-3 h-3" /> Add Staff</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Loading Spinner ---
const LoadingState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    <span className="text-xs text-slate-500 tracking-widest uppercase">Loading staff data...</span>
  </div>
);

// --- Empty State ---
const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3">
    <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
      <Search className="w-7 h-7 text-slate-600" />
    </div>
    <span className="text-xs text-slate-500 tracking-widest uppercase">No staff data available</span>
    <span className="text-[10px] text-slate-600">Waiting for backend connection</span>
  </div>
);

// --- Main Page ---
export const StaffManagementPage = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      const data = await staffApi.getAll();
      setStaff(data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filtered = staff.filter(s =>
    s.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.id?.toString().includes(search) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));

  const handleAdd = async (newMember: Omit<StaffMember, 'id'>) => {
    try {
      await staffApi.create(newMember as Record<string, unknown>);
      await fetchStaff(); // Refresh from API
    } catch (err) {
      console.error('Failed to add staff member:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://127.0.0.1:8001/api/employees/${id}/`, {
        method: 'DELETE',
      });
      await fetchStaff(); // Refresh from API
    } catch (err) {
      console.error('Failed to delete staff member:', err);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto">
      {showModal && <AddStaffModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

      {/* Header */}
      <header className="flex justify-between items-start shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Real-Time Logistics Sync Active</span>
          </div>
          <h1 className="text-3xl font-bold tracking-wider text-slate-100 uppercase">Staff Management</h1>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex gap-5 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search + Add Button Row */}
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="relative w-[320px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or Staff Name..."
                className="w-full bg-[#0f1522] border border-slate-700 text-slate-300 text-xs pl-9 pr-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600" />
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 h-10 bg-blue-600/80 border border-blue-500/60 rounded-sm text-[10px] font-bold tracking-widest text-white uppercase hover:bg-blue-500/80 transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)]">
              <Plus className="w-3.5 h-3.5" /> Add New Staff
            </button>
          </div>

          {/* Loading / Empty / Table */}
          {loading ? (
            <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">
              <LoadingState />
            </div>
          ) : staff.length === 0 ? (
            <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">
              <EmptyState />
            </div>
          ) : (
            <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_1fr_150px_40px] gap-2 px-5 py-3 border-b border-slate-700/60">
                {['Personnel', 'Staff ID', 'Email', 'Role', ''].map(h => (
                  <span key={h} className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">{h}</span>
                ))}
              </div>

              {/* Table Rows */}
              <div className="flex-1 overflow-y-auto">
                {filtered.map(member => {
                  const st = roleStyle[member.role] || roleStyle['guard'];
                  return (
                    <div key={member.id} className="grid grid-cols-[1fr_120px_1fr_150px_40px] gap-2 px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors items-center">
                      {/* Personnel */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 border border-slate-700/50 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider shrink-0 uppercase">
                          {member.first_name?.[0] || ''}{member.last_name?.[0] || ''}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 tracking-wider uppercase">{member.first_name} {member.last_name}</div>
                        </div>
                      </div>
                      {/* Staff ID */}
                      <span className="text-xs text-slate-400 font-mono">{member.id}</span>
                      {/* Email */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 truncate">{member.email}</span>
                      </div>
                      {/* Role Badge */}
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold tracking-wider uppercase rounded-sm border ${st.bg} ${st.text} ${st.border} w-fit`}>
                        {member.role}
                      </span>
                      {/* Delete Action */}
                      <button onClick={() => handleDelete(member.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-xs text-slate-600 tracking-widest uppercase">No personnel match filter</div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/60 shrink-0">
                <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                  Displaying 1-{Math.min(filtered.length, 10)} of {staff.length} staff
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 text-xs font-bold rounded-sm transition-colors ${page === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[9px] text-slate-600 font-mono shrink-0 pt-1">
        <span>AEGIS OS V4.2.0 // KERNEL_STAFF_SECURE</span>
        <span>LAST SYNCED: {new Date().toISOString().slice(0, 19).replace('T', '_')}_UTC</span>
      </div>
    </main>
  );
};
