/**
 * NoiCog Context Manager
 * Advanced context awareness: captures AI responses, maintains a cross-service
 * conversation context store, and enables context injection into new queries.
 */

const NOI_CONTEXT_KEY = 'noi_context_store';
const NOI_CONTEXT_MAX = 20; // maximum stored context entries
const MIN_AUTO_CAPTURE_LENGTH = 40; // minimum response chars for auto-capture

// ---------------------------------------------------------------------------
// Context Store — persisted in localStorage
// ---------------------------------------------------------------------------

class ContextStore {
  static load() {
    try {
      return JSON.parse(localStorage.getItem(NOI_CONTEXT_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static save(entries) {
    try {
      localStorage.setItem(NOI_CONTEXT_KEY, JSON.stringify(entries));
    } catch {
      // storage quota exceeded — drop oldest
      const trimmed = entries.slice(-Math.floor(NOI_CONTEXT_MAX / 2));
      localStorage.setItem(NOI_CONTEXT_KEY, JSON.stringify(trimmed));
    }
  }

  static add(entry) {
    const entries = ContextStore.load();
    entries.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      service: entry.service,
      query: entry.query || '',
      response: entry.response || '',
    });
    // keep at most NOI_CONTEXT_MAX entries
    const trimmed = entries.slice(-NOI_CONTEXT_MAX);
    ContextStore.save(trimmed);
    return trimmed;
  }

  static clear() {
    localStorage.removeItem(NOI_CONTEXT_KEY);
  }

  static getLatest(n = 3) {
    const entries = ContextStore.load();
    return entries.slice(-n);
  }
}

// ---------------------------------------------------------------------------
// Service Adapters — know how to read the current page's last response
// ---------------------------------------------------------------------------

const ServiceAdapters = {
  'chatgpt.com': {
    name: 'ChatGPT',
    getLastResponse() {
      const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
      return msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
    },
    getLastQuery() {
      const msgs = document.querySelectorAll('[data-message-author-role="user"]');
      return msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
    },
  },
  'claude.ai': {
    name: 'Claude',
    getLastResponse() {
      const msgs = document.querySelectorAll('.font-claude-message');
      return msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
    },
    getLastQuery() {
      const msgs = document.querySelectorAll('.font-user-message');
      return msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
    },
  },
  'gemini.google.com': {
    name: 'Gemini',
    getLastResponse() {
      const msgs = document.querySelectorAll('model-response');
      return msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
    },
    getLastQuery() {
      const msgs = document.querySelectorAll('.query-text');
      return msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
    },
  },
  'perplexity.ai': {
    name: 'Perplexity',
    getLastResponse() {
      const msgs = document.querySelectorAll('.prose');
      return msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
    },
    getLastQuery() {
      const msgs = document.querySelectorAll('[data-testid="user-query"]');
      return msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
    },
  },
  'localhost:8080': {
    name: 'OpenCog',
    getLastResponse() {
      const output = document.querySelector('#command-output');
      return output ? output.innerText.trim() : '';
    },
    getLastQuery() {
      const input = document.querySelector('#scheme-command');
      return input ? input.value.trim() : '';
    },
  },
  'localhost:17020': {
    name: 'OpenCog',
    getLastResponse() {
      const output = document.querySelector('#command-output');
      return output ? output.innerText.trim() : '';
    },
    getLastQuery() {
      const input = document.querySelector('#scheme-command');
      return input ? input.value.trim() : '';
    },
  },
};

function getAdapter() {
  const host = window.location.host;
  for (const key of Object.keys(ServiceAdapters)) {
    if (host.includes(key)) return ServiceAdapters[key];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Context Panel UI
// ---------------------------------------------------------------------------

class ContextPanel {
  constructor() {
    this.panel = null;
    this.visible = false;
    this._build();
  }

  _build() {
    const panel = document.createElement('div');
    panel.id = 'noi-context-panel';
    panel.innerHTML = `
      <div class="noi-ctx-header">
        <span>🧠 Noi Context</span>
        <div class="noi-ctx-actions">
          <button id="noi-ctx-capture" title="Capture current response">📥 Capture</button>
          <button id="noi-ctx-inject" title="Inject context into next query">💉 Inject</button>
          <button id="noi-ctx-clear" title="Clear all context">🗑 Clear</button>
          <button id="noi-ctx-toggle" title="Hide panel">✕</button>
        </div>
      </div>
      <div class="noi-ctx-body">
        <div id="noi-ctx-list"></div>
      </div>
    `;
    document.body.appendChild(panel);
    this.panel = panel;

    document.getElementById('noi-ctx-toggle').addEventListener('click', () => this.hide());
    document.getElementById('noi-ctx-capture').addEventListener('click', () => this.capture());
    document.getElementById('noi-ctx-inject').addEventListener('click', () => this.inject());
    document.getElementById('noi-ctx-clear').addEventListener('click', () => this.clearAll());

    this.render();
  }

  show() {
    this.panel.classList.add('visible');
    this.visible = true;
    this.render();
  }

  hide() {
    this.panel.classList.remove('visible');
    this.visible = false;
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  render() {
    const list = document.getElementById('noi-ctx-list');
    if (!list) return;
    const entries = ContextStore.load();
    if (!entries.length) {
      list.innerHTML = '<div class="noi-ctx-empty">No context captured yet. Use 📥 Capture after an AI responds.</div>';
      return;
    }
    list.innerHTML = entries.slice().reverse().map(e => `
      <div class="noi-ctx-entry" data-id="${e.id}">
        <div class="noi-ctx-meta">
          <span class="noi-ctx-service">${e.service}</span>
          <span class="noi-ctx-time">${new Date(e.timestamp).toLocaleTimeString()}</span>
          <button class="noi-ctx-del" data-id="${e.id}" title="Remove">✕</button>
        </div>
        ${e.query ? `<div class="noi-ctx-query"><strong>Q:</strong> ${this._truncate(e.query)}</div>` : ''}
        <div class="noi-ctx-response">${this._truncate(e.response, 200)}</div>
      </div>
    `).join('');

    list.querySelectorAll('.noi-ctx-del').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const id = parseInt(ev.target.dataset.id);
        const entries = ContextStore.load().filter(e => e.id !== id);
        ContextStore.save(entries);
        this.render();
      });
    });
  }

  _truncate(text, max = 120) {
    if (!text) return '';
    // escape HTML to prevent injection
    const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return safe.length > max ? safe.slice(0, max) + '…' : safe;
  }

  capture() {
    const adapter = getAdapter();
    if (!adapter) return;
    const response = adapter.getLastResponse();
    const query = adapter.getLastQuery();
    if (!response) {
      this._notify('No response found on page.');
      return;
    }
    ContextStore.add({ service: adapter.name, query, response });
    this.render();
    this._notify('Context captured!');
  }

  inject() {
    const latest = ContextStore.getLatest(3);
    if (!latest.length) {
      this._notify('No context to inject.');
      return;
    }
    const contextText = latest.map(e =>
      `[${e.service}]: ${e.response}`
    ).join('\n\n');
    const prefix = `Prior context:\n${contextText}\n\n---\n`;

    const textarea = document.querySelector('textarea') ||
                     document.querySelector('[contenteditable="true"]') ||
                     document.querySelector('#scheme-command');
    if (!textarea) {
      this._notify('No input field found.');
      return;
    }
    const existing = textarea.value !== undefined ? textarea.value : textarea.innerText;
    if (textarea.value !== undefined) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value') ||
                     Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (setter && setter.set) {
        setter.set.call(textarea, prefix + existing);
      } else {
        textarea.value = prefix + existing;
      }
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    } else {
      textarea.focus();
      textarea.innerText = prefix + existing;
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
    this._notify('Context injected!');
  }

  clearAll() {
    ContextStore.clear();
    this.render();
    this._notify('Context cleared.');
  }

  _notify(msg) {
    const note = document.createElement('div');
    note.className = 'noi-ctx-notification';
    note.textContent = msg;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2500);
  }
}

// ---------------------------------------------------------------------------
// Toggle Button (always-visible launcher)
// ---------------------------------------------------------------------------

function buildToggleButton(panel) {
  const btn = document.createElement('button');
  btn.id = 'noi-ctx-launcher';
  btn.title = 'Noi Context Manager';
  btn.textContent = '🧠';
  btn.addEventListener('click', () => panel.toggle());
  document.body.appendChild(btn);
}

// ---------------------------------------------------------------------------
// Auto-capture on page mutation (optional passive mode)
// ---------------------------------------------------------------------------

function setupAutoCapture(panel) {
  const adapter = getAdapter();
  if (!adapter) return;

  let lastCaptured = '';
  const observer = new MutationObserver(() => {
    const response = adapter.getLastResponse();
    if (response && response !== lastCaptured && response.length > MIN_AUTO_CAPTURE_LENGTH) {
      lastCaptured = response;
      // Store passively without UI flash — user can review in panel
      const query = adapter.getLastQuery();
      ContextStore.add({ service: adapter.name, query, response });
      if (panel.visible) panel.render();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

(function init() {
  const panel = new ContextPanel();
  buildToggleButton(panel);
  setupAutoCapture(panel);

  // Expose to NoiAsk bus so other extensions can request context
  window.NoiContextManager = {
    getLatest: (n) => ContextStore.getLatest(n),
    add: (entry) => ContextStore.add(entry),
    clear: () => ContextStore.clear(),
  };
})();
