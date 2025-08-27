import MainLayout from '@/components/Layout/MainLayout';
import GameGrid from '@/components/Games/GameGrid';

export default function PuzzleGames() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Puzzle Games</h1>
          <p className="text-gray-600">
            Challenge your mind with brain-teasing multiplayer puzzles
          </p>
        </div>
        
        <GameGrid category="Puzzle" />
      </div>
    </MainLayout>
  );
}