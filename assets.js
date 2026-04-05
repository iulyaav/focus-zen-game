import { FLOWER_ASSETS } from './flowers/snowdrop.js';
import { TULIP_ASSETS } from './flowers/tulip.js';
import { POPPY_ASSETS } from './flowers/poppy.js';
import { DAFFODIL_ASSETS } from './flowers/daffodil.js';

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
            [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
            [3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3],
            [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0]
        ],
        palette: {
            1: '#d69e60',
            2: '#8c5e33',
            3: '#8d5f34',
        },
    },
    springGrassA: {
        anchor: { x: 1, y: 1 },
        grid: [
            [1, 0, 1],
            [0, 1, 0],
        ],
        palette: {
            1: '#609436',
        },
    },
    springGrassB: {
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
    springGrassC: {
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
    summerGrass: {
        anchor: { x: 3, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 1],
            [0, 0, 1, 0, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
        ],
        palette: {
            1: '#6bb269',
        },
    },
    summerGrassB: {
        anchor: { x: 2, y: 4 },
        grid: [
            [0, 1, 0, 1, 0],
            [1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1],
            [0, 0, 1, 1, 0],
            [0, 0, 1, 0, 0],
        ],
        palette: {
            1: '#6bb269',
        },
    },
    summerGrassC: {
        anchor: { x: 3, y: 3 },
        grid: [
            [0, 0, 1, 0, 1, 0],
            [1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0],
            [0, 0, 1, 0, 0, 0],
        ],
        palette: {
            1: '#6bb269',
        },
    },
};

Object.assign(ASSETS, FLOWER_ASSETS || {});
Object.assign(ASSETS, TULIP_ASSETS || {});
Object.assign(ASSETS, POPPY_ASSETS || {});
Object.assign(ASSETS, DAFFODIL_ASSETS || {});

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

export { ASSETS, drawAsset, getAssetCells };
