'use client';

import { SearchIcon, BellIcon, UserIcon, MenuIcon } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section with sidebar toggle */}
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle button (hidden on mobile since mobile has its own toggle) */}
          <button
            type="button"
            className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={toggleSidebar}
          >
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search games..."
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
          >
            <BellIcon className="h-6 w-6" aria-hidden="true" />
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