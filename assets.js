const ASSETS = {
    burrow: {
        anchor: { x: 3, y: 1 },
        grid: [
            [0, 1, 1, 1, 1, 1, 0],
            [1, 1, 2, 2, 2, 1, 1],
            [0, 1, 1, 1, 1, 1, 0],
        ],
        palette: {
            1: '#e8cfa6',
            2: '#eac085',
        },
    },
    fence: {
        anchor: { x: 0, y: 0 },
        grid: [
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
        ],
        palette: {
            1: '#d69e60',
            2: '#8c5e33',
            3: '#8d5f34',
        },
    },
};

function drawAsset(ctx, asset, worldX, worldY, cellSize) {
    for (let y = 0; y < asset.grid.length; y++) {
        const row = asset.grid[y];
        for (let x = 0; x < row.length; x++) {
            const value = row[x];
            if (!value) continue;
            const color = asset.palette[value];
            if (!color) continue;
            ctx.fillStyle = color;
            const gridX = worldX + x - asset.anchor.x;
            const gridY = worldY + y - asset.anchor.y;
            ctx.fillRect(
                gridX * cellSize,
                gridY * cellSize,
                cellSize,
                cellSize
            );
        }
    }
}

function getAssetCells(asset, worldX, worldY) {
    const cells = [];
    for (let y = 0; y < asset.grid.length; y++) {
        const row = asset.grid[y];
        for (let x = 0; x < row.length; x++) {
            if (!row[x]) continue;
            cells.push({
                x: worldX + x - asset.anchor.x,
                y: worldY + y - asset.anchor.y,
            });
        }
    }
    return cells;
}

window.ASSETS = ASSETS;
window.drawAsset = drawAsset;
window.getAssetCells = getAssetCells;
