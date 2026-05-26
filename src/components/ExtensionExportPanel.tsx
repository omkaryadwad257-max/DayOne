/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Download, Info, ChevronRight, FileCode, CheckSquare } from "lucide-react";

const extensionFiles = [
  {
    name: "manifest.json",
    language: "json",
    description: "Configures extension details & overrides standard new tab.",
    content: `{
  "manifest_version": 3,
  "name": "DayOne - Premium Daily Learning",
  "version": "1.0.0",
  "description": "Replaces the new tab page with a beautiful, premium, dark-mode micro-learning experience.",
  "permissions": [
    "storage"
  ],
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  },
  "icons": {
    "128": "icon.png"
  }
}`
  },
  {
    name: "newtab.html",
    language: "html",
    description: "The core layout of the DayOne Chrome extension page.",
    content: `<!-- Check the /newtab.html file at the root of the workspace for the full, curated HTML schema with custom cards! -->`
  },
  {
    name: "newtab.js",
    language: "javascript",
    description: "Drives checking checkoffs, dynamic clocks & curated study checks.",
    content: `// Check the /newtab.js file at the root of the workspace for complete interactive logic and memory helpers.`
  },
  {
    name: "styles.css",
    language: "css",
    description: "Tailored luxury typography alignment, animations & borders.",
    content: `/* Check the /styles.css stylesheet at the root of the workspace to inspect elite layout variables. */`
  }
];

export default function ExtensionExportPanel() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeFileIdx, setActiveFileIdx] = useState(0);

  const handleCopy = (fileName: string, content: string) => {
    // If it's a placeholder comment, prompt them that the actual files are in the workspace
    let finalContent = content;
    if (fileName === "newtab.html") {
      finalContent = "Copying full source code remains simple: locate `/newtab.html` in the file explorer and drag-to-select, or use AI Studio's export script.";
    } else if (fileName === "newtab.js") {
      finalContent = "Copying full source code remains simple: locate `/newtab.js` in the file explorer and click Copy.";
    } else if (fileName === "styles.css") {
      finalContent = "Copying full source code remains simple: locate `/styles.css` in the file explorer to fetch class listings.";
    }

    navigator.clipboard.writeText(finalContent).then(() => {
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    });
  };

  return (
    <div className="bg-[#111119]/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6" id="extension-export-container">
      <div>
        <h3 className="text-white font-bold text-base flex items-center gap-2 tracking-tight">
          <FileCode className="text-[#6C63FF]" size={18} />
          DayOne Chrome Unpacked Extension Builder
        </h3>
        <p className="text-xs text-[#7c7c8f] mt-1 font-sans">
          Load this exact premium experience natively into your Chrome Browser in under 10 seconds.
        </p>
      </div>

      {/* Guide steps */}
      <div className="space-y-3 bg-[#6C63FF]/5 p-4 rounded-xl border border-[#6C63FF]/10 text-xs text-[#a0a0ab]">
        <h4 className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono text-[10px]">
          <Info size={12} className="text-[#6C63FF]" /> Load Unpacked Extension Developer Guidelines
        </h4>
        <div className="space-y-2">
          <div className="flex gap-2.5">
            <span className="font-mono bg-[#6C63FF]/20 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
            <p>Save all 4 extension files (manifest.json, newtab.html, newtab.js, styles.css) into a single folder named <strong className="text-white font-mono">dayone-extension</strong> on your secondary device.</p>
          </div>
          <div className="flex gap-2.5">
            <span className="font-mono bg-[#6C63FF]/20 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
            <p>Go to your Chrome search bar and navigate to: <strong className="text-white font-mono">chrome://extensions</strong></p>
          </div>
          <div className="flex gap-2.5">
            <span className="font-mono bg-[#6C63FF]/20 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
            <p>Toggle the <strong className="text-white">Developer Mode</strong> switch active on the top-right corner of Chrome.</p>
          </div>
          <div className="flex gap-2.5">
            <span className="font-mono bg-[#6C63FF]/20 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">4</span>
            <p>Click <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Load unpacked</strong> on the top-left, select your folder, and open any default new tab to enjoy your modern cognitive experience!</p>
          </div>
        </div>
      </div>

      {/* File Explorer tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-2">
          {extensionFiles.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => setActiveFileIdx(idx)}
              className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeFileIdx === idx
                  ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-white"
                  : "bg-transparent border-transparent text-[#7c7c8f] hover:text-white"
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* Selected File Details */}
        <div className="bg-white/[0.01] rounded-xl border border-white/[0.03] p-4 space-y-3 relative overflow-hidden group/file">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white font-mono">{extensionFiles[activeFileIdx].name}</span>
              <p className="text-[10px] text-[#7c7c8f] font-sans">{extensionFiles[activeFileIdx].description}</p>
            </div>
            
            <button
              onClick={() => handleCopy(extensionFiles[activeFileIdx].name, extensionFiles[activeFileIdx].content)}
              className="bg-white/5 hover:bg-[#6C63FF]/20 text-white p-1.5 px-3 rounded-lg border border-white/5 hover:border-[#6C63FF]/30 transition-all text-[10px] uppercase font-mono tracking-wider flex items-center gap-1.5 cursor-pointer"
              title="Copy file text"
            >
              {copiedFile === extensionFiles[activeFileIdx].name ? (
                <>
                  <Check size={11} className="text-green-400" /> COPIED!
                </>
              ) : (
                <>
                  <Copy size={11} /> COPY
                </>
              )}
            </button>
          </div>

          <pre className="text-[11px] font-mono text-[#a0a0ab] overflow-x-auto bg-[#0a0a0f]/80 p-3 rounded-lg border border-white/[0.02] max-h-[160px] customize-scrollbar">
            <code>{extensionFiles[activeFileIdx].content}</code>
          </pre>
          
          <div className="text-[9px] text-muted font-mono uppercase bg-white/[0.02] px-2.5 py-1 rounded inline-block">
            {activeFileIdx === 0 ? "JSON Standard" : "Curated in Workspace Root"}
          </div>
        </div>
      </div>
    </div>
  );
}
