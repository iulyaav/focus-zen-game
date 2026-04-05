export function createBurrowSystem({
    gridWidth,
    gridHeight,
    fenceHeight,
    getFenceTopRow,
    drawAsset,
    getAssetCells,
    asset,
} = {}) {
    let burrows = [];
    let fenceRowBurrows = [];

    function generateInitial(count = 6) {
        burrows = [];
        fenceRowBurrows = createFenceRowBurrows();
        let placed = 0;
        let attempts = 0;
        const maxAttempts = count * 20;
        while (placed < count && attempts < maxAttempts) {
            const candidate = createGroundBurrow();
            if (isBurrowPlacementValid(candidate)) {
                burrows.push(candidate);
                placed += 1;
            }
            attempts += 1;
        }
    }

    function addSeasonal(min = 2, max = 3) {
        const additional = min + Math.floor(Math.random() * (max - min + 1));
        let placed = 0;
        let attempts = 0;
        const maxAttempts = additional * 20;
        const newIndices = [];
        const fenceCount = fenceRowBurrows.length;

        while (placed < additional && attempts < maxAttempts) {
            const candidate = createGroundBurrow();
            if (isBurrowPlacementValid(candidate)) {
                burrows.push(candidate);
                newIndices.push(fenceCount + (burrows.length - 1));
                placed++;
            }
            attempts++;
        }

        return newIndices;
    }

    function hasBurrows() {
        return burrows.length > 0 || fenceRowBurrows.length > 0;
    }

    function getBurrows() {
        return [...fenceRowBurrows, ...burrows];
    }

    function getFenceRowCount() {
        return fenceRowBurrows.length;
    }

    function createFenceRowBurrows() {
        const fenceTopRow = getFenceTopRow();
        const groundStartRow = Math.min(gridHeight, fenceTopRow + fenceHeight);
        const assetWidth = asset.grid[0].length;
        const minLeft = 0;
        const maxLeft = Math.max(0, gridWidth - assetWidth);
        const rowY = groundStartRow + asset.anchor.y;

        const row = [];
        let left = minLeft;
        while (left <= maxLeft) {
            row.push({ x: left + asset.anchor.x, y: rowY });
            const gap = 1 + Math.floor(Math.random() * 2);
            left += assetWidth + gap;
        }
        return row;
    }

    function createGroundBurrow() {
        const fenceTopRow = getFenceTopRow();
        const groundStartRow = Math.min(gridHeight, fenceTopRow + fenceHeight);
        const availableRows = Math.max(0, gridHeight - groundStartRow);
        const assetWidth = asset.grid[0].length;
        const assetHeight = asset.grid.length;
        const minX = asset.anchor.x;
        const maxX = gridWidth - (assetWidth - asset.anchor.x) - 1;
        const minY = groundStartRow + asset.anchor.y;
        const maxY = groundStartRow + availableRows - (assetHeight - asset.anchor.y) - 1;

        const x = minX + Math.floor(Math.random() * Math.max(1, maxX - minX + 1));
        const y = minY + Math.floor(Math.random() * Math.max(1, maxY - minY + 1));
        return { x, y };
    }

    function isBurrowPlacementValid(candidate) {
        const occupied = new Set();
        [...burrows, ...fenceRowBurrows].forEach(burrow => {
            getAssetCells(asset, burrow.x, burrow.y).forEach(cell => {
                occupied.add(`${cell.x},${cell.y}`);
            });
        });

        return getAssetCells(asset, candidate.x, candidate.y).every(cell => {
            return !occupied.has(`${cell.x},${cell.y}`);
        });
    }

    return {
        generateInitial,
        addSeasonal,
        hasBurrows,
        getBurrows,
        getFenceRowCount,
        draw(ctx, cellSize) {
            fenceRowBurrows.forEach(burrow => {
                drawAsset(ctx, asset, burrow.x, burrow.y, cellSize);
            });
            burrows.forEach(burrow => {
                drawAsset(ctx, asset, burrow.x, burrow.y, cellSize);
            });
        },
    };
}
