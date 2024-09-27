const socket = io();

// Variables to track game state
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let myTurn = false;  // Variable to track if it's your turn
let roomCode = '';  // Store the room code
let myScore = 0;
let opponentScore = 0;

// Function to join a game room
function joinRoom(room) {
    roomCode = room;
    console.log(`Joining room: ${roomCode}`);
    socket.emit('joinRoom', roomCode);
    document.getElementById('turn-indicator').innerText = "Waiting for players...";
}

// เสียง
const clickStart = new Audio('sounds/game-start.mp3');
const flipSound = new Audio('sounds/flip.mp3');
const matchSound = new Audio('sounds/match.wav');
const nomatchSound = new Audio('sounds/not-match.mp3');


// Listen for game start
socket.on('startGame', (data) => {
    myTurn = data.yourTurn;  // Set whether it's this player's turn
    console.log(`Game started! Is it my turn? ${myTurn}`);
    document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
});

// Listen for score updates
socket.on('updateScore', (data) => {
    console.log(`Scores updated. Player 1 Score: ${data.scores[0]}, Player 2 Score: ${data.scores[1]}`);

    // If the socket.id matches the first player's ID, show the first score, otherwise show the second score
    if (socket.id === data.players[0]) {
        document.getElementById('score').innerText = `Score: ${data.scores[0]}`;
    } else if (socket.id === data.players[1]) {
        document.getElementById('score').innerText = `Score: ${data.scores[1]}`;
    }
});

// Flip a card
function flipCard(cardId) {
    if (lockBoard || !myTurn) {
        console.warn(`Cannot flip card. lockBoard: ${lockBoard}, myTurn: ${myTurn}`);
        return;  // Only allow flipping if it's your turn
    }

    const card = document.getElementById(`card-${cardId}`);
    if (card.classList.contains('flipped')) {
        console.warn('Card is already flipped');
        return;  // Ignore if card is already flipped
    }

    console.log(`Flipping card ${cardId}`);
    card.classList.add('flipped');  // Add the flipped class to the card

    if (!hasFlippedCard) {
        // First card clicked
        hasFlippedCard = true;
        firstCard = card;
        return;
    }

    // Second card clicked
    hasFlippedCard = false;
    secondCard = card;

    // Disable further moves until cards are checked
    lockBoard = true;

    // Check if the cards match
    const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
    console.log(`Checking for match: ${isMatch}`);

    // Emit flip event to the server, along with match info
    socket.emit('cardFlipped', {
        cardId1: firstCard.id,
        cardId2: secondCard.id,
        isMatch,  // Pass whether it's a match
        roomCode: roomCode
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

// Flip cards back if they don't match
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// Reset the board for the next turn
function resetBoard() {
    console.log('Resetting board for the next turn.');
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Listen for opponent's card flip
socket.on('cardFlipped', (data) => {
    console.log(`Opponent flipped cards: ${data.cardId1}, ${data.cardId2}`);

    const card1 = document.getElementById(data.cardId1);
    const card2 = document.getElementById(data.cardId2);

    // Flip the cards for the opponent
    card1.classList.add('flipped');
    card2.classList.add('flipped');

    // Check if the opponent found a match
    const isMatch = card1.dataset.framework === card2.dataset.framework;
    if (isMatch) {
        console.log('Opponent found a match.');
        matchSound.play();
        disableOpponentCards(card1, card2);
    } else {
        console.log('Opponent did not find a match. Unflipping their cards.');
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }, 1000);
    }

    // Switch turn to the current player after opponent's move
    switchTurn();
});

// Disable opponent's matched cards
function disableOpponentCards(card1, card2) {
    card1.removeEventListener('click', flipCard);
    card2.removeEventListener('click', flipCard);
}

// Listen for turn updates
socket.on('updateTurn', (data) => {
    myTurn = data.yourTurn;
    console.log(`Turn updated. Is it my turn? ${myTurn}`);
    document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
});

// Shuffle the memory cards
function shuffleCards() {
    const memoryGame = document.querySelector('.memory-game');
    const cards = Array.from(memoryGame.children);  // Get all card elements

    // Shuffle the cards using Fisher-Yates shuffle algorithm
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // Apply the shuffled order to the DOM
    cards.forEach(card => memoryGame.appendChild(card));
    
    // Emit the shuffled order to the server
    const shuffledOrder = cards.map(card => card.id);
    socket.emit('shuffledCards', { roomCode, shuffledOrder });
}

// Listen for shuffled cards from the server and apply the order
socket.on('applyShuffledCards', (data) => {
    const memoryGame = document.querySelector('.memory-game');
    const shuffledOrder = data.shuffledOrder;

    // Sort the cards based on the shuffled order received
    const sortedCards = shuffledOrder.map(cardId => document.getElementById(cardId));

    // Apply the sorted order to the DOM
    sortedCards.forEach(card => memoryGame.appendChild(card));
});

// Call shuffleCards when the game starts for the first player
socket.on('startGame', (data) => {
    myTurn = data.yourTurn;
    document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
    
    // If this is the first player's turn, shuffle the cards
    if (myTurn) {
        shuffleCards();
    }
});

// Switch turns after every move
function switchTurn() {
    myTurn = !myTurn;
    console.log(`Turn switched. Is it my turn now? ${myTurn}`);
    document.getElementById('turn-indicator').innerText = myTurn ? "Your turn!" : "Opponent's turn!";
}

// Listen for game over event
socket.on('gameOver', (data) => {
    if (data.winner) {
        alert(`Game over! The winner is ${data.winner === socket.id ? 'You' : 'Your opponent'}`);
    } else {
        alert("Game over! It's a tie!");
    }
});
