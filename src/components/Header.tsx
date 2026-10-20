import { Smartphone, Sparkles, Terminal, History, Settings, FolderCode } from 'lucide-react';

interface HeaderProps {
  activeTab: 'builder' | 'history' | 'source' | 'settings';
  setActiveTab: (tab: 'builder' | 'history' | 'source' | 'settings') => void;
  historyCount: number;
  isBuilding: boolean;
  repo: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  isBuilding,
  repo,
}) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 py-4 px-4 sm:px-6 shadow-md sticky top-0 z-40 backdrop-blur-md bg-slate-800/90">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shadow-inner">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-emerald-400 tracking-tight">
                APK Creator Studio
              </h1>
              <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GitHub Pages Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Web to Android APK Builder • Gradle 9 & SDK 36
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Studio</span>
            {isBuilding && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Builds</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('source')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'source'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FolderCode className="w-3.5 h-3.5" />
            <span>Android Project</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Repo Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
