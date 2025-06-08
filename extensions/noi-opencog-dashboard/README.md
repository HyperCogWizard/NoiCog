# OpenCog Dashboard Extension

An interactive dashboard for monitoring and interacting with OpenCog instances within the Noi browser.

## Features

- **Connection Management**: Connect to local or remote OpenCog servers
- **Command Interface**: Execute Scheme commands directly in the browser
- **AtomSpace Viewer**: Monitor and visualize the contents of the AtomSpace
- **Real-time Output**: View command results and server responses
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. Install the extension in Noi
2. Navigate to `http://localhost:8080` or configure your OpenCog server URL
3. Click "Connect" to establish connection with your OpenCog instance
4. Use the command interface to execute Scheme commands
5. Monitor AtomSpace contents in real-time

## Supported URLs

- `http://localhost:8080/*` - Default OpenCog web interface
- `http://localhost:17020/*` - OpenCog CogServer REST API
- `https://opencog-dashboard.local/*` - Custom dashboard URL

## Commands

The dashboard supports standard OpenCog Scheme commands:

- `(cog-atomspace)` - Get current atomspace
- `(ConceptNode "name")` - Create concept nodes
- `(cog-get-atoms 'ConceptNode)` - List all concept nodes
- `(cog-incoming atom)` - Get incoming links
- `(help)` - Show available commands

## Development

This extension follows the Noi extension pattern and integrates with the NoiAsk system for batch command processing.

## Version

0.1.0 - Initial implementation with basic dashboard functionality