import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, ScanBarcode, Tag, Trash2, CreditCard, ShieldAlert, BadgeCheck, Video } from 'lucide-react';

// --- Types ---
interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  itemId: string;
  qty: number;
  unitVal: number;
}

interface LoyaltyMember {
  name: string;
  uid: string;
  initials: string;
  tier: string;
  points: number;
  credits: number;
}

// --- Initial Data ---
const INITIAL_CART: CartItem[] = [
  { id: '1', name: 'PREMIUM ROASTED COFFEE BEANS', subtitle: '500G - ETHIOPIAN BLEND', itemId: '#99261-B', qty: 2, unitVal: 18.50 },
  { id: '2', name: 'ORGANIC ALMOND MILK', subtitle: '1L - UNSWEETENED', itemId: '#18263-K', qty: 4, unitVal: 4.25 },
  { id: '3', name: 'ARTISAN SOURDOUGH BREAD', subtitle: 'FRESHLY BAKED - LARGE', itemId: '#55281-M', qty: 1, unitVal: 6.75 },
  { id: '4', name: 'MINERAL WATER PACK', subtitle: '6 X 1.5L STILL', itemId: '#22109-M', qty: 1, unitVal: 8.99 },
];

const LOYALTY_MEMBER: LoyaltyMember = {
  name: 'JEREMIAH STERLING',
  uid: 'sentinel-882-001',
  initials: 'JS',
  tier: 'GOLD SENTINEL',
  points: 12450,
  credits: 14.22,
};

// --- Live Clock ---
const useLiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
};

// --- Camera Feed Component ---
const CameraFeed = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const now = useLiveClock();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark background with noise
    ctx.fillStyle = '#1a1f2e';
    ctx.fillRect(0, 0, w, h);

    // Scanlines
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.05})`;
      ctx.fillRect(0, y, w, 1);
    }

    // Simulated store shapes
    ctx.fillStyle = 'rgba(30,40,60,0.8)';
    ctx.fillRect(20, h - 80, w - 40, 60);
    ctx.fillStyle = 'rgba(40,50,70,0.6)';
    ctx.fillRect(30, h - 120, 80, 40);
    ctx.fillRect(w - 110, h - 130, 80, 50);

    // Random noise pixels
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y2 = Math.random() * h;
      const brightness = Math.random() * 40 + 20;
      ctx.fillStyle = `rgba(${brightness},${brightness + 10},${brightness + 20},0.3)`;
      ctx.fillRect(x, y2, 2, 2);
    }

    // Signal strength bar
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, h - 25, w, 25);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('SIGNAL STRENGTH', 8, h - 10);
    // Signal bars
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < 4 ? '#3b82f6' : '#334155';
      ctx.fillRect(120 + i * 8, h - 18 + (4 - i) * 2, 5, 6 + i * 2);
    }

  }, [now]);

  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '-');
  const timeStr = now.toTimeString().slice(0, 8);

  return (
    <div className="relative bg-[#0a0f18] border border-slate-800 rounded-sm overflow-hidden">
      <canvas ref={canvasRef} width={320} height={160} className="w-full h-auto block" />
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
        <span className="text-[9px] font-bold text-red-400 tracking-wider font-mono">REC NODE_04A</span>
      </div>
      <div className="absolute top-2 right-2 text-[9px] text-slate-400 font-mono tracking-wider">
        {dateStr} {timeStr}
      </div>
      <div className="absolute bottom-7 right-2 text-[8px] text-slate-500 font-mono">FPS: 60</div>
    </div>
  );
};

// --- Numpad Component ---
const Numpad = ({ value, onChange, onEnter, onClear }: {
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  onClear: () => void;
}) => {
  const keys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['CLR', '0', 'ENT'],
  ];

  const handleKey = (k: string) => {
    if (k === 'CLR') { onClear(); return; }
    if (k === 'ENT') { onEnter(); return; }
    onChange(value + k);
  };

  return (
    <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-4">
      <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">Manual Entry / Code Input</h3>
      <div className="bg-slate-900/80 border border-slate-700 rounded-sm px-3 py-2.5 mb-3 text-right">
        <span className="text-xl font-bold text-emerald-400 font-mono tracking-wider">{value || '0'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.flat().map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className={`py-3 rounded-sm text-sm font-bold tracking-wider transition-all duration-150 active:scale-95 ${
              k === 'CLR'
                ? 'bg-slate-800/60 border border-slate-700 text-blue-400 hover:bg-slate-700/60 hover:text-blue-300'
                : k === 'ENT'
                ? 'bg-blue-600/80 border border-blue-500/60 text-white hover:bg-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'bg-slate-800/40 border border-slate-700/60 text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main Page ---
export const POSTerminalPage = () => {
  const [cart, setCart] = useState(INITIAL_CART);
  const [numpadValue, setNumpadValue] = useState('10283');
  const [skuSearch, setSkuSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loyaltyLinked, setLoyaltyLinked] = useState(true);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const now = useLiveClock();

  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.unitVal, 0);
  const total = subtotal - discount;

  // --- Cart Actions ---
  const handleScanNext = () => {
    const newItems: CartItem[] = [
      { id: `${Date.now()}`, name: 'IMPORTED OLIVE OIL', subtitle: '750ML - EXTRA VIRGIN', itemId: `#${Math.floor(10000 + Math.random() * 89999)}-X`, qty: 1, unitVal: 12.49 },
      { id: `${Date.now() + 1}`, name: 'DARK CHOCOLATE BAR', subtitle: '100G - 85% CACAO', itemId: `#${Math.floor(10000 + Math.random() * 89999)}-C`, qty: 1, unitVal: 4.99 },
      { id: `${Date.now() + 2}`, name: 'SPARKLING JUICE', subtitle: '330ML - ELDERFLOWER', itemId: `#${Math.floor(10000 + Math.random() * 89999)}-J`, qty: 2, unitVal: 3.75 },
    ];
    const randomItem = newItems[Math.floor(Math.random() * newItems.length)];
    setCart(prev => [...prev, randomItem]);
  };

  const handleDiscount = () => {
    const amount = parseFloat(prompt('Enter discount amount ($):') || '0');
    if (!isNaN(amount) && amount >= 0) setDiscount(amount);
  };

  const handleVoidItem = () => {
    if (cart.length === 0) return;
    setCart(prev => prev.slice(0, -1));
  };

  const handleProcessPay = () => {
    if (cart.length === 0) { alert('No items in cart.'); return; }
    alert(`PAYMENT PROCESSED\n\nTotal: $${total.toFixed(2)}\nItems: ${cart.length}\n\nTransaction complete.`);
    setCart([]);
    setDiscount(0);
  };

  const handleNumpadEnter = () => {
    if (!numpadValue) return;
    // Lookup by code — simulate adding item by code
    const codeItem: CartItem = {
      id: `${Date.now()}`,
      name: `ITEM CODE ${numpadValue}`,
      subtitle: 'MANUAL ENTRY',
      itemId: `#${numpadValue}`,
      qty: 1,
      unitVal: parseFloat((Math.random() * 20 + 2).toFixed(2)),
    };
    setCart(prev => [...prev, codeItem]);
    setNumpadValue('');
  };

  const handleSilentAlarm = () => {
    setAlarmTriggered(true);
    setTimeout(() => setAlarmTriggered(false), 3000);
  };

  const handleSkuLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuSearch.trim()) return;
    const lookupItem: CartItem = {
      id: `${Date.now()}`,
      name: `SKU: ${skuSearch.toUpperCase()}`,
      subtitle: 'SKU LOOKUP',
      itemId: skuSearch,
      qty: 1,
      unitVal: parseFloat((Math.random() * 15 + 3).toFixed(2)),
    };
    setCart(prev => [...prev, lookupItem]);
    setSkuSearch('');
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#0a0f18]/80 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-sm font-bold tracking-[0.25em] text-slate-200 uppercase font-mono">Monolith.Retail</h1>
          <form onSubmit={handleSkuLookup} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={skuSearch}
              onChange={e => setSkuSearch(e.target.value)}
              placeholder="SKU Lookup..."
              className="bg-slate-900/60 border border-slate-700 text-slate-300 text-xs pl-9 pr-3 py-2 rounded-sm focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600 w-[180px]"
            />
          </form>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/15 border border-orange-500/40 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
            <span className="text-[9px] font-bold text-orange-400 tracking-wider uppercase">System Armed</span>
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-sm">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono">Terminal Operator_01</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Product Table */}
        <div className="flex-1 flex flex-col p-5 overflow-hidden">
          {/* Cart Table */}
          <div className="bg-[#0f1522] border border-slate-800 rounded-sm flex-1 flex flex-col min-h-0">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_100px_60px_90px_90px] gap-2 px-5 py-3 border-b border-slate-700/60">
              <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase">Product Description</span>
              <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase text-center">Item ID</span>
              <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase text-center">Qty</span>
              <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase text-center">Unit Val</span>
              <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase text-right">Total</span>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_100px_60px_90px_90px] gap-2 px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                  <div>
                    <div className="text-xs font-bold text-slate-200 tracking-wider">{item.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.subtitle}</div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono self-center text-center">{item.itemId}</span>
                  <span className="text-xs font-bold text-blue-400 self-center text-center font-mono">{String(item.qty).padStart(2, '0')}</span>
                  <span className="text-xs text-slate-300 self-center text-center font-mono">${item.unitVal.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-200 self-center text-right font-mono">${(item.qty * item.unitVal).toFixed(2)}</span>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex items-center justify-center h-32 text-xs text-slate-600 tracking-widest uppercase">
                  No items scanned
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-700/60 px-5 py-4 space-y-2 shrink-0">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Subtotal</span>
                <span className="text-sm text-slate-200 font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Applied Discounts</span>
                <span className="text-sm text-emerald-400 font-mono">- ${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-sm font-bold text-slate-200 tracking-widest uppercase">Total Balance</span>
                <span className="text-3xl font-bold text-slate-100 font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-3 mt-4 shrink-0">
            <button onClick={handleScanNext} className="flex flex-col items-center gap-2 py-4 bg-[#0f1522] border border-slate-800 rounded-sm hover:bg-slate-800/40 hover:border-slate-600 transition-all group">
              <ScanBarcode className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-slate-400 group-hover:text-slate-200 uppercase transition-colors">Scan Next</span>
            </button>
            <button onClick={handleDiscount} className="flex flex-col items-center gap-2 py-4 bg-[#0f1522] border border-slate-800 rounded-sm hover:bg-slate-800/40 hover:border-slate-600 transition-all group">
              <Tag className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-slate-400 group-hover:text-slate-200 uppercase transition-colors">Discount</span>
            </button>
            <button onClick={handleVoidItem} className="flex flex-col items-center gap-2 py-4 bg-[#0f1522] border border-slate-800 rounded-sm hover:bg-slate-800/40 hover:border-red-800/50 transition-all group">
              <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-slate-400 group-hover:text-slate-200 uppercase transition-colors">Void Item</span>
            </button>
            <button onClick={handleProcessPay} className="flex flex-col items-center gap-2 py-4 bg-blue-600/20 border border-blue-500/40 rounded-sm hover:bg-blue-600/30 hover:border-blue-400/60 transition-all group shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <CreditCard className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-blue-400 group-hover:text-blue-300 uppercase transition-colors">Process Pay</span>
            </button>
          </div>
        </div>

        
      </div>

      
    </main>
  );
};
