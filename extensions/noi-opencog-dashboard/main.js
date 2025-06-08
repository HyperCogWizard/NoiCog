/**
 * OpenCog Dashboard Extension for Noi
 * Provides a web interface for interacting with OpenCog instances
 */

class OpenCogDashboard {
  constructor() {
    this.cogServer = null;
    this.connected = false;
    this.init();
  }

  init() {
    // Check if we're on a page that needs the dashboard
    if (this.shouldInjectDashboard()) {
      this.injectDashboard();
    }
  }

  shouldInjectDashboard() {
    const url = window.location.href;
    return url.includes('localhost:8080') || 
           url.includes('localhost:17020') || 
           url.includes('opencog-dashboard.local');
  }

  injectDashboard() {
    // Clear existing content and inject dashboard
    document.body.innerHTML = '';
    
    const dashboardHTML = `
      <div id="opencog-dashboard">
        <header class="dashboard-header">
          <h1>🧠 OpenCog Dashboard</h1>
          <div class="connection-status" id="connection-status">
            <span class="status-indicator offline"></span>
            <span>Disconnected</span>
          </div>
        </header>
        
        <main class="dashboard-main">
          <div class="control-panel">
            <div class="connection-controls">
              <h3>Connection</h3>
              <div class="input-group">
                <label for="server-url">Server URL:</label>
                <input type="text" id="server-url" value="http://localhost:17020" placeholder="http://localhost:17020">
              </div>
              <button id="connect-btn" class="btn primary">Connect</button>
              <button id="disconnect-btn" class="btn secondary" disabled>Disconnect</button>
            </div>
            
            <div class="command-panel">
              <h3>Command Interface</h3>
              <div class="input-group">
                <label for="scheme-command">Scheme Command:</label>
                <textarea id="scheme-command" rows="3" placeholder="(cog-atomspace)"></textarea>
              </div>
              <button id="execute-btn" class="btn primary" disabled>Execute</button>
            </div>
          </div>
          
          <div class="output-panel">
            <h3>Output</h3>
            <div id="command-output" class="output-area">
              <div class="welcome-message">
                Welcome to OpenCog Dashboard! Connect to an OpenCog server to begin.
              </div>
            </div>
          </div>
          
          <div class="atomspace-panel">
            <h3>AtomSpace</h3>
            <div class="atomspace-controls">
              <button id="refresh-atomspace" class="btn secondary" disabled>Refresh</button>
              <button id="clear-atomspace" class="btn danger" disabled>Clear AtomSpace</button>
            </div>
            <div id="atomspace-content" class="atomspace-area">
              <div class="placeholder">Connect to view AtomSpace contents</div>
            </div>
          </div>
        </main>
      </div>
    `;
    
    document.body.innerHTML = dashboardHTML;
    this.attachEventListeners();
  }

  attachEventListeners() {
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const executeBtn = document.getElementById('execute-btn');
    const refreshBtn = document.getElementById('refresh-atomspace');
    const clearBtn = document.getElementById('clear-atomspace');

    connectBtn?.addEventListener('click', () => this.connect());
    disconnectBtn?.addEventListener('click', () => this.disconnect());
    executeBtn?.addEventListener('click', () => this.executeCommand());
    refreshBtn?.addEventListener('click', () => this.refreshAtomSpace());
    clearBtn?.addEventListener('click', () => this.clearAtomSpace());

    // Allow Enter key to execute commands
    const commandInput = document.getElementById('scheme-command');
    commandInput?.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.executeCommand();
      }
    });
  }

  async connect() {
    const serverUrl = document.getElementById('server-url')?.value || 'http://localhost:17020';
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('#connection-status span:last-child');
    const output = document.getElementById('command-output');

    try {
      // Simulate connection (in a real implementation, this would make HTTP requests to OpenCog REST API)
      statusIndicator.className = 'status-indicator connecting';
      statusText.textContent = 'Connecting...';
      
      this.addOutput(`Attempting to connect to ${serverUrl}...`);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll simulate a successful connection
      this.connected = true;
      this.cogServer = serverUrl;
      
      statusIndicator.className = 'status-indicator online';
      statusText.textContent = 'Connected';
      
      this.addOutput(`✅ Connected to OpenCog server at ${serverUrl}`);
      this.addOutput(`Server info: OpenCog version 6.0.0 (simulated)`);
      
      // Enable controls
      document.getElementById('execute-btn').disabled = false;
      document.getElementById('disconnect-btn').disabled = false;
      document.getElementById('refresh-atomspace').disabled = false;
      document.getElementById('clear-atomspace').disabled = false;
      document.getElementById('connect-btn').disabled = true;
      
      this.refreshAtomSpace();
      
    } catch (error) {
      statusIndicator.className = 'status-indicator offline';
      statusText.textContent = 'Connection Failed';
      this.addOutput(`❌ Connection failed: ${error.message}`);
    }
  }

  disconnect() {
    this.connected = false;
    this.cogServer = null;
    
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('#connection-status span:last-child');
    
    statusIndicator.className = 'status-indicator offline';
    statusText.textContent = 'Disconnected';
    
    this.addOutput('📴 Disconnected from OpenCog server');
    
    // Disable controls
    document.getElementById('execute-btn').disabled = true;
    document.getElementById('disconnect-btn').disabled = true;
    document.getElementById('refresh-atomspace').disabled = true;
    document.getElementById('clear-atomspace').disabled = true;
    document.getElementById('connect-btn').disabled = false;
    
    // Clear atomspace view
    document.getElementById('atomspace-content').innerHTML = '<div class="placeholder">Connect to view AtomSpace contents</div>';
  }

  async executeCommand() {
    if (!this.connected) {
      this.addOutput('❌ Not connected to OpenCog server');
      return;
    }

    const command = document.getElementById('scheme-command')?.value?.trim();
    if (!command) {
      this.addOutput('❌ Please enter a command');
      return;
    }

    this.addOutput(`> ${command}`);
    
    try {
      // Simulate command execution
      const result = await this.simulateSchemeExecution(command);
      this.addOutput(result);
      
      // Clear command input
      document.getElementById('scheme-command').value = '';
      
      // Refresh atomspace if command might have modified it
      if (this.commandModifiesAtomSpace(command)) {
        setTimeout(() => this.refreshAtomSpace(), 500);
      }
      
    } catch (error) {
      this.addOutput(`❌ Error: ${error.message}`);
    }
  }

  async simulateSchemeExecution(command) {
    // Simulate various OpenCog commands
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (command.includes('cog-atomspace')) {
      return '#<AtomSpace@0x12345678>';
    } else if (command.includes('ConceptNode')) {
      const match = command.match(/ConceptNode\s+"([^"]+)"/);
      const concept = match ? match[1] : 'unknown';
      return `(ConceptNode "${concept}")`;
    } else if (command.includes('cog-incoming')) {
      return '()';
    } else if (command.includes('cog-get-atoms')) {
      return '((ConceptNode "cat") (ConceptNode "animal") (InheritanceLink (ConceptNode "cat") (ConceptNode "animal")))';
    } else if (command.includes('help')) {
      return `Available commands:
- (cog-atomspace) - Get current atomspace
- (ConceptNode "name") - Create concept node
- (cog-get-atoms 'ConceptNode) - Get all concept nodes
- (cog-incoming atom) - Get incoming links
- (help) - Show this help`;
    } else {
      return `Result: ${command} executed successfully`;
    }
  }

  commandModifiesAtomSpace(command) {
    return command.includes('Node') || 
           command.includes('Link') || 
           command.includes('cog-set-tv') ||
           command.includes('cog-delete');
  }

  async refreshAtomSpace() {
    if (!this.connected) return;
    
    const atomspaceContent = document.getElementById('atomspace-content');
    atomspaceContent.innerHTML = '<div class="loading">Loading AtomSpace...</div>';
    
    try {
      // Simulate fetching atomspace content
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const atomspaceHTML = `
        <div class="atom-list">
          <div class="atom-item">
            <span class="atom-type">ConceptNode</span>
            <span class="atom-name">"cat"</span>
            <span class="atom-tv">[1.0, 0.9]</span>
          </div>
          <div class="atom-item">
            <span class="atom-type">ConceptNode</span>
            <span class="atom-name">"animal"</span>
            <span class="atom-tv">[1.0, 0.8]</span>
          </div>
          <div class="atom-item">
            <span class="atom-type">InheritanceLink</span>
            <span class="atom-name">cat → animal</span>
            <span class="atom-tv">[0.9, 0.95]</span>
          </div>
        </div>
        <div class="atomspace-stats">
          <p>Total atoms: 3</p>
          <p>Nodes: 2, Links: 1</p>
        </div>
      `;
      
      atomspaceContent.innerHTML = atomspaceHTML;
      
    } catch (error) {
      atomspaceContent.innerHTML = `<div class="error">Error loading AtomSpace: ${error.message}</div>`;
    }
  }

  async clearAtomSpace() {
    if (!this.connected) return;
    
    if (!confirm('Are you sure you want to clear the AtomSpace? This action cannot be undone.')) {
      return;
    }
    
    try {
      this.addOutput('🗑️ Clearing AtomSpace...');
      await new Promise(resolve => setTimeout(resolve, 500));
      this.addOutput('✅ AtomSpace cleared');
      
      document.getElementById('atomspace-content').innerHTML = `
        <div class="atomspace-stats">
          <p>Total atoms: 0</p>
          <p>AtomSpace is empty</p>
        </div>
      `;
      
    } catch (error) {
      this.addOutput(`❌ Error clearing AtomSpace: ${error.message}`);
    }
  }

  addOutput(message) {
    const output = document.getElementById('command-output');
    const timestamp = new Date().toLocaleTimeString();
    
    const messageElement = document.createElement('div');
    messageElement.className = 'output-line';
    messageElement.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    
    output.appendChild(messageElement);
    output.scrollTop = output.scrollHeight;
  }
}

// Initialize dashboard when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new OpenCogDashboard();
  });
} else {
  new OpenCogDashboard();
}

// Also support the NoiAsk pattern for compatibility
class OpenCogAsk {
  static name = 'OpenCog';
  static url = 'http://localhost:8080';

  static sync(message) {
    const commandInput = document.querySelector('#scheme-command');
    if (commandInput) {
      commandInput.focus();
      commandInput.value = message;
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
      });
      commandInput.dispatchEvent(inputEvent);
    }
  }

  static submit() {
    const executeBtn = document.querySelector('#execute-btn');
    if (executeBtn && !executeBtn.disabled) {
      executeBtn.click();
    }
  }

  static autoFocus() {
    const commandInput = document.querySelector('#scheme-command');
    if (commandInput) {
      commandInput.focus();
    }
  }

  static simulateUserInput(element, text) {
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
    });
    element.focus();
    element.value = text;
    element.dispatchEvent(inputEvent);
  }

  static autoClick(btn) {
    btn.focus();
    btn.disabled = false;
    btn.click();
  }
}

// Register with NoiAsk if available
if (typeof window !== 'undefined' && window.NoiAsk) {
  window.NoiAsk = {
    ...window.NoiAsk,
    OpenCogAsk,
  };
}