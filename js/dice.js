// ========================================
// Dice — 2-dice roll, animation, canvas drawing
// ========================================
Game.Dice = {
    value: 0,
    d1: 0, d2: 0,
    rolling: false,
    frame: 0, duration: 18,
    disp1: 1, disp2: 1,
    cb: null,

    roll(callback) {
        this.rolling = true;
        this.frame = 0;
        this.cb = callback;
        this.d1 = 1 + Math.floor(Math.random() * 6);
        this.d2 = 1 + Math.floor(Math.random() * 6);
        this.value = this.d1 + this.d2;
    },

    update() {
        if (!this.rolling) return;
        this.frame++;
        this.disp1 = 1 + Math.floor(Math.random() * 6);
        this.disp2 = 1 + Math.floor(Math.random() * 6);
        if (this.frame >= this.duration) {
            this.rolling = false;
            this.disp1 = this.d1;
            this.disp2 = this.d2;
            if (this.cb) this.cb(this.value);
        }
    },

    drawOne(ctx, x, y, sz, val) {
        const r = 6;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x+2, y+2, sz, sz);
        ctx.fillStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(x+r,y);
        ctx.arcTo(x+sz,y,x+sz,y+sz,r);
        ctx.arcTo(x+sz,y+sz,x,y+sz,r);
        ctx.arcTo(x,y+sz,x,y,r);
        ctx.arcTo(x,y,x+sz,y,r);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle='#999'; ctx.lineWidth=1.5; ctx.stroke();

        const dr = sz*0.06;
        const cx=x+sz/2, cy=y+sz/2, off=sz*0.24;
        const dots = {
            1:[[cx,cy]], 2:[[cx-off,cy-off],[cx+off,cy+off]],
            3:[[cx-off,cy-off],[cx,cy],[cx+off,cy+off]],
            4:[[cx-off,cy-off],[cx+off,cy-off],[cx-off,cy+off],[cx+off,cy+off]],
            5:[[cx-off,cy-off],[cx+off,cy-off],[cx,cy],[cx-off,cy+off],[cx+off,cy+off]],
            6:[[cx-off,cy-off],[cx+off,cy-off],[cx-off,cy],[cx+off,cy],[cx-off,cy+off],[cx+off,cy+off]],
        };
        ctx.fillStyle='#1a1a2e';
        (dots[val]||[]).forEach(([dx,dy])=>{
            ctx.beginPath(); ctx.arc(dx,dy,dr,0,Math.PI*2); ctx.fill();
        });
    },

    draw(ctx, x, y, sz) {
        const gap = 6;
        this.drawOne(ctx, x, y, sz, this.rolling ? this.disp1 : this.d1);
        this.drawOne(ctx, x+sz+gap, y, sz, this.rolling ? this.disp2 : this.d2);
    },
};
