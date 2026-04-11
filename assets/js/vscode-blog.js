(function() {
  'use strict';

  var MAX_TABS = 5;
  var tabs = [];
  var activeIndex = -1;

  document.addEventListener('DOMContentLoaded', function() {
    initTabSystem();
    initFileTree();
    initMobileSidebar();
    initActivityBar();
    initKeyboardShortcuts();
  });

  // ═══════════════════════════════════════════════════════════════
  //  TAB SYSTEM
  // ═══════════════════════════════════════════════════════════════

  function initTabSystem() {
    var pageData = getPageData();
    var breadcrumb = document.querySelector('.breadcrumb-bar');
    var panel = document.querySelector('.tab-panel');

    tabs.push({
      url: pageData.url,
      title: pageData.tabTitle,
      breadcrumbHTML: breadcrumb ? breadcrumb.outerHTML : '',
      panelEl: panel,
      scrollTop: 0
    });
    activeIndex = 0;

    renderTabBar();
    interceptLinks();
    attachScrollListener(panel);

    history.replaceState({ url: pageData.url }, '', pageData.url);

    window.addEventListener('popstate', function(e) {
      if (e.state && e.state.url) {
        var idx = findTab(e.state.url);
        if (idx !== -1) {
          activateTab(idx, true);
        } else {
          window.location.href = e.state.url;
        }
      }
    });
  }

  function getPageData() {
    var el = document.getElementById('page-data');
    if (el) try { return JSON.parse(el.textContent); } catch (e) {}
    return { url: window.location.pathname, tabTitle: 'untitled.md' };
  }

  function findTab(url) {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].url === url) return i;
    }
    return -1;
  }

  // ── Render tab bar ──────────────────────────────────────────

  function renderTabBar() {
    var bar = document.getElementById('editor-tabs');
    if (!bar) return;
    bar.innerHTML = '';

    for (var i = 0; i < tabs.length; i++) {
      bar.appendChild(buildTabEl(i));
    }
  }

  function buildTabEl(idx) {
    var t = tabs[idx];
    var el = document.createElement('div');
    el.className = 'tab' + (idx === activeIndex ? ' active' : '');
    el.setAttribute('role', 'tab');
    if (idx === activeIndex) el.setAttribute('aria-selected', 'true');

    el.innerHTML =
      '<i class="codicon codicon-markdown tab-icon"></i>' +
      '<span class="tab-title">' + escapeHtml(t.title) + '</span>' +
      '<span class="tab-close" title="Close tab"><i class="codicon codicon-close"></i></span>';

    (function(index) {
      el.addEventListener('click', function(e) {
        if (e.target.closest('.tab-close')) {
          e.preventDefault();
          e.stopPropagation();
          closeTab(index);
        } else {
          activateTab(index);
        }
      });
    })(idx);

    return el;
  }

  // ── Activate (switch to) tab ────────────────────────────────

  function activateTab(index, skipHistory) {
    if (index === activeIndex || index < 0 || index >= tabs.length) return;

    saveScroll();
    tabs[activeIndex].panelEl.classList.remove('active');

    activeIndex = index;
    tabs[activeIndex].panelEl.classList.add('active');
    restoreScroll();

    setBreadcrumb(tabs[activeIndex].breadcrumbHTML);
    if (!skipHistory) {
      history.pushState({ url: tabs[activeIndex].url }, '', tabs[activeIndex].url);
    }
    updateSidebarHighlight(tabs[activeIndex].url);
    renderTabBar();

    if (window.ViewsCounter) {
      window.ViewsCounter.track(tabs[activeIndex].url);
    }
  }

  // ── Close tab ───────────────────────────────────────────────

  function closeTab(index) {
    if (tabs.length <= 1) {
      window.location.href = '/';
      return;
    }

    var wasActive = (index === activeIndex);
    tabs[index].panelEl.remove();
    tabs.splice(index, 1);

    if (wasActive) {
      activeIndex = Math.min(index, tabs.length - 1);
      tabs[activeIndex].panelEl.classList.add('active');
      setBreadcrumb(tabs[activeIndex].breadcrumbHTML);
      restoreScroll();
      history.pushState({ url: tabs[activeIndex].url }, '', tabs[activeIndex].url);
      updateSidebarHighlight(tabs[activeIndex].url);
    } else if (index < activeIndex) {
      activeIndex--;
    }

    renderTabBar();
  }

  // ── Open new tab from fetched content ───────────────────────

  function addTab(url, title, contentHTML, breadcrumbHTML) {
    var existing = findTab(url);
    if (existing !== -1) {
      activateTab(existing);
      return;
    }

    saveScroll();
    tabs[activeIndex].panelEl.classList.remove('active');

    // Evict leftmost tab if at capacity
    if (tabs.length >= MAX_TABS) {
      tabs[0].panelEl.remove();
      tabs.shift();
      activeIndex = Math.max(activeIndex - 1, 0);
    }

    // Build new panel
    var panel = document.createElement('div');
    panel.className = 'tab-panel active';
    panel.innerHTML =
      '<div class="editor-scroll"><div class="content-body">' +
      contentHTML + '</div></div>';

    document.getElementById('editor-content').appendChild(panel);

    // Re-render KaTeX math
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(panel, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$',  right: '$',  display: false },
          { left: '\\(', right: '\\)', display: false }
        ]
      });
    }

    tabs.push({
      url: url,
      title: title,
      breadcrumbHTML: breadcrumbHTML,
      panelEl: panel,
      scrollTop: 0
    });
    activeIndex = tabs.length - 1;

    setBreadcrumb(breadcrumbHTML);
    history.pushState({ url: url }, '', url);
    updateSidebarHighlight(url);
    renderTabBar();
    attachScrollListener(panel);

    // Views counter (GoatCounter): refresh counts in new panel + track pageview
    if (window.ViewsCounter) {
      window.ViewsCounter.refresh(panel);
      window.ViewsCounter.track(url);
    }
  }

  // ── Link interception (SPA navigation) ──────────────────────

  function interceptLinks() {
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a[href]');
      if (!a) return;

      var href = a.getAttribute('href');
      if (!href) return;

      // Let anchors, mailto, external, blank-target pass through
      if (href.charAt(0) === '#' || href.startsWith('mailto:') ||
          href.startsWith('javascript:') || a.target === '_blank') return;

      // Resolve to absolute path
      var resolved;
      try {
        var u = new URL(href, window.location.origin);
        if (u.origin !== window.location.origin) return;
        resolved = u.pathname;
      } catch (ex) { return; }

      // Let status-bar links pass
      if (a.closest('.status-bar')) return;

      // Let active activity-icon handle its own sidebar toggle
      var actIcon = a.closest('.activity-icon');
      if (actIcon && actIcon.classList.contains('active')) return;

      e.preventDefault();

      // Close mobile sidebar if open
      closeMobileSidebar();

      // Already open → switch
      var idx = findTab(resolved);
      if (idx !== -1) {
        activateTab(idx);
        return;
      }

      fetchAndOpen(resolved);
    });
  }

  function fetchAndOpen(url) {
    fetch(url)
      .then(function(r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');

        var pd = doc.getElementById('page-data');
        var pageData;
        try { pageData = JSON.parse(pd.textContent); }
        catch (ex) { pageData = { url: url, tabTitle: 'page.md' }; }

        var content = doc.querySelector('.content-body');
        var breadcrumb = doc.querySelector('.breadcrumb-bar');

        addTab(
          url,
          pageData.tabTitle,
          content ? content.innerHTML : '',
          breadcrumb ? breadcrumb.outerHTML : ''
        );
      })
      .catch(function() { window.location.href = url; });
  }

  // ── Helpers ─────────────────────────────────────────────────

  function saveScroll() {
    if (activeIndex < 0 || !tabs[activeIndex]) return;
    tabs[activeIndex].scrollTop = tabs[activeIndex].panelEl.scrollTop || 0;
  }

  function restoreScroll() {
    if (activeIndex < 0 || !tabs[activeIndex]) return;
    tabs[activeIndex].panelEl.scrollTop = tabs[activeIndex].scrollTop || 0;
  }

  function setBreadcrumb(html) {
    var cur = document.querySelector('.breadcrumb-bar');
    if (!cur || !html) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var neo = tmp.querySelector('.breadcrumb-bar');
    if (neo) cur.replaceWith(neo);
  }

  function updateSidebarHighlight(url) {
    var items = document.querySelectorAll('.tree-item');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('active');

    var links = document.querySelectorAll('.tree-link');
    for (var j = 0; j < links.length; j++) {
      if (links[j].getAttribute('href') === url) {
        var item = links[j].closest('.tree-item');
        if (item) item.classList.add('active');
      }
    }
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function closeMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('mobile-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  // ═══════════════════════════════════════════════════════════════
  //  SIDEBAR FILE TREE
  // ═══════════════════════════════════════════════════════════════

  function initFileTree() {
    var fileTree = document.querySelector('.file-tree');
    if (!fileTree) return;
    fileTree.addEventListener('click', function(e) {
      var header = e.target.closest('.tree-section-header');
      if (!header) return;
      var section = header.parentElement;
      if (section && section.classList.contains('tree-section')) {
        section.classList.toggle('open');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  MOBILE SIDEBAR
  // ═══════════════════════════════════════════════════════════════

  function initMobileSidebar() {
    var btn = document.getElementById('mobile-menu-btn');
    var overlay = document.getElementById('mobile-overlay');
    var sidebar = document.getElementById('sidebar');
    if (!btn || !overlay || !sidebar) return;

    btn.addEventListener('click', function() {
      if (sidebar.classList.contains('open')) {
        closeMobileSidebar();
      } else {
        sidebar.classList.add('open');
        overlay.classList.add('active');
      }
    });

    overlay.addEventListener('click', closeMobileSidebar);

    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) closeMobileSidebar();
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  ACTIVITY BAR
  // ═══════════════════════════════════════════════════════════════

  function initActivityBar() {
    var explorerIcon = document.querySelector('.activity-icon[data-panel="explorer"]');
    var app = document.querySelector('.vscode-app');
    if (!explorerIcon || !app) return;

    explorerIcon.addEventListener('click', function(e) {
      if (explorerIcon.classList.contains('active')) {
        e.preventDefault();
        app.classList.toggle('sidebar-hidden');
        explorerIcon.classList.toggle('inactive');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════════════

  function initKeyboardShortcuts() {
    var app = document.querySelector('.vscode-app');
    var explorerIcon = document.querySelector('.activity-icon[data-panel="explorer"]');

    document.addEventListener('keydown', function(e) {
      var mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Ctrl/Cmd + B → toggle sidebar
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        if (app) {
          app.classList.toggle('sidebar-hidden');
          if (explorerIcon) explorerIcon.classList.toggle('inactive');
        }
      }

      // Ctrl/Cmd + P → reserved
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
      }

      // Ctrl/Cmd + W → close current tab
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        closeTab(activeIndex);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  STATUS BAR LINE INFO
  // ═══════════════════════════════════════════════════════════════

  function attachScrollListener(panel) {
    var lnItem = null;
    var items = document.querySelectorAll('.status-item');
    for (var i = 0; i < items.length; i++) {
      if (items[i].textContent.indexOf('Ln') !== -1) { lnItem = items[i]; break; }
    }
    if (!lnItem) return;

    var LINE_HEIGHT = 22;
    var ticking = false;

    panel.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          if (tabs[activeIndex] && tabs[activeIndex].panelEl === panel) {
            lnItem.textContent = 'Ln ' + (Math.floor(panel.scrollTop / LINE_HEIGHT) + 1) + ', Col 1';
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

})();
