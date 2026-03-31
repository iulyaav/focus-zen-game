const springSkyState = {
    cloud: {
        gridX: -8,
        gridY: 3,
        width: 8,
        height: 3,
        bufferSteps: 0,
        initialized: false,
    },
};

function drawSpringSky(ctx, plane, cellSize) {
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

    drawCloud(ctx, plane, cellSize);
}

function drawCloud(ctx, plane, cellSize) {
    const cloud = [
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0],
    ];
    const startX = plane.x + cellSize * springSkyState.cloud.gridX;
    const startY = plane.y + cellSize * springSkyState.cloud.gridY;

    ctx.fillStyle = '#ffffff';
    for (let y = 0; y < cloud.length; y++) {
        for (let x = 0; x < cloud[y].length; x++) {
            if (!cloud[y][x]) continue;
            ctx.fillRect(
                startX + x * cellSize,
                startY + y * cellSize,
                cellSize,
                cellSize
            );
        }
    }
}

function updateSpringSky(plane, cellSize) {
    if (!cellSize) return;
    const maxCols = Math.floor(plane.width / cellSize);
    const cloud = springSkyState.cloud;

    if (!cloud.initialized) {
        cloud.gridX = -cloud.width;
        cloud.initialized = true;
    }

    if (cloud.bufferSteps > 0) {
        cloud.bufferSteps -= 1;
        return;
    }

    cloud.gridX += 1;

    if (cloud.gridX > maxCols) {
        cloud.gridX = -cloud.width;
        cloud.bufferSteps = 2 + Math.floor(Math.random() * 2);
    }
}

window.drawSpringSky = drawSpringSky;
window.updateSpringSky = updateSpringSky;
