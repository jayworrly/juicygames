const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Game state and logic
const GAME_AREA = { width: 800, height: 600 };
const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const FOOD_COUNT = 50;

let gameState = {
  players: new Map(),
  food: [],
  gameArea: GAME_AREA
};

function initializePlayer(playerId, playerName) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  const startX = Math.floor(Math.random() * (GAME_AREA.width / GRID_SIZE)) * GRID_SIZE;
  const startY = Math.floor(Math.random() * (GAME_AREA.height / GRID_SIZE)) * GRID_SIZE;
  
  const snake = [];
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

function generateFood() {
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

function movePlayer(player) {
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

  if (!ateFood) {
    player.snake.pop();
  } else {
    gameState.food.push(generateFood());
  }
}

function checkCollisions(io) {
  const alivePlayers = Array.from(gameState.players.values()).filter(p => p.alive);
  
  for (const player of alivePlayers) {
    const head = player.snake[0];
    
    for (const otherPlayer of alivePlayers) {
      const bodyToCheck = otherPlayer.id === player.id ? 
        otherPlayer.snake.slice(1) : 
        otherPlayer.snake;
        
      for (const segment of bodyToCheck) {
        if (head.x === segment.x && head.y === segment.y) {
          player.alive = false;
          if (otherPlayer.id !== player.id) {
            otherPlayer.snake.push(...player.snake.slice(1));
            otherPlayer.score += Math.floor(player.snake.length / 2);
          }
          break;
        }
      }
      
      if (!player.alive) break;
    }
  }
  
  setTimeout(() => {
    Array.from(gameState.players.entries()).forEach(([id, player]) => {
      if (!player.alive) {
        gameState.players.delete(id);
        io.emit('playerLeft', id);
      }
    });
  }, 1000);
}

function gameLoop(io) {
  gameState.players.forEach(movePlayer);
  checkCollisions(io);
  
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

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Initialize food
  initializeFood();

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

    socket.on('changeDirection', (direction) => {
      const player = gameState.players.get(socket.id);
      if (player && player.alive) {
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
  setInterval(() => gameLoop(io), 100);

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});