// ========================================
// Board — 40×40 grid data & coordinate helpers
// ========================================
Game.Board = {
    grid: null,

    init() {
        const S = Game.CONFIG.BOARD_SIZE;
        this.grid = [];
        for (let r = 0; r < S; r++) {
            this.grid[r] = [];
            for (let c = 0; c < S; c++) {
                this.grid[r][c] = {
                    type: 'empty',
                    objectId: null,
                    dark: (r + c) % 2 === 0,
                    room: null,   // 'hall','kitchen','toilet','bedroom'
                };
            }
        }
    },

    rowLabel(r) {
        if (r < 26) return String.fromCharCode(65 + r);
        return 'A' + String.fromCharCode(65 + (r - 26));
    },
    colLabel(c) { return String(c + 1); },
    coordLabel(r, c) { return this.rowLabel(r) + '-' + this.colLabel(c); },

    inBounds(r, c) { return r >= 0 && r < Game.CONFIG.BOARD_SIZE && c >= 0 && c < Game.CONFIG.BOARD_SIZE; },
    walkable(r, c) {
        if (!this.inBounds(r, c)) return false;
        const t = this.grid[r][c].type;
        return t === 'empty' || t === 'house';
    },
    blocker(r, c) {
        if (!this.inBounds(r, c)) return false;
        return this.grid[r][c].type !== 'empty';
    },
    empty(r, c) { return this.inBounds(r, c) && this.grid[r][c].type === 'empty'; },
    setCell(r, c, type, id, room) {
        if (!this.inBounds(r, c)) return;
        this.grid[r][c].type = type;
        this.grid[r][c].objectId = id;
        this.grid[r][c].room = room || null;
    },
};
