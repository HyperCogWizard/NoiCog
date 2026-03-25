# @noi/context-manager

Advanced context awareness extension for NoiCog. Captures AI responses and maintains a cross-service conversation context store, enabling context injection into new queries.

## Features

- **Auto-capture**: Passively detects new AI responses via DOM mutation observer and stores them in `localStorage`.
- **Manual capture**: Click 📥 **Capture** to save the current page's latest response.
- **Context injection**: Click 💉 **Inject** to prepend the three most recent context entries into the active input field.
- **Context panel**: Click the 🧠 launcher button (bottom-right) to open/close the context panel showing all stored entries.
- **Per-entry deletion**: Remove individual context entries with ✕.
- **Clear all**: Wipe the context store with 🗑 **Clear**.
- **Cross-extension API**: Exposes `window.NoiContextManager` so other extensions can read or add context programmatically.

## Supported Services

ChatGPT, Claude, Gemini, Perplexity, GitHub Copilot, Mistral, Groq, DeepSeek, HuggingChat, Microsoft Copilot, OpenCog Dashboard (localhost:8080 / localhost:17020).

## Storage

Context entries are persisted in `localStorage` under the key `noi_context_store`. A maximum of 20 entries are kept (oldest entries are automatically removed when the limit is exceeded).

## API

```js
// Read the N most recent context entries
window.NoiContextManager.getLatest(3);

// Manually add a context entry
window.NoiContextManager.add({ service: 'MyService', query: 'What is X?', response: 'X is...' });

// Clear all stored context
window.NoiContextManager.clear();
```
