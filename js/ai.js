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

            let score = 0;
            // House = top priority cover
            if (Game.Board.grid[nr][nc].type === 'house') score += 100;
            // Nearby cover
            score += this.coverScore(nr,nc);
            // Token on tile = bonus
            const tok = Game.Tokens.at(nr, nc);
            if (tok) score += (tok.type === 'gun' ? 60 : 40);
            // Center preference
            const S = Game.CONFIG.BOARD_SIZE;
            score -= (Math.abs(nr-S/2)+Math.abs(nc-S/2))*0.08;
            score += Math.random()*6;
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
