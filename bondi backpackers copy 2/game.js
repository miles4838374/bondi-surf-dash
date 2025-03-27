// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const winScreen = document.getElementById('win-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Game states
const GAME_STATE = {
    START: 0,
    STREET_LEVEL: 1,
    WIN: 2
};

let gameState = GAME_STATE.START;
let level = 1;
let gameLoop;
let gameTimer = 0; // Timer to track how long it takes to reach the beach
let finalTime = 0; // Store the final time when player reaches the beach

// Game dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GRID_SIZE = 50;

// Player properties
const player = {
    x: GAME_WIDTH / 2 - 25,
    y: GAME_HEIGHT - 100,
    width: 50,
    height: 50,
    speed: 7,
    color: '#FF6347',
    image: null
};

// Obstacles arrays
let vehicles = [];
let dogs = [];

// Images
const images = {
    player: 'assets/backpacker.svg',
    tukTuk: 'assets/tuktuk.svg',
    scooter: 'assets/scooter.svg',
    dog: 'assets/dog.svg',
    beach: 'assets/beach-background.svg',
    street: 'assets/street-background.svg',
    palmTree: 'assets/palm-tree.svg'
};

// Loaded image objects
const loadedImages = {};

// Initialize the game
function init() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // Set up event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    
    // Load images
    preloadImages();
}

// Preload all images
function preloadImages() {
    let loadedCount = 0;
    const totalImages = Object.keys(images).length;
    
    // Disable start button until all images are loaded
    startButton.disabled = true;
    
    // Load each image
    for (const key in images) {
        loadedImages[key] = new Image();
        loadedImages[key].onload = function() {
            loadedCount++;
            if (loadedCount === totalImages) {
                startButton.disabled = false;
            }
        };
        loadedImages[key].src = images[key];
    }
}

// Start the game
function startGame() {
    gameState = GAME_STATE.STREET_LEVEL;
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    
    // Reset timer
    gameTimer = 0;
    
    // Set up keyboard controls
    setupControls();
    
    // Initialize level
    initStreetLevel();
    
    // Start game loop
    gameLoop = setInterval(update, 1000 / 60); // 60 FPS
}

// Restart the game
function restartGame() {
    gameState = GAME_STATE.STREET_LEVEL;
    winScreen.style.display = 'none';
    canvas.style.display = 'block';
    
    // Reset player position
    player.x = GAME_WIDTH / 2 - 25;
    player.y = GAME_HEIGHT - 100;
    
    // Reset timer
    gameTimer = 0;
    
    // Initialize level
    initStreetLevel();
    
    // Start game loop
    gameLoop = setInterval(update, 1000 / 60); // 60 FPS
}

// Initialize street level
function initStreetLevel() {
    // Reset arrays
    vehicles = [];
    dogs = [];
    
    // Create initial vehicles
    for (let i = 0; i < 3; i++) {
        createVehicle();
    }
    
    // Create initial dogs
    for (let i = 0; i < 2; i++) {
        createDog();
    }
}

// Create a new vehicle
function createVehicle() {
    const isLeftToRight = Math.random() > 0.5;
    const y = 100 + Math.floor(Math.random() * (GAME_HEIGHT - 300));
    const speed = 1 + Math.random() * 3;
    const type = Math.random() > 0.5 ? 'tukTuk' : 'scooter';
    const width = type === 'tukTuk' ? 80 : 60;
    
    vehicles.push({
        x: isLeftToRight ? -width : GAME_WIDTH,
        y: y,
        width: width,
        height: 40,
        speed: isLeftToRight ? speed : -speed,
        type: type
    });
}

// Create a new dog
function createDog() {
    const isLeftToRight = Math.random() > 0.5;
    const y = 100 + Math.floor(Math.random() * (GAME_HEIGHT - 300));
    const speed = 0.5 + Math.random() * 2;
    
    dogs.push({
        x: isLeftToRight ? -30 : GAME_WIDTH,
        y: y,
        width: 30,
        height: 20,
        speed: isLeftToRight ? speed : -speed
    });
}

// Set up keyboard controls
function setupControls() {
    window.addEventListener('keydown', function(e) {
        // Street level controls (arrow keys)
        if (gameState === GAME_STATE.STREET_LEVEL) {
            switch(e.key) {
                case 'ArrowUp':
                    player.y = Math.max(50, player.y - player.speed);
                    break;
                case 'ArrowDown':
                    player.y = Math.min(GAME_HEIGHT - player.height, player.y + player.speed);
                    break;
                case 'ArrowLeft':
                    player.x = Math.max(0, player.x - player.speed);
                    break;
                case 'ArrowRight':
                    player.x = Math.min(GAME_WIDTH - player.width, player.x + player.speed);
                    break;
            }
        }
    });
}

// Main game update function
function update() {
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    if (gameState === GAME_STATE.STREET_LEVEL) {
        // Update timer (add 1/60 of a second per frame at 60 FPS)
        gameTimer += 1/60;
        
        updateStreetLevel();
    }
}

// Update street level
function updateStreetLevel() {
    // Draw background
    drawStreetBackground();
    
    // Draw beach at the top
    drawBeach();
    
    // Update and draw vehicles
    updateVehicles();
    
    // Update and draw dogs
    updateDogs();
    
    // Draw player
    drawPlayer();
    
    // Display timer
    displayTimer();
    
    // Check if player reached the beach
    if (player.y < 100) {
        // Player reached the beach - show win screen
        finalTime = gameTimer; // Store the final time
        gameState = GAME_STATE.WIN;
        clearInterval(gameLoop);
        canvas.style.display = 'none';
        
        // Update win screen with the time
        updateWinScreenWithTime();
        
        winScreen.style.display = 'flex';
    }
}

// Update vehicles
function updateVehicles() {
    // Move existing vehicles
    for (let i = 0; i < vehicles.length; i++) {
        vehicles[i].x += vehicles[i].speed;
        
        // Remove vehicles that are off-screen
        if ((vehicles[i].speed > 0 && vehicles[i].x > GAME_WIDTH) || 
            (vehicles[i].speed < 0 && vehicles[i].x < -vehicles[i].width)) {
            vehicles.splice(i, 1);
            i--;
            createVehicle(); // Create a new vehicle to replace it
        } else {
            // Draw vehicle
            if (loadedImages[vehicles[i].type]) {
                ctx.drawImage(
                    loadedImages[vehicles[i].type],
                    vehicles[i].x,
                    vehicles[i].y,
                    vehicles[i].width,
                    vehicles[i].height
                );
            } else {
                // Fallback if image not loaded
                ctx.fillStyle = vehicles[i].type === 'tukTuk' ? '#FFD700' : '#1E90FF';
                ctx.fillRect(vehicles[i].x, vehicles[i].y, vehicles[i].width, vehicles[i].height);
            }
            
            // Check collision with player
            if (checkCollision(player, vehicles[i])) {
                // Reset player position
                player.x = GAME_WIDTH / 2 - 25;
                player.y = GAME_HEIGHT - 100;
            }
        }
    }
    
    // Randomly add new vehicles
    if (Math.random() < 0.005 && vehicles.length < 8) {
        createVehicle();
    }
}

// Update dogs
function updateDogs() {
    // Move existing dogs
    for (let i = 0; i < dogs.length; i++) {
        dogs[i].x += dogs[i].speed;
        
        // Remove dogs that are off-screen
        if ((dogs[i].speed > 0 && dogs[i].x > GAME_WIDTH) || 
            (dogs[i].speed < 0 && dogs[i].x < -dogs[i].width)) {
            dogs.splice(i, 1);
            i--;
            createDog(); // Create a new dog to replace it
        } else {
            // Draw dog
            if (loadedImages.dog) {
                ctx.drawImage(
                    loadedImages.dog,
                    dogs[i].x,
                    dogs[i].y,
                    dogs[i].width,
                    dogs[i].height
                );
            } else {
                // Fallback if image not loaded
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(dogs[i].x, dogs[i].y, dogs[i].width, dogs[i].height);
            }
            
            // Check collision with player
            if (checkCollision(player, dogs[i])) {
                // Reset player position
                player.x = GAME_WIDTH / 2 - 25;
                player.y = GAME_HEIGHT - 100;
            }
        }
    }
    
    // Randomly add new dogs
    if (Math.random() < 0.003 && dogs.length < 4) {
        createDog();
    }
}

// Draw player
function drawPlayer() {
    if (loadedImages.player) {
        ctx.drawImage(
            loadedImages.player,
            player.x,
            player.y,
            player.width,
            player.height
        );
    } else {
        // Fallback if image not loaded
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

// Draw street background
function drawStreetBackground() {
    if (loadedImages.street) {
        ctx.drawImage(loadedImages.street, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
        // Fallback if image not loaded
        // Draw sky
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Draw street
        ctx.fillStyle = '#808080'; // Gray
        ctx.fillRect(0, 100, GAME_WIDTH, GAME_HEIGHT - 200);
        
        // Draw sidewalks
        ctx.fillStyle = '#D3D3D3'; // Light gray
        ctx.fillRect(0, 100, GAME_WIDTH, 20); // Top sidewalk
        ctx.fillRect(0, GAME_HEIGHT - 100, GAME_WIDTH, 20); // Bottom sidewalk
    }
    
    // Draw palm trees
    for (let i = 0; i < 5; i++) {
        drawPalmTree(i * 200, GAME_HEIGHT - 120);
    }
    
    // Draw hostel at the bottom
    drawHostel();
}

// Draw beach at the top of street level
function drawBeach() {
    ctx.fillStyle = '#F5DEB3'; // Wheat
    ctx.fillRect(0, 0, GAME_WIDTH, 100);
    
    // Draw ocean
    ctx.fillStyle = '#1E90FF'; // Dodger blue
    ctx.fillRect(0, 0, GAME_WIDTH, 50);
    
    // Draw palm trees
    for (let i = 0; i < 5; i++) {
        drawPalmTree(i * 200, 50);
    }
}

// Draw hostel
function drawHostel() {
    ctx.fillStyle = '#CD853F'; // Peru (brownish)
    ctx.fillRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT - 180, 200, 80);
    
    // Draw door
    ctx.fillStyle = '#8B4513'; // Saddle brown
    ctx.fillRect(GAME_WIDTH / 2 - 20, GAME_HEIGHT - 140, 40, 40);
    
    // Draw sign
    ctx.fillStyle = 'white';
    ctx.fillRect(GAME_WIDTH / 2 - 80, GAME_HEIGHT - 170, 160, 30);
    
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Bondi Backpackers', GAME_WIDTH / 2 - 70, GAME_HEIGHT - 150);
}

// Draw palm tree
function drawPalmTree(x, y) {
    if (loadedImages.palmTree) {
        ctx.drawImage(loadedImages.palmTree, x - 25, y - 50, 50, 100);
    } else {
        // Fallback if image not loaded
        // Draw trunk
        ctx.fillStyle = '#8B4513'; // Saddle brown
        ctx.fillRect(x, y - 50, 10, 50);
        
        // Draw leaves
        ctx.fillStyle = '#32CD32'; // Lime green
        ctx.beginPath();
        ctx.arc(x + 5, y - 50, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Check collision between two objects
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Display timer during gameplay
function displayTimer() {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    
    const timerText = `Time: ${gameTimer.toFixed(1)}s`;
    
    // Draw text shadow/outline
    ctx.strokeText(timerText, 20, 30);
    
    // Draw text
    ctx.fillText(timerText, 20, 30);
}

// Update win screen with the player's time
function updateWinScreenWithTime() {
    const timeElement = document.getElementById('player-time');
    if (timeElement) {
        timeElement.textContent = finalTime.toFixed(1);
    }
}

// Initialize the game when the page loads
window.onload = init;
