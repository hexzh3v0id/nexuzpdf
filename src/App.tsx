import { useState, useEffect, useCallback } from "react";
import { HeaderUrlBar } from "./components/HeaderUrlBar";
import { WebViewWidget } from "./components/WebViewWidget";
import { TextLayerInspector } from "./components/TextLayerInspector";
import { ScriptExecutor } from "./components/ScriptExecutor";
import { AiAssistantWidget } from "./components/AiAssistantWidget";
import { TelemetryBar } from "./components/TelemetryBar";
import { FetchPageResponse, HistoryEntry } from "./types";
import { Layers, Terminal, Sparkles, Monitor, AlertCircle, RefreshCw, Download } from "lucide-react";
import { generateCombinedDocumentHtml, downloadFile } from "./utils/documentExport";

export default function App() {
  const [url, setUrl] = useState<string>("pdf_viewer_demo");
  const [selector, setSelector] = useState<string>(".text_layer");
  const [data, setData] = useState<FetchPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"webview" | "inspector" | "script" | "ai">("webview");
  const [processedScriptResult, setProcessedScriptResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activePresetKey, setActivePresetKey] = useState<string | undefined>("pdf_viewer_demo");

  // Fetch Page Handler
  const handleFetch = useCallback(async (targetUrl?: string, presetKey?: string) => {
    const fetchUrl = targetUrl || url;
    if (!fetchUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    if (presetKey) {
      setActivePresetKey(presetKey);
    } else if (fetchUrl !== "pdf_viewer_demo" && fetchUrl !== "cyber_news") {
      setActivePresetKey(undefined);
    }

    try {
      const response = await fetch("/api/fetch-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: fetchUrl,
          selector,
        }),
      });

      const resData: FetchPageResponse = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Fehler beim Laden der Website.");
      }

      setData(resData);
      setProcessedScriptResult(null);

      // Add to history
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        url: resData.url,
        title: resData.title || resData.url,
        timestamp: new Date().toLocaleTimeString(),
        layersCount: resData.layersCount,
        responseTimeMs: resData.responseTimeMs,
      };

      setHistory((prev) => [newEntry, ...prev.filter((h) => h.url !== newEntry.url).slice(0, 9)]);

    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err?.message || "Fehler beim Herstellen der Verbindung.");
    } finally {
      setIsLoading(false);
    }
  }, [url, selector]);

  // Handle preset selection
  const handleSelectPreset = (presetKey: string) => {
    setUrl(presetKey);
    handleFetch(presetKey, presetKey);
  };

  // Initial load on startup with preset demo
  useEffect(() => {
    handleFetch("pdf_viewer_demo", "pdf_viewer_demo");
  }, [handleFetch]);

  return (
    <div className="min-h-screen bg-[#060812] text-slate-100 flex flex-col font-sans selection:bg-[#00f0ff] selection:text-black">
      {/* Background Cyber Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#ff007f]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#00ff66]/05 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* URL Control Bar Header */}
        <HeaderUrlBar
          url={url}
          setUrl={setUrl}
          selector={selector}
          setSelector={setSelector}
          onFetch={() => handleFetch()}
          isLoading={isLoading}
          onSelectPreset={handleSelectPreset}
          activePresetKey={activePresetKey}
        />

        {/* Main Content Dashboard */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
          {/* Global Error Banner */}
          {error && (
            <div className="p-4 bg-red-950/80 border border-red-500 rounded-2xl flex items-center justify-between gap-3 text-red-200 text-sm font-mono shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-shake">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => handleFetch()}
                className="px-3 py-1.5 bg-red-900/60 border border-red-700 hover:bg-red-800 rounded-xl text-xs flex items-center gap-1 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Erneut versuchen
              </button>
            </div>
          )}

          {/* Tab Navigation Controls */}
          <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-2 overflow-x-auto">
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                id="tab-webview"
                onClick={() => setActiveTab("webview")}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                  activeTab === "webview"
                    ? "bg-[#00f0ff] text-black font-bold border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    : "bg-[#121829] border-slate-800 text-slate-300 hover:border-[#00f0ff]/50"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>1. Web Engine & Web-View</span>
              </button>

              <button
                id="tab-inspector"
                onClick={() => setActiveTab("inspector")}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                  activeTab === "inspector"
                    ? "bg-[#00f0ff] text-black font-bold border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    : "bg-[#121829] border-slate-800 text-slate-300 hover:border-[#00f0ff]/50"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. .text_layer Inspector</span>
              </button>

              <button
                id="tab-script"
                onClick={() => setActiveTab("script")}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                  activeTab === "script"
                    ? "bg-[#00ff66] text-black font-bold border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                    : "bg-[#121829] border-slate-800 text-slate-300 hover:border-[#00ff66]/50"
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>3. Script Executor</span>
              </button>

              <button
                id="tab-ai"
                onClick={() => setActiveTab("ai")}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                  activeTab === "ai"
                    ? "bg-[#ff007f] text-white font-bold border-[#ff007f] shadow-[0_0_15px_rgba(255,0,127,0.4)]"
                    : "bg-[#121829] border-slate-800 text-slate-300 hover:border-[#ff007f]/50"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>4. Gemini K.I. Synthesizer</span>
              </button>
            </div>

            {/* Quick Stats & Download pill */}
            {data && (
              <div className="flex items-center gap-3 font-mono text-xs text-slate-400 bg-[#121829] px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="hidden sm:inline">Gefunden: <strong className="text-[#00f0ff]">{data.layersCount}</strong> Layer</span>
                <span className="hidden sm:inline">•</span>
                <button
                  id="btn-global-download-doc"
                  onClick={() => {
                    const docHtml = generateCombinedDocumentHtml(data);
                    const safeName = (data.title || "website").toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 30);
                    downloadFile(`${safeName}_text_layer_document.html`, docHtml, "text/html");
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black font-bold rounded-lg flex items-center gap-1.5 hover:brightness-110 shadow-[0_0_12px_rgba(0,240,255,0.4)] active:scale-95 transition-all"
                  title="HTML Sourcecode & .text_layer Content in neue lokale Datei (.html) speichern und herunterladen"
                >
                  <Download className="w-3.5 h-3.5 fill-black" />
                  <span>DOKUMENT DOWNLOADEN</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Component Tab Views */}
          <div className="space-y-6">
            {/* Always show Web View Widget or based on active tab */}
            {activeTab === "webview" && (
              <div className="space-y-6">
                <WebViewWidget
                  data={data}
                  isLoading={isLoading}
                  onRefresh={() => handleFetch()}
                />
                {/* Embedded quick inspector summary below Web View */}
                {data && (
                  <TextLayerInspector
                    data={data}
                    processedContent={processedScriptResult}
                  />
                )}
              </div>
            )}

            {activeTab === "inspector" && (
              <TextLayerInspector
                data={data}
                processedContent={processedScriptResult}
              />
            )}

            {activeTab === "script" && (
              <ScriptExecutor
                data={data}
                onProcessedResult={(result) => setProcessedScriptResult(result)}
              />
            )}

            {activeTab === "ai" && <AiAssistantWidget data={data} />}
          </div>
        </main>

        {/* Telemetry HUD Bottom Bar */}
        <TelemetryBar data={data} historyCount={history.length} />
      </div>
    </div>
  );
}
