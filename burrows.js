function createBurrowSystem({
    gridWidth,
    gridHeight,
    fenceHeight,
    getFenceTopRow,
    drawPixelRect,
    color = '#d69e60',
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

    function draw() {
        burrows.forEach(burrow => drawBurrow(burrow.x, burrow.y));
    }

    function createGroundBurrow() {
        const fenceTopRow = getFenceTopRow();
        const groundStartRow = Math.min(gridHeight, fenceTopRow + fenceHeight);
        const availableRows = Math.max(0, gridHeight - groundStartRow);
        const shapeHeight = 3;
        const shapeHalfWidth = 2;

        const x = shapeHalfWidth + Math.floor(Math.random() * (gridWidth - shapeHalfWidth * 2));
        const y = groundStartRow + shapeHeight + Math.floor(Math.random() * (availableRows - shapeHeight - 1));
        return { x, y };
    }

    function isBurrowPlacementValid(candidate) {
        const occupied = new Set();
        burrows.forEach(burrow => {
            getBurrowCells(burrow.x, burrow.y).forEach(cell => {
                occupied.add(`${cell.x},${cell.y}`);
            });
        });

        return getBurrowCells(candidate.x, candidate.y).every(cell => {
            return !occupied.has(`${cell.x},${cell.y}`);
        });
    }

    function getBurrowCells(centerX, centerY) {
        return [
            { x: centerX - 1, y: centerY - 1 },
            { x: centerX, y: centerY - 1 },
            { x: centerX + 1, y: centerY - 1 },
            { x: centerX - 2, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX, y: centerY },
            { x: centerX + 1, y: centerY },
            { x: centerX + 2, y: centerY },
            { x: centerX - 1, y: centerY + 1 },
            { x: centerX, y: centerY + 1 },
            { x: centerX + 1, y: centerY + 1 },
        ];
    }

    function drawBurrow(centerX, centerY) {
        const rows = [
            { y: centerY - 1, halfWidth: 1 },
            { y: centerY, halfWidth: 2 },
            { y: centerY + 1, halfWidth: 1 },
        ];

        rows.forEach(row => {
            drawPixelRect(
                centerX - row.halfWidth,
                row.y,
                row.halfWidth * 2 + 1,
                1,
                color
            );
        });
        drawPixelRect(centerX, centerY, 1, 1, color);
    }

    return {
        generateInitial,
        addSeasonal,
        hasBurrows,
        getBurrows,
        draw,
    };
}

window.createBurrowSystem = createBurrowSystem;
