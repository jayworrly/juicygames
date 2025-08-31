'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { ArrowLeft, Users, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';

export default function JuicyTrainGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [trainPosition, setTrainPosition] = useState(50);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0 && !gameOver) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true);
            setGameStarted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, timeLeft, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameStarted) return;
      
      if (event.key === 'ArrowLeft' && trainPosition > 0) {
        setTrainPosition(prev => Math.max(0, prev - 10));
        setScore(prev => prev + 1);
      } else if (event.key === 'ArrowRight' && trainPosition < 100) {
        setTrainPosition(prev => Math.min(100, prev + 10));
        setScore(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, trainPosition]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setGameStarted(true);
    setTrainPosition(50);
  };


  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">🚂 Juicy Train</h1>
              <p className="text-gray-400">Use arrow keys to move the train!</p>
            </div>
          </div>

          {/* Game Stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <Users className="h-4 w-4" />
              <span>42/100 playing</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-gray-800 rounded-lg p-6">
          {/* Score and Timer */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2 text-yellow-400">
              <Trophy className="h-5 w-5" />
              <span className="text-xl font-bold">Score: {score}</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Clock className="h-5 w-5" />
              <span className="text-xl font-bold">Time: {timeLeft}s</span>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="bg-gradient-to-b from-blue-600 to-green-600 rounded-lg h-96 relative overflow-hidden">
            {/* Sky and background */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600">
              {/* Clouds */}
              <div className="absolute top-4 left-10 text-white text-2xl opacity-70">☁️</div>
              <div className="absolute top-8 right-20 text-white text-xl opacity-60">☁️</div>
              <div className="absolute top-6 left-1/2 text-white text-3xl opacity-50">☁️</div>
            </div>

            {/* Train Track */}
            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-b from-green-500 to-green-700">
              <div className="absolute bottom-8 w-full h-2 bg-gray-700"></div>
              <div className="absolute bottom-6 w-full h-1 bg-gray-600"></div>
            </div>

            {/* Train */}
            <div 
              className="absolute bottom-12 transition-all duration-300 ease-out"
              style={{ left: `${trainPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="text-6xl">🚂</div>
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏁</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                  <p className="text-xl text-gray-300 mb-6">Final Score: {score}</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Start Game Overlay */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚂</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Ready to Play?</h2>
                  <p className="text-gray-300 mb-6">Use ← → arrow keys to move the train and score points!</p>
                  <button
                    onClick={startGame}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors mr-4"
                  >
                    Start Game
                  </button>
                  <Link
                    href="/"
                    className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors inline-block"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Game Instructions */}
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <ul className="text-gray-300 space-y-1">
              <li>• Use the ← → arrow keys to move your train left and right</li>
              <li>• Each movement earns you points</li>
              <li>• You have 60 seconds to get the highest score possible</li>
              <li>• Challenge your friends to beat your score!</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}