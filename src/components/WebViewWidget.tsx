import React, { useState } from "react";
import { Eye, ExternalLink, Maximize2, Minimize2, Layers, RefreshCw, AlertTriangle, Monitor, ShieldCheck, Download, FileCode } from "lucide-react";
import { FetchPageResponse } from "../types";
import { generateCombinedDocumentHtml, downloadFile } from "../utils/documentExport";

interface WebViewWidgetProps {
  data: FetchPageResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WebViewWidget: React.FC<WebViewWidgetProps> = ({
  data,
  isLoading,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<"proxy" | "direct" | "visualizer">("proxy");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="w-full min-h-[420px] bg-[#060812] border border-[#00f0ff]/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.1)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0,transparent_70%)] animate-pulse" />
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-[#00f0ff] rounded-full animate-ping opacity-40" />
          <div className="w-12 h-12 border-4 border-t-[#00f0ff] border-r-[#ff007f] border-b-[#00ff66] border-l-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-mono font-bold text-[#00f0ff] tracking-wider mb-2">
          WEB-ENGINE LÄDT WEBSITE CONTENT...
        </h3>
        <p className="text-xs font-mono text-slate-400 max-w-md">
          Temporäres Herunterladen des HTML-Quellcodes, Traversieren des DOM-Baums & Isolieren aller <code>.text_layer</code> Knoten...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full min-h-[400px] bg-[#060812]/80 border border-[#00f0ff]/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-[#121829] border border-[#00f0ff]/40 flex items-center justify-center mb-4 text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <Monitor className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-mono font-bold text-slate-200 tracking-wider mb-2">
          WEB-ENGINE & BROWSER PREVIEW BEREIT
        </h3>
        <p className="text-xs font-mono text-slate-400 max-w-md mb-6">
          Geben Sie oben eine URL ein oder wählen Sie einen Demo-Preset. Das System lädt temporär die HTML-Seite, analysiert <code>.text_layer</code> (outerText & innerText) und rendert das Ergebnis im Web-View Widget.
        </p>
      </div>
    );
  }

  return (
    <div
      id="web-view-widget-container"
      className={`w-full bg-[#060812] border border-[#00f0ff]/40 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all ${
        isFullscreen ? "fixed inset-2 z-50 h-[calc(100vh-16px)]" : "relative min-h-[500px]"
      }`}
    >
      {/* Widget Header Control Bar */}
      <div className="bg-[#0b0f19] border-b border-[#00f0ff]/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            WEB-VIEW ENGINE
          </span>
          <span className="text-slate-300 truncate max-w-xs md:max-w-md font-semibold">
            {data.title || data.url}
          </span>
          <span className="text-[#00ff66] bg-[#00ff66]/10 px-2 py-0.5 rounded border border-[#00ff66]/30 hidden sm:inline">
            {data.layersCount} .text_layer Knoten
          </span>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="bg-[#121829] border border-slate-700 rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode("proxy")}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                viewMode === "proxy"
                  ? "bg-[#00f0ff] text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Gefiltert HTML</span>
            </button>
            <button
              onClick={() => setViewMode("visualizer")}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                viewMode === "visualizer"
                  ? "bg-[#ff007f] text-white font-bold shadow-[0_0_10px_rgba(255,0,127,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layer Grid</span>
            </button>
            <button
              onClick={() => setViewMode("direct")}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                viewMode === "direct"
                  ? "bg-[#00ff66] text-black font-bold shadow-[0_0_10px_rgba(0,255,102,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direkt Frame</span>
            </button>
          </div>

          {/* Zoom Selector */}
          <div className="hidden md:flex items-center gap-1 bg-[#121829] border border-slate-700 px-2 py-1 rounded-lg text-slate-300">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="hover:text-[#00f0ff] font-bold px-1"
            >
              -
            </button>
            <span className="w-10 text-center text-[10px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="hover:text-[#00f0ff] font-bold px-1"
            >
              +
            </button>
          </div>

          {/* Download Full Document Button */}
          <button
            id="btn-download-html-doc"
            onClick={() => {
              if (data) {
                const docHtml = generateCombinedDocumentHtml(data);
                const safeName = (data.title || "website").toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 30);
                downloadFile(`${safeName}_text_layer_document.html`, docHtml, "text/html");
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
            title="Lokales Dokument herunterladen (HTML Quellcode & .text_layer outerText/innerText)"
          >
            <Download className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">DOKUMENT DOWNLOADEN (.html)</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-[#121829] border border-slate-700 text-slate-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all"
            title="Aktualisieren"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[#121829] border border-slate-700 text-slate-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all"
            title="Vollbild umschalten"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Render Area */}
      <div className="w-full h-[520px] bg-[#060812] relative overflow-auto p-1">
        {viewMode === "proxy" && (
          <div
            className="w-full h-full bg-white rounded-xl overflow-hidden shadow-inner"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left", width: `${100 * (100 / zoomLevel)}%`, height: `${100 * (100 / zoomLevel)}%` }}
          >
            <iframe
              id="web-engine-proxy-iframe"
              title="Web Engine Processed Preview"
              srcDoc={data.proxyHtml || "<html><body><p>Kein HTML Inhalt verfügbar</p></body></html>"}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        )}

        {viewMode === "direct" && (
          <div className="w-full h-full relative">
            <div className="bg-[#121829] text-xs font-mono p-2 border-b border-slate-800 text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#e2e8f0]" />
              <span>Direktes iframe Einbetten hängt von der Sicherheitspolitik (X-Frame-Options) der Website ab.</span>
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-[#00f0ff] underline flex items-center gap-1"
              >
                In neuem Tab öffnen <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe
              id="web-engine-direct-iframe"
              title="Direct Website Frame"
              src={data.url}
              className="w-full h-[calc(100%-32px)] border-0"
            />
          </div>
        )}

        {viewMode === "visualizer" && (
          <div className="w-full h-full p-4 overflow-y-auto space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#ff007f] flex items-center gap-2">
                <Layers className="w-4 h-4" />
                EXTRAHIERTE .TEXT_LAYER KNOTEN GRID ({data.layers.length})
              </h4>
              <span className="text-xs text-slate-400">
                Gefunden mit Selektor: <code className="text-[#00f0ff]">{data.selectorUsed}</code>
              </span>
            </div>

            {data.layers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-400">
                Keine <code>.text_layer</code> Knoten gefunden.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="p-4 bg-[#121829] border border-[#00f0ff]/30 hover:border-[#ff007f] rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.08)] transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-slate-800">
                      <span className="font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
                        #{layer.id} &lt;{layer.tagName}&gt; #{layer.elementId}
                      </span>
                      <span className="text-slate-400">
                        {layer.wordCount} Wörter | {layer.charCount} Zeichen
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider">innerText:</span>
                        <div className="p-2 bg-[#060812] border border-slate-800 rounded text-slate-200 max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">
                          {layer.innerText || "(leer)"}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider">outerText:</span>
                        <div className="p-2 bg-[#060812] border border-slate-800 rounded text-[#00ff66] max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">
                          {layer.outerText || "(leer)"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
