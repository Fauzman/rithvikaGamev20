const player = document.getElementById('player');
const mainWorld = document.getElementById('main-world');
const miniGameScreen = document.getElementById('mini-game-screen');
const miniGameBanner = document.getElementById('mini-game-banner');
const exitButton = document.getElementById('exit-button');
const miniGameAreas = document.querySelectorAll('.mini-game-area');
const hoverBanner = document.getElementById('hover-banner');
const inventoryButton = document.getElementById('inventory-button');

let playerX = 0;
let playerY = 0;
let currentGame = null;
let score = 0;
const beatenGames = new Set();
let hoveredArea = null;

let collectedLetters = new Set();
let letterDetails = new Map();

function initializeLetterDetails() {
    letterDetails.set('P', "i love balls");
    letterDetails.set('R', "i love balls");
    letterDetails.set('M', "i love balls");
    letterDetails.set('C', "i love balls");
}

function showLetterDetail(letter) {
    const popup = document.getElementById('letter-detail-popup');
    const detailLetter = document.getElementById('detail-letter');
    const detailText = document.getElementById('detail-text');
    
    detailLetter.textContent = letter;
    detailText.textContent = letterDetails.get(letter) || "Description coming soon...";
    
    popup.style.display = 'block';
}

function hideLetterDetail() {
    document.getElementById('letter-detail-popup').style.display = 'none';
}

function toggleInventory() {
    const inventoryScreen = document.getElementById('inventory-screen');
    if (inventoryScreen.style.display === 'none') {
        showInventory();
    } else {
        hideInventory();
    }
}

function showInventory() {
    const inventoryScreen = document.getElementById('inventory-screen');
    const lettersGrid = document.getElementById('letters-grid');
    
    lettersGrid.innerHTML = '';
    
    [...collectedLetters].sort().forEach(letter => {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter-item';
        letterDiv.textContent = letter;
        letterDiv.addEventListener('click', () => showLetterDetail(letter));
        lettersGrid.appendChild(letterDiv);
    });
    
    inventoryScreen.style.display = 'flex';
}

function hideInventory() {
    document.getElementById('inventory-screen').style.display = 'none';
}

function addLetterToInventory(letter) {
    collectedLetters.add(letter);
    showInventory();
}

document.getElementById('inventory-button').addEventListener('click', toggleInventory);
document.getElementById('close-inventory').addEventListener('click', hideInventory);
document.getElementById('close-detail').addEventListener('click', hideLetterDetail);

initializeLetterDetails();

function markGameAsBeaten(game) {
    if (!beatenGames.has(game)) {
        beatenGames.add(game);
        miniGameAreas.forEach(area => {
            if (area.dataset.game === game) {
                area.classList.add('beaten');
            }
        });
        
        switch(game) {
            case 'pong':
                addLetterToInventory('P');
                break;
            case 'running':
                addLetterToInventory('R');
                break;
            case 'obstacle':
                addLetterToInventory('M');
                break;
            case 'memory':
                addLetterToInventory('C');
                break;
        }
    }
}

player.style.top = `${playerY}px`;
player.style.left = `${playerX}px`;

document.addEventListener('keydown', (event) => {
    const speed = 10;
    if (currentGame === null) {
        switch (event.key) {
            case 'ArrowUp':
                playerY = Math.max(0, playerY - speed);
                break;
            case 'ArrowDown':
                playerY = Math.min(window.innerHeight - 50, playerY + speed);
                break;
            case 'ArrowLeft':
                playerX = Math.max(0, playerX - speed);
                break;
            case 'ArrowRight':
                playerX = Math.min(window.innerWidth - 50, playerX + speed);
                break;
            case 'Enter':
                if (hoveredArea) {
                    startMiniGame(hoveredArea.dataset.game);
                }
                break;
        }
        player.style.top = `${playerY}px`;
        player.style.left = `${playerX}px`;

        miniGameAreas.forEach(area => {
            const rect = area.getBoundingClientRect();
            if (
                playerX >= rect.left &&
                playerX <= rect.right &&
                playerY >= rect.top &&
                playerY <= rect.bottom &&
                !beatenGames.has(area.dataset.game)
            ) {
                hoveredArea = area;
                hoverBanner.style.display = 'block';
                hoverBanner.style.top = `${rect.top - 30}px`;
                hoverBanner.style.left = `${rect.left}px`;
            } else if (hoveredArea === area) {
                hoveredArea = null;
                hoverBanner.style.display = 'none';
            }
        });
    } else if (currentGame === 'obstacle') {
        const mazePlayer = document.getElementById('maze-player');
        let mazePlayerX = parseFloat(mazePlayer.style.left || 0);
        let mazePlayerY = parseFloat(mazePlayer.style.top || 0);
        
        let newX = mazePlayerX;
        let newY = mazePlayerY;
        
        switch (event.key) {
            case 'ArrowUp':
                newY -= speed;
                break;
            case 'ArrowDown':
                newY += speed;
                break;
            case 'ArrowLeft':
                newX -= speed;
                break;
            case 'ArrowRight':
                newX += speed;
                break;
        }

        const walls = document.querySelectorAll('.maze-wall');
        let collision = false;
        walls.forEach(wall => {
            const wallRect = wall.getBoundingClientRect();
            const playerRect = {
                left: newX,
                right: newX + 50,
                top: newY,
                bottom: newY + 50
            };

            if (
                playerRect.right > wallRect.left &&
                playerRect.left < wallRect.right &&
                playerRect.bottom > wallRect.top &&
                playerRect.top < wallRect.bottom
            ) {
                collision = true;
            }
        });

        if (!collision) {
            mazePlayer.style.top = `${newY}px`;
            mazePlayer.style.left = `${newX}px`;

            const goal = document.getElementById('maze-goal');
            const goalRect = goal.getBoundingClientRect();
            const playerRect = mazePlayer.getBoundingClientRect();

            if (
                playerRect.right > goalRect.left &&
                playerRect.left < goalRect.right &&
                playerRect.bottom > goalRect.top &&
                playerRect.top < goalRect.bottom
            ) {
                alert('You won the Maze!');
                markGameAsBeaten('obstacle');
                exitMiniGame();
            }
        }
    } else if (currentGame === 'pong') {
        const paddle = document.getElementById('pong-player');
        let paddleY = parseFloat(paddle.style.top || 0);
        
        if (event.key === 'ArrowUp') {
            paddleY = Math.max(0, paddleY - 20);
        } else if (event.key === 'ArrowDown') {
            paddleY = Math.min(window.innerHeight - 100, paddleY + 20);
        }
        
        paddle.style.top = `${paddleY}px`;
    }
});

function startMiniGame(game) {
    currentGame = game;
    mainWorld.style.display = 'none';
    miniGameScreen.style.display = 'block';
    miniGameBanner.style.display = 'none'; // Hide the banner for the maze game
    exitButton.style.display = 'block';
    inventoryButton.style.display = 'none'; // Hide the inventory button during mini-games

    // Hide the inventory screen when starting a mini-game
    hideInventory();

    document.querySelectorAll('.mini-game').forEach(game => game.style.display = 'none');
    document.getElementById(`${game}-game`).style.display = 'block';
    if (game === 'inventory') {
        showInventory();
        return;
    }
    else if (game === 'running') {
        startTypingRace();
    } else if (game === 'obstacle') {
        startMaze();
    } else if (game === 'memory') {
        startMemory();
    } else if (game === 'pong') {
        startPong();
    }
}

function exitMiniGame() {
    mainWorld.style.display = 'block';
    miniGameScreen.style.display = 'none';
    currentGame = null;
    score = 0;
    player.style.display = 'block';
    player.style.top = `${playerY}px`;
    player.style.left = `${playerX}px`;
    inventoryButton.style.display = 'block'; // Show the inventory button again
}

exitButton.addEventListener('click', exitMiniGame);

function startTypingRace() {
    const typingPrompt = document.getElementById('typing-prompt');
    const typingInput = document.getElementById('typing-input');
    const typingTimer = document.getElementById('typing-timer');
    const typingScore = document.getElementById('typing-score');

    let timeLeft = 60;
    let wordsTyped = 0;

    const words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew"];
    let promptText = "";
    for (let i = 0; i < 60; i++) {
        promptText += words[Math.floor(Math.random() * words.length)] + " ";
    }
    typingPrompt.textContent = promptText.trim();

    const timer = setInterval(() => {
        timeLeft--;
        typingTimer.textContent = `Time: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (wordsTyped >= 60) {
                alert('You won the Typing Race!');
                markGameAsBeaten('running');
            } else {
                alert('Time’s up! You lost.');
            }
            exitMiniGame();
        }
    }, 1000);

    typingInput.addEventListener('input', () => {
        const typedText = typingInput.value.trim();
        const promptWords = promptText.split(" ");
        const typedWords = typedText.split(" ");

        wordsTyped = 0;
        for (let i = 0; i < typedWords.length; i++) {
            if (typedWords[i] === promptWords[i]) {
                wordsTyped++;
            }
        }
        typingScore.textContent = `Words: ${wordsTyped}/60`;
    });
}

function startMaze() {
    const mazeGame = document.getElementById('obstacle-game');
    const mazePlayer = document.getElementById('maze-player');
    const mazeGoal = document.getElementById('maze-goal');
    
    mazeGame.innerHTML = ''; // Clear any existing maze

    const mazeContainer = document.createElement('div');
    mazeContainer.className = 'maze-container';
    mazeGame.appendChild(mazeContainer);
    
    mazePlayer.style.top = '20px';
    mazePlayer.style.left = '20px';
    mazeGoal.style.top = `${window.innerHeight - 70}px`;
    mazeGoal.style.left = `${window.innerWidth - 70}px`;
    
    mazeContainer.appendChild(mazePlayer);
    mazeContainer.appendChild(mazeGoal);
    
    const walls = [
        // Outer walls
        { top: 0, left: 0, width: '100%', height: '10px' },
        { top: 0, left: 0, width: '10px', height: '100%' },
        { top: '99%', left: 0, width: '100%', height: '10px' },
        { top: 0, left: '99%', width: '10px', height: '100%' },

        // Inner walls (more complex layout)
        { top: '20%', left: '10%', width: '80%', height: '10px' },
        { top: '20%', left: '10%', width: '10px', height: '30%' },
        { top: '50%', left: '10%', width: '80%', height: '10px' },
        { top: '50%', left: '80%', width: '10px', height: '30%' },
        { top: '80%', left: '10%', width: '80%', height: '10px' },
        { top: '20%', left: '50%', width: '10px', height: '60%' },
        { top: '40%', left: '30%', width: '40%', height: '10px' },
        { top: '60%', left: '30%', width: '40%', height: '10px' },
    ];
    
    walls.forEach(wallConfig => {
        const wall = document.createElement('div');
        wall.className = 'maze-wall';
        Object.assign(wall.style, wallConfig);
        mazeContainer.appendChild(wall);
    });
}

function startMemory() {
    const memoryGrid = document.getElementById('memory-grid');
    const memoryTimer = document.getElementById('memory-timer');
    memoryGrid.innerHTML = "";

    const cards = [];
    for (let i = 1; i <= 8; i++) {
        cards.push(i, i);
    }

    cards.sort(() => Math.random() - 0.5);

    cards.forEach((value, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.value = value;
        card.textContent = "?";
        card.addEventListener('click', () => flipCard(card));
        memoryGrid.appendChild(card);
    });

    let flippedCards = [];
    let matchedPairs = 0;
    let timeLeft = 60;

    const timer = setInterval(() => {
        timeLeft--;
        memoryTimer.textContent = `Time: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Time’s up! You lost.');
            exitMiniGame();
        }
    }, 1000);

    function flipCard(card) {
        if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
            card.textContent = card.dataset.value;
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                const [card1, card2] = flippedCards;
                if (card1.dataset.value === card2.dataset.value) {
                    matchedPairs++;
                    if (matchedPairs === 8) {
                        clearInterval(timer);
                        alert('You won the Memory Game!');
                        markGameAsBeaten('memory');
                        exitMiniGame();
                    }
                    flippedCards = [];
                } else {
                    setTimeout(() => {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        card1.textContent = "?";
                        card2.textContent = "?";
                        flippedCards = [];
                    }, 1000);
                }
            }
        }
    }
}

function startPong() {
    const pongGame = document.getElementById('pong-game');
    const player = document.getElementById('pong-player');
    const ai = document.getElementById('pong-ai');
    const ball = document.getElementById('pong-ball');
    const scoreDisplay = document.getElementById('pong-score');
    
    let playerScore = 0;
    let aiScore = 0;
    let ballX = window.innerWidth / 2;
    let ballY = window.innerHeight / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    
    player.style.top = '200px';
    ai.style.top = '200px';
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    
    function updateScore() {
        scoreDisplay.textContent = `Player: ${playerScore} | AI: ${aiScore}`;
    }
    
    const gameLoop = setInterval(() => {
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        ball.style.left = `${ballX}px`;
        ball.style.top = `${ballY}px`;
        
        if (ballY <= 0 || ballY >= window.innerHeight - 20) {
            ballSpeedY = -ballSpeedY;
        }
        
        const aiY = parseFloat(ai.style.top);
        if (ballY > aiY + 50) {
            ai.style.top = `${Math.min(window.innerHeight - 100, aiY + 4)}px`;
        } else if (ballY < aiY + 50) {
            ai.style.top = `${Math.max(0, aiY - 4)}px`;
        }
        
        const playerRect = player.getBoundingClientRect();
        const aiRect = ai.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        
        if (
            ballRect.left <= playerRect.right &&
            ballRect.top + 20 >= playerRect.top &&
            ballRect.bottom - 20 <= playerRect.bottom &&
            ballSpeedX < 0
        ) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX *= 1.1;
        }
        
        if (
            ballRect.right >= aiRect.left &&
            ballRect.top + 20 >= aiRect.top &&
            ballRect.bottom - 20 <= aiRect.bottom &&
            ballSpeedX > 0
        ) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX *= 1.1;
        }
        
        if (ballX <= 0) {
            aiScore++;
            updateScore();
            if (aiScore >= 3) {
                clearInterval(gameLoop);
                alert('Game Over! AI wins!');
                exitMiniGame();
            } else {
                ballX = window.innerWidth / 2;
                ballY = window.innerHeight / 2;
                ballSpeedX = Math.abs(ballSpeedX) * (Math.random() > 0.5 ? 1 : -1);
                ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
            }
        } else if (ballX >= window.innerWidth - 20) {
            playerScore++;
            updateScore();
            if (playerScore >= 3) {
                clearInterval(gameLoop);
                alert('Congratulations! You won!');
                markGameAsBeaten('pong');
                exitMiniGame();
            } else {
                ballX = window.innerWidth / 2;
                ballY = window.innerHeight / 2;
                ballSpeedX = -Math.abs(ballSpeedX) * (Math.random() > 0.5 ? 1 : -1);
                ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
            }
        }
    }, 1000 / 60);

    exitButton.addEventListener('click', () => {
        clearInterval(gameLoop);
    });
}
