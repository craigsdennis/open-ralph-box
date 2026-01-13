import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgent } from "agents/react";
import type { Hub, HubState } from "../worker/agents/hub";

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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full">
          {/* Main Heading */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/50">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Open Ralph Box
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-2">
              Build AI agents with Cloudflare Workers
            </p>
            <p className="text-sm text-gray-500">
              Durable Objects • State Management • Real-time Sync
            </p>
          </div>

          {/* Create Project Card */}
          <div className="max-w-xl mx-auto">
            <div className="bg-dark-card border border-gray-800 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-3">
                    Project Name
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                    className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                    disabled={isCreating}
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Choose a unique name for your agent project
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isCreating || !projectName.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-dark-card disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 disabled:shadow-none"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating project...
                    </span>
                  ) : (
                    "Start Building →"
                  )}
                </button>
              </form>
            </div>

            {/* Recent Projects */}
            {recentProjects.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-medium text-gray-400 mb-4 px-1">
                  Recent Projects
                </h2>
                <div className="space-y-2">
                  {recentProjects.map((project) => (
                    <button
                      key={project}
                      onClick={() => navigate(`/projects/${project}`)}
                      className="w-full text-left px-5 py-4 bg-dark-card border border-gray-800 hover:border-gray-700 rounded-xl transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                          </div>
                          <span className="text-white font-mono text-sm group-hover:text-orange-400 transition-colors">
                            {project}
                          </span>
                        </div>
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            Powered by{" "}
            <a 
              href="https://workers.cloudflare.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition-colors"
            >
              Cloudflare Agents SDK
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
