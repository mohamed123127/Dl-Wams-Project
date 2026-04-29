import { useState, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, X, Loader2 } from 'lucide-react';
import { inventoryApi } from '../services/api';

// --- Real API shape from product_service (port 8000) ---
interface Product {
  id: number;
  name: string;
  barcode: string | null;
  category: number | null;
  purchase_price: string;
  selling_price: string;
  stock: number;
}

// --- Derive status from stock level ---
function getStatus(stock: number): 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' {
  if (stock === 0) return 'OUT OF STOCK';
  if (stock <= 5) return 'LOW STOCK';
  return 'IN STOCK';
}

const statusStyle: Record<string, { bg: string; text: string; border: string }> = {
  'IN STOCK':    { bg: 'bg-blue-500/15',  text: 'text-blue-400',  border: 'border-blue-500/30' },
  'LOW STOCK':   { bg: 'bg-red-500/15',   text: 'text-red-400',   border: 'border-red-500/30'  },
  'OUT OF STOCK':{ bg: 'bg-red-600/20',   text: 'text-red-500',   border: 'border-red-500/40'  },
};

// --- Add Product Modal ---
const AddItemModal = ({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: Record<string, unknown>) => void;
}) => {
  const [name, setName]                 = useState('');
  const [barcode, setBarcode]           = useState('');
  const [category, setCategory]         = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock]               = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !purchasePrice || !sellingPrice) return;
    onAdd({
      name,
      barcode: barcode || null,
      category: category ? parseInt(category) : null,
      purchase_price: parseFloat(purchasePrice),
      selling_price: parseFloat(sellingPrice),
      stock: parseInt(stock) || 0,
    });
    onClose();
  };

  const inputCls = 'w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1522] border border-slate-700 rounded-sm w-[500px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">Add New Product</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Product Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Product Alpha" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Barcode</label>
              <input value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="e.g. 123456789" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Category ID</label>
              <input type="number" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. 1" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Purchase Price *</label>
              <input type="number" step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Selling Price *</label>
              <input type="number" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Stock</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className={inputCls} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-slate-200 border border-slate-700 rounded-sm transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-white bg-blue-600 hover:bg-blue-500 rounded-sm transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <span className="flex items-center gap-2"><Plus className="w-3 h-3" /> Add Product</span>
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
    <span className="text-xs text-slate-500 tracking-widest uppercase">Loading inventory data...</span>
  </div>
);

// --- Empty State ---
const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3">
    <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
      <Search className="w-7 h-7 text-slate-600" />
    </div>
    <span className="text-xs text-slate-500 tracking-widest uppercase">No products found</span>
    <span className="text-[10px] text-slate-600">Add a product or check the backend connection</span>
  </div>
);

// --- Main Page ---
export const InventoryLogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const PAGE_SIZE = 10;

  const fetchProducts = async () => {
    try {
      const data = await inventoryApi.getAll();
      setProducts(data as Product[]);
      setError('');
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Could not connect to product service (port 8000)');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalUnits = products.reduce((s, p) => s + (p.stock || 0), 0);

  const handleAdd = async (newProduct: Record<string, unknown>) => {
    try {
      await inventoryApi.create(newProduct);
      await fetchProducts();
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const handleEdit = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newQty = prompt(
      `Edit stock for ${product.name}\nCurrent: ${product.stock}\nEnter new quantity:`,
      String(product.stock)
    );
    if (newQty === null) return;
    const qty = parseInt(newQty);
    if (isNaN(qty)) return;
    try {
      await inventoryApi.update(String(id), { stock: qty });
      await fetchProducts();
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

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
        {/* Summary pill */}
        <div className="flex gap-3 mt-1">
          <div className="bg-[#0f1522] border border-slate-700 rounded-sm px-4 py-2 text-center">
            <div className="text-[9px] text-slate-500 tracking-widest uppercase">Total SKUs</div>
            <div className="text-lg font-bold text-slate-100 font-mono">{products.length}</div>
          </div>
          <div className="bg-[#0f1522] border border-slate-700 rounded-sm px-4 py-2 text-center">
            <div className="text-[9px] text-slate-500 tracking-widest uppercase">Total Units</div>
            <div className="text-lg font-bold text-blue-400 font-mono">{totalUnits.toLocaleString()}</div>
          </div>
          <div className="bg-[#0f1522] border border-slate-700 rounded-sm px-4 py-2 text-center">
            <div className="text-[9px] text-slate-500 tracking-widest uppercase">Low / Out</div>
            <div className="text-lg font-bold text-red-400 font-mono">
              {products.filter(p => p.stock <= 5).length}
            </div>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-sm px-4 py-3 text-xs text-red-400 font-mono tracking-wide">
          ⚠ {error}
        </div>
      )}

      {/* Content Area */}
      <div className="flex gap-5 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">

          {/* Search + Add */}
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or barcode..."
                className="w-full bg-[#0f1522] border border-slate-700 text-slate-300 text-xs pl-9 pr-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 h-10 bg-blue-600/80 border border-blue-500/60 rounded-sm text-[10px] font-bold tracking-widest text-white uppercase hover:bg-blue-500/80 transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)] ml-3"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          {/* Loading / Empty / Table */}
          {loading ? (
            <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">
              <LoadingState />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">
              <EmptyState />
            </div>
          ) : (
            <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_80px_100px_110px_110px_110px_40px] gap-2 px-5 py-3 border-b border-slate-700/60 shrink-0">
                {['Product', 'Barcode', 'Cat.', 'Stock', 'Status', 'Buy Price', 'Sell Price', ''].map(h => (
                  <span key={h} className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">{h}</span>
                ))}
              </div>

              {/* Rows */}
              <div className="flex-1 overflow-y-auto">
                {paginated.map(product => {
                  const status = getStatus(product.stock);
                  const st = statusStyle[status];
                  return (
                    <div
                      key={product.id}
                      className="grid grid-cols-[1fr_120px_80px_100px_110px_110px_110px_40px] gap-2 px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors items-center"
                    >
                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-800 border border-slate-700/50 rounded-sm flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider shrink-0">
                          {product.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-xs font-bold text-slate-200 tracking-wider truncate">{product.name}</div>
                      </div>

                      {/* Barcode */}
                      <span className="text-xs text-slate-400 font-mono truncate">
                        {product.barcode ?? <span className="text-slate-600">—</span>}
                      </span>

                      {/* Category */}
                      <span className="text-xs text-slate-400 font-mono">
                        {product.category ?? <span className="text-slate-600">—</span>}
                      </span>

                      {/* Stock */}
                      <span className={`text-sm font-bold font-mono ${
                        product.stock === 0 ? 'text-red-400' :
                        product.stock <= 5  ? 'text-orange-400' : 'text-slate-200'
                      }`}>
                        {product.stock.toLocaleString()}
                      </span>

                      {/* Status badge */}
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold tracking-wider uppercase rounded-sm border ${st.bg} ${st.text} ${st.border} w-fit`}>
                        {status}
                      </span>

                      {/* Purchase price */}
                      <span className="text-xs text-slate-400 font-mono">
                        {parseFloat(product.purchase_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>

                      {/* Selling price */}
                      <span className="text-xs text-emerald-400 font-mono font-semibold">
                        {parseFloat(product.selling_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>

                      {/* Edit button */}
                      <button onClick={() => handleEdit(product.id)} className="text-slate-600 hover:text-blue-400 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-xs text-slate-600 tracking-widest uppercase">
                    No products match your search
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/60 shrink-0">
                <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 text-xs font-bold rounded-sm transition-colors ${page === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                    >
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
        <span>AEGIS OS V4.2.0 // KERNEL_INVENTORY_SYNC</span>
        <span>LAST SYNCED: {new Date().toISOString().slice(0, 19).replace('T', '_')}_UTC</span>
      </div>
    </main>
  );
};
