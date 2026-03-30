const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const dayDisplay = document.getElementById('day-counter');

let days = 1;

// Resize canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const CELL_SIZE = 10; // Each "pixel" is 10x10 real pixels
const GRID_WIDTH = 160;
const GRID_HEIGHT = 90;

drawGrid(CELL_SIZE, CELL_SIZE);

// An array to store which cells should be red
let redCells = [];

// Listen for the space bar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        days++;
        dayDisplay.innerText = days;

        redCells.push(createColorPixel(GRID_WIDTH, GRID_HEIGHT));

        updateGarden();
    }
});

function updateGarden() {
    // This is where we will draw the garden later!
    console.log("Day passed:", days);
    redCells.forEach(cell => {
        drawCell(cell.x, cell.y, 'red');
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

function drawCell(gridX, gridY, color) {
    ctx.fillStyle = color;
    // We multiply the grid coordinate by the cell size to find the screen position
    ctx.fillRect(gridX * CELL_SIZE, gridY * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}
