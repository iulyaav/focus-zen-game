function drawWinterSky(ctx, plane) {
    ctx.fillStyle = '#cadbe0';
    ctx.fillRect(plane.x, plane.y, plane.width, plane.height);
}

window.drawWinterSky = drawWinterSky;
