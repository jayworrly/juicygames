import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

interface GameState {
  players: Map<string, Player>;
  food: Food[];
  gameArea: { width: number; height: number };
}

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

type Direction = 'up' | 'down' | 'left' | 'right';

const GAME_AREA = { width: 800, height: 600 };
const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const FOOD_COUNT = 50;

let io: IOServer;
let gameState: GameState = {
  players: new Map(),
  food: [],
  gameArea: GAME_AREA
};

function initializePlayer(playerId: string, playerName: string): Player {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Random starting position
  const startX = Math.floor(Math.random() * (GAME_AREA.width / GRID_SIZE)) * GRID_SIZE;
  const startY = Math.floor(Math.random() * (GAME_AREA.height / GRID_SIZE)) * GRID_SIZE;
  
  const snake: Position[] = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({
      x: Math.max(0, startX - (i * GRID_SIZE)),
      y: startY
    });
  }

  return {
    id: playerId,
    name: playerName || `Player ${Math.floor(Math.random() * 1000)}`,
    snake,
    direction: 'right',
    score: 0,
    color: randomColor,
    alive: true
  };
}

function generateFood(): Food {
  return {
    id: uuidv4(),
    position: {
      x: Math.floor(Math.random() * (GAME_AREA.width / GRID_SIZE)) * GRID_SIZE,
      y: Math.floor(Math.random() * (GAME_AREA.height / GRID_SIZE)) * GRID_SIZE
    },
    value: Math.floor(Math.random() * 3) + 1
  };
}

function initializeFood() {
  gameState.food = [];
  for (let i = 0; i < FOOD_COUNT; i++) {
    gameState.food.push(generateFood());
  }
}

function movePlayer(player: Player) {
  if (!player.alive) return;

  const head = { ...player.snake[0] };
  
  switch (player.direction) {
    case 'up':
      head.y -= GRID_SIZE;
      break;
    case 'down':
      head.y += GRID_SIZE;
      break;
    case 'left':
      head.x -= GRID_SIZE;
      break;
    case 'right':
      head.x += GRID_SIZE;
      break;
  }

  // Wrap around screen edges
  if (head.x < 0) head.x = GAME_AREA.width - GRID_SIZE;
  if (head.x >= GAME_AREA.width) head.x = 0;
  if (head.y < 0) head.y = GAME_AREA.height - GRID_SIZE;
  if (head.y >= GAME_AREA.height) head.y = 0;

  player.snake.unshift(head);
  
  // Check food collision
  let ateFood = false;
  gameState.food = gameState.food.filter(food => {
    if (head.x === food.position.x && head.y === food.position.y) {
      player.score += food.value;
      ateFood = true;
      return false;
    }
    return true;
  });

  // Remove tail if no food was eaten
  if (!ateFood) {
    player.snake.pop();
  } else {
    // Add new food to replace eaten food
    gameState.food.push(generateFood());
  }
}

function checkCollisions() {
  const alivePlayers = Array.from(gameState.players.values()).filter(p => p.alive);
  
  for (const player of alivePlayers) {
    const head = player.snake[0];
    
    // Check collision with other players' snakes (including their own tail)
    for (const otherPlayer of alivePlayers) {
      const bodyToCheck = otherPlayer.id === player.id ? 
        otherPlayer.snake.slice(1) : // Skip head for self-collision check
        otherPlayer.snake; // Check entire snake for other players
        
      for (const segment of bodyToCheck) {
        if (head.x === segment.x && head.y === segment.y) {
          // Player dies, other player absorbs their tail
          player.alive = false;
          if (otherPlayer.id !== player.id) {
            otherPlayer.snake.push(...player.snake.slice(1)); // Add dead player's body
            otherPlayer.score += Math.floor(player.snake.length / 2);
          }
          break;
        }
      }
      
      if (!player.alive) break;
    }
  }
  
  // Remove dead players after a delay
  setTimeout(() => {
    Array.from(gameState.players.entries()).forEach(([id, player]) => {
      if (!player.alive) {
        gameState.players.delete(id);
        if (io) {
          io.emit('playerLeft', id);
        }
      }
    });
  }, 1000);
}

function gameLoop() {
  // Move all players
  gameState.players.forEach(movePlayer);
  
  // Check collisions
  checkCollisions();
  
  // Send game state to all clients
  if (io) {
    const gameStateUpdate = {
      players: Array.from(gameState.players.values()),
      food: gameState.food,
      leaderboard: Array.from(gameState.players.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(p => ({ name: p.name, score: p.score }))
    };
    
    io.emit('gameState', gameStateUpdate);
  }
}

export function setupSocketIO(server: HTTPServer): IOServer {
  if (io) {
    return io;
  }

  io = new IOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Initialize food
  initializeFood();

  // Socket event handlers
  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('joinGame', ({ playerName }) => {
      const player = initializePlayer(socket.id, playerName);
      gameState.players.set(socket.id, player);
      
      socket.emit('gameJoined', {
        playerId: socket.id,
        gameArea: GAME_AREA
      });
      
      socket.broadcast.emit('playerJoined', player);
    });

    socket.on('changeDirection', (direction: Direction) => {
      const player = gameState.players.get(socket.id);
      if (player && player.alive) {
        // Prevent reversing into own body
        const opposites = {
          up: 'down',
          down: 'up',
          left: 'right',
          right: 'left'
        };
        
        if (direction !== opposites[player.direction]) {
          player.direction = direction;
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      gameState.players.delete(socket.id);
      socket.broadcast.emit('playerLeft', socket.id);
    });
  });

  // Start game loop
  setInterval(gameLoop, 100); // 10 FPS

  return io;
}