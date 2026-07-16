// ================================================
// FLAPPY BIRD — MULTIPLAYER DUEL EDITION
// 2 Players split-screen battle - INDEPENDENT!
// WITH SKIN SHOP SYSTEM (Per Player Coins)
// ================================================

// =====================
// DOM Elements
// =====================
const canvasP1 = document.getElementById("gameP1");
const ctxP1 = canvasP1.getContext("2d");
const canvasP2 = document.getElementById("gameP2");
const ctxP2 = canvasP2.getContext("2d");

const p1ScoreEl = document.getElementById("p1Score");
const p2ScoreEl = document.getElementById("p2Score");
const bgMusic = document.getElementById("soundtrack");
const gameOverSound = document.getElementById("gameOverSound");
const winnerSound = document.getElementById("winnerSound");
const muteBtn = document.getElementById("muteBtn");
const winnerBanner = document.getElementById("winnerBanner");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

// =====================
// LOAD COIN IMAGE
// =====================
const coinImage = new Image();
coinImage.src = 'koin.png'; // Pastikan file koin.png ada di folder yang sama

// =====================
// SKIN SHOP SYSTEM - PER PLAYER COINS
// =====================

// Skin data
const SKIN_DATA = {
    player1: [
        { id: 'p1_red', name: 'Red Bird', color: '#FF6B6B', price: 0, default: true },
        { id: 'p1_blue', name: 'Blue Bird', color: '#4A9BD9', price: 100 },
        { id: 'p1_gold', name: 'Golden Bird', color: '#FFD700', price: 200 },
        { id: 'p1_dragon', name: 'Dragon', color: '#FF4444', price: 300 },
        { id: 'p1_phoenix', name: 'Phoenix', color: '#FF6B35', price: 500 },
        { id: 'p1_owl', name: 'Owl', color: '#8B6914', price: 150 },
        { id: 'p1_eagle', name: 'Eagle', color: '#5D4037', price: 250 },
        { id: 'p1_parrot', name: 'Parrot', color: '#4CAF50', price: 180 },
        { id: 'p1_penguin', name: 'Penguin', color: '#37474F', price: 200 },
        { id: 'p1_raven', name: 'Raven', color: '#212121', price: 280 },
    ],
    player2: [
        { id: 'p2_blue', name: 'Blue Bird', color: '#4ECDC4', price: 0, default: true },
        { id: 'p2_green', name: 'Green Bird', color: '#4CAF50', price: 100 },
        { id: 'p2_silver', name: 'Silver Bird', color: '#BDBDBD', price: 200 },
        { id: 'p2_raven', name: 'Raven', color: '#212121', price: 300 },
        { id: 'p2_peacock', name: 'Peacock', color: '#1A237E', price: 400 },
        { id: 'p2_swan', name: 'Swan', color: '#FFFFFF', price: 150 },
        { id: 'p2_hawk', name: 'Hawk', color: '#795548', price: 250 },
        { id: 'p2_penguin', name: 'Penguin', color: '#37474F', price: 200 },
        { id: 'p2_parrot', name: 'Parrot', color: '#E91E63', price: 180 },
        { id: 'p2_eagle', name: 'Eagle', color: '#4E342E', price: 260 },
    ]
};

// Game data - saved in localStorage
let gameData = {
    player1: {
        coins: 0,
        owned: ['p1_red'],
        equipped: 'p1_red'
    },
    player2: {
        coins: 0,
        owned: ['p2_blue'],
        equipped: 'p2_blue'
    }
};

// Load saved data
function loadGameData() {
    try {
        const saved = localStorage.getItem('flappyBirdSkinData');
        if (saved) {
            const parsed = JSON.parse(saved);
            gameData.player1.coins = parsed.player1?.coins || 0;
            gameData.player1.owned = parsed.player1?.owned || ['p1_red'];
            gameData.player1.equipped = parsed.player1?.equipped || 'p1_red';
            gameData.player2.coins = parsed.player2?.coins || 0;
            gameData.player2.owned = parsed.player2?.owned || ['p2_blue'];
            gameData.player2.equipped = parsed.player2?.equipped || 'p2_blue';
        }
    } catch (e) {
        console.log('Error loading saved data, using defaults');
    }
    saveGameData();
}

function saveGameData() {
    try {
        localStorage.setItem('flappyBirdSkinData', JSON.stringify(gameData));
    } catch (e) {
        console.log('Error saving game data');
    }
}

// Earn coins based on score untuk masing-masing player
function earnCoins(player, score) {
    const earned = Math.floor(score / 2) + 1; // 1 coin per 2 points, minimum 1
    const playerKey = player === 1 ? 'player1' : 'player2';
    gameData[playerKey].coins += earned;
    updateCoinsDisplay();
    saveGameData();
    
    // Tampilkan notifikasi koin yang didapat
    showCoinEarned(player, earned);
    
    return earned;
}

// Tampilkan animasi koin yang didapat
function showCoinEarned(player, amount) {
    const container = document.getElementById('gameContainer');
    if (!container) return;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: ${player === 1 ? '30%' : '70%'};
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: #FFD700;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 24px;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
        animation: floatUp 1.5s ease-out forwards;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 2px solid #FFD700;
        font-family: 'Outfit', sans-serif;
    `;
    
    // Tambahkan gambar koin
    const coinImg = document.createElement('img');
    coinImg.src = 'koin.png';
    coinImg.style.cssText = `
        width: 30px;
        height: 30px;
        object-fit: contain;
    `;
    
    popup.innerHTML = `+${amount} `;
    popup.prepend(coinImg);
    
    // Tambahkan CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-100px) scale(1.5); }
        }
    `;
    document.head.appendChild(style);
    
    container.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
        style.remove();
    }, 1500);
}

// Update coins display dengan gambar koin
function updateCoinsDisplay() {
    const p1CoinsEl = document.getElementById('p1Coins');
    const p2CoinsEl = document.getElementById('p2Coins');
    if (p1CoinsEl) p1CoinsEl.textContent = gameData.player1.coins;
    if (p2CoinsEl) p2CoinsEl.textContent = gameData.player2.coins;
}

// Check if player owns a skin
function ownsSkin(player, skinId) {
    const playerKey = player === 1 ? 'player1' : 'player2';
    return gameData[playerKey].owned.includes(skinId);
}

// Check if player has equipped a skin
function isEquipped(player, skinId) {
    const playerKey = player === 1 ? 'player1' : 'player2';
    return gameData[playerKey].equipped === skinId;
}

// Get player coins
function getPlayerCoins(player) {
    const playerKey = player === 1 ? 'player1' : 'player2';
    return gameData[playerKey].coins;
}

// Buy a skin
function buySkin(player, skinId) {
    const playerKey = player === 1 ? 'player1' : 'player2';
    const skinData = SKIN_DATA[playerKey].find(s => s.id === skinId);
    
    if (!skinData) return { success: false, message: 'Skin not found' };
    if (ownsSkin(player, skinId)) return { success: false, message: 'Already owned' };
    if (gameData[playerKey].coins < skinData.price) return { success: false, message: 'Not enough coins' };
    
    // Deduct coins and add skin
    gameData[playerKey].coins -= skinData.price;
    gameData[playerKey].owned.push(skinId);
    saveGameData();
    updateCoinsDisplay();
    
    return { success: true, message: 'Skin purchased!' };
}

// Equip a skin
function equipSkin(player, skinId) {
    const playerKey = player === 1 ? 'player1' : 'player2';
    if (!ownsSkin(player, skinId)) return { success: false, message: 'Skin not owned' };
    
    gameData[playerKey].equipped = skinId;
    saveGameData();
    
    // Update bird color
    const bird = player === 1 ? p1.bird : p2.bird;
    const skin = SKIN_DATA[playerKey].find(s => s.id === skinId);
    if (skin) {
        bird.skinColor = skin.color;
    }
    
    return { success: true, message: 'Skin equipped!' };
}

// Get current skin for a player
function getCurrentSkin(player) {
    const playerKey = player === 1 ? 'player1' : 'player2';
    const equipped = gameData[playerKey].equipped;
    return SKIN_DATA[playerKey].find(s => s.id === equipped) || SKIN_DATA[playerKey][0];
}

// =====================
// SHOP UI
// =====================
const shopModal = document.getElementById('shopModal');
const shopItemsContainer = document.getElementById('shopItemsContainer');
const shopCloseBtn = document.getElementById('shopCloseBtn');
const shopBtn = document.getElementById('shopBtn');
let currentShopTab = 'player1';

// Render shop items
function renderShop() {
    const playerKey = currentShopTab;
    const skins = SKIN_DATA[playerKey];
    const playerNum = playerKey === 'player1' ? 1 : 2;
    const playerCoins = getPlayerCoins(playerNum);
    const playerName = playerNum === 1 ? 'Player 1' : 'Player 2';
    
    // Update shop title with player coins (gunakan gambar koin)
    const titleEl = document.querySelector('.shop-title');
    if (titleEl) {
        titleEl.innerHTML = `🛒 ${playerName}'s Shop <span style="display:inline-flex;align-items:center;gap:5px;font-size:20px;">
            <img src="koin.png" style="width:24px;height:24px;object-fit:contain;vertical-align:middle;"> ${playerCoins}
        </span>`;
    }
    
    shopItemsContainer.innerHTML = '';
    
    skins.forEach(skin => {
        const owned = ownsSkin(playerNum, skin.id);
        const equipped = isEquipped(playerNum, skin.id);
        const isDefault = skin.price === 0;
        const canAfford = playerCoins >= skin.price;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        if (owned) itemDiv.classList.add('owned');
        if (equipped) itemDiv.classList.add('equipped');
        
        let statusText = '';
        let statusClass = '';
        let buttonHTML = '';
        
        if (equipped) {
            statusText = '✓ Equipped';
            statusClass = 'status-equip';
            buttonHTML = `<button class="shop-buy-btn equipped" disabled>Equipped</button>`;
        } else if (owned) {
            statusText = 'Owned';
            statusClass = 'status-owned';
            buttonHTML = `<button class="shop-buy-btn available" data-action="equip" data-player="${playerNum}" data-skin="${skin.id}">Equip</button>`;
        } else {
            const priceDisplay = isDefault ? 'FREE' : `<span style="display:inline-flex;align-items:center;gap:3px;"><img src="koin.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;"> ${skin.price}</span>`;
            statusText = isDefault ? 'Free' : `${skin.price}`;
            statusClass = '';
            buttonHTML = `<button class="shop-buy-btn ${canAfford ? 'available' : 'locked'}" data-action="buy" data-player="${playerNum}" data-skin="${skin.id}" ${!canAfford ? 'disabled' : ''}>
                ${canAfford ? 'Buy' : `Need ${skin.price - playerCoins} more`}
            </button>`;
        }
        
        // Preview warna burung
        const previewColor = skin.color;
        
        itemDiv.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:8px;">
                <div style="width:30px; height:30px; border-radius:50%; background:${previewColor}; border:2px solid rgba(255,255,255,0.3);"></div>
                <span style="font-size:20px;">🐦</span>
            </div>
            <div class="shop-item-name">${skin.name}</div>
            <div class="shop-item-price">${isDefault ? 'FREE' : `<span style="display:inline-flex;align-items:center;gap:3px;"><img src="koin.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;"> ${skin.price}</span>`}</div>
            <div class="shop-item-status ${statusClass}">${statusText}</div>
            ${buttonHTML}
        `;
        
        shopItemsContainer.appendChild(itemDiv);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.dataset.action;
            const player = parseInt(this.dataset.player);
            const skinId = this.dataset.skin;
            
            if (action === 'buy') {
                const result = buySkin(player, skinId);
                if (result.success) {
                    renderShop();
                    updateBirdDisplay();
                } else {
                    alert(result.message);
                }
            } else if (action === 'equip') {
                const result = equipSkin(player, skinId);
                if (result.success) {
                    renderShop();
                    updateBirdDisplay();
                } else {
                    alert(result.message);
                }
            }
        });
    });
}

// Update bird display with current skins
function updateBirdDisplay() {
    // Update player 1
    const skin1 = getCurrentSkin(1);
    p1.bird.skinColor = skin1.color;
    
    // Update player 2
    const skin2 = getCurrentSkin(2);
    p2.bird.skinColor = skin2.color;
    
    // Update name displays
    const p1NameEl = document.getElementById('p1Name');
    const p2NameEl = document.getElementById('p2Name');
    if (p1NameEl) p1NameEl.textContent = `🐦 ${skin1.name}`;
    if (p2NameEl) p2NameEl.textContent = `🐦 ${skin2.name}`;
}

// Shop event listeners
if (shopBtn) {
    shopBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        shopModal.classList.add('active');
        renderShop();
    });
}

if (shopCloseBtn) {
    shopCloseBtn.addEventListener('click', function() {
        shopModal.classList.remove('active');
    });
}

// Close modal on outside click
shopModal.addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('active');
    }
});

// Shop tab switching
document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentShopTab = this.dataset.tab;
        renderShop();
    });
});

// =====================
// Global State
// =====================
let paused = false;
let muted = false;
let frameCount = 0;
let winnerDeclared = false;
let skyPhase = 0;
let musicStarted = false;

// Canvas dimensions
const W = 480;
const H = 640;

// =====================
// Player 1 State (Independent)
// =====================
let p1 = {
    bird: { 
        x: 80, 
        y: H/2, 
        width: 34, 
        height: 34, 
        vel: 0, 
        rot: 0, 
        wing: 0,
        skinColor: '#FF6B6B'
    },
    score: 0,
    over: false,
    pipes: [],
    particles: [],
    popups: [],
    pipeTimer: 0,
    groundX: 0,
    started: false,
    canPlay: true
};

// =====================
// Player 2 State (Independent)
// =====================
let p2 = {
    bird: { 
        x: 80, 
        y: H/2, 
        width: 34, 
        height: 34, 
        vel: 0, 
        rot: 0, 
        wing: 0,
        skinColor: '#4ECDC4'
    },
    score: 0,
    over: false,
    pipes: [],
    particles: [],
    popups: [],
    pipeTimer: 0,
    groundX: 0,
    started: false,
    canPlay: true
};

// =====================
// Game Constants
// =====================
const GRAVITY = 0.14;
const JUMP_FORCE = -4.0;
const BASE_PIPE_SPEED = 1.8;
const BASE_PIPE_INTERVAL = 160;
const BASE_GAP = 180;
const GROUND_TOP = H - 55;

// Difficulty functions
function getPipeSpeed() { 
    const avgScore = (p1.score + p2.score) / 2;
    return BASE_PIPE_SPEED + avgScore * 0.02; 
}

function getPipeGap() { 
    const avgScore = (p1.score + p2.score) / 2;
    return Math.max(180, BASE_GAP - avgScore * 1.5);
}

function getPipeInterval() { 
    const avgScore = (p1.score + p2.score) / 2;
    return Math.max(110, BASE_PIPE_INTERVAL - avgScore * 0.6);
}

// =====================
// Stars & Clouds
// =====================
let stars = [];
let clouds = [];

for (let i = 0; i < 60; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * H * 0.6, size: Math.random() * 2 + 0.5, twinkle: Math.random() * Math.PI * 2 });
}

for (let i = 0; i < 5; i++) {
    clouds.push({ x: Math.random() * W + i * 100, y: Math.random() * 120 + 40, size: Math.random() * 30 + 25, speed: Math.random() * 0.3 + 0.2, opacity: Math.random() * 0.3 + 0.2 });
}

// =====================
// Audio
// =====================
let audioCtx = null;
function getAudio() {
    if (!audioCtx) audioCtx = new (AudioContext || webkitAudioContext)();
    return audioCtx;
}

function playSound(type) {
    if (muted) return;
    try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === "jump") {
            osc.type = "sine";
            osc.frequency.value = 500;
            osc.frequency.exponentialRampToValue(800, 0.08);
            gain.gain.value = 0.12;
            gain.gain.exponentialRampToValue(0.001, 0.15);
            osc.start();
            osc.stop(0.15);
        } else if (type === "score") {
            osc.type = "sine";
            osc.frequency.value = 880;
            osc.frequency.exponentialRampToValue(1100, 0.08);
            gain.gain.value = 0.1;
            gain.gain.exponentialRampToValue(0.001, 0.2);
            osc.start();
            osc.stop(0.2);
        } else if (type === "hit") {
            osc.type = "square";
            osc.frequency.value = 150;
            osc.frequency.exponentialRampToValue(50, 0.3);
            gain.gain.value = 0.15;
            gain.gain.exponentialRampToValue(0.001, 0.3);
            osc.start();
            osc.stop(0.3);
        }
    } catch(e) {}
}

function playGameOverSound() {
    if (muted) return;
    if (winnerDeclared) return;
    if (gameOverSound) {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(err => {});
    }
}

function playWinnerSound() {
    if (muted) return;
    if (winnerSound) {
        winnerSound.currentTime = 0;
        winnerSound.play().catch(err => {});
    }
}

function startMusic() {
    if (musicStarted) return;
    if (!bgMusic) return;
    
    bgMusic.volume = 0.5;
    bgMusic.loop = true;
    
    bgMusic.play().catch(err => {});
    
    musicStarted = true;
}

function stopMusic() {
    if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
    musicStarted = false;
}

// =====================
// Particles & Popups
// =====================
function addParticles(arr, x, y, count, color) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vel = Math.random() * 3 + 1;
        arr.push({
            x, y,
            vx: Math.cos(angle) * vel,
            vy: Math.sin(angle) * vel,
            life: 40,
            size: Math.random() * 4 + 2,
            color: color
        });
    }
}

function updateParticles(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life--;
        if (p.life <= 0) arr.splice(i, 1);
    }
}

function drawParticles(ctx, arr) {
    for (const p of arr) {
        const alpha = p.life / 40;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function addPopup(arr, x, y, text) {
    arr.push({ x, y, text, life: 50, maxLife: 50 });
}

function updatePopups(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        arr[i].y -= 1.2;
        arr[i].life--;
        if (arr[i].life <= 0) arr.splice(i, 1);
    }
}

function drawPopups(ctx, arr) {
    for (const p of arr) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#FFD700";
        ctx.font = `bold ${18 + (1 - alpha) * 8}px Outfit, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
}

// =====================
// Drawing Functions
// =====================
function drawSky(ctx) {
    skyPhase += 0.0003;
    const cycle = (Math.sin(skyPhase) + 1) / 2;

    const dayTop = [135, 206, 235];
    const dayBot = [176, 224, 230];
    const nightTop = [15, 12, 41];
    const nightBot = [44, 42, 87];

    const topR = nightTop[0] + (dayTop[0] - nightTop[0]) * cycle;
    const topG = nightTop[1] + (dayTop[1] - nightTop[1]) * cycle;
    const topB = nightTop[2] + (dayTop[2] - nightTop[2]) * cycle;
    const botR = nightBot[0] + (dayBot[0] - nightBot[0]) * cycle;
    const botG = nightBot[1] + (dayBot[1] - nightBot[1]) * cycle;
    const botB = nightBot[2] + (dayBot[2] - nightBot[2]) * cycle;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgb(${topR},${topG},${topB})`);
    grad.addColorStop(1, `rgb(${botR},${botG},${botB})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    if (cycle < 0.6) {
        const starAlpha = Math.max(0, (0.6 - cycle) / 0.6);
        stars.forEach(s => {
            const twinkle = (Math.sin(frameCount * 0.03 + s.twinkle) + 1) / 2;
            ctx.globalAlpha = starAlpha * twinkle * 0.8;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
}

function drawClouds(ctx) {
    clouds.forEach(c => {
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 0.8, c.y - c.size * 0.2, c.size * 0.7, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 1.5, c.y, c.size * 0.85, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 0.4, c.y - c.size * 0.35, c.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function updateClouds() {
    clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x < -c.size * 3) {
            c.x = W + Math.random() * 80;
            c.y = Math.random() * 120 + 40;
        }
    });
}

function drawGround(ctx, groundX) {
    const dirtGrad = ctx.createLinearGradient(0, GROUND_TOP, 0, H);
    dirtGrad.addColorStop(0, "#5D4037");
    dirtGrad.addColorStop(1, "#3E2723");
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, GROUND_TOP, W, 55);

    const grassGrad = ctx.createLinearGradient(0, GROUND_TOP, 0, GROUND_TOP + 20);
    grassGrad.addColorStop(0, "#66BB6A");
    grassGrad.addColorStop(1, "#43A047");
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, GROUND_TOP, W, 20);

    ctx.fillStyle = "#81C784";
    for (let i = groundX; i < W + 48; i += 12) {
        ctx.beginPath();
        ctx.moveTo(i, GROUND_TOP);
        ctx.lineTo(i + 4, GROUND_TOP - 10);
        ctx.lineTo(i + 8, GROUND_TOP);
        ctx.fill();
    }

    ctx.fillStyle = "rgba(0,0,0,0.08)";
    for (let i = groundX; i < W + 48; i += 48) {
        ctx.fillRect(i, GROUND_TOP + 20, 24, 35);
        ctx.fillRect(i + 24, GROUND_TOP + 37, 24, 18);
    }
}

function createPipe(player) {
    const gap = getPipeGap();
    const minTop = 60;
    const maxTop = GROUND_TOP - gap - 60;
    const topHeight = Math.random() * (maxTop - minTop) + minTop;

    player.pipes.push({
        x: W + 10,
        width: 62,
        top: topHeight,
        bottom: topHeight + gap,
        scored: false
    });
}

function drawPipes(ctx, pipes) {
    pipes.forEach(pipe => {
        const bodyGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        bodyGrad.addColorStop(0, "#2E7D32");
        bodyGrad.addColorStop(0.3, "#4CAF50");
        bodyGrad.addColorStop(0.7, "#388E3C");
        bodyGrad.addColorStop(1, "#1B5E20");

        ctx.fillStyle = bodyGrad;
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipe.width, GROUND_TOP - pipe.bottom);

        const capW = pipe.width + 12;
        const capH = 26;
        const capX = pipe.x - 6;

        const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
        capGrad.addColorStop(0, "#388E3C");
        capGrad.addColorStop(0.3, "#66BB6A");
        capGrad.addColorStop(0.7, "#43A047");
        capGrad.addColorStop(1, "#2E7D32");

        ctx.fillStyle = capGrad;
        ctx.fillRect(capX, pipe.top - capH, capW, capH);
        ctx.fillRect(capX, pipe.bottom, capW, capH);

        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(pipe.x + 8, 0, 6, pipe.top - capH);
        ctx.fillRect(pipe.x + 8, pipe.bottom + capH, 6, GROUND_TOP - pipe.bottom - capH);

        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(pipe.x + pipe.width - 4, 0, 4, pipe.top - capH);
        ctx.fillRect(pipe.x + pipe.width - 4, pipe.bottom + capH, 4, GROUND_TOP - pipe.bottom - capH);
    });
}

// =====================
// DRAW BIRD (dengan skin color)
// =====================
function drawBird(ctx, bird, isPlayer1) {
    ctx.save();
    const cx = bird.x + bird.width / 2;
    const cy = bird.y + bird.height / 2;

    const targetRot = Math.min(Math.max(bird.vel * 4, -30), 70);
    bird.rot += (targetRot - bird.rot) * 0.12;
    ctx.translate(cx, cy);
    ctx.rotate(bird.rot * Math.PI / 180);

    bird.wing += 0.2;
    const wingY = Math.sin(bird.wing * 3) * 4;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(2, 3, 16, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body dengan warna skin
    const bodyColor = bird.skinColor || (isPlayer1 ? '#FF6B6B' : '#4ECDC4');
    const bodyGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
    bodyGrad.addColorStop(0, lightenColor(bodyColor, 30));
    bodyGrad.addColorStop(0.7, bodyColor);
    bodyGrad.addColorStop(1, darkenColor(bodyColor, 20));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = isPlayer1 ? "#FFB300" : "#FFA500";
    ctx.beginPath();
    ctx.ellipse(-6, 3 + wingY, 9, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(7, -4, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(8.5, -3.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(9.5, -5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#FF6D00";
    ctx.beginPath();
    ctx.moveTo(13, -1);
    ctx.lineTo(22, -3);
    ctx.lineTo(22, 3);
    ctx.lineTo(13, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Helper functions untuk manipulasi warna
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R},${G},${B})`;
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `rgb(${R},${G},${B})`;
}

// =====================
// Game Logic
// =====================
function updateBird(player) {
    if (paused) return;
    if (player.over) return;
    if (!player.started) return;
    
    player.bird.vel += GRAVITY;
    player.bird.y += player.bird.vel;
    
    if (player.bird.y < 0) {
        player.bird.y = 0;
        player.bird.vel = 0;
    }
    
    if (player.bird.y + player.bird.height >= GROUND_TOP) {
        if (!player.over) {
            player.over = true;
            player.bird.y = GROUND_TOP - player.bird.height;
            checkWinner();
            playSound("hit");
            playGameOverSound();
            addParticles(player.particles, player.bird.x + 17, player.bird.y + 17, 30, "#FF5722");
            addParticles(player.particles, player.bird.x + 17, player.bird.y + 17, 15, "#FFEB3B");
        }
    }
}

function updatePipes(player) {
    if (paused) return;
    if (player.over) return;
    if (!player.started) return;
    
    const speed = getPipeSpeed();

    for (let i = 0; i < player.pipes.length; i++) {
        const pipe = player.pipes[i];
        pipe.x -= speed;

        const hb = 4;
        if (player.bird.x + player.bird.width - hb > pipe.x && 
            player.bird.x + hb < pipe.x + pipe.width) {
            if (player.bird.y + hb < pipe.top || 
                player.bird.y + player.bird.height - hb > pipe.bottom) {
                if (!player.over) {
                    player.over = true;
                    checkWinner();
                    playSound("hit");
                    playGameOverSound();
                    addParticles(player.particles, player.bird.x + 17, player.bird.y + 17, 30, "#FF5722");
                    addParticles(player.particles, player.bird.x + 17, player.bird.y + 17, 15, "#FFEB3B");
                }
            }
        }

        if (!pipe.scored && pipe.x + pipe.width < player.bird.x) {
            pipe.scored = true;
            player.score++;
            
            if (player === p1) p1ScoreEl.textContent = player.score;
            else p2ScoreEl.textContent = player.score;
            
            addPopup(player.popups, player.bird.x, player.bird.y - 20, "+1");
            playSound("score");
            
            const pipeCenter = pipe.x + pipe.width / 2;
            const gapCenter = (pipe.top + pipe.bottom) / 2;
            addParticles(player.particles, pipeCenter, gapCenter, 8, "#FFD700");
        }
    }
    
    player.pipes = player.pipes.filter(p => p.x + p.width > -20);
}

function jump(player, isPlayer1) {
    if (!musicStarted) {
        startMusic();
    }
    
    if (!player.started) {
        player.started = true;
        player.bird.vel = JUMP_FORCE;
        player.bird.wing = 0;
        addParticles(player.particles, player.bird.x, player.bird.y + player.bird.height, 4, "rgba(255,255,255,0.5)");
        playSound("jump");
        return;
    }
    
    if (paused) return;
    if (player.over) return;
    
    player.bird.vel = JUMP_FORCE;
    player.bird.wing = 0;
    addParticles(player.particles, player.bird.x, player.bird.y + player.bird.height, 4, "rgba(255,255,255,0.5)");
    playSound("jump");
}

function checkWinner() {
    if (winnerDeclared) return;
    
    if (p1.over && p2.over) {
        let winnerText = "";
        let winnerColor = "";
        
        if (p1.score > p2.score) {
            winnerText = "PLAYER 1 WINS! 🏆";
            winnerColor = "#FF6B6B";
            playWinnerSound();
            // Player 1 earns coins
            earnCoins(1, p1.score);
        } else if (p2.score > p1.score) {
            winnerText = "PLAYER 2 WINS! 🏆";
            winnerColor = "#4ECDC4";
            playWinnerSound();
            // Player 2 earns coins
            earnCoins(2, p2.score);
        } else {
            winnerText = "DRAW! 🤝";
            winnerColor = "#FFD700";
            // Both players earn coins
            earnCoins(1, p1.score);
            earnCoins(2, p2.score);
        }
        
        showWinner(winnerText, winnerColor);
        winnerDeclared = true;
        stopMusic();
    }
}

function showWinner(text, color) {
    winnerBanner.textContent = text;
    winnerBanner.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
    winnerBanner.classList.remove("hidden");
    setTimeout(() => winnerBanner.classList.add("hidden"), 3000);
}

function restart() {
    // Save current skins
    const skin1 = getCurrentSkin(1);
    const skin2 = getCurrentSkin(2);
    
    p1 = {
        bird: { 
            x: 80, 
            y: H/2, 
            width: 34, 
            height: 34, 
            vel: 0, 
            rot: 0, 
            wing: 0,
            skinColor: skin1.color
        },
        score: 0,
        over: false,
        pipes: [],
        particles: [],
        popups: [],
        pipeTimer: 0,
        groundX: 0,
        started: false,
        canPlay: true
    };
    
    p2 = {
        bird: { 
            x: 80, 
            y: H/2, 
            width: 34, 
            height: 34, 
            vel: 0, 
            rot: 0, 
            wing: 0,
            skinColor: skin2.color
        },
        score: 0,
        over: false,
        pipes: [],
        particles: [],
        popups: [],
        pipeTimer: 0,
        groundX: 0,
        started: false,
        canPlay: true
    };
    
    p1ScoreEl.textContent = "0";
    p2ScoreEl.textContent = "0";
    paused = false;
    winnerDeclared = false;
    winnerBanner.classList.add("hidden");
    
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
    musicStarted = false;
    
    if (gameOverSound) {
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
    }
    if (winnerSound) {
        winnerSound.pause();
        winnerSound.currentTime = 0;
    }
    
    updateBirdDisplay();
}

// =====================
// Draw Player Game
// =====================
function drawGame(ctx, player, isPlayer1) {
    drawSky(ctx);
    drawClouds(ctx);
    
    if (!paused && !player.over && player.started) {
        player.pipeTimer++;
        const interval = getPipeInterval();
        if (player.pipeTimer >= interval) {
            createPipe(player);
            player.pipeTimer = 0;
        }
    }
    
    if (!paused && !player.over && player.started) {
        player.groundX -= getPipeSpeed();
        if (player.groundX <= -48) player.groundX += 48;
    }
    
    drawPipes(ctx, player.pipes);
    drawGround(ctx, player.groundX);
    drawBird(ctx, player.bird, isPlayer1);
    
    updateParticles(player.particles);
    drawParticles(ctx, player.particles);
    updatePopups(player.popups);
    drawPopups(ctx, player.popups);
    
    if (player.over && !winnerDeclared) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 28px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", W/2, H/2 - 30);
        ctx.fillStyle = "#FFD700";
        ctx.font = "22px Outfit, sans-serif";
        ctx.fillText("Score: " + player.score, W/2, H/2 + 20);
    }
    
    if (!player.started && !player.over) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 24px Outfit, sans-serif";
        ctx.textAlign = "center";
        if (isPlayer1) {
            ctx.fillText("PRESS SPACE", W/2, H/2 - 20);
            ctx.font = "16px Outfit, sans-serif";
            ctx.fillStyle = "#aaa";
            ctx.fillText("or click/tap", W/2, H/2 + 20);
        } else {
            ctx.fillText("PRESS ↑", W/2, H/2 - 20);
            ctx.font = "16px Outfit, sans-serif";
            ctx.fillStyle = "#aaa";
            ctx.fillText("(UP ARROW)", W/2, H/2 + 10);
            ctx.fillText("or click/tap", W/2, H/2 + 40);
        }
    }
    
    if (paused && (player.started || player.over)) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 32px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⏸ PAUSED", W/2, H/2);
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Outfit, sans-serif";
        ctx.fillText("Press P to resume", W/2, H/2 + 50);
    }
}

// =====================
// Event Listeners
// =====================
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        jump(p1, true);
    } else if (e.code === "ArrowUp") {
        e.preventDefault();
        jump(p2, false);
    } else if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        if ((p1.started || p2.started) && !winnerDeclared) {
            paused = !paused;
        }
    } else if (e.code === "KeyR") {
        e.preventDefault();
        restart();
    } else if (e.code === "KeyM") {
        e.preventDefault();
        muted = !muted;
        muteBtn.textContent = muted ? "🔇" : "🔊";
        if (!muted && !musicStarted) {
            startMusic();
        }
    }
});

canvasP1.addEventListener("click", () => {
    if (!musicStarted) startMusic();
    jump(p1, true);
});

canvasP2.addEventListener("click", () => {
    if (!musicStarted) startMusic();
    jump(p2, false);
});

canvasP1.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!musicStarted) startMusic();
    jump(p1, true);
}, { passive: false });

canvasP2.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!musicStarted) startMusic();
    jump(p2, false);
}, { passive: false });

restartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    restart();
});

if (menuBtn) {
    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (bgMusic) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }
        if (gameOverSound) {
            gameOverSound.pause();
            gameOverSound.currentTime = 0;
        }
        if (winnerSound) {
            winnerSound.pause();
            winnerSound.currentTime = 0;
        }
        
        window.location.href = 'index.html';
    });
}

muteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    muted = !muted;
    muteBtn.textContent = muted ? "🔇" : "🔊";
    if (!muted && !musicStarted) {
        startMusic();
    }
});

// Auto-start music on any document click
document.addEventListener("click", () => {
    if (!musicStarted && !muted) {
        startMusic();
    }
});

document.addEventListener("keydown", () => {
    if (!musicStarted && !muted) {
        startMusic();
    }
});

// =====================
// Initialize
// =====================
loadGameData();
updateCoinsDisplay();
updateBirdDisplay();

// =====================
// Game Loop
// =====================
function loop() {
    frameCount++;
    
    updateClouds();
    
    updateBird(p1);
    updateBird(p2);
    updatePipes(p1);
    updatePipes(p2);
    
    drawGame(ctxP1, p1, true);
    drawGame(ctxP2, p2, false);
    
    requestAnimationFrame(loop);
}

loop();

console.log("Multiplayer game loaded with Skin Shop!");
console.log("Each player has their own coins!");
console.log("Press SPACE or UP ARROW to start!");
console.log("Click SHOP button to buy and equip skins!");
console.log("Earn coins by playing games!");