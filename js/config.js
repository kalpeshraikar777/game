// ========================================
// Slenderman Board Game — Configuration (v3)
// ========================================
window.Game = window.Game || {};

Game.CONFIG = {
    BOARD_SIZE: 40,
    TILE_WIDTH: 48,
    TILE_HEIGHT: 24,

    TILE_LIGHT: '#2a5e2a',
    TILE_DARK: '#1c4220',
    TILE_BORDER: 'rgba(0,0,0,0.25)',
    GRID_LABEL_COLOR: '#8fbc8f',
    BG_TOP: '#050d05',
    BG_BOT: '#0a1a0a',

    PLAYER_COLORS: ['#ff4757','#3742fa','#ffa502','#a855f7','#2ed573','#ff6b81'],
    PLAYER_NAMES: ['Crimson','Azure','Amber','Violet','Emerald','Rose'],
    MAX_PLAYERS: 6,
    PLAYER_HP: 2,

    NUM_DICE: 2,
    DICE_SIDES: 6,

    // Objects
    NUM_HOUSES: 8,      // fewer but bigger
    NUM_TREES: 85,
    NUM_ROCKS: 40,
    NUM_POLES: 22,

    // Tokens
    NUM_LIFE_TOKENS: 12,
    NUM_GUN_TOKENS: 8,

    // Camping mechanic
    CAMP_THRESHOLD: 3,       // rounds in same house → danger
    CAMP_SPAWN_CHANCE: 0.6,  // chance Slenderman spawns in camper's house

    // House templates — [dr, dc, roomType]
    // Every house has: hall, kitchen, toilet, bedroom
    HOUSE_TEMPLATES: [
        // 3×3 square (9 tiles)
        [[0,0,'hall'],[0,1,'hall'],[0,2,'kitchen'],
         [1,0,'hall'],[1,1,'hall'],[1,2,'kitchen'],
         [2,0,'bedroom'],[2,1,'bedroom'],[2,2,'toilet']],

        // 4×3 tall (12 tiles)
        [[0,0,'hall'],[0,1,'hall'],[0,2,'kitchen'],
         [1,0,'hall'],[1,1,'hall'],[1,2,'kitchen'],
         [2,0,'bedroom'],[2,1,'bedroom'],[2,2,'toilet'],
         [3,0,'bedroom'],[3,1,'hall'],[3,2,'hall']],

        // 3×4 wide (12 tiles)
        [[0,0,'hall'],[0,1,'hall'],[0,2,'kitchen'],[0,3,'kitchen'],
         [1,0,'hall'],[1,1,'hall'],[1,2,'bedroom'],[1,3,'bedroom'],
         [2,0,'hall'],[2,1,'hall'],[2,2,'toilet'],[2,3,'bedroom']],

        // L-shape (8 tiles)
        [[0,0,'hall'],[0,1,'hall'],
         [1,0,'hall'],[1,1,'kitchen'],
         [2,0,'bedroom'],[2,1,'kitchen'],
         [3,0,'bedroom'],[3,1,'toilet']],

        // T-shape (8 tiles)
        [[0,0,'kitchen'],[0,1,'hall'],[0,2,'hall'],[0,3,'bedroom'],
         [1,1,'hall'],[1,2,'hall'],
         [2,1,'toilet'],[2,2,'bedroom']],

        // Wide-L (9 tiles)
        [[0,0,'hall'],[0,1,'hall'],[0,2,'hall'],
         [1,0,'kitchen'],[1,1,'kitchen'],[1,2,'hall'],
         [2,0,'toilet'],[2,1,'bedroom'],[2,2,'bedroom']],

        // Narrow 2×4 (8 tiles)
        [[0,0,'hall'],[0,1,'kitchen'],
         [1,0,'hall'],[1,1,'kitchen'],
         [2,0,'hall'],[2,1,'toilet'],
         [3,0,'bedroom'],[3,1,'bedroom']],

        // Big 4×4 (16 tiles)
        [[0,0,'hall'],[0,1,'hall'],[0,2,'kitchen'],[0,3,'kitchen'],
         [1,0,'hall'],[1,1,'hall'],[1,2,'kitchen'],[1,3,'kitchen'],
         [2,0,'bedroom'],[2,1,'bedroom'],[2,2,'toilet'],[2,3,'toilet'],
         [3,0,'bedroom'],[3,1,'bedroom'],[3,2,'hall'],[3,3,'hall']],
    ],

    // Room rendering
    ROOM_FLOOR: {
        hall:    '#5a4028',
        kitchen: '#6a4a20',
        toilet:  '#3a3a48',
        bedroom: '#4a3830',
    },
    ROOM_ICON_COLORS: {
        hall:    '#7a6040',
        kitchen: '#cc7722',
        toilet:  '#5577aa',
        bedroom: '#554038',
    },

    HOUSE_COLORS: ['#6b4423','#5c3a1e','#7a5230','#4d3018','#8b6340','#5a4028','#704830'],
    ROOF_COLORS:  ['#2a1a0a','#1f1508','#332211','#281808'],
    TREE_COLORS:  ['#1a4d1a','#1e5622','#15401a','#224d22','#194718'],
    TRUNK_COLORS: ['#3d2817','#4a3020','#352010','#2d1a0e'],
    ROCK_COLORS:  ['#444','#555','#3a3a3a','#4d4d4d','#333'],
    POLE_COLORS:  ['#4a3828','#3d2e1e','#544030','#463422'],

    SLENDER_COLOR: '#0f0f1a',
    SLENDER_GLOW: '#ff0040',
    SLENDER_HP: 5,

    AI_DELAY: 600,
    AI_STEP_DELAY: 220,
    SLENDER_APPEAR_DELAY: 2000,
    SCAN_RESULT_DELAY: 1200,
};

function shadeColor(hex,pct){
    const n=parseInt(hex.replace('#',''),16),a=Math.round(2.55*pct);
    const R=Math.max(0,Math.min(255,(n>>16)+a));
    const G=Math.max(0,Math.min(255,((n>>8)&0xff)+a));
    const B=Math.max(0,Math.min(255,(n&0xff)+a));
    return '#'+(0x1000000+R*0x10000+G*0x100+B).toString(16).slice(1);
}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
