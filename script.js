const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const dayDisplay = document.getElementById('day-counter');

let days = 1;

// Resize canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

drawGrid(10, 10);

// Listen for the space bar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        days++;
        dayDisplay.innerText = days;
        updateGarden();
    }
});

function updateGarden() {
    // This is where we will draw the garden later!
    console.log("Day passed:", days);
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

