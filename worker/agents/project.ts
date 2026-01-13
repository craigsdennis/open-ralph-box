/// <reference types="../../worker-configuration.d.ts" />

import { getSandbox, Sandbox } from "@cloudflare/sandbox";
import { Agent, callable, StreamingResponse } from "agents";

import implementStory from "../skill-templates/implement-story.txt";
import approveStory from "../skill-templates/approve-story.txt";
import demoAppPlanner from "../skill-templates/demo-app-planner.txt";

const defaultOpencodeConfig = {
  $schema: "https://opencode.ai/config.json",
  provider: {
    "cloudflare-ai-gateway": {
      models: {
        "openai/gpt-4o": {},
        "anthropic/claude-sonnet-4": {},
      },
    },
  },
  mcp: {
    "cloudflare-developer-documentation": {
      type: "remote",
      url: "https://docs.mcp.cloudflare.com/mcp",
      enabled: true,
    },
  },
  tools: {
    skill: true,
  },
};

export type Story = {
  id: string;
  title: string;
  status: "backlog" | "in-progress" | "done";
  priority: "critical" | "high" | "medium" | "low";
  points?: number;
  sprint?: number;
  description: string;
  acceptanceCriteria?: string[];
  technicalNotes?: string[];
  dependencies?: string[];
};

export type ProjectState = {
  displayName?: string;
  skills: Record<string, string>;
  opencodeConfigJson: string;
  storiesJSON?: string;
  stories?: Story[];
  prd?: string;
};

export class Project extends Agent<Env, ProjectState> {
  private sandbox?: Sandbox;

  initialState: ProjectState = {
    skills: {
      "demo-app-planner": demoAppPlanner,
      "implement-story": implementStory,
      "approve-story": approveStory,
    },
    opencodeConfigJson: JSON.stringify(defaultOpencodeConfig),
  };

  async onRequest(request: Request): Promise<Response> {
    // Log the request for debugging
    console.log('onRequest called:', request.method, request.url);
    
    // Return 405 for non-POST - the SDK should handle callable methods
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    
    // Let the SDK handle callable method routing
    return new Response("Not implemented - use WebSocket for callable methods", { status: 501 });
  }

  @callable()
  async setup({ displayName }: { displayName: string }) {
    console.log('setup called with:', displayName);
    this.setState({
      ...this.state,
      displayName,
    });
    return { success: true, displayName };
  }

  @callable()
  async initializeSandbox() {
    this.sandbox = getSandbox(this.env.Sandbox, `box-${this.name}`);
    this.sandbox.setEnvVars({
      CLOUDFLARE_ACCOUNT_ID: this.env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_GATEWAY_ID: this.env.CLOUDFLARE_GATEWAY_ID,
      CLOUDFLARE_API_TOKEN: this.env.CLOUDFLARE_API_TOKEN,
    });
    console.log("Writing config");
    await this.sandbox.writeFile(
      "opencode.json",
      this.state.opencodeConfigJson
    );
    console.log("Adding skills");
    for (const [skillName, skill] of Object.entries(this.state.skills)) {
      await this.sandbox.mkdir(`.opencode/skill/${skillName}/`, {
        recursive: true,
      });
      await this.sandbox.writeFile(
        `.opencode/skill/${skillName}/SKILL.md`,
        skill
      );
    }
  }

  @callable({ streaming: true })
  async plan(stream: StreamingResponse, { description }: { description: string }) {
    console.log('plan() called with description:', description);
    
    if (!this.sandbox) {
      this.sandbox = getSandbox(this.env.Sandbox, `box-${this.name}`);
    }
    
    stream.send({ type: "status", message: "Starting planning..." });
    
    // Use exec with streaming callbacks
    await this.sandbox.exec(
      `opencode run "Use the demo-app-planner skill to plan for ${description}"`,
      {
        stream: true,
        onOutput: (streamType: 'stdout' | 'stderr', data: string) => {
          // Forward output in real-time
          stream.send({ type: "output", stream: streamType, data });
        },
      }
    );
    
    stream.send({ type: "status", message: "Reading generated files..." });
    
    const storiesJSON = await this.sandbox.readFile("stories.json");
    const prd = await this.sandbox.readFile("prd.md");
    
    // Parse stories from JSON
    let stories: Story[] = [];
    try {
      stories = JSON.parse(storiesJSON.content);
    } catch (e) {
      console.error("Failed to parse stories JSON:", e);
    }
    
    this.setState({
      ...this.state,
      prd: prd.content,
      storiesJSON: storiesJSON.content,
      stories,
    });
    
    stream.end({ 
      type: "complete", 
      prd: prd.content, 
      storiesJSON: storiesJSON.content,
      stories,
    });
  }

  @callable({ streaming: true })
  async iterate(stream: StreamingResponse) {
    if (!this.sandbox) {
      this.sandbox = getSandbox(this.env.Sandbox, `box-${this.name}`);
    }
    
    stream.send({ type: "status", message: "Starting iteration..." });
    
    // Use exec with streaming callbacks
    await this.sandbox.exec(
      `opencode run "Use the implement-story skill to continue."`,
      {
        stream: true,
        onOutput: (streamType: 'stdout' | 'stderr', data: string) => {
          // Forward output in real-time
          stream.send({ type: "output", stream: streamType, data });
        },
      }
    );
    
    stream.end({ type: "complete", message: "Iteration complete" });
  }

  @callable()
  async updateConfig({ configJson }: { configJson: string }) {
    // Validate it's valid JSON
    try {
      JSON.parse(configJson);
    } catch (e) {
      throw new Error("Invalid JSON format");
    }

    // Update state
    this.setState({
      ...this.state,
      opencodeConfigJson: configJson,
    });

    return { success: true };
  }

  @callable()
  async writeConfigToSandbox() {
    if (!this.sandbox) {
      this.sandbox = getSandbox(this.env.Sandbox, `box-${this.name}`);
    }

    // Write the config to the sandbox
    await this.sandbox.writeFile(
      "opencode.json",
      this.state.opencodeConfigJson
    );

    return { success: true, message: "Config written to sandbox successfully" };
  }
}
