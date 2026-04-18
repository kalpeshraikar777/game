// ========================================
// Camera — pan / zoom / smooth follow
// ========================================
Game.Camera = {
    x: 0, y: 0,
    zoom: 1,
    targetX: 0, targetY: 0, targetZoom: 1,
    minZoom: 0.25, maxZoom: 2.5,

    init() {
        const mid = Game.CONFIG.BOARD_SIZE / 2;
        const c = Game.Renderer.toScreen(mid, mid);
        this.x = this.targetX = c.x;
        this.y = this.targetY = c.y;
        this.zoom = this.targetZoom = 0.7;
    },

    update() {
        this.x += (this.targetX - this.x) * 0.1;
        this.y += (this.targetY - this.y) * 0.1;
        this.zoom += (this.targetZoom - this.zoom) * 0.1;
    },

    zoomBy(d) {
        this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom + d));
    },

    panTo(r, c) {
        const p = Game.Renderer.toScreen(r, c);
        this.targetX = p.x;
        this.targetY = p.y;
    },

    worldToScreen(wx, wy, canvas) {
        return {
            x: (wx - this.x) * this.zoom + canvas.width / 2,
            y: (wy - this.y) * this.zoom + canvas.height / 2,
        };
    },
};
