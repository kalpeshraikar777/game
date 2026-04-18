// ========================================
// Renderer — isometric canvas drawing (v3 — rooms)
// ========================================
Game.Renderer = {
    canvas:null, ctx:null, fog:[],

    init(canvas){
        this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.fog=[];
        for(let i=0;i<40;i++) this.fog.push({x:Math.random()*4000-2000,y:Math.random()*2500-500,
            size:120+Math.random()*250,alpha:0.015+Math.random()*0.03,speed:0.15+Math.random()*0.25});
    },
    toScreen(r,c){const tw=Game.CONFIG.TILE_WIDTH,th=Game.CONFIG.TILE_HEIGHT;return{x:(c-r)*tw/2,y:(c+r)*th/2};},
    wp(wx,wy){return Game.Camera.worldToScreen(wx,wy,this.canvas);},
    onScreen(wx,wy){const s=this.wp(wx,wy),m=160;return s.x>-m&&s.x<this.canvas.width+m&&s.y>-m&&s.y<this.canvas.height+m;},

    /* ── tile ── */
    drawTile(r,c){
        const w=this.toScreen(r,c);if(!this.onScreen(w.x,w.y))return;
        const s=this.wp(w.x,w.y),z=Game.Camera.zoom;
        const tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z;
        const ctx=this.ctx,cell=Game.Board.grid[r][c];
        ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+tw/2,s.y+th/2);
        ctx.lineTo(s.x,s.y+th);ctx.lineTo(s.x-tw/2,s.y+th/2);ctx.closePath();
        ctx.fillStyle=cell.dark?Game.CONFIG.TILE_DARK:Game.CONFIG.TILE_LIGHT;
        ctx.fill();ctx.strokeStyle=Game.CONFIG.TILE_BORDER;ctx.lineWidth=0.5;ctx.stroke();
    },

    highlightTile(r,c,color){
        const w=this.toScreen(r,c),s=this.wp(w.x,w.y),z=Game.Camera.zoom;
        const tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z,ctx=this.ctx;
        ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+tw/2,s.y+th/2);
        ctx.lineTo(s.x,s.y+th);ctx.lineTo(s.x-tw/2,s.y+th/2);ctx.closePath();
        ctx.fillStyle=color;ctx.fill();
    },

    /* ── trees ── */
    drawTree(r,c,obj){
        const w=this.toScreen(r,c);if(!this.onScreen(w.x,w.y))return;
        const s=this.wp(w.x,w.y),z=Game.Camera.zoom,tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z;
        const sc=obj.scale||1,ctx=this.ctx,bx=s.x,by=s.y+th/2,h=tw*1.1*sc;
        const trW=tw*0.06,trH=h*0.3;
        ctx.fillStyle=obj.trunkColor;ctx.fillRect(bx-trW/2,by-trH,trW,trH);
        ctx.fillStyle=obj.color;
        if(obj.treeType===0){ctx.beginPath();ctx.moveTo(bx,by-h);ctx.lineTo(bx+tw*0.22*sc,by-trH);ctx.lineTo(bx-tw*0.22*sc,by-trH);ctx.closePath();ctx.fill();
            ctx.beginPath();ctx.moveTo(bx,by-h*0.82);ctx.lineTo(bx+tw*0.28*sc,by-trH-h*0.12);ctx.lineTo(bx-tw*0.28*sc,by-trH-h*0.12);ctx.closePath();ctx.fill();
        }else if(obj.treeType===1){ctx.beginPath();ctx.ellipse(bx,by-trH-h*0.22,tw*0.22*sc,h*0.32,0,0,Math.PI*2);ctx.fill();
        }else if(obj.treeType===2){ctx.beginPath();ctx.moveTo(bx,by-h);ctx.lineTo(bx+tw*0.12*sc,by-trH);ctx.lineTo(bx-tw*0.12*sc,by-trH);ctx.closePath();ctx.fill();
        }else{const R=tw*0.14*sc;
            ctx.beginPath();ctx.arc(bx,by-trH-R*1.5,R,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(bx-R*0.7,by-trH-R*0.8,R*0.8,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(bx+R*0.7,by-trH-R*0.8,R*0.8,0,Math.PI*2);ctx.fill();
        }
    },

    drawRock(r,c,obj){
        const w=this.toScreen(r,c);if(!this.onScreen(w.x,w.y))return;
        const s=this.wp(w.x,w.y),z=Game.Camera.zoom,tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z;
        const sc=obj.scale||1,ctx=this.ctx,bx=s.x,by=s.y+th/2;
        ctx.fillStyle=obj.color;
        if(obj.rockType===0){ctx.beginPath();ctx.ellipse(bx,by-tw*0.1*sc,tw*0.18*sc,tw*0.13*sc,0,0,Math.PI*2);ctx.fill();
        }else if(obj.rockType===1){ctx.beginPath();ctx.moveTo(bx-tw*0.14*sc,by);ctx.lineTo(bx-tw*0.18*sc,by-tw*0.14*sc);ctx.lineTo(bx,by-tw*0.2*sc);ctx.lineTo(bx+tw*0.16*sc,by-tw*0.08*sc);ctx.lineTo(bx+tw*0.13*sc,by);ctx.closePath();ctx.fill();
        }else{for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(bx+(i-1)*tw*0.08*sc,by-tw*0.05*sc,tw*0.07*sc,tw*0.05*sc,0,0,Math.PI*2);ctx.fill();}}
    },

    drawPole(r,c,obj){
        const w=this.toScreen(r,c);if(!this.onScreen(w.x,w.y))return;
        const s=this.wp(w.x,w.y),z=Game.Camera.zoom,tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z;
        const ctx=this.ctx,bx=s.x,by=s.y+th/2,h=tw*0.75;
        ctx.fillStyle=obj.color;ctx.fillRect(bx-tw*0.018,by-h,tw*0.036,h);
        ctx.fillStyle='#666';ctx.beginPath();ctx.arc(bx,by-h,tw*0.035,0,Math.PI*2);ctx.fill();
    },

    /* ── houses with rooms ── */
    isHouseOccupied(obj){
        for(const [dr,dc] of obj.tiles){
            const r=obj.row+dr,c=obj.col+dc;
            if(Game.PlayerManager.at(r,c)) return true;
            if(Game.Slenderman&&Game.Slenderman.active&&Game.Slenderman.row===r&&Game.Slenderman.col===c) return true;
        }
        return false;
    },

    drawHouse(obj){
        const ctx=this.ctx,z=Game.Camera.zoom;
        const tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z;
        const wallH=tw*0.45;
        const occupied=this.isHouseOccupied(obj);
        if(occupied)ctx.globalAlpha=0.35;

        const tset=new Set();
        const roomMap=new Map();
        obj.tiles.forEach(([dr,dc,room])=>{tset.add(`${dr},${dc}`);roomMap.set(`${dr},${dc}`,room);});
        const sorted=[...obj.tiles].sort((a,b)=>(a[0]+a[1])-(b[0]+b[1])||a[1]-b[1]);

        sorted.forEach(([dr,dc,room])=>{
            const r=obj.row+dr,c=obj.col+dc;
            const w=this.toScreen(r,c);if(!this.onScreen(w.x,w.y))return;
            const s=this.wp(w.x,w.y);
            const top={x:s.x,y:s.y},right={x:s.x+tw/2,y:s.y+th/2};
            const bottom={x:s.x,y:s.y+th},left={x:s.x-tw/2,y:s.y+th/2};

            // Room floor (ceiling)
            const floorCol = Game.CONFIG.ROOM_FLOOR[room] || obj.color;
            ctx.fillStyle=floorCol;
            ctx.beginPath();
            ctx.moveTo(top.x,top.y-wallH);ctx.lineTo(right.x,right.y-wallH);
            ctx.lineTo(bottom.x,bottom.y-wallH);ctx.lineTo(left.x,left.y-wallH);
            ctx.closePath();ctx.fill();
            ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=0.5;ctx.stroke();

            // Room icon on floor
            this.drawRoomIcon(room,bottom.x,bottom.y-wallH,tw,th,z);

            // Left wall (if no tile at dr+1,dc)
            if(!tset.has(`${dr+1},${dc}`)){
                ctx.fillStyle=obj.color;
                ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(bottom.x,bottom.y);
                ctx.lineTo(bottom.x,bottom.y-wallH);ctx.lineTo(left.x,left.y-wallH);
                ctx.closePath();ctx.fill();
                ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=0.5;ctx.stroke();
            }
            // Right wall (if no tile at dr,dc+1)
            if(!tset.has(`${dr},${dc+1}`)){
                ctx.fillStyle=shadeColor(obj.color,-15);
                ctx.beginPath();ctx.moveTo(bottom.x,bottom.y);ctx.lineTo(right.x,right.y);
                ctx.lineTo(right.x,right.y-wallH);ctx.lineTo(bottom.x,bottom.y-wallH);
                ctx.closePath();ctx.fill();
                ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=0.5;ctx.stroke();
            }

            // Interior walls between different rooms
            // Right neighbor (dr, dc+1)
            const rNbr=roomMap.get(`${dr},${dc+1}`);
            if(rNbr && rNbr!==room){
                // Partition on right-bottom edge at ceiling height
                ctx.strokeStyle='rgba(100,80,60,0.6)';ctx.lineWidth=Math.max(1,1.5*z);
                ctx.beginPath();
                ctx.moveTo(right.x,right.y-wallH);ctx.lineTo(bottom.x,bottom.y-wallH);ctx.stroke();
                // Small partition wall
                ctx.fillStyle='rgba(80,60,40,0.2)';
                ctx.beginPath();
                ctx.moveTo(right.x,right.y-wallH);ctx.lineTo(bottom.x,bottom.y-wallH);
                ctx.lineTo(bottom.x,bottom.y-wallH*0.3);ctx.lineTo(right.x,right.y-wallH*0.3);
                ctx.closePath();ctx.fill();
            }
            // Bottom neighbor (dr+1, dc)
            const bNbr=roomMap.get(`${dr+1},${dc}`);
            if(bNbr && bNbr!==room){
                ctx.strokeStyle='rgba(100,80,60,0.6)';ctx.lineWidth=Math.max(1,1.5*z);
                ctx.beginPath();
                ctx.moveTo(left.x,left.y-wallH);ctx.lineTo(bottom.x,bottom.y-wallH);ctx.stroke();
                ctx.fillStyle='rgba(80,60,40,0.2)';
                ctx.beginPath();
                ctx.moveTo(left.x,left.y-wallH);ctx.lineTo(bottom.x,bottom.y-wallH);
                ctx.lineTo(bottom.x,bottom.y-wallH*0.3);ctx.lineTo(left.x,left.y-wallH*0.3);
                ctx.closePath();ctx.fill();
            }
        });

        // Door on first left-exposed tile
        for(const [dr,dc] of sorted){
            if(!tset.has(`${dr+1},${dc}`)){
                const r=obj.row+dr,c=obj.col+dc;
                const w=this.toScreen(r,c),s=this.wp(w.x,w.y);
                const dw=tw*0.09,dh=wallH*0.42;
                ctx.fillStyle='#1a0e05';
                ctx.fillRect(s.x-tw/4-dw/2,s.y+th*0.75-dh,dw,dh);
                // Door handle
                ctx.fillStyle='#aa8844';
                ctx.beginPath();ctx.arc(s.x-tw/4+dw*0.3,s.y+th*0.75-dh*0.4,dw*0.08,0,Math.PI*2);ctx.fill();
                break;
            }
        }
        // Window glow
        for(const [dr,dc] of sorted){
            if(!tset.has(`${dr},${dc+1}`)){
                const r=obj.row+dr,c=obj.col+dc;
                const w=this.toScreen(r,c),s=this.wp(w.x,w.y);
                const ws=tw*0.06;
                ctx.fillStyle='rgba(255,200,50,0.5)';
                ctx.fillRect(s.x+tw*0.15,s.y+th*0.4-wallH*0.4,ws,ws);
                break;
            }
        }

        // Room labels (visible when zoomed in)
        if(z > 0.8){
            ctx.font=`${Math.max(6,7*z)}px Inter,sans-serif`;
            ctx.textAlign='center';ctx.textBaseline='middle';
            ctx.fillStyle='rgba(200,180,160,0.5)';
            sorted.forEach(([dr,dc,room])=>{
                const r=obj.row+dr,c=obj.col+dc;
                const w=this.toScreen(r,c),s=this.wp(w.x,w.y);
                const labels={hall:'Hall',kitchen:'Kitchen',toilet:'WC',bedroom:'Bed'};
                ctx.fillText(labels[room]||'',s.x,s.y+th/2-wallH);
            });
        }

        if(occupied)ctx.globalAlpha=1;
    },

    drawRoomIcon(room,cx,cy,tw,th,z){
        const ctx=this.ctx;
        const iconCol=Game.CONFIG.ROOM_ICON_COLORS[room]||'#555';
        const sz=tw*0.06;
        ctx.fillStyle=iconCol;
        if(room==='kitchen'){
            // Small stove
            ctx.fillRect(cx-sz,cy-th*0.25-sz,sz*2,sz*1.2);
            ctx.fillStyle='rgba(255,100,20,0.4)';
            ctx.beginPath();ctx.arc(cx,cy-th*0.25-sz*0.3,sz*0.3,0,Math.PI*2);ctx.fill();
        }else if(room==='toilet'){
            // Small bowl
            ctx.beginPath();ctx.ellipse(cx,cy-th*0.25,sz*0.7,sz*0.5,0,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='rgba(120,160,220,0.3)';
            ctx.beginPath();ctx.ellipse(cx,cy-th*0.25,sz*0.4,sz*0.3,0,0,Math.PI*2);ctx.fill();
        }else if(room==='bedroom'){
            // Small bed
            ctx.fillRect(cx-sz*1.2,cy-th*0.3,sz*2.4,sz*1.1);
            ctx.fillStyle='rgba(180,140,100,0.4)';
            ctx.fillRect(cx-sz*1.0,cy-th*0.3,sz*0.6,sz*1.1);
        }
        // hall — no icon
    },

    /* ── tokens ── */
    drawToken(tok){
        const w=this.toScreen(tok.row,tok.col);if(!this.onScreen(w.x,w.y))return;
        const s=this.wp(w.x,w.y),z=Game.Camera.zoom,tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z;
        const ctx=this.ctx,bx=s.x,by=s.y+th/2,rad=tw*0.1;
        const bob=Math.sin(Date.now()/400+tok.id)*tw*0.03;
        const gc=tok.type==='life'?'rgba(0,255,136,':'rgba(255,140,0,';
        const glw=ctx.createRadialGradient(bx,by-rad+bob,0,bx,by-rad+bob,rad*2.5);
        glw.addColorStop(0,gc+'0.2)');glw.addColorStop(1,gc+'0)');
        ctx.fillStyle=glw;ctx.beginPath();ctx.arc(bx,by-rad+bob,rad*2.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=tok.type==='life'?'#00dd77':'#ff8800';
        ctx.beginPath();ctx.arc(bx,by-rad+bob,rad,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(7,rad*1.1)}px Inter,sans-serif`;
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(tok.type==='life'?'♥':'✦',bx,by-rad+bob);
    },

    /* ── player ── */
    drawPlayer(p){
        const w=this.toScreen(p.row,p.col),s=this.wp(w.x,w.y),z=Game.Camera.zoom;
        const tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z;
        const ctx=this.ctx,bx=s.x,by=s.y+th*0.35,rad=tw*0.16;
        ctx.fillStyle='rgba(0,0,0,0.3)';
        ctx.beginPath();ctx.ellipse(bx,by+rad*0.35,rad*0.8,rad*0.3,0,0,Math.PI*2);ctx.fill();
        const g=ctx.createRadialGradient(bx-rad*0.3,by-rad*0.4,0,bx,by,rad);
        g.addColorStop(0,p.color);g.addColorStop(1,shadeColor(p.color,-40));
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(bx,by-rad*0.2,rad,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
        ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(9,rad*0.85)}px Inter,sans-serif`;
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.id+1,bx,by-rad*0.2);
        // HP bar
        const bW=tw*0.28,bH=Math.max(2,3*z),bX=bx-bW/2,bY=by-rad*0.2-rad-bH-2*z;
        ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(bX,bY,bW,bH);
        const hpR=p.hp/p.maxHp;ctx.fillStyle=hpR>0.5?'#2ed573':'#ff4757';ctx.fillRect(bX,bY,bW*hpR,bH);
        // Items
        let ix=bx-tw*0.15,iy=by+rad*0.5;
        ctx.font=`${Math.max(6,8*z)}px sans-serif`;ctx.textAlign='left';
        if(p.guns>0){ctx.fillText('🔫'+p.guns,ix,iy);ix+=tw*0.18;}
        if(p.extraLives>0)ctx.fillText('🛡️'+p.extraLives,ix,iy);
        // Active glow
        if(Game.State&&Game.State.currentPlayer===p.id&&
            !['SLENDERMAN_SPAWN','SLENDERMAN_SCAN','SHOOTING','GAME_OVER'].includes(Game.State.phase)){
            ctx.strokeStyle='#fff';ctx.lineWidth=2;
            ctx.globalAlpha=0.5+0.5*Math.sin(Date.now()/200);
            ctx.beginPath();ctx.arc(bx,by-rad*0.2,rad+4*z,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
        }
        // Camp warning
        if(p.turnsInHouse>=Game.CONFIG.CAMP_THRESHOLD){
            ctx.globalAlpha=0.4+0.3*Math.sin(Date.now()/300);
            ctx.strokeStyle='#ff0040';ctx.lineWidth=Math.max(1,2*z);
            ctx.beginPath();ctx.arc(bx,by-rad*0.2,rad+6*z,0,Math.PI*2);ctx.stroke();
            ctx.globalAlpha=1;
        }
    },

    /* ── slenderman ── */
    drawSlenderman(r,c){
        const w=this.toScreen(r,c),s=this.wp(w.x,w.y),z=Game.Camera.zoom;
        const tw=Game.CONFIG.TILE_WIDTH*z,th=Game.CONFIG.TILE_HEIGHT*z;
        const ctx=this.ctx,bx=s.x,by=s.y+th*0.35;
        const glw=ctx.createRadialGradient(bx,by-tw*0.3,0,bx,by-tw*0.3,tw*0.55);
        glw.addColorStop(0,'rgba(255,0,64,0.18)');glw.addColorStop(1,'rgba(255,0,64,0)');
        ctx.fillStyle=glw;ctx.beginPath();ctx.arc(bx,by-tw*0.3,tw*0.55,0,Math.PI*2);ctx.fill();
        const SC=Game.CONFIG.SLENDER_COLOR;ctx.fillStyle=SC;
        ctx.fillRect(bx-tw*0.035,by-tw*0.32,tw*0.025,tw*0.32);
        ctx.fillRect(bx+tw*0.01,by-tw*0.32,tw*0.025,tw*0.32);
        ctx.beginPath();ctx.moveTo(bx-tw*0.07,by-tw*0.32);ctx.lineTo(bx+tw*0.07,by-tw*0.32);
        ctx.lineTo(bx+tw*0.045,by-tw*0.65);ctx.lineTo(bx-tw*0.045,by-tw*0.65);ctx.closePath();ctx.fill();
        ctx.fillStyle='#e8e0d8';ctx.beginPath();ctx.ellipse(bx,by-tw*0.73,tw*0.045,tw*0.065,0,0,Math.PI*2);ctx.fill();
        const aw=Math.sin(Date.now()/280)*tw*0.028;
        ctx.strokeStyle=SC;ctx.lineWidth=Math.max(1,2*z);
        ctx.beginPath();ctx.moveTo(bx-tw*0.055,by-tw*0.55);ctx.quadraticCurveTo(bx-tw*0.18,by-tw*0.45+aw,bx-tw*0.23,by-tw*0.32);ctx.stroke();
        ctx.beginPath();ctx.moveTo(bx+tw*0.055,by-tw*0.55);ctx.quadraticCurveTo(bx+tw*0.18,by-tw*0.45-aw,bx+tw*0.23,by-tw*0.32);ctx.stroke();
        const bW=tw*0.35,bH=Math.max(3,4*z),bX=bx-bW/2,bY2=by-tw*0.82;
        ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(bX,bY2,bW,bH);
        const hpR2=Game.Slenderman.hp/Game.CONFIG.SLENDER_HP;
        ctx.fillStyle='#ff0040';ctx.fillRect(bX,bY2,bW*hpR2,bH);
    },

    drawScanLines(){
        if(!Game.Slenderman||!Game.Slenderman.scanLines)return;
        const ctx=this.ctx,z=Game.Camera.zoom,thH=Game.CONFIG.TILE_HEIGHT*z/2;
        Game.Slenderman.scanLines.forEach(sl=>{
            if(sl.progress<=0)return;
            const f=this.toScreen(sl.fr,sl.fc),t=this.toScreen(sl.tr,sl.tc);
            const fs=this.wp(f.x,f.y),ts=this.wp(t.x,t.y);
            const dx=ts.x-fs.x,dy=ts.y-fs.y;
            ctx.strokeStyle=Game.CONFIG.SLENDER_GLOW;ctx.lineWidth=Math.max(1,2*z);ctx.globalAlpha=0.55;
            ctx.beginPath();ctx.moveTo(fs.x,fs.y+thH);
            ctx.lineTo(fs.x+dx*sl.progress,fs.y+thH+dy*sl.progress);ctx.stroke();ctx.globalAlpha=1;
        });
    },

    drawLabels(){
        const ctx=this.ctx,S=Game.CONFIG.BOARD_SIZE,z=Game.Camera.zoom;
        const fs=Math.max(7,10*z);ctx.fillStyle=Game.CONFIG.GRID_LABEL_COLOR;
        ctx.font=`${fs}px 'Courier New',monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=0.6;
        const thH=Game.CONFIG.TILE_HEIGHT*z/2;
        for(let r=0;r<S;r++){const w=this.toScreen(r,-1.8),s=this.wp(w.x,w.y);
            if(s.x>-60&&s.x<this.canvas.width+60&&s.y>-20&&s.y<this.canvas.height+20)ctx.fillText(Game.Board.rowLabel(r),s.x,s.y+thH);}
        for(let c=0;c<S;c++){const w=this.toScreen(-1.8,c),s=this.wp(w.x,w.y);
            if(s.x>-60&&s.x<this.canvas.width+60&&s.y>-20&&s.y<this.canvas.height+20)ctx.fillText(Game.Board.colLabel(c),s.x,s.y+thH);}
        ctx.globalAlpha=1;
    },

    drawMinimap(){
        const ctx=this.ctx,S=Game.CONFIG.BOARD_SIZE,mm=110,cs=mm/S;
        const mx=this.canvas.width-mm-10,my=this.canvas.height-mm-10;
        ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(mx-2,my-2,mm+4,mm+4);
        for(let r=0;r<S;r++)for(let c=0;c<S;c++){
            const cell=Game.Board.grid[r][c];
            if(cell.type==='house'){
                const rc=cell.room;
                ctx.fillStyle=Game.CONFIG.ROOM_FLOOR[rc]||'#8B4513';
            }
            else if(cell.type==='tree')ctx.fillStyle='#0a3a0a';
            else if(cell.type==='rock')ctx.fillStyle='#555';
            else if(cell.type==='pole')ctx.fillStyle='#7a6848';
            else ctx.fillStyle=cell.dark?'#1a3a15':'#245a22';
            ctx.fillRect(mx+c*cs,my+r*cs,cs+0.5,cs+0.5);
        }
        Game.Tokens.list.forEach(t=>{if(!t.active)return;ctx.fillStyle=t.type==='life'?'#00ff88':'#ff8800';
            ctx.fillRect(mx+t.col*cs,my+t.row*cs,cs+1,cs+1);});
        if(Game.Players)Game.Players.forEach(p=>{if(!p.isAlive)return;ctx.fillStyle=p.color;
            ctx.beginPath();ctx.arc(mx+p.col*cs+cs/2,my+p.row*cs+cs/2,Math.max(1.5,cs*1.4),0,Math.PI*2);ctx.fill();});
        if(Game.Slenderman&&Game.Slenderman.active){ctx.fillStyle=Game.CONFIG.SLENDER_GLOW;
            ctx.beginPath();ctx.arc(mx+Game.Slenderman.col*cs+cs/2,my+Game.Slenderman.row*cs+cs/2,Math.max(2,cs*1.8),0,Math.PI*2);ctx.fill();}
        ctx.strokeStyle='#3a6a3a';ctx.lineWidth=1;ctx.strokeRect(mx-2,my-2,mm+4,mm+4);
    },

    drawFog(){
        const ctx=this.ctx;
        this.fog.forEach(p=>{p.x+=p.speed;if(p.x>2500)p.x=-600;
            const s=this.wp(p.x,p.y);ctx.fillStyle=`rgba(170,195,170,${p.alpha})`;
            ctx.beginPath();ctx.arc(s.x,s.y,p.size*Game.Camera.zoom,0,Math.PI*2);ctx.fill();});
    },

    render(){
        const ctx=this.ctx,S=Game.CONFIG.BOARD_SIZE;
        ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        const bg=ctx.createLinearGradient(0,0,0,this.canvas.height);
        bg.addColorStop(0,Game.CONFIG.BG_TOP);bg.addColorStop(1,Game.CONFIG.BG_BOT);
        ctx.fillStyle=bg;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        if(!Game.Board.grid){this.drawFog();return;}

        for(let r=0;r<S;r++)for(let c=0;c<S;c++)this.drawTile(r,c);

        const ents=[],drawnH=new Set();
        for(let r=0;r<S;r++)for(let c=0;c<S;c++){
            const cell=Game.Board.grid[r][c];
            if(cell.type==='empty'||cell.objectId===null)continue;
            const obj=Game.Objects.list[cell.objectId];
            if(obj.type==='house'){
                if(drawnH.has(obj.id))continue;drawnH.add(obj.id);
                let maxD=0;obj.tiles.forEach(([dr,dc])=>{const d=(obj.row+dr)+(obj.col+dc);if(d>maxD)maxD=d;});
                ents.push({k:'house',r:maxD,c:0,obj});
            }else ents.push({k:cell.type,r,c,obj});
        }
        if(Game.Tokens)Game.Tokens.list.forEach(t=>{if(t.active)ents.push({k:'token',r:t.row,c:t.col,tok:t});});
        if(Game.Players)Game.Players.forEach(p=>{if(p.isAlive)ents.push({k:'player',r:p.row,c:p.col,p});});
        if(Game.Slenderman&&Game.Slenderman.active)ents.push({k:'slender',r:Game.Slenderman.row,c:Game.Slenderman.col});

        ents.sort((a,b)=>(a.r+a.c)-(b.r+b.c)||a.c-b.c);
        ents.forEach(e=>{
            switch(e.k){
                case 'tree':this.drawTree(e.r,e.c,e.obj);break;
                case 'rock':this.drawRock(e.r,e.c,e.obj);break;
                case 'pole':this.drawPole(e.r,e.c,e.obj);break;
                case 'house':this.drawHouse(e.obj);break;
                case 'token':this.drawToken(e.tok);break;
                case 'player':this.drawPlayer(e.p);break;
                case 'slender':this.drawSlenderman(e.r,e.c);break;
            }
        });
        this.drawScanLines();this.drawLabels();this.drawFog();this.drawMinimap();
    },
};
