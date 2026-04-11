(function() {
  'use strict';

  var code = window.GOATCOUNTER_CODE;
  if (!code) return;

  var API_BASE = 'https://' + code + '.goatcounter.com/counter/';
  var cache = {}; // path → Promise<string>

  // ── Public counter fetch (JSON) ─────────────────────────────
  function fetchCount(path) {
    if (cache[path]) return cache[path];
    var url = API_BASE + encodeURIComponent(path) + '.json';
    cache[path] = fetch(url)
      .then(function(r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function(data) { return data.count || '0'; })
      .catch(function() { return '–'; });
    return cache[path];
  }

  function updateEl(el, count) {
    var span = el.querySelector('.views-count');
    if (span) span.textContent = count;
  }

  function refresh(root) {
    root = root || document;
    var els = root.querySelectorAll('[data-view-path]');
    for (var i = 0; i < els.length; i++) {
      (function(el) {
        var path = el.getAttribute('data-view-path');
        if (!path) return;
        fetchCount(path).then(function(c) { updateEl(el, c); });
      })(els[i]);
    }
  }

  // ── Pageview tracking (SPA-aware) ───────────────────────────
  function trackPageview(path) {
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({ path: path });
    }
  }

  // Expose for vscode-blog.js SPA hooks
  window.ViewsCounter = {
    refresh: refresh,
    track: trackPageview
  };

  // ── Initial load ────────────────────────────────────────────
  function init() {
    refresh();
    // count.js is async — wait for window.load so it's ready
    if (document.readyState === 'complete') {
      trackPageview(window.location.pathname);
    } else {
      window.addEventListener('load', function() {
        trackPageview(window.location.pathname);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
