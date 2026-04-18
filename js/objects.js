// ========================================
// Objects — houses (with rooms), trees, rocks, poles, tokens
// ========================================
Game.Objects = {
    list: [],

    init() {
        this.list = [];
        const C = Game.CONFIG;
        for (let i = 0; i < C.NUM_HOUSES; i++) this.placeHouse();
        for (let i = 0; i < C.NUM_TREES; i++)  this.placeSingle('tree');
        for (let i = 0; i < C.NUM_ROCKS; i++)  this.placeSingle('rock');
        for (let i = 0; i < C.NUM_POLES; i++)  this.placeSingle('pole');
    },

    placeHouse() {
        const S = Game.CONFIG.BOARD_SIZE;
        const template = pick(Game.CONFIG.HOUSE_TEMPLATES);

        for (let a = 0; a < 250; a++) {
            const r = 1 + Math.floor(Math.random() * (S - 6));
            const c = 1 + Math.floor(Math.random() * (S - 6));

            let ok = true;
            // Check all template tiles + 1-tile margin
            const expanded = new Set();
            template.forEach(([dr, dc]) => {
                for (let mr = -1; mr <= 1; mr++)
                    for (let mc = -1; mc <= 1; mc++)
                        expanded.add(`${r+dr+mr},${c+dc+mc}`);
            });
            for (const key of expanded) {
                const [rr, cc] = key.split(',').map(Number);
                if (Game.Board.inBounds(rr, cc) && !Game.Board.empty(rr, cc)) { ok = false; break; }
            }
            if (!ok) continue;

            const id = this.list.length;
            // Copy tiles with room data: [[dr, dc, room], ...]
            const tiles = template.map(([dr, dc, room]) => [dr, dc, room]);
            this.list.push({
                id, type: 'house', row: r, col: c,
                tiles,
                color: pick(Game.CONFIG.HOUSE_COLORS),
                roofColor: pick(Game.CONFIG.ROOF_COLORS),
            });
            tiles.forEach(([dr, dc, room]) => Game.Board.setCell(r+dr, c+dc, 'house', id, room));
            return;
        }
    },

    placeSingle(type) {
        const S = Game.CONFIG.BOARD_SIZE;
        for (let a = 0; a < 100; a++) {
            const r = Math.floor(Math.random() * S);
            const c = Math.floor(Math.random() * S);
            if (!Game.Board.empty(r, c)) continue;
            const id = this.list.length;
            const obj = { id, type, row: r, col: c };
            if (type === 'tree') {
                obj.treeType = Math.floor(Math.random()*4);
                obj.scale = 0.7 + Math.random()*0.6;
                obj.color = pick(Game.CONFIG.TREE_COLORS);
                obj.trunkColor = pick(Game.CONFIG.TRUNK_COLORS);
            } else if (type === 'rock') {
                obj.rockType = Math.floor(Math.random()*3);
                obj.scale = 0.5 + Math.random()*0.5;
                obj.color = pick(Game.CONFIG.ROCK_COLORS);
            } else {
                obj.color = pick(Game.CONFIG.POLE_COLORS);
            }
            this.list.push(obj);
            Game.Board.setCell(r, c, type, id);
            return;
        }
    },
};

// ========================================
// Tokens — extra-life & gun pickups
// ========================================
Game.Tokens = {
    list: [],
    init() {
        this.list = [];
        for (let i = 0; i < Game.CONFIG.NUM_LIFE_TOKENS; i++) this.place('life');
        for (let i = 0; i < Game.CONFIG.NUM_GUN_TOKENS; i++)  this.place('gun');
    },
    place(type) {
        const S = Game.CONFIG.BOARD_SIZE;
        for (let a = 0; a < 100; a++) {
            const r = Math.floor(Math.random()*S), c = Math.floor(Math.random()*S);
            if (Game.Board.empty(r,c) && !this.at(r,c)) {
                this.list.push({ id:this.list.length, type, row:r, col:c, active:true });
                return;
            }
        }
    },
    at(r,c) { return this.list.find(t=>t.active&&t.row===r&&t.col===c)||null; },
    pickup(id) { this.list[id].active = false; },
};
