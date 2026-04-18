// ========================================
// Main — game loop, state machine, input, UI (v2)
// ========================================
Game.State = {
    phase: 'SETUP',
    // SETUP | PLAYER_ROLL | PLAYER_MOVE | AI_TURN |
    // SLENDERMAN_SPAWN | SLENDERMAN_SCAN | SHOOTING | EMERGENCY | GAME_OVER
    currentPlayer: 0,
    round: 1,
    log: [],
    humanCount: 1,
    validMoves: null,
    played: null,
    gameStarted: false,
};

Game.Main = {
    canvas: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        Game.Renderer.init(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.bindEvents();
        this.loop();
    },

    resize() {
        const box = document.getElementById('game-container');
        this.canvas.width = box.clientWidth;
        this.canvas.height = box.clientHeight;
    },

    /* ── start ── */
    start() {
        document.getElementById('setup-screen').classList.remove('active');
        Game.Board.init();
        Game.Objects.init();
        Game.Tokens.init();
        Game.PlayerManager.init(Game.State.humanCount);
        Game.Slenderman.init();
        Game.Camera.init();

        Game.State.phase = 'PLAYER_ROLL';
        Game.State.round = 1;
        Game.State.played = new Set();
        Game.State.gameStarted = true;
        Game.State.currentPlayer = Game.Players.findIndex(p => p.isAlive);

        this.log('🌲 Game started! Round 1');
        this.log(`${this.cp().name}'s turn — Roll the dice!`);
        Game.Camera.panTo(this.cp().row, this.cp().col);
        this.ui();

        if (!this.cp().isHuman) setTimeout(() => this.aiTurn(), Game.CONFIG.AI_DELAY);
    },

    cp() { return Game.Players[Game.State.currentPlayer]; },

    /* ── log ── */
    log(msg) {
        Game.State.log.unshift(msg);
        if (Game.State.log.length > 80) Game.State.log.pop();
        const el = document.getElementById('game-log');
        if (el) el.innerHTML = Game.State.log.map(m => `<div class="log-entry">${m}</div>`).join('');
    },

    /* ── events ── */
    bindEvents() {
        let drag = false, lx = 0, ly = 0;
        this.canvas.addEventListener('mousedown', e => { drag = true; lx = e.clientX; ly = e.clientY; });
        window.addEventListener('mousemove', e => {
            if (!drag) return;
            Game.Camera.targetX -= (e.clientX - lx) / Game.Camera.zoom;
            Game.Camera.targetY -= (e.clientY - ly) / Game.Camera.zoom;
            lx = e.clientX; ly = e.clientY;
        });
        window.addEventListener('mouseup', () => drag = false);
        this.canvas.addEventListener('wheel', e => { e.preventDefault(); Game.Camera.zoomBy(-e.deltaY * 0.001); }, { passive: false });

        document.addEventListener('keydown', e => {
            if (Game.State.phase !== 'PLAYER_MOVE' || !this.cp().isHuman) return;
            const map = { ArrowUp:[-1,0],w:[-1,0],W:[-1,0], ArrowDown:[1,0],s:[1,0],S:[1,0],
                          ArrowLeft:[0,-1],a:[0,-1],A:[0,-1], ArrowRight:[0,1],d:[0,1],D:[0,1] };
            const d = map[e.key];
            if (d) { e.preventDefault(); this.doMove(d[0], d[1]); }
        });

        document.getElementById('btn-start').addEventListener('click', () => this.start());
        document.getElementById('btn-roll').addEventListener('click', () => this.rollDice());
        document.getElementById('btn-up').addEventListener('click', () => this.doMove(-1, 0));
        document.getElementById('btn-down').addEventListener('click', () => this.doMove(1, 0));
        document.getElementById('btn-left').addEventListener('click', () => this.doMove(0, -1));
        document.getElementById('btn-right').addEventListener('click', () => this.doMove(0, 1));
        document.getElementById('btn-skip').addEventListener('click', () => this.skipMove());
        document.getElementById('btn-shoot').addEventListener('click', () => this.humanShoot());

        document.querySelectorAll('.player-count-btn').forEach(b => b.addEventListener('click', () => {
            Game.State.humanCount = +b.dataset.count;
            document.querySelectorAll('.player-count-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
        }));
    },

    /* ── dice ── */
    rollDice() {
        if (Game.State.phase !== 'PLAYER_ROLL') return;
        const p = this.cp();
        if (!p.isHuman) return;
        Game.Dice.roll(val => {
            p.movesLeft = val;
            Game.State.phase = 'PLAYER_MOVE';
            this.log(`${p.name} rolled ${Game.Dice.d1}+${Game.Dice.d2} = ${val}`);
            this.ui();
        });
    },

    /* ── movement ── */
    doMove(dr, dc) {
        if (Game.State.phase !== 'PLAYER_MOVE') return;
        const p = this.cp();
        if (!p.isHuman) return;
        if (Game.PlayerManager.move(p.id, dr, dc)) {
            Game.Camera.panTo(p.row, p.col);
            if (p.movesLeft <= 0) this.finishTurn(p);
            this.ui();
        }
    },

    skipMove() {
        if (Game.State.phase !== 'PLAYER_MOVE') return;
        const p = this.cp();
        if (!p.isHuman) return;
        p.movesLeft = 0;
        this.finishTurn(p);
    },

    finishTurn(p) {
        Game.PlayerManager.updateCamping(p);
        const coord = Game.Board.coordLabel(p.row, p.col);
        const extra = p.isInHouse ? ' (🏠 inside)' : '';
        this.log(`${p.name} → ${coord}${extra}`);
        Game.State.played.add(p.id);
        this.nextTurn();
    },

    /* ── turn flow ── */
    nextTurn() {
        let next = -1;
        for (let i = 1; i <= Game.CONFIG.MAX_PLAYERS; i++) {
            const idx = (Game.State.currentPlayer + i) % Game.CONFIG.MAX_PLAYERS;
            if (Game.Players[idx].isAlive && !Game.State.played.has(idx)) { next = idx; break; }
        }
        if (next === -1) { this.slendermanPhase(); return; }

        Game.State.currentPlayer = next;
        Game.State.phase = 'PLAYER_ROLL';
        const p = this.cp();
        this.log(`${p.name}'s turn — Roll the dice!`);
        Game.Camera.panTo(p.row, p.col);
        this.ui();
        if (!p.isHuman) setTimeout(() => this.aiTurn(), Game.CONFIG.AI_DELAY);
    },

    /* ── AI ── */
    aiTurn() {
        const p = this.cp();
        if (!p.isAlive || p.isHuman) return;
        Game.Dice.roll(val => {
            p.movesLeft = val;
            this.log(`${p.name} (AI) rolled ${Game.Dice.d1}+${Game.Dice.d2} = ${val}`);
            Game.State.phase = 'PLAYER_MOVE';
            this.aiStep(p);
        });
    },

    aiStep(p) {
        if (p.movesLeft <= 0) { this.finishTurn(p); return; }
        const d = Game.AI.bestDir(p);
        if (d && Game.PlayerManager.move(p.id, d.dr, d.dc)) {
            Game.Camera.panTo(p.row, p.col);
        } else { p.movesLeft--; }
        setTimeout(() => this.aiStep(p), Game.CONFIG.AI_STEP_DELAY);
    },

    /* ══════════════ SLENDERMAN PHASE ══════════════ */
    slendermanPhase() {
        Game.State.phase = 'SLENDERMAN_SPAWN';
        this.log('⚠️  SLENDERMAN APPEARS…');
        Game.Slenderman.spawn();
        Game.Camera.panTo(Game.Slenderman.row, Game.Slenderman.col);
        const inHouse = Game.Slenderman.isInHouse();
        this.log(`Slenderman spawns at ${Game.Board.coordLabel(Game.Slenderman.row, Game.Slenderman.col)}${inHouse ? ' (inside a house!)' : ''}!`);
        this.showAlert();
        this.ui();

        setTimeout(() => {
            Game.State.phase = 'SLENDERMAN_SCAN';
            const hitPlayers = Game.Slenderman.scan();
            this.animateScan(() => this.processDamage(hitPlayers));
        }, Game.CONFIG.SLENDER_APPEAR_DELAY);
    },

    processDamage(hitPlayers) {
        const emergencyQueue = [];

        hitPlayers.forEach(p => {
            p.hp--;
            if (p.hp <= 0) {
                if (p.extraLives > 0) {
                    p.extraLives--;
                    p.hp = 1;
                    emergencyQueue.push(p);
                    this.log(`🛡️ ${p.name} used Extra Life! Emergency escape!`);
                } else {
                    Game.PlayerManager.eliminate(p.id);
                    this.log(`💀 ${p.name} ELIMINATED by Slenderman!`);
                }
            } else {
                this.log(`💥 ${p.name} hit! HP: ${p.hp}/${p.maxHp}`);
            }
        });

        if (hitPlayers.length === 0) this.log('All players safe this round!');

        // Emergency escapes (auto-move for both human & AI — quick escape)
        if (emergencyQueue.length > 0) {
            this.processEmergencyEscapes(emergencyQueue, () => this.afterDamage());
        } else {
            this.afterDamage();
        }
    },

    processEmergencyEscapes(queue, callback) {
        if (queue.length === 0) { callback(); return; }
        const p = queue.shift();
        this.log(`🏃 ${p.name} emergency escape!`);
        Game.Camera.panTo(p.row, p.col);

        // Auto-roll emergency dice and auto-move toward safety
        const moves = 2 + Math.floor(Math.random() * 5); // 2-6 emergency moves
        let step = 0;
        const doStep = () => {
            if (step >= moves) {
                this.log(`${p.name} escaped to ${Game.Board.coordLabel(p.row, p.col)}`);
                this.processEmergencyEscapes(queue, callback);
                return;
            }
            const d = Game.AI.bestDir(p);
            if (d) Game.PlayerManager.move(p.id, d.dr, d.dc);
            Game.Camera.panTo(p.row, p.col);
            step++;
            setTimeout(doStep, 150);
        };
        setTimeout(doStep, 400);
    },

    afterDamage() {
        // Check if game over (1 or fewer alive)
        if (Game.PlayerManager.aliveCount() <= 1) {
            this.endGame();
            return;
        }

        // Shooting phase — any alive player with guns?
        const shooters = Game.PlayerManager.alivePlayers().filter(p => p.guns > 0);
        if (shooters.length > 0 && Game.Slenderman.hp > 0) {
            this.shootingPhase(shooters);
        } else {
            this.startNextRound();
        }
    },

    /* ══════════════ SHOOTING PHASE ══════════════ */
    shootingPhase(shooters) {
        Game.State.phase = 'SHOOTING';
        this.log('🔫 SHOOTING PHASE — Players fire at Slenderman!');
        this.ui();

        // Process all shooters sequentially
        this.processShooters([...shooters], () => {
            // Check if Slenderman defeated
            if (Game.Slenderman.hp <= 0) {
                this.log('🎉 SLENDERMAN DEFEATED! ALL PLAYERS WIN!');
                this.endGameAllWin();
                return;
            }
            this.log(`Slenderman HP: ${Game.Slenderman.hp}/${Game.CONFIG.SLENDER_HP}`);
            this.startNextRound();
        });
    },

    processShooters(queue, callback) {
        if (queue.length === 0) { callback(); return; }
        const p = queue.shift();

        if (p.isHuman) {
            // Show shoot button — wait for click or auto-skip after 8 seconds
            this._shootPlayer = p;
            this._shootCallback = () => {
                this._shootPlayer = null;
                this.processShooters(queue, callback);
            };
            this.ui();
            // Auto-skip timeout
            this._shootTimeout = setTimeout(() => {
                this.log(`${p.name} chose not to shoot.`);
                this._shootCallback();
            }, 8000);
        } else {
            // AI always shoots
            this.doShoot(p);
            setTimeout(() => this.processShooters(queue, callback), 500);
        }
    },

    humanShoot() {
        if (!this._shootPlayer) return;
        clearTimeout(this._shootTimeout);
        this.doShoot(this._shootPlayer);
        const cb = this._shootCallback;
        this._shootPlayer = null;
        this._shootCallback = null;
        setTimeout(cb, 500);
    },

    doShoot(p) {
        if (p.guns <= 0) return;
        p.guns--;
        const killed = Game.Slenderman.takeDamage(1);
        this.log(`🔫 ${p.name} shoots Slenderman! (HP: ${Game.Slenderman.hp}/${Game.CONFIG.SLENDER_HP})`);
        if (killed) this.log('💥 CRITICAL HIT — Slenderman collapses!');
    },

    /* ── game end ── */
    endGame() {
        Game.State.phase = 'GAME_OVER';
        const w = Game.PlayerManager.alivePlayers()[0];
        this.log(w ? `🏆 ${w.name} WINS!` : 'No survivors!');
        this.showVictory(w ? `<span style="color:${w.color}">${w.name}</span> WINS!` : 'NO SURVIVORS!');
        this.ui();
    },

    endGameAllWin() {
        Game.State.phase = 'GAME_OVER';
        const alive = Game.PlayerManager.alivePlayers();
        const names = alive.map(p => `<span style="color:${p.color}">${p.name}</span>`).join(', ');
        this.showVictory(`SLENDERMAN DEFEATED!<br><span style="font-size:1.4rem">${names} — ALL WIN! 🎉</span>`);
        this.ui();
    },

    startNextRound() {
        Game.Slenderman.deactivate();
        Game.State.round++;
        Game.State.played = new Set();
        this.log(`─── Round ${Game.State.round} ───`);
        const first = Game.Players.find(p => p.isAlive);
        Game.State.currentPlayer = first.id;
        Game.State.phase = 'PLAYER_ROLL';
        this.log(`${first.name}'s turn — Roll the dice!`);
        Game.Camera.panTo(first.row, first.col);
        this.ui();
        if (!first.isHuman) setTimeout(() => this.aiTurn(), Game.CONFIG.AI_DELAY);
    },

    /* ── animations ── */
    animateScan(cb) {
        let t = 0;
        const step = () => {
            t += 0.035;
            Game.Slenderman.scanLines.forEach(sl => sl.progress = Math.min(1, t));
            if (t < 1) requestAnimationFrame(step);
            else setTimeout(cb, Game.CONFIG.SCAN_RESULT_DELAY);
        };
        step();
    },

    showAlert() {
        const el = document.getElementById('slender-alert');
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 1800);
    },

    showVictory(html) {
        const el = document.getElementById('victory-screen');
        el.querySelector('.victory-text').innerHTML = html;
        el.classList.add('active');
    },

    /* ── UI update ── */
    ui() {
        Game.Players.forEach((p, i) => {
            const card = document.getElementById(`player-card-${i}`);
            if (!card) return;
            card.className = 'player-card'
                + (p.isAlive ? '' : ' eliminated')
                + (Game.State.currentPlayer === i && Game.State.phase !== 'GAME_OVER' ? ' active' : '');
            card.querySelector('.player-status').textContent =
                p.isAlive ? (p.isInHouse ? '🏠 Safe' : '🏃 Active') : '💀 Dead';
            card.querySelector('.player-pos').textContent =
                p.isAlive ? Game.Board.coordLabel(p.row, p.col) : '---';
            card.querySelector('.player-type').textContent = p.isHuman ? '👤' : '🤖';
            card.querySelector('.player-hp').innerHTML =
                '<span class="hp-heart">❤️</span>'.repeat(p.hp) +
                '<span class="hp-heart empty">🖤</span>'.repeat(Math.max(0, p.maxHp - p.hp));
            const items = [];
            if (p.guns > 0) items.push(`🔫×${p.guns}`);
            if (p.extraLives > 0) items.push(`🛡️×${p.extraLives}`);
            card.querySelector('.player-items').textContent = items.join(' ');
        });

        // Dice / Roll button
        const rb = document.getElementById('btn-roll');
        const canRoll = Game.State.phase === 'PLAYER_ROLL' && this.cp()?.isHuman;
        rb.disabled = !canRoll;
        rb.textContent = canRoll ? '🎲 Roll Dice'
            : Game.State.phase === 'PLAYER_MOVE' ? `Moves left: ${this.cp()?.movesLeft || 0}`
            : Game.State.phase === 'SHOOTING' ? '🔫 Shooting Phase'
            : '🎲 Roll Dice';

        // Direction controls
        const dc = document.getElementById('direction-controls');
        dc.style.display = (Game.State.phase === 'PLAYER_MOVE' && this.cp()?.isHuman) ? 'grid' : 'none';

        // Shoot button
        const sb = document.getElementById('shoot-section');
        if (Game.State.phase === 'SHOOTING' && this._shootPlayer && this._shootPlayer.isHuman) {
            sb.style.display = 'block';
            document.getElementById('shoot-label').textContent =
                `${this._shootPlayer.name}: Use gun? (🔫×${this._shootPlayer.guns})`;
        } else {
            sb.style.display = 'none';
        }

        // Round & phase
        document.getElementById('round-display').textContent = `Round ${Game.State.round}`;
        const phases = {
            SETUP:'Setup', PLAYER_ROLL:`${this.cp()?.name}'s Turn`, PLAYER_MOVE:`${this.cp()?.name} Moving`,
            SLENDERMAN_SPAWN:'⚠️ SLENDERMAN', SLENDERMAN_SCAN:'👁️ SCANNING…',
            SHOOTING:'🔫 SHOOTING', EMERGENCY:'🏃 ESCAPE', GAME_OVER:'🏆 Game Over',
        };
        document.getElementById('phase-display').textContent = phases[Game.State.phase] || '';

        // Slenderman HP bar
        const shp = document.getElementById('slender-hp');
        if (Game.Slenderman && Game.Slenderman.active) {
            shp.style.display = 'flex';
            const hearts = '❤️'.repeat(Game.Slenderman.hp) + '🖤'.repeat(Math.max(0, Game.CONFIG.SLENDER_HP - Game.Slenderman.hp));
            document.getElementById('slender-hp-value').textContent = hearts;
        } else {
            shp.style.display = 'none';
        }

        // Dice canvas
        const dc2 = document.getElementById('dice-canvas');
        if (dc2) {
            const dctx = dc2.getContext('2d');
            dctx.clearRect(0, 0, dc2.width, dc2.height);
            if (Game.Dice.value || Game.Dice.rolling)
                Game.Dice.draw(dctx, (dc2.width - 120) / 2, (dc2.height - 55) / 2, 50);
        }
    },

    /* ── loop ── */
    loop() {
        try {
            Game.Camera.update();
            Game.Dice.update();
            Game.Renderer.render();
            if (Game.State.gameStarted) this.ui();
        } catch (e) { console.error('Loop error:', e); }
        requestAnimationFrame(() => this.loop());
    },
};

document.addEventListener('DOMContentLoaded', () => Game.Main.init());
