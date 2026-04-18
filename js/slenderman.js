// ========================================
// Slenderman — spawn (targets campers), LOS scan, HP
// ========================================
Game.Slenderman = {
    row:-1, col:-1, active:false, hp:5,
    scanLines:[], hitList:[], _lastHitPlayers:[],

    init(){ this.hp = Game.CONFIG.SLENDER_HP; this.active = false; },

    spawn() {
        const S = Game.CONFIG.BOARD_SIZE;

        // 1) Target players who are camping OR visiting the same exact tile 3+ times
        const targetCampers = Game.PlayerManager.alivePlayers().filter(p => {
            const key = `${p.row},${p.col}`;
            if (p.turnsInHouse >= Game.CONFIG.CAMP_THRESHOLD) return true;
            if (p.visitCounts[key] >= 3) return true;
            return false;
        });

        if (targetCampers.length > 0) {
            // Spawn exactly on this player
            const target = pick(targetCampers);
            this.row = target.row;
            this.col = target.col;
            this.active = true;
            return;
        }

        // 2) Regular spawn (empty or house tiles)
        for (let a = 0; a < 400; a++) {
            const r = Math.floor(Math.random()*S), c = Math.floor(Math.random()*S);
            const cell = Game.Board.grid[r][c];
            const ok = cell.type === 'empty' || cell.type === 'house';
            if (ok && !Game.PlayerManager.at(r,c)) {
                this.row=r; this.col=c; this.active=true;
                return;
            }
        }
    },

    move() {
        if (!this.active) return;
        const speed = Game.CONFIG.SLENDER_MOVE_SPEED || 2;
        for (let i = 0; i < speed; i++) {
            // Target nearest player NOT in a house (or any camper)
            let target = null, minDist = Infinity;
            Game.PlayerManager.alivePlayers().forEach(p => {
                const d = Math.abs(p.row - this.row) + Math.abs(p.col - this.col);
                if (d < minDist) {
                    minDist = d;
                    target = p;
                }
            });

            if (!target) break;

            const dr = target.row > this.row ? 1 : (target.row < this.row ? -1 : 0);
            const dc = target.col > this.col ? 1 : (target.col < this.col ? -1 : 0);

            // Move one step (Slenderman ghosts through trees but respects board bounds)
            const nr = this.row + dr, nc = this.col + dc;
            if (Game.Board.inBounds(nr, nc)) {
                this.row = nr;
                this.col = nc;
            }
        }
    },


    isInHouse() { return Game.Board.grid[this.row]?.[this.col]?.type === 'house'; },

    scan() {
        this.hitList = [];
        this.scanLines = [];

        // Check exact spot first (in case Slenderman spawned exactly on a player)
        const pExact = Game.PlayerManager.at(this.row, this.col);
        if (pExact) this.hitList.push(pExact);

        // Same-house auto-hit
        const cell = Game.Board.grid[this.row]?.[this.col];
        if (cell && cell.type === 'house' && cell.objectId !== null) {
            const house = Game.Objects.list[cell.objectId];
            house.tiles.forEach(([dr,dc,...rest]) => {
                const p = Game.PlayerManager.at(house.row+dr, house.col+dc);
                if (p && !this.hitList.includes(p)) this.hitList.push(p);
            });
        }

        // 8-direction LOS
        const dirs=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
        for (const [dr,dc] of dirs) {
            let r=this.row+dr, c=this.col+dc, er=this.row, ec=this.col;
            while (Game.Board.inBounds(r,c)) {
                er=r; ec=c;
                if (Game.Board.blocker(r,c)) break;
                const p = Game.PlayerManager.at(r,c);
                if (p && !p.isInHouse && !this.hitList.includes(p))
                    this.hitList.push(p);
                r+=dr; c+=dc;
            }
            this.scanLines.push({fr:this.row,fc:this.col,tr:er,tc:ec,progress:0});
        }
        this._lastHitPlayers = [...this.hitList];
        return this.hitList;
    },

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    },

    deactivate() { this.active=false; this.scanLines=[]; this.hitList=[]; },
};
