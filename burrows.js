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

    function generateInitial(count = 6) {
        burrows = [];
        for (let i = 0; i < count; i++) {
            burrows.push(createGroundBurrow());
        }
    }

    function addSeasonal(min = 2, max = 3) {
        const additional = min + Math.floor(Math.random() * (max - min + 1));
        let placed = 0;
        let attempts = 0;
        const maxAttempts = additional * 20;
        const newIndices = [];

        while (placed < additional && attempts < maxAttempts) {
            const candidate = createGroundBurrow();
            if (isBurrowPlacementValid(candidate)) {
                burrows.push(candidate);
                newIndices.push(burrows.length - 1);
                placed++;
            }
            attempts++;
        }

        return newIndices;
    }

    function hasBurrows() {
        return burrows.length > 0;
    }

    function getBurrows() {
        return burrows;
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
        burrows.forEach(burrow => {
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
        draw(ctx, cellSize) {
            burrows.forEach(burrow => {
                drawAsset(ctx, asset, burrow.x, burrow.y, cellSize);
            });
        },
    };
}
