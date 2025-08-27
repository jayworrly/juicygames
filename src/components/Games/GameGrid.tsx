import GameCard from './GameCard';

// Sample game data
const sampleGames = [
  {
    id: '1',
    title: 'Juicy Train',
    description: 'All aboard the ultimate multiplayer train adventure',
    image: '/memes/juicy-train.png',
    players: 42,
    maxPlayers: 100,
    category: 'Action',
    difficulty: 'Medium' as const,
  },
];

interface GameGridProps {
  category?: string;
  featured?: boolean;
}

export default function GameGrid({ category, featured = false }: GameGridProps) {
  const filteredGames = category 
    ? sampleGames.filter(game => game.category.toLowerCase() === category.toLowerCase())
    : sampleGames;

  const displayGames = featured ? filteredGames.slice(0, 3) : filteredGames;

  return (
    <div className="space-y-6">
      {featured && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Featured Game</h2>
          <p className="text-gray-300">Jump aboard the Juicy Train adventure!</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayGames.map((game) => (
          <GameCard key={game.id} {...game} />
        ))}
      </div>

      {displayGames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎮</div>
          <h3 className="text-lg font-medium text-white mb-2">No games found</h3>
          <p className="text-gray-400">Try browsing a different category</p>
        </div>
      )}
    </div>
  );
}