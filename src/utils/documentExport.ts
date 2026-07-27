import { FetchPageResponse } from "../types";

export function generateCombinedDocumentHtml(data: FetchPageResponse): string {
  const timestamp = new Date().toLocaleString("de-DE");
  const rawHtml = data.rawHtml || data.proxyHtml || "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Extrahierter Content & HTML Sourcecode - ${data.title || "Website"}</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #121829;
      --neon-blue: #00f0ff;
      --neon-pink: #ff007f;
      --neon-green: #00ff66;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, monospace;
      line-height: 1.6;
      margin: 0;
      padding: 30px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-card {
      background: var(--card-bg);
      border: 1px solid var(--neon-blue);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    h1 {
      color: var(--neon-blue);
      margin-top: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 16px;
      font-size: 14px;
    }
    .meta-item {
      background: rgba(0, 240, 255, 0.05);
      border: 1px border var(--neon-blue);
      padding: 12px;
      border-radius: 8px;
    }
    .meta-label {
      color: var(--text-muted);
      font-size: 11px;
      text-transform: uppercase;
      display: block;
    }
    .meta-value {
      color: #fff;
      font-weight: bold;
      word-break: break-all;
    }
    .section-card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-top: 0;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pink-title { color: var(--neon-pink); border-bottom: 2px solid var(--neon-pink); padding-bottom: 8px; }
    .blue-title { color: var(--neon-blue); border-bottom: 2px solid var(--neon-blue); padding-bottom: 8px; }
    .green-title { color: var(--neon-green); border-bottom: 2px solid var(--neon-green); padding-bottom: 8px; }
    pre {
      background: #060812;
      color: var(--text);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      max-height: 500px;
      border: 1px solid #1e293b;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Meta Header Card -->
    <div class="header-card">
      <h1>NEON WEB ENGINE - EXPEDITION DOCUMENT</h1>
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Website URL</span>
          <span class="meta-value">${escapeHtml(data.url)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Titel / Name</span>
          <span class="meta-value">${escapeHtml(data.title || "Unbenannt")}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Selektor & Layer Knoten</span>
          <span class="meta-value">${escapeHtml(data.selectorUsed)} (${data.layersCount} Elemente)</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Erstellungsdatum</span>
          <span class="meta-value">${timestamp}</span>
        </div>
      </div>
    </div>

    <!-- Section 1: Extrahierter .text_layer innerText -->
    <div class="section-card">
      <h2 class="section-title blue-title">1. Extrahierter Content (.text_layer innerText)</h2>
      <pre>${escapeHtml(data.fullInnerText || "(Kein innerText vorhanden)")}</pre>
    </div>

    <!-- Section 2: Extrahierter .text_layer outerText -->
    <div class="section-card">
      <h2 class="section-title pink-title">2. Extrahierter Content (.text_layer outerText)</h2>
      <pre>${escapeHtml(data.fullOuterText || "(Kein outerText vorhanden)")}</pre>
    </div>

    <!-- Section 3: Gefetchter HTML Quellcode -->
    <div class="section-card">
      <h2 class="section-title green-title">3. Vollständiger Gefetchter HTML Sourcecode</h2>
      <pre>${escapeHtml(rawHtml || "(Kein Quellcode verfügbar)")}</pre>
    </div>
  </div>
</body>
</html>`;
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
