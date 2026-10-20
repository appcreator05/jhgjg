import React from 'react';
import { History, Download, ExternalLink, ArrowRight, Trash2, CheckCircle2, XCircle, Clock, Smartphone } from 'lucide-react';
import { BuildRunRecord, BuildConfig } from '../types';

interface BuildHistoryTabProps {
  history: BuildRunRecord[];
  onClearHistory: () => void;
  onRestoreConfig: (config: BuildConfig) => void;
}

export const BuildHistoryTab: React.FC<BuildHistoryTabProps> = ({
  history,
  onClearHistory,
  onRestoreConfig,
}) => {
  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto w-full p-12 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl backdrop-blur-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-500">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">
          No Build History Yet
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Generated APK builds and GitHub Actions runs will be logged here for quick download and inspection.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-6 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Build Activity Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Previous application builds, outputs, and release links
          </p>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 transition"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => {
          const isSuccess = item.conclusion === 'success';
          const isFailure = item.conclusion === 'failure' || item.status === 'error';
          const dateStr = new Date(item.timestamp).toLocaleString();

          return (
            <div
              key={item.id}
              className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                  {item.appIcon ? (
                    <img src={item.appIcon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-100">
                      {item.appName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {item.packageName}
                    </span>
                    {isSuccess && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Built APK
                      </span>
                    )}
                    {isFailure && (
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                    {item.isSimulated && (
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-medium">
                        Simulated
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                    <span className="truncate max-w-xs text-slate-300">
                      URL: {item.appUrl}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" /> {dateStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() =>
                    onRestoreConfig({
                      appName: item.appName,
                      packageName: item.packageName,
                      appUrl: item.appUrl,
                      appIcon: item.appIcon || '',
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                  title="Load parameters into editor"
                >
                  <span>Load Config</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    download={`${item.appName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'app'}-release.apk`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download APK</span>
                  </a>
                )}

                {item.htmlUrl && (
                  <a
                    href={item.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 transition"
                    title="View GitHub Actions Run"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
