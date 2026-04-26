import { useState } from 'react';
import { Calendar, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import heatmapImage from '../assets/hero.png';

const THEFT_TRENDS = [
  { day: 'MON', value: 35 },
  { day: 'TUE', value: 28 },
  { day: 'WED', value: 42 },
  { day: 'THU', value: 30 },
  { day: 'FRI', value: 85, peak: true },
  { day: 'SAT', value: 55 },
  { day: 'SUN', value: 48 },
];

const TARGETED_CATEGORIES = [
  { name: 'ALCOHOL & SPIRITS', percent: 42 },
  { name: 'PERSONAL CARE / RAZORS', percent: 28 },
  { name: 'SMALL ELECTRONICS', percent: 15 },
  { name: 'PREMIUM MEATS', percent: 10 },
];

const RECOVERIES = [
  { timestamp: '2023-11-24 14:22:01', descriptor: 'Premium Whiskey - Case of 6', value: '$449.90', location: 'Northwest Exit', status: 'RECOVERED' },
  { timestamp: '2023-11-24 11:05:43', descriptor: 'Tech-Bundle: Tablets (x2)', value: '$1,150.00', location: 'Electronics Section', status: 'RECOVERED' },
  { timestamp: '2023-11-23 19:33:12', descriptor: 'Razor Multi-Pack (x8)', value: '$312.00', location: 'Self-Checkout 04', status: 'PENDING' },
  { timestamp: '2023-11-23 16:10:55', descriptor: 'Organic Wagyu Beef (4 lbs)', value: '$189.96', location: 'Deli Counter', status: 'RECOVERED' },
  { timestamp: '2023-11-22 09:42:18', descriptor: 'Bluetooth Speaker - Premium', value: '$279.99', location: 'Main Entrance', status: 'FLAGGED' },
];

const TheftTrendsChart = () => {
  const maxValue = Math.max(...THEFT_TRENDS.map(d => d.value));
  return (
    <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5 flex flex-col">
      <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase mb-4">Theft Trends</h3>
      <div className="flex-1 flex items-end justify-between gap-2 min-h-[140px] pt-2">
        {THEFT_TRENDS.map((item) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={item.day} className="flex flex-col items-center flex-1 gap-1">
              {item.peak && <span className="text-[8px] text-red-400 font-bold tracking-wider uppercase mb-0.5">Peak</span>}
              <div className="w-full flex justify-center" style={{ height: '120px' }}>
                <div className={`w-full max-w-[32px] rounded-t-sm transition-all duration-500 ${item.peak ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-gradient-to-t from-blue-700 to-blue-400'}`} style={{ height: `${heightPercent}%`, alignSelf: 'flex-end' }} />
              </div>
              <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase mt-1">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TargetedCategories = () => (
  <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5 flex flex-col">
    <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase mb-4">Targeted Categories</h3>
    <div className="space-y-3 flex-1">
      {TARGETED_CATEGORIES.map((cat) => (
        <div key={cat.name}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{cat.name}</span>
            <span className="text-[10px] text-slate-300 font-bold">{cat.percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700" style={{ width: `${cat.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HeatmapPanel = () => (
  <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5 flex flex-col">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">Supermarket Heatmap</h3>
        <p className="text-[10px] text-slate-500 tracking-wider uppercase mt-1">3D Spatial Vulnerability Visualization</p>
      </div>
      <span className="px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] font-bold tracking-wider uppercase rounded-sm">High Risk: Aisle 4</span>
    </div>
    <div className="flex gap-4 mb-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
        <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Active Hotspot</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
        <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Moderate Flow</span>
      </div>
    </div>
    <div className="relative rounded-sm overflow-hidden border border-slate-700/50 flex-1 min-h-[240px]">
      <img src={heatmapImage} alt="Supermarket spatial vulnerability heatmap" className="w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1522]/60 via-transparent to-transparent pointer-events-none" />
    </div>
  </div>
);

const RecoveriesTable = () => (
  <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">Recent High-Value Recoveries</h3>
      <button className="flex items-center gap-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold tracking-widest uppercase transition-colors">
        View Full Ledger <ExternalLink className="w-3 h-3" />
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-800">
            {['Timestamp', 'Object Descriptor', 'Value Estimate', 'Location Code', 'Status'].map(h => (
              <th key={h} className="text-[9px] text-slate-500 font-bold tracking-widest uppercase pb-3 pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RECOVERIES.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors cursor-pointer">
              <td className="text-xs text-slate-400 font-mono py-3 pr-4 whitespace-nowrap">{row.timestamp}</td>
              <td className="text-xs text-slate-300 py-3 pr-4">{row.descriptor}</td>
              <td className="text-xs text-emerald-400 font-semibold py-3 pr-4">{row.value}</td>
              <td className="text-xs text-slate-400 py-3 pr-4">{row.location}</td>
              <td className="py-3">
                <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${row.status === 'RECOVERED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : row.status === 'PENDING' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SecurityInsight = () => (
  <div className="bg-orange-500/10 border border-orange-500/30 rounded-sm p-4 mt-4">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="w-4 h-4 text-orange-400" />
      <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase">Security Insight</span>
    </div>
    <p className="text-xs text-orange-300/80 leading-relaxed">
      System has detected a 15% increase in activity around{' '}
      <span className="underline text-orange-300 cursor-pointer hover:text-orange-200 transition-colors">Blind Spot 09</span>
      . Recommend physical patrol frequency increase during peak hours (18:00–19:00).
    </p>
  </div>
);

export const AnalyticsPage = () => {
  const [dateRange] = useState('Last 30 Days');
  return (
    <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
      <header className="flex justify-between items-end border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-wider text-slate-100 uppercase">Historical Analytics</h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest mt-2 uppercase">Operational Period: {dateRange}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 text-[10px] font-bold tracking-widest uppercase rounded-sm transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Date Range Select
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold tracking-widest uppercase rounded-sm transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Intelligence
          </button>
        </div>
      </header>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7"><HeatmapPanel /></div>
        <div className="col-span-5 flex flex-col gap-4">
          <TheftTrendsChart />
          <TargetedCategories />
        </div>
      </div>
      <RecoveriesTable />
      <SecurityInsight />
    </main>
  );
};
