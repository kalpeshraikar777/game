// ========================================
// Player manager — HP, inventory, camping
// ========================================
Game.Players = [];

Game.PlayerManager = {
    init(humanCount) {
        Game.Players = [];
        const C = Game.CONFIG, S = C.BOARD_SIZE;
        const starts = [
            {r:2,c:2},{r:2,c:S-3},{r:S-3,c:2},{r:S-3,c:S-3},
            {r:2,c:Math.floor(S/2)},{r:S-3,c:Math.floor(S/2)},
        ];
        for (let i = 0; i < C.MAX_PLAYERS; i++) {
            const pos = this.nearestEmpty(starts[i].r, starts[i].c);
            Game.Players.push({
                id: i,
                name: C.PLAYER_NAMES[i],
                color: C.PLAYER_COLORS[i],
                row: pos.r, col: pos.c,
                isAlive: true,
                isHuman: i < humanCount,
                isInHouse: false,
                movesLeft: 0,
                hp: C.PLAYER_HP,
                maxHp: C.PLAYER_HP,
                extraLives: 0,
                guns: 0,
                turnsInHouse: 0,
                currentHouseId: null,
                visitCounts: {},   // "r,c" → count of turns ended on that tile
            });
        }
    },

    nearestEmpty(r, c) {
        if (Game.Board.empty(r,c)) return {r,c};
        for (let d=1;d<15;d++)
            for (let dr=-d;dr<=d;dr++)
                for (let dc=-d;dc<=d;dc++)
                    if ((Math.abs(dr)===d||Math.abs(dc)===d) && Game.Board.walkable(r+dr,c+dc))
                        return {r:r+dr,c:c+dc};
        return {r,c};
    },

    move(id, dr, dc) {
        const p = Game.Players[id];
        const nr = p.row+dr, nc = p.col+dc;
        if (!Game.Board.walkable(nr,nc)) return false;
        if (this.at(nr,nc)) return false;
        p.row = nr; p.col = nc;
        const cell = Game.Board.grid[nr][nc];
        p.isInHouse = cell.type === 'house';
        p.movesLeft--;

        // Auto-pickup token
        const tok = Game.Tokens.at(nr, nc);
        if (tok) {
            Game.Tokens.pickup(tok.id);
            if (tok.type === 'life') p.extraLives++;
            else if (tok.type === 'gun') p.guns++;
            Game.Main.log(`${p.name} picked up ${tok.type==='life'?'🛡️ Extra Life':'🔫 Gun'}!`);
        }
        return true;
    },

    /** Call at end of each player's turn to track camping */
    updateCamping(p) {
        if (p.isInHouse) {
            const cell = Game.Board.grid[p.row][p.col];
            if (cell.objectId === p.currentHouseId) {
                p.turnsInHouse++;
            } else {
                p.turnsInHouse = 1;
                p.currentHouseId = cell.objectId;
            }
        } else {
            p.turnsInHouse = 0;
            p.currentHouseId = null;
        }
    },

    at(r,c) { return Game.Players.find(p => p.isAlive && p.row===r && p.col===c) || null; },
    aliveCount() { return Game.Players.filter(p => p.isAlive).length; },
    alivePlayers() { return Game.Players.filter(p => p.isAlive); },
    eliminate(id) { Game.Players[id].isAlive = false; Game.Players[id].hp = 0; },

    getHouseOf(r, c) {
        const cell = Game.Board.grid[r]?.[c];
        if (cell && cell.type === 'house' && cell.objectId !== null)
            return Game.Objects.list[cell.objectId];
        return null;
    },

    /** Players camping too long in a house */
    getCampers() {
        return this.alivePlayers().filter(
            p => p.turnsInHouse >= Game.CONFIG.CAMP_THRESHOLD && p.currentHouseId !== null
        );
    },
};
