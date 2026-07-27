import React, { useState } from "react";
import { Sparkles, Bot, Send, RefreshCw, Copy, Check, FileText } from "lucide-react";
import { FetchPageResponse } from "../types";

interface AiAssistantWidgetProps {
  data: FetchPageResponse | null;
}

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({ data }) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleAiAnalyze = async (promptOverride?: string, taskType: string = "summary") => {
    setIsLoading(true);
    setError(null);

    try {
      const textToAnalyze = data.fullOuterText || data.fullInnerText;
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptOverride || customPrompt,
          textContent: textToAnalyze,
          taskType,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Fehler beim Aufruf der Gemini AI.");
      }

      setAiOutput(resData.result);
    } catch (err: any) {
      setError(err?.message || "Fehler bei der K.I. Analyse.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-assistant-widget" className="w-full bg-[#060812] border border-[#ff007f]/40 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,0,127,0.15)] font-mono">
      {/* Header */}
      <div className="bg-[#0b0f19] border-b border-[#ff007f]/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-[#ff007f]/10 border border-[#ff007f]/40 text-[#ff007f]">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#ff007f] tracking-wider uppercase">
              GEMINI K.I. SYNTHESIZER & ANALYZER
            </h3>
            <p className="text-[11px] text-slate-400">
              Analysiere den extrahierten .text_layer Content mit künstlicher Intelligenz
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Quick Action Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleAiAnalyze("Erstelle eine strukturierte Zusammenfassung mit Key-Facts aus dem Text Content:", "summary")}
            disabled={isLoading}
            className="p-3 bg-[#121829] border border-slate-800 hover:border-[#ff007f] rounded-xl text-left text-xs text-slate-200 hover:text-white transition-all flex items-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-[#ff007f] group-hover:animate-spin" />
            <div>
              <span className="font-bold block">Prägnante Zusammenfassung</span>
              <span className="text-[10px] text-slate-400">Key Facts & Bullet-Points</span>
            </div>
          </button>

          <button
            onClick={() => handleAiAnalyze("Extrahiere alle wichtigen Entitäten, Zahlen, Metriken und Begriffe im JSON Format:", "extract_json")}
            disabled={isLoading}
            className="p-3 bg-[#121829] border border-slate-800 hover:border-[#00f0ff] rounded-xl text-left text-xs text-slate-200 hover:text-white transition-all flex items-center gap-2 group"
          >
            <FileText className="w-4 h-4 text-[#00f0ff]" />
            <div>
              <span className="font-bold block">Entitäten & JSON Metriken</span>
              <span className="text-[10px] text-slate-400">Strukturierter Datenexport</span>
            </div>
          </button>

          <button
            onClick={() => handleAiAnalyze("Welche wichtigsten Fragen und Antworten ergeben sich aus diesem Website Text Layer?", "qa")}
            disabled={isLoading}
            className="p-3 bg-[#121829] border border-slate-800 hover:border-[#00ff66] rounded-xl text-left text-xs text-slate-200 hover:text-white transition-all flex items-center gap-2 group"
          >
            <Bot className="w-4 h-4 text-[#00ff66]" />
            <div>
              <span className="font-bold block">K.I. Q&A & Erkenntnisse</span>
              <span className="text-[10px] text-slate-400">Analyse & Interpretationen</span>
            </div>
          </button>
        </div>

        {/* Custom Prompt Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Stellen Sie eine spezifische Frage zum extrahierten Text Content..."
            className="flex-1 bg-[#121829] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#ff007f]"
            onKeyDown={(e) => e.key === "Enter" && customPrompt.trim() && handleAiAnalyze()}
          />
          <button
            onClick={() => handleAiAnalyze()}
            disabled={isLoading || !customPrompt.trim()}
            className="px-4 py-2.5 bg-[#ff007f] hover:brightness-110 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,127,0.4)] disabled:opacity-50 transition-all"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Senden</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        {/* AI Output Area */}
        {aiOutput && (
          <div className="bg-[#121829] border border-[#ff007f]/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-[#ff007f] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini K.I. Analyse-Ergebnis
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiOutput);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-[#ff007f] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-[#00ff66]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Kopiert!" : "Kopieren"}</span>
              </button>
            </div>

            <div className="p-3 bg-[#060812] border border-slate-800 rounded-lg text-slate-200 text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {aiOutput}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
