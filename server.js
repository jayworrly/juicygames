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
const GAME_AREA = { width: 2400, height: 1800 }; // Larger map for 8 players
const GRID_SIZE = 15; // Smaller grid for smoother movement
const INITIAL_SNAKE_LENGTH = 5; // Start with 5 segments
const FOOD_COUNT = 200; // More food for larger map
const MAX_FOOD = 300; // Maximum food on the map
const VIEWPORT = { width: 800, height: 600 }; // Player viewport size

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
    alive: true,
    boosting: false,
    boostCooldown: 0
  };
}

function generateFood(specificPosition = null) {
  const position = specificPosition || {
    x: Math.floor(Math.random() * (GAME_AREA.width / GRID_SIZE)) * GRID_SIZE,
    y: Math.floor(Math.random() * (GAME_AREA.height / GRID_SIZE)) * GRID_SIZE
  };
  
  // Different food types with different values and colors
  const foodTypes = [
    { value: 1, size: 'small' },  // Common food
    { value: 2, size: 'medium' }, // Less common
    { value: 5, size: 'large' }   // Rare food
  ];
  
  const random = Math.random();
  let foodType;
  if (random < 0.7) foodType = foodTypes[0];      // 70% small
  else if (random < 0.95) foodType = foodTypes[1]; // 25% medium
  else foodType = foodTypes[2];                    // 5% large
  
  return {
    id: uuidv4(),
    position,
    value: foodType.value,
    size: foodType.size
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
  
  // Move faster when boosting (double speed)
  const moveDistance = player.boosting ? GRID_SIZE * 2 : GRID_SIZE;
  
  switch (player.direction) {
    case 'up':
      head.y -= moveDistance;
      break;
    case 'down':
      head.y += moveDistance;
      break;
    case 'left':
      head.x -= moveDistance;
      break;
    case 'right':
      head.x += moveDistance;
      break;
  }

  // Keep within map boundaries (no wrap around for larger map)
  head.x = Math.max(0, Math.min(GAME_AREA.width - GRID_SIZE, head.x));
  head.y = Math.max(0, Math.min(GAME_AREA.height - GRID_SIZE, head.y));

  player.snake.unshift(head);
  
  // Check food collision (check area around head for smoother collection)
  let ateFood = false;
  let totalFoodValue = 0;
  gameState.food = gameState.food.filter(food => {
    const distance = Math.abs(head.x - food.position.x) + Math.abs(head.y - food.position.y);
    if (distance <= GRID_SIZE) {
      totalFoodValue += food.value;
      ateFood = true;
      return false;
    }
    return true;
  });
  
  if (ateFood) {
    player.score += totalFoodValue;
    // Add segments based on food value
    for (let i = 0; i < totalFoodValue; i++) {
      const tail = player.snake[player.snake.length - 1];
      player.snake.push({ ...tail });
    }
    // Generate new food to replace eaten ones
    gameState.food.push(generateFood());
  }
  
  // Handle boosting - lose tail segments when boosting
  if (player.boosting) {
    if (player.snake.length > 10) {
      // Drop food behind when boosting
      const droppedSegment = player.snake.pop();
      if (Math.random() < 0.3 && gameState.food.length < MAX_FOOD) { // 30% chance to drop food
        gameState.food.push({
          id: uuidv4(),
          position: droppedSegment,
          value: 1,
          size: 'small'
        });
      }
      player.boostCooldown = 20; // Cooldown frames
    } else {
      player.boosting = false; // Stop boost if too small
    }
  } else if (player.boostCooldown > 0) {
    player.boostCooldown--;
  }
  
  // Normal tail removal if not eating
  if (!ateFood && !player.boosting) {
    player.snake.pop();
  }
}

function checkCollisions(io) {
  const alivePlayers = Array.from(gameState.players.values()).filter(p => p.alive);
  const deadPlayers = [];
  
  for (const player of alivePlayers) {
    const head = player.snake[0];
    
    // Check collision with other snakes
    for (const otherPlayer of alivePlayers) {
      const bodyToCheck = otherPlayer.id === player.id ? 
        otherPlayer.snake.slice(1) : // Check own body (skip head)
        otherPlayer.snake;             // Check entire other snake
        
      for (const segment of bodyToCheck) {
        if (head.x === segment.x && head.y === segment.y) {
          player.alive = false;
          deadPlayers.push(player);
          
          // Award kill bonus to the other player if it wasn't self-collision
          if (otherPlayer.id !== player.id) {
            otherPlayer.score += Math.floor(player.score * 0.25); // 25% of victim's score
          }
          break;
        }
      }
      
      if (!player.alive) break;
    }
  }
  
  // Convert dead snakes into food (like slither.io)
  for (const deadPlayer of deadPlayers) {
    // Drop food where the snake was
    for (let i = 0; i < deadPlayer.snake.length; i++) {
      const segment = deadPlayer.snake[i];
      // Drop more valuable food from larger snakes
      const foodValue = i === 0 ? 5 : Math.max(1, Math.floor((deadPlayer.snake.length - i) / 10) + 1);
      
      // Only add food if we're not at max capacity
      if (gameState.food.length < MAX_FOOD) {
        gameState.food.push({
          id: uuidv4(),
          position: { x: segment.x, y: segment.y },
          value: foodValue,
          size: foodValue > 3 ? 'large' : foodValue > 1 ? 'medium' : 'small'
        });
      }
    }
  }
  
  // Remove dead players after a short delay
  setTimeout(() => {
    Array.from(gameState.players.entries()).forEach(([id, player]) => {
      if (!player.alive) {
        gameState.players.delete(id);
        io.emit('playerLeft', id);
      }
    });
  }, 1000);
}

function getVisibleEntities(player) {
  if (!player || !player.alive || player.snake.length === 0) {
    return { players: [], food: [] };
  }
  
  const head = player.snake[0];
  const viewportPadding = 100; // Extra padding for smoother edges
  const viewLeft = head.x - VIEWPORT.width / 2 - viewportPadding;
  const viewRight = head.x + VIEWPORT.width / 2 + viewportPadding;
  const viewTop = head.y - VIEWPORT.height / 2 - viewportPadding;
  const viewBottom = head.y + VIEWPORT.height / 2 + viewportPadding;
  
  // Get visible food
  const visibleFood = gameState.food.filter(f => 
    f.position.x >= viewLeft && f.position.x <= viewRight &&
    f.position.y >= viewTop && f.position.y <= viewBottom
  );
  
  // Get visible players (including parts of snakes that are visible)
  const visiblePlayers = [];
  for (const otherPlayer of gameState.players.values()) {
    if (!otherPlayer.alive) continue;
    
    // Check if any part of the snake is visible
    const visibleSegments = otherPlayer.snake.filter(segment =>
      segment.x >= viewLeft && segment.x <= viewRight &&
      segment.y >= viewTop && segment.y <= viewBottom
    );
    
    if (visibleSegments.length > 0 || otherPlayer.id === player.id) {
      // Include the whole player if any part is visible, or if it's the current player
      visiblePlayers.push(otherPlayer);
    }
  }
  
  return { players: visiblePlayers, food: visibleFood };
}

function gameLoop(io) {
  // Move all players
  gameState.players.forEach(movePlayer);
  
  // Check collisions
  checkCollisions(io);
  
  // Maintain food count
  while (gameState.food.length < FOOD_COUNT && gameState.food.length < MAX_FOOD) {
    gameState.food.push(generateFood());
  }
  
  // Generate leaderboard
  const leaderboard = Array.from(gameState.players.values())
    .filter(p => p.alive)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(p => ({ name: p.name, score: p.score }));
  
  // Send personalized game state to each player (viewport-based)
  for (const [socketId, player] of gameState.players) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      const { players: visiblePlayers, food: visibleFood } = getVisibleEntities(player);
      
      socket.emit('gameState', {
        players: visiblePlayers,
        food: visibleFood,
        leaderboard,
        currentPlayer: player,
        mapSize: GAME_AREA
      });
    }
  }
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
    
    socket.on('boost', (boosting) => {
      const player = gameState.players.get(socket.id);
      if (player && player.alive) {
        // Can only boost if snake is long enough and not on cooldown
        if (boosting && player.snake.length > 10 && player.boostCooldown <= 0) {
          player.boosting = true;
        } else {
          player.boosting = false;
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      gameState.players.delete(socket.id);
      socket.broadcast.emit('playerLeft', socket.id);
    });
  });

  // Start game loop - 60 FPS for smoother gameplay
  setInterval(() => gameLoop(io), 1000 / 60);

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});