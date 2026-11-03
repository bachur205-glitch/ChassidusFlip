plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.chassidusflip.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.chassidusflip.app"
        minSdk = 24
        targetSdk = 34
        // Raise both numbers every time you publish an update
        versionCode = 1
        versionName = "1.0"
    }

    // A fixed signing key kept in the repo, so every build is signed the same way
    // and phones accept new versions as updates over the old one.
    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        debug { signingConfig = signingConfigs.getByName("debug") }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
