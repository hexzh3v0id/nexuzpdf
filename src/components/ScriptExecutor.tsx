import React, { useState } from "react";
import { Code, Play, Sparkles, Terminal, Copy, Check, RefreshCw, FileText } from "lucide-react";
import { FetchPageResponse, ScriptTemplate } from "../types";

interface ScriptExecutorProps {
  data: FetchPageResponse | null;
  onProcessedResult: (result: string) => void;
}

const DEFAULT_SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: "clean_format",
    name: "1. Text Säuberung & Formatierung",
    description: "Bereinigt doppelte Leerzeichen, formatiert Absätze und entfernt Sonderzeichen-Müll.",
    code: `// Function executes on (textLayers, fullOuterText, fullInnerText)
// Return a string or object result
let lines = fullOuterText.split('\\n')
  .map(l => l.trim())
  .filter(l => l.length > 0);

return "=== BEREINIGTER CONTENT (" + lines.length + " Zeilen) ===\\n\\n" + lines.join('\\n');`
  },
  {
    id: "extract_emails_links",
    name: "2. Links, E-Mails & Keywords Extraktor",
    description: "Sucht im .text_layer Content nach E-Mail-Adressen, Web-Links und spezifischen Begriffen.",
    code: `const emails = fullOuterText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g) || [];
const urls = fullOuterText.match(/https?:\\/\\/[^\\s]+/g) || [];
const keywords = fullOuterText.match(/\\b(quantum|cyber|neon|protocol|text_layer|pdf|engine|data|ai)\\b/gi) || [];

return JSON.stringify({
  emailMatches: [...new Set(emails)],
  urlMatches: [...new Set(urls)],
  keywordOccurrences: keywords.length,
  foundKeywords: [...new Set(keywords.map(k => k.toLowerCase()))]
}, null, 2);`
  },
  {
    id: "word_frequency",
    name: "3. Wort-Frequenz-Analyse",
    description: "Erstellt eine Frequenzliste der häufigsten Wörter im extrahierten text_layer.",
    code: `const words = fullOuterText.toLowerCase().match(/\\b[a-zäöüß]{3,}\\b/gi) || [];
const freq = {};
words.forEach(w => freq[w] = (freq[w] || 0) + 1);

const sorted = Object.entries(freq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

return "=== TOP 20 HÄUFIGSTE WÖRTER ===\\n" + sorted.map(([w, c], i) => (i + 1) + ". " + w + ": " + c + "x").join('\\n');`
  },
  {
    id: "custom_json_array",
    name: "4. In Structured JSON Konvertieren",
    description: "Wandelt jeden .text_layer Knoten in ein sauberes JSON Objekt um.",
    code: `const structuredData = textLayers.map((layer, index) => ({
  nodeIndex: index + 1,
  tag: layer.tagName,
  id: layer.elementId,
  wordsCount: layer.wordCount,
  textSnippet: layer.outerText.substring(0, 100)
}));

return JSON.stringify(structuredData, null, 2);`
  }
];

export const ScriptExecutor: React.FC<ScriptExecutorProps> = ({
  data,
  onProcessedResult,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("clean_format");
  const [scriptCode, setScriptCode] = useState<string>(DEFAULT_SCRIPT_TEMPLATES[0].code);
  const [outputResult, setOutputResult] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (template: ScriptTemplate) => {
    setSelectedTemplateId(template.id);
    setScriptCode(template.code);
    setExecutionError(null);
  };

  const handleRunScript = () => {
    if (!data) return;
    setIsExecuting(true);
    setExecutionError(null);

    try {
      // Create execution function passing textLayers, fullOuterText, fullInnerText
      // eslint-disable-next-line no-new-func
      const runner = new Function(
        "textLayers",
        "fullOuterText",
        "fullInnerText",
        scriptCode
      );

      const result = runner(data.layers, data.fullOuterText, data.fullInnerText);
      const formattedResult = typeof result === "object" ? JSON.stringify(result, null, 2) : String(result);

      setOutputResult(formattedResult);
      onProcessedResult(formattedResult);
    } catch (err: any) {
      setExecutionError(`Script Fehler: ${err?.message || err}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div id="script-executor-widget" className="w-full bg-[#060812] border border-[#00f0ff]/40 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] font-mono">
      {/* Header */}
      <div className="bg-[#0b0f19] border-b border-[#00f0ff]/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff]">
            <Terminal className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00f0ff] tracking-wider uppercase">
              JAVASCRIPT / TYPESCRIPT TEXT_LAYER PROZESSOR ENGINE
            </h3>
            <p className="text-[11px] text-slate-400">
              Führen Sie benutzerdefiniertes Skript auf extrahiertem outerText & innerText aus
            </p>
          </div>
        </div>

        <button
          onClick={handleRunScript}
          disabled={!data || isExecuting}
          className="px-5 py-2 bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-black" />}
          <span>SCRIPT AUSFÜHREN</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Template Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {DEFAULT_SCRIPT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                selectedTemplateId === tmpl.id
                  ? "bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "bg-[#121829] border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <span className="font-bold block truncate">{tmpl.name}</span>
              <span className="text-[10px] text-slate-400 line-clamp-1">{tmpl.description}</span>
            </button>
          ))}
        </div>

        {/* Code Editor */}
        <div className="bg-[#121829] border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-[#00f0ff]">
              <Code className="w-3.5 h-3.5" />
              Skript-Code Editor (JavaScript/TypeScript Snippet)
            </span>
            <span className="text-[10px]">Verfügbare Variablen: <code>textLayers</code>, <code>fullOuterText</code>, <code>fullInnerText</code></span>
          </div>

          <textarea
            value={scriptCode}
            onChange={(e) => setScriptCode(e.target.value)}
            rows={7}
            className="w-full bg-[#060812] border border-slate-800 rounded-lg p-3 text-xs text-[#00ff66] font-mono focus:outline-none focus:border-[#00f0ff] leading-relaxed"
            placeholder="// Schreiben Sie hier Ihr Skript..."
          />
        </div>

        {/* Error Message if any */}
        {executionError && (
          <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-300">
            {executionError}
          </div>
        )}

        {/* Output Area */}
        {outputResult && (
          <div className="bg-[#121829] border border-[#00ff66]/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-[#00ff66] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                VERARBEITETER CONTENT AUSGABE (Script Result)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(outputResult);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-[#00ff66] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-[#00ff66]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Kopiert!" : "Kopieren"}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#060812] border border-slate-800 rounded-lg text-slate-200 text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
              {outputResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
