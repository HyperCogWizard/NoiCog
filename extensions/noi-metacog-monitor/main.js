/**
 * NoiCog Meta-Cognitive Monitor
 * Tracks query patterns, response quality metrics, latency, and cognitive load
 * across AI services. Provides an on-page dashboard for real-time monitoring.
 */

const NOI_METACOG_KEY = 'noi_metacog_events';
const NOI_METACOG_MAX = 200;

// ---------------------------------------------------------------------------
// Service identity resolution
// ---------------------------------------------------------------------------

function resolveService() {
  const host = window.location.host;
  const map = {
    'chatgpt.com': 'ChatGPT',
    'claude.ai': 'Claude',
    'gemini.google.com': 'Gemini',
    'grok.com': 'Grok',
    'perplexity.ai': 'Perplexity',
    'copilot.microsoft.com': 'Copilot',
    'chat.groq.com': 'Groq',
    'chat.mistral.ai': 'Mistral',
    'chat.deepseek.com': 'DeepSeek',
    'github.com': 'GitHub Copilot',
    'huggingface.co': 'HuggingChat',
    'localhost:8080': 'OpenCog',
    'localhost:17020': 'OpenCog',
  };
  for (const key of Object.keys(map)) {
    if (host.includes(key)) return map[key];
  }
  return host;
}

// ---------------------------------------------------------------------------
// Event Store
// ---------------------------------------------------------------------------

class MetaCogStore {
  static load() {
    try {
      return JSON.parse(localStorage.getItem(NOI_METACOG_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static save(events) {
    try {
      localStorage.setItem(NOI_METACOG_KEY, JSON.stringify(events));
    } catch {
      localStorage.setItem(NOI_METACOG_KEY, JSON.stringify(events.slice(-Math.floor(NOI_METACOG_MAX / 2))));
    }
  }

  static record(event) {
    const events = MetaCogStore.load();
    events.push(event);
    MetaCogStore.save(events.slice(-NOI_METACOG_MAX));
  }

  static clear() {
    localStorage.removeItem(NOI_METACOG_KEY);
  }

  static getAll() {
    return MetaCogStore.load();
  }

  static computeStats() {
    const events = MetaCogStore.load();
    const byService = {};
    let totalLatency = 0;
    let latencyCount = 0;
    let totalQueryLen = 0;
    let totalResponseLen = 0;
    let queryCount = 0;

    for (const ev of events) {
      if (!byService[ev.service]) {
        byService[ev.service] = { queries: 0, totalLatency: 0, latencyCount: 0, errors: 0 };
      }
      const svc = byService[ev.service];

      if (ev.type === 'query_start') {
        svc.queries++;
        queryCount++;
        totalQueryLen += ev.queryLen || 0;
      } else if (ev.type === 'response_end') {
        if (ev.latencyMs > 0) {
          svc.totalLatency += ev.latencyMs;
          svc.latencyCount++;
          totalLatency += ev.latencyMs;
          latencyCount++;
        }
        totalResponseLen += ev.responseLen || 0;
      } else if (ev.type === 'error') {
        svc.errors++;
      }
    }

    return {
      totalQueries: queryCount,
      avgQueryLen: queryCount ? Math.round(totalQueryLen / queryCount) : 0,
      avgResponseLen: latencyCount ? Math.round(totalResponseLen / latencyCount) : 0,
      avgLatencyMs: latencyCount ? Math.round(totalLatency / latencyCount) : 0,
      serviceBreakdown: Object.entries(byService).map(([name, d]) => ({
        name,
        queries: d.queries,
        avgLatencyMs: d.latencyCount ? Math.round(d.totalLatency / d.latencyCount) : 0,
        errors: d.errors,
      })).sort((a, b) => b.queries - a.queries),
      totalEvents: events.length,
      sessionStart: events.length ? events[0].timestamp : null,
    };
  }
}

// ---------------------------------------------------------------------------
// Query/Response Instrumentation
// ---------------------------------------------------------------------------

class QueryInstrument {
  constructor() {
    this.service = resolveService();
    this.pendingStart = null;
    this._lastResponseText = '';
    this._observe();
  }

  _observe() {
    // Watch for submit button clicks to mark query start
    document.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      const label = (btn.getAttribute('aria-label') || btn.textContent || '').toLowerCase();
      if (label.includes('send') || label.includes('submit') || label.includes('ask') || btn.type === 'submit') {
        this._onQueryStart();
      }
    }, true);

    // Watch for Enter keydown on inputs
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        const el = ev.target;
        if (el.tagName === 'TEXTAREA' || el.getAttribute('contenteditable') === 'true') {
          this._onQueryStart();
        }
      }
    }, true);

    // Watch DOM for response completion
    let debounce = null;
    const observer = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(() => this._onPossibleResponseEnd(), 800);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  _getQueryText() {
    const candidates = [
      document.querySelector('form #prompt-textarea'),
      document.querySelector('textarea'),
      document.querySelector('[contenteditable="true"]'),
      document.querySelector('#scheme-command'),
    ];
    for (const el of candidates) {
      if (el) return (el.value || el.innerText || '').trim();
    }
    return '';
  }

  _getLastResponseText() {
    const candidates = [
      '[data-message-author-role="assistant"]',
      '.font-claude-message',
      'model-response',
      '.prose',
      '#command-output',
    ];
    for (const sel of candidates) {
      const els = document.querySelectorAll(sel);
      if (els.length) return els[els.length - 1].innerText.trim();
    }
    return '';
  }

  _onQueryStart() {
    const query = this._getQueryText();
    this.pendingStart = { time: Date.now(), queryLen: query.length };
    MetaCogStore.record({
      type: 'query_start',
      timestamp: new Date().toISOString(),
      service: this.service,
      queryLen: query.length,
    });
    if (window.NoiMetaCogMonitor) window.NoiMetaCogMonitor._notifyUpdate();
  }

  _onPossibleResponseEnd() {
    if (!this.pendingStart) return;
    const responseText = this._getLastResponseText();
    if (!responseText || responseText === this._lastResponseText) return;
    this._lastResponseText = responseText;

    const latencyMs = Date.now() - this.pendingStart.time;
    this.pendingStart = null;

    MetaCogStore.record({
      type: 'response_end',
      timestamp: new Date().toISOString(),
      service: this.service,
      latencyMs,
      responseLen: responseText.length,
    });
    if (window.NoiMetaCogMonitor) window.NoiMetaCogMonitor._notifyUpdate();
  }
}

// ---------------------------------------------------------------------------
// Monitor Dashboard UI
// ---------------------------------------------------------------------------

class MetaCogDashboard {
  constructor() {
    this.visible = false;
    this.panel = null;
    this._build();
    this._updateInterval = null;
  }

  _build() {
    const panel = document.createElement('div');
    panel.id = 'noi-metacog-panel';
    panel.innerHTML = `
      <div class="nmm-header">
        <span>📊 Meta-Cognitive Monitor</span>
        <div class="nmm-header-actions">
          <button id="nmm-reset" title="Reset metrics">↺ Reset</button>
          <button id="nmm-close" title="Close">✕</button>
        </div>
      </div>
      <div class="nmm-body">
        <div id="nmm-summary" class="nmm-section"></div>
        <div class="nmm-section-title">Service Breakdown</div>
        <div id="nmm-breakdown" class="nmm-section"></div>
        <div class="nmm-section-title">Cognitive Load</div>
        <div id="nmm-load" class="nmm-section"></div>
      </div>
    `;
    document.body.appendChild(panel);
    this.panel = panel;

    document.getElementById('nmm-close').addEventListener('click', () => this.hide());
    document.getElementById('nmm-reset').addEventListener('click', () => {
      MetaCogStore.clear();
      this.render();
    });
  }

  show() {
    this.panel.classList.add('visible');
    this.visible = true;
    this.render();
    this._updateInterval = setInterval(() => this.render(), 5000);
  }

  hide() {
    this.panel.classList.remove('visible');
    this.visible = false;
    clearInterval(this._updateInterval);
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  _notifyUpdate() {
    if (this.visible) this.render();
  }

  render() {
    const stats = MetaCogStore.computeStats();

    // Summary
    const summary = document.getElementById('nmm-summary');
    if (summary) {
      summary.innerHTML = `
        <div class="nmm-stat-grid">
          <div class="nmm-stat"><span class="nmm-val">${stats.totalQueries}</span><span class="nmm-lbl">Queries</span></div>
          <div class="nmm-stat"><span class="nmm-val">${stats.avgLatencyMs > 0 ? stats.avgLatencyMs + 'ms' : '—'}</span><span class="nmm-lbl">Avg Latency</span></div>
          <div class="nmm-stat"><span class="nmm-val">${stats.avgQueryLen || '—'}</span><span class="nmm-lbl">Avg Query Len</span></div>
          <div class="nmm-stat"><span class="nmm-val">${stats.avgResponseLen || '—'}</span><span class="nmm-lbl">Avg Resp Len</span></div>
        </div>
        ${stats.sessionStart ? `<div class="nmm-since">Since ${new Date(stats.sessionStart).toLocaleTimeString()}</div>` : ''}
      `;
    }

    // Service Breakdown
    const breakdown = document.getElementById('nmm-breakdown');
    if (breakdown) {
      if (!stats.serviceBreakdown.length) {
        breakdown.innerHTML = '<div class="nmm-empty">No data yet. Start querying an AI service.</div>';
      } else {
        breakdown.innerHTML = stats.serviceBreakdown.map(svc => `
          <div class="nmm-svc-row">
            <span class="nmm-svc-name">${svc.name}</span>
            <span class="nmm-svc-stat">${svc.queries} queries</span>
            <span class="nmm-svc-stat">${svc.avgLatencyMs > 0 ? svc.avgLatencyMs + 'ms avg' : '—'}</span>
            ${svc.errors ? `<span class="nmm-svc-err">${svc.errors} err</span>` : ''}
          </div>
        `).join('');
      }
    }

    // Cognitive Load (heuristic: queries/minute in last 5 min window)
    const loadEl = document.getElementById('nmm-load');
    if (loadEl) {
      const events = MetaCogStore.getAll();
      const now = Date.now();
      const window5m = events.filter(e =>
        e.type === 'query_start' && (now - new Date(e.timestamp).getTime()) < 5 * 60 * 1000
      ).length;
      const loadPct = Math.min(100, window5m * 10); // 10 queries = 100%
      const loadLabel = loadPct < 20 ? 'Low' : loadPct < 60 ? 'Moderate' : 'High';
      const loadColor = loadPct < 20 ? '#4caf50' : loadPct < 60 ? '#ff9800' : '#e53935';
      loadEl.innerHTML = `
        <div class="nmm-load-label">${loadLabel} (${window5m} queries / 5 min)</div>
        <div class="nmm-load-bar-track">
          <div class="nmm-load-bar-fill" style="width:${loadPct}%;background:${loadColor}"></div>
        </div>
      `;
    }
  }
}

// ---------------------------------------------------------------------------
// Launcher Button
// ---------------------------------------------------------------------------

function buildLauncher(dashboard) {
  const btn = document.createElement('button');
  btn.id = 'noi-metacog-launcher';
  btn.title = 'Noi Meta-Cognitive Monitor';
  btn.textContent = '📊';
  btn.addEventListener('click', () => dashboard.toggle());
  document.body.appendChild(btn);
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

(function init() {
  const instrument = new QueryInstrument();
  const dashboard = new MetaCogDashboard();
  buildLauncher(dashboard);

  window.NoiMetaCogMonitor = {
    getStats: () => MetaCogStore.computeStats(),
    getEvents: () => MetaCogStore.getAll(),
    clear: () => MetaCogStore.clear(),
    _notifyUpdate: () => dashboard._notifyUpdate(),
  };

  // suppress unused-variable lint for instrument
  void instrument;
})();
