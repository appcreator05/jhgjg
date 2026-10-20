import React, { useState } from 'react';
import { Globe, Smartphone, ShieldCheck, Wifi, Battery, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { BuildConfig } from '../types';

interface DevicePreviewProps {
  config: BuildConfig;
}

export const DevicePreview: React.FC<DevicePreviewProps> = ({ config }) => {
  const [viewMode, setViewMode] = useState<'app' | 'home'>('app');
  const [iframeError, setIframeError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fallbackIcon = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80';
  const displayIcon = config.appIcon?.trim() ? config.appIcon : fallbackIcon;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-700">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Device Emulator Preview
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time Android APK Shell visualization
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('app')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              viewMode === 'app'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WebView
          </button>
          <button
            type="button"
            onClick={() => setViewMode('home')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              viewMode === 'home'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Launcher
          </button>
        </div>
      </div>

      {/* Phone Shell */}
      <div className="relative w-[280px] sm:w-[310px] h-[550px] bg-slate-950 rounded-[40px] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col ring-1 ring-emerald-500/20">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>

        {/* Status Bar */}
        <div className="w-full h-8 pt-2 px-5 flex items-center justify-between text-[10px] text-slate-400 z-20 select-none bg-slate-900/60">
          <span className="font-semibold text-slate-300">12:30</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-slate-300" />
            <span className="text-[9px] font-bold">5G</span>
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'app' ? (
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* Native Android Action Bar */}
            <div className="bg-slate-800/90 border-b border-slate-700 px-3 py-2 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={displayIcon}
                  alt="App Icon"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackIcon;
                  }}
                  className="w-5 h-5 rounded-md object-cover border border-slate-600 flex-shrink-0"
                />
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {config.appName || 'My Android App'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRefreshKey((k) => k + 1);
                  setIframeError(false);
                }}
                title="Reload WebView"
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* WebView Container */}
            <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-3 text-center">
              {config.appUrl ? (
                <>
                  {!iframeError ? (
                    <iframe
                      key={refreshKey}
                      src={config.appUrl}
                      title="Webview"
                      className="w-full h-full border-0 rounded bg-white"
                      onError={() => setIframeError(true)}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  ) : (
                    <div className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-xs">
                      <Globe className="w-8 h-8 text-emerald-400 mx-auto" />
                      <div>
                        <p className="text-xs font-medium text-slate-200 truncate">
                          {config.appUrl}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Site blocks iframe embedding via X-Frame-Options, but will render natively inside Android WebView!
                        </p>
                      </div>
                      <a
                        href={config.appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                      >
                        Visit Target Site <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Globe className="w-8 h-8 text-slate-600" />
                  <span>Enter a Target Website URL to load WebView</span>
                </div>
              )}
            </div>

            {/* Android Navigation Bar */}
            <div className="h-7 bg-slate-950 flex items-center justify-center gap-8 border-t border-slate-900">
              <div className="w-3 h-3 border-l-2 border-b-2 border-slate-500 rotate-45 -mr-1" />
              <div className="w-3 h-3 rounded-full border border-slate-500" />
              <div className="w-3 h-3 rounded-sm border border-slate-500" />
            </div>
          </div>
        ) : (
          /* Android Launcher / Home Screen View */
          <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 flex flex-col justify-between">
            {/* Clock Widget */}
            <div className="mt-6 text-center">
              <div className="text-3xl font-light text-slate-100 tracking-tight">12:30</div>
              <div className="text-[11px] text-emerald-400">Tuesday, October 20</div>
            </div>

            {/* App Grid with our target app */}
            <div className="grid grid-cols-3 gap-4 my-auto px-2">
              {/* Target App Icon */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-md">
                <div className="relative">
                  <img
                    src={displayIcon}
                    alt={config.appName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackIcon;
                    }}
                    className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-emerald-400/40"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[7px] font-bold text-slate-950">
                    ✓
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-100 text-center truncate w-full">
                  {config.appName || 'My App'}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">v1.0.0</span>
              </div>

              {/* Mock System Apps */}
              <div className="flex flex-col items-center gap-1.5 p-2 opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-lg">
                  🌐
                </div>
                <span className="text-[11px] text-slate-400 truncate w-full text-center">Chrome</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 p-2 opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-lg">
                  📁
                </div>
                <span className="text-[11px] text-slate-400 truncate w-full text-center">Files</span>
              </div>
            </div>

            {/* Bottom Dock */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex justify-around items-center">
              <span className="text-sm">📞</span>
              <span className="text-sm">💬</span>
              <span className="text-sm">📷</span>
              <span className="text-sm">⚙️</span>
            </div>
          </div>
        )}
      </div>

      {/* Package Identifier footer */}
      <div className="w-full mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-mono text-emerald-400 truncate max-w-[200px]">
          {config.packageName || 'com.example.app'}
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SDK 36 (Android 14/15)
        </span>
      </div>
    </div>
  );
};
