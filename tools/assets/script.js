import { ASSETS, drawAsset } from '../../assets.js';

const grid = document.getElementById('asset-grid');
const sheetCanvas = document.getElementById('asset-sheet-canvas');

function setStatus(message) {
    if (!grid) return;
    let banner = document.getElementById('asset-status');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'asset-status';
        banner.style.padding = '12px 14px';
        banner.style.background = '#fff3c4';
        banner.style.border = '1px solid #e2c26d';
        banner.style.borderRadius = '8px';
        banner.style.color = '#5b4500';
        banner.style.marginBottom = '16px';
        grid.parentElement?.insertBefore(banner, grid);
    }
    banner.textContent = message;
}

const cellSize = 8;
const paddingCells = 2;
const sheetGapCells = 3;
const maxSheetColumns = 5;

if (location.protocol === 'file:') {
    setStatus('This page needs a local server to load ES modules. Run `npm run dev` and open http://localhost:5173/tools/assets/.');
}

const assetEntries = Object.keys(ASSETS)
    .sort()
    .map((name) => ({ name, asset: ASSETS[name] }))
    .filter(({ asset }) => asset?.grid?.length);

function renderAssetCard({ name, asset }) {
    const gridWidth = asset.grid[0].length;
    const gridHeight = asset.grid.length;
    const canvasGridWidth = gridWidth + paddingCells * 2;
    const canvasGridHeight = gridHeight + paddingCells * 2;

    const card = document.createElement('section');
    card.className = 'asset-card';

    const title = document.createElement('h2');
    title.textContent = name;
    card.appendChild(title);

    const canvas = document.createElement('canvas');
    canvas.className = 'asset-canvas';
    canvas.width = canvasGridWidth * cellSize;
    canvas.height = canvasGridHeight * cellSize;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const worldX = paddingCells + asset.anchor.x;
    const worldY = paddingCells + asset.anchor.y;
    drawAsset(ctx, asset, worldX, worldY, cellSize);

    card.appendChild(canvas);
    grid.appendChild(card);
}

function drawAssetSheet() {
    if (!sheetCanvas) return;

    const columns = Math.min(maxSheetColumns, Math.max(1, assetEntries.length));
    const rows = Math.ceil(assetEntries.length / columns);
    const maxAssetWidth = Math.max(...assetEntries.map(({ asset }) => asset.grid[0].length));
    const maxAssetHeight = Math.max(...assetEntries.map(({ asset }) => asset.grid.length));

    const cellBlockWidth = maxAssetWidth + paddingCells * 2 + sheetGapCells;
    const cellBlockHeight = maxAssetHeight + paddingCells * 2 + sheetGapCells;

    const sheetGridWidth = columns * cellBlockWidth - sheetGapCells;
    const sheetGridHeight = rows * cellBlockHeight - sheetGapCells;

    sheetCanvas.width = sheetGridWidth * cellSize;
    sheetCanvas.height = sheetGridHeight * cellSize;

    const ctx = sheetCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    assetEntries.forEach(({ asset }, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const offsetX = col * cellBlockWidth + paddingCells;
        const offsetY = row * cellBlockHeight + paddingCells;
        const worldX = offsetX + asset.anchor.x;
        const worldY = offsetY + asset.anchor.y;
        drawAsset(ctx, asset, worldX, worldY, cellSize);
    });
}

if (assetEntries.length === 0) {
    setStatus('No assets found to render. Check the console for module load errors.');
} else {
    assetEntries.forEach(renderAssetCard);
    drawAssetSheet();
}
