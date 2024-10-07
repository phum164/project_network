// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);


// app.use(express.static('public'));

// const rooms = {};
// const totalCards = 12;

// // Single io.on('connection') block
// io.on('connection', (socket) => {
//     console.log(`New connection: ${socket.id}`);

//     // When a player joins a room
//     socket.on('joinRoom', (roomCode) => {
//         console.log(`Player ${socket.id} is trying to join room: ${roomCode}`);

//         if (!rooms[roomCode]) {
//             rooms[roomCode] = { players: [], scores: [0, 0], currentTurn: 0, totalMatches: 0 };  // Initialize room with scores
//             console.log(`Room ${roomCode} created.`);
//         }

//         if (rooms[roomCode].players.length < 2) {
//             socket.join(roomCode);
//             rooms[roomCode].players.push(socket.id);
//             console.log(`Player ${socket.id} joined room ${roomCode}. Players: ${rooms[roomCode].players.length}`);

//             if (rooms[roomCode].players.length === 2) {
//                 // When both players are in the room, set the first player's turn
//                 console.log(`Both players have joined room ${roomCode}. Starting the game.`);
//                 io.to(rooms[roomCode].players[0]).emit('startGame', { yourTurn: true });
//                 io.to(rooms[roomCode].players[1]).emit('startGame', { yourTurn: false });
//             }
//         } else {
//             console.log(`Room ${roomCode} is full. Player ${socket.id} cannot join.`);
//             socket.emit('roomError', 'Room is full');
//         }
//     });

//     // Listen for shuffled cards and broadcast them to both players
//     socket.on('shuffledCards', (data) => {
//         const roomCode = data.roomCode;
//         const shuffledOrder = data.shuffledOrder;

//     // Broadcast the shuffled order to both players in the room
//     io.to(roomCode).emit('applyShuffledCards', { shuffledOrder });
//     });

//     // When a card is flipped by a player
//     socket.on('cardFlipped', (data) => {
//         const roomCode = data.roomCode;
//         const room = rooms[roomCode];

//         if (!room) {
//             console.error(`Error: Room ${roomCode} not found.`);
//             return;
//         }

//         console.log(`Player ${socket.id} flipped cards in room ${roomCode}.`);

//         // Check if it's the current player's turn
//         if (room.players[room.currentTurn] === socket.id) {
//             console.log(`Player ${socket.id}'s turn to flip the card.`);
//             socket.to(roomCode).emit('cardFlipped', data);  // Broadcast the card flip to the other player

//             // Handle matches
//             const isMatch = data.isMatch;  // Client should send this
//             if (isMatch) {
//                 // Add score to the current player
//                 room.scores[room.currentTurn] += 1;
//                 room.totalMatches += 1;

//                 console.log(`Player ${socket.id} found a match. New score: ${room.scores[room.currentTurn]}`);

//                 // Broadcast updated scores to both players
//                 io.to(roomCode).emit('updateScore', { scores: room.scores, players: room.players });

//                 // Check if the game is over
//                 if (room.totalMatches >= totalCards / 2) {  // End game when all pairs are matched
//                     console.log('All matches found. Ending the game.');
//                     let winner = null;
//                     if (room.scores[0] > room.scores[1]) {
//                         winner = rooms[roomCode].players[0];
//                     } else if (room.scores[1] > room.scores[0]) {
//                         winner = rooms[roomCode].players[1];
//                     }
//                     io.to(roomCode).emit('gameOver', { winner });
//                 }
//             }

//             // Switch turns if not match
//             room.currentTurn = (room.currentTurn + 1) % 2;
//             io.to(rooms[roomCode].players[room.currentTurn]).emit('updateTurn', { yourTurn: true });
//             io.to(rooms[roomCode].players[(room.currentTurn + 1) % 2]).emit('updateTurn', { yourTurn: false });

//             console.log(`Turn switched. Now it's player ${rooms[roomCode].players[room.currentTurn]}'s turn.`);
//         } else {
//             console.warn(`Player ${socket.id} tried to flip a card out of turn in room ${roomCode}.`);
//         }
//     });

//     // Handle player disconnection
//     socket.on('disconnect', () => {
//         console.log(`Player ${socket.id} disconnected.`);
//     });
// });


// server.listen(3000, () => {
//     console.log('Server is listening on port 3000');
// });





// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// app.use(express.static('public'));

// const rooms = {};  // Store room data
// const totalCards = 12;  // Total number of cards (adjust if more cards are added)

// io.on('connection', (socket) => {
//     console.log(`New connection: ${socket.id}`);

//     // When a player joins a room
//     socket.on('joinRoom', (roomCode) => {
//         if (!rooms[roomCode]) {
//             rooms[roomCode] = { players: [], scores: [0, 0], wins: [0, 0], currentTurn: 0, totalMatches: 0 };
//             console.log(`Room ${roomCode} created.`);
//         }

//         // Join the room if it's not full
//         if (rooms[roomCode].players.length < 2) {
//             socket.join(roomCode);
//             rooms[roomCode].players.push(socket.id);
//             console.log(`Player ${socket.id} joined room ${roomCode}`);

//             // If two players have joined, start the game
//             if (rooms[roomCode].players.length === 2) {
//                 startNewRound(roomCode);
//             }
//         } else {
//             socket.emit('roomError', 'Room is full');
//         }
//     });

//     // Shuffle the cards using Fisher-Yates algorithm
//     function shuffle(array) {
//         for (let i = array.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [array[i], array[j]] = [array[j], array[i]];
//         }
//         return array;
//     }

//     // Start a new round
//     function startNewRound(roomCode) {
//         const room = rooms[roomCode];
//         room.scores = [0, 0];  // Reset scores for the new round
//         room.totalMatches = 0;  // Reset matched pairs

//         // Reset the current turn to Player 1 at the start of every new round
//         room.currentTurn = 0;

//         // Shuffle cards and emit the shuffled order to both players
//         const cardIds = Array.from({ length: totalCards }, (_, i) => `card-${i + 1}`);
//         const shuffledOrder = shuffle(cardIds);

//         io.to(roomCode).emit('startNewRound', { shuffledOrder });

//         // Player 1 starts every round
//         io.to(room.players[0]).emit('startGame', { yourTurn: true });
//         io.to(room.players[1]).emit('startGame', { yourTurn: false });
//     }

//     // Handle card flip event
//     socket.on('cardFlipped', (data) => {
//         const roomCode = data.roomCode;
//         const room = rooms[roomCode];

//         if (!room) {
//             console.error(`Room ${roomCode} not found.`);
//             return;
//         }

//         // Only allow the current player to flip cards
//         if (room.players[room.currentTurn] === socket.id) {
//             socket.to(roomCode).emit('cardFlipped', data);  // Notify the other player about the flip

//             const isMatch = data.isMatch;
//             if (isMatch) {
//                 room.scores[room.currentTurn] += 1;
//                 room.totalMatches += 1;

//                 // Notify both players about the updated score
//                 io.to(roomCode).emit('updateScore', { scores: room.scores, players: room.players });

//                 // If all pairs are matched, end the round
//                 if (room.totalMatches >= totalCards / 2) {
//                     let winner;
//                     if (room.scores[0] > room.scores[1]) {
//                         room.wins[0] += 1;  // Player 1 wins
//                         winner = room.players[0];
//                     } else if (room.scores[1] > room.scores[0]) {
//                         room.wins[1] += 1;  // Player 2 wins
//                         winner = room.players[1];
//                     } else {
//                         winner = null;  // It's a tie
//                     }

//                     // Notify players about the end of the game and the winner
//                     io.to(roomCode).emit('gameOver', { winner, wins: room.wins });

//                     // Start a new round after a short delay
//                     setTimeout(() => startNewRound(roomCode), 5000);
//                 }
//             }

//             // Switch turns after the current player's move
//             room.currentTurn = (room.currentTurn + 1) % 2;  // Toggle between player 0 and player 1
//             io.to(room.players[room.currentTurn]).emit('updateTurn', { yourTurn: true });
//             io.to(room.players[(room.currentTurn + 1) % 2]).emit('updateTurn', { yourTurn: false });
//         } else {
//             console.warn(`Player ${socket.id} attempted to flip out of turn.`);
//         }
//     });

//     // Handle player disconnection
//     socket.on('disconnect', () => {
//         console.log(`Player ${socket.id} disconnected`);
//         // Optional: Add cleanup logic to handle room resets or reassign players
//     });
// });

// // Start the server on port 3000
// server.listen(3000, () => {
//     console.log('Server is listening on port 3000');
// });




const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};  // Store room data
const totalCards = 12;  // Total number of cards

// app.post('/setTotalCards', (req, res) => {
//     const { totalCards: newTotalCards } = req.body;
//     totalCards = parseInt(newTotalCards); // อัปเดตค่าที่รับมา
//     res.json({ success: true, totalCards });
// });

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // When a player joins a room
    socket.on('joinRoom', ({ roomCode, playerName }) => {
        if (!rooms[roomCode]) {
            // const roomCode = roomCode;
            rooms[roomCode] = { players: [], playerNames: [], currentTurn: 0, startingPlayer: 0, wins: [0, 0] };
            console.log(`Room ${roomCode} created.`);
            console.log(roomCode);
        }

        // Join the room if it's not full
        if (rooms[roomCode].players.length < 2) {
            socket.join(roomCode);
            rooms[roomCode].players.push(socket.id);
            rooms[roomCode].playerNames.push(playerName);
            console.log(`${playerName} (${socket.id}) joined room ${roomCode}`);

            // If two players have joined, start the game
            if (rooms[roomCode].players.length === 2) {
                startNewRound(roomCode);
                console.log('start game');
            }
        } else {
            socket.emit('roomError', 'Room is full');
        }
    });

    // Start a new round
    function startNewRound(roomCode) {
        const room = rooms[roomCode];
        console.log(room);
        room.scores = [0, 0];  // Reset scores for the new round
        room.currentTurn = room.startingPlayer;  // The starting player starts each round
        room.totalMatches = 0;  // Reset matched pairs

        const cardIds = Array.from({ length: totalCards }, (_, i) => `card-${i + 1}`);
        const shuffledOrder = shuffle(cardIds);
        io.to(roomCode).emit('startNewRound', { shuffledOrder });

        const player1Name = room.playerNames[0];
        const player2Name = room.playerNames[1];

        // Assign turns and send opponent names
        io.to(room.players[room.startingPlayer]).emit('startGame', { yourTurn: true, opponentName: room.playerNames[(room.startingPlayer + 1) % 2] });
        io.to(room.players[(room.startingPlayer + 1) % 2]).emit('startGame', { yourTurn: false, opponentName: room.playerNames[room.startingPlayer] });
    }

    // Shuffle cards using Fisher-Yates algorithm
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Handle card flip event
    socket.on('cardFlipped', (data) => {
        console.log("Received roomCode:", data.roomCode);
        const room = rooms[data.roomCode];
        console.log(data);
        if (!room) {
            console.error(`Room ${data.roomCode} not found.`);
            return;
        }

        // Only allow the current player to flip cards
        if (socket.id === room.players[room.currentTurn]) {
            socket.to(data.roomCode).emit('cardFlipped', data);  // Notify the other player
            console.log('show card to other player');

            const isMatch = data.isMatch;
            if (isMatch) {
                room.scores[room.currentTurn] += 1;
                room.totalMatches += 1;
                console.log(`Player ${socket.id} found a match. New score: ${room.scores[room.currentTurn]}`);
                // Notify both players about the updated score
                io.to(data.roomCode).emit('updateScore', { scores: room.scores, players: room.players });

                // Check if all pairs are matched, end the round
                if (room.totalMatches >= totalCards / 2) {
                    let winner;
                    if (room.scores[0] > room.scores[1]) {
                        room.wins[0] += 1;  // Player 1 wins
                        winner = room.players[0];
                    } else if (room.scores[1] > room.scores[0]) {
                        room.wins[1] += 1;  // Player 2 wins
                        winner = room.players[1];
                    } else {
                        winner = null;  // It's a tie
                    }

                    // Notify players about the end of the game and the winner
                    io.to(data.roomCode).emit('gameOver', { winner, wins: room.wins });

                    // Alternate starting player for the next round
                    room.startingPlayer = (room.startingPlayer + 1) % 2;

                    // Start a new round after a short delay
                    setTimeout(() => startNewRound(data.roomCode), 5000);
                }
            }

            // Switch turns after each move
            room.currentTurn = (room.currentTurn + 1) % 2;
            console.log('switch');
            io.to(room.players[room.currentTurn]).emit('updateTurn', { yourTurn: true });
            io.to(room.players[(room.currentTurn + 1) % 2]).emit('updateTurn', { yourTurn: false });
        } else {
            console.warn(`Player ${socket.id} attempted to flip out of turn.`);
        }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected.`);

        // หา room ที่ player อยู่
        // let roomCode;
        // for (const [code, room] of Object.entries(rooms)) {
        //     if (room.players.includes(socket.id)) {
        //         roomCode = code;
        //         break;
        //     }
        // }

        // if (roomCode) {
        //     const room = rooms[roomCode];
        //     const playerIndex = room.players.indexOf(socket.id);
        //     // room.players.splice(playerIndex, 1);  // ลบผู้เล่นออกจากห้อง

        //     // แจ้งผู้เล่นที่เหลือในห้องว่าผู้เล่นคนหนึ่งออกจากเกมแล้ว
        //     io.to(roomCode).emit('roomMessage', { message: `${room.playerNames[playerIndex]} has left the room.` });

        //     // ถ้าผู้เล่นเหลือเพียงคนเดียว ให้ปิดเกมและลบห้อง
        //     if (room.players.length === 0) {
        //         delete rooms[roomCode];
        //         console.log(`Room ${roomCode} deleted.`);
        //     }
        //     console.log('delete room');
        // }
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server running on port 3000');
});