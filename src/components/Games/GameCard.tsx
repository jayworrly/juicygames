'use client';

import { PlayIcon, UsersIcon } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  players: number;
  maxPlayers: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function GameCard({ 
  id, 
  title, 
  description, 
  image, 
  players, 
  maxPlayers, 
  category, 
  difficulty 
}: GameCardProps) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy':
        return 'bg-green-900 text-green-300';
      case 'Medium':
        return 'bg-yellow-900 text-yellow-300';
      case 'Hard':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Game Image */}
      <div className="h-48 bg-gray-900">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="px-4 pt-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(difficulty)}`}>
          {difficulty}
        </span>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
          <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
            {category}
          </span>
        </div>
        
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{description}</p>
        
        {/* Players and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>{players}/{maxPlayers} playing</span>
          </div>
          
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors duration-200">
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
}