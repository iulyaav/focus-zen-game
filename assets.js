const ASSETS = {
    burrow: {
        anchor: { x: 3, y: 1 },
        opening: {x: 1, y: 3},
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
    grassA: {
        anchor: { x: 1, y: 1 },
        grid: [
            [1, 0, 1],
            [0, 1, 0],
        ],
        palette: {
            1: '#609436',
        },
    },
    grassB: {
        anchor: { x: 2, y: 3 },
        grid: [
            [1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 1],
            [0, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 1, 0],
        ],
        palette: {
            1: '#609436',
        },
    },
    grassC: {
        anchor: { x: 1, y: 1 },
        grid: [
            [0, 1, 0],
            [1, 2, 1],
            [0, 1, 0],
        ],
        palette: {
            1: '#ffffff',
            2: '#fdca09',
        },
    },
};

Object.assign(ASSETS, window.FLOWER_ASSETS || {});

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
