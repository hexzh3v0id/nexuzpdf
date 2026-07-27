export interface TextLayerItem {
  id: number;
  tagName: string;
  className: string;
  elementId: string;
  outerText: string;
  innerText: string;
  outerHTML: string;
  innerHTML: string;
  wordCount: number;
  charCount: number;
  attributes?: Record<string, string>;
}

export interface FetchPageResponse {
  success: boolean;
  url: string;
  hostname?: string;
  isPreset?: boolean;
  title?: string;
  responseTimeMs: number;
  selectorUsed: string;
  fallbackUsed?: boolean;
  layersCount: number;
  layers: TextLayerItem[];
  fullOuterText: string;
  fullInnerText: string;
  proxyHtml?: string;
  rawHtml?: string;
  error?: string;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  layersCount: number;
  responseTimeMs: number;
}
