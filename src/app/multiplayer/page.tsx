import MainLayout from '@/components/Layout/MainLayout';
import GameGrid from '@/components/Games/GameGrid';

export default function MultiplayerGames() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Multiplayer Games</h1>
          <p className="text-gray-600">
            Join friends and compete with players from around the world
          </p>
        </div>

        {/* Live Games Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">🔴 Live Games</h2>
          <p className="text-green-700">Join active games with available spots</p>
        </div>
        
        <GameGrid />
      </div>
    </MainLayout>
  );
}