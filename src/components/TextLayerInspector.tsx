import React, { useState } from "react";
import { FileText, Copy, Check, Download, Search, Code, Layers, Sparkles, Filter, FileCode } from "lucide-react";
import { FetchPageResponse, TextLayerItem } from "../types";
import { generateCombinedDocumentHtml } from "../utils/documentExport";

interface TextLayerInspectorProps {
  data: FetchPageResponse | null;
  processedContent?: string | null;
}

export const TextLayerInspector: React.FC<TextLayerInspectorProps> = ({
  data,
  processedContent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"outer_inner" | "nodes" | "processed">("outer_inner");
  const [searchQuery, setSearchQuery] = useState("");
  const [textMode, setTextMode] = useState<"both" | "outerText" | "innerText">("both");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!data) return null;

  const handleCopy = (text: string, typeLabel: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(typeLabel);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownload = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter layers by search query
  const filteredLayers = data.layers.filter((layer) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      layer.outerText.toLowerCase().includes(q) ||
      layer.innerText.toLowerCase().includes(q) ||
      layer.elementId.toLowerCase().includes(q) ||
      layer.className.toLowerCase().includes(q)
    );
  });

  const getCombinedText = () => {
    if (textMode === "outerText") return data.fullOuterText;
    if (textMode === "innerText") return data.fullInnerText;
    return `=== EXTRAHIERTER .TEXT_LAYER OUTERTEXT ===\n${data.fullOuterText}\n\n=== EXTRAHIERTER .TEXT_LAYER INNERTEXT ===\n${data.fullInnerText}`;
  };

  return (
    <div id="text-layer-inspector-widget" className="w-full bg-[#060812] border border-[#00f0ff]/40 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] font-mono">
      {/* Widget Header */}
      <div className="bg-[#0b0f19] border-b border-[#00f0ff]/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00f0ff] tracking-wider uppercase">
              .TEXT_LAYER CONTENT & DATA STORE WIDGET
            </h3>
            <p className="text-[11px] text-slate-400">
              Isolierter Content aus <code className="text-[#00f0ff]">{data.selectorUsed}</code> ({data.layersCount} Knoten extrahiert)
            </p>
          </div>
        </div>

        {/* Sub-tab buttons */}
        <div className="flex items-center gap-1 bg-[#121829] border border-slate-700 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab("outer_inner")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === "outer_inner"
                ? "bg-[#00f0ff] text-black shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>outerText & innerText</span>
          </button>
          <button
            onClick={() => setActiveSubTab("nodes")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === "nodes"
                ? "bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Knoten-Liste ({filteredLayers.length})</span>
          </button>
          {processedContent && (
            <button
              onClick={() => setActiveSubTab("processed")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === "processed"
                  ? "bg-[#00ff66] text-black shadow-[0_0_12px_rgba(0,255,102,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verarbeiteter Script-Content</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="p-4 space-y-4">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121829] border border-slate-800 p-3 rounded-xl text-xs">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Text-Layer durchsuchen..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#060812] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          {/* Mode Switcher */}
          {activeSubTab === "outer_inner" && (
            <div className="flex items-center gap-1 bg-[#060812] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setTextMode("both")}
                className={`px-2 py-1 rounded text-[11px] ${textMode === "both" ? "bg-[#00f0ff]/20 text-[#00f0ff]" : "text-slate-400"}`}
              >
                Beide
              </button>
              <button
                onClick={() => setTextMode("outerText")}
                className={`px-2 py-1 rounded text-[11px] ${textMode === "outerText" ? "bg-[#00f0ff]/20 text-[#00f0ff]" : "text-slate-400"}`}
              >
                Nur outerText
              </button>
              <button
                onClick={() => setTextMode("innerText")}
                className={`px-2 py-1 rounded text-[11px] ${textMode === "innerText" ? "bg-[#00f0ff]/20 text-[#00f0ff]" : "text-slate-400"}`}
              >
                Nur innerText
              </button>
            </div>
          )}

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const docHtml = generateCombinedDocumentHtml(data);
                const safeName = (data.title || "website").toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 30);
                handleDownload(`${safeName}_text_layer_doc.html`, docHtml, "text/html");
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black font-bold rounded-lg flex items-center gap-1.5 hover:brightness-110 shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
            >
              <FileCode className="w-3.5 h-3.5 fill-black" />
              <span>Full Document (.html)</span>
            </button>

            <button
              onClick={() => handleCopy(getCombinedText(), "full_text")}
              className="px-3 py-1.5 bg-[#060812] border border-slate-700 hover:border-[#00f0ff] rounded-lg text-slate-300 hover:text-[#00f0ff] flex items-center gap-1.5 transition-all"
            >
              {copiedType === "full_text" ? <Check className="w-3.5 h-3.5 text-[#00ff66]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === "full_text" ? "Kopiert!" : "Text Kopieren"}</span>
            </button>

            <button
              onClick={() => handleDownload("text_layer_report.txt", getCombinedText(), "text/plain")}
              className="px-3 py-1.5 bg-[#060812] border border-slate-700 hover:border-[#ff007f] rounded-lg text-slate-300 hover:text-[#ff007f] flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT Export</span>
            </button>

            <button
              onClick={() => handleDownload("text_layer_payload.json", JSON.stringify(data, null, 2), "application/json")}
              className="px-3 py-1.5 bg-[#060812] border border-slate-700 hover:border-[#00ff66] rounded-lg text-slate-300 hover:text-[#00ff66] flex items-center gap-1.5 transition-all"
            >
              <Code className="w-3.5 h-3.5" />
              <span>JSON Export</span>
            </button>
          </div>
        </div>

        {/* View Content */}
        {activeSubTab === "outer_inner" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* outerText box */}
            {(textMode === "both" || textMode === "outerText") && (
              <div className="bg-[#121829] border border-[#00f0ff]/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    .text_layer outerText Payload
                  </span>
                  <button
                    onClick={() => handleCopy(data.fullOuterText, "outerText")}
                    className="text-[11px] text-slate-400 hover:text-[#00f0ff] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Kopieren
                  </button>
                </div>
                <pre className="p-3 bg-[#060812] border border-slate-800 rounded-lg text-slate-200 text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
                  {data.fullOuterText || "(Kein outerText gefunden)"}
                </pre>
              </div>
            )}

            {/* innerText box */}
            {(textMode === "both" || textMode === "innerText") && (
              <div className="bg-[#121829] border border-[#ff007f]/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-[#ff007f] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    .text_layer innerText Payload
                  </span>
                  <button
                    onClick={() => handleCopy(data.fullInnerText, "innerText")}
                    className="text-[11px] text-slate-400 hover:text-[#ff007f] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Kopieren
                  </button>
                </div>
                <pre className="p-3 bg-[#060812] border border-slate-800 rounded-lg text-slate-200 text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
                  {data.fullInnerText || "(Kein innerText gefunden)"}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Nodes Breakdown */}
        {activeSubTab === "nodes" && (
          <div className="bg-[#121829] border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#060812] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Knoten Tag & ID</th>
                  <th className="p-3">Klassen</th>
                  <th className="p-3">Wörter / Zeichen</th>
                  <th className="p-3">Extrahierter Content (outerText / innerText)</th>
                  <th className="p-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLayers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Keine Treffer für Suchbegriff &quot;{searchQuery}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredLayers.map((layer) => (
                    <tr key={layer.id} className="hover:bg-[#060812]/50 transition-colors">
                      <td className="p-3 text-[#00f0ff] font-bold">#{layer.id}</td>
                      <td className="p-3 font-semibold text-slate-200">
                        &lt;{layer.tagName}&gt; <span className="text-[#ff007f]">{layer.elementId}</span>
                      </td>
                      <td className="p-3 text-slate-400 max-w-[150px] truncate">{layer.className || "-"}</td>
                      <td className="p-3 text-slate-400">
                        {layer.wordCount} W | {layer.charCount} Z
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="line-clamp-2 text-slate-300 text-[11px]">
                          {layer.outerText || layer.innerText || "(leer)"}
                        </p>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleCopy(layer.outerText, `layer_${layer.id}`)}
                          className="px-2 py-1 bg-[#060812] border border-slate-700 hover:border-[#00f0ff] rounded text-[11px] text-slate-300 hover:text-[#00f0ff]"
                        >
                          Kopieren
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Processed Script Content */}
        {activeSubTab === "processed" && processedContent && (
          <div className="bg-[#121829] border border-[#00ff66]/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-[#00ff66] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Vom Script Verarbeiteter Content Output
              </span>
              <button
                onClick={() => handleCopy(processedContent, "processed_content")}
                className="text-[11px] text-slate-400 hover:text-[#00ff66] flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Kopieren
              </button>
            </div>
            <pre className="p-3 bg-[#060812] border border-slate-800 rounded-lg text-[#00ff66] text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
              {processedContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
