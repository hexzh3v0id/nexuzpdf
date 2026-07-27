import React, { useState } from "react";
import { Globe, Zap, Sliders, Sparkles, RefreshCw, Layers } from "lucide-react";

interface HeaderUrlBarProps {
  url: string;
  setUrl: (url: string) => void;
  selector: string;
  setSelector: (sel: string) => void;
  onFetch: () => void;
  isLoading: boolean;
  onSelectPreset: (presetKey: string) => void;
  activePresetKey?: string;
}

export const HeaderUrlBar: React.FC<HeaderUrlBarProps> = ({
  url,
  setUrl,
  selector,
  setSelector,
  onFetch,
  isLoading,
  onSelectPreset,
  activePresetKey,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetch();
    }
  };

  return (
    <header id="header-url-bar" className="w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#00f0ff]/30 p-4 sticky top-0 z-50 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Title & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#060812] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)] text-[#00f0ff]">
              <Zap className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ff66] rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-[#00f0ff] via-[#e2e8f0] to-[#ff007f] bg-clip-text text-transparent uppercase font-mono">
                NEON WEB-ENGINE & TEXT_LAYER
              </h1>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span>[EXTRACTOR: ACTIVE]</span>
                <span className="text-[#00f0ff]">•</span>
                <span>TARGET: <code className="text-[#00f0ff]">{selector}</code></span>
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-slate-400 hidden sm:inline">DEMO-URLS:</span>
            <button
              id="preset-pdf-demo"
              type="button"
              onClick={() => onSelectPreset("pdf_viewer_demo")}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                activePresetKey === "pdf_viewer_demo"
                  ? "bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                  : "bg-[#121829] border-slate-800 text-slate-300 hover:border-[#00f0ff]/50 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#00f0ff]" />
              PDF.js Reader (.text_layer)
            </button>
            <button
              id="preset-news-demo"
              type="button"
              onClick={() => onSelectPreset("cyber_news")}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                activePresetKey === "cyber_news"
                  ? "bg-[#ff007f]/20 border-[#ff007f] text-[#ff007f] shadow-[0_0_12px_rgba(255,0,127,0.4)]"
                  : "bg-[#121829] border-slate-800 text-slate-300 hover:border-[#ff007f]/50 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff007f]" />
              CyberPulse Article
            </button>
          </div>
        </div>

        {/* Main Input Bar */}
        <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 text-[#00f0ff]">
              <Globe className="w-5 h-5" />
            </div>
            <input
              id="input-url-field"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Geben Sie eine Website URL ein (z.B. https://example.com oder PDF.js Viewer)..."
              className="w-full pl-11 pr-24 py-3 bg-[#060812] border border-[#00f0ff]/40 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] shadow-[inner_0_2px_10px_rgba(0,0,0,0.8)] transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="absolute right-2 px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-[#00f0ff] bg-[#121829] border border-slate-700 hover:border-[#00f0ff]/50 rounded-lg flex items-center gap-1 transition-all"
              title="Selektor anpassen"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>CSS</span>
            </button>
          </div>

          <button
            id="btn-fetch-url"
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] via-[#0099ff] to-[#ff007f] hover:brightness-110 text-slate-950 font-bold font-mono tracking-wider text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>LADE CONTENT...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-black fill-black" />
                <span>LOS / WEBPAGE LADEN</span>
              </>
            )}
          </button>
        </form>

        {/* Advanced CSS Selector Drawer */}
        {showAdvanced && (
          <div className="p-3 bg-[#060812] border border-[#00f0ff]/30 rounded-xl flex flex-wrap items-center gap-3 text-xs font-mono animate-fadeIn">
            <span className="text-slate-400">Ziel-Klasse / CSS-Selektor:</span>
            <input
              id="input-selector-field"
              type="text"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder=".text_layer"
              className="px-3 py-1.5 bg-[#121829] border border-slate-700 rounded-lg text-[#00f0ff] focus:outline-none focus:border-[#00f0ff] w-64"
            />
            <span className="text-slate-500 italic">
              (Standardsuche: <code>.text_layer</code> – extrahiert outerText & innerText aus HTML)
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
