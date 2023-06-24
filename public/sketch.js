let socket;
let players = {};

function setup() {
  createCanvas(400, 400);
  background(200);

  // Connect to the server
  socket = io();

  // Receive player updates from the server
  socket.on('player-update', updatePlayers);
}

function updatePlayers(data) {
  players = data;
}

function draw() {
  background(200);

  // Render all players
  for (let playerId in players) {
    const player = players[playerId];
    fill(player.color);
    ellipse(player.x, player.y, player.radius *2, player.radius *2);
  }

  // Move the player based on keyboard input
  if (keyIsDown(UP_ARROW)) {
    socket.emit('player-move', { y: -1 });
  } else if (keyIsDown(DOWN_ARROW)) {
    socket.emit('player-move', { y: 1 });
  }
  if (keyIsDown(LEFT_ARROW)) {
    socket.emit('player-move', { x: -1 });
  } else if (keyIsDown(RIGHT_ARROW)) {
    socket.emit('player-move', { x: 1 });
  }
}
