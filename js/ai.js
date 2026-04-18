// ========================================
// AI — movement heuristic + token seeking
// ========================================
Game.AI = {
    bestDir(player) {
        const dirs = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];
        let best = null, bestScore = -Infinity;
        for (const d of dirs) {
            const nr = player.row+d.dr, nc = player.col+d.dc;
            if (!Game.Board.walkable(nr,nc)) continue;
            if (Game.PlayerManager.at(nr,nc)) continue;

            const oldCell = Game.Board.grid[player.row][player.col];
            const newCell = Game.Board.grid[nr][nc];
            // AI door enforcement
            if (oldCell.type !== newCell.type && !oldCell.isDoor && !newCell.isDoor) continue;

            let score = 0;
            // Cover/House preference
            if (newCell.type === 'house') score += 100;
            score += this.coverScore(nr,nc);

            // Token seeking
            const tok = Game.Tokens.at(nr, nc);
            if (tok) score += (tok.type === 'gun' ? 80 : 60);

            // Slenderman avoidance
            if (Game.Slenderman && Game.Slenderman.active) {
                const dist = Math.abs(nr - Game.Slenderman.row) + Math.abs(nc - Game.Slenderman.col);
                if (dist < 4) score -= (400 / (dist + 0.1)); // Heavy penalty for being close
                else score += dist * 2; // Prefer distance
            }

            // Center penalty (to encourage moving out)
            const S = Game.CONFIG.BOARD_SIZE;
            score -= (Math.abs(nr-S/2)+Math.abs(nc-S/2))*0.05;

            // Random variation
            score += Math.random()*10;

            if (score > bestScore) { bestScore = score; best = d; }
        }
        return best || dirs[Math.floor(Math.random()*dirs.length)];
    },


    coverScore(r,c) {
        let n = 0;
        for (let dr=-3;dr<=3;dr++)
            for (let dc=-3;dc<=3;dc++) {
                const rr=r+dr, cc=c+dc;
                if (Game.Board.inBounds(rr,cc) && Game.Board.blocker(rr,cc)) n++;
            }
        return n;
    },
};
