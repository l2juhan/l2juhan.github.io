(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initFileTree();
    initMobileSidebar();
    initActivityBar();
    initTabClose();
    initKeyboardShortcuts();
    initScrollMemory();
    initStatusBarLineInfo();
  });

  // ── 1. Sidebar File Tree Toggle ──────────────────────────────────────
  // Uses event delegation on .file-tree so dynamically-added sections work.
  function initFileTree() {
    var fileTree = document.querySelector('.file-tree');
    if (!fileTree) return;

    fileTree.addEventListener('click', function(e) {
      var header = e.target.closest('.tree-section-header');
      if (!header) return;

      var section = header.parentElement;
      if (!section || !section.classList.contains('tree-section')) return;

      section.classList.toggle('open');
    });
  }

  // ── 2. Mobile Sidebar Toggle ─────────────────────────────────────────
  function initMobileSidebar() {
    var btn = document.getElementById('mobile-menu-btn');
    var overlay = document.getElementById('mobile-overlay');
    var sidebar = document.getElementById('sidebar');
    if (!btn || !overlay || !sidebar) return;

    function openMobile() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
    }

    function closeMobile() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }

    btn.addEventListener('click', function() {
      if (sidebar.classList.contains('open')) {
        closeMobile();
      } else {
        openMobile();
      }
    });

    overlay.addEventListener('click', closeMobile);

    // Auto-close mobile sidebar when resizing to desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        closeMobile();
      }
    });
  }

  // ── 3. Activity Bar Explorer Toggle (Desktop) ────────────────────────
  function initActivityBar() {
    var explorerIcon = document.querySelector('.activity-icon[data-panel="explorer"]');
    var app = document.querySelector('.vscode-app');
    if (!explorerIcon || !app) return;

    explorerIcon.addEventListener('click', function(e) {
      // Only toggle sidebar when already on the home page (icon is active),
      // otherwise let the link navigate normally to "/"
      if (explorerIcon.classList.contains('active')) {
        e.preventDefault();
        app.classList.toggle('sidebar-hidden');
        explorerIcon.classList.toggle('inactive');
      }
    });
  }

  // ── 4. Tab Close Button ──────────────────────────────────────────────
  function initTabClose() {
    var tabBar = document.querySelector('.editor-tabs');
    if (!tabBar) return;

    tabBar.addEventListener('click', function(e) {
      if (e.target.closest('.tab-close')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/';
      }
    });
  }

  // ── 5. Keyboard Shortcuts ────────────────────────────────────────────
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

      // Ctrl/Cmd + P → reserved for future search (prevent default only)
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
      }
    });
  }

  // ── 6. Scroll Position Memory ────────────────────────────────────────
  function initScrollMemory() {
    var editor = document.querySelector('.editor-content');
    if (!editor) return;

    var key = 'scroll:' + window.location.pathname;
    var saved = sessionStorage.getItem(key);

    // Restore saved position (not on first visit)
    if (saved !== null) {
      editor.scrollTop = parseInt(saved, 10);
    }

    // Debounced save on scroll
    var timer;
    editor.addEventListener('scroll', function() {
      clearTimeout(timer);
      timer = setTimeout(function() {
        sessionStorage.setItem(key, editor.scrollTop);
      }, 150);
    });
  }

  // ── 7. Status Bar Line/Column Info ───────────────────────────────────
  // Approximates a "line number" from the scroll position of the editor.
  function initStatusBarLineInfo() {
    var editor = document.querySelector('.editor-content');
    if (!editor) return;

    // Find the status item containing "Ln"
    var statusItems = document.querySelectorAll('.status-item');
    var lnItem = null;
    for (var i = 0; i < statusItems.length; i++) {
      if (statusItems[i].textContent.indexOf('Ln') !== -1) {
        lnItem = statusItems[i];
        break;
      }
    }
    if (!lnItem) return;

    var LINE_HEIGHT = 22; // approximate px per "line"

    function updateLine() {
      var line = Math.floor(editor.scrollTop / LINE_HEIGHT) + 1;
      lnItem.textContent = 'Ln ' + line + ', Col 1';
    }

    // Throttle to ~60 fps at most
    var ticking = false;
    editor.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          updateLine();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
})();
