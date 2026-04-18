// ========================================
// Slenderman — spawn (targets campers), LOS scan, HP
// ========================================
Game.Slenderman = {
    row:-1, col:-1, active:false, hp:5,
    scanLines:[], hitList:[],

    init(){ this.hp = Game.CONFIG.SLENDER_HP; this.active = false; },

    spawn() {
        const S = Game.CONFIG.BOARD_SIZE;

        // 1) Check for campers — high chance to spawn in their house
        const campers = Game.PlayerManager.getCampers();
        if (campers.length > 0 && Math.random() < Game.CONFIG.CAMP_SPAWN_CHANCE) {
            const camper = pick(campers);
            const house = Game.Objects.list[camper.currentHouseId];
            if (house) {
                const avail = house.tiles.filter(([dr,dc]) => {
                    const r=house.row+dr, c=house.col+dc;
                    return !Game.PlayerManager.at(r,c);
                });
                if (avail.length > 0) {
                    const [dr, dc] = pick(avail);
                    this.row = house.row+dr; this.col = house.col+dc;
                    this.active = true;
                    return;
                }
            }
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

    isInHouse() { return Game.Board.grid[this.row]?.[this.col]?.type === 'house'; },

    scan() {
        this.hitList = [];
        this.scanLines = [];

        // Same-house auto-hit
        const cell = Game.Board.grid[this.row][this.col];
        if (cell.type === 'house' && cell.objectId !== null) {
            const house = Game.Objects.list[cell.objectId];
            house.tiles.forEach(([dr,dc]) => {
                const p = Game.PlayerManager.at(house.row+dr, house.col+dc);
                if (p) this.hitList.push(p);
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
        return this.hitList;
    },

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    },

    deactivate() { this.active=false; this.scanLines=[]; this.hitList=[]; },
};
