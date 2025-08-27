import GameCard from './GameCard';

// Sample game data
const sampleGames = [
  {
    id: '1',
    title: 'Battle Arena',
    description: 'Fast-paced multiplayer battle royale where strategy meets action',
    image: '/games/battle-arena.jpg',
    players: 23,
    maxPlayers: 50,
    category: 'Action',
    difficulty: 'Hard' as const,
  },
  {
    id: '2',
    title: 'Puzzle Master',
    description: 'Challenge your mind with collaborative puzzle solving',
    image: '/games/puzzle-master.jpg',
    players: 8,
    maxPlayers: 12,
    category: 'Puzzle',
    difficulty: 'Medium' as const,
  },
  {
    id: '3',
    title: 'Speed Racers',
    description: 'High-octane racing with friends around the world',
    image: '/games/speed-racers.jpg',
    players: 15,
    maxPlayers: 20,
    category: 'Racing',
    difficulty: 'Easy' as const,
  },
  {
    id: '4',
    title: 'Tower Defense Pro',
    description: 'Defend your base in this strategic multiplayer tower defense',
    image: '/games/tower-defense.jpg',
    players: 6,
    maxPlayers: 8,
    category: 'Strategy',
    difficulty: 'Hard' as const,
  },
  {
    id: '5',
    title: 'Word Warriors',
    description: 'Battle with words in this competitive vocabulary game',
    image: '/games/word-warriors.jpg',
    players: 12,
    maxPlayers: 16,
    category: 'Puzzle',
    difficulty: 'Medium' as const,
  },
  {
    id: '6',
    title: 'Space Conquest',
    description: 'Explore and conquer the galaxy with other players',
    image: '/games/space-conquest.jpg',
    players: 31,
    maxPlayers: 100,
    category: 'Strategy',
    difficulty: 'Hard' as const,
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Games</h2>
          <p className="text-gray-600">Jump into the most popular multiplayer games right now</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
          <p className="text-gray-500">Try browsing a different category</p>
        </div>
      )}
    </div>
  );
}