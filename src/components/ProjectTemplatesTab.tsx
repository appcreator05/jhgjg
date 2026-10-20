import React, { useState } from 'react';
import { FileCode, Copy, Check, FolderTree, AlertCircle, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { BuildConfig } from '../types';
import { WORKFLOW_YML_CONTENT } from '../workflowContent';

interface ProjectTemplatesTabProps {
  config: BuildConfig;
}

export const ProjectTemplatesTab: React.FC<ProjectTemplatesTabProps> = ({ config }) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('workflow');

  const pkg = config.packageName || 'com.example.app';
  const appName = config.appName || 'My App';
  const url = config.appUrl || 'https://example.com';

  const files: Record<string, { path: string; language: string; content: string; desc: string }> = {
    workflow: {
      path: '.github/workflows/build.yml',
      language: 'yaml',
      desc: '100% self-contained GitHub Actions CI/CD workflow that dynamically generates the full Android Gradle project, Java code, and self-signed keystore before building APK.',
      content: WORKFLOW_YML_CONTENT,
    },
    settings: {
      path: 'settings.gradle',
      language: 'groovy',
      desc: 'Gradle settings file declaring repository management and module inclusion.',
      content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "WebToApk"
include ':app'`,
    },
    buildRoot: {
      path: 'build.gradle',
      language: 'groovy',
      desc: 'Root-level build configuration declaring Android Gradle Plugin version.',
      content: `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.3.2'
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`,
    },
    appBuild: {
      path: 'app/build.gradle',
      language: 'groovy',
      desc: 'Android application module configuration with namespace, SDK levels, and WebView dependencies.',
      content: `plugins {
    id 'com.android.application'
}

android {
    namespace '${pkg}'
    compileSdk 34

    defaultConfig {
        applicationId "${pkg}"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        debug {}
        release {
            storeFile file("release.keystore")
            storePassword "android"
            keyAlias "androidkey"
            keyPassword "android"
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            signingConfig signingConfigs.debug
        }
        debug {
            signingConfig signingConfigs.debug
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
}`,
    },
    manifest: {
      path: 'app/src/main/AndroidManifest.xml',
      language: 'xml',
      desc: 'Android permissions (Internet, Network State, Geolocation) and Launcher Activity.',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.WebToApk"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`,
    },
    mainActivity: {
      path: `app/src/main/java/${pkg.replace(/\./g, '/')}/MainActivity.java`,
      language: 'java',
      desc: 'Full-featured native Android WebView with JavaScript, DOM storage, back navigation, progress indicator, and error recovery.',
      content: `package ${pkg};

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ProgressBar progressBar;
    private SwipeRefreshLayout swipeRefreshLayout;
    private LinearLayout errorLayout;
    private Button retryButton;
    private String targetUrl;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        targetUrl = getString(R.string.target_url);

        progressBar = findViewById(R.id.progressBar);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        errorLayout = findViewById(R.id.errorLayout);
        retryButton = findViewById(R.id.retryButton);
        webView = findViewById(R.id.webView);

        setupWebView();

        swipeRefreshLayout.setColorSchemeResources(R.color.accent, R.color.primary);
        swipeRefreshLayout.setOnRefreshListener(() -> webView.reload());

        retryButton.setOnClickListener(v -> {
            errorLayout.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(targetUrl);
        });

        webView.loadUrl(targetUrl);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                    swipeRefreshLayout.setRefreshing(false);
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return false;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                errorLayout.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    webView.setVisibility(View.GONE);
                    errorLayout.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`,
    },
  };

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-6 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl backdrop-blur-md space-y-6">
      {/* Solution Banner for Gradle Build Failure */}
      <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-semibold text-emerald-300">
            Fix Applied: Android Gradle Project Structure & Workflow
          </h4>
          <p className="text-slate-300 leading-relaxed">
            The error <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300 font-mono">Directory does not contain a Gradle build</code> happened because GitHub Actions ran in a repository that only had an HTML file and no Android root project files.
          </p>
          <p className="text-slate-300 leading-relaxed">
            We added all 6 required Android project template files (<code className="text-emerald-400">settings.gradle</code>, <code className="text-emerald-400">build.gradle</code>, <code className="text-emerald-400">app/build.gradle</code>, <code className="text-emerald-400">MainActivity.java</code>, <code className="text-emerald-400">AndroidManifest.xml</code>) and made <code className="text-emerald-400">.github/workflows/build.yml</code> auto-configure the project dynamically on every dispatch.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-emerald-400" />
            Android Project Architecture & Source Files
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect or download the generated source code for Android Studio or GitHub
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* File Navigator */}
        <div className="md:col-span-4 space-y-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
            Project Files
          </div>
          {Object.entries(files).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedFile(key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                selectedFile === key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="truncate">{item.path}</span>
              <span className="text-[10px] uppercase opacity-75">{item.language}</span>
            </button>
          ))}
        </div>

        {/* File Viewer */}
        <div className="md:col-span-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-medium text-emerald-400">
                {files[selectedFile].path}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {files[selectedFile].desc}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(selectedFile, files[selectedFile].content)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700 transition"
              >
                {copiedFile === selectedFile ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDownloadFile(files[selectedFile].path, files[selectedFile].content)
                }
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[420px] overflow-y-auto leading-relaxed bg-slate-950">
            {files[selectedFile].content}
          </pre>
        </div>
      </div>
    </div>
  );
};
