import MainLayout from '@/components/Layout/MainLayout';
import GameGrid from '@/components/Games/GameGrid';

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to JuicyGames
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Play amazing multiplayer games with friends around the world. Join thousands of players online now!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">24,567</div>
            <div className="text-gray-300">Active Players</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">156</div>
            <div className="text-gray-300">Games Available</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">3,421</div>
            <div className="text-gray-300">Games Played Today</div>
          </div>
        </div>

        {/* Featured Games */}
        <GameGrid featured />

        {/* Call to Action */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Start Playing?
          </h2>
          <p className="text-gray-300 mb-6">
            Browse our collection of multiplayer games and find your next favorite!
          </p>
          <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200">
            Explore All Games
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
