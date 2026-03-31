function drawSummerSky(ctx, plane, cellSize) {
    ctx.fillStyle = '#4c9cd3';
    ctx.fillRect(plane.x, plane.y, plane.width, plane.height);
}

window.drawSummerSky = drawSummerSky;
