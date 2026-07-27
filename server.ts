import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import parse from "node-html-parser";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Predefined high-quality test presets for instant demoing & testing
const PRESET_DEMOS: Record<string, { title: string; html: string; url: string }> = {
  "pdf_viewer_demo": {
    title: "PDF.js Reader Document (Digital Paper)",
    url: "https://mozilla.github.io/pdf.js/web/viewer.html",
    html: `
      <div class="pdf-container">
        <div class="page" data-page-number="1">
          <div class="canvasWrapper"><canvas id="page1"></canvas></div>
          <div class="text_layer" id="page-1-textlayer">
            <span style="left: 45px; top: 32px; font-size: 22px;">NEON PROTOCOL v4.2 - CYBERNETIC ARCHITECTURE</span>
            <span style="left: 45px; top: 68px; font-size: 14px;">Author: Dr. Alex Vance | Quantum Neural Systems Lab</span>
            <span style="left: 45px; top: 100px; font-size: 12px;">Abstract: High-speed extraction of text_layer nodes enables instant machine learning indexing without full layout re-rendering.</span>
            <span style="left: 45px; top: 130px; font-size: 12px;">Keywords: outerText, innerText, DOM text_layer, real-time web engine parsing, neon UI.</span>
            <span style="left: 45px; top: 170px; font-size: 16px;">1. System Specifications</span>
            <span style="left: 45px; top: 195px; font-size: 12px;">The web engine temporarily streams raw HTML content, isolates class .text_layer, and processes innerText string vectors.</span>
            <span style="left: 45px; top: 220px; font-size: 12px;">Latency target: &lt; 150ms per DOM tree traversal. Memory consumption is minimized by garbage collecting transient nodes.</span>
          </div>
        </div>
        <div class="page" data-page-number="2">
          <div class="text_layer" id="page-2-textlayer">
            <span style="left: 45px; top: 32px; font-size: 18px;">2. Data Layer Extraction Mechanics</span>
            <span style="left: 45px; top: 60px; font-size: 12px;">Executing javascript transformations across stored outerText arrays yields structured analytical telemetry.</span>
            <span style="left: 45px; top: 85px; font-size: 12px;">Status: OPTIMAL. All neon glow vectors active on grid 0x9F.</span>
          </div>
        </div>
      </div>
    `
  },
  "cyber_news": {
    title: "CyberPulse Daily Tech Intelligence",
    url: "https://cyberpulse.tech/articles/ai-web-engines",
    html: `
      <article class="cyber-article">
        <header>
          <h1>Breakthrough in Real-Time Web Engine Text Layer Parsers</h1>
          <p class="subtitle">How modern neon web interfaces analyze complex web pages in milliseconds.</p>
        </header>
        <div class="text_layer main-text-layer">
          <p class="lead">In the fast-evolving landscape of futuristic web browsers, extracting clean text from .text_layer elements has become essential for AI summarization and text analysis.</p>
          <h2>Key Highlights:</h2>
          <ul>
            <li>Automatic detection of .text_layer, .textLayer, and custom text elements.</li>
            <li>Extraction of both innerText (rendered visual text) and outerText (complete outer string snapshot).</li>
            <li>Execution of custom TypeScript/JavaScript filter functions on the captured text payload.</li>
          </ul>
        </div>
      </article>
    `
  }
};

// API: Fetch website HTML & extract .text_layer content
app.post("/api/fetch-page", async (req, res) => {
  const startTime = Date.now();
  try {
    let { url, selector = ".text_layer" } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Ungültige oder fehlende URL-Adresse." });
    }

    url = url.trim();

    // Check if user requested a preset key
    if (PRESET_DEMOS[url]) {
      const preset = PRESET_DEMOS[url];
      const root = parse(preset.html);
      let matchedElements = root.querySelectorAll(selector);

      if (matchedElements.length === 0) {
        matchedElements = root.querySelectorAll(".text_layer, .textLayer, [class*='text_layer'], [class*='textLayer'], article, p");
      }

      const layers = matchedElements.map((el, idx) => {
        const rawHtml = el.outerHTML;
        const innerHtml = el.innerHTML;
        const textContent = el.textContent || "";
        const cleanText = textContent.replace(/\s+/g, " ").trim();

        return {
          id: idx + 1,
          tagName: el.tagName.toLowerCase(),
          className: el.getAttribute("class") || "",
          elementId: el.getAttribute("id") || `layer-${idx + 1}`,
          outerText: cleanText,
          innerText: cleanText,
          outerHTML: rawHtml,
          innerHTML: innerHtml,
          wordCount: cleanText ? cleanText.split(/\s+/).length : 0,
          charCount: cleanText.length,
          attributes: el.attributes
        };
      });

      const fullOuterText = layers.map(l => l.outerText).join("\n\n");
      const fullInnerText = layers.map(l => l.innerText).join("\n\n");

      return res.json({
        success: true,
        url: preset.url,
        isPreset: true,
        title: preset.title,
        responseTimeMs: Date.now() - startTime,
        selectorUsed: selector,
        layersCount: layers.length,
        layers,
        fullOuterText,
        fullInnerText,
        rawHtml: preset.html,
        proxyHtml: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { background: #0b0f19; color: #00f0ff; font-family: monospace; padding: 24px; }
                .text_layer { border: 1px dashed #00f0ff; padding: 12px; margin-bottom: 16px; background: rgba(0, 240, 255, 0.05); box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); }
                span { display: block; margin-bottom: 4px; color: #e2e8f0; }
                h1, h2 { color: #ff007f; text-shadow: 0 0 10px rgba(255,0,127,0.5); }
              </style>
            </head>
            <body>
              ${preset.html}
            </body>
          </html>
        `
      });
    }

    // Standardize URL protocol
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    // Validate URL object
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: "Format der URL ist ungültig. Bitte Z.B. 'https://example.com' angeben." });
    }

    // Perform HTTP Fetch
    const response = await fetch(parsedUrl.href, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 NeonWebEngine/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache"
      },
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Fehler beim Laden der Website: HTTP Status ${response.status} ${response.statusText}`
      });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml") && !contentType.includes("text/plain") && !contentType.includes("xml")) {
      return res.status(400).json({
        error: `Die angegebene URL liefert keinen HTML-Content (${contentType}). Es werden HTML-Seiten mit .text_layer Elementen erwartet.`
      });
    }

    const htmlText = await response.text();
    const root = parse(htmlText);

    // Get Title
    const titleEl = root.querySelector("title");
    const pageTitle = titleEl ? titleEl.textContent.trim() : parsedUrl.hostname;

    // Search for target selector
    let matchedElements = root.querySelectorAll(selector);
    let fallbackUsed = false;

    // If target selector (e.g. .text_layer) was not found directly, try fallback text containers
    if (matchedElements.length === 0) {
      const fallbacks = [
        ".text_layer",
        ".textLayer",
        "[class*='text_layer']",
        "[class*='textLayer']",
        ".pdf-page",
        ".page",
        "article",
        "main",
        ".content",
        "#content",
        "p"
      ];
      for (const fb of fallbacks) {
        const found = root.querySelectorAll(fb);
        if (found.length > 0) {
          matchedElements = found;
          fallbackUsed = true;
          selector = `${selector} (Fallback: '${fb}')`;
          break;
        }
      }
    }

    // Extract detailed node information
    const layers = matchedElements.slice(0, 100).map((el, idx) => {
      const rawHtml = el.outerHTML;
      const innerHtml = el.innerHTML;
      const textContent = el.textContent || "";
      const cleanText = textContent.replace(/\s+/g, " ").trim();

      return {
        id: idx + 1,
        tagName: el.tagName.toLowerCase(),
        className: el.getAttribute("class") || "",
        elementId: el.getAttribute("id") || `layer-${idx + 1}`,
        outerText: cleanText,
        innerText: cleanText,
        outerHTML: rawHtml.length > 5000 ? rawHtml.substring(0, 5000) + "..." : rawHtml,
        innerHTML: innerHtml.length > 5000 ? innerHtml.substring(0, 5000) + "..." : innerHtml,
        wordCount: cleanText ? cleanText.split(/\s+/).length : 0,
        charCount: cleanText.length,
        attributes: el.attributes
      };
    });

    const fullOuterText = layers.map(l => l.outerText).filter(Boolean).join("\n\n");
    const fullInnerText = layers.map(l => l.innerText).filter(Boolean).join("\n\n");

    // Clean HTML for Web View Proxy Rendering (inject base tag and neon highlight overlay style)
    let proxyHtml = htmlText;
    const baseTag = `<base href="${parsedUrl.origin}/" target="_blank">`;
    const neonOverlayStyle = `
      <style id="neon-webengine-style">
        .text_layer, .textLayer, [class*="text_layer"], [class*="textLayer"] {
          outline: 2px dashed #00f0ff !important;
          box-shadow: 0 0 12px rgba(0, 240, 255, 0.4) !important;
          background-color: rgba(0, 240, 255, 0.06) !important;
          transition: all 0.2s ease !important;
        }
        .text_layer:hover, .textLayer:hover {
          outline: 2px solid #ff007f !important;
          box-shadow: 0 0 20px rgba(255, 0, 127, 0.6) !important;
          background-color: rgba(255, 0, 127, 0.12) !important;
        }
      </style>
    `;

    if (proxyHtml.includes("<head>")) {
      proxyHtml = proxyHtml.replace("<head>", `<head>${baseTag}${neonOverlayStyle}`);
    } else {
      proxyHtml = `${baseTag}${neonOverlayStyle}${proxyHtml}`;
    }

    return res.json({
      success: true,
      url: parsedUrl.href,
      hostname: parsedUrl.hostname,
      title: pageTitle,
      responseTimeMs: Date.now() - startTime,
      selectorUsed: selector,
      fallbackUsed,
      layersCount: layers.length,
      layers,
      fullOuterText: fullOuterText || "(Kein erkennbarer Text in den gefundenen Knoten vorhanden)",
      fullInnerText: fullInnerText || "(Kein erkennbarer Text in den gefundenen Knoten vorhanden)",
      rawHtml: htmlText,
      proxyHtml
    });

  } catch (err: any) {
    console.error("Error in /api/fetch-page:", err);
    return res.status(500).json({
      error: `Fehler beim Herstellen der Verbindung oder Parsen der Website: ${err?.message || err}`
    });
  }
});

// API: Gemini AI Text Layer Processing & Insights
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { prompt, textContent, taskType = "summary" } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY ist in der Umgebung nicht hinterlegt."
      });
    }

    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({
        error: "Kein Textgehalt (.text_layer Content) zur Analyse übergeben."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    let systemInstruction = "Du bist die K.I.-Einheit des Neon Web Engines. Analysiere den extrahierten .text_layer HTML-Content präzise, strukturiert und auf Deutsch.";
    if (taskType === "extract_json") {
      systemInstruction += " Extrahiere alle wichtigen Schlüsseldaten (Titel, Daten, Entitäten, Metriken) im validen JSON-Format.";
    }

    const userQuery = prompt || `Analysiere den folgenden extrahierten .text_layer Content und erstelle eine prägnante Zusammenfassung mit Key-Facts, Struktur und relevanten Erkenntnissen:\n\n${textContent.substring(0, 15000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userQuery,
      config: {
        systemInstruction
      }
    });

    return res.json({
      success: true,
      result: response.text
    });

  } catch (err: any) {
    console.error("Error in /api/gemini/analyze:", err);
    return res.status(500).json({
      error: `Gemini AI Analysefehler: ${err?.message || err}`
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Neon Engine Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
