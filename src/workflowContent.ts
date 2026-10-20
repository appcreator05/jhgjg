export const WORKFLOW_YML_CONTENT = `name: Build Web-to-APK

on:
  workflow_dispatch:
    inputs:
      app_name:
        description: 'Application Name'
        required: true
        default: 'My App'
      package_name:
        description: 'Package Name'
        required: true
        default: 'com.example.app'
      app_url:
        description: 'Target Website URL'
        required: true
        default: 'https://example.com'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        with:
          packages: 'platforms;android-34 build-tools;34.0.0 platform-tools cmdline-tools;latest'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3

      - name: Generate Android WebView Project
        run: |
          APP_NAME="\${{ github.event.inputs.app_name }}"
          PKG_NAME="\${{ github.event.inputs.package_name }}"
          APP_URL="\${{ github.event.inputs.app_url }}"

          echo "=========================================="
          echo "Generating Android project for: \$APP_NAME"
          echo "Package ID:                     \$PKG_NAME"
          echo "Target URL:                     \$APP_URL"
          echo "=========================================="

          # 1. Root settings.gradle
          cat << 'EOF' > settings.gradle
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "WebToApk"
include ':app'
EOF

          # 2. Root build.gradle
          cat << 'EOF' > build.gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.3.2'
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
EOF

          # 3. App directories
          mkdir -p app/src/main/res/values
          mkdir -p app/src/main/res/layout
          PKG_PATH=\$(echo "\$PKG_NAME" | tr '.' '/')
          mkdir -p "app/src/main/java/\$PKG_PATH"

          # 4. App build.gradle
          cat << EOF > app/build.gradle
plugins {
    id 'com.android.application'
}

android {
    namespace '\$PKG_NAME'
    compileSdk 34

    defaultConfig {
        applicationId "\$PKG_NAME"
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
            signingConfig signingConfigs.release
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
}
EOF

          # 5. AndroidManifest.xml
          cat << 'EOF' > app/src/main/AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
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
</manifest>
EOF

          # 6. Resources
          cat << EOF > app/src/main/res/values/strings.xml
<resources>
    <string name="app_name">\$APP_NAME</string>
    <string name="target_url">\$APP_URL</string>
    <string name="network_error_title">Connection Lost</string>
    <string name="network_error_msg">Please check your internet connection.</string>
    <string name="retry_btn">Retry</string>
</resources>
EOF

          cat << 'EOF' > app/src/main/res/values/colors.xml
<resources>
    <color name="primary">#059669</color>
    <color name="primary_dark">#047857</color>
    <color name="accent">#10b981</color>
    <color name="bg_dark">#0f172a</color>
</resources>
EOF

          cat << 'EOF' > app/src/main/res/values/styles.xml
<resources>
    <style name="Theme.WebToApk" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="colorAccent">@color/accent</item>
        <item name="android:statusBarColor">@color/primary_dark</item>
    </style>
</resources>
EOF

          cat << 'EOF' > app/src/main/res/layout/activity_main.xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_dark">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="3dp"
        android:indeterminate="false"
        android:max="100"
        android:progressDrawable="@color/accent"
        android:visibility="gone" />

    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefreshLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

    <LinearLayout
        android:id="@+id/errorLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:gravity="center"
        android:orientation="vertical"
        android:padding="24dp"
        android:visibility="gone">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/network_error_title"
            android:textColor="#ffffff"
            android:textSize="18sp"
            android:textStyle="bold" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:gravity="center"
            android:text="@string/network_error_msg"
            android:textColor="#94a3b8"
            android:textSize="14sp" />

        <Button
            android:id="@+id/retryButton"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            android:backgroundTint="@color/primary"
            android:text="@string/retry_btn"
            android:textColor="#ffffff" />
    </LinearLayout>
</androidx.coordinatorlayout.widget.CoordinatorLayout>
EOF

          # 7. MainActivity.java
          cat << EOF > "app/src/main/java/\$PKG_PATH/MainActivity.java"
package \$PKG_NAME;

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
}
EOF

          # 8. Self-signed Release Keystore
          keytool -genkey -v -keystore app/release.keystore \\
            -alias androidkey -keyalg RSA -keysize 2048 -validity 10000 \\
            -storepass android -keypass android \\
            -dname "CN=\$APP_NAME, OU=Mobile, O=AppCreator, L=Global, S=Web, C=US"

      - name: Build APK with Gradle
        run: |
          if [ ! -f "gradlew" ]; then
            echo "gradlew not found, generating wrapper..."
            gradle wrapper --gradle-version 8.7
          fi
          chmod +x gradlew
          ./gradlew assembleRelease --stacktrace || ./gradlew assembleDebug --stacktrace

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: \${{ github.event.inputs.app_name }}-apk
          path: app/build/outputs/apk/**/*.apk
`;
