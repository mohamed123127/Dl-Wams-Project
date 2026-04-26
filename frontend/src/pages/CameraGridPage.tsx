import { useState } from 'react';
import { CameraGrid } from '../components/CameraGrid';
import type { CameraView } from './Dashboard';

export const CameraGridPage = () => {
  const [cameraView, setCameraView] = useState<CameraView>('3x3');

  return (
    <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
      <header className="flex justify-between items-end border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-wider text-slate-100 uppercase">SECTOR A-04 GRID</h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest mt-2 uppercase">
            Camera Grid &bull; {cameraView === '3x3' ? '9' : '4'} Active Feeds
          </p>
        </div>
        
        <div className="flex space-x-2 bg-slate-800/50 p-1 rounded-sm border border-slate-700/50">
          <button 
            onClick={() => setCameraView('2x2')}
            className={`px-4 py-1.5 text-xs font-semibold uppercase transition-colors rounded-sm ${
              cameraView === '2x2' 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            2x2 View
          </button>
          <button 
            onClick={() => setCameraView('3x3')}
            className={`px-4 py-1.5 text-xs font-semibold uppercase transition-colors rounded-sm ${
              cameraView === '3x3' 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            3x3 View
          </button>
        </div>
      </header>

      <section className="flex-1 h-full min-h-0 flex flex-col">
        <CameraGrid view={cameraView} />
      </section>
    </main>
  );
};
