import { ASSETS, drawAsset, getAssetCells } from './assets.js';
import { createBurrowSystem } from './burrows.js';
import { createFlowerSystem } from './flowers.js';
import { createWelcomeScreen } from './welcomeScreen.js';
import { drawSpringSky, updateSpringSky } from './seasons/spring.js';
import { drawSummerSky } from './seasons/summer.js';
import { drawAutumnSky } from './seasons/autumn.js';
import { drawWinterSky } from './seasons/winter.js';

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
const seasonSkies = {
    Spring: drawSpringSky,
    Summer: drawSummerSky,
    Autumn: drawAutumnSky,
    Winter: drawWinterSky,
};

const GRID_WIDTH = 160;
const GRID_HEIGHT = 90;
let cellSize = 10; // Each "pixel" is 10x10 real pixels
let gridOffsetX = 0;
let gridOffsetY = 0;
let gridPixelWidth = 0;
let gridPixelHeight = 0;
let skyPlane = null;
let groundPlane = null;
const welcomeScreen = createWelcomeScreen({ durationMs: 1200 });
const showGridLines = false;
let grassInstances = [];
const grassAssets = [ASSETS.grassA, ASSETS.grassB, ASSETS.grassC];
const fenceHeight = 7;
const fenceTopOffset = -2;
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
startSkyAnimation();

// Listen for the space bar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (welcomeScreen.active) {
            if (!welcomeScreen.fading) {
                startWelcomeScreenFade();
            }
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
        renderScene();
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
    gridPixelWidth = GRID_WIDTH * cellSize;
    gridPixelHeight = GRID_HEIGHT * cellSize;
    gridOffsetX = (canvas.width - gridPixelWidth) / 2;
    gridOffsetY = (canvas.height - gridPixelHeight) / 2;

    updatePlanes();
    if (grassInstances.length === 0) {
        generateGrass();
    }
    if (!burrowSystem.hasBurrows()) {
        burrowSystem.generateInitial(6);
        flowerSystem.initForBurrows(0);
        flowerSystem.plantRandom(burrowSystem.getBurrows().length, 'snowdrop', 1, 3);
        flowerSystem.plantRandom(burrowSystem.getBurrows().length, 'tulip', 1, 1);
    }
    renderScene();
}

function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (welcomeScreen.active && !welcomeScreen.fading) {
        drawWelcomeOverlay();
        return;
    }
    drawBackgroundCanvas();
    drawWorld();
    drawWelcomeOverlay();
}

function updatePlanes() {
    const skyHeight = gridPixelHeight / 3;
    const skyGridHeight = Math.floor(GRID_HEIGHT * (skyHeight / gridPixelHeight));

    skyPlane = {
        x: 0,
        y: 0,
        width: gridPixelWidth,
        height: skyHeight,
        color: '#a5aeb4',
        gridHeight: skyGridHeight,
    };

    groundPlane = {
        x: 0,
        y: skyHeight,
        width: gridPixelWidth,
        height: gridPixelHeight - skyHeight,
        color: '#acde7a',
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
    flowerSystem.plantRandom(burrowSystem.getBurrows().length, 'snowdrop', 1, 3);
    updateHud();
    renderScene();
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

function startSkyAnimation() {
    setInterval(() => {
        if (welcomeScreen.active) return;
        const seasonName = seasons[seasonIndex];
        if (seasonName !== 'Spring') return;
        updateSpringSky(skyPlane, cellSize);
        renderScene();
    }, 166);
}

function updateGarden() {
    console.log("Day passed:", days);
    drawGarden();
}

function drawWorld() {
    ctx.save();
    ctx.translate(gridOffsetX, gridOffsetY);
    ctx.beginPath();
    ctx.rect(0, 0, gridPixelWidth, gridPixelHeight);
    ctx.clip();
    drawFence();
    drawGrass();
    if (showGridLines) {
        drawGrid(cellSize, cellSize);
    }
    drawGarden();
    ctx.restore();
}

function drawGarden() {
    burrowSystem.draw(ctx, cellSize);
    drawFlowers();
}

function drawWelcomeOverlay() {
    welcomeScreen.draw(ctx, canvas.width, canvas.height);
}

function drawFlowers() {
    const burrows = burrowSystem.getBurrows();
    const flowers = flowerSystem.getFlowers();
    flowers.forEach(flower => {
        if (!flower.alive) return;
        const burrow = burrows[flower.burrowIndex];
        const asset = ASSETS[flower.asset];
        if (!burrow || !asset) return;
        // Align flower anchor directly to burrow anchor.
        drawAsset(ctx, asset, burrow.x, burrow.y, cellSize);
    });
}

function getFenceTopRow() {
    return skyPlane.gridHeight + fenceTopOffset;
}

function drawFence() {
    const fenceTopRow = getFenceTopRow();
    const fenceAsset = ASSETS.fence;
    const patternWidth = fenceAsset.grid[0].length;
    const patternHeight = fenceAsset.grid.length;

    for (let x = 0; x < GRID_WIDTH; x += patternWidth) {
        drawAsset(ctx, fenceAsset, x, fenceTopRow, cellSize);
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
    const groundRowStart = Math.max(skyPlane.gridHeight, getFenceTopRow() + fenceHeight);
    const groundRowCount = groundPlane.gridHeight;
    const grassCount = 11;

    grassInstances = [];
    const occupied = new Set();
    for (let i = 0; i < grassCount; i++) {
        const asset = pickGrassAssetByCount(i);
        const placement = createGroundAssetPlacement(asset, groundRowStart, groundRowCount, occupied);
        if (!placement) continue;
        grassInstances.push({ asset, x: placement.x, y: placement.y });
        markOccupied(asset, placement, occupied);
    }
}

function drawGrass() {
    grassInstances.forEach(instance => {
        drawAsset(ctx, instance.asset, instance.x, instance.y, cellSize);
    });
}

function createGroundAssetPlacement(asset, groundRowStart, groundRowCount, occupied) {
    const assetWidth = asset.grid[0].length;
    const assetHeight = asset.grid.length;
    const minX = asset.anchor.x;
    const maxX = GRID_WIDTH - (assetWidth - asset.anchor.x) - 1;
    const minY = groundRowStart + asset.anchor.y;
    const maxY = groundRowStart + groundRowCount - (assetHeight - asset.anchor.y) - 1;

    if (maxX < minX || maxY < minY) {
        return null;
    }

    let attempts = 0;
    const maxAttempts = 20;
    while (attempts < maxAttempts) {
        const x = minX + Math.floor(Math.random() * (maxX - minX + 1));
        const y = minY + Math.floor(Math.random() * (maxY - minY + 1));
        if (isPlacementFree(asset, { x, y }, occupied)) {
            return { x, y };
        }
        attempts++;
    }
    return null;
}

function pickGrassAssetByCount(index) {
    if (index < 5) return ASSETS.grassA;
    if (index < 8) return ASSETS.grassB;
    return ASSETS.grassC;
}

function isPlacementFree(asset, placement, occupied) {
    const cells = getAssetCells(asset, placement.x, placement.y);
    return cells.every(cell => !occupied.has(`${cell.x},${cell.y}`));
}

function markOccupied(asset, placement, occupied) {
    const cells = getAssetCells(asset, placement.x, placement.y);
    cells.forEach(cell => {
        occupied.add(`${cell.x},${cell.y}`);
    });
}

function drawGrid(stepX, stepY) {
    ctx.strokeStyle = '#e0e0e0'; // Light grey lines
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= gridPixelWidth; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gridPixelHeight);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= gridPixelHeight; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gridPixelWidth, y);
        ctx.stroke();
    }
}

function drawBackgroundCanvas() {
    const seasonName = seasons[seasonIndex];
    const drawSky = seasonSkies[seasonName] || drawSpringSky;
    const horizonY = gridOffsetY + skyPlane.height;
    const skyPlaneCanvas = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: horizonY,
    };

    drawSky(ctx, skyPlaneCanvas, cellSize);

    ctx.fillStyle = groundPlane.color;
    ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
}

function drawCell(gridX, gridY, color) {
    ctx.fillStyle = color;
    // We multiply the grid coordinate by the cell size to find the screen position
    ctx.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
}
