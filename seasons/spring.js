const springSkyState = {
    cloudsA: [],
    cloudsB: [],
    lastCellSize: null,
    lastPlaneWidth: null,
    lastPlaneHeight: null,
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

    initClouds(plane, cellSize);
    springSkyState.cloudsA.forEach(cloud => drawCloud(ctx, plane, cellSize, cloud));
    springSkyState.cloudsB.forEach(cloud => drawCloudB(ctx, plane, cellSize, cloud));
}

function drawCloud(ctx, plane, cellSize, cloudState) {
    const cloud = [
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0],
    ];
    const startX = plane.x + cellSize * cloudState.gridX;
    const startY = plane.y + cellSize * cloudState.gridY;

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

function drawCloudB(ctx, plane, cellSize, cloudState) {
    const cloudB = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 2, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 2, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 2, 2, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 2, 2, 2, 2, 2, 2, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const palette = {
        1: '#ffffff',
        2: '#c9efff',
    };
    const startX = plane.x + cellSize * cloudState.gridX;
    const startY = plane.y + cellSize * cloudState.gridY;

    for (let y = 0; y < cloudB.length; y++) {
        for (let x = 0; x < cloudB[y].length; x++) {
            const value = cloudB[y][x];
            if (!value) continue;
            ctx.fillStyle = palette[value];
            ctx.fillRect(
                startX + x * cellSize,
                startY + y * cellSize,
                cellSize,
                cellSize
            );
        }
    }
}

function initClouds(plane, cellSize) {
    if (!cellSize) return;
    if (
        springSkyState.cloudsA.length &&
        springSkyState.cloudsB.length &&
        springSkyState.lastCellSize === cellSize &&
        springSkyState.lastPlaneWidth === plane.width &&
        springSkyState.lastPlaneHeight === plane.height
    ) {
        return;
    }

    const maxCols = Math.floor(plane.width / cellSize);
    const maxRows = Math.floor(plane.height / cellSize);

    springSkyState.cloudsA = [createCloudA(), createCloudA()];
    springSkyState.cloudsB = [createCloudB(), createCloudB(), createCloudB()];

    const cloudA1 = springSkyState.cloudsA[0];
    const cloudA2 = springSkyState.cloudsA[1];
    const maxY = Math.max(1, maxRows - cloudA1.height);
    const y1 = Math.floor(Math.random() * maxY);
    let y2 = Math.floor(Math.random() * maxY);
    if (y2 === y1) {
        y2 = (y2 + 1) % maxY;
    }
    cloudA1.gridX = -cloudA1.width;
    cloudA1.gridY = y1;
    const gap = cloudA1.width + 2 + Math.floor(Math.random() * 8);
    cloudA2.gridX = -cloudA2.width - gap;
    cloudA2.gridY = y2;

    springSkyState.cloudsB.forEach(cloud => {
        const maxX = Math.max(0, maxCols - cloud.width);
        const maxY = Math.max(0, maxRows - cloud.height);
        cloud.gridX = Math.floor(Math.random() * (maxX + 1));
        cloud.gridY = Math.floor(Math.random() * (maxY + 1));
    });

    springSkyState.lastCellSize = cellSize;
    springSkyState.lastPlaneWidth = plane.width;
    springSkyState.lastPlaneHeight = plane.height;
}

function createCloudA() {
    return {
        gridX: -8,
        gridY: 3,
        width: 8,
        height: 3,
        bufferSteps: 0,
        initialized: true,
    };
}

function createCloudB() {
    return {
        gridX: 0,
        gridY: 0,
        width: 10,
        height: 10,
        initialized: true,
    };
}

function updateSpringSky(plane, cellSize) {
    if (!cellSize) return;
    const maxCols = Math.floor(plane.width / cellSize);
    springSkyState.cloudsA.forEach(cloud => {
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
    });

}

window.drawSpringSky = drawSpringSky;
window.updateSpringSky = updateSpringSky;
