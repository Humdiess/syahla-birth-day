var gameContainer = document.getElementById("gameContainer");
var canvas = document.getElementById("gameCanvas");
var joystick = document.getElementById("joystick");
var startButton = document.getElementById("startButton");

var context = canvas.getContext("2d");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var gridSize = 20;
var snakeSize = gridSize;
var initialSnakeLength = 3;
var snakeColor = "#00FF00";
var fruitColor = "#FF0000";

var snake = [];
var fruit = {};
var score = 0;
var snakeSpeed = 200; // Waktu dalam milidetik antara setiap pembaruan permainan
var snakeDirection = "right"; // Arah awal ular
var snakeNextDirection = ""; // Arah berikutnya

var gameLoop;
var joystickWidth = joystick.offsetWidth;
var joystickHeight = joystick.offsetHeight;
var joystickHalfWidth = joystickWidth / 2;
var joystickHalfHeight = joystickHeight / 2;
var analogControllerRect = joystick.parentElement.getBoundingClientRect();

startButton.addEventListener("click", function() {
    initializeGame();
});

function initializeGame() {
    snake = [];
    score = 0;
    snakeDirection = "right";
    snakeNextDirection = "";

    createSnake();
    createFruit();

    if (gameLoop) {
        clearInterval(gameLoop);
    }

    gameLoop = setInterval(updateGame, snakeSpeed);
}

function createSnake() {
    var startX = Math.floor(canvasWidth / 2 / gridSize) * gridSize;
    var startY = Math.floor(canvasHeight / 2 / gridSize) * gridSize;

    for (var i = 0; i < initialSnakeLength; i++) {
        snake.push({ x: startX - i * gridSize, y: startY });
    }
}

function createFruit() {
    var maxX = canvasWidth / gridSize - 1;
    var maxY = canvasHeight / gridSize - 1;

    var fruitX = getRandomInt(0, maxX) * gridSize;
    var fruitY = getRandomInt(0, maxY) * gridSize;

    fruit = { x: fruitX, y: fruitY };
}

function updateGame() {
    clearCanvas();
    updateSnake();
    drawSnake();
    drawFruit();
    checkCollision();
    drawScore();
}

function clearCanvas() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
}

function updateSnake() {
    var head = { x: snake[0].x, y: snake[0].y };

    // Mengubah arah ular sesuai dengan input pengguna
    if (snakeNextDirection !== "") {
        snakeDirection = snakeNextDirection;
        snakeNextDirection = "";
    }

    // Menggerakkan ular berdasarkan arah yang ditentukan
    switch (snakeDirection) {
        case "up":
            head.y -= gridSize;
            break;
        case "down":
            head.y += gridSize;
            break;
        case "left":
            head.x -= gridSize;
            break;
        case "right":
            head.x += gridSize;
            break;
    }

    // Memunculkan ular di sisi sebaliknya ketika menyentuh pinggiran
    if (head.x < 0) {
        head.x = canvasWidth - gridSize;
    } else if (head.x >= canvasWidth) {
        head.x = 0;
    } else if (head.y < 0) {
        head.y = canvasHeight - gridSize;
    } else if (head.y >= canvasHeight) {
        head.y = 0;
    }

    snake.unshift(head);

    if (!isEatingFruit()) {
        snake.pop();
    }
}

function drawSnake() {
    for (var i = 0; i < snake.length; i++) {
        var segment = snake[i];
        context.fillStyle = snakeColor;
        context.fillRect(segment.x, segment.y, snakeSize, snakeSize);
    }
}

function drawFruit() {
    context.fillStyle = fruitColor;
    context.fillRect(fruit.x, fruit.y, snakeSize, snakeSize);
    context.fillStyle = snakeColor;
}

function drawScore() {
    context.fillStyle = "black";
    context.font = "16px Poppins";
    context.fillText("Score: " + score, 10, 20);
}

function isEatingFruit() {
    var head = snake[0];
    return head.x === fruit.x && head.y === fruit.y;
}

function checkCollision() {
    var head = snake[0];

    // Memunculkan ular di sisi sebaliknya ketika menyentuh pinggiran
    if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight || isCollidingWithSelf()) {
        // Memunculkan ular di sisi sebaliknya
        if (head.x < 0) {
            head.x = canvasWidth - gridSize;
        } else if (head.x >= canvasWidth) {
            head.x = 0;
        } else if (head.y < 0) {
            head.y = canvasHeight - gridSize;
        } else if (head.y >= canvasHeight) {
            head.y = 0;
        }
    }
}

function isCollidingWithSelf() {
    var head = snake[0];

    for (var i = 1; i < snake.length; i++) {
        var segment = snake[i];

        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }

    return false;
}

function handleTouchStart(e) {
    e.preventDefault();

    var touch = e.touches[0];
    var touchX = touch.clientX - analogControllerRect.left;
    var touchY = touch.clientY - analogControllerRect.top;

    var moveX = touchX - joystickHalfWidth;
    var moveY = touchY - joystickHalfHeight;

    moveJoystick(moveX, moveY);
}

function handleTouchMove(e) {
    e.preventDefault();

    var touch = e.touches[0];
    var touchX = touch.clientX - analogControllerRect.left;
    var touchY = touch.clientY - analogControllerRect.top;

    var moveX = touchX - joystickHalfWidth;
    var moveY = touchY - joystickHalfHeight;

    moveJoystick(moveX, moveY);
}

function handleTouchEnd(e) {
    e.preventDefault();

    resetJoystick();
}

function moveJoystick(moveX, moveY) {
    var maxDistance = joystickWidth / 2 - 10;
    var distance = Math.sqrt(moveX * moveX + moveY * moveY);

    if (distance > maxDistance) {
        var angle = Math.atan2(moveY, moveX);
        moveX = Math.cos(angle) * maxDistance;
        moveY = Math.sin(angle) * maxDistance;
    }

    var posX = moveX;
    var posY = moveY;

    if (posX < -maxDistance) {
        posX = -maxDistance;
    } else if (posX > maxDistance) {
        posX = maxDistance;
    }

    if (posY < -maxDistance) {
        posY = -maxDistance;
    } else if (posY > maxDistance) {
        posY = maxDistance;
    }

    joystick.style.transform = `translate(${posX}px, ${posY}px)`;

    updateDirection(moveX, moveY);
}

function resetJoystick() {
    joystick.style.transform = "translate(0, 0)";
    updateDirection(0, 0);
}

function updateDirection(moveX, moveY) {
    var absMoveX = Math.abs(moveX);
    var absMoveY = Math.abs(moveY);

    if (absMoveX > absMoveY) {
        snakeNextDirection = moveX > 0 ? "right" : "left";
    } else {
        snakeNextDirection = moveY > 0 ? "down" : "up";
    }
}

function initializeJoystick() {
    analogController.addEventListener("touchstart", function(e) {
        handleTouchStart(e);
    });

    analogController.addEventListener("touchmove", function(e) {
        handleTouchMove(e);
    });

    analogController.addEventListener("touchend", function(e) {
        handleTouchEnd(e);
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

initializeJoystick();
