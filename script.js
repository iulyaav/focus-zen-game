const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const dayDisplay = document.getElementById('day-counter');
const seasonDisplay = document.getElementById('season-name');
const yearDisplay = document.getElementById('year-counter');

let days = 1;
let year = 1;
let clicks = 0;
const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
let seasonIndex = 0;

const GRID_WIDTH = 160;
const GRID_HEIGHT = 90;
let cellSize = 10; // Each "pixel" is 10x10 real pixels
let skyPlane = null;
let groundPlane = null;
const welcomeScreen = createWelcomeScreen({ durationMs: 1200 });
const showGridLines = false;

resizeCanvas();
renderScene();
updateHud();

// An array to store which cells should be red
let redCells = [];

// Listen for the space bar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (welcomeScreen.active) {
            startWelcomeScreenFade();
            return;
        }
        clicks++;
        days++;
        updateHud();

        if (clicks % 30 === 0) {
            advanceSeason();
        }

        redCells.push(createColorPixel(GRID_WIDTH, GRID_HEIGHT));

        updateGarden();
    }
});

window.addEventListener('resize', () => {
    resizeCanvas();
});

function resizeCanvas() {
    // Resize canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    cellSize = Math.min(
        canvas.width / GRID_WIDTH,
        canvas.height / GRID_HEIGHT
    );

    updatePlanes();
    renderScene();
}

function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (welcomeScreen.active && !welcomeScreen.fading) {
        welcomeScreen.draw(ctx, canvas.width, canvas.height);
        return;
    }
    drawBackground();
    if (showGridLines) {
        drawGrid(cellSize, cellSize);
    }
    updateGarden();
    welcomeScreen.draw(ctx, canvas.width, canvas.height);
}

function updatePlanes() {
    const skyHeight = canvas.height / 3;

    skyPlane = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: skyHeight,
        color: '#a5aeb4',
    };

    groundPlane = {
        x: 0,
        y: skyHeight,
        width: canvas.width,
        height: canvas.height - skyHeight,
        color: '#ada171',
    };
}

function updateHud() {
    dayDisplay.innerText = days;
    seasonDisplay.innerText = seasons[seasonIndex];
    yearDisplay.innerText = year;
}

function advanceSeason() {
    seasonIndex = (seasonIndex + 1) % seasons.length;
    if (seasonIndex === 0) {
        year++;
    }
    updateHud();
}

function startWelcomeScreenFade() {
    welcomeScreen.startFade();
    function tick(timestamp) {
        welcomeScreen.update(timestamp);
        renderScene();

        if (welcomeScreen.active) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

function updateGarden() {
    // This is where we will draw the garden later!
    console.log("Day passed:", days);
    redCells.forEach(cell => {
        drawCell(cell.x, cell.y, cell.color);
    });
    
}

function drawGrid(stepX, stepY) {
    ctx.strokeStyle = '#e0e0e0'; // Light grey lines
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawBackground() {
    // Sky
    ctx.fillStyle = skyPlane.color;
    ctx.fillRect(skyPlane.x, skyPlane.y, skyPlane.width, skyPlane.height);

    // Ground
    ctx.fillStyle = groundPlane.color;
    ctx.fillRect(groundPlane.x, groundPlane.y, groundPlane.width, groundPlane.height);
}

function drawCell(gridX, gridY, color) {
    ctx.fillStyle = color;
    // We multiply the grid coordinate by the cell size to find the screen position
    ctx.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
}
