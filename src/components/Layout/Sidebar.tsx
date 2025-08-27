'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  HomeIcon, 
  GamepadIcon, 
  UsersIcon, 
  TrophyIcon, 
  SettingsIcon,
  MenuIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Action Games', href: '/games/action', icon: GamepadIcon },
  { name: 'Puzzle Games', href: '/games/puzzle', icon: GamepadIcon },
  { name: 'Racing Games', href: '/games/racing', icon: GamepadIcon },
  { name: 'Multiplayer', href: '/multiplayer', icon: UsersIcon },
  { name: 'Leaderboards', href: '/leaderboards', icon: TrophyIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <XIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-gray-900 border-r border-gray-700 transform transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'lg:w-64' : 'lg:w-16'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center h-16 px-4 border-b border-gray-700">
            {(isSidebarOpen || isMobileMenuOpen) && (
              <h1 className="text-xl font-bold text-indigo-400 flex-1">JuicyGames</h1>
            )}
            
            {/* Desktop toggle button */}
            <button
              type="button"
              className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors duration-200
                    ${!isSidebarOpen && !isMobileMenuOpen ? 'lg:justify-center lg:px-3' : ''}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={!isSidebarOpen && !isMobileMenuOpen ? item.name : undefined}
                >
                  <IconComponent className={`h-5 w-5 ${(isSidebarOpen || isMobileMenuOpen) ? 'mr-3' : ''}`} aria-hidden="true" />
                  {(isSidebarOpen || isMobileMenuOpen) && (
                    <span>{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer section */}
          {(isSidebarOpen || isMobileMenuOpen) && (
            <div className="p-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 text-center">
                © 2024 JuicyGames
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}