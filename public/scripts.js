// const socket = io();

// // Variables to track game state
// let hasFlippedCard = false;
// let lockBoard = false;
// let firstCard, secondCard;
// let myTurn = false;  // Variable to track if it's your turn
// let roomCode = '';  // Store the room code
// let myScore = 0;
// let opponentScore = 0;

// // Function to join a game room
// function joinRoom(room) {
//     roomCode = room;
//     console.log(`Joining room: ${roomCode}`);
//     socket.emit('joinRoom', roomCode);
//     document.getElementById('turn-indicator').innerText = "Waiting for players...";
// }

// // เสียง
// const clickStart = new Audio('sounds/game-start.mp3');
// const flipSound = new Audio('sounds/flip.mp3');
// const matchSound = new Audio('sounds/match.wav');
// const nomatchSound = new Audio('sounds/not-match.mp3');


// // Listen for game start
// socket.on('startGame', (data) => {
//     myTurn = data.yourTurn;  // Set whether it's this player's turn
//     console.log(`Game started! Is it my turn? ${myTurn}`);
//     document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
// });

// // Listen for score updates
// socket.on('updateScore', (data) => {
//     console.log(`Scores updated. Player 1 Score: ${data.scores[0]}, Player 2 Score: ${data.scores[1]}`);

//     // If the socket.id matches the first player's ID, show the first score, otherwise show the second score
//     if (socket.id === data.players[0]) {
//         document.getElementById('score').innerText = `Score: ${data.scores[0]}`;
//     } else if (socket.id === data.players[1]) {
//         document.getElementById('score').innerText = `Score: ${data.scores[1]}`;
//     }
// });

// // Flip a card
// function flipCard(cardId) {
//     if (lockBoard || !myTurn) {
//         console.warn(`Cannot flip card. lockBoard: ${lockBoard}, myTurn: ${myTurn}`);
//         return;  // Only allow flipping if it's your turn
//     }

//     const card = document.getElementById(`card-${cardId}`);
//     if (card.classList.contains('flipped')) {
//         console.warn('Card is already flipped');
//         return;  // Ignore if card is already flipped
//     }

//     flipSound.play();
//     console.log(`Flipping card ${cardId}`);
//     card.classList.add('flipped');  // Add the flipped class to the card

//     if (!hasFlippedCard) {
//         // First card clicked
//         hasFlippedCard = true;
//         firstCard = card;
//         return;
//     }

//     // Second card clicked
//     hasFlippedCard = false;
//     secondCard = card;

//     // Disable further moves until cards are checked
//     lockBoard = true;

//     // Check if the cards match
//     const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
//     console.log(`Checking for match: ${isMatch}`);

//     // Emit flip event to the server, along with match info
//     socket.emit('cardFlipped', {
//         cardId1: firstCard.id,
//         cardId2: secondCard.id,
//         isMatch,  // Pass whether it's a match
//         roomCode: roomCode
//     });

//     if (isMatch) {
//         disableCards();
//         matchSound.play();
//     } else {
//         unflipCards();
//     }
// }

// // Disable matched cards
// function disableCards() {
//     firstCard.removeEventListener('click', flipCard);
//     secondCard.removeEventListener('click', flipCard);
//     resetBoard();
// }

// // Flip cards back if they don't match
// function unflipCards() {
//     setTimeout(() => {
//         firstCard.classList.remove('flipped');
//         secondCard.classList.remove('flipped');
//         resetBoard();
//     }, 1000);
// }

// // Reset the board for the next turn
// function resetBoard() {
//     console.log('Resetting board for the next turn.');
//     [hasFlippedCard, lockBoard] = [false, false];
//     [firstCard, secondCard] = [null, null];
// }

// // Listen for opponent's card flip
// socket.on('cardFlipped', (data) => {
//     console.log(`Opponent flipped cards: ${data.cardId1}, ${data.cardId2}`);

//     const card1 = document.getElementById(data.cardId1);
//     const card2 = document.getElementById(data.cardId2);

//     // Flip the cards for the opponent
//     card1.classList.add('flipped');
//     card2.classList.add('flipped');

//     // Check if the opponent found a match
//     const isMatch = card1.dataset.framework === card2.dataset.framework;
//     if (isMatch) {
//         console.log('Opponent found a match.');
//         matchSound.play();
//         disableOpponentCards(card1, card2);
//     } else {
//         console.log('Opponent did not find a match. Unflipping their cards.');
//         // nomatchSound.play();
//         setTimeout(() => {
//             card1.classList.remove('flipped');
//             card2.classList.remove('flipped');
//         }, 1000);
//     }

//     // Switch turn to the current player after opponent's move
//     switchTurn();
// });

// // Disable opponent's matched cards
// function disableOpponentCards(card1, card2) {
//     card1.removeEventListener('click', flipCard);
//     card2.removeEventListener('click', flipCard);
// }

// // Listen for turn updates
// socket.on('updateTurn', (data) => {
//     myTurn = data.yourTurn;
//     console.log(`Turn updated. Is it my turn? ${myTurn}`);
//     document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
// });

// // Shuffle the memory cards
// function shuffleCards() {
//     const memoryGame = document.querySelector('.memory-game');
//     const cards = Array.from(memoryGame.children);  // Get all card elements

//     // Shuffle the cards using Fisher-Yates shuffle algorithm
//     for (let i = cards.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [cards[i], cards[j]] = [cards[j], cards[i]];
//     }

//     // Apply the shuffled order to the DOM
//     cards.forEach(card => memoryGame.appendChild(card));

//     // Emit the shuffled order to the server
//     const shuffledOrder = cards.map(card => card.id);
//     socket.emit('shuffledCards', { roomCode, shuffledOrder });
// }

// // Listen for shuffled cards from the server and apply the order
// socket.on('applyShuffledCards', (data) => {
//     const memoryGame = document.querySelector('.memory-game');
//     const shuffledOrder = data.shuffledOrder;

//     // Sort the cards based on the shuffled order received
//     const sortedCards = shuffledOrder.map(cardId => document.getElementById(cardId));

//     // Apply the sorted order to the DOM
//     sortedCards.forEach(card => memoryGame.appendChild(card));
// });

// // Call shuffleCards when the game starts for the first player
// socket.on('startGame', (data) => {
//     myTurn = data.yourTurn;
//     document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";

//     // If this is the first player's turn, shuffle the cards
//     if (myTurn) {
//         shuffleCards();
//     }
// });

// // Switch turns after every move
// function switchTurn() {
//     myTurn = !myTurn;
//     console.log(`Turn switched. Is it my turn now? ${myTurn}`);
//     document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
// }

// // Listen for game over event
// socket.on('gameOver', (data) => {
//     if (data.winner) {
//         alert(`Game over! ${data.winner === socket.id ? 'You Win' : 'Your Lose'}`);
//     } else {
//         alert("Game over! เสมอกัน");
//     }
//     setTimeout(() => {
//         socket.emit('startNewRound', { roomCode });  // Request a new round from the server
//     }, 3000);
// });







// const socket = io();

// let hasFlippedCard = false;
// let lockBoard = false;
// let firstCard, secondCard;
// let myTurn = false;  // Whether it's the current player's turn
// let roomCode = '';
// let myWins = 0;
// let opponentWins = 0;

// // Function to join a game room
// function joinRoom(room) {
//     roomCode = room;
//     socket.emit('joinRoom', roomCode);
//     document.getElementById('turn-indicator').innerText = "Waiting for players...";
// }

// // Sounds
// const flipSound = new Audio('sounds/flip.mp3');
// const matchSound = new Audio('sounds/match.wav');
// const nomatchSound = new Audio('sounds/not-match.mp3');

// // Listen for game start
// socket.on('startGame', (data) => {
//     myTurn = data.yourTurn;
//     document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
//     if (myTurn) shuffleCards();  // Shuffle cards on the first player's side
// });

// // Shuffle cards
// function shuffleCards() {
//     const memoryGame = document.querySelector('.memory-game');
//     const cards = Array.from(memoryGame.children);

//     // Shuffle cards using Fisher-Yates algorithm
//     for (let i = cards.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [cards[i], cards[j]] = [cards[j], cards[i]];
//     }

//     const shuffledOrder = cards.map(card => card.id);
//     socket.emit('shuffledCards', { roomCode, shuffledOrder });
// }

// // Listen for shuffled cards from the server and apply the shuffled order
// socket.on('startNewRound', (data) => {
//     const memoryGame = document.querySelector('.memory-game');
//     const shuffledOrder = data.shuffledOrder;

//     // Clear all flipped classes from the cards
//     const allCards = document.querySelectorAll('.memory-card');
//     allCards.forEach(card => card.classList.remove('flipped'));

//     // Apply the shuffled order
//     shuffledOrder.forEach(cardId => {
//         const card = document.getElementById(cardId);
//         memoryGame.appendChild(card);
//     });

//     resetBoard();  // Reset the game state for the new round
// });

// // Flip a card (only allowed during player's turn)
// function flipCard(cardId) {
//     if (lockBoard || !myTurn) {
//         console.warn("Not your turn or board is locked!");
//         return;
//     }

//     const card = document.getElementById(`card-${cardId}`);
//     if (card.classList.contains('flipped')) {
//         console.warn('Card already flipped!');
//         return;
//     }

//     flipSound.play();
//     card.classList.add('flipped');

//     if (!hasFlippedCard) {
//         hasFlippedCard = true;
//         firstCard = card;
//         return;
//     }

//     hasFlippedCard = false;
//     secondCard = card;
//     lockBoard = true;

//     const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
//     socket.emit('cardFlipped', { cardId1: firstCard.id, cardId2: secondCard.id, isMatch, roomCode });

//     if (isMatch) {
//         disableCards();
//         matchSound.play();
//     } else {
//         unflipCards();
//         nomatchSound.play();
//     }
// }

// // Disable matched cards
// function disableCards() {
//     firstCard.removeEventListener('click', flipCard);
//     secondCard.removeEventListener('click', flipCard);
//     resetBoard();
// }

// // Unflip cards if they don't match
// function unflipCards() {
//     setTimeout(() => {
//         firstCard.classList.remove('flipped');
//         secondCard.classList.remove('flipped');
//         resetBoard();
//     }, 1000);
// }

// // Reset the game board after a turn
// function resetBoard() {
//     [hasFlippedCard, lockBoard] = [false, false];
//     [firstCard, secondCard] = [null, null];
// }

// // Listen for opponent's card flip
// socket.on('cardFlipped', (data) => {
//     const card1 = document.getElementById(data.cardId1);
//     const card2 = document.getElementById(data.cardId2);

//     card1.classList.add('flipped');
//     card2.classList.add('flipped');

//     const isMatch = card1.dataset.framework === card2.dataset.framework;
//     if (isMatch) {
//         matchSound.play();
//         disableOpponentCards(card1, card2);
//     } else {
//         setTimeout(() => {
//             card1.classList.remove('flipped');
//             card2.classList.remove('flipped');
//         }, 1000);
//     }

//     switchTurn();  // Switch turn to the current player after opponent's move
// });

// // Disable opponent's matched cards
// function disableOpponentCards(card1, card2) {
//     card1.removeEventListener('click', flipCard);
//     card2.removeEventListener('click', flipCard);
// }

// // Listen for turn updates and enforce turn switching
// socket.on('updateTurn', (data) => {
//     myTurn = data.yourTurn;
//     document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
//     console.log(`Turn updated. Is it my turn? ${myTurn}`);
// });

// // Switch turns after a move
// function switchTurn() {
//     myTurn = !myTurn;
//     console.log(`Turn switched. Is it my turn now? ${myTurn}`);
//     document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
// }

// // Listen for game over and start new round
// socket.on('gameOver', (data) => {
//     if (data.winner) {
//         if (data.winner === socket.id) {
//             myWins += 1;
//         } else {
//             opponentWins += 1;
//         }

//         document.getElementById('win-tracker').innerText = `Wins - You: ${myWins}, Opponent: ${opponentWins}`;
//         alert(`Game over! ${data.winner === socket.id ? 'You Win' : 'You Lose'}`);
//     } else {
//         alert("Game over! It's a tie");
//     }

//     setTimeout(() => {
//         socket.emit('startNewRound', { roomCode });
//     }, 3000);
// });





const socket = io();

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let myTurn = false;
let roomCode = '';
let playerName = '';
let opponentName = '';
let myWins = 0;
let opponentWins = 0;

// Function to join a game room

function joinRoom(code,name) {
    roomCode = code;
    playerName = name;
    console.log("Room code:", code);
    console.log("Player name:", name);

    if (!playerName || !roomCode) {
        alert("Please enter both your name and the room code.");
        return;
    }
    socket.emit('joinRoom', { roomCode, playerName });
    console.log(roomCode);
    console.log(playerName);
    document.getElementById('turn-indicator').innerText = "Waiting for players...";
}


// Listen for game start
socket.on('startGame', (data) => {
    console.log(roomCode);
    myTurn = data.yourTurn;
    opponentName = data.opponentName;
    document.getElementById('turn-indicator').innerText = myTurn ? `Your turn, ${playerName}!` : `${opponentName} turn!`;
});

// Listen for score updates from the server
socket.on('updateScore', (data) => {
    // Check which player you are and update your score accordingly
    const myPlayerIndex = socket.id === data.players[0] ? 0 : 1;

    // Update the score displayed in the HTML
    document.getElementById('score').innerText = `Score: ${data.scores[myPlayerIndex]}`;
});

// Listen for turn updates
socket.on('updateTurn', (data) => {
    myTurn = data.yourTurn;
    document.getElementById('turn-indicator').innerText = myTurn ? `Your turn, ${playerName}!` : `${opponentName} turn!`;
});

// Shuffle cards for the first player
function shuffleCards() {
    const memoryGame = document.querySelector('.memory-game');
    const cards = Array.from(memoryGame.children);

    // Shuffle cards using Fisher-Yates algorithm
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    const shuffledOrder = cards.map(card => card.id);
    socket.emit('shuffledCards', { roomCode, shuffledOrder });
}

// Listen for shuffled cards and apply the order
socket.on('startNewRound', (data) => {
    const memoryGame = document.querySelector('.memory-game');
    const shuffledOrder = data.shuffledOrder;

    // Clear flipped cards
    const allCards = document.querySelectorAll('.memory-card');
    allCards.forEach(card => card.classList.remove('flipped'));

    // Re-arrange cards based on shuffled order
    shuffledOrder.forEach(cardId => {
        const card = document.getElementById(cardId);
        memoryGame.appendChild(card);
    });

    resetBoard();
});

// Flip a card (only allowed during your turn)
function flipCard(cardId) {
    console.log("Flipping card:", cardId, "in roomCode:", roomCode);
    if (lockBoard || !myTurn) {
        return;
    }

    const card = document.getElementById(`card-${cardId}`);
    if (card.classList.contains('flipped')) {
        return;
    }

    card.classList.add('flipped');
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = card;
        return;
    }

    hasFlippedCard = false;
    secondCard = card;
    lockBoard = true;

    const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

    console.log("Emitting card flip with roomCode:", roomCode);
    // Emit the card flip event
    socket.emit('cardFlipped', {
        cardId1: firstCard.id,
        cardId2: secondCard.id,
        isMatch,
        roomCode
    });

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

// Disable matched cards
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

// Unflip cards if they don't match
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// Reset the board for the next turn
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Listen for opponent's card flip
socket.on('cardFlipped', (data) => {
    const card1 = document.getElementById(data.cardId1);
    const card2 = document.getElementById(data.cardId2);

    // Flip the cards
    card1.classList.add('flipped');
    card2.classList.add('flipped');

    // If the opponent didn't match the cards, unflip them after a delay
    if (!data.isMatch) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }, 1000);
    }

    // Switch turn to the current player after opponent's move
    switchTurn();
});

// Switch turns after each move
function switchTurn() {
    myTurn = !myTurn;
    document.getElementById('turn-indicator').innerText = myTurn ? `Your turn, ${playerName}!` : `${opponentName} turn!`;
}

// Listen for game over
socket.on('gameOver', (data) => {
    if (data.winner) {
        if (data.winner === socket.id) {
            myWins += 1;
        } else {
            opponentWins += 1;
        }

        document.getElementById('win-tracker').innerText = `Wins - You: ${myWins}, Opponent: ${opponentWins}`;
        Swal.fire({
            title: 'Game Over!',
            imageUrl: data.winner === socket.id ? "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTIzb29iZWxpZ211aDZqcHpqMWw4NmdqeGsxbXEzMTZ2c3ozdmE1dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/e2LpQ4dQLpw4jfSYMg/giphy.webp" : "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHJieHRxNXl6M3hqdDc3MHhlMWZ4bGRnNnRqbG12aW85NXl4YmQ1ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1n4iuWZFnTeN6qvdpD/giphy.webp",
            text: data.winner === socket.id ? 'You Win!' : 'Your Lose, Loser BOBO',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: "Custom image",
            // icon: data.winner === socket.id ? 'success' : 'danger',
            timer: 4000, // ปิดอัตโนมัติหลัง 3 วินาที
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            title: 'Game Over!',
            imageUrl: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3MydnBidjdnNDhqbnYxdTZvczV5Yno0OTd5aDM3NDBvbDFybmIzdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UKF08uKqWch0Y/200.webp',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: "Custom image",
            text: "It's a tie.",
            // icon: 'warning',
            timer: 4000,
            showConfirmButton: false
        });
    }

    setTimeout(() => {
        socket.emit('startNewRound', { roomCode });
        document.getElementById('score').innerText = `Score: ${0}`;
    }, 3000);
});