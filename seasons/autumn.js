function drawAutumnSky(ctx, plane) {
    ctx.fillStyle = '#f3e5c6';
    ctx.fillRect(plane.x, plane.y, plane.width, plane.height);
}

window.drawAutumnSky = drawAutumnSky;
