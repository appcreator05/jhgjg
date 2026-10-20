import React from 'react';
import { Sparkles, Globe, Package, Type, Image as ImageIcon, Play, RefreshCw, Wand2, CheckCircle2 } from 'lucide-react';
import { BuildConfig } from '../types';
import { PRESET_APPS } from '../constants';

interface AppFormProps {
  config: BuildConfig;
  setConfig: React.Dispatch<React.SetStateAction<BuildConfig>>;
  onSubmit: (e: React.FormEvent) => void;
  isBuilding: boolean;
}

export const AppForm: React.FC<AppFormProps> = ({
  config,
  setConfig,
  onSubmit,
  isBuilding,
}) => {
  const handleChange = (field: keyof BuildConfig, value: string) => {
    setConfig((prev) => {
      const next = { ...prev, [field]: value };
      // If user is editing appName and package name is empty or default, suggest package name
      if (field === 'appName' && (!prev.packageName || prev.packageName.startsWith('com.example.'))) {
        const clean = value.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean) {
          next.packageName = `com.example.${clean}`;
        }
      }
      return next;
    });
  };

  const handleApplyPreset = (preset: typeof PRESET_APPS[0]) => {
    setConfig({ ...preset.config });
  };

  const generateRandomPackage = () => {
    const clean = config.appName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'myapp';
    handleChange('packageName', `com.appcreator.${clean}`);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-700 gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-200">
            Build Your Android Application
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure metadata, package identifier, and WebView target
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Presets:
          </span>
          {PRESET_APPS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form id="apkForm" onSubmit={onSubmit} className="space-y-4">
        {/* App Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="appName" className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-400" />
              Application Name
            </label>
            <span className="text-[11px] text-slate-500">Displayed on Android launcher</span>
          </div>
          <input
            type="text"
            id="appName"
            required
            value={config.appName}
            onChange={(e) => handleChange('appName', e.target.value)}
            placeholder="e.g. MovieApp Pro"
            disabled={isBuilding}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-60"
          />
        </div>

        {/* Package Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="packageName" className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-400" />
              Package Name (App ID)
            </label>
            <button
              type="button"
              onClick={generateRandomPackage}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" /> Auto Format
            </button>
          </div>
          <input
            type="text"
            id="packageName"
            required
            pattern="^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$"
            title="Standard reverse domain format: e.g. com.example.movieapp"
            value={config.packageName}
            onChange={(e) => handleChange('packageName', e.target.value)}
            placeholder="com.example.movieapp"
            disabled={isBuilding}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-60"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Must follow reverse domain format (e.g. <span className="font-mono text-slate-400">com.company.appname</span>)
          </p>
        </div>

        {/* Target Website URL */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="appUrl" className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              Target Website URL
            </label>
            <span className="text-[11px] text-slate-500">HTTPS recommended</span>
          </div>
          <input
            type="url"
            id="appUrl"
            required
            value={config.appUrl}
            onChange={(e) => handleChange('appUrl', e.target.value)}
            placeholder="https://yourwebsite.com"
            disabled={isBuilding}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-60"
          />
        </div>

        {/* App Icon Link */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="appIcon" className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              App Icon Image URL
            </label>
            <span className="text-[11px] text-slate-500">PNG or JPG, 512x512 px</span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              id="appIcon"
              value={config.appIcon}
              onChange={(e) => handleChange('appIcon', e.target.value)}
              placeholder="https://i.imgur.com/icon.png"
              disabled={isBuilding}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-60"
            />
            {config.appIcon && (
              <div className="w-10 h-10 rounded-lg border border-slate-700 overflow-hidden bg-slate-900 flex-shrink-0">
                <img
                  src={config.appIcon}
                  alt="Icon Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isBuilding}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-emerald-900/30 transition duration-200 flex items-center justify-center gap-2 mt-6 cursor-pointer"
        >
          {isBuilding ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Building APK Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Generate & Build APK</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
