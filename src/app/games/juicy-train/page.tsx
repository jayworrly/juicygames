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
  size?: 'small' | 'medium' | 'large';
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const GRID_SIZE = 15; // Match server grid size for smoother movement

export default function JuicyTrainGame() {
  const [connected, setConnected] = useState(false);
  const [gameJoined, setGameJoined] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [food, setFood] = useState<Food[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameArea, setGameArea] = useState({ width: 800, height: 600 }); // Viewport size
  const [mapSize, setMapSize] = useState({ width: 2400, height: 1800 }); // Full map size
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
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

    socket.on('gameState', ({ players, food, leaderboard, currentPlayer: current, mapSize: serverMapSize }) => {
      setPlayers(players);
      setFood(food);
      setLeaderboard(leaderboard);
      setPlayerCount(players.length);
      setCurrentPlayer(current || null);
      
      if (serverMapSize) {
        setMapSize(serverMapSize);
      }
      
      // Calculate camera offset to center on player
      if (current && current.alive && current.snake.length > 0) {
        const head = current.snake[0];
        setCameraOffset({
          x: head.x - gameArea.width / 2,
          y: head.y - gameArea.height / 2
        });
      }
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

  // Game controls with boost
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
        case ' ': // Spacebar for boost
        case 'Shift':
          event.preventDefault();
          socketRef.current.emit('boost', true);
          return;
      }
      
      if (direction) {
        event.preventDefault();
        socketRef.current.emit('changeDirection', direction);
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!gameJoined || !socketRef.current) return;
      
      if (event.key === ' ' || event.key === 'Shift') {
        event.preventDefault();
        socketRef.current.emit('boost', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameJoined]);

  // Canvas rendering with viewport
  useEffect(() => {
    if (!gameJoined || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, gameArea.width, gameArea.height);

    // Save context state
    ctx.save();

    // Translate for camera offset
    ctx.translate(-cameraOffset.x, -cameraOffset.y);

    // Draw grid (subtle) - only draw visible portion
    ctx.strokeStyle = '#1a1a3e';
    ctx.lineWidth = 0.5;
    const startX = Math.floor(cameraOffset.x / GRID_SIZE) * GRID_SIZE;
    const endX = startX + gameArea.width + GRID_SIZE;
    const startY = Math.floor(cameraOffset.y / GRID_SIZE) * GRID_SIZE;
    const endY = startY + gameArea.height + GRID_SIZE;
    
    for (let x = startX; x <= endX; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Draw map boundaries
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, mapSize.width, mapSize.height);

    // Draw food with different sizes
    food.forEach(f => {
      let color, size;
      
      switch(f.size || 'small') {
        case 'large':
          color = '#ff6b6b';
          size = GRID_SIZE * 0.8;
          break;
        case 'medium':
          color = '#ffd93d';
          size = GRID_SIZE * 0.6;
          break;
        default: // small
          color = '#6bcf7f';
          size = GRID_SIZE * 0.4;
      }
      
      // Draw food as circles for better visuals
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        f.position.x + GRID_SIZE / 2,
        f.position.y + GRID_SIZE / 2,
        size / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Add subtle glow for larger food
      if (f.value > 1) {
        ctx.shadowColor = color;
        ctx.shadowBlur = f.value * 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
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
    
    // Restore context
    ctx.restore();
    
    // Draw minimap (fixed position on canvas)
    const minimapSize = 150;
    const minimapX = gameArea.width - minimapSize - 10;
    const minimapY = 10;
    const minimapScale = minimapSize / Math.max(mapSize.width, mapSize.height);
    
    // Minimap background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    ctx.strokeStyle = '#666';
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Draw players on minimap
    players.forEach(player => {
      if (!player.alive || player.snake.length === 0) return;
      const head = player.snake[0];
      const minimapPlayerX = minimapX + (head.x * minimapScale);
      const minimapPlayerY = minimapY + (head.y * minimapScale);
      
      ctx.fillStyle = player.id === currentPlayer?.id ? '#fff' : player.color;
      ctx.fillRect(minimapPlayerX - 1, minimapPlayerY - 1, 3, 3);
    });
    
    // Draw viewport indicator on minimap
    if (currentPlayer) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        minimapX + (cameraOffset.x * minimapScale),
        minimapY + (cameraOffset.y * minimapScale),
        gameArea.width * minimapScale,
        gameArea.height * minimapScale
      );
    }
  }, [players, food, gameArea, gameJoined, cameraOffset, mapSize, currentPlayer]);

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
              <p className="text-gray-300 mb-6">Enter your name and grow your train!</p>
              
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
                  <li>• Collect cargo to grow your train longer</li>
                  <li>• Hold Space or Shift to boost (drops cargo!)</li>
                  <li>• Avoid crashing into other trains</li>
                  <li>• Make others crash to collect their cargo!</li>
                  <li>• Become the longest train on the rails!</li>
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
              WASD/Arrows to steer • Space/Shift to boost • Collect cargo • Avoid crashes!
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