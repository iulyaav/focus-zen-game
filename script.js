const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const dayDisplay = document.getElementById('day-counter');

let days = 1;

// Resize canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

