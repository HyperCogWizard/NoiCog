# Extension Architecture

## Extension System Design Principles

The NoiCog extension architecture implements a **hypergraph-centric plugin framework** that enables modular cognitive enhancements while maintaining system coherence and security isolation.

## Extension Ecosystem Overview

```mermaid
graph TD
    subgraph "Extension Runtime Environment"
        ExtLoader[Extension Loader]
        ExtManager[Extension Manager]
        ExtSandbox[Security Sandbox]
        ExtAPI[Extension API Layer]
    end
    
    subgraph "Core Extensions"
        NoiAsk[NoiAsk System]
        NoiAskCustom[NoiAsk Custom]
        NoiReset[Style Reset]
        OpenCogDash[OpenCog Dashboard]
    end
    
    subgraph "Extension Capabilities"
        DOMManip[DOM Manipulation]
        EventSys[Event System]
        Storage[Local Storage]
        Network[Network Access]
        UI[UI Injection]
    end
    
    subgraph "AI Service Integrations"
        OpenAI[OpenAI Integration]
        Claude[Claude Integration] 
        Gemini[Gemini Integration]
        Grok[Grok Integration]
        DeepSeek[DeepSeek Integration]
        OpenCog[OpenCog Integration]
        CustomAI[Custom AI Services]
    end
    
    ExtLoader --> ExtManager
    ExtManager --> ExtSandbox
    ExtSandbox --> ExtAPI
    
    ExtAPI --> NoiAsk
    ExtAPI --> NoiAskCustom
    ExtAPI --> NoiReset
    ExtAPI --> OpenCogDash
    
    NoiAsk --> DOMManip
    NoiAsk --> EventSys
    NoiAsk --> Storage
    NoiAsk --> Network
    
    OpenCogDash --> UI
    OpenCogDash --> Network
    OpenCogDash --> Storage
    
    NoiAsk --> OpenAI
    NoiAsk --> Claude
    NoiAsk --> Gemini
    NoiAsk --> Grok
    NoiAsk --> DeepSeek
    NoiAsk --> CustomAI
    
    OpenCogDash --> OpenCog
    
    style ExtManager fill:#e3f2fd
    style NoiAsk fill:#fce4ec
    style OpenCogDash fill:#fff3e0
    style OpenCog fill:#e8f5e8
```

## Extension Architecture Patterns

### **NoiAsk Pattern Implementation**

The NoiAsk pattern represents a standardized interface for AI service integration, implementing cognitive synergy optimization through uniform communication protocols.

```mermaid
classDiagram
    class NoiAsk {
        <<abstract>>
        +string name
        +string url
        +sync(message)
        +submit()
        +autoFocus()
        +autoClick(btn)
    }
    
    class OpenAIAsk {
        +name: "ChatGPT"
        +url: "https://chatgpt.com"
        +sync(message)
        +submit()
    }
    
    class ClaudeAsk {
        +name: "Claude"
        +url: "https://claude.ai"
        +sync(message)
        +submit()
        +autoFocus()
    }
    
    class OpenCogAsk {
        +name: "OpenCog Dashboard"
        +url: "http://localhost:8080"
        +sync(message)
        +submit()
        +simulateUserInput(element, text)
    }
    
    class GeminiAsk {
        +name: "Gemini"
        +url: "https://gemini.google.com"
        +sync(message)
        +submit()
    }
    
    NoiAsk <|-- OpenAIAsk
    NoiAsk <|-- ClaudeAsk
    NoiAsk <|-- OpenCogAsk
    NoiAsk <|-- GeminiAsk
    
    note for NoiAsk "Base pattern for AI service integration\nEnables batch processing and\nadaptive attention allocation"
    note for OpenCogAsk "Specialized for cognitive\narchitecture integration"
```

### **Extension Lifecycle Management**

```mermaid
sequenceDiagram
    participant Browser as Noi Browser
    participant ExtMgr as Extension Manager
    participant Ext as Extension
    participant Sandbox as Security Sandbox
    participant API as Extension API
    
    Browser->>ExtMgr: Load extensions
    ExtMgr->>Sandbox: Create isolated context
    Sandbox->>Ext: Initialize extension
    Ext->>API: Register capabilities
    API->>ExtMgr: Confirm registration
    ExtMgr->>Browser: Extension ready
    
    loop Runtime Operations
        Browser->>ExtMgr: Extension request
        ExtMgr->>Sandbox: Validate request
        Sandbox->>Ext: Execute operation
        Ext->>API: Access browser features
        API->>Browser: Perform action
        Browser-->>ExtMgr: Return result
        ExtMgr-->>Browser: Forward response
    end
    
    Browser->>ExtMgr: Shutdown
    ExtMgr->>Ext: Cleanup
    Ext->>Sandbox: Release resources
    Sandbox->>ExtMgr: Confirm cleanup
```

## Module Interaction Patterns

### **Bidirectional Extension Synergies**

The extension system implements sophisticated inter-module communication enabling emergent cognitive behaviors:

```mermaid
graph LR
    subgraph "NoiAsk Coordination Hub"
        BatchProc[Batch Processor]
        QueryRouter[Query Router]
        ResultAggr[Result Aggregator]
        ContextMgr[Context Manager]
    end
    
    subgraph "OpenCog Integration"
        SchemeBridge[Scheme Bridge]
        AtomSpaceConn[AtomSpace Connector]
        CognitiveEval[Cognitive Evaluator]
    end
    
    subgraph "AI Service Adapters"
        ChatGPTAdapt[ChatGPT Adapter]
        ClaudeAdapt[Claude Adapter]
        GeminiAdapt[Gemini Adapter]
        CustomAdapt[Custom Adapters]
    end
    
    subgraph "Cross-Cutting Concerns"
        ErrorHandler[Error Handler]
        Logger[Logger]
        Config[Configuration]
        Cache[Response Cache]
    end
    
    BatchProc --> QueryRouter
    QueryRouter --> ChatGPTAdapt
    QueryRouter --> ClaudeAdapt
    QueryRouter --> GeminiAdapt
    QueryRouter --> CustomAdapt
    QueryRouter --> SchemeBridge
    
    SchemeBridge --> AtomSpaceConn
    AtomSpaceConn --> CognitiveEval
    CognitiveEval --> ResultAggr
    
    ChatGPTAdapt --> ResultAggr
    ClaudeAdapt --> ResultAggr
    GeminiAdapt --> ResultAggr
    CustomAdapt --> ResultAggr
    
    ContextMgr <--> BatchProc
    ContextMgr <--> QueryRouter
    ContextMgr <--> ResultAggr
    
    ErrorHandler <--> BatchProc
    ErrorHandler <--> QueryRouter
    ErrorHandler <--> SchemeBridge
    
    Logger <--> ErrorHandler
    Config <--> ContextMgr
    Cache <--> ResultAggr
    
    style BatchProc fill:#ffeb3b
    style ResultAggr fill:#4caf50
    style SchemeBridge fill:#2196f3
    style ContextMgr fill:#9c27b0
```

## Extension Security Model

### **Sandbox Architecture**

```mermaid
graph TB
    subgraph "Browser Security Context"
        MainProc[Main Process]
        RendererProc[Renderer Process]
        ExtProc[Extension Process]
    end
    
    subgraph "Extension Sandbox"
        ExtContext[Extension Context]
        PermModel[Permission Model]
        APIGateway[API Gateway]
        ResLimiter[Resource Limiter]
    end
    
    subgraph "Permitted Operations"
        DOMAccess[DOM Access]
        StorageAccess[Storage Access]
        NetworkReq[Network Requests]
        EventListen[Event Listening]
    end
    
    subgraph "Restricted Operations"
        FileSystem[File System]
        NativeAPI[Native APIs]
        CrossOrigin[Cross-Origin Access]
        SystemCmd[System Commands]
    end
    
    MainProc --> ExtProc
    ExtProc --> ExtContext
    ExtContext --> PermModel
    PermModel --> APIGateway
    APIGateway --> ResLimiter
    
    ResLimiter --> DOMAccess
    ResLimiter --> StorageAccess
    ResLimiter --> NetworkReq
    ResLimiter --> EventListen
    
    PermModel -.->|Blocks| FileSystem
    PermModel -.->|Blocks| NativeAPI
    PermModel -.->|Blocks| CrossOrigin
    PermModel -.->|Blocks| SystemCmd
    
    style PermModel fill:#f44336
    style APIGateway fill:#ff9800
    style ResLimiter fill:#ffc107
    style DOMAccess fill:#4caf50
```

## Cognitive Extension Patterns

### **Adaptive Attention Allocation in Extensions**

The extension system implements meta-cognitive patterns that enable self-optimizing behavior:

```mermaid
stateDiagram-v2
    [*] --> Monitoring
    
    state Monitoring {
        [*] --> Performance_Tracking
        Performance_Tracking --> Load_Analysis
        Load_Analysis --> Pattern_Recognition
        Pattern_Recognition --> [*]
    }
    
    Monitoring --> Adaptation: Threshold exceeded
    
    state Adaptation {
        [*] --> Resource_Reallocation
        Resource_Reallocation --> Priority_Adjustment
        Priority_Adjustment --> Configuration_Update
        Configuration_Update --> [*]
    }
    
    Adaptation --> Optimization: Adaptation complete
    
    state Optimization {
        [*] --> Algorithm_Tuning
        Algorithm_Tuning --> Cache_Optimization
        Cache_Optimization --> Response_Filtering
        Response_Filtering --> [*]
    }
    
    Optimization --> Monitoring: Optimization complete
    
    state Performance_Tracking {
        Response_Time --> [*]
        Success_Rate --> [*]
        Resource_Usage --> [*]
    }
    
    state Pattern_Recognition {
        Query_Patterns --> [*]
        User_Behavior --> [*]
        System_Performance --> [*]
    }
```

## Extension Development Framework

### **Extension Manifest Structure**

Each extension follows a standardized manifest pattern that enables cognitive integration:

```json
{
  "manifest_version": 3,
  "name": "Extension Name",
  "version": "1.0.0",
  "description": "Cognitive enhancement description",
  "permissions": [
    "activeTab",
    "storage",
    "background"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }],
  "noi_integration": {
    "cognitive_patterns": ["batch_processing", "adaptive_routing"],
    "ai_services": ["openai", "claude", "opencog"],
    "data_flows": ["query_analysis", "result_synthesis"]
  }
}
```

### **Extension Registration Pattern**

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Ext as Extension
    participant Registry as Extension Registry
    participant NoiAsk as NoiAsk System
    participant Validator as Validator
    
    Dev->>Ext: Implement NoiAsk pattern
    Ext->>Registry: Register extension
    Registry->>Validator: Validate manifest
    Validator->>Registry: Confirm compliance
    Registry->>NoiAsk: Add to service pool
    NoiAsk->>Ext: Test integration
    Ext-->>NoiAsk: Confirm functionality
    NoiAsk->>Registry: Mark as active
    Registry-->>Dev: Extension ready
```

This extension architecture enables the emergence of distributed cognitive capabilities, where individual extensions contribute to a collective intelligence that exceeds the capabilities of any single component, implementing true cognitive synergy optimization through adaptive, hypergraph-centric design patterns.