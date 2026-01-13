# Streaming Terminal Output from Sandbox

## Approach: Use WebSocket onMessage

Since `@callable` doesn't support streaming, we should use WebSockets to stream terminal output from the sandbox in real-time.

## Implementation Plan

### 1. Agent Side (Project Agent)

```typescript
// In project.ts

@callable()
async startPlan({ description }: { description: string }) {
  // Just start the plan, don't wait for completion
  if (!this.sandbox) {
    this.sandbox = getSandbox(this.env.Sandbox, `box-${this.name}`);
  }
  
  // Execute in background and stream output via WebSocket
  this.executePlanAndStream(description);
  
  return { started: true };
}

private async executePlanAndStream(description: string) {
  await this.sandbox!.exec(
    `opencode run "Use the demo-app-planner skill to plan for ${description}"`,
    {
      stream: true,
      onOutput: (sandboxStreamType: string, data: string) => {
        // Send to all connected WebSocket clients
        this.broadcast(JSON.stringify({
          type: 'terminal_output',
          stream: sandboxStreamType,
          data: data
        }));
      },
    }
  );
  
  // Read results and update state
  const storiesJSON = await this.sandbox!.readFile("stories.json");
  const prd = await this.sandbox!.readFile("prd.md");
  this.setState({
    ...this.state,
    prd: prd.content,
    storiesJSON: storiesJSON.content,
  });
  
  // Send completion message
  this.broadcast(JSON.stringify({
    type: 'terminal_complete'
  }));
}
```

### 2. Client Side (React)

```typescript
// In ProjectPage.tsx

const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

const { stub, socket } = useAgent<Project, ProjectState>({
  agent: "project",
  name: name || "",
  onStateUpdate(newState) {
    setState(newState);
  }
});

// Listen for WebSocket messages
useEffect(() => {
  if (!socket) return;
  
  const handleMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'terminal_output') {
      setTerminalOutput(prev => [...prev, message.data]);
    } else if (message.type === 'terminal_complete') {
      console.log('Terminal execution complete');
    }
  };
  
  socket.addEventListener('message', handleMessage);
  
  return () => {
    socket.removeEventListener('message', handleMessage);
  };
}, [socket]);

// In the UI
<div>
  <h3>Terminal Output</h3>
  <TerminalOutput content={terminalOutput.join('')} />
</div>
```

## Benefits

1. **Real-time streaming**: Output appears as it happens
2. **No polling**: WebSocket push from server
3. **ANSI support**: Terminal colors preserved
4. **Multiple clients**: All connected clients see the stream

## Alternative: Server-Sent Events (SSE)

If WebSocket is too complex, could use SSE with a separate endpoint, but WebSocket is better since we already have the connection.
