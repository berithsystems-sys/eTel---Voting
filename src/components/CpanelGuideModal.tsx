import React, { useState } from 'react';
import { Server, Copy, Check, X, ShieldCheck, Terminal, Download, FileCode } from 'lucide-react';

interface CpanelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CpanelGuideModal: React.FC<CpanelGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const serverJsWrapper = `// Entry point file for cPanel Phusion Passenger / hPanel Node App Launcher
// File: server.js or app.js
process.env.NODE_ENV = 'production';
require('./dist/server.cjs');`;

  const htaccessSnippet = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>`;

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">cPanel & hPanel Node.js Deployment Guide</h2>
              <p className="text-xs text-slate-500">Deploy this Node.js Express + React app on shared cPanel or Hostinger hPanel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4 text-xs">
          
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
            <div className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4 text-indigo-600" />
              Step 1: Build the Bundle
            </div>
            <p className="text-slate-600 leading-relaxed">
              Run <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border">npm run build</code> locally. This bundles both the React frontend into <code className="bg-white px-1.5 py-0.5 rounded font-mono">/dist</code> and compiles the Express Node.js server into a single CommonJS file: <code className="bg-white px-1.5 py-0.5 rounded font-mono">dist/server.cjs</code> using esbuild!
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Server className="w-4 h-4 text-indigo-600" />
              Step 2: Upload Files to cPanel / hPanel
            </div>
            <p className="text-slate-600 leading-relaxed">
              In cPanel File Manager (or hPanel File Manager), create a folder for your app (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/election-runner</code>) and upload the built zip folder containing <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">package.json</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">dist/</code>, and <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <FileCode className="w-4 h-4 text-indigo-600" />
              Step 3: Configure "Setup Node.js App" in cPanel
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Open <strong>Setup Node.js App</strong> in cPanel (or <strong>Node.js Installer</strong> in Hostinger hPanel).</li>
              <li>Select <strong>Node.js Version</strong>: 18.x or 20.x</li>
              <li>Set <strong>Application Mode</strong>: Production</li>
              <li>Set <strong>Application Root</strong>: <code className="font-mono bg-slate-200 px-1 rounded">election-runner</code></li>
              <li>Set <strong>Application Startup File</strong>: <code className="font-mono bg-indigo-100 text-indigo-800 px-1 rounded font-bold">dist/server.cjs</code> or <code className="font-mono bg-indigo-100 text-indigo-800 px-1 rounded font-bold">server.js</code></li>
            </ul>

            <div className="pt-2">
              <div className="flex items-center justify-between text-slate-500 font-mono mb-1">
                <span>Optional cPanel server.js wrapper:</span>
                <button
                  onClick={() => handleCopyScript(serverJsWrapper)}
                  className="flex items-center gap-1 text-indigo-600 hover:underline font-sans font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedScript ? 'Copied!' : 'Copy snippet'}
                </button>
              </div>
              <pre className="bg-slate-900 text-indigo-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                {serverJsWrapper}
              </pre>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-emerald-900">
            <div className="font-bold flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Step 4: Click "Run NPM Install" & "Restart Application"
            </div>
            <p className="text-[11px] text-emerald-700">
              cPanel will install production dependencies and bind Phusion Passenger. Your modern Election Runner portal will be live on your custom domain!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Got It! Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
