export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-700">
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              JuicyGames
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              The ultimate destination for multiplayer online games.
            </p>
          </div>

          {/* Games */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Games
            </h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Action Games
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Puzzle Games
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Racing Games
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Multiplayer
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Connect
            </h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  YouTube
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-indigo-400">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-400 text-center">
            © 2024 JuicyGames. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}