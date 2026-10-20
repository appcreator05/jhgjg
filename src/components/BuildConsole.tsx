import React from 'react';
import { Terminal, Download, ExternalLink, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { BuildStatus, BuildConclusion } from '../types';

interface BuildConsoleProps {
  status: BuildStatus;
  conclusion: BuildConclusion;
  appName: string;
  statusText: string;
  logs: string[];
  htmlUrl?: string;
  downloadUrl?: string;
  onClear: () => void;
  onSimulateFallback?: () => void;
  onNavigateToSource?: () => void;
}

export const BuildConsole: React.FC<BuildConsoleProps> = ({
  status,
  conclusion,
  appName,
  statusText,
  logs,
  htmlUrl,
  downloadUrl,
  onClear,
  onSimulateFallback,
  onNavigateToSource,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (status === 'idle') return null;

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = conclusion === 'success';
  const isFailed = status === 'error' || conclusion === 'failure' || conclusion === 'cancelled';
  const isRunning = status === 'triggering' || status === 'queued' || status === 'in_progress';
  const hasGradleError = logs.some((l) =>
    l.toLowerCase().includes('gradle') || l.toLowerCase().includes('not contain a gradle build')
  ) || statusText.toLowerCase().includes('gradle');

  return (
    <div
      id="resultBox"
      className="mt-6 p-5 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-xl transition-all"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {isRunning && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {isFailed && <XCircle className="w-4 h-4 text-rose-400" />}
          <h3 className="text-sm font-semibold text-emerald-400">
            Build Status:
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyLogs}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-1 transition"
            title="Copy logs"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>
          {!isRunning && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-950 border border-slate-800 transition"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Primary Status Banner */}
      <div
        className={`p-3.5 rounded-xl border mb-3 text-xs leading-relaxed ${
          isSuccess
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : isFailed
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            : 'bg-slate-950/70 border-emerald-500/20 text-slate-200'
        }`}
        dangerouslySetInnerHTML={{ __html: statusText }}
      />

      {/* Gradle missing files error helper */}
      {isFailed && (
        <div className="mb-3 p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-xs space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">
                Root Cause & Solution for "Directory does not contain a Gradle build":
              </p>
              <p className="text-slate-300 mt-1">
                The GitHub Actions runner failed because the repository only contained the HTML file and was missing Gradle root files (<code className="text-emerald-400">settings.gradle</code>, <code className="text-emerald-400">build.gradle</code>, and <code className="text-emerald-400">app/</code>).
              </p>
              <p className="text-slate-300 mt-1">
                We generated all required Android template files and updated <code className="text-emerald-400">.github/workflows/build.yml</code> to auto-generate the complete Android WebView project.
              </p>
            </div>
          </div>
          {onNavigateToSource && (
            <button
              type="button"
              onClick={onNavigateToSource}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition"
            >
              Inspect & Download Android Project Files →
            </button>
          )}
        </div>
      )}

      {/* Suggested action if GitHub dispatch failed (e.g. Bad credentials on expired repo token) */}
      {isFailed && onSimulateFallback && (
        <div className="mb-3 p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>You can also test the full compilation immediately in Studio Engine Simulation.</span>
          </div>
          <button
            type="button"
            onClick={onSimulateFallback}
            className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 rounded-lg text-xs font-medium transition self-start sm:self-auto"
          >
            Run Studio Pipeline Simulation
          </button>
        </div>
      )}

      {/* Log Output Console */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-slate-500" /> Pipeline Console Stream:
          </span>
          <span className="font-mono text-[10px] text-slate-500">{logs.length} events</span>
        </div>
        <pre
          id="outputJson"
          className="text-xs text-slate-300 font-mono overflow-x-auto p-3 bg-slate-950 rounded-xl border border-slate-800 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed shadow-inner"
        >
          {logs.join('\n')}
        </pre>
      </div>

      {/* Download Button on Success */}
      {isSuccess && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3">
          {downloadUrl ? (
            <a
              id="downloadBtn"
              href={downloadUrl}
              download={`${appName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'app'}-release.apk`}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Direct APK (.apk)</span>
            </a>
          ) : null}

          {htmlUrl && (
            <a
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-medium px-4 py-2 rounded-lg shadow text-xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>GitHub Actions Run & Artifacts</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
