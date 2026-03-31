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
const grassColor = '#609436';
let grassBlades = [];
const fenceHeight = 6;
const fenceTopOffset = 0;
const fenceColors = {
    outline: '#1f1f1f',
    main: '#d07a3a',
    highlight: '#f3a35b',
};
const burrowSystem = createBurrowSystem({
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    fenceHeight,
    getFenceTopRow,
    drawAsset,
    getAssetCells,
    asset: ASSETS.burrow,
});
const flowerSystem = createFlowerSystem();

resizeCanvas();
renderScene();
updateHud();

// Listen for the space bar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
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

        flowerSystem.updateAll();
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
    if (grassBlades.length === 0) {
        generateGrass();
    }
    if (!burrowSystem.hasBurrows()) {
        burrowSystem.generateInitial(6);
        flowerSystem.initForBurrows(burrowSystem.getBurrows().length);
    }
    renderScene();
}

function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (welcomeScreen.active && !welcomeScreen.fading) {
        drawWelcomeOverlay();
        return;
    }
    drawWorld();
    drawWelcomeOverlay();
}

function updatePlanes() {
    const skyHeight = canvas.height / 3;
    const skyGridHeight = Math.floor(GRID_HEIGHT * (skyHeight / canvas.height));

    skyPlane = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: skyHeight,
        color: '#a5aeb4',
        gridHeight: skyGridHeight,
    };

    groundPlane = {
        x: 0,
        y: skyHeight,
        width: canvas.width,
        height: canvas.height - skyHeight,
        color: '#c0d46f',
        gridHeight: GRID_HEIGHT - skyGridHeight,
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
    const newIndices = burrowSystem.addSeasonal();
    newIndices.forEach(index => {
        flowerSystem.addForBurrow(index);
    });
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
    console.log("Day passed:", days);
    drawGarden();
}

function drawWorld() {
    drawBackground();
    drawFence();
    drawGrass();
    if (showGridLines) {
        drawGrid(cellSize, cellSize);
    }
    drawGarden();
}

function drawGarden() {
    burrowSystem.draw(ctx, cellSize);
}

function drawWelcomeOverlay() {
    welcomeScreen.draw(ctx, canvas.width, canvas.height);
}

function getFenceTopRow() {
    return skyPlane.gridHeight + fenceTopOffset;
}

function drawFence() {
    const fenceTopRow = getFenceTopRow();
    const postHeight = fenceHeight;
    const postWidth = 3;
    const postSpacing = 8;
    const railHeight = 2;
    const railOffsets = [2, 4];

    // Rails with outline and highlight
    railOffsets.forEach(offset => {
        const railY = fenceTopRow + offset;
        drawPixelRect(0, railY, GRID_WIDTH, railHeight, fenceColors.outline);
        drawPixelRect(1, railY + 1, GRID_WIDTH - 2, railHeight - 1, fenceColors.main);
        drawPixelRect(1, railY + 1, 1, railHeight - 1, fenceColors.highlight);
    });

    // Posts
    for (let x = 1; x < GRID_WIDTH - postWidth; x += postSpacing) {
        drawPixelRect(x, fenceTopRow, postWidth, postHeight, fenceColors.outline);
        drawPixelRect(x + 1, fenceTopRow + 1, postWidth - 2, postHeight - 2, fenceColors.main);
        drawPixelRect(x + 1, fenceTopRow + 1, 1, postHeight - 2, fenceColors.highlight);
    }
}

function drawPixelRect(gridX, gridY, gridWidth, gridHeight, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        gridX * cellSize,
        gridY * cellSize,
        gridWidth * cellSize,
        gridHeight * cellSize
    );
}

function generateGrass() {
    const groundRowStart = skyPlane.gridHeight;
    const groundRowCount = groundPlane.gridHeight;
    const totalGroundCells = GRID_WIDTH * groundRowCount;
    const bladeCount = Math.max(1, Math.floor(totalGroundCells * 0.06));

    grassBlades = [];
    for (let i = 0; i < bladeCount; i++) {
        const height = Math.random() < 0.5 ? 1 : 2;
        const x = Math.floor(Math.random() * GRID_WIDTH);
        const yMin = groundRowStart + height - 1;
        const y = yMin + Math.floor(Math.random() * (groundRowCount - (height - 1)));
        grassBlades.push({ x, y, height });
    }
}

function drawGrass() {
    ctx.fillStyle = grassColor;
    grassBlades.forEach(blade => {
        const startY = (blade.y - blade.height + 1) * cellSize;
        ctx.fillRect(
            blade.x * cellSize,
            startY,
            cellSize,
            blade.height * cellSize
        );
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
    drawPixelSky(skyPlane);

    // Ground
    ctx.fillStyle = groundPlane.color;
    ctx.fillRect(groundPlane.x, groundPlane.y, groundPlane.width, groundPlane.height);
}

function drawPixelSky(plane) {
    const palette = ['#9cd9f0', '#8ecae6', '#7bb6d6', '#6aa6c9'];
    const bandHeight = Math.max(1, Math.floor(plane.height / palette.length));

    for (let i = 0; i < palette.length; i++) {
        ctx.fillStyle = palette[i];
        const y = plane.y + i * bandHeight;
        const height = i === palette.length - 1
            ? plane.height - i * bandHeight
            : bandHeight;
        ctx.fillRect(plane.x, y, plane.width, height);
    }
}

function drawCell(gridX, gridY, color) {
    ctx.fillStyle = color;
    // We multiply the grid coordinate by the cell size to find the screen position
    ctx.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
}
