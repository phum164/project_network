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

function joinRoom(code,name,cards) {
    roomCode = code;
    playerName = name;
    totalCards = cards;
    console.log("Room code:", code);
    console.log("Player name:", name);
    console.log("total cards:", cards);

    if (!playerName || !roomCode) {
        alert("Please enter both your name and the room code.");
        return;
    }
    socket.emit('joinRoom', { roomCode, playerName,totalCards});
    console.log(roomCode);
    console.log(playerName);
    document.getElementById('turn-indicator').innerText = "Waiting for players...";
}

// เสียง
const clickStart = new Audio('sounds/game-start.mp3');
const flipSound = new Audio('sounds/flip.mp3');
const matchSound = new Audio('sounds/match.wav');
const nomatchSound = new Audio('sounds/not-match.mp3');

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

    flipSound.play();
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
        matchSound.play();
        disableCards();
    } else {
        // nomatchSound.play();
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

        document.getElementById('win-tracker').innerText = `ประวัติ คุณ: ${myWins} || คู่ต่อสู้: ${opponentWins}`;
        Swal.fire({
            title: 'Game Over!',
            imageUrl: data.winner === socket.id ? "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTIzb29iZWxpZ211aDZqcHpqMWw4NmdqeGsxbXEzMTZ2c3ozdmE1dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/e2LpQ4dQLpw4jfSYMg/giphy.webp" : "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHJieHRxNXl6M3hqdDc3MHhlMWZ4bGRnNnRqbG12aW85NXl4YmQ1ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1n4iuWZFnTeN6qvdpD/giphy.webp",
            text: data.winner === socket.id ? 'You Win!' : 'Your Lose, Loser BOBO',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: "Custom image",
            // icon: data.winner === socket.id ? 'success' : 'danger',
            timer: 4000,
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