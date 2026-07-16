    // ================================================
    // FLAPPY BIRD — PREMIUM EDITION
    // Full game engine with particles, sound, effects
    // ================================================


    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    canvas.width = 1000;
    canvas.height = 600;

    // DOM refs
    const scoreText = document.getElementById("score");
    const highScoreText = document.getElementById("highScore");
    const comboText = document.getElementById("combo");
    const gameOverPanel = document.getElementById("gameOver");
    const startOverlay = document.getElementById("startOverlay");
    const pauseOverlay = document.getElementById("pauseOverlay");
    const finalScoreEl = document.getElementById("finalScore");
    const finalBestEl = document.getElementById("finalBest");
    const finalComboEl = document.getElementById("finalCombo");
    const totalGamesEl = document.getElementById("totalGames");
    const newBestBadge = document.getElementById("newBestBadge");
    const muteBtn = document.getElementById("muteBtn");
    const levelText = document.getElementById("level");
    const bgMusic = document.getElementById("bgMusic");
    const gameOverMusic = document.getElementById("gameOverMusic");
    const milestoneAudio = document.getElementById("milestoneAudio");
    const skinEmoji = document.getElementById("skinEmoji");
    const skinNameEl = document.getElementById("skinName");
    const medalDisplay = document.getElementById("medalDisplay");
    const medalIcon = document.getElementById("medalIcon");
    const medalText = document.getElementById("medalText");

    // =====================
    // GAME STATE
    // =====================
    let gameStart = false;
    let gameOver = false;
    let paused = false;
    let muted = false;
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let totalGames = Number(localStorage.getItem("flappyTotalGames")) || 0;
    let highScore = Number(localStorage.getItem("flappyHighScore")) || 0;
    let frameCount = 0;
    let lastTime = 0;
    let shakeTimer = 0;
    let shakeIntensity = 0;
    let skyPhase = 0;
    let foods = [];
    let doubleScore = false;

    // =====================
    // BIRD SKIN SYSTEM
    // =====================
    const BIRD_SKINS = {
        eagle: {
            name: "Eagle", emoji: "🦅",
            bodyInner: "#FFE082", bodyMid: "#FFB300", bodyOuter: "#E65100",
            wing: "#6D4C41", head: "#FFCC80", beak: "#FF6F00", beakDark: "#E65100",
            tail: "#5D4037", particle: "rgba(255,200,0,0.5)"
        },
        phoenix: {
            name: "Phoenix", emoji: "🔥",
            bodyInner: "#FFCDD2", bodyMid: "#EF5350", bodyOuter: "#B71C1C",
            wing: "#D32F2F", head: "#FFAB91", beak: "#FF6E40", beakDark: "#DD2C00",
            tail: "#BF360C", particle: "rgba(255,100,0,0.5)"
        },
        ice: {
            name: "Ice Bird", emoji: "🧊",
            bodyInner: "#E0F7FA", bodyMid: "#4DD0E1", bodyOuter: "#006064",
            wing: "#0097A7", head: "#B2EBF2", beak: "#00BCD4", beakDark: "#00838F",
            tail: "#00695C", particle: "rgba(0,229,255,0.5)"
        },
        parrot: {
            name: "Parrot", emoji: "🦜",
            bodyInner: "#C8E6C9", bodyMid: "#66BB6A", bodyOuter: "#1B5E20",
            wing: "#43A047", head: "#A5D6A7", beak: "#FFC107", beakDark: "#FF8F00",
            tail: "#2E7D32", particle: "rgba(100,255,100,0.5)"
        },
        shadow: {
            name: "Shadow Raven", emoji: "🌑",
            bodyInner: "#CE93D8", bodyMid: "#7B1FA2", bodyOuter: "#311B92",
            wing: "#4A148C", head: "#E1BEE7", beak: "#EA80FC", beakDark: "#AA00FF",
            tail: "#1A237E", particle: "rgba(200,100,255,0.5)"
        }
    };

    const skinKeys = Object.keys(BIRD_SKINS);
    let currentSkinIndex = Math.max(0, skinKeys.indexOf(localStorage.getItem("flappySkin") || "eagle"));
    let currentSkin = BIRD_SKINS[skinKeys[currentSkinIndex]];

    function updateSkinUI() {
        if (skinEmoji) skinEmoji.textContent = currentSkin.emoji;
        if (skinNameEl) skinNameEl.textContent = currentSkin.name;
    }
    updateSkinUI();

    function nextSkin() {
        currentSkinIndex = (currentSkinIndex + 1) % skinKeys.length;
        currentSkin = BIRD_SKINS[skinKeys[currentSkinIndex]];
        localStorage.setItem("flappySkin", skinKeys[currentSkinIndex]);
        updateSkinUI();
    }

    function prevSkin() {
        currentSkinIndex = (currentSkinIndex - 1 + skinKeys.length) % skinKeys.length;
        currentSkin = BIRD_SKINS[skinKeys[currentSkinIndex]];
        localStorage.setItem("flappySkin", skinKeys[currentSkinIndex]);
        updateSkinUI();
    }

    highScoreText.textContent = highScore;



    function startMusic() {
        bgMusic.volume = 0.5;
        bgMusic.play().catch(err => {
            console.log("Autoplay blocked:", err);
        });
    }

    // aktifkan saat user pertama kali interaksi
    document.addEventListener("click", startMusic, { once: true });
    document.addEventListener("keydown", startMusic, { once: true });

    // =====================
    // LEVEL SYSTEM
    // =====================

    let level = 1;

    const levelSettings = {
    1: {
        gravity: 0.14,
        jump: -4.0,
        pipeSpeed: 1.8,
        gap: 180,
        interval: 160
    },

    2: {
        gravity: 0.16,
        jump: -4.5,
        pipeSpeed: 2.3,
        gap: 170,
        interval: 150
    },

    3: {
        gravity: 0.18,
        jump: -5.0,
        pipeSpeed: 2.8,
        gap: 160,
        interval: 140
    },

    4: {
        gravity: 0.20,
        jump: -5.5,
        pipeSpeed: 3.3,
        gap: 145,
        interval: 130
    },

    5: {
        gravity: 0.22,
        jump: -6.0,
        pipeSpeed: 4.0,
        gap: 130,
        interval: 120
    }
};

    // =====================
    // LEVEL THEMES
    // =====================
    const LEVEL_THEMES = {
        1: { skyTop: [135, 206, 235], skyBot: [176, 224, 230], mountBase: [100, 160, 120], mountFar: [120, 180, 140] },
        2: { skyTop: [255, 150, 60],  skyBot: [180, 80, 140],  mountBase: [140, 90, 60],   mountFar: [160, 110, 80] },
        3: { skyTop: [15, 20, 60],    skyBot: [30, 35, 80],    mountBase: [30, 40, 70],    mountFar: [50, 60, 90] },
        4: { skyTop: [10, 80, 90],    skyBot: [20, 130, 110],  mountBase: [20, 80, 70],    mountFar: [40, 110, 95] },
        5: { skyTop: [80, 10, 10],    skyBot: [40, 5, 5],      mountBase: [80, 20, 20],    mountFar: [100, 40, 30] }
    };

    let prevTheme = LEVEL_THEMES[1];
    let currTheme = LEVEL_THEMES[1];
    let themeT = 1.0;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function lerpColor(c1, c2, t) {
        return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
    }

    // gravity & jumpForce are mutable, driven by current level
    let gravity = levelSettings[level].gravity;
    let jumpForce = levelSettings[level].jump;
    let pipeSpeed = levelSettings[level].pipeSpeed;
    let pipeGap = levelSettings[level].gap;
    let pipeInterval = levelSettings[level].interval;

    // =====================
    // LEVEL UP ANIMATION
    // =====================
    let levelUpTimer = 0;
    let levelUpText = "";
    let levelUpFlash = 0;

    function triggerLevelUp(lvl) {
        const names = { 1: "LEVEL 1", 2: "LEVEL 2", 3: "LEVEL 3", 4: "LEVEL 4", 5: "⚡ HARDCORE ⚡" };
        levelUpText = names[lvl] || "LEVEL UP";
        levelUpTimer = 90;
        levelUpFlash = 1.0;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        spawnParticles(cx, cy, 20, "#FFD700", 5, 40);
        spawnParticles(cx, cy, 15, "#00E5FF", 4, 35);

        shakeTimer = 8;
        shakeIntensity = 4;

        playSound("milestone");
    }

    function setLevel(newLevel) {
    if (newLevel === level) return;

    level = newLevel;

    gravity = levelSettings[level].gravity;
    jumpForce = levelSettings[level].jump;

    pipeSpeed = levelSettings[level].pipeSpeed;
    pipeGap = levelSettings[level].gap;
    pipeInterval = levelSettings[level].interval;

    if (level === 5) {
    shakeIntensity = 2;
}

    const levelNames = {
        1: " 1",
        2: " 2",
        3: " 3",
        4: " 4",
        5: "HARDCORE"
    };

    if (levelText) {
        levelText.textContent = levelNames[level];
}

    // Theme transition — snapshot current visual state, then lerp to new theme
    const snapTop = lerpColor(prevTheme.skyTop, currTheme.skyTop, themeT);
    const snapBot = lerpColor(prevTheme.skyBot, currTheme.skyBot, themeT);
    const snapMB = lerpColor(prevTheme.mountBase, currTheme.mountBase, themeT);
    const snapMF = lerpColor(prevTheme.mountFar, currTheme.mountFar, themeT);
    prevTheme = { skyTop: snapTop, skyBot: snapBot, mountBase: snapMB, mountFar: snapMF };
    currTheme = LEVEL_THEMES[level];
    themeT = 0;

    // Level up animation
    triggerLevelUp(level);
}

    function getPipeSpeed() {
        return pipeSpeed;
    }

    function getPipeGap() {
        return pipeGap;
    }

    function getPipeInterval() {
        return pipeInterval;
    }

    // =====================
    // BIRD
    // =====================
    let bird = { x: 80, y: 280, width: 34, height: 34, velocity: 0, rotation: 0, flapFrame: 0 };

    // =====================
    // TRAIL SYSTEM
    // =====================
    let birdTrail = [];
    const TRAIL_LENGTH = 6;

    // =====================
    // WORLD
    // =====================
    let pipes = [];
    let particles = [];
    let scorePopups = [];
    let stars = [];
    let clouds = [];
    let groundX = 0;
    let pipeTimer = 0;

    for (let i = 0; i < 60; i++) {
        stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.6, size: Math.random() * 2 + 0.5, twinkle: Math.random() * Math.PI * 2 });
    }

    for (let i = 0; i < 5; i++) {
        clouds.push({ x: Math.random() * canvas.width + i * 100, y: Math.random() * 120 + 40, size: Math.random() * 30 + 25, speed: Math.random() * 0.3 + 0.2, opacity: Math.random() * 0.3 + 0.2 });
    }

    // =====================
    // AUDIO (Web Audio API)
    // =====================
    let audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        return audioCtx;
    }

    function playSound(type) {
        if (muted) return;
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === "jump") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(500, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === "score") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
            } else if (type === "hit") {
                osc.type = "square";
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            } else if (type === "milestone") {
                osc.type = "triangle";

                osc.frequency.setValueAtTime(660, ctx.currentTime);
                osc.frequency.setValueAtTime(990, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.2);

                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) { /* audio not supported */ }
    }

    function createFood(pipe) {
    const gapCenterY = (pipe.top + pipe.bottom) / 2;

    foods.push({
        x: pipe.x + pipe.width / 2,
        y: gapCenterY,
        size: 14,
        taken: false
    });
}

    // =====================
    // PARTICLE SYSTEM
    // =====================
    function spawnParticles(x, y, count, color, speed, life) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const vel = Math.random() * speed + 1;
            particles.push({
                x, y, vx: Math.cos(angle) * vel, vy: Math.sin(angle) * vel,
                life: life || 40, maxLife: life || 40,
                size: Math.random() * 4 + 2, color
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {
        particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // =====================
    // SCORE POPUPS
    // =====================
    function addScorePopup(x, y, text) {
        scorePopups.push({ x, y, text, life: 50, maxLife: 50 });
    }

    function updateScorePopups() {
        for (let i = scorePopups.length - 1; i >= 0; i--) {
            scorePopups[i].y -= 1.2;
            scorePopups[i].life--;
            if (scorePopups[i].life <= 0) scorePopups.splice(i, 1);
        }
    }

    function drawScorePopups() {
        scorePopups.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#FFD700";
            ctx.font = `bold ${18 + (1 - alpha) * 8}px Outfit, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(p.text, p.x, p.y);
        });
        ctx.globalAlpha = 1;
    }

    // =====================
    // SKY & BACKGROUND (Theme-aware)
    // =====================
    function drawSky() {
        // Advance theme transition
        if (themeT < 1.0) themeT = Math.min(1.0, themeT + 0.015);

        const top = lerpColor(prevTheme.skyTop, currTheme.skyTop, themeT);
        const bot = lerpColor(prevTheme.skyBot, currTheme.skyBot, themeT);

        // Subtle pulse variation
        skyPhase += 0.002;
        const pulse = Math.sin(skyPhase) * 6;

        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, `rgb(${Math.round(Math.max(0, top[0] + pulse))},${Math.round(Math.max(0, top[1] + pulse))},${Math.round(Math.max(0, top[2] + pulse))})`);
        grad.addColorStop(1, `rgb(${Math.round(Math.max(0, bot[0]))},${Math.round(Math.max(0, bot[1]))},${Math.round(Math.max(0, bot[2]))})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars visible when sky is dark
        const brightness = (top[0] + top[1] + top[2]) / 3;
        if (brightness < 130) {
            const starAlpha = Math.max(0, (130 - brightness) / 130);
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

    // =====================
    // MOUNTAINS (Theme-aware parallax)
    // =====================
    function drawMountains() {
        const mb = lerpColor(prevTheme.mountBase, currTheme.mountBase, themeT);
        const mf = lerpColor(prevTheme.mountFar, currTheme.mountFar, themeT);

        ctx.fillStyle = `rgba(${Math.round(mb[0])},${Math.round(mb[1])},${Math.round(mb[2])},0.5)`;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 50);
        for (let x = 0; x <= canvas.width; x += 60) {
            const h = Math.sin(x * 0.008 + frameCount * 0.0003) * 60 + 80;
            ctx.lineTo(x, canvas.height - 50 - h);
        }
        ctx.lineTo(canvas.width, canvas.height - 50);
        ctx.fill();

        ctx.fillStyle = `rgba(${Math.round(mf[0])},${Math.round(mf[1])},${Math.round(mf[2])},0.35)`;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 50);
        for (let x = 0; x <= canvas.width; x += 40) {
            const h = Math.sin(x * 0.012 + frameCount * 0.0006 + 2) * 40 + 50;
            ctx.lineTo(x, canvas.height - 50 - h);
        }
        ctx.lineTo(canvas.width, canvas.height - 50);
        ctx.fill();
    }

    // =====================
    // CLOUDS
    // =====================
    function drawClouds() {
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
                c.x = canvas.width + Math.random() * 80;
                c.y = Math.random() * 120 + 40;
            }
        });
    }

    // =====================
    // GROUND
    // =====================
    function drawGround() {
        if (gameStart && !gameOver && !paused) groundX -= getPipeSpeed();
        if (groundX <= -48) groundX += 48;

        const dirtGrad = ctx.createLinearGradient(0, canvas.height - 55, 0, canvas.height);
        dirtGrad.addColorStop(0, "#5D4037");
        dirtGrad.addColorStop(1, "#3E2723");
        ctx.fillStyle = dirtGrad;
        ctx.fillRect(0, canvas.height - 55, canvas.width, 55);

        const grassGrad = ctx.createLinearGradient(0, canvas.height - 55, 0, canvas.height - 35);
        grassGrad.addColorStop(0, "#66BB6A");
        grassGrad.addColorStop(1, "#43A047");
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, canvas.height - 55, canvas.width, 20);

        ctx.fillStyle = "#81C784";
        for (let i = groundX; i < canvas.width + 48; i += 12) {
            ctx.beginPath();
            ctx.moveTo(i, canvas.height - 55);
            ctx.lineTo(i + 4, canvas.height - 65);
            ctx.lineTo(i + 8, canvas.height - 55);
            ctx.fill();
        }

        ctx.fillStyle = "rgba(0,0,0,0.08)";
        for (let i = groundX; i < canvas.width + 48; i += 48) {
            ctx.fillRect(i, canvas.height - 35, 24, 35);
            ctx.fillRect(i + 24, canvas.height - 18, 24, 18);
        }
    }


    //ADD FOODS
    function drawFoods() {
        foods.forEach(f => {
            if (f.taken) return;

            // glow effect
            ctx.save();
            ctx.shadowColor = "#FFD54F";
            ctx.shadowBlur = 15;

            ctx.fillStyle = "#FFB300";
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();

            // highlight
            ctx.fillStyle = "#FFF176";
            ctx.beginPath();
            ctx.arc(f.x - 3, f.y - 3, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    //COLLOSION FOODS   
    function updateFoods() {
    foods.forEach(f => {
        if (f.taken) return;

        const dx = bird.x + bird.width/2 - f.x;
        const dy = bird.y + bird.height/2 - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 18) {
            f.taken = true;

            doubleScore = true; // BOOST ACTIVE

            spawnParticles(f.x, f.y, 25, "#FFD54F", 3, 30);
        }
    });

    foods = foods.filter(f => !f.taken);
}

    // =====================
    // PIPES (3D styled)
    // =====================
    function createPipe() {
        const gap = getPipeGap();
        const minTop = 60;
        const maxTop = canvas.height - 55 - gap - 60;
        const topHeight = Math.random() * (maxTop - minTop) + minTop;

        pipes.push({
            x: canvas.width + 10,
            width: 62,
            top: topHeight,
            bottom: topHeight + gap,
            passed: false,
            scored: false
        });



        // chance spawn food 50%
        if (Math.random() < 0.9) {
            createFood(pipes[pipes.length - 1]);
        }
    }

    function drawPipes() {
        pipes.forEach(pipe => {
            const bodyGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
            bodyGrad.addColorStop(0, "#2E7D32");
            bodyGrad.addColorStop(0.3, "#4CAF50");
            bodyGrad.addColorStop(0.7, "#388E3C");
            bodyGrad.addColorStop(1, "#1B5E20");

            ctx.fillStyle = bodyGrad;
            ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
            ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom - 55);

            const capW = pipe.width + 12;
            const capH = 26;
            const capX = pipe.x - 6;

            const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
            capGrad.addColorStop(0, "#388E3C");
            capGrad.addColorStop(0.3, "#66BB6A");
            capGrad.addColorStop(0.7, "#43A047");
            capGrad.addColorStop(1, "#2E7D32");

            ctx.fillStyle = capGrad;
            ctx.beginPath();
            ctx.roundRect(capX, pipe.top - capH, capW, capH, [4, 4, 0, 0]);
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(capX, pipe.bottom, capW, capH, [0, 0, 4, 4]);
            ctx.fill();

            ctx.fillStyle = "rgba(255,255,255,0.12)";
            ctx.fillRect(pipe.x + 8, 0, 6, pipe.top - capH);
            ctx.fillRect(pipe.x + 8, pipe.bottom + capH, 6, canvas.height - pipe.bottom - 55 - capH);

            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.fillRect(pipe.x + pipe.width - 4, 0, 4, pipe.top - capH);
            ctx.fillRect(pipe.x + pipe.width - 4, pipe.bottom + capH, 4, canvas.height - pipe.bottom - 55 - capH);
        });
    }

    // =====================
    // TRAIL EFFECT
    // =====================
    function updateTrail() {
        if (!gameStart || gameOver) return;
        birdTrail.push({ x: bird.x, y: bird.y, rotation: bird.rotation, flapFrame: bird.flapFrame });
        if (birdTrail.length > TRAIL_LENGTH) birdTrail.shift();
    }

    function drawTrail() {
        if (birdTrail.length < 2) return;

        birdTrail.forEach((t, i) => {
            const alpha = (i / birdTrail.length) * 0.2;
            ctx.save();
            ctx.globalAlpha = alpha;

            const cx = t.x + bird.width / 2;
            const cy = t.y + bird.height / 2;
            ctx.translate(cx, cy);
            ctx.rotate(t.rotation * Math.PI / 180);

            // Simplified silhouette for trail
            const bodyGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 18);
            bodyGrad.addColorStop(0, currentSkin.bodyInner);
            bodyGrad.addColorStop(1, currentSkin.bodyOuter);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
        ctx.globalAlpha = 1;
    }

    // =====================
    // BIRD (Skin-aware)
    // =====================
    function drawBird() {
        ctx.save();

        const cx = bird.x + bird.width / 2;
        const cy = bird.y + bird.height / 2;

        const targetRot = Math.min(Math.max(bird.velocity * 4, -35), 75);
        bird.rotation += (targetRot - bird.rotation) * 0.12;

        ctx.translate(cx, cy);
        ctx.rotate(bird.rotation * Math.PI / 180);

        if (gameStart && !gameOver && frameCount % 3 === 0) {
            spawnParticles(cx - 10, cy, 1, currentSkin.particle, 1, 18);
        }

        bird.flapFrame += 0.25;
        const wingFlap = Math.sin(bird.flapFrame * 3) * 6;

        /* =========================
        SHADOW (biar realistis)
        ========================= */
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(2, 10, 18, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        /* =========================
        BODY
        ========================= */
        const bodyGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 18);
        bodyGrad.addColorStop(0, currentSkin.bodyInner);
        bodyGrad.addColorStop(0.5, currentSkin.bodyMid);
        bodyGrad.addColorStop(1, currentSkin.bodyOuter);

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        /* =========================
        WINGS
        ========================= */
        ctx.fillStyle = currentSkin.wing;

        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.lineTo(-18, -8 + wingFlap);
        ctx.lineTo(-10, 2);
        ctx.lineTo(-18, 10 + wingFlap);
        ctx.closePath();
        ctx.fill();

        /* =========================
        HEAD
        ========================= */
        ctx.fillStyle = currentSkin.head;
        ctx.beginPath();
        ctx.arc(9, -3, 7, 0, Math.PI * 2);
        ctx.fill();

        /* =========================
        BEAK
        ========================= */
        ctx.fillStyle = currentSkin.beak;
        ctx.beginPath();
        ctx.moveTo(14, -2);
        ctx.lineTo(24, 0);
        ctx.lineTo(14, 4);
        ctx.lineTo(18, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = currentSkin.beakDark;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(20, 1);
        ctx.stroke();

        /* =========================
        EYE (tajam)
        ========================= */
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(10, -5, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(11, -4, 2.2, 0, Math.PI * 2);
        ctx.fill();

        /* highlight mata biar "killer look" */
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(12, -6, 0.8, 0, Math.PI * 2);
        ctx.fill();

        /* =========================
        TAIL
        ========================= */
        ctx.fillStyle = currentSkin.tail;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(-28, -6);
        ctx.lineTo(-26, 0);
        ctx.lineTo(-28, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // =====================
    // UPDATE FUNCTIONS
    // =====================
    function updateBird() {
        if (!gameStart || paused) return;
        bird.velocity += gravity;
        bird.y += bird.velocity;
        if (bird.y < 0) { bird.y = 0; bird.velocity = 0; }
        if (bird.y + bird.height > canvas.height - 55) {
            bird.y = canvas.height - 55 - bird.height;
            endGame();
        }
    }

    function updatePipes() {
        if (!gameStart || paused) return;
        const speed = getPipeSpeed();

        pipes.forEach(pipe => {
            pipe.x -= speed;

            const hb = 4;
            if (bird.x + bird.width - hb > pipe.x && bird.x + hb < pipe.x + pipe.width) {
                if (bird.y + hb < pipe.top || bird.y + bird.height - hb > pipe.bottom) {
                    endGame();
                }
            }

            if (!pipe.scored && pipe.x + pipe.width < bird.x) {
                pipe.scored = true;
                if (doubleScore) {
                    score += 2;
                    doubleScore = false; // habis sekali pakai
                } else {
                    score++;
                }

                if (score % 5 === 0) {
                    milestoneAudio.currentTime = 0;
                    milestoneAudio.play().catch(err => {
                        console.log("Audio blocked:", err);
                    });
                }

                // Level progression based on score
                let newLevel = 1;
                if (score >= 60) newLevel = 5;
                else if (score >= 45) newLevel = 4;
                else if (score >= 30) newLevel = 3;
                else if (score >= 15) newLevel = 2;

                setLevel(newLevel);

                combo++;
                if (combo > maxCombo) maxCombo = combo;

                scoreText.textContent = score;
                comboText.textContent = combo > 1 ? `x${combo}` : "x0";

                const popText = combo > 4 ? `+1 🔥x${combo}` : "+1";
                addScorePopup(bird.x, bird.y - 20, popText);

                const pipeCenter = pipe.x + pipe.width / 2;
                const gapCenter = (pipe.top + pipe.bottom) / 2;
                spawnParticles(pipeCenter, gapCenter, 8, "#FFD700", 3, 30);

                if (combo > 2) spawnParticles(pipeCenter, gapCenter, 5, "#00E5FF", 2, 25);

                playSound("score");
            }
        });

        pipes = pipes.filter(p => p.x + p.width > -20);
    }

    // =====================
    // LEVEL UP EFFECT (Canvas)
    // =====================
    function drawLevelUpEffect() {
        if (levelUpTimer <= 0) return;
        levelUpTimer--;

        // Flash overlay
        if (levelUpFlash > 0) {
            ctx.globalAlpha = levelUpFlash * 0.3;
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            levelUpFlash -= 0.04;
            ctx.globalAlpha = 1;
        }

        // Text animation
        const totalFrames = 90;
        const progress = 1 - (levelUpTimer / totalFrames);
        const scale = progress < 0.15 ? (progress / 0.15) : 1;
        const alpha = levelUpTimer / totalFrames;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(canvas.width / 2, canvas.height / 2 - 40);
        ctx.scale(scale, scale);

        // Glow
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 52px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(levelUpText, 0, 0);

        // Outline
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2;
        ctx.strokeText(levelUpText, 0, 0);

        ctx.restore();
        ctx.globalAlpha = 1;
    }

    // =====================
    // PROGRESS BAR (Canvas)
    // =====================
    function drawProgressBar() {
        if (!gameStart || gameOver) return;

        const levelThresholds = [0, 15, 30, 45, 60];
        const currentThreshold = levelThresholds[level - 1] || 0;
        const nextThreshold = levelThresholds[level] || (currentThreshold + 15);

        let progress;
        if (level >= 5) {
            progress = 1.0;
        } else {
            progress = Math.min(1, (score - currentThreshold) / (nextThreshold - currentThreshold));
        }

        const barWidth = 200;
        const barHeight = 6;
        const barX = canvas.width / 2 - barWidth / 2;
        const barY = 10;

        // Background
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 3);
        ctx.fill();

        // Fill
        if (barWidth * progress > 0) {
            const fillGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
            fillGrad.addColorStop(0, "#FFD700");
            fillGrad.addColorStop(1, "#FF6B35");
            ctx.fillStyle = fillGrad;
            ctx.beginPath();
            ctx.roundRect(barX, barY, Math.max(barWidth * progress, 6), barHeight, 3);
            ctx.fill();
        }

        // Glow on fill end
        if (progress > 0 && progress < 1) {
            const glowX = barX + barWidth * progress;
            ctx.fillStyle = "rgba(255, 215, 0, 0.4)";
            ctx.beginPath();
            ctx.arc(glowX, barY + barHeight / 2, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "10px Outfit, sans-serif";
        ctx.textAlign = "center";
        if (level >= 5) {
            ctx.fillText("MAX LEVEL", canvas.width / 2, barY + barHeight + 13);
        } else {
            ctx.fillText(`Next: Level ${level + 1}`, canvas.width / 2, barY + barHeight + 13);
        }
    }

    // =====================
    // MEDAL SYSTEM
    // =====================
    function getMedal(s) {
        if (s >= 60) return { icon: "💎", text: "PLATINUM", color: "#E0F7FA" };
        if (s >= 45) return { icon: "🥇", text: "GOLD", color: "#FFD700" };
        if (s >= 25) return { icon: "🥈", text: "SILVER", color: "#C0C0C0" };
        if (s >= 10) return { icon: "🥉", text: "BRONZE", color: "#CD7F32" };
        return null;
    }

    // =====================
    // GAME OVER
    // =====================
    function endGame() {
        if (gameOver) return;
        gameOver = true;

        // stop bg music
        bgMusic.pause();
        bgMusic.currentTime = 0;

        // play game over music
        if (gameOverMusic) {
            gameOverMusic.currentTime = 0;
            gameOverMusic.volume = 0.6;

            gameOverMusic.play().catch(err => {
                console.log("Game over music blocked:", err);
            });
        }

        playSound("hit");

        shakeTimer = 15;
        shakeIntensity = 8;

        spawnParticles(bird.x + 15, bird.y + 15, 30, "#FF5722", 5, 45);
        spawnParticles(bird.x + 15, bird.y + 15, 15, "#FFEB3B", 4, 35);

        totalGames++;
        localStorage.setItem("flappyTotalGames", totalGames);

        const finalScore = score;
        const finalCombo = maxCombo;

        let isNewBest = false;
        if (finalScore > highScore) {
            highScore = finalScore;
            localStorage.setItem("flappyHighScore", highScore);
            highScoreText.textContent = highScore;
            isNewBest = true;
        }

        setTimeout(() => {
            finalScoreEl.textContent = finalScore;
            finalBestEl.textContent = highScore;
            finalComboEl.textContent = finalCombo;
            totalGamesEl.textContent = totalGames;

            if (isNewBest) {
                newBestBadge.classList.remove("hidden");
            } else {
                newBestBadge.classList.add("hidden");
            }

            // Medal display
            const medal = getMedal(finalScore);
            if (medal && medalDisplay) {
                medalIcon.textContent = medal.icon;
                medalText.textContent = medal.text;
                medalText.style.color = medal.color;
                medalDisplay.classList.remove("hidden");
            } else if (medalDisplay) {
                medalDisplay.classList.add("hidden");
            }

            gameOverPanel.classList.remove("hidden");
        }, 600);
    }

    let fps = 0;
let lastFpsTime = 0;

    // =====================
    // RESTART
    // =====================
    function restartGame() {
        if (gameOverMusic) {
            gameOverMusic.pause();
            gameOverMusic.currentTime = 0;
        }

        // balik ke bg music
        bgMusic.currentTime = 0;
        bgMusic.play().catch(() => {});

        bird = { x: 80, y: 280, width: 34, height: 34, velocity: 0, rotation: 0, flapFrame: 0 };
        pipes = [];
        particles = [];
        scorePopups = [];
        foods = [];
        birdTrail = [];
        score = 0;
        combo = 0;
        maxCombo = 0;
        pipeTimer = 0;
        gameStart = false;
        gameOver = false;
        paused = false;
        shakeTimer = 0;
        levelUpTimer = 0;
        doubleScore = false;

        // Reset theme
        prevTheme = LEVEL_THEMES[1];
        currTheme = LEVEL_THEMES[1];
        themeT = 1.0;

        setLevel(1);
        level = 1;
levelText.textContent = " 1";

        scoreText.textContent = 0;
        comboText.textContent = "x0";
        gameOverPanel.classList.add("hidden");
        startOverlay.classList.remove("hidden");
    }

    // =====================
    // CONTROLS
    // =====================
    function doJump() {
        if (gameOver) return;
        if (paused) return;

        if (!gameStart) {
            gameStart = true;
            startOverlay.classList.add("hidden");

            // FORCE spawn awal biar langsung hidup
            createPipe();
        }

        bird.velocity = jumpForce;
        bird.flapFrame = 0;
        spawnParticles(bird.x, bird.y + bird.height, 4, "rgba(255,255,255,0.5)", 2, 15);
        playSound("jump");
    }

    document.addEventListener("keydown", e => {
        if (e.code === "Space") { e.preventDefault(); doJump(); }
        if (e.code === "ArrowUp") { e.preventDefault(); doJump(); }

        // Skin navigation on start screen
        if (!gameStart && !gameOver) {
            if (e.code === "ArrowLeft") { prevSkin(); }
            if (e.code === "ArrowRight") { nextSkin(); }
        }

        if (e.code === "KeyP" || e.code === "Escape") {
            if (!gameStart || gameOver) return;
            paused = !paused;
            pauseOverlay.classList.toggle("hidden", !paused);
        }

        if (e.code === "KeyM") {
            muted = !muted;
            muteBtn.textContent = muted ? "🔇" : "🔊";
        }
    });

    canvas.addEventListener("click", e => {
        if (e.target === canvas) doJump();
    });
    canvas.addEventListener("touchstart", e => {
        if (e.target === canvas) { e.preventDefault(); doJump(); }
    }, { passive: false });

    startOverlay.addEventListener("click", e => {
        e.stopPropagation();
        doJump();
    });

    const restartBtnEl = document.getElementById("restartBtn");
    if (restartBtnEl) {
        restartBtnEl.addEventListener("click", e => {
            e.stopPropagation();
            restartGame();
        });
    }

    const menuBtnEl = document.getElementById("menuBtn");
    if (menuBtnEl) {
        menuBtnEl.addEventListener("click", e => {
            e.stopPropagation();
            restartGame();
        });
    }

    muteBtn.addEventListener("click", e => {
        e.stopPropagation();
        muted = !muted;
        muteBtn.textContent = muted ? "🔇" : "🔊";
    });

    // Skin selector button handlers
    const skinPrevBtn = document.getElementById("skinPrev");
    const skinNextBtn = document.getElementById("skinNext");

    if (skinPrevBtn) {
        skinPrevBtn.addEventListener("click", e => {
            e.stopPropagation();
            prevSkin();
        });
    }

    if (skinNextBtn) {
        skinNextBtn.addEventListener("click", e => {
            e.stopPropagation();
            nextSkin();
        });
    }

    // =====================
    // SCREEN SHAKE
    // =====================
    function applyShake() {
        if (shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * shakeIntensity;
            const dy = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(dx, dy);
            shakeTimer--;
            shakeIntensity *= 0.9;
        }
    }

    // =====================
    // DRAW START HINT ON CANVAS
    // =====================
    function drawStartHint() {
        if (!gameStart && !gameOver) {
            const bobY = Math.sin(frameCount * 0.05) * 8;
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = "#fff";
            ctx.font = "24px Outfit, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("▲", bird.x + 17, bird.y - 20 + bobY);
            ctx.globalAlpha = 1;
        }
    }

    // =====================
    // GAME LOOP
    // =====================
    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        lastTime = timestamp;
        frameCount++;

        if (paused) {
            requestAnimationFrame(gameLoop);
            return;
        }

        ctx.save();
        applyShake();

        drawSky();
        drawMountains();
        drawClouds();
        updateClouds();

        if (gameStart && !gameOver) {
            pipeTimer++;
            if (pipeTimer >= getPipeInterval()) {
                createPipe();
                pipeTimer = 0;
            }
        }

        updateBird();
        updateTrail();
        updatePipes();

        drawPipes();
        drawGround();
        drawTrail();
        drawBird();

        updateParticles();
        drawParticles();
        updateScorePopups();
        drawScorePopups();
        updateFoods();
        drawFoods();

        drawProgressBar();
        drawLevelUpEffect();
        drawStartHint();

        ctx.restore();

        requestAnimationFrame(gameLoop);
    }

    // =====================
    // START
    // =====================
    requestAnimationFrame(gameLoop);