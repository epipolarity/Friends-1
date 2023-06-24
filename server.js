const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve the static files
app.use(express.static('public'));

// Store player data
let players = {};

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Assign a random color to the player
    const playerColor = getRandomColor();

    // Initialize player data
    players[socket.id] = {
        x: Math.random() * 400,
        y: Math.random() * 400,
        color: playerColor,
        radius: 10
    };

    // Send initial player data to the connected client
    socket.emit('player-update', players);

    // Notify other players about the new player
    socket.broadcast.emit('player-update', players);

    // Handle player movement
    socket.on('player-move', (data) => {
        const player = players[socket.id];
        if (data.x) player.x += data.x;
        if (data.y) player.y += data.y;

        // Check for collisions with other players
        checkCollision(socket.id);

        // Send updated player data to all connected clients
        io.emit('player-update', players);
    });

    // Handle socket disconnections
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);

        // Remove the player from the player list
        delete players[socket.id];

        // Notify other players about the disconnection
        socket.broadcast.emit('player-update', players);
    });
});

// Start the server
const port = 3000;
http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Utility function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Check for collisions between players
function checkCollision(socketId) {
    const playerIds = Object.keys(players);
    const playerIdA = socketId
    const playerA = players[playerIdA];
    for (let i = 0; i < playerIds.length; i++) {
        const playerIdB = playerIds[i];
        if (playerIdB != playerIdA) {
            const playerB = players[playerIdB];
            if (arePlayersColliding(playerA, playerB)) {
                handlePlayerCollision(playerA, playerB);
            }
        }
    }
}

// Check if two players are colliding
function arePlayersColliding(playerA, playerB) {
    const dx = playerB.x - playerA.x;
    const dy = playerB.y - playerA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < playerA.radius + playerB.radius;
}

// Handle collision between two players
function handlePlayerCollision(playerA, playerB) {
    const dx = playerB.x - playerA.x;
    const dy = playerB.y - playerA.y;
    const angle = Math.atan2(dy, dx);
    const distance = playerA.radius + playerB.radius;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    playerA.x = playerB.x - offsetX;
    playerA.y = playerB.y - offsetY;
}
