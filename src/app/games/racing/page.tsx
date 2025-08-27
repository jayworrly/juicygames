import MainLayout from '@/components/Layout/MainLayout';
import GameGrid from '@/components/Games/GameGrid';

export default function RacingGames() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Racing Games</h1>
          <p className="text-gray-600">
            Speed and competition in multiplayer racing adventures
          </p>
        </div>
        
        <GameGrid category="Racing" />
      </div>
    </MainLayout>
  );
}