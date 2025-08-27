export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-700">
      <div className="px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left side - Copyright */}
          <div className="text-sm text-gray-400">
            © 2024 JuicyGames. All rights reserved.
          </div>

          {/* Center - Quick Links */}
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
              About
            </a>
            <a href="#" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
              Support
            </a>
            <a href="#" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
              Terms
            </a>
          </div>

          {/* Right side - Social */}
          <div className="flex items-center space-x-4">
            <a href="#" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
              Discord
            </a>
            <a href="#" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}