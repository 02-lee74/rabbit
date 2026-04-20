const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cw = canvas.width;
let ch = canvas.height;

let assets = {};
let processedCanvases = {};
let bgCanvas, idleCanvas, jumpCanvas, stairCanvas;
let numAssetsLoaded = 0;
let totalAssets = 10;

let selectedCharacterKey = 'rabbit';
let selectedBgKey = 'bg';

let clouds = [];
let birds = [];
let butterflies = [];

function initAmbient() {
    clouds = [];
    birds = [];
    butterflies = [];
    let startW = canvas.width || 500;
    let startH = canvas.height || 800;
    for(let i=0; i<6; i++) {
        clouds.push({
            x: Math.random() * startW * 1.5,
            baseY: Math.random() * startH,
            speed: 0.1 + Math.random() * 0.4,
            scale: 0.5 + Math.random() * 1.2,
            floatOffset: Math.random() * Math.PI * 2,
            y: 0
        });
    }
    for(let i=0; i<5; i++) {
        birds.push({
            x: Math.random() * startW * 1.5,
            baseY: Math.random() * startH,
            speed: 1.0 + Math.random() * 1.5,
            scale: 0.3 + Math.random() * 0.4,
            wingTimer: Math.random() * 100,
            floatOffset: Math.random() * Math.PI * 2,
            y: 0
        });
    }
    for(let i=0; i<6; i++) {
        butterflies.push({
            x: Math.random() * startW,
            baseY: Math.random() * startH,
            speedX: -0.5 + Math.random() * 1.0,
            speedY: -0.2 + Math.random() * 0.4,
            t: Math.random() * 100,
            scale: 0.6 + Math.random() * 0.5,
            y: 0
        });
    }
}

function updateAmbient(dt) {
    clouds.forEach(c => {
        c.x -= c.speed * dt * 0.05;
        c.floatOffset += dt * 0.001;
        c.y = c.baseY + Math.sin(c.floatOffset) * 10;
        if (c.x < -100 * c.scale) {
            c.x = cw + 100 * c.scale;
            c.baseY = Math.random() * ch;
        }
    });
    birds.forEach(b => {
        b.x += b.speed * dt * 0.05;
        b.wingTimer += dt * 0.015;
        b.floatOffset += dt * 0.002;
        b.y = b.baseY + Math.sin(b.floatOffset) * 15;
        if (b.x > cw + 50 * b.scale) {
            b.x = -50 * b.scale;
            b.baseY = Math.random() * ch;
        }
    });
    butterflies.forEach(b => {
        b.t += dt * 0.005;
        b.x += b.speedX * dt * 0.1 + Math.sin(b.t * 2) * 1.5;
        b.y = b.baseY + b.speedY * dt * 0.1 + Math.cos(b.t * 3) * 10;
        if (b.x > cw + 50 || b.x < -50) b.speedX *= -1;
        if (b.y > ch + 50 || b.y < -50) b.speedY *= -1;
    });
}

function drawAmbient() {
    if (selectedBgKey === 'bg' || selectedBgKey === 'bg_lake') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        clouds.forEach(c => {
            let drawY = c.y;
            ctx.beginPath();
            ctx.arc(c.x, drawY, 20 * c.scale, 0, Math.PI * 2);
            ctx.arc(c.x + 25 * c.scale, drawY - 10 * c.scale, 25 * c.scale, 0, Math.PI * 2);
            ctx.arc(c.x + 50 * c.scale, drawY, 20 * c.scale, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    birds.forEach(b => {
        let drawY = b.y;
        let wingOffset = Math.sin(b.wingTimer) * 12 * b.scale;
        ctx.beginPath();
        ctx.moveTo(b.x - 15 * b.scale, drawY - wingOffset);
        ctx.lineTo(b.x, drawY);
        ctx.lineTo(b.x + 15 * b.scale, drawY - wingOffset);
        ctx.stroke();
    });
    
    if (selectedBgKey === 'bg_bamboo') {
        ctx.font = '20px Arial';
        butterflies.forEach(b => {
            ctx.save();
            ctx.translate(b.x, b.y);
            let flutter = Math.abs(Math.sin(b.t * 10));
            ctx.scale(b.scale * (0.2 + 0.8 * flutter), b.scale);
            ctx.fillText('🦋', -10, 10);
            ctx.restore();
        });
    }
}

function resize() {
    let container = document.getElementById('game-container');
    cw = container.clientWidth;
    ch = container.clientHeight;
    canvas.width = cw;
    canvas.height = ch;
    if (clouds.length === 0 && cw > 0) {
        initAmbient();
    }
}
window.addEventListener('resize', resize);
resize();

function loadAssets() {
    const assetNames = [
        {key: 'idle', url: 'assets/rabbit_idle.png'},
        {key: 'jump', url: 'assets/rabbit_jump.png'},
        {key: 'panda_idle', url: 'assets/panda_idle.png'},
        {key: 'panda_jump', url: 'assets/panda_jump.png'},
        {key: 'tiger_idle', url: 'assets/tiger_idle.png'},
        {key: 'tiger_jump', url: 'assets/tiger_jump.png'},
        {key: 'stair', url: 'assets/stair.png'},
        {key: 'bg', url: 'assets/bg.png'},
        {key: 'bg_bamboo', url: 'assets/bg_bamboo.png'},
        {key: 'bg_lake', url: 'assets/bg_lake.png'},
        {key: 'stair_wood', url: 'assets/stair_wood.png'},
        {key: 'stair_stone', url: 'assets/stair_stone.png'}
    ];
    totalAssets = assetNames.length;
    
    assetNames.forEach(item => {
        let img = new Image();
        img.onload = () => {
            assets[item.key] = img;
            numAssetsLoaded++;
            if (numAssetsLoaded === totalAssets) {
                processAssets();
            }
        };
        img.onerror = () => {
            console.error('Failed to load ' + item.url);
            numAssetsLoaded++;
            if (numAssetsLoaded === totalAssets) {
                processAssets();
            }
        };
        if (typeof LocalAssets !== 'undefined' && LocalAssets[item.key]) {
            img.src = LocalAssets[item.key];
        } else {
            img.src = item.url;
        }
    });
}

function processAssets() {
    ['idle', 'jump', 'panda_idle', 'panda_jump', 'tiger_idle', 'tiger_jump', 'stair', 'stair_wood', 'stair_stone'].forEach(k => {
        if(assets[k]) processedCanvases[k] = removeWhiteBg(assets[k], k);
    });
    
    const startBtn = document.getElementById('start-btn');
    startBtn.innerText = '게임 시작';
    startBtn.onclick = () => {
        applySelection();
        initGame();
    };
}

function applySelection() {
    let idleKey = selectedCharacterKey === 'rabbit' ? 'idle' : selectedCharacterKey + '_idle';
    let jumpKey = selectedCharacterKey === 'rabbit' ? 'jump' : selectedCharacterKey + '_jump';
    
    if (selectedCharacterKey === 'rabbit') {
        selectedBgKey = 'bg';
    } else if (selectedCharacterKey === 'panda') {
        selectedBgKey = 'bg_bamboo';
    } else if (selectedCharacterKey === 'tiger') {
        selectedBgKey = 'bg_lake';
    }
    
    idleCanvas = processedCanvases[idleKey];
    jumpCanvas = processedCanvases[jumpKey];
    bgCanvas = assets[selectedBgKey];
    
    if (selectedBgKey === 'bg_bamboo') {
        stairCanvas = processedCanvases['stair_wood'];
    } else if (selectedBgKey === 'bg_lake') {
        stairCanvas = processedCanvases['stair_stone'];
    } else {
        stairCanvas = processedCanvases['stair'];
    }
    
    let bonusEmoji = '🥕';
    let bonusLabel = '당근';
    
    if (selectedCharacterKey === 'panda') {
        bonusEmoji = '🎋';
        bonusLabel = '대나무';
    } else if (selectedCharacterKey === 'tiger') {
        bonusEmoji = '🍖';
        bonusLabel = '고기';
    }
    
    window.currentBonusEmoji = bonusEmoji;
    
    if (document.getElementById('bonus-label')) document.getElementById('bonus-label').innerText = bonusLabel;
    if (document.getElementById('bonus-emoji')) document.getElementById('bonus-emoji').innerText = bonusEmoji;
    if (document.getElementById('final-bonus-label')) document.getElementById('final-bonus-label').innerText = bonusLabel;
    if (document.getElementById('final-bonus-emoji')) document.getElementById('final-bonus-emoji').innerText = bonusEmoji;
}

// --- Leaderboard Integration ---
async function fetchLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    
    try {
        const response = await fetch('/api/scores');
        const data = await response.json();
        
        if (data.scores && data.scores.length > 0) {
            listEl.innerHTML = data.scores.map((s, idx) => `
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                    <span>${idx + 1}. <strong>${s.nickname}</strong> (${s.character === 'rabbit' ? '🐰' : s.character === 'panda' ? '🐼' : '🐯'})</span>
                    <span style="color: #ff7675; font-weight: bold;">${s.score}점</span>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '아직 기록이 없습니다. 첫 번째 주인공이 되어보세요!';
        }
    } catch (e) {
        console.error("Leaderboard fetch error:", e);
        listEl.innerHTML = '기록을 불러오지 못했습니다.';
    }
}

async function submitScore() {
    const nickname = document.getElementById('nickname-input').value.trim() || '익명 토끼';
    
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nickname: nickname,
                score: score,
                distance: curStair,
                character: selectedCharacterKey
            })
        });
        const data = await response.json();
        if (data.ok) {
            fetchLeaderboard(); // Refresh after submit
        }
    } catch (e) {
        console.error("Score submission error:", e);
    }
}
// -----------------------------

function removeWhiteBg(img, key) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0);
    try {
        const imageData = cx.getImageData(0, 0, c.width, c.height);
        const data = imageData.data;
        const w = c.width;
        const h = c.height;
        let queue = [0, w - 1, (h - 1) * w, (h - 1) * w + w - 1];
        
        // 3x3 격자 형태의 스프라이트 시트일 경우에만 내부 셀에서 플러드 필 시작
        if (key === 'tiger_jump') {
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    let px = Math.floor((col + 0.2) * (w/3));
                    let py = Math.floor((row + 0.1) * (h/3));
                    queue.push(py * w + px);
                }
            }
        }
        
        let visited = new Uint8Array(w * h);
        while(queue.length > 0) {
            let idx = queue.pop();
            if (visited[idx]) continue;
            visited[idx] = 1;
            let p = idx * 4;
            // 회색 격자선까지 제거하기 위해 허용 범위(임계값)를 조금 낮춤
            if (data[p] > 210 && data[p+1] > 210 && data[p+2] > 210) {
                data[p+3] = 0; // Transparent
                let x = idx % w;
                let y = Math.floor(idx / w);
                if (x > 0) queue.push(idx - 1);
                if (x < w - 1) queue.push(idx + 1);
                if (y > 0) queue.push(idx - w);
                if (y < h - 1) queue.push(idx + w);
            }
        }
        cx.putImageData(imageData, 0, 0);
    } catch(e) {
        console.warn('CORS prevented background removal', e);
        if (window.location.protocol === 'file:') {
            alert("현재 파일 모드에서는 브라우저 보안 정책 상 배경 이미지를 실시간으로 투명하게 지울 수 없습니다.\n반드시 이전에 열어드린 [ http://127.0.0.1:8080/ ] 주소의 탭에서 플레이해주세요!");
        }
    }
    return c;
}

// Game State
let stairs = [];
let curStair = 0;
let score = 0;
let carrots = 0;
let time = 100;
let maxTime = 100;
let state = 'start'; // start, play, over
let lastTime = 0;
let dropVy = 0;
let dropY = 0;

let camera = { x: 0, y: 0 };
let player = {
    x: 0, y: 0,
    visualX: 0, visualY: 0,
    facing: 1, // 1 right, -1 left
    isJumping: false,
    jumpTimer: 0
};

function initGame() {
    stairs = [{x: cw/2, y: ch - 150}];
    curStair = 0;
    score = 0;
    carrots = 0;
    if(document.getElementById('carrots')) document.getElementById('carrots').innerText = carrots;
    time = maxTime;
    
    player.facing = 1;
    player.jumpTimer = 0;
    player.isJumping = false;
    dropVy = 0;
    dropY = 0;
    
    state = 'play';
    addStairs(50);
    
    player.x = stairs[0].x;
    player.y = stairs[0].y;
    player.visualX = player.x;
    player.visualY = player.y;
    
    camera.x = player.x - cw/2;
    camera.y = player.y - ch + 250;
    
    document.getElementById('score').innerText = score;
    updateTimerUI();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    
    if(!lastTime) {
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
    
    // Initial leaderboard load (optional)
    // fetchLeaderboard();
}

function addStairs(count) {
    let last = stairs[stairs.length - 1];
    for (let i = 0; i < count; i++) {
        let dir = Math.random() > 0.5 ? 1 : -1;
        stairs.push({
            x: last.x + dir * 80, // Horizontal spread 
            y: last.y - 65,       // Vertical spread
            hasCarrot: Math.random() < 0.2 // 20% chance for a carrot
        });
        last = stairs[stairs.length - 1];
    }
}

function jump(dir) {
    if (state !== 'play') return;
    
    let next = stairs[curStair + 1];
    let isNextRight = next.x > stairs[curStair].x;
    
    let isCorrect = (dir === 1 && isNextRight) || (dir === -1 && !isNextRight);
    
    player.facing = dir;
    player.isJumping = true;
    player.jumpTimer = 150; // Jump animation duration ms
    
    if (isCorrect) {
        curStair++;
        score++;
        document.getElementById('score').innerText = score;
        
        if (next.hasCarrot) {
            carrots++;
            next.hasCarrot = false; // consume it
            if(document.getElementById('carrots')) document.getElementById('carrots').innerText = carrots;
        }
        
        // Time recovery decreases as score increases for higher difficulty
        let recovery = Math.max(0.5, 4 - score * 0.02);
        time = Math.min(maxTime, time + recovery * 3); 
        
        player.x = next.x;
        player.y = next.y;
        
        if (curStair > stairs.length - 20) {
            addStairs(20);
        }
    } else {
        // Death (Wrong direction)
        state = 'over';
        dropY = player.visualY;
        player.x += dir * 80;
        player.visualX = player.x; // instantly update horizontal for fall
    }
}

window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // Prevent page scrolling
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') jump(1);
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') jump(-1);
});

// Mobile Controls UI
document.addEventListener('DOMContentLoaded', () => {
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    
    const triggerLeft = (e) => { e.preventDefault(); e.stopPropagation(); jump(-1); };
    const triggerRight = (e) => { e.preventDefault(); e.stopPropagation(); jump(1); };
    
    btnLeft.addEventListener('touchstart', triggerLeft, {passive: false});
    btnRight.addEventListener('touchstart', triggerRight, {passive: false});
    
    // Also bind click for mouse users
    btnLeft.addEventListener('mousedown', triggerLeft);
    btnRight.addEventListener('mousedown', triggerRight);
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        initGame();
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        let cx = canvas.getContext('2d');
        cx.clearRect(0, 0, canvas.width, canvas.height);
        state = 'start';
    });

    // Handle initial leaderboard load on Home or Over
    fetchLeaderboard();

    // Selection handlers
    document.querySelectorAll('#character-select .select-option').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('#character-select .select-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            selectedCharacterKey = this.getAttribute('data-char');
        });
    });
});

function updateTimerUI() {
    const bar = document.getElementById('timer-bar');
    let pct = (time / maxTime) * 100;
    if(pct < 0) pct = 0;
    bar.style.width = pct + '%';
    if (pct < 30) {
        bar.style.background = '#ff4e50';
    } else {
        bar.style.background = 'linear-gradient(90deg, #ff4e50, #f9d423)';
    }
}

function gameLoop(now) {
    let dt = now - lastTime;
    lastTime = now;
    
    if (dt > 100) dt = 16; // Prevent huge jumps if tab was inactive
    
    update(dt);
    draw();
    
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (state === 'play') {
        // Base drain + difficulty scaling
        let drainRate = 0.02 + score * 0.0002;
        time -= dt * drainRate; 
        if (time <= 0) {
            time = 0;
            state = 'over';
            dropY = player.visualY;
        }
        updateTimerUI();
    }
    
    if (state === 'over') {
        dropVy += 0.04 * dt; 
        dropY += dropVy * dt * 0.1;
        player.visualY = dropY;
        
        if (dropY > camera.y + ch + 300) {
            document.getElementById('game-over-screen').classList.remove('hidden');
            document.getElementById('controls').classList.add('hidden');
            document.getElementById('final-score').innerText = score;
            if(document.getElementById('final-carrots')) document.getElementById('final-carrots').innerText = carrots;
            
            // Auto submit score and refresh leaderboard
            submitScore();
        }
    } else {
        // Lerp player visual pos
        player.visualX += (player.x - player.visualX) * 0.4;
        player.visualY += (player.y - player.visualY) * 0.4;
    }
    
    if (player.jumpTimer > 0) {
        player.jumpTimer -= dt;
        if (player.jumpTimer <= 0) {
            player.isJumping = false;
        }
    }
    
    // Lerp camera
    let targetCamY = player.y - ch + 300;
    let targetCamX = player.x - cw/2;
    
    // Fast vertical follow, slower horizontal follow
    camera.y += (targetCamY - camera.y) * 0.15;
    camera.x += (targetCamX - camera.x) * 0.05;
    
    updateAmbient(dt);
}

function draw() {
    ctx.clearRect(0, 0, cw, ch);
    
    if (bgCanvas) {
        if (selectedBgKey === 'bg_bamboo') {
            // 배경 이미지를 먼저 고정된 상태로 그립니다. (전체 흔들림 방지)
            ctx.drawImage(bgCanvas, 0, 0, cw, ch);
            
            // 픽셀 조작을 통해 대나무(녹색 계열) 부분만 살랑이게 만듭니다.
            let time = Date.now() / 1500;
            let sway = Math.sin(time) * 0.015; // 기존 전체 흔들림보단 부드러운 살랑거림
            
            try {
                let imgData = ctx.getImageData(0, 0, cw, ch);
                let data = new Uint8ClampedArray(imgData.data); // 원본 복사본 유지
                let out = imgData.data; // 출력 픽셀 데이터
                
                for (let y = 0; y < ch; y++) {
                    let skewFactor = (ch - y) * sway;
                    let offset = Math.round(skewFactor);
                    if (offset === 0) continue;
                    
                    for (let x = 0; x < cw; x++) {
                        let i = (y * cw + x) * 4;
                        let r = data[i], g = data[i+1], b = data[i+2];
                        
                        // 현재 픽셀이 녹색(대나무) 계열인지 판별
                        let dGreen = (g > r + 5) && (g > b + 5) && (g > 40);
                        
                        let srcX = x - offset;
                        srcX = Math.max(0, Math.min(cw - 1, srcX)); // 캔버스 범위 내 클램프
                        let srcI = (y * cw + srcX) * 4;
                        let sr = data[srcI], sg = data[srcI+1], sb = data[srcI+2];
                        
                        // 참조해올 원본 픽셀이 녹색(대나무) 계열인지 판별
                        let sGreen = (sg > sr + 5) && (sg > sb + 5) && (sg > 40);
                        
                        // 현재 위치가 대나무였거나, 새로 덮어쓸 색상이 대나무 색인 경우에만 픽셀 갱신
                        // (이렇게 해야 빈 공간에 궤적이 남지 않음)
                        if (dGreen || sGreen) {
                            out[i] = sr;
                            out[i+1] = sg;
                            out[i+2] = sb;
                        }
                    }
                }
                ctx.putImageData(imgData, 0, 0);
            } catch (e) {
                // CORS 등 에러가 나면 무시하고 정지된 숲 배경만 표시
            }
        } else if (selectedBgKey === 'bg_lake') {
            ctx.drawImage(bgCanvas, 0, 0, cw, ch); // Draw base image
            let waterStart = Math.floor(ch * 0.55);
            let time = Date.now() / 300;
            
            try {
                let sliceH = ch - waterStart;
                let imgData = ctx.getImageData(0, waterStart, cw, sliceH);
                let data = new Uint8ClampedArray(imgData.data); // Original copy
                let out = imgData.data; // Writable output
                
                for (let y = 0; y < sliceH; y++) {
                    let depth = y / sliceH; // 0.0 to 1.0
                    let offset = Math.floor(Math.sin((y + waterStart) * 0.08 - time * 1.5) * (1 + depth * 4));
                    
                    if (offset === 0) continue;
                    
                    for (let x = 0; x < cw; x++) {
                        let i = (y * cw + x) * 4;
                        let r = data[i], g = data[i+1], b = data[i+2];
                        
                        // Heuristic for water: Blue is greater than Red, and Blue is not much lower than Green.
                        // Avoids distorting grass (Green > Blue), wood/bridge (Red/Grey).
                        let isWater = (b > r + 5) && (b > g * 0.6);
                        
                        if (isWater) {
                            let srcX = x - offset;
                            srcX = Math.max(0, Math.min(cw - 1, srcX)); // clamp to edges
                            let srcI = (y * cw + srcX) * 4;
                            let sr = data[srcI], sg = data[srcI+1], sb = data[srcI+2];
                            
                            // Only copy if source is also water, to avoid smudging the bridge into the water
                            if ((sb > sr + 5) && (sb > sg * 0.6)) {
                                out[i] = sr;
                                out[i+1] = sg;
                                out[i+2] = sb;
                            }
                        }
                    }
                }
                ctx.putImageData(imgData, 0, waterStart);
            } catch (e) {
                // Fallback to static if CORS or any error occurs
            }
        } else {
            ctx.drawImage(bgCanvas, 0, 0, cw, ch);
        }
    } else {
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, cw, ch);
    }
    
    drawAmbient();
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw Stairs
    let startStair = Math.max(0, curStair - 10);
    let endStair = Math.min(stairs.length, curStair + 20); 
    
    for (let i = startStair; i < endStair; i++) {
        let s = stairs[i];
        if (stairCanvas) {
            ctx.drawImage(stairCanvas, s.x - 75, s.y - 30, 150, 75);
        } else {
             // Fallback stair graphic
            ctx.fillStyle = '#fff';
            ctx.fillRect(s.x - 40, s.y - 10, 80, 20);
            ctx.fillStyle = '#bbb';
            ctx.fillRect(s.x - 40, s.y + 10, 80, 10);
        }
        if (s.hasCarrot) {
            ctx.font = '36px Arial';
            ctx.fillText(window.currentBonusEmoji || '🥕', s.x - 18, s.y - 30);
        }
    }
    
    // Draw Player
    let px = player.visualX;
    let py = player.visualY;
    
    // Add vertical bounce arc during jump
    if (player.isJumping && state === 'play') {
        let progress = player.jumpTimer / 150; 
        if (progress > 0 && progress <= 1) {
            let arc = Math.sin(progress * Math.PI) * 40; 
            py -= arc;
        }
    }
    
    ctx.save();
    ctx.translate(px, py - 40); // Align feet to step
    if (player.facing === -1) {
        ctx.scale(-1, 1);
    }
    
    // Add dynamic effects for characters
    // Add dynamic effects for characters
    if (selectedCharacterKey === 'panda' && player.isJumping && state === 'play') {
        // 유저가 제공한 팬더 이미지 에셋에 동적 애니메이션(변형)을 적용합니다.
        let progress = player.jumpTimer / 150; 
        let t = 1 - progress; // 0 (start) to 1 (end)
        
        let apex = Math.sin(t * Math.PI); // 이륙(0) -> 최고점(1) -> 착지(0)
        let lunge = Math.cos(t * Math.PI); // 이륙(1) -> 최고점(0) -> 착지(-1)
        
        // 4) 몸 기울기: 이륙 시 앞으로(+), 착지 시 뒤로(-) 자연스럽게 기울어짐
        let tilt = lunge * (25 * Math.PI / 180);
        
        // 발끝을 기준으로 변환하여 하체는 고정시키고 상체가 요동치게 합니다.
        ctx.translate(0, 40);
        ctx.rotate(tilt);
        
        // 2) 점프 중 전력질주 & 3) 공중 최고점 가장 넓게 벌어짐
        let stretchX = 1 + apex * 0.35; // 다리와 앞발이 최고점에서 옆으로 길게 뻗어짐
        
        // 5) 달릴 때 공기저항으로 살짝 납작해지며 귀가 눕혀지는 느낌을 세로 스케일로 구현
        let squashY = 1 - apex * 0.1; 
        
        // 앞다리가 앞으로 나가는 역동적 포즈를 스큐(Skew)로 강조
        let reachSkew = -apex * 0.25; 
        
        ctx.transform(stretchX, 0, reachSkew, squashY, 0, 0);
        ctx.translate(0, -40);
        
    } else if (selectedCharacterKey === 'tiger' && player.isJumping && state === 'play') {
        // 아기 호랑이 도약(Bound) 애니메이션
        let progress = player.jumpTimer / 150; 
        let t = 1 - progress; // 0 (start) to 1 (end)
        
        let apex = Math.sin(t * Math.PI); // 이륙(0) -> 최고점(1) -> 착지(0)
        let lunge = Math.cos(t * Math.PI); // 이륙(1) -> 최고점(0) -> 착지(-1)
        
        // 핵심 수정: 고양잇과 동물이 뛰어오를 때처럼 이륙 시 앞발을 치켜들고(가슴을 켬, 음수 회전), 
        // 착지할 때 앞발 먼저 바닥을 향해 다이빙하듯 꽂힘(양수 회전)
        let tilt = -lunge * (30 * Math.PI / 180);
        
        // 엉덩이/뒷다리 부근(-15, 25)을 중심축으로 설정하여 폭발적으로 튀어나가는 힘을 표현
        ctx.translate(-15, 25);
        ctx.rotate(tilt);
        
        // 이미 유저가 달리는 이미지를 넣었으므로, 형태가 찌그러지는 과도한 비틀기(Skew)는 제거하고
        // 공중에서 가속도가 붙은 것처럼 탄력적으로만 늘려줍니다(Scale)
        let stretchX = 1 + apex * 0.15; // 15% 길어짐 (탄력감)
        let squashY = 1 - apex * 0.05;  // 살짝 얇아지며 날렵함 강조
        
        ctx.scale(stretchX, squashY);
        ctx.translate(15, -25);
    }
    
    // 최종적으로 사용할 캐릭터의 이미지를 그립니다.
    let currentSprite = player.isJumping ? jumpCanvas : idleCanvas;
    
    if (currentSprite) {
        // 호랑이 점프 이미지 형태 분석 (스프라이트 시트 판별)
        let aspect = currentSprite.width / currentSprite.height;
        if (selectedCharacterKey === 'tiger' && player.isJumping) {
            let is1x3 = aspect > 2.5; // 가로로 긴 3프레임 시트
            let is3x3 = aspect >= 0.8 && aspect <= 1.2; // 3x3 (9프레임) 정사각형 썸네일 시트
            
            if (is1x3 || is3x3) {
                let cols = 3;
                let rows = is3x3 ? 3 : 1;
                let totalFrames = cols * rows;
                
                let frameWidth = currentSprite.width / cols;
                let frameHeight = currentSprite.height / rows;
                
                // t는 0(이륙)에서 1(착지)로 진행합니다. 프레임 개수만큼 등분하여 재생합니다.
                let progress = player.jumpTimer / 150;
                let t = 1 - progress; 
                let frameIndex = Math.floor(t * totalFrames);
                if (frameIndex >= totalFrames) frameIndex = totalFrames - 1;
                if (frameIndex < 0) frameIndex = 0;
                
                let col = frameIndex % cols;
                let row = Math.floor(frameIndex / cols);
                
                // 각 프레임 간 테두리(격자선)가 남아있을 경우를 대비해 2px 씩 안쪽만 잘라냅니다.
                let margin = is3x3 ? 2 : 0;
                let sx = col * frameWidth + margin;
                let sy = row * frameHeight + margin;
                let sW = frameWidth - margin * 2;
                let sH = frameHeight - margin * 2;
                
                // 해당 프레임 영역만 오려서 그립니다.
                ctx.drawImage(currentSprite, sx, sy, sW, sH, -60, -70, 120, 120);
            } else {
                ctx.drawImage(currentSprite, -60, -70, 120, 120);
            }
        } else {
            // 단일 이미지일 경우 기존처럼 전체 출력
            ctx.drawImage(currentSprite, -60, -70, 120, 120);
        }
    } else {
        // 이미지가 없을 경우의 기본 렌더링 (토끼)
        ctx.fillStyle = '#fff'; 
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#ffb6c1'; 
        ctx.fillRect(-15, -45, 10, 30);
        ctx.fillRect(5, -45, 10, 30);
    }
    
    ctx.restore();
    ctx.restore();
}

loadAssets();
