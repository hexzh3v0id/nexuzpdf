import React from "react";
import { Cpu, Zap, Activity, Clock, Layers, Hash } from "lucide-react";
import { FetchPageResponse } from "../types";

interface TelemetryBarProps {
  data: FetchPageResponse | null;
  historyCount: number;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ data, historyCount }) => {
  return (
    <footer id="telemetry-bar-hud" className="w-full bg-[#0b0f19]/90 border-t border-[#00f0ff]/30 px-4 py-2.5 font-mono text-[11px] text-slate-400 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Status indicators */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#00ff66]">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
            <span className="font-bold">SYSTEM: ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Latenz: <strong className="text-[#00f0ff]">{data ? `${data.responseTimeMs}ms` : "0ms"}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-[#ff007f]" />
            <span>Knoten: <strong className="text-[#ff007f]">{data ? data.layersCount : 0}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 hidden sm:flex">
            <Hash className="w-3.5 h-3.5 text-[#00ff66]" />
            <span>Gesamtwörter: <strong className="text-[#00ff66]">{data ? (data.fullOuterText ? data.fullOuterText.split(/\s+/).length : 0) : 0}</strong></span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Verlauf: <strong>{historyCount}</strong> Abfragen</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#00f0ff] font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>NEON-ENGINE v4.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
