import React from 'react';
import { Layers, Maximize2, Activity } from 'lucide-react';

interface DicomViewerMockProps {
  caseId?: string;
  title?: string;
  fov?: string;
}

export const DicomViewerMock: React.FC<DicomViewerMockProps> = ({
  caseId = "PA-8492-VOL",
  title = "Thoracoabdominal multi-slice virtual dissection",
  fov = "320MM"
}) => {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative group">
      {/* Top HUD Bar */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-slate-200 font-bold tracking-wider">
            PMCT-VOL: 0.4MM ISOTROPIC
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden sm:inline">
            HU: CALIBRATED <span className="text-amber-400/90">(-1000..+3071)</span>
          </span>
          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase tracking-wider">
            VOLUMETRIC ARCHIVE
          </span>
        </div>
      </div>

      {/* Main DICOM Display Screen */}
      <div className="relative h-64 sm:h-72 w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
        {/* Simulated DICOM Multi-planar Reconstruction Graphics */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Workstation Monitors Simulation Graphic */}
        <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
          <div className="relative w-full max-w-md h-full rounded-lg border border-slate-800/80 bg-slate-950/90 p-3 shadow-inner flex flex-col justify-between overflow-hidden">
            {/* HUD Overlay Top Corners */}
            <div className="flex justify-between items-start text-[10px] font-mono text-cyan-400/80 z-20">
              <div className="space-y-0.5">
                <p>3D MPR RECON</p>
                <p className="text-slate-500">FOV: {fov}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-amber-400">SL: 0.6mm</p>
                <p className="text-slate-500">W: 1500 L: -500</p>
              </div>
            </div>

            {/* Simulated 3D Skeleton / CT Rendering */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-48 h-48 rounded-full border border-cyan-500/20 flex items-center justify-center animate-pulse">
                <div className="w-36 h-36 rounded-full border border-amber-500/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-amber-500/5 border border-amber-400/40"></div>
                </div>
                {/* Crosshairs */}
                <div className="absolute w-full h-px bg-cyan-500/30"></div>
                <div className="absolute h-full w-px bg-cyan-500/30"></div>
              </div>

              {/* High-tech DICOM graphics overlay */}
              <svg className="absolute w-full h-full opacity-40 text-cyan-400" viewBox="0 0 400 200" fill="none">
                <path d="M50 100 Q 100 20, 200 100 T 350 100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M80 140 C 140 80, 260 180, 320 120" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="200" cy="100" r="4" fill="#f59e0b" />
              </svg>
            </div>

            {/* HUD Overlay Bottom */}
            <div className="flex justify-between items-end text-[10px] font-mono text-slate-400 z-20">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Activity className="w-3 h-3 animate-spin" />
                <span>PACS DICOM STREAM ACTIVE</span>
              </span>
              <span className="text-slate-500">FPS: 60</span>
            </div>
          </div>
        </div>

        {/* Floating Tools Badge */}
        <div className="absolute top-3 right-3 flex gap-1.5 z-20">
          <div className="p-1.5 rounded-md bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-amber-400 cursor-pointer">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="p-1.5 rounded-md bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-amber-400 cursor-pointer">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-amber-500/40">
            CASE ID: {caseId}
          </span>
          <span className="text-slate-300 font-medium text-[11px] truncate max-w-xs">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
          <span>120 kVp</span>
          <span>/</span>
          <span>300 mAs</span>
        </div>
      </div>
    </div>
  );
};
