// ========================================
// Resident Evil Requiem (RE9) — Configuration
// ========================================
window.Game = window.Game || {};

Game.CONFIG = {
    BOARD_SIZE: 40,
    TILE_WIDTH: 48,
    TILE_HEIGHT: 24,

    TILE_LIGHT: '#1a1a1a',
    TILE_DARK: '#0f0f0f',
    TILE_BORDER: 'rgba(255,0,0,0.15)',
    GRID_LABEL_COLOR: '#ff4d4d',
    BG_TOP: '#050505',
    BG_BOT: '#1a0505',

    PLAYER_COLORS: ['#ff0033','#3366ff','#ffaa00','#aa00ff','#00cc44','#ff3399'],
    PLAYER_NAMES: ['Leon','Chris','Jill','Claire','Wesker','Ada'],
    MAX_PLAYERS: 6,
    PLAYER_HP: 2,

    NUM_DICE: 2,
    DICE_SIDES: 6,

    // Mods
    INFINITE_HP: false,      // Will be set by UI
    INFINITE_AMMO: false,    // Will be set by UI

    // Objects
    NUM_HOUSES: 8,      
    NUM_TREES: 85,
    NUM_ROCKS: 40,
    NUM_POLES: 22,

    // Tokens
    NUM_LIFE_TOKENS: 12,
    NUM_GUN_TOKENS: 8,

    // Camping mechanic
    CAMP_THRESHOLD: 3,       
    CAMP_SPAWN_CHANCE: 0.6,  

    // House templates
    HOUSE_TEMPLATES: [
        [[0,0,'hall',true],[0,1,'hall'],[0,2,'kitchen'],
         [1,0,'hall'],[1,1,'hall'],[1,2,'kitchen'],
         [2,0,'bedroom'],[2,1,'bedroom'],[2,2,'toilet']],

        [[0,0,'hall',true],[0,1,'hall'],[0,2,'kitchen'],
         [1,0,'hall'],[1,1,'hall'],[1,2,'kitchen'],
         [2,0,'bedroom'],[2,1,'bedroom'],[2,2,'toilet'],
         [3,0,'bedroom'],[3,1,'hall'],[3,2,'hall']],

        [[0,0,'hall',true],[0,1,'hall'],[0,2,'kitchen'],[0,3,'kitchen'],
         [1,0,'hall'],[1,1,'hall'],[1,2,'bedroom'],[1,3,'bedroom'],
         [2,0,'hall'],[2,1,'hall'],[2,2,'toilet'],[2,3,'bedroom']],

        [[0,0,'hall',true],[0,1,'hall'],
         [1,0,'hall'],[1,1,'kitchen'],
         [2,0,'bedroom'],[2,1,'kitchen'],
         [3,0,'bedroom'],[3,1,'toilet']],

        [[0,0,'kitchen',true],[0,1,'hall',false],[0,2,'hall',false],[0,3,'bedroom',false],
         [1,1,'hall',false],[1,2,'hall',false],
         [2,1,'toilet',false],[2,2,'bedroom',false]],

        [[0,0,'hall',true],[0,1,'hall'],[0,2,'hall'],
         [1,0,'kitchen'],[1,1,'kitchen'],[1,2,'hall'],
         [2,0,'toilet'],[2,1,'bedroom'],[2,2,'bedroom']],

        [[0,0,'hall',true],[0,1,'kitchen'],
         [1,0,'hall'],[1,1,'kitchen'],
         [2,0,'hall'],[2,1,'toilet'],
         [3,0,'bedroom'],[3,1,'bedroom']],

        [[0,0,'hall',true],[0,1,'hall'],[0,2,'kitchen'],[0,3,'kitchen'],
         [1,0,'hall'],[1,1,'hall'],[1,2,'kitchen'],[1,3,'kitchen'],
         [2,0,'bedroom'],[2,1,'bedroom'],[2,2,'toilet'],[2,3,'toilet'],
         [3,0,'bedroom'],[3,1,'bedroom'],[3,2,'hall'],[3,3,'hall']],
    ],

    SLENDER_MOVE_SPEED: 2,   

    // Room rendering
    ROOM_FLOOR: {
        hall:    '#222',
        kitchen: '#333',
        toilet:  '#1a1a2a',
        bedroom: '#2a1a1a',
    },
    ROOM_ICON_COLORS: {
        hall:    '#444',
        kitchen: '#994422',
        toilet:  '#4466aa',
        bedroom: '#663333',
    },

    HOUSE_COLORS: ['#222','#1a1a1a','#333','#111','#2a2a2a','#151515','#252525'],
    ROOF_COLORS:  ['#300','#200','#400','#100'],
    TREE_COLORS:  ['#111','#0a0a0a','#151515','#050505','#0d0d0d'],
    TRUNK_COLORS: ['#222','#1a1a1a','#2a2a2a','#111'],
    ROCK_COLORS:  ['#333','#444','#222','#3a3a3a','#2a2a2a'],
    POLE_COLORS:  ['#333','#222','#444','#111'],

    SLENDER_COLOR: '#000',
    SLENDER_GLOW: '#ff0000',
    SLENDER_HP: 10,

    AI_DELAY: 500,
    AI_STEP_DELAY: 150,
    SLENDER_APPEAR_DELAY: 2500,
    SCAN_RESULT_DELAY: 1500,
};

function shadeColor(hex,pct){
    const n=parseInt(hex.replace('#',''),16),a=Math.round(2.55*pct);
    const R=Math.max(0,Math.min(255,(n>>16)+a));
    const G=Math.max(0,Math.min(255,((n>>8)&0xff)+a));
    const B=Math.max(0,Math.min(255,(n&0xff)+a));
    return '#'+(0x1000000+R*0x10000+G*0x100+B).toString(16).slice(1);
}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
