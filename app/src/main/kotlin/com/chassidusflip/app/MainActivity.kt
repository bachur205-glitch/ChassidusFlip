package com.chassidusflip.app

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {

    private val siteUrl = "https://chassidus-content.com/"
    private lateinit var web: WebView
    private lateinit var dpadScript: String

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        dpadScript = assets.open("dpad.js").bufferedReader().use { it.readText() }

        web = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            settings.mediaPlaybackRequiresUserGesture = false
            isFocusable = true
            isFocusableInTouchMode = true

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val host = request.url.host ?: return false
                    if (host.endsWith("chassidus-content.com")) return false // stay in the app
                    startActivity(Intent(Intent.ACTION_VIEW, request.url))   // other sites open in the browser
                    return true
                }

                override fun onPageFinished(view: WebView, url: String?) {
                    // Add D-pad navigation to every page that loads
                    view.evaluateJavascript(dpadScript, null)
                }
            }
        }
        setContentView(web)

        if (savedInstanceState == null) web.loadUrl(siteUrl) else web.restoreState(savedInstanceState)
        web.requestFocus()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    // Back key goes to the previous page first, and only exits the app from the first page
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && web.canGoBack()) {
            web.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}
