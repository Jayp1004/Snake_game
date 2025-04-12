// Game.js - Updated to support touch controls for mobile users

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playerNameInput = document.getElementById("playerNameInput");
const scoreBoard = document.getElementById("scoreBoard");
const historyItems = document.getElementById("historyItems");
const historyBox = document.getElementById("historyList");
const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");

let snake = [];
let direction = { x: 1, y: 0 };
let food = {};
let score = 0;
let grow = 0;
let speed = 2;
let playerName = "";
let gameOver = false;
let highScore = 0;
let historyData = JSON.parse(localStorage.getItem("snakeHistory")) || {};
let touchStart = { x: 0, y: 0 };

function initGame() {
  snake = [{ x: 300, y: 200 }];
  direction = { x: 1, y: 0 };
  grow = 0;
  score = 0;
  speed = 2;
  gameOver = false;
  spawnFood();
  updateUI();
  requestAnimationFrame(gameLoop);
}

function startNewGame() {
  const name = playerNameInput.value.trim();
  if (!name) return alert("Please enter your name");
  playerName = name;
  highScore = historyData[playerName] || 0;
  initGame();
  updateHistoryUI();
}

function restartGame() {
  initGame();
}

function updateUI() {
  scoreBoard.innerText = `Player: ${playerName} | Score: ${score} | High: ${highScore}`;
}

function updateHistoryUI() {
  historyItems.innerHTML = Object.entries(historyData)
    .sort((a, b) => b[1] - a[1])
    .map(([name, hs]) => `<li>${name}: ${hs}</li>`)
    .join("");
}

function toggleHistory() {
  if (historyBox.style.display === "block") {
    historyBox.style.display = "none";
    toggleHistoryBtn.innerText = "Show History";
  } else {
    historyBox.style.display = "block";
    toggleHistoryBtn.innerText = "Hide History";
  }
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width - 40)) + 20,
    y: Math.floor(Math.random() * (canvas.height - 40)) + 20
  };
}

function updateSnake() {
  const head = { x: snake[0].x + direction.x * speed, y: snake[0].y + direction.y * speed };

  if (
    head.x < 10 || head.x > canvas.width - 10 ||
    head.y < 10 || head.y > canvas.height - 10
  ) {
    endGame();
    return;
  }

  snake.unshift(head);
  if (grow > 0) {
    grow--;
  } else {
    snake.pop();
  }

  const dx = head.x - food.x;
  const dy = head.y - food.y;
  if (Math.sqrt(dx * dx + dy * dy) < 10) {
    score++;
    grow += 5;
    speed += 0.2;
    spawnFood();
    updateUI();
  }
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    ctx.beginPath();
    ctx.arc(snake[i].x, snake[i].y, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,0,${(snake.length - i) / snake.length})`;
    ctx.fill();
  }
}

function drawFood() {
  ctx.beginPath();
  ctx.arc(food.x, food.y, 6, 0, Math.PI * 2);
  ctx.strokeStyle = "deepskyblue";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBorder() {
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "36px monospace";
  ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
  ctx.font = "20px monospace";
  ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 30);
  ctx.fillText(`High: ${highScore}`, canvas.width / 2 - 50, canvas.height / 2 + 55);
}

function endGame() {
  gameOver = true;
  if (score > highScore) {
    highScore = score;
    historyData[playerName] = score; // only update if score is higher
    localStorage.setItem("snakeHistory", JSON.stringify(historyData));
    updateHistoryUI();
  }
  updateUI();
  drawGameOver();
}

function gameLoop() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBorder();
  updateSnake();
  drawSnake();
  drawFood();
  requestAnimationFrame(gameLoop);
}

function onSwipeTouch(e) {
  const touchEnd = e.changedTouches[0];
  const deltaX = touchEnd.pageX - touchStart.x;
  const deltaY = touchEnd.pageY - touchStart.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0 && direction.x !== -1) direction = { x: 1, y: 0 };  // Right swipe
    else if (deltaX < 0 && direction.x !== 1) direction = { x: -1, y: 0 };  // Left swipe
  } else {
    if (deltaY > 0 && direction.y !== -1) direction = { x: 0, y: 1 };  // Down swipe
    else if (deltaY < 0 && direction.y !== 1) direction = { x: 0, y: -1 };  // Up swipe
  }
}

function onTouchStart(e) {
  touchStart.x = e.changedTouches[0].pageX;
  touchStart.y = e.changedTouches[0].pageY;
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction.y === 0) direction = { x: 0, y: -1 };
  else if (e.key === "ArrowDown" && direction.y === 0) direction = { x: 0, y: 1 };
  else if (e.key === "ArrowLeft" && direction.x === 0) direction = { x: -1, y: 0 };
  else if (e.key === "ArrowRight" && direction.x === 0) direction = { x: 1, y: 0 };
});

// Add touch event listeners
canvas.addEventListener("touchstart", onTouchStart, false);
canvas.addEventListener("touchmove", onSwipeTouch, false);

// Initial UI Setup
document.addEventListener("DOMContentLoaded", () => {
  updateHistoryUI();
  updateUI();
});
