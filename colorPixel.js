export function createColorPixel(gridWidth, gridHeight, color = 'red') {
    return {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
        color,
    };
}
