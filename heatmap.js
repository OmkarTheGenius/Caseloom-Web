/*
 * Caseloom UX Heatmap Lab — opt-in, client-side prototype.
 * Privacy rules: no field values, emails, typed text, full URLs/query strings, or keystrokes are captured.
 * Nothing is sent to a server. Data stays in this browser until exported/cleared.
 */
(() => {
  'use strict';
  if (new URLSearchParams(window.location.search).get('heatmap') !== '1') return;

  const STORAGE_KEY = 'caseloomHeatmapSessionsV1';
  const PANEL_ID = 'caseloom-heatmap-panel';
  const existingPanel = document.getElementById(PANEL_ID);
  if (existingPanel) return;

  let activeSession = null;
  let recording = false;
  let maxScrollPercent = 0;
  const scrollMilestones = new Set();
  const seenSections = new Set();

  const safeRead = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (_) { return []; }
  };
  const safeWrite = (sessions) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); return true; }
    catch (_) { setStatus('Browser storage is unavailable. Try a normal browser tab.'); return false; }
  };
  const pageSize = () => ({
    viewportWidth: Math.round(window.innerWidth),
    viewportHeight: Math.round(window.innerHeight),
    documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, 1),
    documentHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 1)
  });
  const sectionFor = (el) => {
    const section = el && el.closest('section, header, footer, main, .hero');
    if (!section) return 'unlabelled';
    if (section.id) return section.id;
    if (section.tagName.toLowerCase() === 'header') return 'header';
    if (section.tagName.toLowerCase() === 'footer') return 'footer';
    if (section.classList.contains('hero')) return 'hero';
    if (section.tagName.toLowerCase() === 'main') return 'main';
    return 'section';
  };
  const stableLabel = (el) => {
    if (!el) return 'unknown element';
    const named = el.getAttribute('aria-label') || el.getAttribute('title') || el.id;
    if (named) return String(named).trim().slice(0, 50);
    const tag = el.tagName ? el.tagName.toLowerCase() : 'element';
    // For form controls, record the static label only; never read their values.
    if (['input', 'textarea', 'select'].includes(tag)) {
      const labels = el.labels ? Array.from(el.labels) : [];
      const label = labels.map(node => Array.from(node.childNodes)
        .filter(child => child.nodeType === Node.TEXT_NODE)
        .map(child => child.textContent.trim()).filter(Boolean).join(' '))
        .filter(Boolean).join(' ').trim();
      return label ? (tag + ': ' + label).slice(0, 50) : tag;
    }
    const text = String(el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    return (text || tag).slice(0, 50);
  };
  const exportSafeSessions = (rawSessions) => rawSessions.map(session => ({
    id: session.id || 'session',
    project: session.project || 'Caseloom UX Heatmap Lab',
    dataType: session.dataType || 'opt-in usability test; not customer analytics',
    startedAt: session.startedAt || null,
    endedAt: session.endedAt || null,
    pageName: session.pageName || document.title || 'Caseloom',
    viewportWidth: session.viewportWidth,
    viewportHeight: session.viewportHeight,
    documentWidth: session.documentWidth,
    documentHeight: session.documentHeight,
    events: (Array.isArray(session.events) ? session.events : []).map(ev => {
      const allowed = ['type','x','y','xPct','yPct','section','label','tag','scrollPercent',
        'viewportWidth','viewportHeight','documentWidth','documentHeight','at'];
      return Object.fromEntries(allowed.filter(key => Object.prototype.hasOwnProperty.call(ev, key)).map(key => [key, ev[key]]));
    })
  }));
  const saveEvent = (event) => {
    if (!recording || !activeSession) return;
    const size = pageSize();
    activeSession.events.push({ ...event, ...size, at: new Date().toISOString() });
    const sessions = safeRead();
    const idx = sessions.findIndex(s => s.id === activeSession.id);
    if (idx >= 0) sessions[idx] = activeSession; else sessions.push(activeSession);
    safeWrite(sessions);
    updateCount();
  };

  const panel = document.createElement('aside');
  panel.id = PANEL_ID;
  panel.setAttribute('aria-label', 'Caseloom opt-in usability test controls');
  panel.innerHTML = `
    <div class="chm-head"><strong>Caseloom UX test mode</strong><span class="chm-chip">LOCAL ONLY</span></div>
    <p class="chm-copy">Optional test recorder. It logs click positions, page sections and scroll depth only. It ignores form fields and sends nothing to a server.</p>
    <p class="chm-status" id="chm-status" role="status">Recording is off. Start only after the tester agrees.</p>
    <div class="chm-actions">
      <button type="button" id="chm-start">Start test</button>
      <button type="button" id="chm-stop" disabled>Stop</button>
      <button type="button" id="chm-export">Export JSON (<span id="chm-count">0</span>)</button>
      <button type="button" id="chm-clear" class="chm-muted">Clear local data</button>
    </div>`;
  const css = document.createElement('style');
  css.textContent = `
    #${PANEL_ID}{position:fixed;z-index:2147483000;right:12px;bottom:12px;width:min(380px,calc(100vw - 24px));background:#17143a;color:#fff;border:1px solid #716bb0;border-radius:14px;box-shadow:0 12px 44px #11142f55;padding:14px;font:13px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
    #${PANEL_ID} *{box-sizing:border-box} #${PANEL_ID} .chm-head{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:14px}
    #${PANEL_ID} .chm-chip{font-size:9px;letter-spacing:.08em;background:#27c9a0;color:#17143a;border-radius:99px;padding:3px 7px;font-weight:800}
    #${PANEL_ID} .chm-copy{color:#e1defd;margin:8px 0} #${PANEL_ID} .chm-status{margin:7px 0;color:#ffd6cc;min-height:18px}
    #${PANEL_ID} .chm-actions{display:flex;gap:6px;flex-wrap:wrap} #${PANEL_ID} button{font:600 12px system-ui;border:0;border-radius:8px;padding:8px 10px;background:#ff5a3c;color:#17143a;cursor:pointer}
    #${PANEL_ID} button:disabled{opacity:.45;cursor:not-allowed} #${PANEL_ID} button.chm-muted{background:#39345f;color:#fff}
    @media(max-width:520px){#${PANEL_ID}{right:8px;bottom:8px;padding:11px} #${PANEL_ID} .chm-actions button{flex:1 1 42%}}
  `;
  document.head.append(css); document.body.append(panel);
  const $ = id => document.getElementById(id);
  const setStatus = text => { const el = $('chm-status'); if (el) el.textContent = text; };
  const allEventsCount = () => safeRead().reduce((n, s) => n + (Array.isArray(s.events) ? s.events.length : 0), 0);
  const updateCount = () => { const el = $('chm-count'); if (el) el.textContent = String(allEventsCount()); };

  $('chm-start').addEventListener('click', () => {
    if (recording) return;
    activeSession = {
      id: 'caseloom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      project: 'Caseloom UX Heatmap Lab',
      dataType: 'opt-in usability test; not customer analytics',
      startedAt: new Date().toISOString(), endedAt: null,
      pageName: document.title || 'Caseloom',
      ...pageSize(), events: []
    };
    recording = true; maxScrollPercent = 0; scrollMilestones.clear(); seenSections.clear();
    $('chm-start').disabled = true; $('chm-stop').disabled = false;
    setStatus('Recording test interactions in this browser only. Do not enter real personal data.');
    saveEvent({ type: 'test-start', xPct: 0.5, yPct: 0, section: 'page', label: 'Test started' });
  });
  $('chm-stop').addEventListener('click', () => {
    if (!recording || !activeSession) return;
    recording = false; activeSession.endedAt = new Date().toISOString();
    const sessions = safeRead(); const idx = sessions.findIndex(s => s.id === activeSession.id);
    if (idx >= 0) sessions[idx] = activeSession; else sessions.push(activeSession);
    safeWrite(sessions); $('chm-start').disabled = false; $('chm-stop').disabled = true;
    setStatus('Test stopped. Export the JSON and import it into heatmap-dashboard.html.'); updateCount();
  });
  $('chm-export').addEventListener('click', () => {
    const payload = { schemaVersion: 1, project: 'Caseloom UX Heatmap Lab', exportedAt: new Date().toISOString(), notice: 'Sanitised opt-in usability test events; not production/customer analytics.', sessions: exportSafeSessions(safeRead()) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'caseloom-heatmap-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });
  $('chm-clear').addEventListener('click', () => {
    if (!window.confirm('Delete all locally saved Caseloom test sessions from this browser?')) return;
    localStorage.removeItem(STORAGE_KEY); activeSession = null; recording = false;
    $('chm-start').disabled = false; $('chm-stop').disabled = true; updateCount();
    setStatus('Local test data cleared.');
  });

  document.addEventListener('click', (event) => {
    if (!recording || !event.target) return;
    if (event.target.closest('#' + PANEL_ID)) return;
    // Only record actionable controls, not parent labels/divs/sections. This avoids
    // counting a click on a <select> as a click on its wrapping <label>.
    const target = event.target.closest('a,button,summary,select,input[type="text"],input[type="checkbox"],input[type="radio"],input[type="range"],[role="button"]');
    if (!target || target.closest('form') || target.closest('#' + PANEL_ID)) return;
    const size = pageSize();
    const rect = target.getBoundingClientRect();
    const docX = Math.max(0, event.clientX + window.scrollX);
    const docY = Math.max(0, event.clientY + window.scrollY);
    saveEvent({
      type: 'click', x: Math.round(docX), y: Math.round(docY),
      xPct: Math.min(1, docX / size.documentWidth), yPct: Math.min(1, docY / size.documentHeight),
      section: sectionFor(target), label: stableLabel(target), tag: target.tagName.toLowerCase()
    });
  }, true);

  // Record selection changes without capturing the selected value.
  document.addEventListener('change', (event) => {
    if (!recording || !event.target || event.target.tagName !== 'SELECT') return;
    const target = event.target;
    if (target.closest('form') || target.closest('#' + PANEL_ID)) return;
    const size = pageSize();
    const rect = target.getBoundingClientRect();
    const docX = Math.max(0, rect.left + rect.width / 2 + window.scrollX);
    const docY = Math.max(0, rect.top + rect.height / 2 + window.scrollY);
    saveEvent({
      type: 'control-change', x: Math.round(docX), y: Math.round(docY),
      xPct: Math.min(1, docX / size.documentWidth), yPct: Math.min(1, docY / size.documentHeight),
      section: sectionFor(target), label: stableLabel(target), tag: 'select'
    });
  }, true);

  window.addEventListener('scroll', () => {
    if (!recording) return;
    const size = pageSize();
    const available = Math.max(1, size.documentHeight - size.viewportHeight);
    const pct = Math.round(Math.max(0, Math.min(1, window.scrollY / available)) * 100);
    maxScrollPercent = Math.max(maxScrollPercent, pct);
    [25, 50, 75, 90].forEach(mark => {
      if (pct >= mark && !scrollMilestones.has(mark)) {
        scrollMilestones.add(mark);
        saveEvent({ type: 'scroll-depth', scrollPercent: mark, xPct: 0.5, yPct: Math.min(1, (window.scrollY + window.innerHeight / 2) / size.documentHeight), section: 'page', label: 'Reached ' + mark + '% scroll depth' });
      }
    });
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!recording) return;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const section = entry.target.id || sectionFor(entry.target);
        if (seenSections.has(section)) return;
        seenSections.add(section);
        const rect = entry.target.getBoundingClientRect(); const size = pageSize();
        const y = Math.max(0, rect.top + window.scrollY + Math.min(rect.height / 2, window.innerHeight / 2));
        saveEvent({ type: 'section-view', section, label: 'Section viewed', xPct: 0.5, yPct: Math.min(1, y / size.documentHeight) });
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('header, main > div.hero, main section, footer').forEach(el => observer.observe(el));
  }
  updateCount();
})();
