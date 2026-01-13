# Open Ralph Box - Agent Architecture

## Overview

Open Ralph Box is a Neural Command Center for orchestrating AI coding agents using Cloudflare's infrastructure. It uses the Cloudflare Agents SDK (v0.3.4) to create persistent, stateful agents backed by Durable Objects that manage Cloudflare Sandboxes running OpenCode (an AI coding agent).

## Architecture

### Technology Stack

- **Frontend**: React 19, React Router, Vite, Tailwind CSS v4
- **Backend**: Cloudflare Workers with Agents SDK (v0.3.4)
- **Agent Runtime**: Cloudflare Durable Objects with state persistence
- **Code Execution**: Cloudflare Sandboxes (via `@cloudflare/sandbox`)
- **Design**: "Neural Command Center" aesthetic (technical brutalist/cyberpunk)
- **Fonts**: JetBrains Mono (technical) + Manrope (refined)

### Color Palette

```
Neural Black:       #0a0a0a (background)
Command BG:         #111111 (darker surfaces)
Panel Surface:      #151515 (cards)
Elevated Surface:   #1a1a1a (hover states)
CF Orange:          #FF6B35 (primary accent)
Electric Blue:      #00D4FF (active states)
Terminal Green:     #00FF9F (success/online)
Circuit Line:       rgba(255, 107, 53, 0.12) (borders)
Grid Line:          rgba(255, 107, 53, 0.08) (background grid)
```

## Agent System

### Hub Agent (`worker/agents/hub.ts`)

**Purpose**: Top-level orchestrator for managing multiple projects

**State Structure**:
```typescript
interface HubState {
  recentProjects: string[];  // Array of project safe names
}
```

**Callable Methods**:
- `createNewProject({ name: string }): string` - Creates a new project agent and returns safe name
- `getProjectNames(): string[]` - Lists all project names

**State Persistence**: Uses Durable Object storage to persist recent projects across sessions

### Project Agent (`worker/agents/project.ts`)

**Purpose**: Manages individual AI coding projects with integrated Cloudflare Sandbox

**State Structure**:
```typescript
interface ProjectState {
  displayName: string;           // Human-readable project name
  safeName: string;              // URL-safe identifier
  sandboxId: string | null;      // Cloudflare Sandbox ID
  status: 'initializing' | 'ready' | 'error';
  errorMessage?: string;
  lastActivity: number;          // Unix timestamp
  // Planning state
  prd?: string;                  // Product Requirements Document
  stories?: Story[];             // Parsed user stories
  // OpenCode config
  config?: OpencodeConfig;
}

interface Story {
  id: string;
  title: string;
  status: 'backlog' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  points?: number;
  sprint?: string;
  description: string;
  acceptanceCriteria: string[];
  technicalNotes?: string;
  dependencies?: string[];
}

interface OpencodeConfig {
  name: string;
  description?: string;
  instructions?: string;
  mcpServers?: Record<string, unknown>;
}
```

**Callable Methods**:

1. `initialize()` - Sets up the Cloudflare Sandbox instance
2. `plan({ description: string })` - **STREAMING** - Generates PRD and user stories from description
3. `executeStory({ storyId: string })` - **STREAMING** - Executes a specific user story using OpenCode
4. `exec({ command: string })` - **STREAMING** - Runs arbitrary command in sandbox
5. `readFile({ filePath: string }): string` - Reads file from sandbox filesystem
6. `writeFile({ filePath: string, content: string })` - Writes file to sandbox
7. `listFiles({ directory?: string }): string[]` - Lists files in sandbox
8. `getConfig(): OpencodeConfig` - Gets OpenCode configuration
9. `updateConfig({ config: OpencodeConfig })` - Updates OpenCode config
10. `getDetails(): ProjectState` - Returns full project state

### Streaming Implementation

**Critical Pattern**: Real-time streaming from sandbox to browser

#### Backend Pattern (`worker/agents/project.ts`)

```typescript
import { StreamingResponse } from "agents";

@callable({ streaming: true })
async plan(
  stream: StreamingResponse,  // MUST be first parameter
  { description }: { description: string }
) {
  // Send status updates
  stream.send({ 
    type: "status", 
    message: "Starting planning..." 
  });

  // Execute command with streaming output
  await this.sandbox.exec(command, {
    stream: true,
    onOutput: (streamType, data) => {
      stream.send({ 
        type: "output", 
        stream: streamType,  // "stdout" or "stderr"
        data 
      });
    }
  });

  // Send final result
  stream.end({ 
    type: "complete", 
    prd,
    storiesJSON, 
    stories 
  });
}
```

**Key Rules**:
1. Mark method with `@callable({ streaming: true })`
2. `StreamingResponse` MUST be the FIRST parameter
3. Regular arguments come AFTER `StreamingResponse`
4. Use `stream.send()` for incremental updates
5. Use `stream.end()` for final result
6. Never close stream in `finally` block - SDK handles cleanup

#### Frontend Pattern (`src/ProjectPage.tsx`)

```typescript
import { StreamOptions } from "agents/react";

const options: StreamOptions<ChunkType, FinalType> = {
  onChunk: (chunk: ChunkType) => {
    // Handle incremental updates
    if (chunk.type === "output") {
      setOutput(prev => prev + chunk.data);
    } else if (chunk.type === "status") {
      setStatus(chunk.message);
    }
  },
  onDone: (final: FinalType) => {
    // Handle completion
    if (final.type === "complete") {
      setPrd(final.prd);
      setStories(final.stories);
    }
  },
  onError: (error: Error) => {
    console.error("Stream error:", error);
    setError(error.message);
  }
};

// Make streaming call
await stub.call("plan", [{ description }], options);
```

**Key Points**:
- Arguments array `[{ description }]` does NOT include `StreamingResponse`
- `StreamingResponse` is injected by SDK automatically
- Use `StreamOptions` for type safety
- Handle `onChunk`, `onDone`, and `onError` callbacks

## State Management Flow

### Project Creation Flow

1. **User submits project name** → `HomePage` component
2. **Hub agent creates project** → `hub.createNewProject()`
   - Sanitizes name to create `safeName`
   - Adds to `recentProjects` list
   - Persists state to Durable Object storage
3. **Navigate to project page** → `/projects/:safeName`
4. **Project agent initializes** → `project.initialize()`
   - Creates Cloudflare Sandbox
   - Stores `sandboxId` in state
   - Sets status to `'ready'`
5. **Frontend loads project** → `ProjectPage` component
   - Connects to project agent via `useAgent` hook
   - Receives state updates via `onStateUpdate` callback

### Planning Flow

1. **User enters feature description** → `ProjectPage` planning form
2. **Frontend calls plan** → `stub.call("plan", [{ description }], options)`
3. **Project agent streams execution**:
   - Status: "Generating PRD..."
   - Output: Real-time OpenCode execution logs
   - Status: "Parsing stories..."
   - Complete: Final PRD + parsed stories
4. **Frontend updates UI** → Shows terminal output + story cards
5. **State persists** → `prd` and `stories` saved to Durable Object

## File Structure

```
open-ralph-box/
├── worker/
│   ├── agents/
│   │   ├── hub.ts           # Hub agent (project orchestration)
│   │   └── project.ts       # Project agent (sandbox + OpenCode)
│   └── index.ts             # Worker entry point
├── src/
│   ├── components/
│   │   ├── Footer.tsx       # Neural Command Center footer
│   │   └── StoryCard.tsx    # User story card component
│   ├── HomePage.tsx         # Project creation + recent projects
│   ├── ProjectPage.tsx      # Project details + planning + stories
│   ├── index.css            # Design system (animations, terminal borders)
│   └── main.tsx             # React entry point
├── public/
│   └── opencode-config.yaml # Default OpenCode configuration template
└── tailwind.config.ts       # Tailwind v4 theme configuration
```

## Design System

### CSS Classes (src/index.css)

**Animations**:
- `.animate-fade-in` - Fade in from opacity 0 to 1
- `.animate-pulse-glow` - Pulsing glow effect for hero icon
- `.stagger-1` through `.stagger-6` - Staggered animation delays (50ms increments)

**Borders & Decorations**:
- `.terminal-border` - Terminal-style border with corner accents
- `.circuit-decoration` - Horizontal circuit line with centered node

**Background**:
- Circuit board grid pattern (32px grid, orange lines)
- Diagonal accent animation across page

### Component Patterns

**Terminal Card**:
```tsx
<div className="terminal-border bg-panel-surface p-6">
  {/* Content */}
</div>
```

**Mono Label**:
```tsx
<label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
  Label_Text
</label>
```

**Status Badge**:
```tsx
<span className="px-2 py-1 bg-terminal-green/10 text-terminal-green border border-terminal-green/20 font-mono text-[10px] uppercase tracking-wider">
  System_Active
</span>
```

## Current Status

### Completed Features
✅ Hub agent with project management  
✅ Project agent with sandbox integration  
✅ Streaming from sandbox to browser  
✅ Planning flow (description → PRD → stories)  
✅ Story card system with full metadata  
✅ Neural Command Center design system  
✅ HomePage redesign (hero, create form, recent projects)  
✅ ProjectPage partial redesign (header, stats, stories)  

### In Progress
🚧 ProjectPage planning form redesign  
🚧 Terminal output styling improvements  
🚧 OpenCode config editor UI  

### Upcoming Features
🔜 Story filtering (by status)  
🔜 Story detail modal  
🔜 Story status updates (drag-drop or click)  
🔜 Execute story feature  
🔜 File browser for sandbox filesystem  

## Common Gotchas & Solutions

### Streaming Issues

**Problem**: Stream hangs or doesn't receive data  
**Solution**: Ensure `StreamingResponse` is FIRST parameter in method signature

**Problem**: "Cannot call streaming method as regular method"  
**Solution**: Use `stub.call()` with `StreamOptions`, not `stub.methodName()`

**Problem**: Stream closes prematurely  
**Solution**: Don't call `stream.close()` - SDK handles cleanup automatically

### State Synchronization

**Problem**: State updates not reflecting in UI  
**Solution**: Ensure `onStateUpdate` callback is updating React state correctly

**Problem**: State lost after refresh  
**Solution**: State persists in Durable Object; frontend needs to reconnect to agent

### Sandbox Issues

**Problem**: Sandbox creation fails  
**Solution**: Check Cloudflare account limits and bindings in `wrangler.toml`

**Problem**: Commands timeout  
**Solution**: Increase timeout in `sandbox.exec()` options

## Development

### Running Locally

```bash
npm install
npm run dev
```

This starts:
- **Frontend**: Vite dev server on `http://localhost:5173`
- **Worker**: Wrangler dev server (proxied through Vite)

### Deployment

```bash
npm run deploy
```

Deploys both Worker and static assets to Cloudflare.

## OpenCode Integration

### Configuration

OpenCode is configured via `.opencode/config.yaml` in the sandbox filesystem. The default template is in `public/opencode-config.yaml`.

**Key Configuration Fields**:
- `name` - Project identifier
- `description` - Project purpose
- `instructions` - Custom instructions for OpenCode agent
- `mcpServers` - MCP (Model Context Protocol) server integrations

### Planning Prompt

Located in `worker/agents/project.ts:168-252`, this prompt instructs OpenCode to:
1. Generate a comprehensive PRD from user description
2. Break down PRD into implementable user stories
3. Output stories as structured JSON with:
   - Title, description, acceptance criteria
   - Priority, story points, status
   - Technical notes, dependencies, sprint assignment

### Story Execution

The `executeStory` method (planned) will:
1. Load story details from state
2. Generate OpenCode prompt with story context
3. Stream execution to frontend
4. Update story status on completion

## Monitoring & Debugging

### Worker Logs

```bash
npx wrangler tail
```

### Durable Object State

Access via Cloudflare Dashboard:
1. Workers & Pages → Durable Objects
2. Select object ID (project `safeName` or `hub`)
3. View/edit storage keys

### Frontend DevTools

React DevTools shows:
- Agent state via `useAgent` hook
- Component re-renders
- State update callbacks

## Resources

- [Cloudflare Agents SDK Docs](https://developers.cloudflare.com/workers/runtime-apis/agents/)
- [Cloudflare Sandbox Docs](https://developers.cloudflare.com/workers/runtime-apis/sandbox/)
- [OpenCode Documentation](https://opencode.ai/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## Contributing

When adding new features:

1. **Update agent state types** if adding new state fields
2. **Mark streaming methods** with `@callable({ streaming: true })`
3. **Follow design system** - use terminal borders, mono labels, circuit decorations
4. **Add TypeScript types** for all method parameters and return values
5. **Update this document** when changing architecture or adding major features
