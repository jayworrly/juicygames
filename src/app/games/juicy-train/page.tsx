'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { ArrowLeft, Users, Trophy, Crown } from 'lucide-react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  snake: Position[];
  direction: Direction;
  score: number;
  color: string;
  alive: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface Food {
  id: string;
  position: Position;
  value: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const GRID_SIZE = 20;

export default function JuicyTrainGame() {
  const [connected, setConnected] = useState(false);
  const [gameJoined, setGameJoined] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [food, setFood] = useState<Food[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameArea, setGameArea] = useState({ width: 800, height: 600 });
  const [playerCount, setPlayerCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socket.on('gameJoined', ({ playerId, gameArea }) => {
      console.log('Game joined:', playerId);
      setGameJoined(true);
      setGameArea(gameArea);
    });

    socket.on('gameState', ({ players, food, leaderboard }) => {
      setPlayers(players);
      setFood(food);
      setLeaderboard(leaderboard);
      setPlayerCount(players.length);
      
      // Find current player
      const current = players.find((p: Player) => p.id === socket.id);
      setCurrentPlayer(current || null);
    });

    socket.on('playerJoined', (player) => {
      console.log('Player joined:', player.name);
    });

    socket.on('playerLeft', (playerId) => {
      console.log('Player left:', playerId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
      setGameJoined(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Game controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameJoined || !socketRef.current) return;
      
      let direction: Direction | null = null;
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          break;
      }
      
      if (direction) {
        event.preventDefault();
        socketRef.current.emit('changeDirection', direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameJoined]);

  // Canvas rendering
  useEffect(() => {
    if (!gameJoined || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, gameArea.width, gameArea.height);

    // Draw grid (subtle)
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let x = 0; x <= gameArea.width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gameArea.height);
      ctx.stroke();
    }
    for (let y = 0; y <= gameArea.height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gameArea.width, y);
      ctx.stroke();
    }

    // Draw food
    food.forEach(f => {
      const intensity = f.value > 2 ? '#ffeb3b' : f.value > 1 ? '#ff9800' : '#4caf50';
      ctx.fillStyle = intensity;
      ctx.fillRect(f.position.x + 2, f.position.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
      
      // Add glow effect
      ctx.shadowColor = intensity;
      ctx.shadowBlur = 8;
      ctx.fillRect(f.position.x + 4, f.position.y + 4, GRID_SIZE - 8, GRID_SIZE - 8);
      ctx.shadowBlur = 0;
    });

    // Draw players
    players.forEach(player => {
      if (!player.alive) return;
      
      player.snake.forEach((segment, index) => {
        // Head is brighter, body gets darker
        const alpha = index === 0 ? 1 : Math.max(0.3, 1 - (index * 0.05));
        const color = player.color;
        
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        
        if (index === 0) {
          // Draw head with special styling
          ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
          
          // Draw eyes
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 1;
          const eyeSize = 3;
          const eyeOffset = 6;
          
          switch (player.direction) {
            case 'up':
              ctx.fillRect(segment.x + 4, segment.y + 3, eyeSize, eyeSize);
              ctx.fillRect(segment.x + 13, segment.y + 3, eyeSize, eyeSize);
              break;
            case 'down':
              ctx.fillRect(segment.x + 4, segment.y + 14, eyeSize, eyeSize);
              ctx.fillRect(segment.x + 13, segment.y + 14, eyeSize, eyeSize);
              break;
            case 'left':
              ctx.fillRect(segment.x + 3, segment.y + 4, eyeSize, eyeSize);
              ctx.fillRect(segment.x + 3, segment.y + 13, eyeSize, eyeSize);
              break;
            case 'right':
              ctx.fillRect(segment.x + 14, segment.y + 4, eyeSize, eyeSize);
              ctx.fillRect(segment.x + 14, segment.y + 13, eyeSize, eyeSize);
              break;
          }
        } else {
          // Draw body segment
          ctx.fillRect(segment.x + 1, segment.y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        }
      });
      
      ctx.globalAlpha = 1;
      
      // Draw player name above snake
      if (player.snake.length > 0) {
        const head = player.snake[0];
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, head.x + GRID_SIZE / 2, head.y - 5);
        
        // Draw score
        ctx.font = '10px Arial';
        ctx.fillText(player.score.toString(), head.x + GRID_SIZE / 2, head.y - 18);
      }
    });
  }, [players, food, gameArea, gameJoined]);

  const joinGame = () => {
    if (!socketRef.current || !playerName.trim()) return;
    
    socketRef.current.emit('joinGame', { playerName: playerName.trim() });
  };

  const respawn = () => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('joinGame', { playerName: currentPlayer?.name || playerName });
  };

  if (!connected) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔄</div>
            <h2 className="text-2xl font-bold text-white mb-2">Connecting to Server...</h2>
            <p className="text-gray-400">Please wait while we establish connection</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!gameJoined) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
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
                <p className="text-gray-400">Multiplayer train battle royale!</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="text-8xl mb-6">🚂</div>
              <h2 className="text-3xl font-bold text-white mb-4">Join the Battle!</h2>
              <p className="text-gray-300 mb-6">Enter your name and start growing your train!</p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && joinGame()}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  maxLength={20}
                />
                <button
                  onClick={joinGame}
                  disabled={!playerName.trim()}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Join Game
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">How to Play:</h3>
                <ul className="text-gray-300 text-sm space-y-1 text-left">
                  <li>• Use WASD or arrow keys to move your train</li>
                  <li>• Eat colorful food to grow and gain points</li>
                  <li>• Avoid hitting other trains or you'll derail</li>
                  <li>• Hit another train's cars to absorb their cargo!</li>
                  <li>• Become the longest train to dominate!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isPlayerDead = currentPlayer && !currentPlayer.alive;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
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
              <p className="text-gray-400">Use WASD or arrow keys to move!</p>
            </div>
          </div>

          {/* Game Stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <Users className="h-4 w-4" />
              <span>{playerCount} players</span>
            </div>
            {currentPlayer && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <Trophy className="h-5 w-5" />
                <span>Score: {currentPlayer.score}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Game Area */}
          <div className="flex-1 bg-gray-800 rounded-lg p-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={gameArea.width}
                height={gameArea.height}
                className="border border-gray-600 rounded-lg bg-gray-900"
                style={{ width: '100%', height: 'auto', maxWidth: '800px' }}
              />
              
              {/* Death Overlay */}
              {isPlayerDead && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💀</div>
                    <h2 className="text-3xl font-bold text-white mb-2">You Died!</h2>
                    <p className="text-xl text-gray-300 mb-6">Final Score: {currentPlayer?.score || 0}</p>
                    <button
                      onClick={respawn}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Controls Info */}
            <div className="mt-4 text-sm text-gray-400 text-center">
              Use WASD or Arrow Keys to move • Eat food to grow • Avoid other trains!
            </div>
          </div>

          {/* Leaderboard */}
          <div className="w-64 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="h-5 w-5 text-yellow-400" />
              <h3 className="text-white font-semibold">Leaderboard</h3>
            </div>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                    <span className={`text-sm font-medium ${entry.name === currentPlayer?.name ? 'text-yellow-400' : 'text-white'}`}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-gray-300 text-sm">{entry.score}</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No players yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}