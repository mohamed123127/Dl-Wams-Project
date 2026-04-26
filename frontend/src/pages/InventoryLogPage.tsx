import { useState } from 'react';
import { Search, Download, RotateCcw, Plus, ChevronLeft, ChevronRight, Pencil, Printer, Clock, X, Package } from 'lucide-react';

// --- Types ---
interface InventoryItem {
  id: string;
  name: string;
  subtitle: string;
  sku: string;
  current: number;
  threshold: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  icon: string;
}

interface ActivityEntry {
  time: string;
  auth: string;
  color: string;
  title?: string;
  content: string;
}

// --- Data ---
const CATEGORIES = ['ALL CATEGORIES', 'DRY GOODS', 'BEVERAGES', 'PRODUCE', 'FROZEN', 'DAIRY', 'SNACKS'];
const STATUSES = ['ALL', 'IN STOCK', 'LOW STOCK', 'OUT OF STOCK'];

const INVENTORY: InventoryItem[] = [
  { id: '1', name: 'NEURO_FUEL COFFEE', subtitle: 'DRY GOODS / ROASTS', sku: 'NF-882-X90', current: 1240, threshold: 200, status: 'IN STOCK', icon: 'NF' },
  { id: '2', name: 'IONIC_PULSE BLUE', subtitle: 'BEVERAGES / HYDRATION', sku: 'IP-102-B02', current: 42, threshold: 50, status: 'LOW STOCK', icon: 'IP' },
  { id: '3', name: 'SYNTH_GREENS PACK', subtitle: 'PRODUCE / ORGANIC', sku: 'SG-001-FRE', current: 0, threshold: 100, status: 'OUT OF STOCK', icon: 'SG' },
  { id: '4', name: 'CRYOGEN_MEALS: STEAK', subtitle: 'FROZEN / READY-MEAL', sku: 'CM-552-STK', current: 412, threshold: 50, status: 'IN STOCK', icon: 'CM' },
  { id: '5', name: 'AERO_CHIPS NOVA', subtitle: 'SNACKS / CRISPS', sku: 'AC-330-NVA', current: 88, threshold: 75, status: 'IN STOCK', icon: 'AC' },
  { id: '6', name: 'PROBIOTIC_KEFIR', subtitle: 'DAIRY / CULTURED', sku: 'PK-210-KFR', current: 15, threshold: 40, status: 'LOW STOCK', icon: 'PK' },
  { id: '7', name: 'QUANTUM_BARS: DARK', subtitle: 'SNACKS / PROTEIN', sku: 'QB-440-DRK', current: 0, threshold: 60, status: 'OUT OF STOCK', icon: 'QB' },
  { id: '8', name: 'HYDRA_COCONUT WATER', subtitle: 'BEVERAGES / NATURAL', sku: 'HC-775-COC', current: 530, threshold: 100, status: 'IN STOCK', icon: 'HC' },
];

const ACTIVITY_LOG: ActivityEntry[] = [
  { time: '14:22:01', auth: 'AUTH: OP_01', color: 'bg-blue-500', content: '+50 units of NEURO_FUEL added to Site_Alpha.' },
  { time: '13:45:12', auth: 'AUTH: SYS_AUTO', color: 'bg-orange-500', title: 'Threshold Alert:', content: 'IONIC_PULSE below 10% capacity.' },
  { time: '12:10:00', auth: 'AUTH: OP_02', color: 'bg-blue-500', title: 'Batch Audit', content: 'completed for Frozen Goods cluster. No discrepancies.' },
  { time: '09:30:55', auth: 'AUTH: LOG_BOT.9', color: 'bg-red-500', title: 'Depleted:', content: 'SYNTH_GREENS removed from active grid.' },
];

const statusStyle: Record<string, { bg: string; text: string; border: string }> = {
  'IN STOCK': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  'LOW STOCK': { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  'OUT OF STOCK': { bg: 'bg-red-600/20', text: 'text-red-500', border: 'border-red-500/40' },
};

// --- Add Item Modal ---
const AddItemModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (item: InventoryItem) => void }) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sku, setSku] = useState('');
  const [current, setCurrent] = useState('');
  const [threshold, setThreshold] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    const qty = parseInt(current) || 0;
    const thresh = parseInt(threshold) || 50;
    const status: InventoryItem['status'] = qty === 0 ? 'OUT OF STOCK' : qty < thresh ? 'LOW STOCK' : 'IN STOCK';
    onAdd({
      id: `${Date.now()}`,
      name: name.toUpperCase(),
      subtitle: subtitle.toUpperCase() || 'UNCATEGORIZED',
      sku: sku.toUpperCase() || `GEN-${Math.floor(100 + Math.random() * 899)}`,
      current: qty,
      threshold: thresh,
      status,
      icon: name.slice(0, 2).toUpperCase(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1522] border border-slate-700 rounded-sm w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">Add New Inventory Item</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: 'Product Name', value: name, onChange: setName, placeholder: 'e.g. NEURO_FUEL COFFEE' },
            { label: 'Category / Type', value: subtitle, onChange: setSubtitle, placeholder: 'e.g. DRY GOODS / ROASTS' },
            { label: 'SKU / Barcode', value: sku, onChange: setSku, placeholder: 'e.g. NF-882-X90' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">{f.label}</label>
              <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Current Stock</label>
              <input type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0"
                className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Threshold</label>
              <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="50"
                className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-slate-200 border border-slate-700 rounded-sm transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-white bg-blue-600 hover:bg-blue-500 rounded-sm transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <span className="flex items-center gap-2"><Plus className="w-3 h-3" /> Add Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export const InventoryLogPage = () => {
  const [items, setItems] = useState(INVENTORY);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL CATEGORIES');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [labelsPending] = useState(42);

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'ALL CATEGORIES' || item.subtitle.toLowerCase().includes(category.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalUnits = items.reduce((s, i) => s + i.current, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));

  const handleAdd = (item: InventoryItem) => setItems(prev => [...prev, item]);

  const handleExportCSV = () => {
    const header = 'Name,SKU,Current,Threshold,Status\n';
    const rows = items.map(i => `${i.name},${i.sku},${i.current},${i.threshold},${i.status}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inventory_export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchRestock = () => {
    if (window.confirm('BATCH RESTOCK: Restore all LOW STOCK and OUT OF STOCK items to threshold + 50?')) {
      setItems(prev => prev.map(i =>
        i.status !== 'IN STOCK' ? { ...i, current: i.threshold + 50, status: 'IN STOCK' as const } : i
      ));
    }
  };

  const handleEdit = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = prompt(`Edit stock for ${item.name}\nCurrent: ${item.current}\nEnter new quantity:`, String(item.current));
    if (newQty === null) return;
    const qty = parseInt(newQty) || 0;
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const status: InventoryItem['status'] = qty === 0 ? 'OUT OF STOCK' : qty < i.threshold ? 'LOW STOCK' : 'IN STOCK';
      return { ...i, current: qty, status };
    }));
  };

  const handlePrintLabels = () => alert(`Printing ${labelsPending} labels from queue 01-ALPHA...\nSent to Thermal Label Engine.`);

  return (
    <main className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto">
      {showModal && <AddItemModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

      {/* Header */}
      <header className="flex justify-between items-start shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Real-Time Logistics Sync Active</span>
          </div>
          <h1 className="text-3xl font-bold tracking-wider text-slate-100 uppercase">Inventory</h1>
        </div>
        <div className="flex items-center gap-3">
         
          
        </div>
      </header>

      {/* Content Area */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left: Table */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <div className="relative flex-1 w-125">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by SKU or Product Name..."
                className="w-full bg-[#0f1522] border border-slate-700 text-slate-300 text-xs pl-9 pr-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600" />
            </div>
            {/* <select value={category} onChange={e => setCategory(e.target.value)}
              className="bg-[#0f1522] border border-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-sm focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer min-w-[180px]">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#0f1522] border border-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-sm focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer min-w-[140px]">
              {STATUSES.map(s => <option key={s} value={s}>STATUS: {s}</option>)}
            </select> */}
          </div>
          {/* add Button */}
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 h-10 bg-blue-600/80 border border-blue-500/60 rounded-sm text-[10px] font-bold tracking-widest text-white uppercase hover:bg-blue-500/80 transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <Plus className="w-3.5 h-3.5" /> Add New Item
          </button>
</div>  
          {/* Table */}
          <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-[1fr_120px_100px_100px_110px_40px] gap-2 px-5 py-3 border-b border-slate-700/60">
              {['Product Identity', 'SKU / Barcode', 'Current', 'Threshold', 'Status', ''].map(h => (
                <span key={h} className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">{h}</span>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.map(item => {
                const st = statusStyle[item.status];
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_120px_100px_100px_110px_40px] gap-2 px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 border border-slate-700/50 rounded-sm flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 tracking-wider">{item.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{item.sku}</span>
                    <span className={`text-sm font-bold font-mono ${item.current === 0 ? 'text-red-400' : item.current < item.threshold ? 'text-orange-400' : 'text-slate-200'}`}>
                      {item.current.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{item.threshold}</span>
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold tracking-wider uppercase rounded-sm border ${st.bg} ${st.text} ${st.border} w-fit`}>
                      {item.status}
                    </span>
                    <button onClick={() => handleEdit(item.id)} className="text-slate-600 hover:text-blue-400 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="flex items-center justify-center h-32 text-xs text-slate-600 tracking-widest uppercase">No items match filter</div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/60 shrink-0">
              <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                Displaying 1-{Math.min(filtered.length, 10)} of {totalUnits.toLocaleString()} units
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
        </div>

       
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[9px] text-slate-600 font-mono shrink-0 pt-1">
        <span>AEGIS OS V4.2.0 // KERNEL_INVENTORY_SYNC</span>
        <span>LAST SYNCED: {new Date().toISOString().slice(0, 19).replace('T', '_')}_UTC</span>
      </div>
    </main>
  );
};
