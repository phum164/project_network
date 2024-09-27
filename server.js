const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static('public'));

const rooms = {};  // Track game rooms and players
const totalCards = 12;  // Make sure this matches the number of cards in the game

// Single io.on('connection') block
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // When a player joins a room
    socket.on('joinRoom', (roomCode) => {
        console.log(`Player ${socket.id} is trying to join room: ${roomCode}`);

        if (!rooms[roomCode]) {
            rooms[roomCode] = { players: [], scores: [0, 0], currentTurn: 0, totalMatches: 0 };  // Initialize room with scores
            console.log(`Room ${roomCode} created.`);
        }

        if (rooms[roomCode].players.length < 2) {
            socket.join(roomCode);
            rooms[roomCode].players.push(socket.id);
            console.log(`Player ${socket.id} joined room ${roomCode}. Players: ${rooms[roomCode].players.length}`);

            if (rooms[roomCode].players.length === 2) {
                // When both players are in the room, set the first player's turn
                console.log(`Both players have joined room ${roomCode}. Starting the game.`);
                io.to(rooms[roomCode].players[0]).emit('startGame', { yourTurn: true });
                io.to(rooms[roomCode].players[1]).emit('startGame', { yourTurn: false });
            }
        } else {
            console.log(`Room ${roomCode} is full. Player ${socket.id} cannot join.`);
            socket.emit('roomError', 'Room is full');
        }
    });

    // Listen for shuffled cards and broadcast them to both players
    socket.on('shuffledCards', (data) => {
        const roomCode = data.roomCode;
        const shuffledOrder = data.shuffledOrder;

    // Broadcast the shuffled order to both players in the room
    io.to(roomCode).emit('applyShuffledCards', { shuffledOrder });
    });

    // When a card is flipped by a player
    socket.on('cardFlipped', (data) => {
        const roomCode = data.roomCode;
        const room = rooms[roomCode];

        if (!room) {
            console.error(`Error: Room ${roomCode} not found.`);
            return;
        }

        console.log(`Player ${socket.id} flipped cards in room ${roomCode}.`);

        // Check if it's the current player's turn
        if (room.players[room.currentTurn] === socket.id) {
            console.log(`Player ${socket.id}'s turn to flip the card.`);
            socket.to(roomCode).emit('cardFlipped', data);  // Broadcast the card flip to the other player

            // Handle matches
            const isMatch = data.isMatch;  // Client should send this
            if (isMatch) {
                // Add score to the current player
                room.scores[room.currentTurn] += 1;
                room.totalMatches += 1;

                console.log(`Player ${socket.id} found a match. New score: ${room.scores[room.currentTurn]}`);

                // Broadcast updated scores to both players
                io.to(roomCode).emit('updateScore', { scores: room.scores, players: room.players });

                // Check if the game is over (all pairs matched)
                if (room.totalMatches >= totalCards / 2) {  // End game when all pairs are matched
                    console.log('All matches found. Ending the game.');
                    let winner = null;
                    if (room.scores[0] > room.scores[1]) {
                        winner = rooms[roomCode].players[0];
                    } else if (room.scores[1] > room.scores[0]) {
                        winner = rooms[roomCode].players[1];
                    }
                    io.to(roomCode).emit('gameOver', { winner });
                }
            }

            // Switch turns if no match
            room.currentTurn = (room.currentTurn + 1) % 2;
            io.to(rooms[roomCode].players[room.currentTurn]).emit('updateTurn', { yourTurn: true });
            io.to(rooms[roomCode].players[(room.currentTurn + 1) % 2]).emit('updateTurn', { yourTurn: false });

            console.log(`Turn switched. Now it's player ${rooms[roomCode].players[room.currentTurn]}'s turn.`);
        } else {
            console.warn(`Player ${socket.id} tried to flip a card out of turn in room ${roomCode}.`);
        }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected.`);
        // Optional: Add logic to handle cleanup of rooms or player states
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});