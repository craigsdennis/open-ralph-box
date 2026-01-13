import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAgent } from "agents/react";
import type { Project, ProjectState } from "../worker/agents/project";
import { Footer } from "./components/Footer";
import { StoryCard } from "./components/StoryCard";
// @ts-ignore - no types available
import AnsiToHtml from 'ansi-to-html';

const ansiConverter = new AnsiToHtml({ fg: '#fff', bg: '#0f0f0f', newline: true, escapeXML: true });

export function ProjectPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<ProjectState | null>(null);
  const [description, setDescription] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [configJson, setConfigJson] = useState("");
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [planStatus, setPlanStatus] = useState<string>("");
  
  const agent = useAgent<Project, ProjectState>({
    agent: "project",
    name: name || "",
    onStateUpdate(newState) {
      console.log('State update received:', newState);
      setState(newState);
    }
  });
  
  // Log connection status
  console.log('Agent connection status:', agent.readyState);
  console.log('Agent:', agent);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    setIsPlanning(true);
    setTerminalOutput([]);
    setPlanStatus("");
    
    try {
      console.log('Starting plan call with StreamOptions...');
      
      // Use StreamOptions callbacks for streaming
      // @ts-ignore - streaming callable methods not in types yet
      await agent.call("plan", [{ description: description.trim() }], {
        onChunk: (chunk: any) => {
          console.log('onChunk:', chunk);
          
          if (chunk.type === "status") {
            setPlanStatus(chunk.message);
          } else if (chunk.type === "output") {
            setTerminalOutput(prev => [...prev, chunk.data]);
          }
        },
        onDone: (finalChunk: any) => {
          console.log('onDone:', finalChunk);
          
          if (finalChunk?.type === "complete") {
            setPlanStatus("Plan complete!");
          }
          setDescription("");
          setIsPlanning(false);
        },
        onError: (error: string) => {
          console.error('onError:', error);
          alert(`Failed to create plan: ${error}`);
          setIsPlanning(false);
        }
      });
      
      console.log('Call initiated, waiting for stream...');
    } catch (error) {
      console.error("Failed to create plan:", error);
      alert("Failed to create plan. Check console for details.");
      setIsPlanning(false);
    }
  };

  const handleInitializeSandbox = async () => {
    setIsInitializing(true);
    try {
      await agent.call("initializeSandbox");
      alert("Sandbox initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize sandbox:", error);
      alert("Failed to initialize sandbox");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleEditConfig = () => {
    setConfigJson(state?.opencodeConfigJson || "");
    setIsEditingConfig(true);
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      // First update the state
      await agent.call("updateConfig", [{ configJson }]);
      // Then write to sandbox
      await agent.call("writeConfigToSandbox");
      setIsEditingConfig(false);
      alert("Config updated and written to sandbox successfully!");
    } catch (error) {
      console.error("Failed to save config:", error);
      alert(`Failed to save config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  if (!name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Invalid project name</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neural-black flex flex-col relative">
      {/* Navigation Bar */}
      <nav className="border-b border-circuit-line sticky top-0 z-10 bg-command-bg/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 bg-cf-orange rounded flex items-center justify-center animate-pulse-glow">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-sm font-bold text-white group-hover:text-cf-orange transition-colors font-mono tracking-tight">OPEN_RALPH_BOX</h1>
                <p className="text-[10px] text-gray-500 font-mono">NEURAL_CMD_CENTER</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-semibold text-gray-400 hover:text-white bg-panel-surface hover:bg-elevated-surface border border-circuit-line rounded transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>BACK</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
        {/* Project Header with Circuit Decoration */}
        <div className="mb-8 circuit-decoration pl-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse"></div>
              <span className="text-[10px] text-terminal-green uppercase tracking-widest font-mono font-bold">SYSTEM_ACTIVE</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-circuit-line to-transparent"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-sans tracking-tight">
            {state?.displayName || name}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <p className="text-cf-orange font-mono font-semibold">
              {name}
            </p>
            <span className="text-gray-700">|</span>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">
              AGENT_PROJECT
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Display Name Card */}
          <div className="terminal-border bg-panel-surface p-4 hover:bg-elevated-surface transition-all group animate-fade-in stagger-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                DISPLAY_NAME
              </h3>
              <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg font-bold text-white truncate font-sans">
              {state?.displayName || "Not set"}
            </p>
          </div>

          {/* Skills Card */}
          <div className="terminal-border bg-panel-surface p-4 hover:bg-elevated-surface transition-all group animate-fade-in stagger-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                SKILLS_LOADED
              </h3>
              <svg className="w-3.5 h-3.5 text-cf-orange group-hover:text-orange-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-cf-orange font-mono">
                {state?.skills ? Object.keys(state.skills).length : 0}
              </p>
              <p className="text-gray-500 text-xs font-mono uppercase tracking-wider">
                ACTIVE
              </p>
            </div>
          </div>

          {/* Status Card */}
          <div className="terminal-border bg-panel-surface p-4 hover:bg-elevated-surface transition-all group animate-fade-in stagger-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                CONNECTION
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-terminal-green rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-terminal-green rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-1 bg-terminal-green rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-terminal-green group-hover:text-green-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-lg font-bold text-terminal-green block leading-none font-mono">ONLINE</span>
                <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Planning Form */}
        <div className="mb-6 animate-fade-in stagger-4">
          <div className="terminal-border bg-panel-surface p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-command-bg border border-circuit-line flex items-center justify-center">
                <svg className="w-6 h-6 text-electric-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1 font-sans">Plan Your Project</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">AI-Powered_PRD_Generator</p>
              </div>
            </div>

            <form onSubmit={handlePlan} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">
                  Project_Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: A simple todo app with a clean UI, user authentication, and the ability to organize tasks into categories..."
                  rows={6}
                  className="w-full px-4 py-3 bg-command-bg border border-circuit-line text-white placeholder-gray-600 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none font-mono text-sm"
                  disabled={isPlanning}
                />
                <p className="mt-3 text-xs text-gray-500 font-mono">
                  <span className="text-electric-blue">$</span> Specify features, design preferences, and technical requirements
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isPlanning || !description.trim()}
                className="w-full bg-electric-blue hover:bg-blue-400 text-neural-black py-4 px-6 font-mono font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-panel-surface disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50 disabled:shadow-none"
              >
                {isPlanning ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Generate Plan →"
                )}
              </button>
            </form>

            {/* Show terminal output during planning */}
            {isPlanning && (
              <div className="mt-6 pt-6 border-t border-circuit-line">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></div>
                  <h3 className="text-[10px] font-bold text-electric-blue uppercase tracking-widest font-mono">{planStatus || "Processing..."}</h3>
                </div>
                {terminalOutput.length > 0 && (
                  <div className="terminal-border bg-command-bg">
                    <div 
                      className="p-4 max-h-96 overflow-y-auto font-mono text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: ansiConverter.toHtml(terminalOutput.join(''))
                      }}
                      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Show PRD if available */}
            {state?.prd && (
              <div className="mt-6 pt-6 border-t border-circuit-line">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 font-mono">Generated_PRD</h3>
                <div className="terminal-border bg-command-bg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{state.prd}</pre>
                </div>
              </div>
            )}

            {/* Show Stories as Cards if available */}
            {state?.stories && state.stories.length > 0 && (
              <div className="mt-6 pt-6 border-t border-circuit-line">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">User Stories</h3>
                    <p className="text-sm text-gray-400 font-mono">{state.stories.length} stories generated</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-command-bg hover:bg-elevated-surface border border-circuit-line text-gray-400 hover:text-white transition-all">
                      BACKLOG
                    </button>
                    <button className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-command-bg hover:bg-elevated-surface border border-circuit-line text-gray-400 hover:text-white transition-all">
                      IN PROGRESS
                    </button>
                    <button className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-command-bg hover:bg-elevated-surface border border-circuit-line text-gray-400 hover:text-white transition-all">
                      DONE
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.stories.map((story, index) => (
                    <StoryCard key={story.id} story={story} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OpenCode Config Editor */}
        <div className="mb-6 animate-fade-in stagger-5">
          <div className="terminal-border bg-panel-surface p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-command-bg border border-circuit-line flex items-center justify-center">
                  <svg className="w-6 h-6 text-cf-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1 font-sans">OpenCode Configuration</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Config_Editor</p>
                </div>
              </div>
              {!isEditingConfig && (
                <button
                  onClick={handleEditConfig}
                  className="px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-cf-orange hover:text-orange-400 bg-cf-orange/10 hover:bg-cf-orange/20 border border-cf-orange/20 transition-all"
                >
                  Edit
                </button>
              )}
            </div>

            {!isEditingConfig ? (
              <div className="terminal-border bg-command-bg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {state?.opencodeConfigJson ? JSON.stringify(JSON.parse(state.opencodeConfigJson), null, 2) : "No config available"}
                </pre>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={configJson}
                  onChange={(e) => setConfigJson(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 bg-command-bg border border-circuit-line text-white placeholder-gray-600 focus:outline-none focus:border-cf-orange focus:ring-1 focus:ring-cf-orange transition-all font-mono text-sm"
                  placeholder="Paste your opencode.json here..."
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig || !configJson.trim()}
                    className="flex-1 bg-cf-orange hover:bg-orange-600 text-white py-3 px-6 font-mono font-bold text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-cf-orange focus:ring-offset-2 focus:ring-offset-panel-surface disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-cf-orange/30 hover:shadow-cf-orange/50 disabled:shadow-none"
                  >
                    {isSavingConfig ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save & Write →"
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditingConfig(false)}
                    disabled={isSavingConfig}
                    className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-command-bg hover:bg-elevated-surface border border-circuit-line transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Debug Section */}
        <div className="mb-6 animate-fade-in stagger-6">
          <div className="terminal-border bg-panel-surface p-6 border-terminal-green/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-command-bg border border-terminal-green/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-terminal-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1 font-sans">Debug Controls</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Dev_Tools</p>
              </div>
            </div>

            <button
              onClick={handleInitializeSandbox}
              disabled={isInitializing}
              className="w-full terminal-border bg-command-bg hover:bg-elevated-surface px-4 py-3 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-terminal-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm font-mono font-bold text-white group-hover:text-terminal-green transition-colors">
                    {isInitializing ? "Initializing Sandbox..." : "Initialize Sandbox"}
                  </span>
                </div>
                {!isInitializing && (
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-terminal-green group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>

            {/* Example Terminal Output */}
            <div className="mt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 font-mono">Example_Output:</p>
              <div className="terminal-border bg-command-bg p-4 overflow-auto max-h-40">
                <div 
                  className="font-mono text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: new AnsiToHtml({ fg: '#fff', bg: '#0f0f0f', newline: true, escapeXML: true }).toHtml("\x1B[94m\x1B[1m| \x1B[0m\x1B[90m cloudflare-developer-documentation_search_cloudflare_documentation  \x1B[0m{\"query\":\"Durable Objects getting started\"}")
                  }}
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Configuration */}
          <div className="terminal-border bg-panel-surface p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-command-bg border border-circuit-line flex items-center justify-center">
                <svg className="w-6 h-6 text-cf-orange" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1 font-sans">Configuration</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">System_Settings</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-circuit-line">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-500">OpenCode_Config</span>
                <span className="text-sm font-bold text-terminal-green font-mono">Active</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-circuit-line">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-500">Agent_Type</span>
                <span className="text-sm font-bold text-white font-mono">Project</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-500">State_Sync</span>
                <span className="px-2 py-1 bg-terminal-green/10 text-terminal-green border border-terminal-green/20 font-mono text-[10px] uppercase tracking-wider">
                  Enabled
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="terminal-border bg-panel-surface p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-command-bg border border-circuit-line flex items-center justify-center">
                <svg className="w-6 h-6 text-electric-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1 font-sans">Quick Actions</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Shortcuts</p>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full terminal-border bg-command-bg hover:bg-elevated-surface px-4 py-3 transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-white group-hover:text-cf-orange transition-colors">Edit Configuration</span>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-cf-orange group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <button className="w-full terminal-border bg-command-bg hover:bg-elevated-surface px-4 py-3 transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-white group-hover:text-cf-orange transition-colors">Manage Skills</span>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-cf-orange group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <button className="w-full terminal-border bg-command-bg hover:bg-elevated-surface px-4 py-3 transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-white group-hover:text-cf-orange transition-colors">View Logs</span>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-cf-orange group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
