import { useState, useEffect } from 'react';
import { Search, ScanBarcode, Tag, Trash2, CreditCard, Loader2, X, Plus, Minus } from 'lucide-react';
import { inventoryApi, salesApi } from '../services/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  barcode: string | null;
  category: number | null;
  purchase_price: string;
  selling_price: string;
  stock: number;
}

interface CartItem {
  productId: number;
  name: string;
  barcode: string | null;
  qty: number;
  unitPrice: number;
}

// ── Live clock ─────────────────────────────────────────────────────────────
const useLiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

// ── Product Picker Modal ───────────────────────────────────────────────────
const ProductPickerModal = ({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (p: Product) => void;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    inventoryApi.getAll()
      .then(d => setProducts(d as Product[]))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1522] border border-slate-700 rounded-sm w-[560px] max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">Select Product</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-800 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or barcode..."
              className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-xs pl-9 pr-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-xs text-slate-500 tracking-widest uppercase">Loading products...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-slate-600 tracking-widest uppercase">No products found</div>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); onClose(); }}
                className="w-full grid grid-cols-[1fr_80px_100px_80px] gap-3 px-5 py-3.5 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors text-left items-center"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 tracking-wide">{p.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{p.barcode ?? '—'}</div>
                </div>
                <span className="text-xs text-slate-400 font-mono">Cat. {p.category ?? '—'}</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {parseFloat(p.selling_price).toFixed(2)}
                </span>
                <span className={`text-xs font-mono ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-orange-400' : 'text-slate-400'}`}>
                  Stock: {p.stock}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ── Checkout Modal ─────────────────────────────────────────────────────────
const CheckoutModal = ({
  cart,
  total,
  discount,
  onClose,
  onSuccess,
}: {
  cart: CartItem[];
  total: number;
  discount: number;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [employeeId, setEmployeeId] = useState('1');
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState('');

  const handlePay = async () => {
    if (!employeeId || isNaN(parseInt(employeeId))) {
      setError('Please enter a valid employee ID.'); return;
    }
    setProcessing(true);
    setError('');
    try {
      await salesApi.create({
        employee_id: parseInt(employeeId),
        items_data: cart.map(item => ({
          product_id: item.productId,
          quantity: item.qty,
          price: item.unitPrice,
        })),
      });
      alert(`✅ PAYMENT PROCESSED\n\nTotal: ${total.toFixed(2)}\nItems: ${cart.reduce((s, i) => s + i.qty, 0)}\nEmployee ID: ${employeeId}\n\nTransaction recorded.`);
      onSuccess();
    } catch (err: any) {
      setError('Payment failed. Check backend or employee ID.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1522] border border-slate-700 rounded-sm w-[420px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">Process Payment</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Order summary */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-4 space-y-2">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between text-xs">
                <span className="text-slate-400">{item.name} × {item.qty}</span>
                <span className="text-slate-200 font-mono">{(item.qty * item.unitPrice).toFixed(2)}</span>
              </div>
            ))}
            {discount > 0 && (
              <div className="flex justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-emerald-400">Discount</span>
                <span className="text-emerald-400 font-mono">- {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-700">
              <span className="text-sm font-bold text-slate-200 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold text-slate-100 font-mono">{total.toFixed(2)}</span>
            </div>
          </div>
          {/* Employee ID */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">Employee ID *</label>
            <input
              type="number"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-slate-200 border border-slate-700 rounded-sm transition-colors">Cancel</button>
          <button
            onClick={handlePay}
            disabled={processing}
            className="flex items-center gap-2 px-5 py-2 text-[10px] font-bold tracking-widest uppercase text-white bg-blue-600 hover:bg-blue-500 rounded-sm transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
            {processing ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main POS Page ──────────────────────────────────────────────────────────
export const POSTerminalPage = () => {
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [discount, setDiscount]     = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const now = useLiveClock();

  const subtotal = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const total    = Math.max(0, subtotal - discount);

  // Add product from picker (merge if already in cart)
  const handleSelectProduct = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) {
        return prev.map(i =>
          i.productId === p.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, {
        productId:  p.id,
        name:       p.name,
        barcode:    p.barcode,
        qty:        1,
        unitPrice:  parseFloat(p.selling_price),
      }];
    });
  };

  const changeQty = (productId: number, delta: number) => {
    setCart(prev =>
      prev
        .map(i => i.productId === productId ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)
    );
  };

  const removeItem = (productId: number) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const handleDiscount = () => {
    const v = parseFloat(prompt('Enter discount amount:') || '0');
    if (!isNaN(v) && v >= 0) setDiscount(v);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Clear the entire cart?')) { setCart([]); setDiscount(0); }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {showPicker && (
        <ProductPickerModal
          onClose={() => setShowPicker(false)}
          onSelect={handleSelectProduct}
        />
      )}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={total}
          discount={discount}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => { setCart([]); setDiscount(0); setShowCheckout(false); }}
        />
      )}

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#0a0f18]/80 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold tracking-[0.25em] text-slate-200 uppercase font-mono">POS Terminal</h1>
          <span className="text-[9px] text-slate-500 font-mono">
            {now.toLocaleDateString()} {now.toTimeString().slice(0, 8)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/40 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase">Live</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Cart table */}
        <div className="flex-1 flex flex-col p-5 overflow-hidden">
          <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">

            {/* Table header */}
            <div className="grid grid-cols-[1fr_90px_110px_110px_90px_44px] gap-2 px-5 py-3 border-b border-slate-700/60 shrink-0">
              {['Product', 'Barcode', 'Qty', 'Unit Price', 'Total', ''].map(h => (
                <span key={h} className="text-[9px] font-bold tracking-widest text-blue-400 uppercase">{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <ScanBarcode className="w-10 h-10 text-slate-700" />
                  <span className="text-xs text-slate-600 tracking-widest uppercase">Cart empty — click Scan to add products</span>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="grid grid-cols-[1fr_90px_110px_110px_90px_44px] gap-2 px-5 py-3.5 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-200 tracking-wide">{item.name}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{item.barcode ?? '—'}</span>
                    {/* Qty stepper */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => changeQty(item.productId, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-blue-400 font-mono">{item.qty}</span>
                      <button onClick={() => changeQty(item.productId, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-300 font-mono">{item.unitPrice.toFixed(2)}</span>
                    <span className="text-xs font-bold text-slate-100 font-mono">{(item.qty * item.unitPrice).toFixed(2)}</span>
                    <button onClick={() => removeItem(item.productId)} className="text-slate-600 hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-700/60 px-5 py-4 space-y-2 shrink-0">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Subtotal</span>
                <span className="text-sm text-slate-200 font-mono">{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Discount</span>
                  <span className="text-sm text-emerald-400 font-mono">- {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-sm font-bold text-slate-200 tracking-widest uppercase">Total</span>
                <span className="text-3xl font-bold text-slate-100 font-mono">{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-3 mt-4 shrink-0">
            <button onClick={() => setShowPicker(true)}
              className="flex flex-col items-center gap-2 py-4 bg-[#0f1522] border border-slate-800 rounded-sm hover:bg-slate-800/40 hover:border-blue-600/50 transition-all group">
              <ScanBarcode className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-slate-400 group-hover:text-slate-200 uppercase transition-colors">Scan / Pick</span>
            </button>
            <button onClick={handleDiscount}
              className="flex flex-col items-center gap-2 py-4 bg-[#0f1522] border border-slate-800 rounded-sm hover:bg-slate-800/40 hover:border-emerald-600/50 transition-all group">
              <Tag className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-slate-400 group-hover:text-slate-200 uppercase transition-colors">Discount</span>
            </button>
            <button onClick={handleClearCart}
              className="flex flex-col items-center gap-2 py-4 bg-[#0f1522] border border-slate-800 rounded-sm hover:bg-slate-800/40 hover:border-red-800/50 transition-all group">
              <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-slate-400 group-hover:text-slate-200 uppercase transition-colors">Clear Cart</span>
            </button>
            <button
              onClick={() => { if (cart.length === 0) { alert('Add items to cart first.'); return; } setShowCheckout(true); }}
              className="flex flex-col items-center gap-2 py-4 bg-blue-600/20 border border-blue-500/40 rounded-sm hover:bg-blue-600/30 hover:border-blue-400/60 transition-all group shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <CreditCard className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-blue-400 group-hover:text-blue-300 uppercase transition-colors">Process Pay</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
