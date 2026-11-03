/*
 * dpad.js: D-pad / keypad navigation for web-based (WebView / Capacitor) apps.
 * Include once, near the end of your main HTML:  <script src="dpad.js"></script>
 *
 * What it does:
 *  1. Makes clickable non-button elements focusable (tabindex=0).
 *  2. Shows a clear focus ring so the user can see where they are.
 *  3. Arrow keys move focus to the nearest focusable element in that direction.
 *  4. Enter / D-pad centre "clicks" the focused element.
 *  5. If nothing is in that direction, the arrow key scrolls the page as normal.
 */
(function () {
  'use strict';
  if (window.__dpadLoaded) return;
  window.__dpadLoaded = true;

  // ---- Config: add your own selectors for elements that act like buttons ----
  var CLICKABLE = [
    'a[href]', 'button', 'input', 'select', 'textarea', 'summary',
    '[onclick]', '[role="button"]', '[role="link"]', '[role="tab"]',
    '[role="menuitem"]', '[data-dpad]', '.btn', '.button', '.card', '.item'
  ].join(',');
  var FOCUSABLE = CLICKABLE + ',[tabindex]:not([tabindex="-1"])';

  // ---- 1 + 2. Focus ring ----
  var style = document.createElement('style');
  style.textContent =
    ':focus{outline:3px solid #ffb300 !important;outline-offset:2px !important;}' +
    '[data-dpad-focus]{outline:3px solid #ffb300 !important;outline-offset:2px !important;}';
  document.head.appendChild(style);

  function isVisible(el) {
    if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }

  // ---- 1. Make clickable things focusable ----
  function prepare() {
    var nodes = document.querySelectorAll(CLICKABLE);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(el.tagName)) {
        el.setAttribute('tabindex', '0');
      }
    }
  }
  prepare();
  new MutationObserver(prepare).observe(document.documentElement, { childList: true, subtree: true });

  // ---- 3. Spatial navigation ----
  function candidates() {
    var all = document.querySelectorAll(FOCUSABLE);
    var out = [];
    for (var i = 0; i < all.length; i++) if (isVisible(all[i])) out.push(all[i]);
    return out;
  }

  function center(r) { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  function findNext(from, dir) {
    var a = from.getBoundingClientRect(), ac = center(a), best = null, bestScore = Infinity;
    var list = candidates();
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el === from || from.contains(el) || el.contains(from)) continue;
      var b = el.getBoundingClientRect(), bc = center(b);
      var dx = bc.x - ac.x, dy = bc.y - ac.y, primary, secondary;
      if (dir === 'ArrowRight') { if (b.left < a.right - 2 && dx <= 0) continue; primary = dx; secondary = Math.abs(dy); }
      else if (dir === 'ArrowLeft') { if (b.right > a.left + 2 && dx >= 0) continue; primary = -dx; secondary = Math.abs(dy); }
      else if (dir === 'ArrowDown') { if (b.top < a.bottom - 2 && dy <= 0) continue; primary = dy; secondary = Math.abs(dx); }
      else { if (b.bottom > a.top + 2 && dy >= 0) continue; primary = -dy; secondary = Math.abs(dx); }
      if (primary <= 0) continue;
      var score = primary + secondary * 2.5; // favour elements lined up with the current one
      if (score < bestScore) { bestScore = score; best = el; }
    }
    return best;
  }

  function isTextField(el) {
    return el && (el.tagName === 'TEXTAREA' ||
      (el.tagName === 'INPUT' && /^(text|search|email|url|tel|password|number)$/i.test(el.type || 'text')) ||
      el.isContentEditable);
  }

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var cur = document.activeElement;
    if (cur === document.body || cur === document.documentElement) cur = null;

    if (/^Arrow(Up|Down|Left|Right)$/.test(e.key)) {
      // Let left/right move the caret inside text boxes; up/down still navigate (single-line only).
      if (isTextField(cur) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || cur.tagName === 'TEXTAREA')) return;
      if (!cur) {
        var first = candidates()[0];
        if (first) { first.focus(); e.preventDefault(); }
        return;
      }
      var next = findNext(cur, e.key);
      if (next) {
        e.preventDefault();
        next.focus({ preventScroll: true });
        next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } // else: no target, so the browser scrolls normally
      return;
    }

    // ---- 4. Enter / D-pad centre activates ----
    if ((e.key === 'Enter' || e.key === ' ') && cur && !isTextField(cur) &&
        !/^(A|BUTTON|SELECT|SUMMARY)$/.test(cur.tagName) && !(cur.tagName === 'INPUT')) {
      e.preventDefault();
      cur.click();
    }
  }, true);
})();
