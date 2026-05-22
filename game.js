/**
 * Terrier Run - Motor de Juego Principal (Engine)
 * Gestiona el bucle de renderizado, físicas, colisiones, clima, parallax y estados.
 */

// --- CONFIGURACIÓN Y CONSTANTES ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_Y = 320;
const TERRIER_X = 80;

// Configuración de Físicas
const GRAVITY = 0.58;
const JUMP_FORCE = -11.5;
const DUCK_GRAVITY_MULTIPLIER = 1.8; // Cae más rápido al agacharse en el aire

// Estados de Juego
const STATES = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover',
  CUTSCENE: 'cutscene',
  DYING: 'dying'
};

let gameState = STATES.START;

// Sistema de Vidas y Animación de Fantasma
let lives = 1;
let deathX = 0;
let deathY = 0;
let ghostY = 0;
let barkBubble = null;

// Variables de la Cinemática de Eloísa
let cutsceneStage = 0; // 0: Desacelerando mundo, 1: Deslizando cabaña y Eloísa, 2: Perro corre solo, 3: Perro salta, 4: Abrazados/Música
let cutsceneTimer = 0;
let cabinX = CANVAS_WIDTH + 100;
let eloisaX = CANVAS_WIDTH + 240;
let eloisaY = GROUND_Y - 48;
let eloisaSprite = null;

// --- INSTANCIAS DE ELEMENTOS DEL JUEGO ---
let canvas, ctx;

// El Jugador (Terrier Chileno)
const terrier = {
  x: TERRIER_X,
  y: GROUND_Y - 48,
  width: 48,  // Sprite de 24x24 escalado x2
  height: 48,
  vy: 0,
  isGrounded: true,
  state: 'idle', // 'idle', 'run', 'jump', 'duck', 'crash'
  runFrame: 0,
  frameTimer: 0,
  frameInterval: 8, // fotogramas para cambiar de paso
  jumpsLeft: 0,     // Saltos aéreos restantes (para el Doble Salto de la Rosa)
  
  // Rectángulos de colisión ajustados (más pequeños que el sprite para jugabilidad justa)
  getCollisionBox() {
    if (this.state === 'duck') {
      return {
        x: this.x + 10,
        y: this.y + 24,
        width: this.width - 16,
        height: this.height - 24
      };
    }
    return {
      x: this.x + 10,
      y: this.y + 6,
      width: this.width - 20,
      height: this.height - 8
    };
  },

  jump() {
    if (gameState !== STATES.PLAYING) return;

    if (this.isGrounded) {
      this.vy = JUMP_FORCE;
      this.isGrounded = false;
      this.state = 'jump';
      this.jumpsLeft = hasDoubleJump ? 1 : 0;
      if (window.audioEngine) window.audioEngine.playJumpSound();
    } else if (hasDoubleJump && this.jumpsLeft > 0) {
      this.vy = JUMP_FORCE * 0.95; // Segundo salto aéreo
      this.jumpsLeft--;
      // Crear explosión de pétalos de rosa (partículas rosa)
      for (let i = 0; i < 15; i++) {
        sparkleParticles.push({
          x: this.x + this.width / 2,
          y: this.y + this.height,
          size: 3 + Math.random() * 5,
          vx: (Math.random() * 6 - 3),
          vy: (Math.random() * 4 - 2),
          color: Math.random() < 0.6 ? '#d61c4e' : '#ffb3c6',
          alpha: 0.9
        });
      }
      if (window.audioEngine && window.audioEngine.playDoubleJumpSound) {
        window.audioEngine.playDoubleJumpSound();
      }
    }
  },

  duck(isDucking) {
    if (isDucking) {
      if (this.state !== 'duck' && this.isGrounded) {
        this.state = 'duck';
        if (window.audioEngine && window.audioEngine.playPainYipSound) {
          window.audioEngine.playPainYipSound();
        }
      }
    } else {
      if (this.state === 'duck') {
        this.state = this.isGrounded ? 'run' : 'jump';
      }
    }
  },

  update() {
    // Movimiento horizontal en X
    if (gameState === STATES.PLAYING) {
      const moveSpeed = 4.0;
      if (keys.ArrowLeft) {
        this.x -= moveSpeed;
      }
      if (keys.ArrowRight) {
        this.x += moveSpeed;
      }
      // Límites laterales seguros (evitar salirse del canvas)
      const minX = 10;
      const maxX = CANVAS_WIDTH - this.width - 10;
      if (this.x < minX) this.x = minX;
      if (this.x > maxX) this.x = maxX;
    }

    // Aplicamos gravedad con multiplicador si el jugador presiona agacharse en el aire
    const activeGravity = (!this.isGrounded && keys.ArrowDown) ? GRAVITY * DUCK_GRAVITY_MULTIPLIER : GRAVITY;
    this.vy += activeGravity;
    this.y += this.vy;

    // Colisión con el suelo
    const groundLimit = GROUND_Y - (this.state === 'duck' ? 40 : 48); // Agachado es ligeramente más bajo en altura real
    if (this.y >= groundLimit) {
      this.y = groundLimit;
      this.vy = 0;
      this.isGrounded = true;
      
      if (this.state === 'jump') {
        this.state = 'run';
      }
    }

    // Animación de correr
    if (gameState === STATES.PLAYING && this.isGrounded && this.state !== 'duck') {
      this.state = 'run';
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.runFrame = 1 - this.runFrame;
        this.frameTimer = 0;
      }
    }
  },

  draw() {
    if (gameState === STATES.CUTSCENE && cutsceneStage === 4) {
      return; // Ocultar terrier ya que está fusionado en el sprite eloisa_hug
    }

    let spriteMatrix = TERRIER_SPRITES.idle;
    if (this.state === 'run') {
      spriteMatrix = this.runFrame === 0 ? TERRIER_SPRITES.run1 : TERRIER_SPRITES.run2;
    } else if (this.state === 'jump') {
      spriteMatrix = TERRIER_SPRITES.jump;
    } else if (this.state === 'duck') {
      spriteMatrix = TERRIER_SPRITES.duck;
    } else if (this.state === 'crash' || this.state === 'fall_hole') {
      spriteMatrix = TERRIER_SPRITES.crash;
    }
    
    // El terrier corre hacia la derecha, por lo que dibujamos el sprite volteado horizontalmente (flipX = true)
    drawPixelSprite(ctx, spriteMatrix, this.x, this.y, this.width, this.height, true);
    
    // Si tiene el poder de doble salto (Rosa Roja), dibujar burbuja protectora y cronómetro en su interior
    if (typeof hasDoubleJump !== 'undefined' && hasDoubleJump) {
      ctx.save();
      
      // Burbuja circular rosa translúcida alrededor del perro
      ctx.fillStyle = 'rgba(255, 179, 198, 0.16)';
      ctx.strokeStyle = `rgba(214, 28, 78, ${0.5 + Math.sin(Date.now() * 0.01) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Partículas destellantes flotantes a veces
      if (Math.random() < 0.15) {
        sparkleParticles.push({
          x: this.x + Math.random() * this.width,
          y: this.y + Math.random() * this.height,
          size: 2 + Math.random() * 4,
          vx: (Math.random() * 2 - 1),
          vy: -0.5 - Math.random() * 1.5,
          color: Math.random() < 0.6 ? '#d61c4e' : '#ffb3c6',
          alpha: 0.8
        });
      }
      
      // Tiempo restante en segundos dibujado en el centro superior de la burbuja
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const secVal = `${Math.ceil(doubleJumpTimer / 1000)}s`;
      ctx.strokeText(secVal, this.x + this.width / 2, this.y + this.height / 2 - 8);
      ctx.fillText(secVal, this.x + this.width / 2, this.y + this.height / 2 - 8);
      ctx.restore();
    }
    
    // Para depuración (cajas de colisión), descomentar:
    /*
    ctx.strokeStyle = 'red';
    const box = this.getCollisionBox();
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    */
  }
};

// --- GESTIÓN DE OBSTÁCULOS Y COLECCIONABLES ---
let obstacles = [];
let collectibles = [];
let gameSpeed = 5.0;
const minSpawnInterval = 1000; // ms
let spawnTimer = 0;
let nextSpawnTime = 1200; // ms inicial para aparecer

// Estadísticas de juego
let score = 0;
let highScore = 0;
let multiplier = 1.0;
let salmonsCount = 0;
let kuchensCount = 0;
let distanceTraveled = 0;

// --- SISTEMA DE ETAPAS ---
let currentStage = 1;
const DISTANCE_PER_STAGE = 200; // Avanza cada 200 metros (aprox 22 segundos)
let stageTransitionTimer = 0;
let stageTransitionText = '';
let lavaParticles = [];
let sparkleParticles = [];
let hasDoubleJump = false;
let doubleJumpTimer = 0;

// --- SISTEMA CLIMÁTICO Y PARTÍCULAS ---
let currentWeather = 'sunny';
let rainParticles = [];
let smokeParticles = []; // Humo del Volcán Osorno
let lightningFlash = 0;  // Duración del destello de relámpago

// Temporizadores para nuevos climas y eventos
let volcanicRockTimer = 0;
let volcanicRockInterval = 1000;
let windParticles = [];
let tornadoCowTimer = 0;
let tornadoCowInterval = 800;
let floatyTexts = [];

// --- ENTRADA DE TECLADO ---
const keys = {
  Space: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

// ==========================================
// --- CLASES PARA ELEMENTOS DEL JUEGO ---
// ==========================================

class Obstacle {
  constructor(type) {
    this.type = type; // 'cow', 'fence', 'stone', 'queltehue', 'hole', 'volcanicRock'
    this.x = CANVAS_WIDTH + 50;
    this.passed = false;
    
    if (type === 'cow') {
      this.width = 64;  // 32x24 escalada x2
      this.height = 48;
      this.y = GROUND_Y - this.height;
    } else if (type === 'fence') {
      this.width = 52;  // Agrandada de 32x32 a 52x52 px
      this.height = 52;
      this.y = GROUND_Y - this.height;
    } else if (type === 'stone') {
      this.width = 24;
      this.height = 24;
      this.y = GROUND_Y - this.height;
    } else if (type === 'queltehue') {
      this.width = 32;  // 16x16 px escalado x2
      this.height = 32;
      // 3 alturas distintas para el Queltehue:
      // - bajo (GROUND_Y - 32): requiere saltar
      // - medio (GROUND_Y - 68): requiere agacharse
      // - alto (GROUND_Y - 100): se pasa corriendo pero saltar choca
      const heights = [GROUND_Y - 32, GROUND_Y - 68, GROUND_Y - 100];
      this.y = heights[Math.floor(Math.random() * heights.length)];
      
      this.frame = 0;
      this.frameTimer = 0;
      this.frameInterval = 6; // velocidad de aleteo
      
      if (window.audioEngine && window.audioEngine.playQueltehueSound) {
        window.audioEngine.playQueltehueSound();
      }
    } else if (type === 'hole') {
      this.width = 64;  // 32x16 px escalado x2
      this.height = 32;
      this.y = GROUND_Y - 8; // Está en el suelo, ligeramente hundido
    } else if (type === 'volcanicRock') {
      this.width = 32; // 16x16 px escalado x2
      this.height = 32;
      // Inicia por encima de la pantalla, en una posición X aleatoria
      this.x = TERRIER_X + 250 + Math.random() * (CANVAS_WIDTH - 200);
      this.y = -40; // Inicia arriba de la pantalla
      
      // Velocidades de caída en diagonal
      this.vy = 3.5 + Math.random() * 2.5; // Cae hacia abajo
      this.vx = -(gameSpeed + 1 + Math.random() * 2); // Se mueve hacia la izquierda
    } else if (type === 'flyingCow') {
      this.width = 64; // 32x24 escalada x2
      this.height = 48;
      this.x = CANVAS_WIDTH + 60;
      this.baseY = 60 + Math.random() * 120; // Altura base en el cielo
      this.angle = Math.random() * Math.PI * 2;
      this.rotationAngle = 0;
      this.y = this.baseY;
      this.vx = -(gameSpeed + 2 + Math.random() * 2); // Viaja rápido
    }
  }

  update() {
    if (this.type === 'volcanicRock') {
      this.x += this.vx;
      this.y += this.vy;
    } else if (this.type === 'flyingCow') {
      this.x += this.vx;
      this.angle += 0.08;
      this.y = this.baseY + Math.sin(this.angle) * 35;
      this.rotationAngle -= 0.05; // Rotación en espiral de tornado
    } else {
      this.x -= gameSpeed;
    }
    
    if (this.type === 'queltehue') {
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.frame = 1 - this.frame;
        this.frameTimer = 0;
      }
    }
  }

  draw() {
    if (this.type === 'flyingCow') {
      ctx.save();
      // Trasladar al centro de la vaca para rotar sobre su eje
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotationAngle);
      // Dibujar centrada en el origen
      drawPixelSprite(ctx, OBSTACLE_SPRITES.cow, -this.width / 2, -this.height / 2, this.width, this.height, true);
      ctx.restore();
      return;
    }

    let matrix = OBSTACLE_SPRITES.cow;
    if (this.type === 'fence') matrix = OBSTACLE_SPRITES.fence;
    if (this.type === 'stone') matrix = OBSTACLE_SPRITES.stone;
    if (this.type === 'hole') matrix = OBSTACLE_SPRITES.hole;
    if (this.type === 'volcanicRock') matrix = OBSTACLE_SPRITES.volcanicRock;
    if (this.type === 'queltehue') {
      matrix = this.frame === 0 ? OBSTACLE_SPRITES.queltehue1 : OBSTACLE_SPRITES.queltehue2;
    }
    
    // Las vacas y queltehues miran hacia la izquierda, por lo que las volteamos (flipX = true)
    const flipX = (this.type === 'cow' || this.type === 'queltehue');
    drawPixelSprite(ctx, matrix, this.x, this.y, this.width, this.height, flipX);
  }

  isOutOfBounds() {
    if (this.type === 'volcanicRock') {
      return this.y > CANVAS_HEIGHT + 20 || this.x < -this.width;
    }
    return this.x < -this.width;
  }

  getCollisionBox() {
    if (this.type === 'cow') {
      return { x: this.x + 8, y: this.y + 6, width: this.width - 16, height: this.height - 8 };
    }
    if (this.type === 'flyingCow') {
      // Un poco más pequeña debido a la rotación
      return { x: this.x + 12, y: this.y + 10, width: this.width - 24, height: this.height - 20 };
    }
    if (this.type === 'queltehue') {
      return { x: this.x + 4, y: this.y + 4, width: this.width - 8, height: this.height - 8 };
    }
    if (this.type === 'hole') {
      return { x: this.x + 12, y: this.y + 4, width: this.width - 24, height: this.height - 4 };
    }
    if (this.type === 'volcanicRock') {
      return { x: this.x + 6, y: this.y + 6, width: this.width - 12, height: this.height - 12 };
    }
    return { x: this.x + 4, y: this.y + 2, width: this.width - 8, height: this.height - 4 };
  }
}

class Collectible {
  constructor(type) {
    this.type = type; // 'salmon', 'kuchen', 'rose', 'bone'
    this.x = CANVAS_WIDTH + 50;
    this.width = 32;  // 16x16 escalado x2
    this.height = 32;
    
    if (this.type === 'kuchen') {
      // Kuchen flota a alturas aleatorias (bajo, medio, alto)
      const heights = [GROUND_Y - 50, GROUND_Y - 90, GROUND_Y - 130];
      this.y = heights[Math.floor(Math.random() * heights.length)];
      this.vy = 0;
    } else if (this.type === 'rose') {
      // La rosa roja crece en la pradera verde del suelo
      this.y = GROUND_Y - 32;
      this.vy = 0;
    } else if (this.type === 'bone') {
      // El hueso flota a alturas medias
      const heights = [GROUND_Y - 60, GROUND_Y - 100];
      this.y = heights[Math.floor(Math.random() * heights.length)];
      this.vy = 0;
    } else {
      // Salmón salta desde el lago Llanquihue en arco parabólico
      this.y = GROUND_Y + 10; // Empieza abajo
      this.vy = -7.5 - Math.random() * 3.5; // Impulso inicial hacia arriba
      this.gravity = 0.22;
      this.vx = -gameSpeed * 0.9; // Se mueve horizontalmente hacia la izquierda
      this.angle = 0;
    }
  }

  update() {
    if (this.type === 'kuchen') {
      this.x -= gameSpeed;
      // Pequeño bamboleo flotante sinusoidal
      this.y += Math.sin(Date.now() * 0.007) * 0.4;
    } else if (this.type === 'rose') {
      this.x -= gameSpeed;
      // Sutil oscilación vertical para darle vida y brillo
      this.y += Math.sin(Date.now() * 0.01) * 0.2;
    } else if (this.type === 'bone') {
      this.x -= gameSpeed;
      // Bamboleo flotante sinusoidal
      this.y += Math.sin(Date.now() * 0.008) * 0.5;
    } else { // salmon
      this.x += this.vx;
      this.vy += this.gravity;
      this.y += this.vy;
    }
  }

  draw() {
    let matrix = COLLECTIBLE_SPRITES.salmon;
    if (this.type === 'kuchen') {
      matrix = COLLECTIBLE_SPRITES.kuchen;
    } else if (this.type === 'rose') {
      matrix = COLLECTIBLE_SPRITES.rose;
    } else if (this.type === 'bone') {
      matrix = COLLECTIBLE_SPRITES.bone;
    }
    drawPixelSprite(ctx, matrix, this.x, this.y, this.width, this.height);
  }

  isOutOfBounds() {
    return this.x < -this.width || this.y > CANVAS_HEIGHT + 20;
  }

  getCollisionBox() {
    return { x: this.x + 2, y: this.y + 2, width: this.width - 4, height: this.height - 4 };
  }
}


// ==========================================
// --- PARALLAX BACKGROUND LAYERS ---
// ==========================================

let bgOffsetVolcano = 0;
let bgOffsetLake = 0;
let bgOffsetForest = 0;
let bgOffsetGround = 0;
let isTransitioningToMeadow = false;
let meadowStartBlock = Infinity;

// Variables de control de la Meta Física de la Bandera Chilena
let flagpole = null; // { x, y, width, height, flagRaisedPercent }
let isFlagpoleCutscene = false;
let flagpoleCutsceneTimer = 0;

// ==========================================
// --- SISTEMA DE CLIMA DINÁMICO Y ETAPAS ---
// ==========================================

function applyStageEnvironment(stage) {
  // Limpiar partículas climáticas anteriores para evitar acumulaciones/fugas estáticas
  rainParticles = [];
  lavaParticles = [];
  windParticles = [];
  
  // Etapa de Tornado (múltiplos de 5 pero no de 10, ej: 5, 15, 25...)
  if (stage % 5 === 0 && stage % 10 !== 0) {
    currentWeather = 'tornado';
    if (window.audioEngine) {
      window.audioEngine.setMusicTheme('danger');
    }
    return;
  }
  
  // Las etapas múltiplos de 3 son SIEMPRE de Erupción Volcánica
  if (stage % 3 === 0) {
    currentWeather = 'eruption';
    if (window.audioEngine) {
      window.audioEngine.setMusicTheme('danger');
    }
    return;
  }
  
  // Lista cíclica de climas y música para otras etapas
  const environments = [
    { weather: 'sunrise', music: 'sunrise' },   // Mañana / Amanecer
    { weather: 'sunny', music: 'sunny' },       // Día Soleado
    { weather: 'rainy', music: 'sunny' },       // Lluvia
    { weather: 'sunset', music: 'sunset' },     // Atardecer
    { weather: 'night', music: 'night' },       // Noche Despejada
    { weather: 'fog', music: 'night' },         // Noche Neblina
    { weather: 'storm', music: 'sunset' }       // Tormenta
  ];
  
  // Calcular índice cíclico excluyendo los de erupción
  const nonVolcanoIndex = (Math.floor((stage - 1) - Math.floor((stage - 1) / 3))) % environments.length;
  const env = environments[nonVolcanoIndex];
  
  currentWeather = env.weather;
  if (window.audioEngine) {
    window.audioEngine.setMusicTheme(env.music);
  }
}

function drawFogEffect() {
  ctx.save();
  ctx.fillStyle = 'rgba(220, 230, 245, 0.28)';
  const time = Date.now() * 0.001;
  
  // Dos capas de neblina oscilante para dar profundidad 8-bit
  for (let layer = 0; layer < 2; layer++) {
    const speed = (layer + 1) * 20;
    const offset = (time * speed) % CANVAS_WIDTH;
    const height = 24 + layer * 12;
    const yPos = GROUND_Y - height + 4;
    
    ctx.beginPath();
    for (let x = 0; x <= CANVAS_WIDTH; x += 16) {
      const sinVal = Math.sin((x + offset) * 0.015 + layer) * 6;
      if (x === 0) {
        ctx.moveTo(x, yPos + sinVal);
      } else {
        ctx.lineTo(x, yPos + sinVal);
      }
    }
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.lineTo(0, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCanvasHUD() {
  ctx.save();
  
  // 1. Panel translúcido Slate de fondo con esquinas redondeadas (glassmorphic premium)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;
  
  const hudBgGrad = ctx.createLinearGradient(15, 8, 15, 40);
  hudBgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)'); // Slate 900
  hudBgGrad.addColorStop(1, 'rgba(30, 41, 59, 0.85)'); // Slate 800
  ctx.fillStyle = hudBgGrad;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'; // Borde sutil premium
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.roundRect(15, 8, 770, 32, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  
  // 2. Lado izquierdo: ETAPA y clima en una sola línea compacta
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  let weatherText = 'DESPEJADO';
  let weatherIcon = '☀️';
  
  switch (currentWeather) {
    case 'sunrise':
      weatherText = 'AMANECER';
      weatherIcon = '🌅';
      break;
    case 'sunny':
      weatherText = 'DÍA SOLEADO';
      weatherIcon = '☀️';
      break;
    case 'rainy':
      weatherText = 'LLUVIA';
      weatherIcon = '🌧️';
      break;
    case 'sunset':
      weatherText = 'ATARDECER';
      weatherIcon = '🌇';
      break;
    case 'night':
      weatherText = 'NOCHE';
      weatherIcon = '🌙';
      break;
    case 'fog':
      weatherText = 'NEBLINA';
      weatherIcon = '🌫️';
      break;
    case 'storm':
      weatherText = 'TORMENTA';
      weatherIcon = '⛈️';
      break;
    case 'eruption':
      weatherText = 'ERUPCIÓN';
      weatherIcon = '🌋';
      break;
    case 'tornado':
      weatherText = 'TORNADO';
      weatherIcon = '🌪️';
      break;
  }
  
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`ETAPA ${currentStage}`, 28, 24);
  
  const weatherColor = (currentWeather === 'eruption' || currentStage % 3 === 0) ? '#ff4d4d' : (currentWeather === 'tornado' ? '#b5e2fa' : '#ffd166');
  ctx.fillStyle = weatherColor;
  ctx.fillText(`${weatherIcon} ${weatherText}`, 108, 24);
  
  // 3. Vidas (Corazones pixelados en x=205)
  const heartXStart = 205;
  const heartY = 24 - 6; // y=18 (corazón es de 6px de alto con size=2, queda perfectamente centrado en Y=24)
  
  if (lives <= 4) {
    for (let i = 0; i < lives; i++) {
      drawPixelHeart(ctx, heartXStart + i * 16, heartY, 2);
    }
  } else {
    drawPixelHeart(ctx, heartXStart, heartY, 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`x${lives}`, heartXStart + 16, 24);
  }
  
  // 4. Salmones (x=285)
  const salmonX = 285;
  const itemY = 24 - 9; // y=15 (sprite es de 18px de alto)
  drawPixelSprite(ctx, COLLECTIBLE_SPRITES.salmon, salmonX, itemY, 18, 18);
  ctx.fillStyle = '#ffd166'; // dorado salmón
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.fillText(`x${salmonsCount}`, salmonX + 22, 24);
  
  // 5. Kuchens (x=350)
  const kuchenX = 350;
  drawPixelSprite(ctx, COLLECTIBLE_SPRITES.kuchen, kuchenX, itemY, 18, 18);
  ctx.fillStyle = '#f472b6'; // rosa kuchen
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.fillText(`x${kuchensCount}`, kuchenX + 22, 24);

  // 6. Distancia (Metros recorridos en x=415)
  const distX = 415;
  ctx.fillStyle = '#cbd5e1'; // gris claro
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.fillText(`DST:${Math.floor(distanceTraveled)}m`, distX, 24);
  
  // 7. Puntaje (PTS en x=510)
  const scoreX = 510;
  ctx.fillStyle = '#00f0ff'; // cian brillante
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.fillText(`PTS:${String(score).padStart(6, '0')}`, scoreX, 24);
  
  // 8. Récord (MAX en x=610)
  const maxScoreX = 610;
  ctx.fillStyle = '#ffb700'; // dorado
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.fillText(`MAX:${String(highScore).padStart(6, '0')}`, maxScoreX, 24);
  
  // 9. Multiplicador (Pulsante/Wobbling animado en x=775, alineación derecha)
  const multX = 775;
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'right';
  
  if (multiplier > 1.0) {
    ctx.save();
    const scale = 1.0 + Math.sin(Date.now() / 120) * 0.08;
    const wobble = Math.cos(Date.now() / 180) * 2; // grados de rotación
    
    ctx.translate(multX, 24);
    ctx.scale(scale, scale);
    ctx.rotate(wobble * Math.PI / 180);
    
    ctx.fillStyle = '#ff007f'; // rosa brillante
    ctx.fillText(`x${multiplier.toFixed(1)}`, 0, 0);
    ctx.restore();
  } else {
    ctx.fillStyle = '#7c8b9e'; // gris neutro si es x1.0
    ctx.fillText(`x1.0`, multX, 24);
  }
  
  ctx.restore();
}

function drawPixelHeart(ctx, x, y, size = 2) {
  ctx.save();
  ctx.fillStyle = '#d61c4e'; // Rojo pasión
  
  // Matriz de corazón de 7x6 px
  const heartMatrix = [
    ".KK.KK.",
    "KKKKKKK",
    "KKKKKKK",
    ".KKKKK.",
    "..KKK..",
    "...K..."
  ];
  
  for (let r = 0; r < heartMatrix.length; r++) {
    for (let c = 0; c < heartMatrix[r].length; c++) {
      if (heartMatrix[r][c] === 'K') {
        ctx.fillRect(x + c * size, y + r * size, size, size);
      }
    }
  }
  ctx.restore();
}

function drawCutsceneTextBox() {
  ctx.save();
  
  // 1. Burbuja de Eloísa
  const b1X = 540;
  const b1Y = 110;
  const b1W = 200;
  const b1H = 45;
  
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  
  // Dibujar rectángulo de la burbuja
  ctx.fillRect(b1X, b1Y, b1W, b1H);
  ctx.strokeRect(b1X, b1Y, b1W, b1H);
  
  // Dibujar flecha/tail apuntando a la cabeza de Eloísa
  ctx.beginPath();
  ctx.moveTo(b1X + b1W - 40, b1Y + b1H);
  ctx.lineTo(b1X + b1W - 20, b1Y + b1H + 18);
  ctx.lineTo(b1X + b1W - 10, b1Y + b1H);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Conexión limpia (borrando el borde negro de unión en la burbuja)
  ctx.beginPath();
  ctx.moveTo(b1X + b1W - 41, b1Y + b1H - 1);
  ctx.lineTo(b1X + b1W - 9, b1Y + b1H - 1);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Texto de Eloísa
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("HAZ VUELTO CHOLGA!", b1X + b1W / 2, b1Y + b1H / 2);
  
  // 2. Burbuja de Cholga
  const b2X = 400;
  const b2Y = 175;
  const b2W = 160;
  const b2H = 45;
  
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  
  ctx.fillRect(b2X, b2Y, b2W, b2H);
  ctx.strokeRect(b2X, b2Y, b2W, b2H);
  
  // Flecha apuntando a Cholga en sus brazos
  ctx.beginPath();
  ctx.moveTo(b2X + b2W - 20, b2Y + b2H);
  ctx.lineTo(b2X + b2W + 5, b2Y + b2H + 18);
  ctx.lineTo(b2X + b2W - 5, b2Y + b2H);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Conexión limpia burbuja-tail
  ctx.beginPath();
  ctx.moveTo(b2X + b2W - 21, b2Y + b2H - 1);
  ctx.lineTo(b2X + b2W - 4, b2Y + b2H - 1);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Texto de Cholga: "I ❤️ ELOÍSA" con el corazón de pixel art
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'left';
  
  const textX = b2X + 22;
  const textY = b2Y + b2H / 2;
  ctx.fillText("I", textX, textY);
  
  // Corazón pixel art retro
  drawPixelHeart(ctx, textX + 16, textY - 6, 2);
  
  ctx.fillText("ELOÍSA", textX + 38, textY);
  
  // 3. Instrucción blinking parpadeante abajo para reanudar
  if (Math.floor(Date.now() / 450) % 2 === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.strokeText("Presiona cualquier tecla para continuar", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
    ctx.fillText("Presiona cualquier tecla para continuar", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
  }
  
  ctx.restore();
}

function updateCutscene() {
  if (cutsceneStage === 0) {
    // Desacelerar suavemente
    gameSpeed *= 0.95;
    
    // Desplazar la cabaña de forma solidaria con la velocidad del suelo
    cabinX -= gameSpeed;
    eloisaX = cabinX + 130;
    
    // Desplazar obstáculos, premios y asta de bandera en pantalla
    obstacles.forEach(o => o.x -= gameSpeed);
    collectibles.forEach(c => c.x -= gameSpeed);
    if (flagpole) {
      flagpole.x -= gameSpeed;
    }
    
    if (gameSpeed < 0.15) {
      gameSpeed = 0;
      cabinX = CANVAS_WIDTH - 240;
      eloisaX = cabinX + 130;
      obstacles = [];
      collectibles = [];
      sparkleParticles = []; // Vaciar destellos del juego activo
      cutsceneTimer = 0;     // Reiniciar cronómetro de conversión
      cutsceneStage = 2;     // Saltar directo al Perro corriendo solo!
    }
  } else if (cutsceneStage === 2) {
    // Perro corre solo hacia los brazos de Eloísa
    terrier.state = 'run';
    terrier.frameTimer++;
    if (terrier.frameTimer >= terrier.frameInterval) {
      terrier.runFrame = 1 - terrier.runFrame;
      terrier.frameTimer = 0;
    }
    
    terrier.x += 2.5;
    
    if (terrier.x >= eloisaX - 44) {
      terrier.vy = -6.5;
      terrier.isGrounded = false;
      terrier.state = 'jump';
      cutsceneStage = 3;
    }
  } else if (cutsceneStage === 3) {
    // Salto a los brazos
    terrier.x += 1.5;
    terrier.vy += GRAVITY * 0.8;
    terrier.y += terrier.vy;
    
    if (terrier.y <= eloisaY - 10 && terrier.x >= eloisaX - 10) {
      terrier.x = eloisaX;
      terrier.y = eloisaY - 12;
      terrier.vy = 0;
      
      eloisaSprite = CINEMATIC_SPRITES.eloisa_hug;
      cutsceneStage = 4;
      
      if (window.audioEngine && window.audioEngine.playStageClearSound) {
        window.audioEngine.playStageClearSound();
      }
    }
  } else if (cutsceneStage === 4) {
    cutsceneTimer++;
    
    // Cada 4 fotogramas hacemos la conversión secuencial de ítems a puntos
    if (cutsceneTimer % 4 === 0) {
      if (salmonsCount > 0) {
        salmonsCount--;
        score += 100;
        if (window.audioEngine && window.audioEngine.playPointsConversionSound) {
          window.audioEngine.playPointsConversionSound();
        }
        updateUI();
      } else if (kuchensCount > 0) {
        kuchensCount--;
        score += 250;
        multiplier = Math.max(1.0, Number((multiplier - 0.1).toFixed(1))); // Reducir multiplicador amablemente al consumir kuchen
        if (window.audioEngine && window.audioEngine.playPointsConversionSound) {
          window.audioEngine.playPointsConversionSound();
        }
        updateUI();
      }
    }
    
    // Generar partículas felices
    if (Math.random() < 0.22) {
      sparkleParticles.push({
        x: eloisaX + 16 + (Math.random() * 20 - 10),
        y: eloisaY + 20 + (Math.random() * 20 - 10),
        size: 3 + Math.random() * 4,
        vx: Math.random() * 4 - 2,
        vy: -1 - Math.random() * 3,
        color: Math.random() < 0.5 ? '#ffcc00' : '#d61c4e',
        alpha: 0.9
      });
    }
    
    for (let i = sparkleParticles.length - 1; i >= 0; i--) {
      const p = sparkleParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha <= 0) sparkleParticles.splice(i, 1);
    }
  }
}

function updateDying() {
  // 1. Actualizar Terrier
  if (terrier.state === 'fall_hole') {
    // Caer suavemente en Y (dentro del hoyo)
    terrier.y += 2.2;
  } else {
    // Animación de muerte tipo Mario Bros (pequeño salto inicial y caída al vacío)
    terrier.vy += GRAVITY * 0.95;
    terrier.y += terrier.vy;
  }

  // 2. Actualizar Fantasma (subir suavemente al cielo)
  ghostY -= 1.6;

  // 3. Actualizar partículas para que exploten dinámicamente y no se congelen
  for (let i = sparkleParticles.length - 1; i >= 0; i--) {
    const p = sparkleParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.025;
    if (p.alpha <= 0) sparkleParticles.splice(i, 1);
  }

  // 4. Comprobar si la animación terminó
  // La animación termina cuando el fantasma sale de la pantalla por arriba (ghostY < -48)
  // Y el terrier ya no es visible (ya sea porque cayó al fondo o dentro del hoyo)
  const ghostOffScreen = (ghostY < -48);
  const dogOffScreen = (terrier.state === 'fall_hole') ? (terrier.y > GROUND_Y + 48) : (terrier.y > CANVAS_HEIGHT + 48);

  if (ghostOffScreen && dogOffScreen) {
    triggerGameOver();
  }
}

function resumeAfterCutscene() {
  gameState = STATES.PLAYING;
  currentStage++;
  
  applyStageEnvironment(currentStage);
  
  gameSpeed = 5.0 + (currentStage - 1) * 0.2;
  distanceTraveled = (currentStage - 1) * DISTANCE_PER_STAGE + 1;
  
  terrier.x = TERRIER_X;
  terrier.y = GROUND_Y - 48;
  terrier.vy = 0;
  terrier.isGrounded = true;
  terrier.state = 'run';
  
  // Limpiar el asta de la bandera y las variables de la cinemática de la etapa 10
  flagpole = null;
  isTransitioningToMeadow = false;
  meadowStartBlock = Infinity;
  isFlagpoleCutscene = false;
  flagpoleCutsceneTimer = 0;
  
  if (window.audioEngine) {
    window.audioEngine.startMusic();
  }
  
  stageTransitionText = `ETAPA ${currentStage}`;
  stageTransitionTimer = 180;
}

function drawParallax(weather) {
  // 1. Capa 1: Cielo (Gradiente dinámico según clima, hora del día o erupción volcánica)
  let skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  if (currentStage % 3 === 0) {
    skyGrad.addColorStop(0, '#4a0815'); // Rojo apocalíptico muy oscuro
    skyGrad.addColorStop(0.5, '#8b0c22'); // Carmesí volcánico
    skyGrad.addColorStop(1, '#d83a15'); // Naranja lava
  } else if (weather === 'sunrise') {
    skyGrad.addColorStop(0, '#e65c00'); // Naranja amanecer oscuro
    skyGrad.addColorStop(0.5, '#f9d423'); // Amarillo sol
    skyGrad.addColorStop(1, '#ffedd5'); // Crema suave
  } else if (weather === 'sunny') {
    skyGrad.addColorStop(0, '#0d47a1'); // Azul rey oscuro
    skyGrad.addColorStop(0.5, '#1976d2'); // Azul cielo
    skyGrad.addColorStop(1, '#64b5f6'); // Celeste lago
  } else if (weather === 'rainy') {
    skyGrad.addColorStop(0, '#263238'); // Acero oscuro
    skyGrad.addColorStop(0.6, '#37474f');
    skyGrad.addColorStop(1, '#546e7a'); // Gris húmedo
  } else if (weather === 'sunset') {
    skyGrad.addColorStop(0, '#4a148c'); // Púrpura atardecer
    skyGrad.addColorStop(0.4, '#880e4f'); // Magenta
    skyGrad.addColorStop(0.8, '#ff7043'); // Naranja cálido
    skyGrad.addColorStop(1, '#ffe082'); // Amarillo crepuscular
  } else if (weather === 'night' || weather === 'fog') {
    skyGrad.addColorStop(0, '#0a0b1e'); // Azul noche profundo
    skyGrad.addColorStop(0.6, '#11122a');
    skyGrad.addColorStop(1, '#1b1d3a'); // Azul grisáceo
  } else if (weather === 'storm') {
    skyGrad.addColorStop(0, '#1a0f30'); // Violeta oscuro tormenta
    skyGrad.addColorStop(0.7, '#2b1040');
    skyGrad.addColorStop(1, '#0e081c'); // Casi negro
  }
  
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Efecto Relámpago (Tormenta)
  if (weather === 'storm' && lightningFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlash})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    lightningFlash -= 0.08; // Se disipa rápidamente
  }

  // 2. Capa 2: Nubes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  if (weather === 'rainy' || weather === 'storm') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  }
  // Dibujamos algunas nubes fijas con velocidad muy lenta
  const time = Date.now() * 0.00004;
  for (let i = 0; i < 4; i++) {
    const cloudX = ((time * (i + 1) * 120) + (i * 240)) % (CANVAS_WIDTH + 150) - 100;
    const cloudY = 30 + i * 20;
    drawRetroCloud(cloudX, cloudY, 60 + i * 20, 20);
  }

  // 3. Capa 3: Volcanes alternados: Osorno (simétrico) y Calbuco (cráter colapsado irregular)
  // Se mueven al 8% de la velocidad del juego (Paralaje súper lento)
  bgOffsetVolcano -= gameSpeed * 0.08;
  const volcanoScroll = -bgOffsetVolcano;
  const startVolcanoBlock = Math.floor(volcanoScroll / CANVAS_WIDTH);
  for (let b = startVolcanoBlock; b <= startVolcanoBlock + 2; b++) {
    const drawX = b * CANVAS_WIDTH - volcanoScroll + 80;
    if (b % 2 === 0) {
      drawVolcanoOsorno(drawX);
    } else {
      drawVolcanoCalbuco(drawX);
    }
  }

  // 4. Capa 4: Lago Llanquihue
  bgOffsetLake -= gameSpeed * 0.2;
  const lakeScroll = -bgOffsetLake;
  const startLakeBlock = Math.floor(lakeScroll / CANVAS_WIDTH);
  for (let b = startLakeBlock; b <= startLakeBlock + 1; b++) {
    const drawX = b * CANVAS_WIDTH - lakeScroll;
    drawLakeLlanquihue(drawX);
  }

  // 5. Capa 5: Bosques Nativos y Casas de estilo alemán (Puerto Varas)
  bgOffsetForest -= gameSpeed * 0.45;
  const forestScroll = -bgOffsetForest;
  const startBlock = Math.floor(forestScroll / CANVAS_WIDTH);
  for (let b = startBlock; b <= startBlock + 1; b++) {
    const drawX = b * CANVAS_WIDTH - forestScroll;
    drawForestAndTown(drawX, b);
  }

  // 6. Capa 6: Suelo principal (Arena volcánica negra sureña)
  bgOffsetGround -= gameSpeed;
  const groundScroll = -bgOffsetGround;
  const startGroundBlock = Math.floor(groundScroll / CANVAS_WIDTH);
  for (let b = startGroundBlock; b <= startGroundBlock + 1; b++) {
    const drawX = b * CANVAS_WIDTH - groundScroll;
    drawVolcanicGround(drawX);
  }
}

// Dibujadores de elementos 8-bit específicos para el fondo

function drawRetroCloud(x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x, y + h * 0.3, w, h * 0.7);
  ctx.rect(x + w * 0.15, y, w * 0.7, h);
  ctx.rect(x + w * 0.3, y - h * 0.2, w * 0.4, h);
  ctx.fill();
}

function drawRetroBoat(x, y) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x + 10, y - 15);
  ctx.lineTo(x + 10, y - 2);
  ctx.lineTo(x + 22, y - 2);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#7c5335';
  ctx.fillRect(x + 8, y - 16, 2, 14);
  
  ctx.fillStyle = '#c62828';
  ctx.beginPath();
  ctx.moveTo(x, y - 2);
  ctx.lineTo(x + 4, y + 4);
  ctx.lineTo(x + 20, y + 4);
  ctx.lineTo(x + 24, y - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawChileanFlag(x, y) {
  ctx.save();
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(x, y - 24, 2, 24);
  
  ctx.fillStyle = '#0f47af';
  ctx.fillRect(x + 2, y - 24, 6, 5);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 8, y - 24, 10, 5);
  
  ctx.fillStyle = '#d61c4e';
  ctx.fillRect(x + 2, y - 19, 16, 5);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 4, y - 22, 2, 1);
  ctx.fillRect(x + 4, y - 23, 1, 3);
  ctx.restore();
}

function drawVolcanoOsorno(x) {
  const volBaseWidth = 260;
  const volHeight = 125;
  const volY = 220;
  
  ctx.fillStyle = (currentWeather === 'sunset') ? '#5c2a75' : ((currentWeather === 'night' || currentWeather === 'fog') ? '#181d2a' : '#333b4d');
  ctx.beginPath();
  ctx.moveTo(x, volY);
  ctx.lineTo(x + volBaseWidth / 2 - 20, volY - volHeight);
  ctx.lineTo(x + volBaseWidth / 2 + 20, volY - volHeight);
  ctx.lineTo(x + volBaseWidth, volY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  // Empezar en el borde inferior izquierdo de la nieve (45% de la ladera lateral)
  ctx.moveTo(x + volBaseWidth / 2 - 69.5, volY - volHeight * 0.55);
  ctx.lineTo(x + volBaseWidth / 2 - 20, volY - volHeight); // Ladera izquierda superior
  ctx.lineTo(x + volBaseWidth / 2 + 20, volY - volHeight); // Cumbre
  ctx.lineTo(x + volBaseWidth / 2 + 69.5, volY - volHeight * 0.55); // Ladera derecha superior
  
  // Lenguas de glaciar dentadas e irregulares (borde inferior pixelado)
  ctx.lineTo(x + volBaseWidth / 2 + 50, volY - volHeight * 0.60);
  ctx.lineTo(x + volBaseWidth / 2 + 35, volY - volHeight * 0.50); // Lengua larga derecha
  ctx.lineTo(x + volBaseWidth / 2 + 20, volY - volHeight * 0.58);
  ctx.lineTo(x + volBaseWidth / 2, volY - volHeight * 0.52); // Lengua media
  ctx.lineTo(x + volBaseWidth / 2 - 15, volY - volHeight * 0.60);
  ctx.lineTo(x + volBaseWidth / 2 - 30, volY - volHeight * 0.48); // Lengua larga izquierda
  ctx.lineTo(x + volBaseWidth / 2 - 45, volY - volHeight * 0.58);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = (currentWeather === 'sunset') ? '#2e143c' : ((currentWeather === 'night' || currentWeather === 'fog') ? '#0e111a' : '#1d222e');
  ctx.fillRect(x + volBaseWidth / 2 - 20, volY - volHeight - 2, 40, 4);

  const hasSombrero = (Math.floor((x + 10000) / 800) % 2 === 0);
  if (hasSombrero) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(x + volBaseWidth / 2, volY - volHeight - 12, 36, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x + volBaseWidth / 2, volY - volHeight - 12, 24, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (gameState === STATES.PLAYING && Math.random() < 0.015) {
    smokeParticles.push({
      x: x + volBaseWidth / 2 + (Math.random() * 8 - 4),
      y: volY - volHeight - 5,
      size: 3 + Math.random() * 4,
      vx: -0.1 - Math.random() * 0.3,
      vy: -0.2 - Math.random() * 0.4,
      alpha: 0.55
    });
  }
}

function drawVolcanoCalbuco(x) {
  const volBaseWidth = 280;
  const volHeight = 110;
  const volY = 220;
  
  ctx.fillStyle = (currentStage % 3 === 0) ? '#18141c' : ((currentWeather === 'sunset') ? '#461f5c' : ((currentWeather === 'night' || currentWeather === 'fog') ? '#121620' : '#282e3b'));
  ctx.beginPath();
  ctx.moveTo(x, volY);
  ctx.lineTo(x + volBaseWidth * 0.25, volY - volHeight * 0.65);
  ctx.lineTo(x + volBaseWidth * 0.40, volY - volHeight);
  ctx.lineTo(x + volBaseWidth * 0.48, volY - volHeight * 0.85);
  ctx.lineTo(x + volBaseWidth * 0.62, volY - volHeight * 0.95);
  ctx.lineTo(x + volBaseWidth * 0.75, volY - volHeight * 0.45);
  ctx.lineTo(x + volBaseWidth, volY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = (currentStage % 3 === 0) ? '#ff3300' : '#14171f';
  ctx.beginPath();
  ctx.moveTo(x + volBaseWidth * 0.40, volY - volHeight);
  ctx.lineTo(x + volBaseWidth * 0.48, volY - volHeight * 0.85);
  ctx.lineTo(x + volBaseWidth * 0.62, volY - volHeight * 0.95);
  ctx.lineTo(x + volBaseWidth * 0.58, volY - volHeight * 0.80);
  ctx.closePath();
  ctx.fill();

  // Dibujar nieve en el volcán Calbuco
  ctx.fillStyle = '#ffffff';
  
  // Pico 1 (Pico Izquierdo/Principal)
  ctx.beginPath();
  ctx.moveTo(x + volBaseWidth * 0.33, volY - volHeight * 0.80);
  ctx.lineTo(x + volBaseWidth * 0.40, volY - volHeight);
  ctx.lineTo(x + volBaseWidth * 0.45, volY - volHeight * 0.9125);
  ctx.lineTo(x + volBaseWidth * 0.43, volY - volHeight * 0.85);
  ctx.lineTo(x + volBaseWidth * 0.40, volY - volHeight * 0.88);
  ctx.lineTo(x + volBaseWidth * 0.37, volY - volHeight * 0.83);
  ctx.closePath();
  ctx.fill();

  // Pico 2 (Pico Derecho)
  ctx.beginPath();
  ctx.moveTo(x + volBaseWidth * 0.54, volY - volHeight * 0.89);
  ctx.lineTo(x + volBaseWidth * 0.62, volY - volHeight * 0.95);
  ctx.lineTo(x + volBaseWidth * 0.68, volY - volHeight * 0.72);
  ctx.lineTo(x + volBaseWidth * 0.65, volY - volHeight * 0.82);
  ctx.lineTo(x + volBaseWidth * 0.61, volY - volHeight * 0.85);
  ctx.lineTo(x + volBaseWidth * 0.58, volY - volHeight * 0.80);
  ctx.closePath();
  ctx.fill();

  if (currentStage % 3 === 0) {
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + volBaseWidth * 0.45, volY - volHeight * 0.9);
    ctx.lineTo(x + volBaseWidth * 0.38, volY - volHeight * 0.5);
    ctx.moveTo(x + volBaseWidth * 0.55, volY - volHeight * 0.85);
    ctx.lineTo(x + volBaseWidth * 0.62, volY - volHeight * 0.45);
    ctx.stroke();
  }
}

function drawLakeLlanquihue(x) {
  const lakeY = 210;
  const lakeHeight = 110;
  
  let waterGrad = ctx.createLinearGradient(0, lakeY, 0, lakeY + lakeHeight);
  if (currentStage % 3 === 0) {
    waterGrad.addColorStop(0, '#3a0815');
    waterGrad.addColorStop(0.5, '#7a1122');
    waterGrad.addColorStop(1, '#ab1822');
  } else if (currentWeather === 'sunset') {
    waterGrad.addColorStop(0, '#792461');
    waterGrad.addColorStop(0.5, '#ab3f57');
    waterGrad.addColorStop(1, '#ca5644');
  } else if (currentWeather === 'night' || currentWeather === 'fog') {
    waterGrad.addColorStop(0, '#061327'); // Azul noche profundo
    waterGrad.addColorStop(0.5, '#0b1d3a');
    waterGrad.addColorStop(1, '#020712'); // Casi negro en lo profundo
  } else {
    waterGrad.addColorStop(0, '#0077b6');
    waterGrad.addColorStop(0.5, '#0096c7');
    waterGrad.addColorStop(1, '#03045e');
  }
  
  ctx.fillStyle = waterGrad;
  ctx.fillRect(x, lakeY, CANVAS_WIDTH, lakeHeight);

  if (currentStage % 3 !== 0) {
    drawRetroBoat(x + 180, lakeY + 25);
    drawRetroBoat(x + 550, lakeY + 65);
  }

  ctx.fillStyle = (currentStage % 3 === 0) ? '#ffcc00' : (currentWeather === 'sunset' ? '#ffd166' : ((currentWeather === 'night' || currentWeather === 'fog') ? '#2c5370' : '#90e0ef'));
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 6; i++) {
    const waveX = (x + (i * 150)) % CANVAS_WIDTH;
    const waveY = lakeY + 15 + (i * 15);
    const waveLen = 40 + (i * 20);
    ctx.fillRect(waveX, waveY, waveLen, 3);
  }
  ctx.globalAlpha = 1.0;
}

function drawForestAndTown(x, blockId = 0) {
  const forestY = 290;
  
  // 1. Color de fondo del bosque (follaje lejano)
  ctx.fillStyle = (currentStage % 3 === 0) ? '#1f040a' : 
                  (currentWeather === 'sunset' ? '#3d1c3c' : 
                  ((currentWeather === 'night' || currentWeather === 'fog') ? '#081d0f' : '#1b5e20'));
  ctx.fillRect(x, 285, CANVAS_WIDTH, GROUND_Y - 285);

  // Lógica de transición a pradera verde limpia en etapa 10
  const isMeadow = isTransitioningToMeadow && (blockId >= meadowStartBlock);
  if (isMeadow) {
    // Si es pradera verde en etapa 10, no dibujamos árboles ni casas
    return;
  }
  
  // 2. Colores para los árboles del primer plano
  const trunkColor = (currentStage % 3 === 0) ? '#120205' : 
                      (currentWeather === 'sunset' ? '#2c142c' : 
                      ((currentWeather === 'night' || currentWeather === 'fog') ? '#041008' : '#3e2723')); // café tronco
  const leafColor = (currentStage % 3 === 0) ? '#120205' : 
                     (currentWeather === 'sunset' ? '#250d24' : 
                     ((currentWeather === 'night' || currentWeather === 'fog') ? '#04150a' : '#143825'));

  // Renderizar 8 árboles con variedad
  for (let i = 0; i < 8; i++) {
    const treeX = x + i * 110 + 20;
    const treeY = forestY - 10;
    
    // Determinar tipo de árbol procedural de forma estable
    const treeType = (i + blockId * 8) % 3;
    
    if (treeType === 0) {
      // Pino clásico triangular
      ctx.fillStyle = trunkColor;
      ctx.fillRect(treeX + 6, treeY, 4, 25);
      
      ctx.fillStyle = leafColor;
      ctx.beginPath();
      ctx.moveTo(treeX - 10, treeY + 10);
      ctx.lineTo(treeX + 8, treeY - 20);
      ctx.lineTo(treeX + 26, treeY + 10);
      ctx.closePath();
      ctx.fill();
    } else if (treeType === 1) {
      // Roble copa redonda retro
      ctx.fillStyle = trunkColor;
      ctx.fillRect(treeX + 6, treeY + 4, 4, 21);
      
      ctx.fillStyle = leafColor;
      ctx.beginPath();
      ctx.arc(treeX + 8, treeY - 2, 12, 0, Math.PI * 2);
      ctx.arc(treeX, treeY + 6, 8, 0, Math.PI * 2);
      ctx.arc(treeX + 16, treeY + 6, 8, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    } else {
      // Ciprés alto y delgado
      ctx.fillStyle = trunkColor;
      ctx.fillRect(treeX + 6, treeY + 8, 4, 17);
      
      ctx.fillStyle = leafColor;
      ctx.fillRect(treeX + 2, treeY - 12, 12, 22);
      ctx.fillRect(treeX + 4, treeY - 18, 8, 6);
      ctx.fillRect(treeX + 6, treeY - 22, 4, 4);
    }
  }

  // 3. Colores para edificaciones
  const houseColor = (currentStage % 3 === 0) ? '#170307' : 
                     (currentWeather === 'sunset' ? '#4d1c42' : 
                     ((currentWeather === 'night' || currentWeather === 'fog') ? '#22252c' : '#8d6e63'));
  const roofColor = (currentStage % 3 === 0) ? '#38060f' : 
                    (currentWeather === 'sunset' ? '#681c3c' : 
                    ((currentWeather === 'night' || currentWeather === 'fog') ? '#4d1919' : '#c62828'));
  const windowColor = (currentStage % 3 === 0) ? '#ff5500' : '#ffe082';

  // Renderizar 3 edificios con variedad alemana
  for (let i = 0; i < 3; i++) {
    const houseX = x + i * 290 + 70;
    const houseY = forestY + 5;
    
    // Determinar tipo de edificación según bloque e índice
    const buildingType = (i + blockId * 7) % 4;
    
    // Bandera de vez en cuando de forma orgánica y estable (1 de cada 5 edificios)
    const hasFlag = ((i + blockId * 5) % 5 === 0);
    
    if (buildingType === 0) {
      // Casa Alemana Estándar (Cottage)
      ctx.fillStyle = houseColor;
      ctx.fillRect(houseX, houseY, 40, 25);
      
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(houseX - 5, houseY);
      ctx.lineTo(houseX + 20, houseY - 18);
      ctx.lineTo(houseX + 45, houseY);
      ctx.closePath();
      ctx.fill();

      // Ventanas
      ctx.fillStyle = windowColor;
      ctx.fillRect(houseX + 8, houseY + 6, 8, 8);
      ctx.fillRect(houseX + 24, houseY + 6, 8, 8);
      
      if (hasFlag && currentStage % 3 !== 0) {
        drawChileanFlag(houseX + 32, houseY + 2);
      }
    } else if (buildingType === 1) {
      // Mansión Alemana de 2 Pisos
      const mansionY = houseY - 12;
      ctx.fillStyle = houseColor;
      ctx.fillRect(houseX, mansionY, 45, 37);
      
      ctx.fillStyle = roofColor;
      ctx.fillRect(houseX - 3, mansionY - 4, 51, 5);
      ctx.beginPath();
      ctx.moveTo(houseX, mansionY - 4);
      ctx.lineTo(houseX + 22, mansionY - 20);
      ctx.lineTo(houseX + 45, mansionY - 4);
      ctx.closePath();
      ctx.fill();

      // Ventanas de dos pisos
      ctx.fillStyle = windowColor;
      ctx.fillRect(houseX + 8, mansionY + 6, 8, 8);
      ctx.fillRect(houseX + 28, mansionY + 6, 8, 8);
      ctx.fillRect(houseX + 8, mansionY + 20, 8, 8);
      ctx.fillRect(houseX + 28, mansionY + 20, 8, 8);
      
      if (hasFlag && currentStage % 3 !== 0) {
        drawChileanFlag(houseX + 36, mansionY + 2);
      }
    } else if (buildingType === 2) {
      // Iglesia de Reloj Colonial (Sagrado Corazón)
      const churchY = houseY;
      ctx.fillStyle = houseColor;
      ctx.fillRect(houseX + 18, churchY, 32, 25);
      
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(houseX + 15, churchY);
      ctx.lineTo(houseX + 34, churchY - 14);
      ctx.lineTo(houseX + 53, churchY);
      ctx.closePath();
      ctx.fill();

      // Torre alta
      const towerX = houseX;
      const towerY = churchY - 25;
      ctx.fillStyle = houseColor;
      ctx.fillRect(towerX, towerY, 18, 50);
      
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(towerX - 2, towerY);
      ctx.lineTo(towerX + 9, towerY - 28);
      ctx.lineTo(towerX + 20, towerY);
      ctx.closePath();
      ctx.fill();

      // Cruz arriba de la aguja
      ctx.fillStyle = (currentStage % 3 === 0) ? '#ff5500' : '#d61c4e';
      ctx.fillRect(towerX + 8, towerY - 34, 2, 8);
      ctx.fillRect(towerX + 5, towerY - 31, 8, 2);

      // Reloj circular
      ctx.fillStyle = windowColor;
      ctx.fillRect(towerX + 5, towerY + 8, 8, 8);
      
      // Ventanas de arco
      ctx.fillRect(houseX + 24, churchY + 6, 6, 12);
      ctx.fillRect(houseX + 38, churchY + 6, 6, 12);
      
      if (hasFlag && currentStage % 3 !== 0) {
        drawChileanFlag(houseX + 44, churchY + 2);
      }
    } else {
      // Chalet Sureño con Bandera Permanente
      ctx.fillStyle = houseColor;
      ctx.fillRect(houseX, houseY + 4, 40, 21); // Base de madera
      
      // Detalles de vigas verticales de madera
      ctx.fillStyle = (currentStage % 3 === 0) ? '#120205' : '#5d4037';
      ctx.fillRect(houseX + 8, houseY + 4, 3, 21);
      ctx.fillRect(houseX + 20, houseY + 4, 3, 21);
      ctx.fillRect(houseX + 32, houseY + 4, 3, 21);
      
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(houseX - 4, houseY + 4);
      ctx.lineTo(houseX + 20, houseY - 14);
      ctx.lineTo(houseX + 44, houseY + 4);
      ctx.closePath();
      ctx.fill();

      // Chimenea
      ctx.fillStyle = (currentStage % 3 === 0) ? '#120205' : '#4e342e';
      ctx.fillRect(houseX + 6, houseY - 10, 6, 12);
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(houseX + 5, houseY - 12, 8, 2);

      // Humo retro de la chimenea
      const smokeTime = Date.now() * 0.003;
      ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
      ctx.fillRect(houseX + 7 + Math.sin(smokeTime) * 2, houseY - 18, 4, 4);
      ctx.fillRect(houseX + 8 + Math.cos(smokeTime) * 3, houseY - 24, 5, 5);

      // Ventana
      ctx.fillStyle = windowColor;
      ctx.fillRect(houseX + 13, houseY + 10, 6, 8);
      ctx.fillRect(houseX + 25, houseY + 10, 6, 8);

      // Bandera permanente a la derecha
      if (currentStage % 3 !== 0) {
        drawChileanFlag(houseX + 38, houseY - 4);
      }
    }
  }
}

/**
 * Dibuja el asta y la bandera chilena de meta física.
 * Se dibuja en pixel art retro puro con gradientes y bordes nítidos.
 */
function drawFlagpole() {
  if (!flagpole) return;
  
  // Dibujar asta (tubo gris metálico con esfera dorada arriba)
  ctx.fillStyle = '#94a3b8'; // Gris metal
  ctx.fillRect(flagpole.x, flagpole.y, 6, flagpole.height);
  
  ctx.fillStyle = '#fbbf24'; // Oro esfera superior
  ctx.fillRect(flagpole.x - 2, flagpole.y - 6, 10, 6);
  
  // Dibujar bandera chilena izándose
  // Altura del asta = 140px. La bandera mide 36x24.
  // flagY va desde flagpole.y + flagpole.height - 30 (abajo) hasta flagpole.y + 10 (arriba)
  const minY = flagpole.y + flagpole.height - 30;
  const maxY = flagpole.y + 10;
  const flagY = minY - (minY - maxY) * (flagpole.flagRaisedPercent / 100);
  
  const flagWidth = 36;
  const flagHeight = 24;
  const flagX = flagpole.x + 6;
  
  // Fondo/Base de la bandera
  // Mitad superior izquierda: azul (12x12)
  ctx.fillStyle = '#002f6c'; // Azul chileno oscuro premium
  ctx.fillRect(flagX, flagY, 12, 12);
  
  // Estrella blanca en el centro de la zona azul
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(flagX + 5, flagY + 4, 2, 4);
  ctx.fillRect(flagX + 4, flagY + 5, 4, 2);
  
  // Mitad superior derecha: blanco (24x12)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(flagX + 12, flagY, 24, 12);
  
  // Mitad inferior: rojo (36x12)
  ctx.fillStyle = '#c8102e'; // Rojo chileno premium
  ctx.fillRect(flagX, flagY + 12, 36, 12);
  
  // Borde negro fino retro
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(flagX, flagY, flagWidth, flagHeight);
}

function drawVolcanicGround(x) {
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(x, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
  
  ctx.fillStyle = (currentStage % 3 === 0) ? '#4a0815' : ((currentWeather === 'night' || currentWeather === 'fog') ? '#0c3516' : '#2e7d32');
  ctx.fillRect(x, GROUND_Y, CANVAS_WIDTH, 6);

  ctx.fillStyle = '#121212';
  for (let i = 0; i < 8; i++) {
    const detailX = x + i * 110 + (i % 2 * 30);
    const detailY = GROUND_Y + 20 + (i % 3 * 15);
    ctx.fillRect(detailX, detailY, 12, 4);
    ctx.fillRect(detailX + 4, detailY - 4, 4, 12);
  }
}


// ==========================================
// --- CLIMA PARTICULAS Y DETALLES DINÁMICOS ---
// ==========================================

function updateWeatherEffects() {
  // Humo del Volcán (solo si no es erupción)
  if (currentStage % 3 !== 0) {
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      const p = smokeParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.003;
      if (p.alpha <= 0) {
        smokeParticles.splice(i, 1);
      }
    }
  }

  // Destellos de doble salto (rosa)
  for (let i = sparkleParticles.length - 1; i >= 0; i--) {
    const p = sparkleParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.03;
    if (p.alpha <= 0) {
      sparkleParticles.splice(i, 1);
    }
  }

  // Erupción del Volcán Calbuco (Etapa de peligro)
  if (currentStage % 3 === 0 && gameState === STATES.PLAYING) {
    // Engendrar partículas de lava
    if (Math.random() < 0.25) {
      const volcanoScroll = -bgOffsetVolcano;
      const startVolcanoBlock = Math.floor(volcanoScroll / CANVAS_WIDTH);
      let spawnX = -999;
      for (let b = startVolcanoBlock; b <= startVolcanoBlock + 2; b++) {
        if (b % 2 === 1) {
          const drawX = b * CANVAS_WIDTH - volcanoScroll + 80;
          if (drawX > -280 && drawX < CANVAS_WIDTH + 100) {
            spawnX = drawX;
            break;
          }
        }
      }
      
      const craterX = spawnX + 140; // Centro de la erupción de Calbuco
      const craterY = 130;
      
      lavaParticles.push({
        x: craterX,
        y: craterY,
        size: 2.5 + Math.random() * 4,
        vx: Math.random() * 4 - 2.5 - 0.8, // tiende a ir al lado izquierdo por el viento
        vy: -6 - Math.random() * 5, // fuerte impulso hacia arriba
        gravity: 0.18,
        color: Math.random() < 0.7 ? '#ff3300' : '#ffcc00', // Rojo lava o amarillo brillante
        alpha: 1.0
      });
    }
  }

  // Actualizar partículas de lava
  for (let i = lavaParticles.length - 1; i >= 0; i--) {
    const p = lavaParticles[i];
    p.x += p.vx;
    p.vy += p.gravity;
    p.y += p.vy;
    
    if (p.y >= GROUND_Y || p.x < -30 || p.x > CANVAS_WIDTH + 30) {
      lavaParticles.splice(i, 1);
    }
  }

  // Lluvia o Tormenta - Generación de partículas
  if (currentWeather === 'rainy' || currentWeather === 'storm') {
    const maxDrops = currentWeather === 'storm' ? 14 : 7;
    // Agregar nuevas gotas de lluvia
    for (let i = 0; i < maxDrops; i++) {
      rainParticles.push({
        x: Math.random() * (CANVAS_WIDTH + 200) - 100,
        y: -10,
        length: 8 + Math.random() * 12,
        speed: 9 + Math.random() * 6,
        angle: 1.6 + Math.random() * 0.2 // Cae ligeramente en diagonal por el viento
      });
    }

    // Gatillar destellos de relámpago aleatorios en Tormenta
    if (currentWeather === 'storm' && Math.random() < 0.003 && lightningFlash <= 0) {
      lightningFlash = 0.9;
      // Rumble de trueno de fondo: bajamos volumen de música momentáneamente y hacemos parpadear la UI
      triggerStormLightningUI();
    }
  }

  // Actualizar gotas existentes (SIEMPRE se ejecuta para terminar de caer al cambiar de etapa)
  for (let i = rainParticles.length - 1; i >= 0; i--) {
    const drop = rainParticles[i];
    // Movimiento diagonal
    drop.x -= Math.cos(drop.angle) * drop.speed;
    drop.y += Math.sin(drop.angle) * drop.speed;

    // Si choca con el suelo, simular un pequeño chapoteo
    if (drop.y >= GROUND_Y) {
      // Splashes en el pasto/tierra
      if (Math.random() < 0.15 && drop.x > 0 && drop.x < CANVAS_WIDTH) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(drop.x, GROUND_Y - 2, 3, 2);
      }
      rainParticles.splice(i, 1);
    }
  }

  // Generación y actualización de Partículas de Viento (Tornado)
  if (currentWeather === 'tornado') {
    if (Math.random() < 0.5) {
      windParticles.push({
        x: CANVAS_WIDTH + 50,
        y: Math.random() * (CANVAS_HEIGHT - 60) + 10,
        length: 40 + Math.random() * 70,
        speed: 12 + Math.random() * 8,
        opacity: 0.12 + Math.random() * 0.22,
        angle: Math.random() * 0.1 - 0.05
      });
    }
  }

  for (let i = windParticles.length - 1; i >= 0; i--) {
    const p = windParticles[i];
    p.x -= p.speed;
    // Sutil oscilación vertical para simular torbellino
    p.y += Math.sin(p.x * 0.02) * 2.5;
    if (p.x < -p.length) {
      windParticles.splice(i, 1);
    }
  }
}

function drawWeatherEffects() {
  // 1. Humo del Volcán (si no es erupción)
  if (currentStage % 3 !== 0) {
    ctx.fillStyle = 'rgba(230, 230, 230, 0.4)';
    smokeParticles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
    });
    ctx.globalAlpha = 1.0;
  }

  // 2. Gotas de lluvia
  ctx.strokeStyle = currentWeather === 'storm' ? 'rgba(150, 180, 255, 0.35)' : 'rgba(180, 220, 255, 0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  rainParticles.forEach(drop => {
    const endX = drop.x - Math.cos(drop.angle) * drop.length;
    const endY = drop.y + Math.sin(drop.angle) * drop.length;
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(endX, endY);
  });
  ctx.stroke();

  // 3. Destellos de doble salto (rosa)
  sparkleParticles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
  });
  ctx.globalAlpha = 1.0;

  // 4. Partículas de Lava del Volcán en erupción
  if (currentStage % 3 === 0) {
    lavaParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
    });
    ctx.globalAlpha = 1.0;
  }

  // 5. Partículas de Viento (Tornado)
  if (currentWeather === 'tornado') {
    windParticles.forEach(p => {
      ctx.strokeStyle = `rgba(220, 230, 250, ${p.opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const endX = p.x + p.length;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(endX, p.y + Math.sin(p.x * 0.02) * 2);
      ctx.stroke();
    });
  }
}

function triggerStormLightningUI() {
  const container = document.querySelector('.game-screen-wrapper');
  if (container) {
    container.classList.add('storm-lightning');
    setTimeout(() => {
      container.classList.remove('storm-lightning');
    }, 400);
  }
}


// ==========================================
// --- REAPARICIÓN DE OBSTÁCULOS / SPAWN ---
// ==========================================

function updateSpawns() {
  if (isTransitioningToMeadow) {
    return; // No spawnear nada durante la transición a la pradera limpia
  }

  spawnTimer += 16.67; // Aprox 60fps (1000/60)

  if (spawnTimer >= nextSpawnTime) {
    spawnTimer = 0;
    
    // Configurar tiempo para el siguiente spawn aleatorio decreciente con la dificultad
    const difficultyFactor = Math.max(0.4, 1.0 - (gameSpeed - 5.0) * 0.07);
    nextSpawnTime = minSpawnInterval + Math.random() * 1500 * difficultyFactor;

    // Decidir aleatoriamente qué spawnear
    // Probabilidades actualizadas: 25% Obstáculo Terrestre, 15% Queltehue (ave), 35% Salmón, 15% Kuchen, 10% Especiales
    const rand = Math.random();
    
    if (rand < 0.25) {
      // Spawn Obstáculo terrestre (25%)
      // 'cow' duplicado para dar 40% de probabilidad relativa dentro de la categoría
      const types = ['cow', 'cow', 'fence', 'stone', 'hole'];
      // Si la velocidad es baja, evitar vacas demasiado seguidas
      let typeIdx = Math.floor(Math.random() * types.length);
      if (types[typeIdx] === 'cow' && gameSpeed < 5.5 && obstacles.filter(o => o.type === 'cow').length > 0) {
        typeIdx = 3; // piedra en su lugar
      }
      obstacles.push(new Obstacle(types[typeIdx]));
    } else if (rand < 0.40) {
      // Spawn Queltehue flying obstacle (15%)
      obstacles.push(new Obstacle('queltehue'));
    } else if (rand < 0.75) {
      // Spawn Salmón (35%)
      collectibles.push(new Collectible('salmon'));
    } else if (rand < 0.90) {
      // Spawn Kuchen (15%)
      collectibles.push(new Collectible('kuchen'));
    } else {
      // El 10% restante se reparte en: 6% para Rosa y 4% para Hueso de vida extra
      const subRand = Math.random();
      if (subRand < 0.6) {
        // Spawn Rosa Roja de Puerto Varas (6%)
        if (collectibles.filter(c => c.type === 'rose').length === 0) {
          collectibles.push(new Collectible('rose'));
        } else {
          collectibles.push(new Collectible('salmon'));
        }
      } else {
        // Spawn Hueso Blanco de Vida Extra (4%)
        collectibles.push(new Collectible('bone'));
      }
    }
  }
}


// ==========================================
// --- COMPROBACIÓN DE COLISIONES (AABB) ---
// ==========================================

function checkCollisions() {
  const tBox = terrier.getCollisionBox();

  // 1. Colisiones con Obstáculos (Vacas, cercas...) -> GAME OVER / ESCUDO / VIDAS
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    
    // Si es verja (fence) y el terrier está agachado (duck), ignorar colisión
    if (obs.type === 'fence' && terrier.state === 'duck') {
      continue;
    }
    
    const oBox = obs.getCollisionBox();

    if (tBox.x < oBox.x + oBox.width &&
        tBox.x + tBox.width > oBox.x &&
        tBox.y < oBox.y + oBox.height &&
        tBox.y + tBox.height > oBox.y) {
      
      // Si tiene el escudo activo (hasDoubleJump)
      if (hasDoubleJump) {
        doubleJumpTimer -= 15000;
        if (doubleJumpTimer <= 0) {
          doubleJumpTimer = 0;
          hasDoubleJump = false;
        }
        
        if (window.audioEngine && window.audioEngine.playShieldAbsorbSound) {
          window.audioEngine.playShieldAbsorbSound();
        }
        
        // Spawnear 15 partículas de rosas
        for (let j = 0; j < 15; j++) {
          sparkleParticles.push({
            x: obs.x + obs.width / 2,
            y: obs.y + obs.height / 2,
            size: 3 + Math.random() * 5,
            vx: (Math.random() * 8 - 4),
            vy: (Math.random() * 6 - 4),
            color: Math.random() < 0.6 ? '#d61c4e' : '#ffb3c6',
            alpha: 0.9
          });
        }
        
        // Si es un hoyo, propulsamos a Cholga hacia arriba con un gran salto
        if (obs.type === 'hole') {
          terrier.vy = JUMP_FORCE * 1.0;
          terrier.isGrounded = false;
          terrier.state = 'jump';
        }
        
        // Eliminar el obstáculo chocado para poder pasar
        obstacles.splice(i, 1);
        i--;
        continue;
      }
      
      // Si no tiene escudo pero tiene vidas extra (lives > 1), descontar una vida
      if (lives > 1) {
        lives--;
        if (window.audioEngine && window.audioEngine.playPainYipSound) {
          window.audioEngine.playPainYipSound();
        }
        
        // Spawnear 15 partículas de huesos blancas
        for (let j = 0; j < 15; j++) {
          sparkleParticles.push({
            x: obs.x + obs.width / 2,
            y: obs.y + obs.height / 2,
            size: 3 + Math.random() * 4,
            vx: (Math.random() * 8 - 4),
            vy: (Math.random() * 6 - 4),
            color: '#ffffff', // Hueso blanco
            alpha: 0.9
          });
        }
        
        // Eliminar el obstáculo chocado para poder pasar
        obstacles.splice(i, 1);
        i--;
        updateUI();
        continue;
      }
      
      // Si choca con un hoyo y no le quedan vidas extras, inicia la animación de caer en el hoyo
      if (obs.type === 'hole') {
        gameState = STATES.DYING;
        terrier.state = 'fall_hole';
        
        // Registrar coordenadas de muerte
        deathX = terrier.x;
        deathY = terrier.y;
        ghostY = deathY;
        
        // Detener velocidad del juego
        gameSpeed = 0;
        
        if (window.audioEngine) window.audioEngine.playGameOverSound();
        return;
      }
      
      // ¡Colisión fatal estándar con otro obstáculo!
      gameState = STATES.DYING;
      terrier.state = 'crash';
      terrier.vy = -7.5; // Salto inicial estilo Mario Bros
      
      // Registrar coordenadas de muerte para la animación del fantasma
      deathX = terrier.x;
      deathY = terrier.y;
      ghostY = deathY;
      
      // Detener velocidad del juego
      gameSpeed = 0;
      
      if (window.audioEngine) window.audioEngine.playGameOverSound();
      return;
    }
  }

  // 2. Colisiones con Collectibles (Salmones, kuchens, rosas, huesos) -> Captura feliz
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const col = collectibles[i];
    const cBox = col.getCollisionBox();

    if (tBox.x < cBox.x + cBox.width &&
        tBox.x + tBox.width > cBox.x &&
        tBox.y < cBox.y + cBox.height &&
        tBox.y + tBox.height > cBox.y) {
      
      // Coleccionado con éxito
      if (col.type === 'salmon') {
        salmonsCount++;
        score += Math.floor(300 * multiplier);
        if (window.audioEngine) window.audioEngine.playCatchSalmonSound();
      } else if (col.type === 'kuchen') {
        kuchensCount++;
        score += Math.floor(150 * multiplier);
        multiplier = Math.min(5.0, Number((multiplier + 0.2).toFixed(1))); // Multiplicador máximo x5.0
        if (window.audioEngine) window.audioEngine.playCatchKuchenSound();
      } else if (col.type === 'rose') {
        hasDoubleJump = true;
        doubleJumpTimer = (doubleJumpTimer || 0) + 15000; // 15 segundos acumulativos
        if (window.audioEngine) window.audioEngine.playPowerUpSound();
      } else if (col.type === 'bone') {
        lives++;
        if (window.audioEngine) window.audioEngine.playOneUpSound();
        // Generar texto flotante "1-UP!" en verde neón sobre Cholga
        floatyTexts.push({
          text: "1-UP!",
          x: terrier.x + terrier.width / 2,
          y: terrier.y - 10,
          vy: -1.5,
          alpha: 1.0,
          color: '#39ff14' // Verde neón brillante
        });
        // Generar unas lindas partículas blancas de hueso recogido
        for (let j = 0; j < 8; j++) {
          sparkleParticles.push({
            x: col.x + col.width / 2,
            y: col.y + col.height / 2,
            size: 2 + Math.random() * 3,
            vx: (Math.random() * 4 - 2),
            vy: (Math.random() * -3 - 1),
            color: '#ffffff',
            alpha: 0.95
          });
        }
      }
      
      // Eliminar del array
      collectibles.splice(i, 1);
      
      // Actualizar UI lateral al instante
      updateUI();
    }
  }
}


// ==========================================
// --- LOOP PRINCIPAL Y ACTUALIZACIONES ---
// ==========================================

function updateGame() {
  if (isFlagpoleCutscene) {
    flagpoleCutsceneTimer++;
    if (flagpole) {
      flagpole.flagRaisedPercent = Math.min(100, flagpoleCutsceneTimer / 6.6);
    }
    
    // Forzar Terrier al piso en posición idle
    terrier.y = GROUND_Y - 48;
    terrier.vy = 0;
    terrier.isGrounded = true;
    terrier.state = 'idle';
    
    if (flagpole && flagpole.flagRaisedPercent >= 100) {
      gameState = STATES.CUTSCENE;
      cutsceneStage = 0;
      gameSpeed = 4.0; // velocidad para que la cabaña se deslice hermosamente
      cabinX = CANVAS_WIDTH + 100;
      eloisaX = CANVAS_WIDTH + 240;
      eloisaY = GROUND_Y - 48;
      eloisaSprite = CINEMATIC_SPRITES.eloisa;
      isFlagpoleCutscene = false;
    }
    
    updateWeatherEffects();
    return;
  }

  if (gameState !== STATES.PLAYING) return;

  // Lógica de meta física en Etapa 10
  if (currentStage === 10) {
    if (distanceTraveled >= 10 * DISTANCE_PER_STAGE - 25) {
      if (!isTransitioningToMeadow) {
        isTransitioningToMeadow = true;
        meadowStartBlock = Math.floor((-bgOffsetForest) / CANVAS_WIDTH) + 1;
      }
      
      // Spawnear la asta de bandera justo antes de llegar al límite
      if (distanceTraveled >= 10 * DISTANCE_PER_STAGE - 5 && !flagpole) {
        flagpole = {
          x: CANVAS_WIDTH + 50,
          y: GROUND_Y - 140,
          width: 6,
          height: 140,
          flagRaisedPercent: 0
        };
      }
    }
  }

  // Actualizar asta de bandera y su colisión
  if (flagpole && !isFlagpoleCutscene) {
    flagpole.x -= gameSpeed;
    
    // Comprobar colisión física con Terrier
    if (terrier.x >= flagpole.x - 10) {
      isFlagpoleCutscene = true;
      flagpoleCutsceneTimer = 0;
      gameSpeed = 0;
      
      terrier.y = GROUND_Y - 48;
      terrier.vy = 0;
      terrier.isGrounded = true;
      terrier.state = 'idle';
      
      if (window.audioEngine && window.audioEngine.playChileanAnthem) {
        window.audioEngine.playChileanAnthem();
      }
    }
  }

  // Aumentar velocidad paulatinamente
  gameSpeed += 0.0007;
  if (window.audioEngine) {
    window.audioEngine.setMusicTempo(gameSpeed / 5.0);
  }

  // Spawn de rocas volcánicas si el clima es erupción
  if (currentWeather === 'eruption') {
    volcanicRockTimer += 16.67;
    if (volcanicRockTimer >= volcanicRockInterval) {
      volcanicRockTimer = 0;
      volcanicRockInterval = 600 + Math.random() * 800;
      obstacles.push(new Obstacle('volcanicRock'));
    }
  }

  // Spawn de vacas voladoras si el clima es tornado
  if (currentWeather === 'tornado') {
    tornadoCowTimer += 16.67;
    if (tornadoCowTimer >= tornadoCowInterval) {
      tornadoCowTimer = 0;
      tornadoCowInterval = 700 + Math.random() * 800;
      obstacles.push(new Obstacle('flyingCow'));
    }
  }

  // Actualizar Terrier
  terrier.update();

  // Actualizar bocadillo de ladrido
  if (barkBubble) {
    barkBubble.timer--;
    barkBubble.y -= 0.6; // Flota sutilmente hacia arriba
    barkBubble.x = terrier.x + terrier.width - 4; // Se desplaza solidario con el perrito
    if (barkBubble.timer <= 0) {
      barkBubble = null;
    }
  }

  // Actualizar Obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update();
    
    // Detectar si el terrier saltó sobre el obstáculo (lo pasó en X)
    if (!obs.passed && terrier.x > obs.x + obs.width) {
      obs.passed = true;
      if (obs.type === 'cow' && window.audioEngine && window.audioEngine.playMooSound) {
        window.audioEngine.playMooSound();
      }
    }
    
    if (obs.isOutOfBounds()) {
      obstacles.splice(i, 1);
    }
  }

  // Actualizar Collectibles
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const col = collectibles[i];
    col.update();
    if (col.isOutOfBounds()) {
      // Si dejamos pasar un kuchen sin recolectarlo, el multiplicador baja sutilmente como penalización
      if (col.type === 'kuchen') {
        multiplier = Math.max(1.0, Number((multiplier - 0.1).toFixed(1)));
      }
      collectibles.splice(i, 1);
    }
  }

  // Spawns de obstáculos y premios
  updateSpawns();

  // Comprobar Choques
  checkCollisions();

  // Clima
  updateWeatherEffects();

  // Actualizar textos flotantes
  for (let i = floatyTexts.length - 1; i >= 0; i--) {
    const ft = floatyTexts[i];
    ft.y += ft.vy;
    ft.alpha -= 0.02;
    if (ft.alpha <= 0) {
      floatyTexts.splice(i, 1);
    }
  }

  // Actualizar temporizador de Doble Salto si está activo
  if (hasDoubleJump) {
    doubleJumpTimer -= 16.67; // Aprox 60fps
    if (doubleJumpTimer <= 0) {
      hasDoubleJump = false;
      doubleJumpTimer = 0;
    }
  }

  // Puntaje por distancia recorrida continua
  distanceTraveled += gameSpeed * 0.03;
  score += Math.floor(multiplier); // El puntaje avanza más rápido si tienes más kuchens
  // Verificar cambio de etapa
  const calculatedStage = Math.floor(distanceTraveled / DISTANCE_PER_STAGE) + 1;
  if (calculatedStage !== currentStage) {
    // Si completamos 10 etapas (ej. completamos la 10 y pasaríamos a la 11, que gatilla cuando calculatedStage === 11)
    if (calculatedStage > 1 && (calculatedStage - 1) % 10 === 0) {
      if (currentStage !== 10) {
        gameState = STATES.CUTSCENE;
        cutsceneStage = 0;
        cabinX = CANVAS_WIDTH + 100;
        eloisaX = CANVAS_WIDTH + 240;
        eloisaY = GROUND_Y - 48;
        eloisaSprite = CINEMATIC_SPRITES.eloisa;
        
        if (window.audioEngine && window.audioEngine.stopMusic) {
          window.audioEngine.stopMusic();
        }
      }
    } else {
      currentStage = calculatedStage;
      applyStageEnvironment(currentStage);
      stageTransitionTimer = 180; // 3 segundos (180 frames)
      
      if (currentStage % 3 === 0) {
        stageTransitionText = `¡ETAPA ${currentStage}: ALERTA VOLCÁNICA!`;
        if (window.audioEngine) {
          window.audioEngine.setDangerTheme(true);
          window.audioEngine.playPowerUpSound(); // Sonido emocionante
        }
      } else {
        stageTransitionText = `ETAPA ${currentStage}`;
        if (window.audioEngine) {
          window.audioEngine.setDangerTheme(false);
          window.audioEngine.playPowerUpSound(); // Sonido agradable
        }
      }
    }
  }

  if (stageTransitionTimer > 0) {
    stageTransitionTimer--;
  }

  updateUI();
}

function drawStageTransitionBanner() {
  ctx.save();
  
  const centerY = 80;
  // Panel central semitransparente en el cielo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, centerY - 18, CANVAS_WIDTH, 36);
  
  // Borde superior e inferior retro
  ctx.fillStyle = (currentStage % 3 === 0) ? '#d61c4e' : '#ffe066'; // Rojo si es volcán, amarillo normal
  ctx.fillRect(0, centerY - 18, CANVAS_WIDTH, 3);
  ctx.fillRect(0, centerY + 15, CANVAS_WIDTH, 3);
  
  // Texto de la Etapa
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Parpadeo sutil en la animación
  if (Math.floor(stageTransitionTimer / 10) % 2 === 0) {
    ctx.fillText(stageTransitionText, CANVAS_WIDTH / 2, centerY);
  } else {
    ctx.fillStyle = (currentStage % 3 === 0) ? '#ff7096' : '#ffe066';
    ctx.fillText(stageTransitionText, CANVAS_WIDTH / 2, centerY);
  }
  
  ctx.restore();
}

function drawGame() {
  ctx.save();
  
  // Si estamos en etapa roja de volcán, aplicar temblor (terremoto)
  if (currentStage % 3 === 0 && gameState === STATES.PLAYING) {
    let shakeX = Math.random() * 2.5 - 1.25;
    let shakeY = Math.random() * 2.5 - 1.25;
    
    // Golpes más fuertes ocasionales
    if (Math.random() < 0.05) {
      shakeX = Math.random() * 7 - 3.5;
      shakeY = Math.random() * 7 - 3.5;
    }
    
    ctx.translate(shakeX, shakeY);
  }

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 1. Dibujar el fondo Parallax completo
  drawParallax(currentWeather);

  // 1.5 Dibujar Cabaña y Eloísa si estamos en Cinemática
  if (gameState === STATES.CUTSCENE) {
    // Cabaña: width = 128, height = 128, y = GROUND_Y - 128
    drawPixelSprite(ctx, CINEMATIC_SPRITES.cozy_house, cabinX, GROUND_Y - 128, 128, 128);
    
    // Eloísa: width = 48, height = 72, y = GROUND_Y - 72
    const eloSprite = (cutsceneStage === 4) ? CINEMATIC_SPRITES.eloisa_hug : CINEMATIC_SPRITES.eloisa;
    drawPixelSprite(ctx, eloSprite, eloisaX, GROUND_Y - 72, 48, 72);
  }

  // Dibujar asta de bandera (meta física) si existe
  if (flagpole) {
    drawFlagpole();
  }

  // 2. Dibujar Obstáculos
  obstacles.forEach(obs => obs.draw());

  // 3. Dibujar Premios
  collectibles.forEach(col => col.draw());

  // 4. Dibujar Terrier Chileno
  terrier.draw();

  // Dibujar bocadillo de ladrido
  if (barkBubble) {
    ctx.save();
    const bx = barkBubble.x;
    const by = barkBubble.y;
    
    // Opacidad según el temporizador restante (para fundido de salida en los últimos 5 frames)
    const opacity = Math.min(1.0, barkBubble.timer / 5);
    ctx.globalAlpha = opacity;
    
    // Configuración del bocadillo
    const bw = 54;
    const bh = 20;
    
    // Fondo blanco del globo
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Rectángulo del globo
    ctx.beginPath();
    ctx.rect(bx, by - bh, bw, bh);
    ctx.fill();
    ctx.stroke();
    
    // Cola/Flecha apuntando hacia la boca del perrito (abajo a la izquierda)
    ctx.beginPath();
    ctx.moveTo(bx + 12, by);
    ctx.lineTo(bx + 4, by + 6);
    ctx.lineTo(bx + 20, by);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Líneas negras exteriores para la cola
    ctx.beginPath();
    ctx.moveTo(bx + 12, by);
    ctx.lineTo(bx + 4, by + 6);
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(bx + 20, by);
    ctx.lineTo(bx + 4, by + 6);
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    
    // Texto ¡GUAU! pixel-art
    ctx.fillStyle = '#e6005c'; // Fuchsia neón muy retro
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("¡GUAU!", bx + bw / 2, by - bh / 2 + 1);
    
    ctx.restore();
  }

  // Dibujar el fantasmita de Cholga subiendo al cielo si está muriendo o en game over
  if (gameState === STATES.DYING || gameState === STATES.GAMEOVER) {
    ctx.save();
    ctx.globalAlpha = 0.72; // Translúcido fantasmagórico
    drawPixelSprite(ctx, TERRIER_SPRITES.ghost, deathX, ghostY, 48, 48, true);
    ctx.restore();
  }

  // 4.5 Neblina si corresponde
  if (currentWeather === 'fog') {
    drawFogEffect();
  }

  // 5. Dibujar Efectos de Clima encima (lluvia, nubes, relámpagos)
  drawWeatherEffects();

  // 6. Dibujar Banner de Transición de Etapa si está activo
  if (stageTransitionTimer > 0) {
    drawStageTransitionBanner();
  }

  // 7. Dibujar HUD Flotante del Canvas en tiempo real
  drawCanvasHUD();

  // 8. Dibujar Caja de texto cinemática si estamos al final de la cinemática
  if (gameState === STATES.CUTSCENE && cutsceneStage === 4) {
    drawCutsceneTextBox();
  }

  // 9. Dibujar textos flotantes
  if (floatyTexts.length > 0) {
    ctx.save();
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    floatyTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.restore();
  }

  ctx.restore();
}

let lastFrameTime = 0;
const fpsInterval = 1000 / 60; // ~16.67 ms (60 FPS)
let animationFrameId = null;

function scheduleNextFrame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = requestAnimationFrame(gameLoop);
}

// Bucle de fotogramas a 60 FPS controlado por tiempo
function gameLoop(timestamp) {
  if (!timestamp) timestamp = performance.now();
  if (!lastFrameTime) lastFrameTime = timestamp;
  
  const elapsed = timestamp - lastFrameTime;
  
  if (elapsed >= fpsInterval) {
    // Reducir la acumulación de drift
    lastFrameTime = timestamp - (elapsed % fpsInterval);
    
    if (gameState === STATES.PLAYING) {
      updateGame();
    } else if (gameState === STATES.CUTSCENE) {
      updateCutscene();
    } else if (gameState === STATES.DYING) {
      updateDying();
    }
    
    drawGame();
  }
  
  if (gameState === STATES.PLAYING || gameState === STATES.CUTSCENE || gameState === STATES.DYING) {
    scheduleNextFrame();
  }
}


// ==========================================
// --- CONTROL DE UI Y EVENTOS DE INTERFAZ ---
// ==========================================

function updateUI() {
  document.getElementById('current-score-val').textContent = String(score).padStart(5, '0');
  document.getElementById('high-score-val').textContent = String(highScore).padStart(5, '0');
  document.getElementById('multiplier-val').textContent = `x${multiplier.toFixed(1)}`;
  
  // Estadísticas del sidebar izquierdo (si están visibles)
  const statSalmons = document.getElementById('stat-salmons');
  if (statSalmons) statSalmons.textContent = salmonsCount;
  const statKuchens = document.getElementById('stat-kuchens');
  if (statKuchens) statKuchens.textContent = kuchensCount;
  const statDistance = document.getElementById('stat-distance');
  if (statDistance) statDistance.textContent = `${Math.floor(distanceTraveled)}m`;
  const statLives = document.getElementById('stat-lives');
  if (statLives) statLives.textContent = lives;
  
  // Estadísticas del HUD superior (visibles en todo momento)
  const topLivesEl = document.getElementById('lives-val');
  if (topLivesEl) topLivesEl.textContent = `❤️ ${lives}`;
  const topSalmonsEl = document.getElementById('salmons-val');
  if (topSalmonsEl) topSalmonsEl.textContent = salmonsCount;
  const topKuchensEl = document.getElementById('kuchens-val');
  if (topKuchensEl) topKuchensEl.textContent = kuchensCount;
  
  const stageValEl = document.getElementById('stage-val');
  if (stageValEl) {
    stageValEl.textContent = currentStage;
  }
}

function triggerGameOver() {
  const cameFromDying = (gameState === STATES.DYING);
  gameState = STATES.GAMEOVER;
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  if (!cameFromDying) {
    terrier.state = 'crash';
    if (window.audioEngine) window.audioEngine.playGameOverSound();
  }

  // Evaluar récord máximo
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('terrier_high_score', highScore);
  }

  // Cargar resumen final
  document.getElementById('final-score').textContent = score;
  document.getElementById('final-salmons').textContent = salmonsCount;
  document.getElementById('final-kuchens').textContent = kuchensCount;

  // Mostrar capa de fin de juego
  document.getElementById('gameover-overlay').classList.remove('hidden');
  document.getElementById('gameover-overlay').classList.add('active');
  
  // Garantizar que el multiplicador siempre se resetee a 1.0 al terminar la partida
  multiplier = 1.0;
  updateUI();
}

function resetGameVariables() {
  // Reiniciar estado de teclas para evitar que queden atascadas
  keys.Space = false;
  keys.ArrowUp = false;
  keys.ArrowDown = false;
  keys.ArrowLeft = false;
  keys.ArrowRight = false;

  score = 0;
  multiplier = 1.0;
  salmonsCount = 0;
  kuchensCount = 0;
  distanceTraveled = 0;
  gameSpeed = 5.0;
  lives = 1;

  bgOffsetVolcano = 0;
  bgOffsetLake = 0;
  bgOffsetForest = 0;
  bgOffsetGround = 0;
  isTransitioningToMeadow = false;
  meadowStartBlock = Infinity;
  flagpole = null;
  isFlagpoleCutscene = false;
  flagpoleCutsceneTimer = 0;
  
  currentStage = 1;
  applyStageEnvironment(1);
  stageTransitionTimer = 0;
  stageTransitionText = '';
  lavaParticles = [];
  sparkleParticles = [];
  floatyTexts = [];
  hasDoubleJump = false;
  doubleJumpTimer = 0;
  lightningFlash = 0;
  barkBubble = null;
  if (window.audioEngine) {
    window.audioEngine.setDangerTheme(false);
  }

  obstacles = [];
  collectibles = [];
  rainParticles = [];
  smokeParticles = [];
  
  spawnTimer = 0;
  nextSpawnTime = 1000;
  
  terrier.x = TERRIER_X;
  terrier.y = GROUND_Y - 48;
  terrier.vy = 0;
  terrier.isGrounded = true;
  terrier.state = 'run';
  
  updateUI();
}

function startGame() {
  resetGameVariables();
  
  // Quitar capas
  document.getElementById('start-overlay').classList.add('hidden');
  document.getElementById('start-overlay').classList.remove('active');
  document.getElementById('gameover-overlay').classList.add('hidden');
  document.getElementById('gameover-overlay').classList.remove('active');
  document.getElementById('pause-overlay').classList.add('hidden');
  document.getElementById('pause-overlay').classList.remove('active');

  gameState = STATES.PLAYING;
  
  // Inicializar música procedural
  if (window.audioEngine) {
    window.audioEngine.initAudio();
    window.audioEngine.startMusic();
  }

  lastFrameTime = 0; // Reiniciar temporizador de frames
  scheduleNextFrame();
}

function openHelpModal() {
  if (gameState === STATES.PLAYING) {
    gameState = STATES.PAUSED;
    if (window.audioEngine) window.audioEngine.stopMusic();
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
  const modal = document.getElementById('help-modal');
  modal.classList.remove('hidden');
  modal.classList.add('active');
}

function closeHelpModal() {
  const modal = document.getElementById('help-modal');
  modal.classList.add('hidden');
  modal.classList.remove('active');
  
  if (gameState === STATES.PAUSED) {
    gameState = STATES.PLAYING;
    if (window.audioEngine) window.audioEngine.startMusic();
    lastFrameTime = 0;
    scheduleNextFrame();
  }
}

function togglePause() {
  if (gameState === STATES.PLAYING) {
    gameState = STATES.PAUSED;
    if (window.audioEngine) window.audioEngine.stopMusic();
    document.getElementById('pause-overlay').classList.remove('hidden');
    document.getElementById('pause-overlay').classList.add('active');
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  } else if (gameState === STATES.PAUSED) {
    gameState = STATES.PLAYING;
    if (window.audioEngine) window.audioEngine.startMusic();
    document.getElementById('pause-overlay').classList.add('hidden');
    document.getElementById('pause-overlay').classList.remove('active');
    lastFrameTime = 0; // Reiniciar temporizador de frames al reanudar
    scheduleNextFrame();
  }
}


// ==========================================
// --- REGISTRO DE EVENTOS (LISTENERS) ---
// ==========================================

/**
 * Dispara el ladrido acústico y el bocadillo visual de Cholga
 */
function triggerBark() {
  if (gameState !== STATES.PLAYING) return;
  if (window.audioEngine && window.audioEngine.playBarkSound) {
    window.audioEngine.playBarkSound();
  }
  barkBubble = {
    text: "¡GUAU!",
    x: terrier.x + terrier.width - 4,
    y: terrier.y - 12,
    timer: 20, // ~330ms en 60fps
    maxTimer: 20
  };
}

function setupEventListeners() {
  
  // Teclas físicas
  window.addEventListener('keydown', (e) => {
    // Si el modal de ayuda está abierto, cerrar con Escape, P, o Espacio
    const isHelpOpen = !document.getElementById('help-modal').classList.contains('hidden');
    if (isHelpOpen) {
      if (e.code === 'KeyP' || e.code === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        closeHelpModal();
        return;
      }
    }

    // Si Cholga está en animación de muerte, bloquear todos los inputs
    if (gameState === STATES.DYING) {
      e.preventDefault();
      return;
    }

    // Si estamos al final de la cinemática, cualquier tecla reanuda
    if (gameState === STATES.CUTSCENE && cutsceneStage === 4) {
      e.preventDefault();
      resumeAfterCutscene();
      return;
    }
    // Si estamos en cinemática en etapas previas, ignorar teclado
    if (gameState === STATES.CUTSCENE) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState === STATES.PLAYING) {
        terrier.jump();
      } else if (gameState === STATES.START || gameState === STATES.GAMEOVER) {
        startGame();
      }
    }
    
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      if (gameState === STATES.PLAYING) {
        if (!keys.ArrowUp) {
          triggerBark();
        }
        keys.ArrowUp = true;
      }
    }
    
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      if (!keys.ArrowDown) {
        keys.ArrowDown = true;
        if (gameState === STATES.PLAYING) {
          terrier.duck(true);
        }
      }
    }

    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      keys.ArrowLeft = true;
    }

    if (e.code === 'ArrowRight') {
      e.preventDefault();
      keys.ArrowRight = true;
    }

    if (e.code === 'KeyP' || e.code === 'Escape') {
      e.preventDefault();
      togglePause();
    }
  });

  window.addEventListener('keyup', (e) => {
    // Ya no bloqueamos keyup en STATES.DYING para que las teclas soltadas durante la muerte no se queden atascadas en true
    if (e.code === 'ArrowUp') {
      keys.ArrowUp = false;
    }
    if (e.code === 'ArrowDown') {
      keys.ArrowDown = false;
      if (gameState === STATES.PLAYING) {
        terrier.duck(false);
      }
    }
    if (e.code === 'ArrowLeft') {
      keys.ArrowLeft = false;
    }
    if (e.code === 'ArrowRight') {
      keys.ArrowRight = false;
    }
  });

  // Botones de Interfaces
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);
  document.getElementById('resume-btn').addEventListener('click', togglePause);
  document.getElementById('help-btn').addEventListener('click', openHelpModal);
  document.getElementById('theme-btn').addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('terrier_theme', isLight ? 'light' : 'dark');
  });
  document.getElementById('close-help-btn').addEventListener('click', closeHelpModal);
  document.getElementById('start-help-btn').addEventListener('click', closeHelpModal);
  document.getElementById('help-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('help-modal')) {
      closeHelpModal();
    }
  });

  // Clic en el canvas (Mobile y Desktop click)
  canvas.addEventListener('mousedown', (e) => {
    if (gameState === STATES.DYING) return;
    if (gameState === STATES.CUTSCENE && cutsceneStage === 4) {
      e.preventDefault();
      resumeAfterCutscene();
      return;
    }
    // En Desktop, hacer click en el canvas ya no salta ("para saltar solo la barra de espacio")
  });

  // Gestos Táctiles para Móviles en Canvas
  canvas.addEventListener('touchstart', (e) => {
    if (gameState === STATES.DYING) {
      e.preventDefault();
      return;
    }
    if (gameState === STATES.CUTSCENE && cutsceneStage === 4) {
      e.preventDefault();
      resumeAfterCutscene();
      return;
    }
    // En Mobile, tocar el canvas ya no salta ("para saltar solo el pulgar derecho [touch-jump]")
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (gameState === STATES.DYING || gameState === STATES.CUTSCENE) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY;
    
    // Swipe hacia abajo (> 30px de arrastre)
    if (diffY > 30 && gameState === STATES.PLAYING) {
      terrier.duck(true);
      keys.ArrowDown = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    if (gameState === STATES.DYING || gameState === STATES.CUTSCENE) return;
    if (gameState === STATES.PLAYING) {
      terrier.duck(false);
      keys.ArrowDown = false;
    }
  });

  // Selector Climático
  const weatherButtons = document.querySelectorAll('.weather-btn');
  weatherButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      weatherButtons.forEach(b => b.classList.remove('active'));
      const activeBtn = e.currentTarget;
      activeBtn.classList.add('active');
      
      const newWeather = activeBtn.dataset.weather;
      currentWeather = newWeather;

      // Cambiar clases del body para ambient-glow y partículas de lluvia
      const body = document.body;
      body.className = `weather-${newWeather}`;
      
      // Limpiar partículas antiguas al cambiar bruscamente de clima
      rainParticles = [];
    });
  });

  // Controles de Música
  const musicToggle = document.getElementById('music-toggle');
  musicToggle.addEventListener('change', (e) => {
    if (window.audioEngine) window.audioEngine.toggleMusic(e.target.checked);
  });

  const musicVolSlider = document.getElementById('music-volume');
  musicVolSlider.addEventListener('input', (e) => {
    if (window.audioEngine) window.audioEngine.setMusicVolume(e.target.value);
  });

  // Controles de SFX
  const sfxToggle = document.getElementById('sfx-toggle');
  sfxToggle.addEventListener('change', (e) => {
    if (window.audioEngine) window.audioEngine.toggleSFX(e.target.checked);
  });

  const sfxVolSlider = document.getElementById('sfx-volume');
  sfxVolSlider.addEventListener('input', (e) => {
    if (window.audioEngine) window.audioEngine.setSFXVolume(e.target.value);
  });

  // Inicializar Pantalla Completa y Controles Táctiles
  setupFullscreen();
  setupTouchControls();
}

// ==========================================
// --- CONTROL DE PANTALLA COMPLETA ---
// ==========================================

function setupFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const wrapper = document.querySelector('.game-screen-wrapper');

  if (!fullscreenBtn || !wrapper) return;

  fullscreenBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Entrar a pantalla completa
        if (wrapper.requestFullscreen) {
          await wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
          await wrapper.webkitRequestFullscreen(); // Safari / iOS
        } else if (wrapper.msRequestFullscreen) {
          await wrapper.msRequestFullscreen();
        }
        
        // Bloquear orientación horizontal en móviles (Android)
        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock('landscape');
          } catch (orientationErr) {
            console.log('No se pudo bloquear la orientación:', orientationErr);
          }
        }
      } else {
        // Salir de pantalla completa
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Error al cambiar pantalla completa:', err);
    }
  });

  // Escuchar cambios de fullscreen para actualizar el icono del botón
  const onFullscreenChange = () => {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    fullscreenBtn.textContent = isFullscreen ? '📴' : '🖥️';
  };

  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
}

// ==========================================
// --- MOBILE TOUCH CONTROLS (MINECRAFT STYLE) ---
// ==========================================

function setupTouchControls() {
  const joystickBase = document.getElementById('joystick-base');
  const joystickKnob = document.getElementById('joystick-knob');
  const touchJump = document.getElementById('touch-jump');

  if (!joystickBase || !joystickKnob || !touchJump) return;

  let isDragging = false;
  let joystickTouchId = null;
  const maxRadius = 45; // Radio máximo de arrastre en px

  // Coordenadas del centro del joystick (se calculan dinámicamente en touchstart)
  let centerX = 0;
  let centerY = 0;

  // Manejar inicio de toque en el joystick base
  const handleJoystickStart = (e) => {
    e.preventDefault();
    if (isDragging) return;

    // Tomar el primer toque que inicia sobre el joystick
    const touch = e.changedTouches[0];
    joystickTouchId = touch.identifier;
    isDragging = true;

    // Calcular centro geométrico exacto de la base
    const rect = joystickBase.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;

    joystickBase.classList.add('active');
    joystickKnob.classList.remove('snapping');

    // Procesar posición inicial del toque
    handleJoystickMove(e);
  };

  // Manejar el arrastre
  const handleJoystickMove = (e) => {
    if (!isDragging) return;

    // Encontrar el toque correspondiente al joystick
    let touch = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === joystickTouchId) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch) return;

    // Calcular desplazamiento del toque respecto al centro del joystick
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Limitar el pomo dentro del radio máximo (clamping)
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    // Actualizar visualmente la posición del pomo
    joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

    // --- MAPEO DE DIRECCIONES A TECLAS ---

    // Eje X: Izquierda / Derecha (sensibilidad de 12px)
    if (dx < -12) {
      keys.ArrowLeft = true;
      keys.ArrowRight = false;
    } else if (dx > 12) {
      keys.ArrowRight = true;
      keys.ArrowLeft = false;
    } else {
      keys.ArrowLeft = false;
      keys.ArrowRight = false;
    }

    // Eje Y: Ladrido (Arriba) / Agacharse (Abajo)
    if (dy < -12) {
      // Arriba: Ladrido (disparar una sola vez al transicionar)
      if (!keys.ArrowUp) {
        triggerBark();
      }
      keys.ArrowUp = true;
      if (keys.ArrowDown) {
        keys.ArrowDown = false;
        terrier.duck(false);
      }
    } else if (dy > 12) {
      // Abajo: Agacharse
      if (!keys.ArrowDown) {
        keys.ArrowDown = true;
        terrier.duck(true);
      }
      keys.ArrowUp = false;
    } else {
      // Neutro en Y
      keys.ArrowUp = false;
      if (keys.ArrowDown) {
        keys.ArrowDown = false;
        terrier.duck(false);
      }
    }
  };

  // Manejar la liberación de la palanca
  const handleJoystickEnd = (e) => {
    if (!isDragging) return;

    // Comprobar si el toque que terminó es el del joystick
    let touchEnded = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId) {
        touchEnded = true;
        break;
      }
    }

    // Si terminó el toque de nuestro joystick, o si no quedan toques activos en pantalla
    if (touchEnded || e.touches.length === 0) {
      isDragging = false;
      joystickTouchId = null;

      joystickBase.classList.remove('active');
      joystickKnob.classList.add('snapping');
      joystickKnob.style.transform = 'translate(0px, 0px)';

      // Liberar todas las teclas de dirección asignadas al joystick
      keys.ArrowLeft = false;
      keys.ArrowRight = false;
      keys.ArrowUp = false;
      if (keys.ArrowDown) {
        keys.ArrowDown = false;
        terrier.duck(false);
      }
    }
  };

  // Listeners de eventos de toque del joystick
  joystickBase.addEventListener('touchstart', handleJoystickStart, { passive: false });
  
  // Escuchamos en window para permitir arrastrar fuera de la base sin perder el rastro
  window.addEventListener('touchmove', handleJoystickMove, { passive: false });
  window.addEventListener('touchend', handleJoystickEnd, { passive: false });
  window.addEventListener('touchcancel', handleJoystickEnd, { passive: false });

  // BOTÓN JUMP (Único salto móvil a la derecha)
  touchJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === STATES.DYING) return;
    if (gameState === STATES.CUTSCENE && cutsceneStage === 4) {
      resumeAfterCutscene();
      return;
    }
    if (gameState === STATES.PLAYING) {
      terrier.jump();
    } else if (gameState === STATES.START || gameState === STATES.GAMEOVER) {
      startGame();
    }
  }, { passive: false });
}


// ==========================================
// --- INICIALIZACIÓN AL CARGAR ---
// ==========================================

window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  // Desactivar suavizado del canvas para mantener los pixeles crujientes de 8-bits
  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;

  // Cargar récord máximo guardado
  const savedHighScore = localStorage.getItem('terrier_high_score');
  if (savedHighScore) {
    highScore = parseInt(savedHighScore, 10);
  }

  // Registrar listeners de eventos de entrada y configuración
  setupEventListeners();

  // Renderizar la pantalla de inicio estática una vez
  drawParallax('sunny');
  terrier.draw();
  updateUI();
});
