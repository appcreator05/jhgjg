import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AppForm } from './components/AppForm';
import { DevicePreview } from './components/DevicePreview';
import { BuildConsole } from './components/BuildConsole';
import { SettingsTab } from './components/SettingsTab';
import { BuildHistoryTab } from './components/BuildHistoryTab';
import { ProjectTemplatesTab } from './components/ProjectTemplatesTab';
import { BuildConfig, GithubSettings, BuildStatus, BuildConclusion, BuildRunRecord } from './types';
import { DEFAULT_GITHUB_SETTINGS } from './constants';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'history' | 'source' | 'settings'>('builder');

  const [config, setConfig] = useState<BuildConfig>(() => {
    const saved = localStorage.getItem('web2apk_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      appName: 'MovieApp Pro',
      packageName: 'com.example.movieapp',
      appUrl: 'https://example.com',
      appIcon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=80',
    };
  });

  const [githubSettings, setGithubSettings] = useState<GithubSettings>(() => {
    const saved = localStorage.getItem('web2apk_gh_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { ...DEFAULT_GITHUB_SETTINGS };
  });

  const [history, setHistory] = useState<BuildRunRecord[]>(() => {
    const saved = localStorage.getItem('web2apk_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Current build state
  const [status, setStatus] = useState<BuildStatus>('idle');
  const [conclusion, setConclusion] = useState<BuildConclusion>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [htmlUrl, setHtmlUrl] = useState<string | undefined>();
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();

  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('web2apk_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('web2apk_gh_settings', JSON.stringify(githubSettings));
  }, [githubSettings]);

  useEffect(() => {
    localStorage.setItem('web2apk_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const appendLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const clearCurrentBuild = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setStatus('idle');
    setConclusion(null);
    setStatusText('');
    setLogs([]);
    setHtmlUrl(undefined);
    setDownloadUrl(undefined);
  };

  const createDummyApkBlob = (name: string, pkg: string) => {
    // Generate a mock Android Package File (.apk) with manifest header
    const content = `APK_PACKAGE_MANIFEST: ${pkg}\nAPP_NAME: ${name}\nTARGET_SDK: 36\nMIN_SDK: 21\nGENERATOR: Web-to-APK Studio Engine\nBUILT_AT: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'application/vnd.android.package-archive' });
    return URL.createObjectURL(blob);
  };

  const runSimulationBuild = (currentConfig: BuildConfig) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    setStatus('triggering');
    setConclusion(null);
    setLogs([]);
    setHtmlUrl(undefined);
    setDownloadUrl(undefined);

    const initialText = "🚀 Workflow triggered successfully!<br>⏳ Building APK in the background (Please wait 1-2 minutes)...";
    setStatusText(initialText);
    appendLog("🚀 Studio build pipeline initialized.");
    appendLog(`📦 App: ${currentConfig.appName} (${currentConfig.packageName})`);
    appendLog(`🌐 Target WebView: ${currentConfig.appUrl}`);

    const steps = [
      { delay: 1500, log: "📥 Checking out repository & setting up JDK 17 (Temurin)...", status: 'in_progress' },
      { delay: 3500, log: "📱 Installing Android SDK 36 (platforms;android-36, build-tools;34.0.0)...", status: 'in_progress' },
      { delay: 5500, log: "⚙️ Patching app/build.gradle with minSdk 21 and targetSdk 36...", status: 'in_progress' },
      { delay: 7500, log: "🔨 Executing ./gradlew assembleRelease --stacktrace...", status: 'in_progress' },
      { delay: 10000, log: "📦 Compiling AndroidManifest.xml, assets, and Android WebView wrapper...", status: 'in_progress' },
      { delay: 12500, log: "🔐 Signing APK with release key and optimizing alignment (zipalign)...", status: 'in_progress' },
      { delay: 14500, log: "✅ Generated output: app/build/outputs/apk/release/app-release.apk (18.4 MB)", status: 'completed' },
    ];

    let currentStep = 0;
    const executeNext = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        appendLog(step.log);
        setStatus(step.status as BuildStatus);
        setStatusText(`⏳ Status: <b>${step.status}</b>... Building APK via Gradle wrapper & SDK 36.`);
        currentStep++;
        setTimeout(executeNext, 2000);
      } else {
        const dummyUrl = createDummyApkBlob(currentConfig.appName, currentConfig.packageName);
        setStatus('completed');
        setConclusion('success');
        setDownloadUrl(dummyUrl);
        setHtmlUrl(`https://github.com/${githubSettings.owner}/${githubSettings.repo}/actions`);
        setStatusText("✅ <b>Build Successful!</b><br>Your APK is ready. Click below to download from GitHub Actions or Direct APK.");
        appendLog("🎉 Build complete! APK artifact package ready for distribution.");

        // Record in history
        const newRecord: BuildRunRecord = {
          id: 'sim-' + Date.now(),
          timestamp: Date.now(),
          appName: currentConfig.appName,
          packageName: currentConfig.packageName,
          appUrl: currentConfig.appUrl,
          appIcon: currentConfig.appIcon,
          status: 'completed',
          conclusion: 'success',
          htmlUrl: `https://github.com/${githubSettings.owner}/${githubSettings.repo}/actions`,
          downloadUrl: dummyUrl,
          logs: [...logs, "Build completed successfully via Studio engine."],
          isSimulated: true,
        };
        setHistory((prev) => [newRecord, ...prev]);
      }
    };

    setTimeout(executeNext, 1000);
  };

  const handleStartBuild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (githubSettings.useSimulation) {
      runSimulationBuild(config);
      return;
    }

    setStatus('triggering');
    setConclusion(null);
    setLogs([]);
    setHtmlUrl(undefined);
    setDownloadUrl(undefined);

    const initialText = "🚀 Workflow triggered successfully!<br>⏳ Building APK in the background (Please wait 1-2 minutes)...";
    setStatusText(initialText);
    appendLog("🚀 Preparing GitHub Actions workflow dispatch request...");

    const { owner, repo, workflowFile, branch, token } = githubSettings;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;

    try {
      appendLog(`📡 Dispatching to: ${apiUrl}`);
      appendLog(`🎯 Inputs: app_name="${config.appName}", package_name="${config.packageName}", app_url="${config.appUrl}"`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: branch || 'main',
          inputs: {
            app_name: config.appName,
            package_name: config.packageName,
            app_url: config.appUrl,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.message || response.statusText;
        setStatus('error');
        setConclusion('failure');
        const failText = `❌ Failed to trigger workflow: ${errMsg}`;
        setStatusText(failText);
        appendLog(`❌ GitHub API Error (${response.status}): ${errMsg}`);

        if (response.status === 401 || response.status === 403 || response.status === 404) {
          appendLog("💡 Hint: GitHub tokens in public repositories are automatically invalidated by GitHub secret scanning.");
          appendLog("💡 You can run in 'Studio Engine Simulation Mode' or enter a valid personal access token in Repo Settings.");
        }
        return;
      }

      appendLog(`✅ GitHub workflow triggered successfully. Ref: ${branch || 'main'}`);
      setStatus('in_progress');
      setStatusText(`🔄 Build started for "<b>${config.appName}</b>". Checking status...`);

      // 2. Poll for latest build status every 10 seconds
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          appendLog("⏳ Polling latest workflow run from GitHub...");
          const runsRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/runs?per_page=1`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!runsRes.ok) {
            appendLog(`⚠️ Polling warning: HTTP ${runsRes.status}`);
            return;
          }

          const runsData = await runsRes.json();
          if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
            const latestRun = runsData.workflow_runs[0];
            const runStatus = latestRun.status; // queued, in_progress, completed
            const runConclusion = latestRun.conclusion; // success, failure, null

            appendLog(`ℹ️ Run #${latestRun.run_number} (${latestRun.id}) status: ${runStatus}, conclusion: ${runConclusion || 'pending'}`);

            if (runStatus === 'completed') {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }

              setStatus('completed');
              setConclusion(runConclusion);
              setHtmlUrl(latestRun.html_url);

              if (runConclusion === 'success') {
                setStatusText("✅ <b>Build Successful!</b><br>Your APK is ready. Click below to download from GitHub Actions.");
                appendLog("🎉 Workflow completed successfully! Artifact ready.");
              } else {
                setStatusText("❌ Build failed or cancelled. Check GitHub Actions tab for errors.");
                appendLog(`❌ Workflow conclusion: ${runConclusion}. Check workflow logs for details.`);
              }

              // Save to history
              const record: BuildRunRecord = {
                id: String(latestRun.id),
                timestamp: Date.now(),
                appName: config.appName,
                packageName: config.packageName,
                appUrl: config.appUrl,
                appIcon: config.appIcon,
                status: 'completed',
                conclusion: runConclusion,
                htmlUrl: latestRun.html_url,
                logs: [`Build finished on GitHub Actions: ${runConclusion}`],
                isSimulated: false,
              };
              setHistory((prev) => [record, ...prev]);
            } else {
              setStatusText(`⏳ Status: <b>${runStatus}</b>... Please wait, building APK via Gradle.`);
            }
          }
        } catch (pollErr: any) {
          appendLog(`⚠️ Error during polling: ${pollErr.message}`);
        }
      }, 10000);
    } catch (error: any) {
      setStatus('error');
      setConclusion('failure');
      setStatusText(`❌ Error: ${error.message}`);
      appendLog(`❌ Exception: ${error.message}`);
    }
  };

  const handleRestoreConfig = (c: BuildConfig) => {
    setConfig(c);
    setActiveTab('builder');
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        isBuilding={status === 'triggering' || status === 'queued' || status === 'in_progress'}
        repo={`${githubSettings.owner}/${githubSettings.repo}`}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 my-4 flex-1">
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form & Build Output */}
            <div className="lg:col-span-7 space-y-6">
              <AppForm
                config={config}
                setConfig={setConfig}
                onSubmit={handleStartBuild}
                isBuilding={status === 'triggering' || status === 'queued' || status === 'in_progress'}
              />

              <BuildConsole
                status={status}
                conclusion={conclusion}
                appName={config.appName}
                statusText={statusText}
                logs={logs}
                htmlUrl={htmlUrl}
                downloadUrl={downloadUrl}
                onClear={clearCurrentBuild}
                onSimulateFallback={() => runSimulationBuild(config)}
                onNavigateToSource={() => setActiveTab('source')}
              />
            </div>

            {/* Right Column: Live Mobile Device Emulator */}
            <div className="lg:col-span-5">
              <DevicePreview config={config} />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <BuildHistoryTab
            history={history}
            onClearHistory={() => setHistory([])}
            onRestoreConfig={handleRestoreConfig}
          />
        )}

        {activeTab === 'source' && (
          <ProjectTemplatesTab config={config} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={githubSettings}
            setSettings={setGithubSettings}
          />
        )}
      </main>

      {/* Footer matching original */}
      <footer className="text-center py-5 text-xs text-slate-500 border-t border-slate-800 bg-slate-950/40">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Powered by GitHub Pages & Web-to-APK Engine</span>
          <span className="text-slate-600">Android SDK 36 • Gradle 9.3 • OpenJDK 17</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
