import { useState, useEffect } from 'react';
import { Calendar, Download, ExternalLink, Loader2, Search } from 'lucide-react';
import { analyticsApi } from '../services/api';

// --- Types ---
interface TrendItem {
  day: string;
  value: number;
  peak?: boolean;
}

interface CategoryItem {
  name: string;
  percent: number;
}

interface RecoveryItem {
  timestamp: string;
  descriptor: string;
  value: string;
  location: string;
  status: string;
}

// --- Loading Spinner ---
const LoadingState = ({ label }: { label: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[140px]">
    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    <span className="text-[10px] text-slate-500 tracking-widest uppercase">{label}</span>
  </div>
);

// --- Empty State ---
const EmptyState = ({ label }: { label: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-[140px]">
    <Search className="w-5 h-5 text-slate-600" />
    <span className="text-[10px] text-slate-500 tracking-widest uppercase">{label}</span>
    <span className="text-[9px] text-slate-600">Waiting for backend connection</span>
  </div>
);

const TheftTrendsChart = ({ data, loading }: { data: TrendItem[]; loading: boolean }) => {
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 1;
  return (
    <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5 flex flex-col">
      <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase mb-4">Theft Trends</h3>
      {loading ? (
        <LoadingState label="Loading trends..." />
      ) : data.length === 0 ? (
        <EmptyState label="No trend data" />
      ) : (
        <div className="flex-1 flex items-end justify-between gap-2 min-h-[140px] pt-2">
          {data.map((item) => {
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
      )}
    </div>
  );
};

const TargetedCategories = ({ data, loading }: { data: CategoryItem[]; loading: boolean }) => (
  <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5 flex flex-col">
    <h3 className="text-xs font-bold tracking-widest text-slate-200 uppercase mb-4">Targeted Categories</h3>
    {loading ? (
      <LoadingState label="Loading categories..." />
    ) : data.length === 0 ? (
      <EmptyState label="No category data" />
    ) : (
      <div className="space-y-3 flex-1">
        {data.map((cat) => (
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
    )}
  </div>
);

const HeatmapPanel = ({ loading }: { loading: boolean }) => (
  <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5 flex flex-col">
    <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase mb-3">Supermarket Heatmap</h3>
    {loading ? (
      <LoadingState label="Loading heatmap data..." />
    ) : (
      <EmptyState label="No heatmap data available" />
    )}
  </div>
);

const RecoveriesTable = ({ data, loading }: { data: RecoveryItem[]; loading: boolean }) => (
  <div className="bg-[#0f1522] border border-slate-800 rounded-sm p-5">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">Recent High-Value Recoveries</h3>
      <button className="flex items-center gap-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold tracking-widest uppercase transition-colors">
        View Full Ledger <ExternalLink className="w-3 h-3" />
      </button>
    </div>
    {loading ? (
      <LoadingState label="Loading recoveries..." />
    ) : data.length === 0 ? (
      <EmptyState label="No recovery data available" />
    ) : (
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
            {data.map((row, i) => (
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
    )}
  </div>
);



export const AnalyticsPage = () => {
  const [dateRange] = useState('Last 30 Days');
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [recoveries, setRecoveries] = useState<RecoveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendsData, categoriesData, recoveriesData] = await Promise.allSettled([
          analyticsApi.getTrends(),
          analyticsApi.getCategories(),
          analyticsApi.getRecoveries(),
        ]);
        if (trendsData.status === 'fulfilled') setTrends(trendsData.value);
        if (categoriesData.status === 'fulfilled') setCategories(categoriesData.value);
        if (recoveriesData.status === 'fulfilled') setRecoveries(recoveriesData.value);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

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
        <div className="col-span-7"><HeatmapPanel loading={loading} /></div>
        <div className="col-span-5 flex flex-col gap-4">
          <TheftTrendsChart data={trends} loading={loading} />
          <TargetedCategories data={categories} loading={loading} />
        </div>
      </div>
      <RecoveriesTable data={recoveries} loading={loading} />

    </main>
  );
};
