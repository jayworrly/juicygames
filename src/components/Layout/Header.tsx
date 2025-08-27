'use client';

import { MessageCircleIcon, UserIcon } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section - empty for now */}
        <div className="flex items-center">
          {/* Empty space or could add other elements later */}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Chat */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
          >
            <MessageCircleIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
            >
              <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium hidden md:block">Player</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}