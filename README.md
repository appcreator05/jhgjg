# APK Creator Studio

A modern React application for packaging web applications into native Android APKs using GitHub Actions and modern Android SDK / Gradle toolchains.

## Features

- **Web to APK Configuration**: Configure Application Name, Package Name (reverse domain App ID), Target Website URL, and App Icon.
- **Real-Time Device Emulator**: Live interactive Android mobile device preview with WebView testing, native action bar, and launcher icon visualization.
- **GitHub Actions Integration**: Direct workflow dispatch to `.github/workflows/build.yml` with real-time polling of build runs, statuses (`queued`, `in_progress`, `completed`), and artifact releases.
- **Studio Engine Simulation Mode**: In-browser simulation of the Gradle 9.3 and Android SDK 36 compilation lifecycle with simulated APK generation for instant testing without token invalidation.
- **Build Activity Log & History**: Local persistence of build attempts, logs, direct APK downloads, and GitHub Actions workflow links.
- **Configurable Repository & Auth**: Custom GitHub repository owner, repo, branch, and personal access token (PAT) options with instant connection diagnostics.

## Tech Stack

- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Android Target**: Android SDK 36, Gradle 9.3, JDK 17

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to launch the APK Creator Studio dashboard.