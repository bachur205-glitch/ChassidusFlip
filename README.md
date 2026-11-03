# Chassidus app (TCL Flip 2)

Full-screen WebView for https://chassidus-content.com/ with D-pad navigation (app/src/main/assets/dpad.js).

## Build
1. Create a GitHub repo and upload everything in this folder (keep the .github folder).
2. Open the Actions tab and run "Build APK" (it also runs on every push to main).
3. When it finishes, download `chassidusflip-apk` from the run page, unzip it, and install chassidusflip.apk on the phone.

## Update the app
Raise versionCode and versionName in app/build.gradle.kts, push to main, then install the new APK over the old one.
For a download link: tag the commit (for example v1.1) and the APK appears under Releases.
