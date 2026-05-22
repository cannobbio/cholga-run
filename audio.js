/**
 * CHOLGA - 8-Bit Procedural Web Audio Engine
 * Genera música interactiva y efectos de sonido retro de 8 bits en tiempo real.
 */

// Estado del Audio
let audioCtx = null;
let masterMusicGain = null;
let masterSFXGain = null;

let isMusicPlaying = false;
let musicEnabled = true;
let sfxEnabled = true;

// Tema musical activo: 'sunrise', 'sunny', 'sunset', 'night', 'danger'
let musicTheme = 'sunrise'; 
let gameSpeedFactor = 1.0;

let musicVolume = 0.4; // 0.0 a 1.0
let sfxVolume = 0.6;   // 0.0 a 1.0

// Parámetros de la Secuencia de Música
let schedulerTimerId = null;
let nextNoteTime = 0.0;
let currentStep = 0;
const stepsInPattern = 64; // Patrón de 64 pasos (16 compases en 2/4)

let currentBPM = 125;
const maxBPM = 180;

// Mapeo extendido de notas cromáticas a frecuencias (Hz)
const NOTE_FREQS = {
  // Octava 2
  'C2': 65.41, 'C#2': 69.30, 'Db2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'Gb2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'Ab2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'Bb2': 116.54, 'B2': 123.47,
  // Octava 3
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
  // Octava 4
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
  // Octava 5
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
  // Octava 6
  'C6': 1046.50, 'C#6': 1108.73, 'Db6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'Eb6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'Gb6': 1479.98, 'G6': 1567.98, 'A6': 1760.00, 'B6': 1975.53,
  // Octava 7
  'C7': 2093.00, 'C#7': 2217.46, 'D7': 2349.32, 'D#7': 2489.02, 'E7': 2637.02, 'F7': 2793.83, 'F#7': 2959.96, 'G7': 3135.96, 'G#7': 3322.44, 'A7': 3520.00, 'A#7': 3729.31, 'B7': 3951.07,
  '-': 0 // Silencio
};

// ==========================================
// --- VARIACIONES DE CANCIONES (8-BIT) ---
// ==========================================

// 1. AMANECER / MAÑANA: Escala alegre en Do Mayor (Tempo medio, optimista)
const SUNRISE_MELODY = [
  'C5', 'E5', 'G5', 'C6',  'B5', 'G5', 'A5', 'F5',  'G5', 'E5', 'F5', 'D5',  'E5', 'C5', 'D5', 'G4',
  'C5', 'E5', 'G5', 'C6',  'B5', 'G5', 'A5', 'F5',  'E5', 'G5', 'D5', 'F5',  'C5', 'E5', 'C5', '-',
  'D5', 'D5', 'F5', 'D5',  'E5', 'E5', 'G5', 'E5',  'F5', 'F5', 'A5', 'F5',  'G5', 'G5', 'B5', 'G5',
  'C6', 'B5', 'A5', 'G5',  'F5', 'E5', 'D5', 'G4',  'C5', 'E5', 'D5', 'B4',  'C5', 'G4', 'C4', '-'
];
const SUNRISE_CHORDS = [
  ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'],
  ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'],
  ['D4', 'F4', 'A4'], ['D4', 'F4', 'A4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['F3', 'A3', 'C4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['C4', 'E4', 'G4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'],
  ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']
];
const SUNRISE_BASS = [
  'C3', 'G3', 'C3', 'G3',  'C3', 'G3', 'G3', 'C3',  'D3', 'A3', 'C3', 'G3',  'G3', 'D3', 'C3', 'G3',
  'F3', 'C3', 'C3', 'G3',  'G3', 'D3', 'C3', 'G3',  'C3', 'F3', 'C3', 'G3',  'C3', 'G3', 'C3', 'G3'
];

// 2. DÍA (SOLEADO): La alegre Polka Alemana clásica con doble oscilador
const POLKA_MELODY = [
  'E4', 'G4', 'C5', 'E5',  'D5', 'C5', 'B4', 'A4',  'G4', 'B4', 'D5', 'G5',  'F5', 'E5', 'D5', 'B4',
  'E4', 'G4', 'C5', 'E5',  'D5', 'C5', 'C5', 'C5',  'D5', 'D5', 'E5', 'F5',  'G5', 'F5', 'E5', 'D5',
  'C5', 'C5', 'B4', 'A4',  'G4', 'G4', 'A4', 'B4',  'C5', 'C5', 'D5', 'E5',  'D5', 'C5', 'B4', 'G4',
  'C5', 'E5', 'G5', 'G5',  'F5', 'A5', 'F5', 'D5',  'C5', 'E5', 'D5', 'B4',  'C5', 'G4', 'C4', '-'
];
const POLKA_CHORDS = [
  ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'],
  ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['F3', 'A3', 'C4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
  ['C4', 'E4', 'G4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'],
  ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']
];
const POLKA_BASS = [
  'C3', 'G3', 'C3', 'G3',  'G3', 'D3', 'G3', 'D3',  'C3', 'G3', 'C3', 'G3',  'G3', 'D3', 'C3', 'G3',
  'F3', 'C3', 'C3', 'G3',  'G3', 'D3', 'C3', 'G3',  'C3', 'F3', 'C3', 'G3',  'C3', 'G3', 'C3', 'G3'
];

// 3. ATARDECER: Polka relajada (Chill major-sevenths y tempo lento cálido)
const SUNSET_MELODY = [
  'E5', 'D5', 'C5', 'B4',  'A4', 'C5', 'E5', 'G5',  'F5', 'E5', 'D5', 'C5',  'B4', 'D5', 'F5', 'A5',
  'G5', 'F5', 'E5', 'D5',  'C5', 'E5', 'G5', 'B5',  'A5', 'G5', 'F5', 'E5',  'D5', 'G5', 'D5', '-',
  'C5', 'E5', 'D5', 'F5',  'E5', 'G5', 'F5', 'A5',  'G5', 'B5', 'A5', 'C6',  'B5', 'G5', 'D5', 'G4',
  'C5', 'E5', 'G5', 'B5',  'A5', 'F5', 'D5', 'B4',  'C5', 'E5', 'D5', 'B4',  'C5', 'G4', 'C4', '-'
];
const SUNSET_CHORDS = [
  ['C4', 'E4', 'G4', 'B4'], ['C4', 'E4', 'G4', 'B4'], ['F3', 'A3', 'C4', 'E4'], ['F3', 'A3', 'C4', 'E4'],
  ['G3', 'B3', 'D4', 'F4'], ['G3', 'B3', 'D4', 'F4'], ['C4', 'E4', 'G4', 'B4'], ['C4', 'E4', 'G4', 'B4'],
  ['F3', 'A3', 'C4', 'E4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'B4'], ['C4', 'E4', 'G4', 'B4'],
  ['G3', 'B3', 'D4', 'F4'], ['G3', 'B3', 'D4', 'F4'], ['C4', 'E4', 'G4', 'B4'], ['C4', 'E4', 'G4', 'B4'],
  ['F3', 'A3', 'C4', 'E4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'B4'], ['C4', 'E4', 'G4', 'B4'],
  ['G3', 'B3', 'D4', 'F4'], ['G3', 'B3', 'D4', 'F4'], ['C4', 'E4', 'G4', 'B4'], ['C4', 'E4', 'G4', 'B4'],
  ['C4', 'E4', 'G4', 'B4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'B4'], ['G3', 'B3', 'D4', 'F4'],
  ['C4', 'E4', 'G4', 'B4'], ['G3', 'B3', 'D4', 'F4'], ['C4', 'E4', 'G4', 'B4'], ['C4', 'E4', 'G4', 'B4']
];
const SUNSET_BASS = [
  'C3', 'G3', 'F3', 'C3',  'G3', 'D3', 'C3', 'G3',  'F3', 'C3', 'C3', 'G3',  'G3', 'D3', 'C3', 'G3',
  'F3', 'C3', 'C3', 'G3',  'G3', 'D3', 'C3', 'G3',  'C3', 'F3', 'C3', 'G3',  'C3', 'G3', 'C3', 'G3'
];

// 4. NOCHE: Bella nana/lullaby en escala menor, sonido ultra suave y calmado
const NIGHT_MELODY = [
  'A4', 'C5', 'E5', 'A5',  'G#5', 'E5', 'B4', 'E5',  'A5', 'G#5', 'F5', 'D5', 'E5', 'B4', 'C5', 'A4',
  'A4', 'C5', 'E5', 'A5',  'G#5', 'E5', 'B4', 'E5',  'C5', 'E5', 'D5', 'B4',  'A4', 'E4', 'A3', '-',
  'C5', 'C5', 'E5', 'C5',  'D5', 'D5', 'F5', 'D5',  'E5', 'E5', 'G#5', 'E5', 'A5', 'A5', 'C6', 'A5',
  'C6', 'B5', 'A5', 'G#5', 'F5', 'E5', 'D5', 'B4',  'A4', 'C5', 'B4', 'G#4', 'A4', 'E4', 'A3', '-'
];
const NIGHT_CHORDS = [
  ['A3', 'C4', 'E4'], ['A3', 'C4', 'E4'], ['E3', 'G#3', 'B3'], ['E3', 'G#3', 'B3'],
  ['D4', 'F4', 'A4'], ['D4', 'F4', 'A4'], ['E3', 'G#3', 'B3'], ['A3', 'C4', 'E4'],
  ['A3', 'C4', 'E4'], ['A3', 'C4', 'E4'], ['E3', 'G#3', 'B3'], ['E3', 'G#3', 'B3'],
  ['C4', 'E4', 'G4'], ['E3', 'G#3', 'B3'], ['A3', 'C4', 'E4'], ['A3', 'C4', 'E4'],
  ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['D4', 'F4', 'A4'],
  ['E3', 'G#3', 'B3'], ['E3', 'G#3', 'B3'], ['A3', 'C4', 'E4'], ['A3', 'C4', 'E4'],
  ['A3', 'C4', 'E4'], ['D4', 'F4', 'A4'], ['A3', 'C4', 'E4'], ['E3', 'G#3', 'B3'],
  ['A3', 'C4', 'E4'], ['E3', 'G#3', 'B3'], ['A3', 'C4', 'E4'], ['A3', 'C4', 'E4']
];
const NIGHT_BASS = [
  'A2', 'E3', 'E2', 'B2',  'D3', 'A3', 'E3', 'A2',  'A2', 'E3', 'E2', 'B2',  'C3', 'E3', 'A2', 'E3',
  'C3', 'G3', 'D3', 'A3',  'E3', 'B3', 'A3', 'E3',  'A2', 'D3', 'A2', 'E3',  'A2', 'E3', 'A2', 'E3'
];

// 5. ERUPCIÓN (PELIGRO): Marcha de peligro menor en escala armónica en Do Menor (Tensión, ritmo militar rápido)
const DANGER_MELODY = [
  'C5', 'Eb5', 'G5', 'Eb5', 'C5', 'Eb5', 'G5', 'Eb5',  'D5', 'F5', 'Ab5', 'F5', 'D5', 'F5', 'Ab5', 'F5',
  'Eb5', 'G5', 'Bb5', 'G5', 'Eb5', 'G5', 'Bb5', 'G5',  'F5', 'Ab5', 'C6', 'Ab5', 'G5', 'B5', 'D6', 'B5',
  'C6', 'G5', 'Eb5', 'G5', 'C6', 'G5', 'Eb5', 'G5',    'Ab5', 'F5', 'D5', 'F5', 'Ab5', 'F5', 'D5', 'F5',
  'G5', 'Eb5', 'C5', 'Eb5', 'G5', 'Eb5', 'C5', 'Eb5',  'B4', 'D5', 'G5', 'D5', 'C5', 'G4', 'C4', '-'
];
const DANGER_CHORDS = [
  ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'G4'],
  ['D4', 'F4', 'Ab4'], ['D4', 'F4', 'Ab4'], ['D4', 'F4', 'Ab4'], ['D4', 'F4', 'Ab4'],
  ['Eb4', 'G4', 'Bb4'], ['Eb4', 'G4', 'Bb4'], ['Eb4', 'G4', 'Bb4'], ['Eb4', 'G4', 'Bb4'],
  ['F4', 'Ab4', 'C5'], ['F4', 'Ab4', 'C5'], ['G4', 'B4', 'D5'], ['G4', 'B4', 'D5'],
  ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'G4'],
  ['D4', 'F4', 'Ab4'], ['D4', 'F4', 'Ab4'], ['D4', 'F4', 'Ab4'], ['D4', 'F4', 'Ab4'],
  ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'G4'], ['G4', 'B4', 'D5'], ['G4', 'B4', 'D5'],
  ['C4', 'Eb4', 'G4'], ['G4', 'B4', 'D5'], ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'G4']
];
const DANGER_BASS = [
  'C3', 'G3', 'C3', 'G3',  'D3', 'Ab3', 'D3', 'Ab3',  'Eb3', 'Bb3', 'Eb3', 'Bb3',  'F3', 'C4', 'G3', 'D4',
  'C3', 'G3', 'C3', 'G3',  'D3', 'Ab3', 'D3', 'Ab3',  'C3', 'G3', 'G3', 'D3',  'C3', 'G3', 'C3', 'G3'
];

// Cache de buffer de ruido
let noiseBuffer = null;

/**
 * Inicializa el contexto de audio.
 */
function initAudio() {
  if (audioCtx) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();
  
  // Nodo de volumen maestro para la música
  masterMusicGain = audioCtx.createGain();
  masterMusicGain.gain.value = musicEnabled ? musicVolume : 0;
  masterMusicGain.connect(audioCtx.destination);

  // Nodo de volumen maestro para SFX
  masterSFXGain = audioCtx.createGain();
  masterSFXGain.gain.value = sfxEnabled ? sfxVolume : 0;
  masterSFXGain.connect(audioCtx.destination);

  // Generamos el buffer de ruido blanco
  createNoiseBuffer();
}

function createNoiseBuffer() {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.5;
  noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
}

/**
 * Registra el factor de velocidad para escalamiento del tempo BPM
 */
function setMusicTempo(factor) {
  gameSpeedFactor = factor;
}

/**
 * Cambia dinámicamente el tema de música activa
 * @param {string} themeName - 'sunrise', 'sunny', 'sunset', 'night', 'danger'
 */
function setMusicTheme(themeName) {
  musicTheme = themeName;
}

// Para compatibilidad con código anterior de game.js
function setDangerTheme(isActive) {
  if (isActive) {
    musicTheme = 'danger';
  } else {
    // Restaurar tema según la etapa se maneja llamando a setMusicTheme desde game.js
  }
}

/**
 * Genera una nota sintética básica de retro
 */
function synthNote(freq, startTime, duration, type = 'square', volume = 0.15) {
  if (!audioCtx || freq <= 0) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.008); 
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); 

  osc.connect(gainNode);
  gainNode.connect(masterMusicGain);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Toca un acorde staccato tirolés / polka
 */
function playStaccatoChord(notes, startTime, duration, volume = 0.08) {
  notes.forEach(noteName => {
    const freq = NOTE_FREQS[noteName];
    if (freq) {
      synthNote(freq, startTime, duration, 'square', volume);
    }
  });
}

/**
 * Platillo y cajas de percusión de ruido retro
 */
function playNoisePercussion(startTime, duration, isSnare = false, volume = 0.06) {
  if (!audioCtx || !noiseBuffer) return;

  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = isSnare ? 'bandpass' : 'highpass';
  filter.frequency.setValueAtTime(isSnare ? 1100 : 7500, startTime);
  
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterMusicGain);

  noiseSource.start(startTime);
  noiseSource.stop(startTime + duration);
}

/**
 * Bombo retro de 8 bits
 */
function playBassDrumRetro(startTime) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(115, startTime);
  osc.frequency.exponentialRampToValueAtTime(25, startTime + 0.09);
  
  gainNode.gain.setValueAtTime(0.38, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);
  
  osc.connect(gainNode);
  gainNode.connect(masterMusicGain);
  
  osc.start(startTime);
  osc.stop(startTime + 0.1);
}

/**
 * Programador secuencial (Sequencer) de Web Audio
 */
function scheduler() {
  const lookAheadTime = 0.1; // 100ms lookahead
  
  while (nextNoteTime < audioCtx.currentTime + lookAheadTime) {
    scheduleNextStep(currentStep, nextNoteTime);
    advanceStep();
  }
  
  schedulerTimerId = setTimeout(scheduler, 25);
}

function advanceStep() {
  const stepDuration = 60.0 / currentBPM / 4; // semicorcheas
  nextNoteTime += stepDuration;
  currentStep = (currentStep + 1) % stepsInPattern;
}

/**
 * Bucle que agenda notas en cola según el tema musical activo
 */
function scheduleNextStep(step, time) {
  const stepInMeasure = step % 8;
  
  // Asignar arreglos de temas dinámicos y sus BPMs base
  let melodyArray = SUNRISE_MELODY;
  let chordArray = SUNRISE_CHORDS;
  let bassArray = SUNRISE_BASS;
  let themeBPM = 125;
  let isNight = false;

  if (musicTheme === 'sunny') {
    melodyArray = POLKA_MELODY;
    chordArray = POLKA_CHORDS;
    bassArray = POLKA_BASS;
    themeBPM = 140;
  } else if (musicTheme === 'sunset') {
    melodyArray = SUNSET_MELODY;
    chordArray = SUNSET_CHORDS;
    bassArray = SUNSET_BASS;
    themeBPM = 115;
  } else if (musicTheme === 'night') {
    melodyArray = NIGHT_MELODY;
    chordArray = NIGHT_CHORDS;
    bassArray = NIGHT_BASS;
    themeBPM = 98;
    isNight = true;
  } else if (musicTheme === 'danger') {
    melodyArray = DANGER_MELODY;
    chordArray = DANGER_CHORDS;
    bassArray = DANGER_BASS;
    themeBPM = 148;
  }

  // Escalar BPM con velocidad del juego
  currentBPM = Math.min(maxBPM, themeBPM + (gameSpeedFactor - 1.0) * 32);
  const stepDuration = 60.0 / currentBPM / 4;

  // 1. Canal 1: Acordeón Coro 8-bit / Melodía
  const melodyNoteName = melodyArray[step];
  if (melodyNoteName && melodyNoteName !== '-') {
    const freq = NOTE_FREQS[melodyNoteName];
    const noteDur = stepDuration * 0.85; 
    
    if (musicTheme === 'danger') {
      synthNote(freq, time, noteDur, 'square', 0.12);
    } else if (isNight) {
      // Flauta súper dulce y suave en la noche
      synthNote(freq, time, noteDur, 'triangle', 0.18);
    } else if (musicTheme === 'sunset') {
      // Onda triangular cálida con coro muy atenuado
      synthNote(freq, time, noteDur, 'triangle', 0.16);
      synthNote(freq * 1.004, time, noteDur, 'square', 0.03);
    } else {
      // Acordeón Alegre Tradicional: Triángulo + Onda de Pulso Desafinada (* 1.008)
      synthNote(freq, time, noteDur, 'triangle', 0.18);
      synthNote(freq * 1.008, time, noteDur, 'square', 0.07);
    }
  }

  // 2. Canal 2: Bajo "Oom" en los tiempos fuertes (Triangle Bass)
  if (stepInMeasure === 0 || stepInMeasure === 4) {
    const bassIdx = (Math.floor(step / 4)) % 32;
    const bassNoteName = bassArray[bassIdx];
    const bassFreq = NOTE_FREQS[bassNoteName];
    const bassDur = stepDuration * 1.8;
    
    if (bassFreq) {
      // El bajo es más amortiguado y suave en la noche
      const bassVol = isNight ? 0.16 : (musicTheme === 'danger' ? 0.32 : 0.28);
      synthNote(bassFreq, time, bassDur, 'triangle', bassVol);
    }
  }

  // 3. Canal 3: Acorde staccato "Pah" en los contratiempos
  if (stepInMeasure === 2 || stepInMeasure === 6) {
    const chordIdx = (Math.floor(step / 2)) % 32;
    const chordNotes = chordArray[chordIdx];
    const chordDur = stepDuration * 0.6;
    
    if (chordNotes) {
      const chordVol = isNight ? 0.04 : (musicTheme === 'danger' ? 0.09 : 0.08);
      playStaccatoChord(chordNotes, time, chordDur, chordVol);
    }
  }

  // 4. Canal 4: Percusiones 8-bit
  // Bombo analógico (Triangle Sweep)
  if (stepInMeasure === 0 || stepInMeasure === 4) {
    // Reducir volumen del bombo en la noche
    if (!isNight || Math.random() < 0.5) {
      playBassDrumRetro(time);
    }
  }
  // Caja staccato (Snare)
  if (stepInMeasure === 2 || stepInMeasure === 6) {
    const snareVol = isNight ? 0.015 : (musicTheme === 'danger' ? 0.06 : 0.05);
    playNoisePercussion(time, stepDuration * 0.45, true, snareVol);
  }
  // Hi-Hat cerrado muy corto
  if (stepInMeasure % 2 === 1) {
    const hatVol = isNight ? 0.008 : 0.022;
    playNoisePercussion(time, 0.015, false, hatVol);
  }
}

/**
 * Inicia la música de fondo secuencial
 */
function startMusic() {
  initAudio();
  if (isMusicPlaying || !musicEnabled) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  nextNoteTime = audioCtx.currentTime + 0.05;
  currentStep = 0;
  isMusicPlaying = true;
  scheduler();
}

/**
 * Detiene la música de fondo secuencial
 */
function stopMusic() {
  if (!isMusicPlaying) return;
  clearTimeout(schedulerTimerId);
  isMusicPlaying = false;
}

/**
 * Enciende/apaga MUTE de la música
 */
function toggleMusic(enabled) {
  musicEnabled = enabled;
  if (audioCtx) {
    masterMusicGain.gain.setValueAtTime(enabled ? musicVolume : 0, audioCtx.currentTime);
  }
  if (enabled && !isMusicPlaying) {
    startMusic();
  } else if (!enabled && isMusicPlaying) {
    stopMusic();
  }
}

/**
 * Ajusta volumen de la música (0 a 100)
 */
function setMusicVolume(value) {
  musicVolume = value / 100.0;
  if (audioCtx && musicEnabled) {
    masterMusicGain.gain.setValueAtTime(musicVolume, audioCtx.currentTime);
  }
}

/**
 * Enciende/apaga MUTE de SFX
 */
function toggleSFX(enabled) {
  sfxEnabled = enabled;
  if (audioCtx) {
    masterSFXGain.gain.setValueAtTime(enabled ? sfxVolume : 0, audioCtx.currentTime);
  }
}

/**
 * Ajusta volumen de SFX (0 a 100)
 */
function setSFXVolume(value) {
  sfxVolume = value / 100.0;
  if (audioCtx && sfxEnabled) {
    masterSFXGain.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
  }
}

// ==========================================
// --- EFECTOS DE SONIDO PROCEDIMENTALES (SFX) ---
// ==========================================

/**
 * SFX Salto Normal del Terrier (Onda de pulso ascendente rápida de 8 bits)
 */
function playJumpSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
  
  gainNode.gain.setValueAtTime(0.18, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  
  osc.connect(gainNode);
  gainNode.connect(masterSFXGain);
  
  osc.start(now);
  osc.stop(now + 0.13);
}

/**
 * SFX Doble Salto (Bip-bip retro de 8 bits)
 */
function playDoubleJumpSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  
  // Tono 1
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(523.25, now); // Nota Do5
  gain1.gain.setValueAtTime(0.12, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc1.connect(gain1);
  gain1.connect(masterSFXGain);
  osc1.start(now);
  osc1.stop(now + 0.06);
  
  // Tono 2 (60ms después)
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(783.99, now + 0.05); // Nota Sol5
  gain2.gain.setValueAtTime(0.12, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  osc2.connect(gain2);
  gain2.connect(masterSFXGain);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.12);
}

/**
 * SFX Capturar Salmón (Bip agudo metálico coin retro)
 */
function playCatchSalmonSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(987.77, now); // B5
  osc1.frequency.setValueAtTime(1318.51, now + 0.06); // E6
  
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(990, now);
  osc2.frequency.setValueAtTime(1322, now + 0.06);
  
  gainNode.gain.setValueAtTime(0.14, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(masterSFXGain);
  
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.2);
  osc2.stop(now + 0.2);
}

/**
 * SFX Devorar Kuchen (Sonido crujiente de mordisco pixel)
 */
function playCatchKuchenSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  
  // 1. Tono musical alegre y corto (mordisco digital)
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(659.25, now); // E5
  osc.frequency.setValueAtTime(880.00, now + 0.04); // A5
  
  oscGain.gain.setValueAtTime(0.08, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  
  osc.connect(oscGain);
  oscGain.connect(masterSFXGain);
  
  osc.start(now);
  osc.stop(now + 0.12);

  // 2. Ruido crujiente de mordisco
  if (noiseBuffer) {
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.linearRampToValueAtTime(300, now + 0.08);
    filter.Q.setValueAtTime(1.5, now);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterSFXGain);
    
    noise.start(now);
    noise.stop(now + 0.09);
  }
}

/**
 * SFX Ladrido Común del Terrier ("¡GUAU!") de 8 bits (Arriba)
 */
function playBarkSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  
  // Filtro de paso bajo común para darle calidez y carácter 8-bit analógico
  const lowpassFilter = audioCtx.createBiquadFilter();
  lowpassFilter.type = 'lowpass';
  lowpassFilter.frequency.setValueAtTime(2200, now);
  lowpassFilter.frequency.exponentialRampToValueAtTime(700, now + 0.18);
  lowpassFilter.Q.setValueAtTime(4.0, now); // pico resonante retro
  lowpassFilter.connect(masterSFXGain);

  // --- IMPULSO 1: El "GU" (Transitorio inicial rápido y agudo) ---
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(400, now);
  osc1.frequency.linearRampToValueAtTime(650, now + 0.02);
  osc1.frequency.exponentialRampToValueAtTime(320, now + 0.05);
  
  gain1.gain.setValueAtTime(0.25, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  
  osc1.connect(gain1);
  gain1.connect(lowpassFilter);
  
  osc1.start(now);
  osc1.stop(now + 0.06);

  // --- IMPULSO 2: El "AU" (Cuerpo principal resonante) ---
  const delay2 = 0.048; // aprox 48ms después del primer impulso
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(520, now + delay2);
  osc2.frequency.exponentialRampToValueAtTime(140, now + delay2 + 0.12);
  
  gain2.gain.setValueAtTime(0.3, now + delay2);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + delay2 + 0.13);
  
  osc2.connect(gain2);
  gain2.connect(lowpassFilter);
  
  osc2.start(now + delay2);
  osc2.stop(now + delay2 + 0.14);

  // --- RUIDO SIBILANTE (Soplo de aire en la mandíbula al ladrar) ---
  if (noiseBuffer) {
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(500, now + 0.15);
    noiseFilter.Q.setValueAtTime(2.0, now);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterSFXGain);
    
    noise.start(now);
    noise.stop(now + 0.16);
  }
}

/**
 * SFX Ladrido de Dolor Squeaky ("¡AYP!") de 8 bits (Abajo)
 * Ladrido corto muy agudo simulando que le pisaron la colita
 */
function playPainYipSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(750, now);
  osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
  
  oscGain.gain.setValueAtTime(0.22, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  
  osc.connect(oscGain);
  oscGain.connect(masterSFXGain);
  osc.start(now);
  osc.stop(now + 0.13);
  
  if (noiseBuffer) {
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1900, now);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.11, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterSFXGain);
    
    noise.start(now);
    noise.stop(now + 0.13);
  }
}

/**
 * SFX Capturar Rosa / Activar Escudo (Glow retro)
 */
function playPowerUpSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(261.63, now); // C4
  osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.1); // C5
  osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6
  
  gainNode.gain.setValueAtTime(0.24, now);
  gainNode.gain.linearRampToValueAtTime(0.24, now + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  
  osc.connect(gainNode);
  gainNode.connect(masterSFXGain);
  
  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * SFX Ganar vida al atrapar Hueso (Arpegio 8-bit ascendente brillante de "1-UP")
 */
function playOneUpSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  
  // Notas C5, E5, G5, C6
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const stepDuration = 0.06; // 60ms por nota
  
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now + idx * stepDuration);
    
    // Configurar envolvente de volumen para cada nota con un decaimiento rápido
    gainNode.gain.setValueAtTime(0.15, now + idx * stepDuration);
    gainNode.gain.setValueAtTime(0.15, now + idx * stepDuration + stepDuration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * stepDuration + stepDuration);
    
    osc.connect(gainNode);
    gainNode.connect(masterSFXGain);
    
    osc.start(now + idx * stepDuration);
    osc.stop(now + idx * stepDuration + stepDuration);
  });
}

/**

 * SFX Escudo Absorbe Impacto / Ruptura (Metal cristalino de 8 bits)
 */
function playShieldAbsorbSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  
  // 1. Onda metálica disonante
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(800, now);
  osc1.frequency.linearRampToValueAtTime(150, now + 0.22);
  
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(825, now);
  osc2.frequency.linearRampToValueAtTime(100, now + 0.22);
  
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(masterSFXGain);
  
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.23);
  osc2.stop(now + 0.23);

  // 2. Ruido blanco de explosión cristalina
  if (noiseBuffer) {
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2500, now);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterSFXGain);
    
    noise.start(now);
    noise.stop(now + 0.26);
  }
}

/**
 * SFX Mugido de Vaca Optimizado ("¡MUUU-U-U!") de 8 bits
 * Modula con un LFO de vibrato de 6.5Hz y un filtro de banda estrecha nasal
 */
function playMooSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  
  // LFO para un vibrato trémulo cómico y auténtico
  lfo.frequency.value = 6.5; 
  lfoGain.gain.setValueAtTime(4.5, now);
  lfoGain.gain.linearRampToValueAtTime(2.0, now + 0.95);
  
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(102, now);
  osc1.frequency.linearRampToValueAtTime(68, now + 0.95); 
  
  osc2.type = 'triangle'; // Mezcla sawtooth y triangle para el timbre de garganta
  osc2.frequency.setValueAtTime(103, now);
  osc2.frequency.linearRampToValueAtTime(69, now + 0.95);
  
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfoGain.connect(osc2.frequency);
  
  // Filtro de garganta de banda estrecha para el sonido nasal
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(320, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.95);
  filter.Q.setValueAtTime(2.5, now);
  
  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.linearRampToValueAtTime(0.24, now + 0.18); // Ataque (Mmm...)
  gainNode.gain.setValueAtTime(0.24, now + 0.55);          // Sostén (...Uuu...)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.95); // Caída
  
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterSFXGain);
  
  lfo.start(now);
  osc1.start(now);
  osc2.start(now);
  lfo.stop(now + 1.0);
  osc1.stop(now + 1.0);
  osc2.stop(now + 1.0);
}

/**
 * SFX Graznido de Queltehue ("¡TERU-TERU!") de 8 bits
 * Graznido corto, muy agudo y chillón de aleteo
 */
function playQueltehueSound() {
  if (!sfxEnabled) return;
  initAudio();
  const now = audioCtx.currentTime;
  
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(920, now); 
  osc1.frequency.exponentialRampToValueAtTime(1550, now + 0.08);
  osc1.frequency.exponentialRampToValueAtTime(1050, now + 0.16);
  
  osc2.type = 'square'; // Tono estridente metálico
  osc2.frequency.setValueAtTime(925, now);
  osc2.frequency.exponentialRampToValueAtTime(1555, now + 0.08);
  osc2.frequency.exponentialRampToValueAtTime(1055, now + 0.16);
  
  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.linearRampToValueAtTime(0.14, now + 0.02);
  gainNode.gain.setValueAtTime(0.14, now + 0.09);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(masterSFXGain);
  
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.18);
  osc2.stop(now + 0.18);
}

/**
 * SFX Cinemático / Fanfarria de Etapa Superada (Reencuentro con Eloísa)
 * Alegre fanfarria épica y emocional retro estilo Mario Bros castillo completado.
 */
function playStageClearSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  stopMusic(); // Detener música normal
  
  // Hermosa fanfarria al estilo retro de nivel completado
  const fanfare = [
    { note: 'G5', time: 0.00, dur: 0.10 },
    { note: 'C6', time: 0.10, dur: 0.10 },
    { note: 'E6', time: 0.20, dur: 0.10 },
    { note: 'G6', time: 0.30, dur: 0.15 },
    { note: 'E6', time: 0.45, dur: 0.15 },
    { note: 'G6', time: 0.60, dur: 0.40 }, // Nota sostenida
    
    // Frase final triunfal (armonía / notas alegres)
    { note: 'F6', time: 1.10, dur: 0.10 },
    { note: 'G6', time: 1.20, dur: 0.10 },
    { note: 'A6', time: 1.30, dur: 0.10 },
    { note: 'B6', time: 1.40, dur: 0.10 },
    { note: 'C7', time: 1.50, dur: 0.60 } // Octava 7 triunfal!
  ];
  
  fanfare.forEach((n) => {
    const t = now + n.time;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle'; // Sonido cálido de flauta/viento 8-bit
    osc.frequency.setValueAtTime(NOTE_FREQS[n.note], t);
    
    // Añadimos un oscilador secundario en square una octava abajo para darle cuerpo y epicidad!
    const subOsc = audioCtx.createOscillator();
    subOsc.type = 'square';
    const subNoteName = n.note.replace('7', '6').replace('6', '5').replace('5', '4');
    subOsc.frequency.setValueAtTime(NOTE_FREQS[subNoteName] || 440, t);
    
    gainNode.gain.setValueAtTime(0.14, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + n.dur);
    
    osc.connect(gainNode);
    subOsc.connect(gainNode);
    gainNode.connect(masterSFXGain);
    
    osc.start(t);
    subOsc.start(t);
    
    osc.stop(t + n.dur + 0.05);
    subOsc.stop(t + n.dur + 0.05);
  });
}

/**
 * SFX Corto y agudo para la conversión progresiva de ítems a puntos.
 * Genera un bip metálico corto y seco a 1500Hz.
 */
function playPointsConversionSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(1500, now);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.05);
  
  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  
  osc.connect(gainNode);
  gainNode.connect(masterSFXGain);
  
  osc.start(now);
  osc.stop(now + 0.07);
}

/**
 * SFX Fin de Juego (Game Over) con melodía de muerte retro estilo Mario Bros
 */
function playGameOverSound() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  stopMusic();
  
  // Retro sad game over melody (similar to Mario death theme)
  // Notas rápidas ascendentes y luego frase descendente melancólica
  const notes = [
    { note: 'B5', time: 0.00, dur: 0.07, type: 'square' },
    { note: 'C6', time: 0.07, dur: 0.07, type: 'square' },
    { note: 'C#6', time: 0.14, dur: 0.07, type: 'square' },
    { note: 'D6', time: 0.21, dur: 0.20, type: 'square' },
    
    // Descending sad phrase
    { note: 'B5', time: 0.45, dur: 0.15, type: 'square' },
    { note: 'G5', time: 0.60, dur: 0.15, type: 'square' },
    { note: 'E5', time: 0.75, dur: 0.15, type: 'square' },
    { note: 'D5', time: 0.90, dur: 0.35, type: 'square' }
  ];
  
  notes.forEach((n) => {
    const t = now + n.time;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = n.type;
    osc.frequency.setValueAtTime(NOTE_FREQS[n.note], t);
    
    gainNode.gain.setValueAtTime(0.18, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + n.dur);
    
    osc.connect(gainNode);
    gainNode.connect(masterSFXGain);
    
    osc.start(t);
    osc.stop(t + n.dur + 0.05);
  });
}

/**
 * Himno Nacional Chileno en 8-bits Procedural
 * Sintetiza la melodía del himno usando un oscilador square brillante y un sub-oscilador triangle.
 */
function playChileanAnthem() {
  if (!sfxEnabled) return;
  initAudio();
  
  const now = audioCtx.currentTime;
  stopMusic(); // Detener música normal
  
  const tempo = 120; // BPM
  const beat = 60 / tempo; // 0.5 segundos por tiempo
  
  const melody = [
    { note: 'C4', time: 0.0 * beat, dur: 0.5 * beat },
    { note: 'E4', time: 0.5 * beat, dur: 0.5 * beat },
    { note: 'G4', time: 1.0 * beat, dur: 0.5 * beat },
    { note: 'E4', time: 1.5 * beat, dur: 0.5 * beat },
    { note: 'C4', time: 2.0 * beat, dur: 0.5 * beat },
    { note: 'G4', time: 2.5 * beat, dur: 0.5 * beat },
    { note: 'C5', time: 3.0 * beat, dur: 1.0 * beat },
    
    { note: 'E4', time: 4.5 * beat, dur: 0.5 * beat },
    { note: 'G4', time: 5.0 * beat, dur: 0.5 * beat },
    { note: 'C5', time: 5.5 * beat, dur: 0.5 * beat },
    { note: 'G4', time: 6.0 * beat, dur: 0.5 * beat },
    { note: 'E4', time: 6.5 * beat, dur: 0.5 * beat },
    { note: 'C5', time: 7.0 * beat, dur: 1.0 * beat },
    
    { note: 'E5', time: 8.5 * beat, dur: 0.5 * beat },
    { note: 'E5', time: 9.0 * beat, dur: 0.5 * beat },
    { note: 'D5', time: 9.5 * beat, dur: 0.5 * beat },
    { note: 'C5', time: 10.0 * beat, dur: 0.5 * beat },
    { note: 'B4', time: 10.5 * beat, dur: 0.5 * beat },
    { note: 'A4', time: 11.0 * beat, dur: 0.5 * beat },
    { note: 'G4', time: 11.5 * beat, dur: 1.0 * beat },
    
    { note: 'G4', time: 13.0 * beat, dur: 0.5 * beat },
    { note: 'G4', time: 13.5 * beat, dur: 0.5 * beat },
    { note: 'F4', time: 14.0 * beat, dur: 0.5 * beat },
    { note: 'A4', time: 14.5 * beat, dur: 0.5 * beat },
    { note: 'C5', time: 15.0 * beat, dur: 0.5 * beat },
    { note: 'B4', time: 15.5 * beat, dur: 0.5 * beat },
    { note: 'G4', time: 16.0 * beat, dur: 0.5 * beat },
    { note: 'B4', time: 16.5 * beat, dur: 0.5 * beat },
    { note: 'C5', time: 17.0 * beat, dur: 1.5 * beat }
  ];
  
  melody.forEach((n) => {
    const t = now + n.time;
    const osc = audioCtx.createOscillator();
    const subOsc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(NOTE_FREQS[n.note], t);
    
    subOsc.type = 'triangle';
    const octave = parseInt(n.note.charAt(1));
    const subNote = n.note.charAt(0) + (octave - 1);
    subOsc.frequency.setValueAtTime(NOTE_FREQS[subNote] || (NOTE_FREQS[n.note] / 2), t);
    
    gainNode.gain.setValueAtTime(0.12, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + n.dur);
    
    osc.connect(gainNode);
    subOsc.connect(gainNode);
    gainNode.connect(masterSFXGain);
    
    osc.start(t);
    subOsc.start(t);
    
    osc.stop(t + n.dur + 0.05);
    subOsc.stop(t + n.dur + 0.05);
  });
}

// Exportar funciones globalmente
window.audioEngine = {
  initAudio,
  startMusic,
  stopMusic,
  toggleMusic,
  setMusicVolume,
  toggleSFX,
  setSFXVolume,
  setMusicTempo,
  setMusicTheme,
  setDangerTheme,
  
  playJumpSound,
  playDoubleJumpSound,
  playCatchSalmonSound,
  playCatchKuchenSound,
  playBarkSound,
  playPainYipSound,
  playGameOverSound,
  playPowerUpSound,
  playOneUpSound,
  playShieldAbsorbSound,
  playMooSound,
  playQueltehueSound,
  playStageClearSound,
  playPointsConversionSound,
  playChileanAnthem
};
