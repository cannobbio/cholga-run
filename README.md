# 🐶 CHOLGA RUN: Aventuras de un Terrier Chileno

> Un juego runner pixel-art de 8 bits protagonizado por un Terrier Chileno que escapa de la lluvia del sur de Chile para reencontrarse con su dueña Elo.

🎮 **[¡Jugar ahora!](https://cholga-run.vercel.app)**

---

## 🎯 Descripción

**CHOLGA** es un runner infinito por etapas con estética retro de 8 bits ambientado en los paisajes del sur de Chile. Controla a Cholga, un valiente Terrier Chileno tricolor, mientras esquiva vacas, vallas, piedras volcánicas y hoyos en el suelo. Recolecta salmones, devora kuchenes y junta rosas protectoras y huesos de vida extra en tu misión por volver a casa con Elo.

Cada 10 etapas, Cholga llega a la cabaña de Elo en una cinemática emotiva con burbujas de diálogo estilo cómic, conversión de ítems a puntos y una fanfarria épica de etapa completada.

---

## ✨ Características

### 🕹️ Jugabilidad
- **20 etapas** con dificultad progresiva y velocidad incremental para llegar a casa.
- **7 climas dinámicos**: amanecer, soleado, lluvia, atardecer, noche, neblina y tormenta.
- **HUD Premium Autoadaptable Integrado en Canvas**: Marcador de 8 bits con layout dinámico de flujo, divisores verticales retro, tarjetas (badges) parpadeantes de evento y compactación inteligente (colapso de textos en caso de espacio reducido) que erradica por completo overlaps y colisiones. Puntuación anclada de derecha a izquierda partiendo de `x=730` y multiplicador rosa con wobble/pulse a la derecha.
- **Meta Física y Ceremonia de la Etapa 20**: Al final de la etapa 20, el escenario transiciona suavemente a una pradera verde y despejada. Cholga colisiona en el suelo firme con un asta de bandera, deteniendo el movimiento y dando inicio a una síntesis procedural del Himno Nacional de Chile en 8 bits. La bandera de Chile se iza de forma fluida y sincronizada, dando paso a la cabaña sureña y el abrazo con Elo/Padres (con soporte de finales alternativos según el ciclo).
- **Variedad de Fondos y Edificaciones**: Parallax de 5 capas completamente continuo que incluye volcanes nevados, araucarias, casas de estilo alemán, chalet sureño con chimenea activa, pabellones de aulas, el Colegio Alemán de Puerto Varas con gran bandera alemana dinámica y la hermosa playa dorada de veraneantes.
- **5 Eventos y Etapas Especiales**:
  - Etapa 3: Erupción Volcánica (temblor de pantalla, partículas de lava, música de peligro).
  - Etapa 6: Salida de Colegios (edificio Colegio Alemán, obstáculos de automóviles, bocinas y timbre procedural).
  - Etapa 10: Tornado (viento y vacas voladoras).
  - Etapa 13: Turistas en la Playa (suelo de arena de playa dorada, toallas, veraneantes, sombrillas y cumbia retro).
  - Etapa 17: ¡Alerta de Gato! (persecución para munición de caca).
- **Sistema de vidas**: comienza con 1 vida, acumula más con huesos blancos.
- **Escudo temporal** de la Rosa Roja con doble salto aéreo (15 segundos, 20 segundos en etapas >= 6) que te salva incluso de caer en hoyos.
- **Modal de Ayuda Glassmorphic** interactivo para revisar las reglas, controles y secretos en cualquier momento con pausa automática del juego.
- **Selector de Tema Claro-Oscuro Premium** (`🌓 Tema`) en el encabezado con persistencia automática en `localStorage` y total contraste legible.
- **Telemetría e Insights**: Integración nativa de Vercel Web Analytics para auditar el rendimiento técnico del juego y estadísticas básicas en tiempo real de forma anónima y 100% libre de cookies.
- **Modo Dios Saiyajin Oculto**: Al escribir de manera oculta la palabra `"god"` en el teclado durante el juego, alternas el Modo Dios. Cholga se transforma visualmente en un súper saiyajin con un aura de partículas de fuego ascendentes (en colores amarillo, naranja y rojo) y un resplandor dorado vibrante (`ctx.shadowBlur = 15`). Esto le confiere invulnerabilidad completa ante todos los obstáculos y hoyos (los cuales explotan al chocar con él). Se desactiva y guarda de forma inteligente cuando Cholga abraza a Elo (Etapa 10) para preservar la animación limpia y se reactiva automáticamente en la Etapa 11 al reanudar la carrera. En Modo Dios, si Cholga consume la Rosa Roja que otorga doble salto, ¡los saltos en el aire se vuelven infinitos! Además, obtiene munición de caca infinita para disparar con la tecla F sin consumir proyectiles (mostrando un contador "x∞" en el HUD).

### 🎮 Controles

| Acción | Desktop | Mobile |
|--------|---------|--------|
| **Saltar** | `Espacio` | Botón SALTAR (pulgar derecho) |
| **Moverse** | `← →` Flechas | Joystick analógico (pulgar izquierdo) |
| **Agacharse** | `↓` Flecha abajo | Joystick hacia abajo |
| **Ladrar** | `↑` Flecha arriba | Joystick hacia arriba |
| **Pausar** | `P` / `Esc` | — |
| **Modo Dios Saiyajin** | Escribe `god` (secreto) | — |

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
- **Volcanes Osorno y Calbuco** con estética nevada mejorada de alta definición 8 bits (nieve en Osorno extendida hasta el 45% lateral con bordes de glaciar, y cumbres nevadas en los picos principales de Calbuco)
- **Edificaciones variadas**: casas de colores, iglesias, árboles araucarias y banderas chilenas

---

## 🏗️ Arquitectura Técnica

El juego está construido enteramente en **vanilla JavaScript** sin frameworks ni dependencias de runtime — solo HTML, CSS y JS puro con Web Audio API.

```
cholga-run/
├── index.html          # Estructura HTML + HUD + overlays + controles touch
├── styles.css          # Estilos responsivos, glassmorphism, joystick y animaciones
├── game.js             # Motor del juego: física, colisiones, spawns, cinemáticas
├── sprites.js          # Sprites pixel-art como matrices de caracteres (ASCII art)
├── audio.js            # Motor de audio: síntesis procedural de música y SFX
├── vite.config.js      # Configuración de Vite e inyección de Open Graph dinámico
├── package.json        # Configuración de Vite para bundling
├── vercel.json         # Configuración de deploy en Vercel
└── docs/
    └── database-schema.sql  # Script DDL para inicialización de base de datos
```

### ⚙️ Flujo DevOps Profesional (Staging vs. Producción)

Para garantizar que las pruebas de desarrollo no alteren las puntuaciones oficiales del Leaderboard global, el proyecto implementa un flujo de CI/CD robusto con aislamiento completo:

* **Entorno de Producción**: Rama `main` desplegada en Vercel, conectada estrictamente a la base de datos de producción de Supabase (`supabase-cholga-run`).
* **Entorno de Staging (Pruebas)**: Rama `staging` desplegada en previsualizaciones de Vercel y ejecuciones locales (`npm run dev`), enlazada de forma segura a una base de datos aislada de pruebas en Supabase (`supabase-cholga-run-staging`).
* **Metadata SEO Dinámica**: Integración a tiempo de compilación con Vite para inyectar URLs absolutas dinámicas en las etiquetas Open Graph y Twitter (`og:url`, `og:image`) según la procedencia del despliegue.
* **Protección Anti-Indexación**: Todas las previsualizaciones de Vercel cuentan con la inyección automática de la cabecera HTTP `X-Robots-Tag: noindex` para evitar que los entornos de staging compitan en SEO o indexen contenido duplicado en motores de búsqueda.

### Decisiones de Diseño

| Aspecto | Solución |
|---------|----------|
| **Rendering** | Canvas 2D con sprites dibujados píxel a píxel desde matrices de caracteres |
| **Física** | Gravedad, velocidad terminal y colisiones AABB con cajas ajustadas |
| **Audio** | Web Audio API con osciladores, filtros y ruido blanco sintetizado |
| **FPS** | Throttle a 60 FPS via `requestAnimationFrame` + delta time (compatible con pantallas 120Hz+) |
| **Touch** | Joystick analógico con clamping trigonométrico y tracking por `touch.identifier` |
| **Build** | Vite 5 para bundling ESM, tree-shaking y minificación |
| **Pantalla Completa** | Letterboxing y pillarboxing automáticos con `object-fit: contain` y relación de aspecto `2:1` forzada para impedir distorsión |

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
