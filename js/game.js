const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const scoreTracker = document.getElementById('scoreTracker');
const playerNameInput = document.getElementById('playerNameInput');


// Game variables
let football;
let posts = [];
let score = 0;
let gameLoop;
let isGameOver = false;
let playerName = "";

// Sound effects
const crowdCheerSound = new Audio('assets/sounds/cheer.wav');
const whistleBlowSound = new Audio('assets/sounds/whistle.wav');

class StickFigurePlayer {
    constructor() {
        this.x = -50; // Start off-screen
        this.y = canvas.height - 100;
        this.width = 30;
        this.height = 60;
        this.speed = 2.5; // Half the original speed
        this.hasKicked = false;
    }

    draw(ctx) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        // Body
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.stroke();
        
        // Head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x - 15, this.y + 40);
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x + 15, this.y + 40);
        ctx.stroke();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x - 15, this.y + this.height + 20);
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + 15, this.y + this.height + 20);
        ctx.stroke();
    }

    update(backgroundSpeed) {
        if (!this.hasKicked) {
            this.x += this.speed; // Move right until kick
        } else {
            this.x -= backgroundSpeed; // Move left with background after kick
        }
    }
}

// Football object
class Football {
    constructor() {
        this.x = 50;
        this.y = canvas.height / 2;
        this.width = 30;
        this.height = 18;
        this.velocity = 0;
        this.gravity = 0.5;
        this.lift = -10;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.velocity * 0.1);

        // Draw football shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#8B4513';
        ctx.fill();
        ctx.closePath();

        // Draw laces
        ctx.beginPath();
        ctx.moveTo(-5, -3);
        ctx.lineTo(-5, 3);
        ctx.moveTo(0, -4);
        ctx.lineTo(0, 4);
        ctx.moveTo(5, -3);
        ctx.lineTo(5, 3);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        this.drawShadow();
    }

    drawShadow() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x, canvas.height - 10, this.width / 2, this.height / 4, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height / 2 > canvas.height) {
            this.y = canvas.height - this.height / 2;
            this.velocity = 0;
        }
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2;
            this.velocity = 0;
        }
    }

    flap() {
        this.velocity = this.lift;
    }
}

// Goal post object
class GoalPost {
    constructor() {
        this.x = canvas.width;
        this.width = 10; // Thinner posts
        this.gap = 200;
        this.topHeight = Math.random() * (canvas.height - this.gap - 100) + 50;
        this.bottomY = this.topHeight + this.gap;
        this.flagSize = 15; // Size of the flags
    }

    draw() {
     this.drawShadow();

        // Main post color
        ctx.fillStyle = '#FFD700';
        
        // Top post (removed the cap)
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        
        // Bottom post
        ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);

        // Crossbar
        //ctx.fillRect(this.x - 20, this.topHeight, 50, this.width);

        // Add depth to posts
        ctx.fillStyle = '#DAA520';
       ctx.fillRect(this.x + this.width, 0, this.width / 2, this.topHeight);
      ctx.fillRect(this.x + this.width, this.bottomY, this.width / 2, canvas.height - this.bottomY);
       // ctx.fillRect(this.x - 20 + 50, this.topHeight, this.width / 2, this.width);

        // Red flags
        this.drawFlags();
        this.drawWindEffect();
    }

    drawShadow() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        // Top post shadow
        ctx.fillRect(this.x + 5, 0, this.width, this.topHeight);
        // Bottom post shadow
        ctx.fillRect(this.x + 5, this.bottomY, this.width, canvas.height - this.bottomY);
    }

    drawFlags() {
        ctx.fillStyle = '#FF0000';
        // Top flag
        ctx.beginPath();
        ctx.moveTo(this.x, this.topHeight - this.flagSize);
        ctx.lineTo(this.x - this.flagSize, this.topHeight - this.flagSize / 2);
        ctx.lineTo(this.x, this.topHeight);
        ctx.fill();
        // Bottom flag
        ctx.beginPath();
        ctx.moveTo(this.x, this.bottomY + this.flagSize);
        ctx.lineTo(this.x - this.flagSize, this.bottomY + this.flagSize / 2);
        ctx.lineTo(this.x, this.bottomY);
        ctx.fill();
    }

    drawWindEffect() {
        const time = Date.now() / 200; // Adjust for wind speed
        const windStrength = 3;

        ctx.fillStyle = '#FF0000';
        // Top flag wind effect
        ctx.beginPath();
        ctx.moveTo(this.x, this.topHeight - this.flagSize);
        ctx.quadraticCurveTo(
            this.x - this.flagSize / 2, 
            this.topHeight - this.flagSize / 2 + Math.sin(time) * windStrength,
            this.x - this.flagSize, 
            this.topHeight - this.flagSize / 2
        );
        ctx.lineTo(this.x, this.topHeight);
        ctx.fill();

        // Bottom flag wind effect
        ctx.beginPath();
        ctx.moveTo(this.x, this.bottomY + this.flagSize);
        ctx.quadraticCurveTo(
            this.x - this.flagSize / 2, 
            this.bottomY + this.flagSize / 2 + Math.sin(time + Math.PI) * windStrength,
            this.x - this.flagSize, 
            this.bottomY + this.flagSize / 2
        );
        ctx.lineTo(this.x, this.bottomY);
        ctx.fill();
    }

    update() {
        this.x -= 2;
    }

    offscreen() {
        return this.x < -this.width - 20;
    }
}


function drawBackground() {
    // Create gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#45a049');

    // Draw field
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw yard lines (vertical)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    // for (let i = 0; i < canvas.height; i += 60) {
    //     ctx.beginPath();
    //     ctx.moveTo(0, i);
    //     ctx.lineTo(canvas.width, i);
    //     ctx.stroke();
    // }
}

class FootballPlayer {
    constructor() {
        this.x = -50; // Start off-screen
        this.y = canvas.height - 100; // Adjust this value if needed to position the image correctly
        this.width = 64;  // Adjust based on your image size
        this.height = 64; // Adjust based on your image size
        this.speed = 2.5;
        this.hasKicked = false;
        
        this.image = new Image();
        this.image.src = 'assets/Capture2.png';
    }

    update(backgroundSpeed) {
        if (!this.hasKicked) {
            this.x += this.speed;
        } else {
            this.x -= backgroundSpeed;
        }
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

function updateScore() {
    scoreTracker.textContent = `Field Goals: ${score}`;
}

function playIntroAnimation() {
    return new Promise((resolve) => {
        const player = new StickFigurePlayer();
        const introBall = new Football();
        introBall.x = canvas.width / 2;
        introBall.y = canvas.height - 20;
        
        const backgroundSpeed = 2;
        let kickStarted = false;
        let playerControlStarted = false;
        let controlStartTime;

        const targetY = canvas.height / 3; // New target height for the football (2/3 from the top)

        const animate = (timestamp) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();

            // Draw instruction overlay (moved down to 1/3 from the top)
            const overlayY = canvas.height / 3;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, overlayY - 20, canvas.width, 40);
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Click or Space Bar to fly the football', canvas.width / 2, overlayY);

            player.update(backgroundSpeed);
            player.draw(ctx);

            if (player.x >= canvas.width / 2 - 15 && !kickStarted) {
                player.hasKicked = true;
                kickStarted = true;
            }

            if (kickStarted && !playerControlStarted) {
                // Move the ball to the new target height quickly
                introBall.y -= (introBall.y - targetY) * 0.1; // Adjust speed as needed
                
                if (Math.abs(introBall.y - targetY) < 1) {
                    playerControlStarted = true;
                    controlStartTime = timestamp;
                    football = introBall;
                    
                    // Transfer control to the player
                    document.addEventListener('keydown', (e) => {
                        if (e.code === 'Space') {
                            football.flap();
                        }
                    });
                    canvas.addEventListener('click', () => {
                        football.flap();
                    });
                }
            } else if (!kickStarted) {
                introBall.x = canvas.width / 2;
            }

            introBall.draw();

            if (playerControlStarted) {
                football.update();
                if (timestamp - controlStartTime >= 1000) {
                    resolve(football);
                    return;
                }
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    });
}

function checkCollision() {
    for (let post of posts) {
        if (football.x + football.width / 2 > post.x && football.x - football.width / 2 < post.x + post.width) {
            if (football.y - football.height / 2 < post.topHeight || football.y + football.height / 2 > post.bottomY) {
                return true;
            }
        }
    }
    return false;
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    whistleBlowSound.play();
    submitLeaderboardScore(playerName, score);
    startScreen.style.display = 'flex';
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    football.update();
    football.draw();

    if (posts.length === 0 || posts[posts.length - 1].x < canvas.width - 200) {
        posts.push(new GoalPost());
    }

    for (let i = posts.length - 1; i >= 0; i--) {
        posts[i].update();
        posts[i].draw();

        if (posts[i].offscreen()) {
            posts.splice(i, 1);
            score++;
            updateScore();
            if (score % 5 === 0) {
                crowdCheerSound.play();
            }
        }
    }

    if (checkCollision()) {
        gameOver();
    }
}

// Replace the existing startGame function with:
async function startGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Please enter your name before starting the game.");
        return;
    }
    startScreen.style.display = 'none';

    // Play intro animation and get the football object
    await playIntroAnimation();

    // Initialize the game state and start generating posts
    posts = [];
    score = 0;
    isGameOver = false;
    updateScore();
    gameLoop = setInterval(updateGame, 1000 / 60);
}


// Event listeners
startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isGameOver) {
        football.flap();
    }
});

canvas.addEventListener('click', () => {
    if (!isGameOver) {
        football.flap();
    }
});

// Initial setup
drawBackground();