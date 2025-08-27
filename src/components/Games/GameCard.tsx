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
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Game Image */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl text-white opacity-50">🎮</div>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
          <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 text-indigo-600 hover:text-indigo-700">
            <PlayIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {category}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        
        {/* Players and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
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