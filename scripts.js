const cards = document.querySelectorAll('.memory-card');
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let score = 0;
let matchedCards = 0;
const totalCards = cards.length;

// เสียง
const clickStart = new Audio('sounds/game-start.mp3');
const flipSound = new Audio('sounds/flip.mp3');
const matchSound = new Audio('sounds/match.wav');
const nomatchSound = new Audio('sounds/not-match.mp3');

// ยืนยันการลบ
const exitBtn2 = document.getElementById('exit-btn2');
const popupOverlay = document.getElementById('popup-overlay');
const confirmExitBtn = document.getElementById('confirm-exit');
const cancelExitBtn = document.getElementById('cancel-exit');

exitBtn2.addEventListener('click', function() {
    popupOverlay.classList.add('show'); 
});

confirmExitBtn.addEventListener('click', function() {
    window.location.href = 'gamecatagory.html';
});

cancelExitBtn.addEventListener('click', function() {
  console.log("Cancel clicked");
  popupOverlay.classList.remove('show'); 
});


function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  flipSound.play();
  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  setTimeout(() => { matchSound.play(); }, 600);
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  score += 200;
  matchedCards += 2;
  updateScore();

  if (matchedCards === totalCards) {
    endGame();
  }

  resetBoard();
}

// ฟังก์ชันเมื่อไม่จับคู่
function unflipCards() {
  lockBoard = true;
  setTimeout(() => { nomatchSound.play(); }, 600);

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
  }, 1500);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

// ฟังก์ชันอัปเดตคะแนนใน DOM
function updateScore() {
  document.getElementById('score').textContent = `Score: ${score}`;
}

// ฟังก์ชันจบเกม
function endGame() {
  const popup = document.getElementById('game-end-popup');
  const finalScoreElement = document.getElementById('final-score');

  finalScoreElement.textContent = `คะแนนของคุณคือ: ${score}`;
  popup.classList.add('show');
}

// ฟังก์ชันเริ่มใหม่
document.getElementById('restart-btn').addEventListener('click', function () {
  location.reload();
});

// ฟังก์ชันออกจากเกม
document.getElementById('exit-btn').addEventListener('click', function () {
  clickStart.play();

  setTimeout(function () {
    window.location.href = 'gamecatagory.html';
  }, 500);
});

// สับการ์ดตอนเริ่มเกม
(function shuffle() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random() * totalCards);
    card.style.order = randomPos;
  });
})();

cards.forEach(card => card.addEventListener('click', flipCard));
