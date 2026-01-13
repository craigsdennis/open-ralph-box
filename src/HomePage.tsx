import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgent } from "agents/react";
import type { Hub, HubState } from "../worker/agents/hub";
import { Footer } from "./components/Footer";

export function HomePage() {
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const { stub } = useAgent<Hub, HubState>({
    agent: "hub",
    onStateUpdate(state) {
      setRecentProjects(state.recentProjects);
    } 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    setIsCreating(true);
    try {
      const safeName = await stub.createNewProject({ name: projectName.trim() });
      navigate(`/projects/${safeName}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neural-black relative">
      {/* Hero Section */}
      <div className="flex-1 flex items-center px-6 py-16 relative z-10">
        <div className="max-w-4xl w-full mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-cf-orange rounded animate-pulse-glow animate-fade-in">
              <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white font-sans tracking-tight animate-fade-in stagger-1">
              Open Ralph Box
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-4 animate-fade-in stagger-2">
              Neural Command Center for AI Agents
            </p>
            <p className="text-sm text-cf-orange font-mono uppercase tracking-widest font-semibold animate-fade-in stagger-3">
              Cloudflare_Workers • Durable_Objects • Real-time_Sync
            </p>
          </div>

          {/* Create Project Card */}
          <div className="max-w-xl mx-auto">
            <div className="terminal-border bg-panel-surface p-8 animate-fade-in stagger-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="projectName" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">
                    Initialize_Project
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                    className="w-full px-4 py-3.5 bg-command-bg border border-circuit-line rounded text-white placeholder-gray-600 focus:outline-none focus:border-cf-orange focus:ring-1 focus:ring-cf-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                    disabled={isCreating}
                    autoFocus
                  />
                  <p className="mt-3 text-xs text-gray-500 font-mono">
                    <span className="text-cf-orange">$</span> Enter unique identifier for agent instance
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isCreating || !projectName.trim()}
                  className="w-full bg-cf-orange hover:bg-orange-600 text-white py-4 px-6 rounded font-mono font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-cf-orange focus:ring-offset-2 focus:ring-offset-panel-surface disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-cf-orange-glow hover:shadow-cf-orange/50 disabled:shadow-none"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Initializing...
                    </span>
                  ) : (
                    "Deploy Agent →"
                  )}
                </button>
              </form>
            </div>

            {/* Recent Projects */}
            {recentProjects.length > 0 && (
              <div className="mt-12 animate-fade-in stagger-5">
                <div className="circuit-decoration mb-6" />
                <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 font-mono">
                  Recent_Projects
                </h2>
                <div className="space-y-3">
                  {recentProjects.map((project, idx) => (
                    <button
                      key={project}
                      onClick={() => navigate(`/projects/${project}`)}
                      className={`w-full text-left terminal-border bg-panel-surface hover:bg-elevated-surface p-4 transition-all group animate-fade-in`}
                      style={{ animationDelay: `${(idx + 6) * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-command-bg border border-circuit-line flex items-center justify-center">
                            <svg className="w-5 h-5 text-cf-orange" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-mono text-sm group-hover:text-cf-orange transition-colors">
                              {project}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-1">
                              Agent_Instance
                            </div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-cf-orange group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
