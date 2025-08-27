import MainLayout from '@/components/Layout/MainLayout';
import GameGrid from '@/components/Games/GameGrid';

export default function ActionGames() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Action Games</h1>
          <p className="text-gray-600">
            Fast-paced, adrenaline-pumping games for competitive players
          </p>
        </div>
        
        <GameGrid category="Action" />
      </div>
    </MainLayout>
  );
}