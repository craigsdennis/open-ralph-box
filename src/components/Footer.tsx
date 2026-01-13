export function Footer() {
  return (
    <footer className="border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            Built with 🧡 using{" "}
            <a 
              href="https://agents.cloudflare.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition-colors font-medium"
            >
              Cloudflare Agents SDK
            </a>
            {" && "}
            <a 
              href="https://sandbox.cloudflare.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition-colors font-medium"
            >
              Sandbox
            </a>
          </p>
          <p className="text-sm text-gray-500">
            <a 
              href="https://github.com/craigsdennis" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 hover:text-gray-400 transition-colors"
            >
              <span>👀</span>
              <span>the code</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
