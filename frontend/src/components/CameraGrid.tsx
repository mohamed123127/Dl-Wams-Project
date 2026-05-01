import { CameraOff } from 'lucide-react';
import type { CameraView } from '../frontend/Dashboard';
import { useRef, useEffect, useState } from 'react';
import { getHeaders } from '../services/api';
import { SECURITY_API_URL } from '../services/api';

interface BoundingBox {
  id: string;
  label: string;
  status: 'NORMAL' | 'UNKNOWN' | 'SUSPICIOUS DETECTED';
  x: string;
  y: string;
  w: string;
  h: string;
}

interface Camera {
  id: string;
  name: string;
  resolution: string;
  fps: string;
  bitrate: string;
  offline: boolean;
  alert?: boolean;
  boxes?: BoundingBox[];
  streamUrl?: string; // Capable of receiving a real stream
}

const CameraFeed = ({ cam }: { cam: Camera }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play workaround and setup for when real live feeds attached
  useEffect(() => {
    if (videoRef.current && cam.streamUrl && !cam.offline) {
      videoRef.current.play().catch((e) => console.log('Autoplay blocked', e));
    }
  }, [cam.streamUrl, cam.offline]);

  if (cam.offline) {
    return (
      <div className="bg-[#121826] border border-slate-800 flex flex-col items-center justify-center relative w-full h-full min-h-[160px]">
        <CameraOff className="w-8 h-8 text-slate-600 mb-2" />
        <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">Feed_Offline</span>
      </div>
    );
  }

  const borderClass = cam.alert ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-800';

  return (
    <div className={`relative bg-slate-950 border ${borderClass} overflow-hidden w-full h-full group flex`}>
      {/* Real Video Element capable of stream */}
      <img
        src={cam.streamUrl}
        alt="Live Camera"
        className="w-full h-full object-cover opacity-60"
      />

      {/* Alert red tint */}
      {cam.alert && (
        <div className="absolute inset-0 bg-red-500/10 pointer-events-none mix-blend-color"></div>
      )}

      {/* Bounding Boxes */}
      {cam.boxes?.map(box => (
        <div
          key={box.id}
          className={`absolute border-2 ${box.status === 'NORMAL' ? 'border-blue-400' : box.status === 'UNKNOWN' ? 'border-orange-400' : 'border-red-500'} pointer-events-none transition-all duration-300`}
          style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
        >
          <div className={`absolute -top-5 left-0 text-[8px] font-bold px-1 whitespace-nowrap
            ${box.status === 'NORMAL' ? 'bg-blue-400/20 text-blue-300' : box.status === 'UNKNOWN' ? 'bg-orange-400/20 text-orange-300' : 'bg-red-500/80 text-white'}
          `}>
            {box.id} &bull; {box.label}
          </div>
        </div>
      ))}

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end">
        <div className="flex items-center space-x-1">
          <span className={`w-1.5 h-1.5 ${cam.alert ? 'bg-red-500' : 'bg-orange-500'} mr-1 animate-pulse`}></span>
          <div>
            <div className="text-[9px] text-slate-300 uppercase tracking-widest">
              {cam.id} &bull; {cam.resolution} &bull; {cam.fps} &bull; {cam.bitrate}
            </div>
            <div className={`text-xs font-bold tracking-wider ${cam.alert ? 'text-red-400' : 'text-slate-100'} uppercase mt-0.5`}>
              {cam.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CameraGrid = ({ view }: { view: CameraView }) => {
  const [cameras, setCameras] = useState<Camera[]>([]);

  useEffect(() => {
    console.log("security url", SECURITY_API_URL)
    fetch(`https://${SECURITY_API_URL}/api/cameras/`
      , {
        method: 'GET',
        headers: getHeaders(),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const fetchedCameras: Camera[] = data.map((apiCam: any) => ({
            id: `CAM_${apiCam.id}`,
            name: apiCam.name,
            resolution: '1080P',
            fps: '30FPS',
            bitrate: '4.2Mbps',
            offline: !apiCam.is_active,
            streamUrl: apiCam.rtsp_url,
          }));
          console.log(fetchedCameras);
          setCameras(fetchedCameras);
        }
      })
      .catch((err) => console.error("Failed to fetch cameras", err));
  }, []);

  const gridClass = view === '3x3' ? 'grid-cols-3' : 'grid-cols-2';
  const totalSlots = view === '3x3' ? 9 : 4;
  const visibleCameras = cameras.slice(0, totalSlots);
  const emptySlotsCount = totalSlots - visibleCameras.length;

  return (
    <div className={`grid ${gridClass} gap-3 h-full overflow-hidden`}>
      {visibleCameras.map(cam => (
        <CameraFeed cam={cam} />
      ))}
      {Array.from({ length: Math.max(0, emptySlotsCount) }).map((_, index) => (
        <div key={`empty-${index}`} className="bg-[#121826] border border-slate-800 flex flex-col items-center justify-center relative w-full h-full min-h-[160px]">
          <CameraOff className="w-8 h-8 text-slate-600 mb-2" />
          <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">No camera added</span>
        </div>
      ))}
    </div>
  );
};


const LiveCamera = ({ streamUrl }) => {
  return (
    <div className="w-full flex justify-center">
      <img
        src={streamUrl}
        alt="Live Camera"
        className="w-full max-w-2xl rounded-lg border"
      />
    </div>
  );
};

