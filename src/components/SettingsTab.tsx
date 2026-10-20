import React, { useState } from 'react';
import { Key, GitBranch, FileCode, CheckCircle, AlertTriangle, Shield, RefreshCw, UploadCloud, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { GithubSettings } from '../types';
import { DEFAULT_GITHUB_SETTINGS } from '../constants';
import { WORKFLOW_YML_CONTENT } from '../workflowContent';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

interface SettingsTabProps {
  settings: GithubSettings;
  setSettings: React.Dispatch<React.SetStateAction<GithubSettings>>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  setSettings,
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [showToken, setShowToken] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  const handleReset = () => {
    setSettings({ ...DEFAULT_GITHUB_SETTINGS });
    setTestStatus('idle');
    setTestMessage('');
    setSyncStatus('idle');
    setSyncMessage('');
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(WORKFLOW_YML_CONTENT);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2500);
  };

  const handlePushWorkflowToGithub = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Fetching existing workflow SHA from GitHub repository...');

    const filePath = `.github/workflows/${settings.workflowFile}`;
    const apiUrl = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${filePath}`;

    try {
      // 1. Get current SHA if it exists
      let sha: string | undefined;
      const getRes = await fetch(apiUrl + `?ref=${settings.branch || 'main'}`, {
        headers: {
          Authorization: `Bearer ${settings.token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }

      // 2. Commit updated workflow content via GitHub Contents API
      setSyncMessage('Committing self-healing Android Gradle workflow to GitHub...');
      const encodedContent = btoa(unescape(encodeURIComponent(WORKFLOW_YML_CONTENT)));

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${settings.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Fix: Auto-generate Android WebView project and Gradle wrapper in build.yml',
          content: encodedContent,
          sha: sha,
          branch: settings.branch || 'main',
        }),
      });

      if (putRes.ok) {
        setSyncStatus('success');
        setSyncMessage(`🎉 Success! Updated ${filePath} in ${settings.owner}/${settings.repo} on branch "${settings.branch}". GitHub Actions will now build successfully!`);
      } else {
        const err = await putRes.json().catch(() => ({}));
        setSyncStatus('error');
        setSyncMessage(`GitHub API rejected commit (${putRes.status}: ${err.message || putRes.statusText}). You can update it manually below via GitHub web editor!`);
      }
    } catch (e: any) {
      setSyncStatus('error');
      setSyncMessage(`Failed to push workflow: ${e.message}`);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Checking GitHub repository and workflow accessibility...');
    try {
      const res = await fetch(
        `https://api.github.com/repos/${settings.owner}/${settings.repo}/actions/workflows/${settings.workflowFile}`,
        {
          headers: settings.token
            ? {
                Authorization: `Bearer ${settings.token}`,
                Accept: 'application/vnd.github+json',
              }
            : {},
        }
      );

      if (res.ok) {
        const data = await res.json();
        setTestStatus('success');
        setTestMessage(`Connected! Found workflow: "${data.name}" in ${settings.owner}/${settings.repo}`);
      } else {
        const err = await res.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(
          `GitHub returned HTTP ${res.status}: ${err.message || res.statusText}. Tip: Token may need "workflow" or "repo" scope, or enable Simulation Mode below.`
        );
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Network error connecting to GitHub: ${e.message}`);
    }
  };

  const editGithubUrl = `https://github.com/${settings.owner}/${settings.repo}/edit/${settings.branch || 'main'}/.github/workflows/${settings.workflowFile}`;

  return (
    <div className="max-w-3xl mx-auto w-full p-6 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <GithubIcon className="w-5 h-5 text-emerald-400" />
            GitHub Repository & Pipeline Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure the remote GitHub Actions runner credentials and target workflow
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
        </button>
      </div>

      {/* GitHub Workflow Fix & Sync Card */}
      <div className="p-4 bg-slate-900/90 border border-emerald-500/40 rounded-xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-emerald-400 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Fix Remote GitHub Actions Runner
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                Recommended
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              GitHub Actions failed because your GitHub repo <span className="font-mono text-emerald-400">{settings.owner}/{settings.repo}</span> still had the old <code className="text-slate-300">build.yml</code> without Android project files. Push the new self-contained workflow directly to GitHub now!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            disabled={syncStatus === 'syncing'}
            onClick={handlePushWorkflowToGithub}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Pushing to GitHub...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>1-Click Push Fix to GitHub</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyWorkflow}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
          >
            {copiedWorkflow ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied build.yml!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Fixed build.yml</span>
              </>
            )}
          </button>

          <a
            href={editGithubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition flex items-center gap-1.5"
          >
            <span>Edit on GitHub.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {syncMessage && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
              syncStatus === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            }`}
          >
            {syncStatus === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span>{syncMessage}</span>
              {syncStatus === 'error' && (
                <div className="text-[11px] text-slate-300 pt-1">
                  👉 Tip: If the GitHub API rejected the push because of permissions, click <b>"Copy Fixed build.yml"</b> above, then open <b>"Edit on GitHub.com"</b>, paste the content, and click <b>Commit changes</b>.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Simulation mode switch */}
        <div className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-xl flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-emerald-400">
                Studio Engine Simulation Mode
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                Safe Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate full Gradle 9 and Android SDK 36 compilation steps in real-time and generate APK test packages without consuming GitHub API quotas or invalidating tokens.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={settings.useSimulation}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, useSimulation: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Repository Owner / User
            </label>
            <input
              type="text"
              value={settings.owner}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, owner: e.target.value.trim() }))
              }
              placeholder="e.g. appcreator05"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Repo */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Repository Name
            </label>
            <input
              type="text"
              value={settings.repo}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, repo: e.target.value.trim() }))
              }
              placeholder="e.g. jhgjg"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Workflow File */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              Workflow Filename
            </label>
            <input
              type="text"
              value={settings.workflowFile}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, workflowFile: e.target.value.trim() }))
              }
              placeholder="build.yml"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              Target Branch (Git Ref)
            </label>
            <input
              type="text"
              value={settings.branch}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, branch: e.target.value.trim() }))
              }
              placeholder="main"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* GitHub Personal Access Token */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              GitHub Personal Access Token (PAT)
            </label>
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              {showToken ? 'Hide' : 'Reveal'}
            </button>
          </div>
          <input
            type={showToken ? 'text' : 'password'}
            value={settings.token}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, token: e.target.value.trim() }))
            }
            placeholder="ghp_..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Requires repository <code className="text-emerald-400">actions:write</code> and <code className="text-emerald-400">workflow</code> permissions to dispatch workflow runs.
          </p>
        </div>

        {/* Test Connection Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            disabled={testStatus === 'testing'}
            onClick={handleTestConnection}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-emerald-400 text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {testStatus === 'testing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking API...</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5" />
                <span>Test GitHub API Authorization</span>
              </>
            )}
          </button>
        </div>

        {/* Test Message feedback */}
        {testMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              testStatus === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            {testStatus === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <span>{testMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
