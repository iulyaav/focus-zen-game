function createWelcomeScreen({ durationMs = 1200 } = {}) {
    return {
        durationMs,
        startTime: null,
        opacity: 1,
        active: true,
        fading: false,
        startFade() {
            if (!this.active) return;
            this.startTime = null;
            this.fading = true;
        },
        update(timestamp) {
            if (!this.active || !this.fading) return;
            if (this.startTime === null) this.startTime = timestamp;

            const elapsed = timestamp - this.startTime;
            const progress = Math.min(elapsed / this.durationMs, 1);
            this.opacity = 1 - progress;

            if (progress >= 1) {
                this.active = false;
                this.opacity = 0;
                this.fading = false;
            }
        },
        draw(ctx, width, height) {
            if (!this.active) return;
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#222222';
            ctx.font = '24px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Press SPACE to start', width / 2, height / 2);
            ctx.restore();
        },
    };
}

window.createWelcomeScreen = createWelcomeScreen;
