function drawSpringSky(ctx, plane) {
    const palette = ['#9cd9f0', '#8ecae6', '#7bb6d6', '#6aa6c9'];
    const bandHeight = Math.max(1, Math.floor(plane.height / palette.length));

    for (let i = 0; i < palette.length; i++) {
        ctx.fillStyle = palette[i];
        const y = plane.y + i * bandHeight;
        const height = i === palette.length - 1
            ? plane.height - i * bandHeight
            : bandHeight;
        ctx.fillRect(plane.x, y, plane.width, height);
    }
}

window.drawSpringSky = drawSpringSky;
