const gameArea = document.getElementById('gameArea');
const killCountEl = document.getElementById('killCount');
const timerEl = document.getElementById('timer');
const bgMusic = document.getElementById('bgMusic');
const squashSound = document.getElementById('squashSound');
let kills = 0;
let spawnRate = 2000;
let gameInterval, spawnInterval, speedupInterval;
let gameStarted = false;
let countdown = 60;
let highScore = localStorage.getItem('highScore') || 0;
document.getElementById('highScore').textContent = `High Score: ${highScore}`;

// Cockroach disappearance timing
let cockroachFadeDuration = 1200; // ms, initial fade duration
let cockroachLifeDuration = 1800; // ms, initial time before auto-disappear

// Add notification element
let fasterNotif = null;

function showFasterNotification() {
  if (!fasterNotif) {
    fasterNotif = document.createElement('div');
    fasterNotif.id = 'fasterNotif';
    fasterNotif.textContent = 'Speed Up!';
    document.getElementById('gameArea').appendChild(fasterNotif);
  }
  fasterNotif.style.display = 'block';
  fasterNotif.style.opacity = '1';
  setTimeout(() => {
    fasterNotif.style.opacity = '0';
    setTimeout(() => {
      fasterNotif.style.display = 'none';
    }, 400);
  }, 800);
}

const spawnedPositions = [];

function spawnCockroach() {
  if (countdown < 0) return;

  const containerRect = document.getElementById('centerContainer').getBoundingClientRect();
  let left, top, overlapping;
  do {
    overlapping = false;
    left = Math.random() * (containerRect.width - 80) + containerRect.left + 10; 
    top = Math.random() * (containerRect.height - 80) + containerRect.top + 10; 

    for (const pos of spawnedPositions) {
      if (Math.abs(pos.left - left) < 60 && Math.abs(pos.top - top) < 60) {
        overlapping = true;
        break;
      }
    }
  } while (overlapping);

  const cockroach = document.createElement('img');
  cockroach.src = 'assets/img/alive.png';
  cockroach.className = 'cockroach';
  cockroach.style.left = `${left - containerRect.left}px`;
  cockroach.style.top = `${top - containerRect.top}px`;

  // Set up fade transition for this cockroach
  cockroach.style.transition = `opacity ${cockroachFadeDuration}ms`;

  // Remove cockroach after its life duration (if not killed)
  const autoRemoveTimeout = setTimeout(() => {
    cockroach.classList.add('dead');
    cockroach.style.opacity = 0;
    setTimeout(() => {
      cockroach.remove();
      const idx = spawnedPositions.findIndex(pos => pos.left === left && pos.top === top);
      if (idx !== -1) spawnedPositions.splice(idx, 1);
    }, cockroachFadeDuration);
  }, cockroachLifeDuration);

  cockroach.onclick = function () {
    this.src = 'assets/img/dead.png';
    this.classList.add('dead');
    squashSound.currentTime = 0;
    squashSound.play();
    kills++;
    killCountEl.textContent = `Kills: ${kills}`;
    clearTimeout(autoRemoveTimeout);
    this.style.opacity = 0;
    setTimeout(() => {
      this.remove();
      const idx = spawnedPositions.findIndex(pos => pos.left === left && pos.top === top);
      if (idx !== -1) spawnedPositions.splice(idx, 1);
    }, cockroachFadeDuration);
  };

  document.getElementById('gameArea').appendChild(cockroach);
  spawnedPositions.push({ left, top });

  // Make cockroaches disappear faster as time goes by
  // (minimum fade: 200ms, minimum life: 400ms)
  cockroachFadeDuration = Math.max(200, cockroachFadeDuration - 15);
  cockroachLifeDuration = Math.max(400, cockroachLifeDuration - 20);

  spawnInterval = setTimeout(spawnCockroach, spawnRate);
}

document.getElementById('startBtn').onclick = function () {
  if (gameStarted) return;
  gameStarted = true;
  this.style.display = 'none';
  bgMusic.play();
  startGame();
};

function startGame() {

  gameInterval = setInterval(() => {
    timerEl.textContent = `Time: ${countdown}s`;
    countdown--;
    if (countdown < 0) endGame();
  }, 1000);

  speedupInterval = setInterval(() => {
    if (spawnRate > 500) spawnRate -= 200;
    // Speed up cockroach disappearance (minimums)
    cockroachFadeDuration = Math.max(200, cockroachFadeDuration - 100);
    cockroachLifeDuration = Math.max(400, cockroachLifeDuration - 150);

    // Show "Faster!" notification
    showFasterNotification();
  }, 10000);

  spawnCockroach();
}

function endGame() {
  clearInterval(gameInterval);
  clearTimeout(spawnInterval);
  clearInterval(speedupInterval);
  bgMusic.pause();

  if (kills > highScore) {
    highScore = kills;
    localStorage.setItem('highScore', highScore);
  }

  document.getElementById('gameOver').style.display = 'block';
  document.getElementById('finalScore').textContent = `Your Score: ${kills}`;
  document.getElementById('finalHighScore').textContent = `High Score: ${highScore}`;
}

function restartGame() {
  location.reload();
}

function toggleAudio() {
  bgMusic.muted = !bgMusic.muted;
  document.getElementById('muteBtn').textContent = bgMusic.muted ? 'Unmute' : 'Mute';
}

window.addEventListener('offline', () => {
  alert('You are offline!');
});
