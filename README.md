# 🐶 CHOLGA: El Gran Escape de la Lluvia Sureña

> Un juego runner pixel-art de 8 bits protagonizado por un Terrier Chileno que escapa de la lluvia del sur de Chile para reencontrarse con su dueña Eloísa.

🎮 **[¡Jugar ahora!](https://cholga-run.vercel.app)**

---

## 🎯 Descripción

**CHOLGA** es un runner infinito por etapas con estética retro de 8 bits ambientado en los paisajes del sur de Chile. Controla a Cholga, un valiente Terrier Chileno tricolor, mientras esquiva vacas, vallas, piedras volcánicas y hoyos en el suelo. Recolecta salmones, devora kuchenes y junta rosas protectoras y huesos de vida extra en tu misión por volver a casa con Eloísa.

Cada 10 etapas, Cholga llega a la cabaña de Eloísa en una cinemática emotiva con burbujas de diálogo estilo cómic, conversión de ítems a puntos y una fanfarria épica de etapa completada.

---

## ✨ Características

### 🕹️ Jugabilidad
- **10+ etapas** con dificultad progresiva y velocidad incremental
- **7 climas dinámicos**: amanecer, soleado, lluvia, atardecer, noche, neblina y tormenta
- **Erupciones volcánicas** cada 3 etapas con temblor de pantalla y partículas de lava
- **Sistema de vidas**: comienza con 1 vida, acumula más con huesos blancos
- **Escudo temporal** de la Rosa Roja con doble salto aéreo (15 segundos)
- **Cinemática de reencuentro** con Eloísa al completar cada ciclo de 10 etapas

### 🎮 Controles

| Acción | Desktop | Mobile |
|--------|---------|--------|
| **Saltar** | `Espacio` | Botón SALTAR (pulgar derecho) |
| **Moverse** | `← →` Flechas | Joystick analógico (pulgar izquierdo) |
| **Agacharse** | `↓` Flecha abajo | Joystick hacia abajo |
| **Ladrar** | `↑` Flecha arriba | Joystick hacia arriba |
| **Pausar** | `P` / `Esc` | — |

### 📱 Soporte Mobile
- **Joystick analógico virtual** con arrastre continuo y retorno elástico
- **Multi-touch** robusto: muévete y salta simultáneamente sin interferencia
- **Pantalla completa** con bloqueo de orientación horizontal (Android)
- **Overlay de rotación** elegante para iOS cuando se detecta modo portrait

### 🎵 Audio
- **Música chip procedural** sintetizada en tiempo real con Web Audio API
- **4 temas musicales**: sunny, sunrise, sunset, night + tema de peligro volcánico
- **Polka sureña** como tema principal con tempo adaptativo a la velocidad del juego
- **SFX sintetizados**: ladrido de 3 componentes, salto, colisión, muerte, mugido de vaca, recolección y fanfarria de etapa
- Controles independientes de volumen para música y efectos

### 🎨 Gráficos
- **Sprites pixel-art** dibujados a mano en matrices de caracteres
- **Parallax de 4 capas**: cielo, volcanes, lago Llanquihue y pueblo/bosque
- **Partículas dinámicas**: lluvia, lava, pétalos de rosa, destellos y relámpagos
- **Volcanes Osorno y Calbuco** con nieve animada y lava
- **Edificaciones variadas**: casas de colores, iglesias, árboles araucarias y banderas chilenas

---

## 🏗️ Arquitectura Técnica

El juego está construido enteramente en **vanilla JavaScript** sin frameworks ni dependencias de runtime — solo HTML, CSS y JS puro con Web Audio API.

```
cholga-run/
├── index.html      # Estructura HTML + HUD + overlays + controles touch
├── styles.css      # Estilos responsivos, glassmorphism, joystick y animaciones
├── game.js         # Motor del juego: física, colisiones, spawns, cinemáticas
├── sprites.js      # Sprites pixel-art como matrices de caracteres (ASCII art)
├── audio.js        # Motor de audio: síntesis procedural de música y SFX
├── package.json    # Configuración de Vite para bundling
└── vercel.json     # Configuración de deploy en Vercel
```

### Decisiones de Diseño

| Aspecto | Solución |
|---------|----------|
| **Rendering** | Canvas 2D con sprites dibujados píxel a píxel desde matrices de caracteres |
| **Física** | Gravedad, velocidad terminal y colisiones AABB con cajas ajustadas |
| **Audio** | Web Audio API con osciladores, filtros y ruido blanco sintetizado |
| **FPS** | Throttle a 60 FPS via `requestAnimationFrame` + delta time (compatible con pantallas 120Hz+) |
| **Touch** | Joystick analógico con clamping trigonométrico y tracking por `touch.identifier` |
| **Build** | Vite 5 para bundling ESM, tree-shaking y minificación |

---

## 🚀 Desarrollo Local

### Requisitos
- Node.js 18+
- npm 9+

### Instalación

```bash
git clone https://github.com/cannobbio/cholga-run.git
cd cholga-run
npm install
```

### Servidor de Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### Build de Producción

```bash
npm run build
npm run preview
```

---

## 🌐 Deploy

El proyecto está desplegado en **Vercel** con deploys automáticos en cada push a `main`.

```bash
# Deploy manual (requiere Vercel CLI autenticado)
vercel deploy --prod
```

---

## 🎮 Elementos del Juego

### Obstáculos
| Sprite | Nombre | Comportamiento |
|--------|--------|----------------|
| 🐄 | **Vaca** | Obstáculo terrestre grande, emite un mugido al ser esquivada |
| 🪨 | **Piedra Volcánica** | Obstáculo terrestre pequeño |
| 🪵 | **Valla** | Obstáculo aéreo — se esquiva agachándose |
| 🕳️ | **Hoyo** | Trampa en el suelo — Cholga cae si no salta |

### Coleccionables
| Sprite | Nombre | Efecto |
|--------|--------|--------|
| 🐟 | **Salmón** | +50 puntos base (×multiplicador) |
| 🍰 | **Kuchen** | +100 puntos + incrementa el multiplicador ×0.1 |
| 🌹 | **Rosa Roja** | Escudo temporal de 15s + doble salto aéreo |
| 🦴 | **Hueso Blanco** | +1 vida extra, emite un efecto retro \"1-UP!\" visual y sonoro |

---

## 🗺️ Ambientación

El juego recrea los paisajes icónicos del **sur de Chile**, específicamente la zona de **Puerto Varas** y el **Lago Llanquihue**:

- 🌋 **Volcán Osorno** — Con su cono nevado perfecto y lava en etapas volcánicas
- 🌋 **Volcán Calbuco** — Silueta rugosa con cráter humeante
- 🏞️ **Lago Llanquihue** — Aguas azules con reflejo y botes pesqueros
- 🏡 **Pueblo sureño** — Casas de madera de colores, iglesias y araucarias
- 🇨🇱 **Banderas chilenas** — Aparecen ocasionalmente entre las edificaciones

---

## 📄 Licencia

MIT © [cannobbio](https://github.com/cannobbio)

---

<p align="center">
  Hecho con ❤️ y mucha lluvia sureña 🌧️
  <br>
  <strong>¡Corre, Cholga, corre!</strong> 🐶💨
</p>
