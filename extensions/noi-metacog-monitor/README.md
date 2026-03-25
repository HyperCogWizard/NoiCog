# @noi/metacog-monitor

Meta-cognitive monitoring extension for NoiCog. Tracks query patterns, response latency, cognitive load, and per-service metrics across all AI services in real time.

## Features

- **Query instrumentation**: Detects when a query is submitted (button click or Enter key) and records start time.
- **Response tracking**: Monitors DOM mutations to detect when a response finishes and calculates latency.
- **Per-service breakdown**: Shows query counts and average latency for each AI service visited.
- **Cognitive load indicator**: Heuristic load bar based on queries-per-5-minutes (Low / Moderate / High).
- **Persistent metrics**: Events stored in `localStorage` (up to 200 entries) and survive page reloads.
- **Reset**: Clear all metrics with one click.
- **Cross-extension API**: Exposes `window.NoiMetaCogMonitor` for programmatic access.

## UI

Click the 📊 launcher button (bottom-right, above the context manager button) to toggle the monitor dashboard.

## API

```js
// Get computed statistics
window.NoiMetaCogMonitor.getStats();
// → { totalQueries, avgLatencyMs, avgQueryLen, avgResponseLen, serviceBreakdown, ... }

// Get raw event log
window.NoiMetaCogMonitor.getEvents();

// Reset all metrics
window.NoiMetaCogMonitor.clear();
```

## Metrics Tracked

| Metric | Description |
|---|---|
| Total queries | Number of queries submitted across all services |
| Avg latency | Mean time (ms) from query submit to response appearance |
| Avg query length | Mean character count of submitted queries |
| Avg response length | Mean character count of AI responses |
| Per-service queries | Query count broken down by AI service |
| Cognitive load | Heuristic: queries per 5-minute sliding window |
