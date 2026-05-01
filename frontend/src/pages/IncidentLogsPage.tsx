
import { Calendar, Video, Bookmark, Download, Play, SkipBack, SkipForward, Maximize } from 'lucide-react';
import { useEffect, useState } from "react";
import { MODEL_API_URL } from '../services/api';

interface IncidentLogsPageProps {
  items: any[];
  selectedItemId: number | null;
  onMarkViewed: (itemId: number) => void;
}

export const IncidentLogsPage = ({ testVedio, setTestVedio, items, selectedItemId, onMarkViewed }: IncidentLogsPageProps) => {
  const [testVedioResult, setTestVedioResult] = useState({});
  // Show the selected item, or fall back to the first item
  const currentItem = selectedItemId
    ? items.find(item => item.id === selectedItemId) || items[0]
    : items[0];

  const handleVideoPlay = () => {
    if (currentItem && !currentItem.viewed) {
      console.log('playing');
      setTestVedio('');
      onMarkViewed(currentItem.id);
    }
  };

  // Auto-mark as viewed when the item is displayed
  useEffect(() => {
    if (currentItem && !currentItem.viewed) {
      setTestVedio('');
      onMarkViewed(currentItem.id);
    }
  }, [currentItem?.id]);

  const handleImport = async () => {
    try {
      // Create hidden file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".mp4";

      input.onchange = async (event) => {
        const video = event.target.files[0];

        if (!video) return;

        setTestVedio(URL.createObjectURL(video))

        const formData = new FormData();
        formData.append("video", video);

        try {
          const response = await fetch(`${MODEL_API_URL}/api/predict/`, {
            method: "POST",
            body: formData,
            // If using auth:
            // headers: {
            //   Authorization: `Bearer ${token}`,
            // },
          });

          if (!response.ok) {
            throw new Error("Failed to import file");
          }

          const result = await response.json();

          setTestVedioResult(result);
        } catch (error) {
          console.error("Import error:", error);
          alert("Import failed!");
        }
      };

      input.click();
    } catch (error) {
      console.error("File selection error:", error);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 min-h-0 bg-[#0b101a]">
      <header className="flex justify-between items-start border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-wider text-slate-100 uppercase">
            INCIDENT_ID: {currentItem?.id ? `${currentItem.id}-AX` : "NO_DATA"}
          </h1>
          <div className="flex flex-wrap space-x-3 mt-3">
            <div className="flex items-center space-x-2 bg-slate-800/40 text-slate-400 px-3 py-1.5 rounded-sm border border-slate-700/50 text-xs font-mono mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentItem?.date || "YYYY-MM-DD"} | {currentItem?.time || "HH:MM:SS"}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/40 text-slate-400 px-3 py-1.5 rounded-sm border border-slate-700/50 text-xs font-mono mb-2">
              <Video className="w-3.5 h-3.5" />
              <span>{currentItem?.camera || "UNKNOWN_CAMERA"}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/40 text-slate-400 px-3 py-1.5 rounded-sm border border-slate-700/50 text-xs font-mono mb-2">
              <Bookmark className="w-3.5 h-3.5" />
              <span>{currentItem?.location || "UNKNOWN_LOCATION"}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button onClick={handleImport} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-sm transition-colors text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Download className="w-4 h-4" />
            <span>Import Clip</span>
          </button>
        </div>
      </header>

      <section className="flex-1 min-h-0 flex flex-col gap-4">
        {/* Main Video Player */}
        <div className="h-64 relative bg-black border border-slate-800 rounded-sm flex-1 flex flex-col group">
          <video
            key={currentItem?.id}
            src={testVedio !== '' ? testVedio : currentItem?.video_path}
            autoPlay
            loop
            muted
            playsInline
            controls
            onPlay={handleVideoPlay}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4 flex space-x-2 pointer-events-none w-[500px]">
            <div>
              {testVedio == '' && items.length === 0 && (
                <div className="absolute top-4 left-4 flex space-x-2 pointer-events-none w-fit">
                  <div className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 flex items-center space-x-1 rounded-sm uppercase tracking-wider shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    <span>No incident detected</span>
                  </div>
                </div>
              )}
              {
                testVedio == '' && items.length > 0 && (
                  <div className="absolute top-4 left-4 flex space-x-2 pointer-events-none">
                    <div className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 flex items-center space-x-1 rounded-sm uppercase tracking-wider shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      <span>Shoplifting detected</span>
                    </div>
                  </div>
                )
              }
              {
                testVedio != '' && (
                  <div className="absolute top-4 left-4 flex space-x-2 pointer-events-none">
                    <div className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 flex items-center space-x-1 rounded-sm uppercase tracking-wider shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      <span>{testVedioResult.isShoplifting ? 'Shoplifting {' + testVedioResult.confidence + '}' : 'No shoplifting'}</span>
                    </div>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </section>
    </main >
  );
};
