# Changelog - Cholga Run

Todas las modificaciones notables de este proyecto serán documentadas en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.21.0] - 2026-05-24
### Added
- **Resolución Dinámica de Open Graph a Tiempo de Compilación**: Incorporamos `vite.config.js` al proyecto. Al compilar con Vite, el hook `transformIndexHtml` lee dinámicamente las variables de entorno de Vercel (`process.env.VERCEL_URL` en previsualizaciones/staging o `VERCEL_PROJECT_PRODUCTION_URL` en producción) e inyecta la URL base absoluta exacta en `index.html`.
- **Metadata Open Graph con Placeholders**: Modificamos `index.html` reemplazando los enlaces estáticos y relativos por el marcador `%VITE_PUBLIC_URL%` para las etiquetas `og:url`, `og:image`, `twitter:url` y `twitter:image`. Esto garantiza que los scrapers de redes sociales (Facebook, Discord, Twitter) carguen perfectamente las tarjetas y previsualizaciones del juego.
- **Protección de Indexación (SEO)**: Auditamos y verificamos que todas las ramas que no son de producción (ej. previsualizaciones y staging) inyectan automáticamente la cabecera HTTP `X-Robots-Tag: noindex` en Vercel, impidiendo la indexación no deseada y protegiendo el SEO de producción.

## [1.20.0] - 2026-05-24
### Added
- **Entorno de Staging e Integración Continua**: Configuración de un entorno aislado de pruebas profesional en Vercel y Supabase.
- **Aislamiento de Bases de Datos en Vercel**: Dividimos las variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el proyecto de Vercel. Las claves de producción reales se limitaron estrictamente a la casilla `Production`, y las de pruebas locales y staging se añadieron con exclusividad para `Preview` y `Development`.
- **Esquema de Replicación de Base de Datos**: Añadimos el script SQL autocontenido en `docs/database-schema.sql` para instanciar la base de datos de Staging en Supabase con un solo clic (tabla `cholga_leaderboard`, índices de rendimiento y políticas RLS).
- **Flujo de Integración por Línea de Comandos**: Enlazamos y documentamos en `AGENTS.md` el uso del flujo Git con la CLI de GitHub (`gh`) y la CLI de Vercel (`vercel env`), formalizando el uso de la rama `staging` como entorno candidato de lanzamiento intermedio.
- **Limpieza del Repositorio**: Excluimos los archivos `.env` de Git agregando `.env*` de forma segura a `.gitignore`.

## [1.19.1] - 2026-05-23
### Added
- **Efecto de Claxon al Saltar Autos**: Añadido soporte sonoro dinámico en el loop de actualización de obstáculos en `game.js`. Al saltar un obstáculo de tipo `car`, se dispara la bocina sintética retro de Web Audio API (`playCarSpawnSound()`) emulando la clásica reacción de la vaca al ser saltada.

### Changed
- **Sprite del Coche Rediseñado en Perfil Lateral**: Rediseñamos completamente el sprite `car` en `sprites.js` de 32x24 px. Pasó de ser un automóvil mirando al frente a un sedán deportivo pixel-art retro en **perfil lateral** orientado hacia la izquierda (dirección contraria al perro). Se incluyeron faros delanteros amarillos (`Y`) a la izquierda y luces de freno rojas (`R`) a la derecha.
- **Extensión de Duración de la Etapa Especial de Playa**: El recorrido de las etapas especiales de playa ("Turistas") avanza ahora 1.8 veces más lento. Esto prolonga la duración y el disfrute de la playa de manera armoniosa y fluida sin alterar la física o la velocidad visual del scroll.
- **Incremento de Densidad de Obstáculos en Playa y Colegio**:
  - En la etapa especial de colegios se aumentó sustancialmente el spawn y la proporción de automóviles, configurando un array de 4/6 de densidad de coches.
  - En la etapa especial de turistas se incrementó exponencialmente la frecuencia de quitasoles (sombrillas de playa), configurando una tasa similar de 4/6 de densidad.
  - El intervalo de reaparición mínimo se redujo de 1000ms a 700ms en ambas etapas para crear una mayor sensación de reto y jugabilidad fluida.

## [1.19.0] - 2026-05-23
### Added
- **Rediseño de HUD Autoadaptable Premium (v1.19.0)**:
  - **Dynamic Flow Layout**: Reemplazo de coordenadas estáticas absolutas en el HUD de Canvas por un cálculo dinámico de anchos con `ctx.measureText().width`, eliminando por completo las colisiones físicas de textos.
  - **Premium Vertical Dividers**: Líneas verticales semi-translúcidas sutiles (`rgba(255, 255, 255, 0.12)`) entre secciones que ordenan la pantalla como un juego arcade premium.
  - **Smart Collapse Mode**: Si las condiciones extremas activas superan los 490px de espacio, el HUD entra automáticamente en modo ultra-compacto ocultando las leyendas escritas (`DESPEJADO`, `NOCHE`, etc.) y conservando únicamente los preciosos iconos pixel-art para garantizar cero overlaps.
  - **Anclaje de Puntajes a la Derecha**: Re-mapeo del bloque `Puntos / Récord` dibujado a la inversa de derecha a izquierda partiendo del límite estático (`x=730`), lo cual asegura que se expanda armoniosamente hacia la izquierda sin pisar al multiplicador o al inventario de objetos.
  - **Active Event Badges**: Fondo con brillo y color de borde de evento activo (`ERUPCIÓN` en rojo, `TORNADO` en cian, `GATO!` en ámbar) con pulsación luminosa de opacidad (`Math.sin()`) sutil.
- **Banderas Alemanas Procedimentales (1:10)**:
  - Agregamos banderas alemanas tricolores en pixel art (Negro, Rojo, Amarillo) de forma procedural estable y libre de estados mutables mediante la fórmula determinista `((blockId * 3 + i) % 10 === 0)`. Una de cada 10 banderas de casas y Chalets Sureños será la bandera alemana.
- **Etapa Especial "Salida de Colegios" (Etapa 6 y 26)**:
  - **Edificación Colegio Alemán**: Pabellones amarillos escolares y una réplica del *Colegio Alemán de Puerto Varas* de colores básicos (amarillo, rojo, negro y azul) con una gran bandera alemana dinámica ondeando sobre su techo.
  - **Obstáculo Automóvil (`car`)**: Vehículo retro de 64x48px (sedán rojo/azul) que spawnearán bloqueando las calles y requerirán saltos hábiles.
  - **SFX de Bocina Retro**: Sonido de claxon de doble bocina aguda `¡PIIIIP!` en 8 bits gatillado en Web Audio API cuando el automóvil aparece en el horizonte.
  - **Pista de Audio Timbre Escolar**: Música melódica alegre con efectos de timbres de salida inarmónicos, ruidos de motores y bocinas sintéticas retro en `audio.js`.
- **Etapa Especial "Turistas" (Etapa 13 y 33)**:
  - **Playa de Arena Dorada**: Escenario veraniego completo, desactivando el césped para renderizar un suelo de playa con arena dorada veraniega, conchitas, toallas de playa a rayas y veraneantes pixel art descansando bajo el sol.
  - **Obstáculo Quitasol (`quitasol`)**: Sombrillas de playa a rayas de colores que bloquean el paso y deben ser saltadas sobre la arena.
  - **Pista de Audio Cumbia Playera**: Melodía cumbiera tropical sabrosa en 8 bits con bajo sincopado tumbao en onda triangular, percusión/güiro sintética de ruido blanco periódico y armonías brillantes en acordeón de onda cuadrada.

### Changed
- **Duración del Recorrido a 20 Etapas**: Extendimos la duración necesaria para llegar a casa (reencuentro y abrazo final de Elo/Padres en la cabaña sureña) a **20 etapas** (múltiplos de 20), redistribuyendo los 5 eventos especiales a lo largo del trayecto de forma equilibrada:
  - Etapa 3: Erupción Volcánica
  - Etapa 6: Salida de Colegios (¡Nueva!)
  - Etapa 10: Tornado
  - Etapa 13: Turistas en la Playa (¡Nueva!)
  - Etapa 17: ¡Alerta de Gato!
  - Etapa 20: Llegada a Casa / Bandera final.

## [1.18.0] - 2026-05-23
### Added
- **Pantalla de Inicio Dual Column con Leaderboard y Animación Blinking**: Implementamos un rediseño retro de la pantalla de inicio con dos columnas: panel de controles y menú arcade a la izquierda (con mascot interactiva `🐶` que ladra y emite divertidas burbujas de diálogo cómico como *"¡DAME KUCHEN! 🍰"* al hacerle clic) y un leaderboard TOP-10 dinámico visible permanentemente a la derecha. Añadimos leyendas blinking clásicas `★ INSERT COIN ★` y `1UP: 00000` con música ligera de intro.
- **Sintetizador Retro de Música de Intro**: Desarrollamos una sutil melodía procedural en tiempo real utilizando un canal de onda triangular (melódica, suave, sin ritmo percusivo fuerte ni ruidos) para acompañar la pantalla de inicio con estilo arcade retro.
- **God Mode con Saltos Infinitos e Infinitas Projectiles**:
  - En Modo Dios (`isGodMode`), si Cholga consume la Rosa Roja protectora, ¡puede realizar saltos en el aire ilimitados! (no limitados a doble salto).
  - Además, obtiene munición de caca infinita, la cual no decrementa el contador, mantiene visible permanentemente el botón móvil táctil de disparo y muestra un elegante indicador `"x∞"` en el HUD.
- **Tutorial de Disparo en Modo Gato-Gato**: Al atrapar al gato en la etapa especial, se despliega una alerta parpadeante en pantalla en formato retro: `💩 ¡DISPARA CACA CON TECLA F! 💩` para guiar al jugador.
- **Botón e Interacción ESC de Salida en Muerte**: Se añadió la tecla `Escape` y un botón físico con el icono `🏠 INICIO` para regresar al menú principal de forma limpia sin recargar la página.
- **Favicon de Terrier Chileno de Cabeza Negra**: Rediseñamos el favicon del juego con un espectacular pixel art SVG de la cabeza de un terrier tricolor negro con mejillas café, cejas cafés brillantes y ojitos blancos.
- **Balance Progresivo de Generación de Rosas**:
  - En etapas avanzadas (`currentStage >= 6`), la probabilidad neta de aparición de la **Rosa Roja protectora** escala dinámicamente del **`6%` al `9%`** (ampliando el margen de generación de especiales del 10% al 12% y el peso interno de la rosa al 75%, compensando la menor ventana de tiempo por etapa rápida).
  - La duración del escudo protector de doble salto acumulable de la Rosa se incrementa de **15 segundos a 20 segundos** en las etapas rápidas (etapas >= 6).
  - La penalización de escudo consumido tras colisionar con un hoyo u obstáculo se calibra simétricamente a 20s en este trayecto avanzado para mantener un balance y desafío perfectos.

- **Logotipo y Favicon de Cholga Unificados en Círculo Blanco**: Rediseñamos el archivo SVG principal (`favicon.svg`) para incluir un fondo circular blanco sólido e impecable detrás de la cabeza en pixel art de Cholga. Al estar ambos elementos vinculados a este mismo recurso, logramos que tanto el favicon en la pestaña del navegador (evitando que se pierda sobre temas oscuros) como el logo interactivo del encabezado (con su animación hover y sonido click-bark) luzcan exactamente idénticos y resalten sobre cualquier fondo.
- **Diseño Arcade Pulido de Pantalla de Inicio**: Eliminamos la leyenda redundante `1UP: 00000` del inicio y centramos de forma simétrica el clásico aviso parpadeante `★ INSERT COIN ★` directamente debajo de los botones principales de comenzar y clasificación.
- **Opt-Out de Récord**: Añadimos un botón `OMITIR` en formato de dos columnas y soporte de tecla `Escape` (`ESC`) al modal de registro de récord para cancelar y salir directamente al Game Over general.
- **Resolución Técnica de Música de Intro**: Corregimos un bug sutil en Web Audio API por el cual el intento de autoplay al cargar la página bloqueaba la activación posterior en interacciones del usuario. Al reordenar la comprobación de suspensión del contexto (`audioCtx.resume()`) para que ocurra antes del bloqueo por estado de reproducción, garantizamos que cualquier clic o pulsación inicie la melodía de intro impecablemente en cualquier navegador.

### Changed
- **Alineación Vertical Superior**: Removemos `align-items: center` del elemento `body` en CSS para permitir que el contenedor general del juego se alinee de forma natural en la parte superior del viewport, facilitando la visualización en pantallas de menor altura.
- **Tamaño Adaptable del Logotipo**: Ajustamos el tamaño del logotipo de Cholga en la cabecera para que sea de `64x64px` en pantallas grandes y se adapte fluidamente a `48x48px` en dispositivos móviles (resoluciones menores o iguales a `768px`).
- **Alerta de Orientación Móvil Inmersiva**: Rediseñamos la alerta de rotación horizontal en dispositivos móviles. En lugar de limitarse a las dimensiones del contenedor del juego (las cuales se acortaban significativamente en vertical y causaban desbordamientos y recortes ilegibles), ahora la alerta posee un posicionamiento `fixed` de pantalla completa (`100vw`, `100vh`, `z-index: 999999`), garantizando que sea 100% legible y libre de recortes.
- **Renombre de Marca**: Reemplazamos `"CHOLGA: El Gran Escape de la Lluvia Sureña"` por `"CHOLGA RUN: Aventuras de un Terrier Chileno"` en toda la documentación, título del proyecto, README y logs.
- **Renombre de Personaje (Eloísa -> Elo)**: Cambiamos todas las menciones a la dueña del Terrier Chileno de "Eloísa" a "Elo" en diálogos cinemáticos del abrazo final, comentarios de código y guías.
- **HUD Canvas Optimizado**: Corregimos el overlap del multiplicador desplazando sutilmente a la izquierda los indicadores y otorgando un amplio margen de respiración al Score.

## [1.17.0] - 2026-05-23
### Changed
- **Migración a Supabase Free (PostgreSQL)**: Reemplazamos Vercel KV por **Supabase Free** como base de datos permanente para el Leaderboard global.
  - El backend serverless `/api/high-score.js` ahora integra la SDK `@supabase/supabase-js`.
  - El cliente comunica de forma segura con el endpoint serverless, protegiendo las credenciales (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) de filtraciones.
  - Mapeo automático del formato PostgreSQL `created_at` a timestamps de milisegundos de JS para una compatibilidad perfecta con el cliente del juego.
  - Eliminamos la dependencia obsoleta `@vercel/kv` en `package.json` e incorporamos `@supabase/supabase-js`.

## [1.16.0] - 2026-05-23
### Added
- **Leaderboard Global Permanente (Top 10)**: Integración de una base de datos serverless permanente y gratuita a través de **Vercel KV** para guardar y mostrar el Top 10 de récords de puntuación a nivel mundial.
  - Implementación del endpoint `/api/high-score.js` para peticiones `GET` y `POST` con ordenamiento descendente por puntuación y filtros de seguridad.
  - El récord inicial está configurado por defecto con el nombre `"PUSSY-PUSSY"` y `50,000` puntos como único registro de partida.
  - Incorporación del modal pixel-art `#record-modal` de registro de nombre en mayúsculas sostenidas de hasta 12 caracteres.
  - Bypass de teclas de juego durante la escritura del récord para evitar interacciones no deseadas en el fondo.
  - Fallback local sumamente robusto utilizando `localStorage` en caso de fallas de conexión o límites de API excedidos, asegurando jugabilidad ininterrumpida.
  - Despliegue de un layout retro glassmorphic side-by-side en la pantalla de Game Over que aprovecha el ancho de 1440px para contrastar estadísticas frente a la tabla del Top 10.

### Changed
- **HUD Canvas Centrado y Simplificado**: Rediseñamos el HUD superior del lienzo de juego eliminando por completo la columna redundante de distancia (`DST`).
- **Puntuaciones Unidas con Slash**: Fusionamos "PTS" y "MAX" en un único elemento estilizado centrado: `[Score] / [Global Record]` donde la puntuación actual es en color blanco y el récord en amarillo dorado, ambos con comas como separadores de miles (ej. `1,250` / `50,000`).

## [1.15.10] - 2026-05-23
### Fixed
- **Alineación Vertical Milimétrica con Caja de Texto en Mayúsculas**: Solucionamos definitivamente el desfase vertical de los botones de cabecera (`.btn-help`). Al cambiar el texto de los botones a mayúsculas sostenidas (`AYUDA` y `TEMA`) —lo cual coincide estéticamente con el estilo arcade y el resto del HUD—, eliminamos las discrepancias métricas causadas por las minúsculas del pixel-font `"Press Start 2P"`. Adicionalmente, calibramos los tamaños relativos a `0.85rem` para el emoji y `0.72rem` para el texto con un desfase de transformación de `-0.5px`, garantizando un centrado vertical 100% perfecto e impecable.

## [1.15.9] - 2026-05-23
### Changed
- **Reducción del Ratio de Alertas Climáticas a un Flujo Equilibrado**: Redujimos drásticamente la frecuencia de las alertas climáticas volcánicas y tornados.
  - La **Alerta Volcánica** ya no ocurre cada 3 etapas, ahora sucede exactamente **una vez cada 10 etapas** (en los niveles que terminan en 3: 3, 13, 23...).
  - El **Tornado** ya no ocurre cada 4 etapas, ahora sucede exactamente **una vez cada 10 etapas** (en los niveles que terminan en 7: 7, 17, 27...).
  - Esto se estructuró acoplando todas las referencias de colores de fondo, lagos y edificaciones de erupción directamente a la variable global `isEruptionStage`, independientemente de cálculos modulares rígidos.
- **Físicas de Resistencia de Viento al Correr**: Implementamos mecánicas de resistencia contra el viento en el Terrier durante la etapa de Tornado:
  - Correr hacia la derecha (en contra del viento huracanado) es ahora **62.5% más difícil**, reduciendo la velocidad lateral del perro a `1.5` píxeles por frame.
  - Correr hacia la izquierda (asistido por el viento a favor) es **25% más veloz**, aumentando la velocidad a `5.0`.
  - Se aplicó una **fuerza de empuje / deriva constante** de `0.85` píxeles por frame que empuja suavemente al perro hacia atrás si no se está desplazando activamente a la derecha, logrando un *gameplay* increíblemente táctil y desafiante.
- **Atmósfera Densa de Tornado con Múltiples Partículas Voladoras**: Rediseñamos la generación de partículas de viento en la etapa de tornado para llenar completamente el aire con detritos del ambiente:
  - Se incrementó sustancialmente la densidad de spawn a 1-3 partículas aleatorias por frame.
  - Agregamos **múltiples tipos de partículas**: hojas verdes y oliva del bosque con giro rotacional (`p.spin`), ramitas/trozos de madera marrón (`debris`) que rotan a gran velocidad, y salpicaduras de espuma/agua translúcidas (`water`) sopladas del lago Llanquihue, complementando los vectores de viento originales.

## [1.15.8] - 2026-05-23
### Fixed
- **Alineación Vertical Perfecta de Botones**: Solucionamos la desalineación visual de los emojis y el texto `"Ayuda"` y `"Tema"` en los botones de cabecera (`.btn-help`). Se envolvieron los iconos en una clase `.btn-icon` y los textos en `.btn-label`, y se reestructuró su estilo flex a `inline-flex` con una corrección de transformación de `1.5px` en el eje Y para la tipografía pixel-art de 8 bits. Esto alinea milimétricamente las líneas base de los emojis del sistema con la tipografía `"Press Start 2P"`.

### Changed
- **SFX de Destrucción Explosiva**: Rediseñamos completamente la síntesis de audio procedural en `playGodDestroySound()` en `audio.js` para los obstáculos destruidos en Modo Dios o disparando caca. Reemplazamos el sweep de filtro bandpass plano por una explosión multi-capa premium:
  1. Un crash metálico de **ruido blanco** con filtro pasa-bajos de alta resonancia (`Q = 8.0`) que barre desde `1800Hz` hasta `30Hz` para el impacto crujiente inicial.
  2. Un **sub-oscilador sawtooth** que desciende de forma exponencial desde `160Hz` hasta `10Hz` para generar un golpe de graves profundo y vibrante que simula una verdadera detonación retro de 8 bits.

## [1.15.7] - 2026-05-23
### Changed
- **Sombra de Título Optimizada y de Alto Contraste**: Rediseñamos el `text-shadow` del título principal del menú de inicio (`.title-pulse` / `¡CHOLGA RUN!`) en su versión oscura para lograr una estética arcade de 8 bits sumamente premium. Se implementó una sombra multi-capa tridimensional: una primera capa sólida negra de `2px` que delinea las letras dándoles un contraste impecable frente al fondo, una segunda capa de color cian sólido de `4px` para la extrusión retro en 3D, y una tercera capa de resplandor difuso cian (`rgba(0, 240, 255, 0.6)`) de `20px` para dotar al título de un brillo de neón dinámico.
- **Soporte Adaptativo en Modo Claro**: Se configuró un override adaptativo para el título en modo claro (`:root.light-mode .title-pulse`), aplicando un color Slate 900 oscuro con un borde de contraste blanco sutil y un brillo celeste ligero para mantener la legibilidad absoluta y la simetría visual.

## [1.15.6] - 2026-05-23
### Added
- **Inicialización de Tema basada en Preferencias del Sistema**: Implementamos un mecanismo de inicialización de tema inline en el `<head>` de `index.html` que detecta la preferencia de color del sistema operativo (`prefers-color-scheme`) como respaldo por defecto en caso de no existir una preferencia manual del usuario guardada (`terrier_theme` en `localStorage`). Si el sistema prefiere modo claro, se activa `.light-mode` inmediatamente antes de renderizar la página para evitar destellos visuales (FOUC).
- **Decisión de Almacenamiento local vs. Cookies**: Optamos explícitamente por `localStorage` frente a cookies debido a que `localStorage` funciona localmente sin enviar datos redundantes en cada petición HTTP, ofrece una API más limpia y nativa de JS y respeta la privacidad de los usuarios al no requerir banners invasivos de consentimiento de cookies de terceros.

## [1.15.5] - 2026-05-22
### Changed
- **Ampliación del Ancho de Contenedor**: Incrementamos el ancho máximo del contenedor principal de la aplicación (`.app-container`) de `1300px` a `1440px` en `styles.css` para aprovechar mejor el espacio horizontal en pantallas grandes y proporcionar un lienzo de juego y panel de controles aún más cómodo y espacioso.

## [1.15.4] - 2026-05-22
### Fixed
- **Corrección de Ortografía en Diálogo**: Corregimos un error ortográfico en el diálogo de Elo de la cinemática de reencuentro en la cabaña. Se reemplazó el texto `"HAZ VUELTO CHOLGA!"` (del verbo *hacer*) por el correcto `"HAS VUELTO CHOLGA!"` (del verbo auxiliar *haber*).

## [1.15.3] - 2026-05-22
### Changed
- **Calbuco como Volcán Activo Único y Osorno Pacífico**:
  - **Eliminación del Glitch Visual de Transformación**: Corregimos un "pop" visual por el cual, al cambiar de orden dinámicamente, el volcán Osorno visible en pantalla se transformaba instantáneamente en el Calbuco al comenzar la erupción de la Etapa 3.
  - **Secuencia Estática Perfecta**: Fijamos la secuencia de volcanes en el paralaje para que comience con el **Volcán Calbuco** (`b % 2 === 0`) seguido por el **Volcán Osorno** (`b % 2 !== 0`). De este modo, en el inicio de la Etapa 3 el Calbuco aparece de forma totalmente fluida y natural en el centro del viewport listo para hacer erupción, sin ninguna transición abrupta ni transformaciones.
  - **Exclusividad Eruptiva del Calbuco**: Conforme a la geografía real chilena, el **Volcán Calbuco** (irregular) es ahora el **único volcán activo que hace erupción** en el juego durante todas las alertas volcánicas.
  - **Dormancia del Osorno**: El **Volcán Osorno** permanece siempre hermoso, cubierto con sus glaciares blancos y su nube lenticular ("sombrero") de forma totalmente pacífica (solo emitiendo un hilo de humo blanco decorativo ocasional), sin derretirse ni expulsar lava en ningún nivel.
  - **Lava de Calbuco Simplificada**: Simplificamos el spawn de partículas de lava y cenizas para que emerjan estrictamente del cráter de Calbuco, logrando un código más limpio y modular.

## [1.15.2] - 2026-05-22
### Added
- **Erupción del Volcán Calbuco y Osorno Alternada**: Corregimos un detalle determinista del paralaje por el cual en la primera "Alerta Volcánica" (Etapa 3) siempre aparecía centrado el Volcán Osorno y Calbuco quedaba fuera de pantalla. Ahora, alternamos dinámicamente el orden de renderizado en el fondo en las etapas múltiplos de 3:
  - En la **Etapa 3 (primera erupción)** y múltiplos alternados (`currentStage % 6 === 3`), el **Volcán Calbuco** se coloca en el centro del viewport y es el protagonista de la erupción.
  - En la **Etapa 6** y múltiplos alternados (`currentStage % 6 === 0`), el **Volcán Osorno** es el volcán activo que hace erupción.
- **Efectos Premium de Erupción (Lava y Ceniza)**:
  - Rediseñamos ambos volcanes para reaccionar dinámicamente a las erupciones: se oscurece su silueta, se derrite su nieve/glaciar por el calor extremo y brotan tres ríos de lava brillante que pulsan de grosor e intensidad (`Math.sin(Date.now() / 120)`).
  - Agregamos un núcleo de magma amarillo ardiente (`#ffcc00`) en el cráter de los volcanes activos.
  - Habilitamos la generación constante de **humo de ceniza volcánica denso y oscuro** (partículas en tonalidades negro y gris carbón) que se emiten directamente de los cráteres y son empujadas rápidamente por el viento volcánico hacia la izquierda del escenario.
  - Corregimos el spawn de las partículas de lava arrojadas al cielo para que emerjan dinámicamente de las coordenadas exactas del cráter del volcán activo correspondiente (Calbuco o Osorno).

## [1.15.1] - 2026-05-22
### Changed
- **Iconos Retro de Alta Fidelidad en el HUD**: Reemplazamos los iconos emoji vectoriales por un set completo de **sprites pixel-art personalizados de 16x16 píxeles** (sol, nubes con lluvia, relámpagos, neblina, amanecer con océano, atardecer con nubes rosas, luna creciente con estrellas centelleantes, volcanes en erupción, tornados y una simpática cara de gato naranja). Esto soluciona por completo el problema del renderizado deficiente y desalineado de los emojis estándar en el canvas de baja resolución (800x400), garantizando que todos los elementos visuales del HUD luzcan perfectamente nítidos, alineados y fieles a la estética de 8 bits.

## [1.15.0] - 2026-05-22
### Changed
- **Eliminación de Barra Lateral Izquierda**: Se eliminó por completo la sección de estadísticas redundantes del sidebar izquierdo (`.left-sidebar`). El viewport del juego ahora ocupa el ancho completo del contenedor principal, brindando una experiencia de juego mucho más inmersiva y aprovechando el espacio disponible de la pantalla.
- **Reubicación de Controles de Audio**: Los controles de música Polka Retro 8-bit y efectos de sonido (SFX) se reubicaron a un nuevo panel horizontal premium (`.audio-controls-panel`) posicionado directamente debajo del canvas del juego. El panel usa un diseño responsivo de 2 columnas en escritorio y 1 columna en móviles, con estilización glassmorphism coherente con el resto de la interfaz. En dispositivos táctiles (móviles), el panel se oculta automáticamente para maximizar el viewport.
- **Rediseño del Encabezado en 8-bits**: El título del juego se convirtió a mayúsculas sostenidas `"CHOLGA RUN"` y el subtítulo a `"PUERTO VARAS EDITION"`, ambos con tipografía `Press Start 2P` y tamaños de fuente proporcionados (`2rem` y `0.95rem`) para lograr un acople visual simétrico y premium.
- **Alineación de Botones de Acción**: Los botones `❓ Ayuda` y `🌓 Tema` se trasladaron a un contenedor `.header-actions` alineado a la derecha del encabezado, nivelados horizontalmente con el título principal. En pantallas móviles se centran automáticamente.
- **Corrección de Solapamiento de Tecla "Espacio"**: Se aplicaron `flex-shrink: 0` y `white-space: nowrap` a las teclas (`.key`) y `flex-wrap: wrap` a los ítems de control (`.control-item`) para evitar que la tecla "Espacio" desborde o se superponga con las teclas adyacentes.
- **Layout Simplificado**: La grilla principal del juego (`.game-layout`) se convirtió de un `grid` de 2 columnas a un `flexbox` vertical de ancho completo, eliminando la necesidad de media queries de reordenamiento de columnas.

## [1.14.3] - 2026-05-22
### Changed
- **Espaciado y Coordenadas del HUD Superior**: Refactorizamos y equilibramos milimétricamente las coordenadas horizontales de las 12 columnas del HUD. Se reubicaron las posiciones X de la barra de puntuación y clima para predecir y evitar completamente las superposiciones y colisiones tipográficas generadas por palabras de longitud extensa (como `🌅 AMANECER`, `🌇 ATARDECER` o el estado `⛈️ TORMENTA`) y la aparición condicional de eventos especiales (`🌋 ERUPCIÓN`, `🌪️ TORNADO`, `🐱 GATO!`) o munición de caca.

## [1.14.2] - 2026-05-22
### Fixed
- **Duración Limitada de Munición de Caca (`💩`)**: Se limitó el poder de disparar caca para que dure estrictamente hasta el asta de la bandera con el himno nacional y el reencuentro en la cabaña. Al colisionar físicamente con el asta de la bandera (cuando se activa la cinemática de la bandera), el contador de munición se restablece a `poopAmmo = 0`, se eliminan todos los proyectiles en pantalla (`poopProjectiles = []`) y se oculta el botón táctil móvil (`#touch-shoot`) aplicando la clase `.hidden`. Esto evita carry-overs o que el botón aparezca de forma persistente en cinemáticas o en etapas subsecuentes (como etapa 11).

## [1.14.1] - 2026-05-22
### Added
- **Feature (Vercel Speed Insights)**: Integración nativa de la telemetría de rendimiento y Web Vitals de Vercel (`@vercel/speed-insights`). Se configuró la inicialización automática del rastreador al inicio de `game.js` mediante la función `injectSpeedInsights()`, permitiendo capturar métricas de rendimiento reales en producción de manera segura y sin cookies.


## [1.14.0] - 2026-05-22
### Added
- **Etapa Especial de Persecución de Gato ("GATO! GATO!")**: En niveles múltiplos de 5 pero no de 10 (etapas 5, 15, 25...), se activa una etapa especial. Cholga persigue a un inquieto gato naranja que corre y salta de manera errática dentro del viewport. Capturar al gato otorga 12 proyectiles de caca (`💩`).
- **Disparo de Proyectiles de Caca (`💩`)**: El jugador puede disparar caca parabólica (tecla `F` en PC o el botón móvil táctil virtual "💩 DISPARAR"). Al colisionar con cualquier obstáculo (piedras, vacas, cercas, queltehues), el obstáculo explota en partículas color café y se destruye instantáneamente.
- **Sintetizador Procedural de Audio Retro**:
  - **Efecto "chhhhhhh"**: Un barrido de decaimiento exponencial descendente de ruido blanco (Q=4, filtro bandpass de 1000Hz a 300Hz en 0.45s) disparado al destruir obstáculos en Modo Dios o disparando caca.
  - **Maullido Procedural de Gato**: Dos maullidos en secuencia (tono ascendente y descendente de 600Hz -> 1000Hz -> 550Hz con filtro bandpass de voz) disparados aleatoriamente por el gato o al atraparlo.
  - **Melodía de Persecución ("Chase Theme")**: Melodía picada, tensa y rápida de 155 BPM en La Menor con arpegios y acordes staccato en canal square de 8 bits.
- **Ciclo Atmosférico Cruzado**:
  - **Horas del Día (ciclo de 1 etapa)**: Amanecer (sunrise), día (sunny), atardecer (sunset) y noche (night), representadas con hermosos gradientes pixel-art en el cielo.
  - **Climas (ciclo de 3 etapas)**: Despejado (clear), lluvia (rain), tormenta con relámpago (storm) y neblina densa de doble capa oscilante (fog).
  - La erupción volcánica, el tornado, el gato y la escena final de la bandera tienen su propia ambientación especial, pero las escenas finales del himno siempre fuerzan cielo soleado y despejado.
- **HUD con Información Climática**: El HUD muestra el estado del clima (ícono y nombre), la hora del día y la munición activa de proyectiles de caca (`💩 x12`) sin superposición.
- **Aviso de Cambio de Etapa Flotante**: Se removió el bloque negro de fondo del aviso. Ahora se renderiza con un texto flotante 50% más grande (16px) y un robusto contorno negro (stroke de 6px) para una visibilidad perfecta sin obstaculizar la vista.

### Changed
- **Tempo Ajustado por Multiplicador**: La velocidad (tempo BPM) de la música del juego se regula en base al multiplicador de puntaje del jugador (desde normal a 1.0 hasta acelerado y tenso a 5.0). Si el jugador choca, el tempo se reduce de inmediato a su ritmo relajado base.

### Fixed
- **Optimización de Distribución de Columnas en HUD**: Se reordenaron las coordenadas X de las columnas de la barra superior del juego para evitar cualquier superposición de textos largos como "TORMENTA", "ATARDECER", "ERUPCIÓN" o marcadores altos.

## [1.13.3] - 2026-05-22
### Added
- **Cabello Rubio de El Papá**: Se modificaron las primeras 4 filas de los sprites de 8 bits `papa` y `papa_hug` en `sprites.js` para pintar el cabello de El Papá de color rubio (`'Y'`, amarillo/beige) en lugar de café oscuro.
- **Himno de Chile Simplificado**: Se redujo la melodía de `playChileanAnthem()` en `audio.js` para reproducir exclusivamente la icónica secuencia de *"o el asilo contra la opresión"* (`G5-G5, F5, E5-D5, C5-D5, E5, C5`) una sola vez a 100 BPM, emulando la clásica fanfarria retro de 8 bits.

### Fixed
- **Sincronización Audiovisual del Izamiento**: Se ajustó el divisor del temporizador de izado de la bandera en `game.js` de `6.6` a `2.6`. Esto acelera el izamiento para que la estrella de la bandera de Chile llegue con orgullo al tope del asta exactamente al cabo de 4.32 segundos (260 frames a 60 FPS), sincronizándose milimétricamente con el acorde y decay final de la melodía procedural.

## [1.13.2] - 2026-05-22
### Added
- **Finales Rotativos (Elo, La Mamá, El Papá)**: Se crearon programáticamente tres finales secuenciales hermosos y detallados de 8 bits en `sprites.js` y `game.js`. El primer final (etapas 10, 40...) es con Elo; el segundo (etapas 20, 50...) introduce a "La Mamá" con pelo castaño oscuro y una blusa rosada brillante (color de camisa `'B'` para contraste perfecto con su tono de piel `'P'`); el tercero (etapas 30, 60...) introduce a "El Papá" con barba, bigote, cabello castaño corto, camisa verde y pantalones grises.
- **Diálogos de Final Dinámicos**: Cholga responde de forma interactiva y tierna a cada uno: responde `"I ❤️ ELO"`, `"TKM ❤️  MAMÁ"` (para La Mamá) o `"JAMONCITO ❤️  PAPÁ"` (para El Papá) utilizando alineaciones de texto y corazones de pixel art con márgenes calculados milimétricamente dentro del bocadillo retro.

### Fixed
- **Bandera e Himno Nacional en todas las Etapas de Final**: Se corrigió el problema por el cual el izamiento de la bandera chilena y la melodía procedural del Himno Nacional de Chile solo se reproducían al finalizar la Etapa 10 y se omitían en la Etapa 20. Al refactorizar el disparador de transición y las condiciones de etapa a módulos de 10 (`currentStage % 10 === 0` y `currentStage % 10 !== 0`), ahora el asta de la bandera física aparece, el himno nacional suena y la bandera se iza con orgullo al final de **cada décima etapa** (10, 20, 30, etc.) sin saltos ni evasiones basadas en distancia.

## [1.13.1] - 2026-05-22
### Fixed
- **Bug 10 (Líneas de Unión y Seams en Texturas Repetidas)**: Se eliminaron por completo las molestas líneas de unión semi-transparentes de 1 píxel (causadas por el renderizado de subpíxeles con antialiasing en coordenadas decimales de canvas) en el fondo del Lago Llanquihue, el follaje lejano del bosque y el suelo de arena volcánica negra. Esto se resolvió aplicando un solapamiento técnico de 2 píxeles (`CANVAS_WIDTH + 2`) en los bloques de renderizado contiguos.
- **Sincronización de Olas y Detalles sin Saltos**: Se refactorizó la física de las olas del lago y los detalles del suelo volcánico. Se reemplazó el cálculo con modulo screen wrapping (`% CANVAS_WIDTH`) por coordenadas de renderizado 100% relativas a la coordenada base de scroll `x`, espaciando las olas y detalles uniformemente para evitar solapamientos dobles o recortes abruptos en los bordes del canvas.

## [1.13.0] - 2026-05-22
### Added
- **Feature 16 (Saiyajin God Mode)**: Implementación de un comando secreto y oculto (`"god"`) que se puede tipear en el teclado durante el juego para alternar el "Modo Dios". En este estado, Cholga es completamente invulnerable a obstáculos y hoyos (los destruye en un espectacular estallido de fuego y muestra el texto flotante "¡DESTRUIDO!").
- **Aura y Aspecto Saiyajin**: Cholga adquiere un aspecto visual en llamas con un aura de partículas de fuego ascendentes en colores amarillo, naranja y rojo, combinada con un hermoso y vibrante resplandor/glow dorado (`shadowBlur = 15`, `shadowColor = '#ffcc00'`) alrededor de su sprite de píxeles.
- **Desactivación Inteligente en Cinemática**: El modo Dios se desactiva de forma automática y transparente al llegar al asta de la bandera y reencontrarse con Elo (Etapa 10) para asegurar que la animación del abrazo funcione perfectamente sin auras de llamas sobre los personajes. Posteriormente, al presionar una tecla para continuar la aventura en la Etapa 11, el modo Dios se reactiva automáticamente si estaba encendido de antemano, reanudando la acción con una explosión de partículas.

## [1.12.0] - 2026-05-22
### Added
- **Feature 15 (Vercel Web Analytics)**: Integración nativa del SDK de telemetría de Vercel (`@vercel/analytics`). Se configuró la inicialización automática del rastreador al inicio de `game.js` mediante la función `inject()`, permitiendo capturar métricas de rendimiento y telemetría de audiencia en tiempo real sin cookies ni impacto en la privacidad de los usuarios.

## [1.11.2] - 2026-05-22
### Added
- **Improvement 4 (Reducción de Suelo Subterráneo)**: Se redujo a la mitad el alto del suelo subterráneo (cambiando `GROUND_Y` de `320` a `360`), incrementando el cielo y el espacio vertical del juego en un 10%. Las capas de parallax (lago Llanquihue, bosque y edificaciones) y las físicas de juego se adaptaron dinámicamente.

### Fixed
- **Bug 8 (Reinicio Incorrecto en "Intentar de nuevo")**: Se corrigió el problema por el cual el clima, los efectos de partículas y el tema musical de etapas posteriores persistían al reiniciar una nueva partida. Ahora `resetGameVariables()` ejecuta `applyStageEnvironment(1)`, forzando al motor de audio y al clima a reestablecerse a la pacífica Etapa 1 (amanecer).
- **Bug 9 (Superposición en Récord y Multiplicador del Canvas HUD)**: Se optimizó y rediseñó el marcador HUD. Se redujo el alto del contenedor a `32px` con un elegante diseño glassmorphic de bordes redondeados (`8px`), se fusionaron Etapa y Clima en una sola línea horizontal, y se cambió la alineación del multiplicador a la derecha en `x = 775` para erradicar cualquier superposición con `MAX`.

## [1.11.1] - 2026-05-22
### Fixed
- **Bug 6 (Re-colisión Infinita de Bandera en Etapa 10)**: Se corrigió un bucle infinito en el cual, al reanudar la partida presionando cualquier tecla después de la cinemática de abrazo con Elo, el perro colisionaba inmediatamente de nuevo con el asta de la bandera porque esta seguía en pantalla a la izquierda del perro. Ahora, al continuar a la Etapa 11, se limpian y restablecen por completo el asta de la bandera y todas las variables físicas de la cinemática en `resumeAfterCutscene()`.
- **Bug 7 (Notas Auténticas del Himno Nacional de Chile)**: Reemplazo de la melodía arpegiada provisional por los compases reales y reconocibles de la melodía de *"Puro, Chile, es tu cielo azulado"* sintetizada proceduralmente en 8 bits (onda cuadrada brillante con sub-armónicos en onda triangular). Adicionalmente, se ajustó el divisor del temporizador de `5.5` a `6.6` para sincronizar a la perfección el izamiento de la bandera con la duración extendida del himno.

## [1.11.0] - 2026-05-22
### Added
- **Feature 12 (Marcador Unificado en Canvas)**: Rediseño completo del HUD para dibujarse directamente dentro del Canvas con estética premium de 8 bits, ocultando la barra superior HTML. Muestra corazones pixelados, contadores dinámicos de salmón/kuchen con sus sprites originales, puntaje con ceros a la izquierda y un multiplicador rosa brillante que oscila y pulsa con una micro-animación `Math.sin(Date.now() / 120)` cuando es superior a `x1.0`.
- **Feature 13 (Asta de Bandera Meta-Física e Himno 8-bit en Etapa 10)**: Implementación de una meta física espectacular para la Etapa 10. Al llegar a la meta, el escenario transiciona suavemente a una pradera verde limpia. El perrito colisiona físicamente en el suelo con un asta de bandera, deteniendo el scroll y detonando una síntesis procedural en tiempo real del Himno Nacional de Chile en 8 bits (onda cuadrada brillante de trompeta y sub-onda triangular armónica). La bandera chilena se iza sincronizadamente y, al terminar, se desliza la cabaña para el abrazo final de Elo.
- **Feature 14 (Chalet Sureño con Bandera)**: Cuarto tipo de edificación para el fondo del bosque/pueblo, caracterizado por vigas de madera verticales, chimenea activa que emite partículas de humo retro y una bandera de Chile permanente a su derecha.

### Fixed
- **Bug 4 (Eliminación de Saltos en Parallax)**: Refactorización completa de `drawParallax()` y sus capas (bosque, suelo, lago, volcanes) eliminando el uso de acumuladores con el operador módulo `%`. Ahora utiliza coordenadas de desplazamiento continuo basadas en bloques estables, erradicando por completo el molesto salto, parpadeo o desaparición ("swapping") de árboles y casas al resetear coordenadas.
- **Bug 5 (Legibilidad en Tema Claro)**: Corrección de contraste en el tema claro agregando clases e incrementando la especificidad CSS sobre `.sidebar-title`, `.help-key` y `.help-item-info`. El texto y los comandos de ayuda ahora son 100% legibles sobre el fondo claro.

## [1.10.0] - 2026-05-22
### Added
- Feature 10: Selector premium de modo claro-oscuro (`🌓 Tema`) en el encabezado con guardado persistente en `localStorage`. Cuenta con una paleta refinada gris pizarra claro en modo claro, adaptaciones responsivas y una transición fluida en toda la interfaz sin interferir en los gráficos del canvas arcade.
- Feature 11: Mejora de la estética nevada de los volcanes en el fondo: la cumbre nevada del volcán Osorno se extendió al 45% de la ladera lateral con lenguas de glaciar dentadas, y se agregaron cumbres nevadas irregulares tridimensionales a los dos picos principales del volcán Calbuco.

### Fixed
- Bug 1: Interacción de la Burbuja vs Hoyos. Cholga ya no muere al caer en hoyos/fosas cuando el escudo de la rosa está activo; en su lugar, la burbuja explota consumiendo el escudo y propulsándolo verticalmente hacia arriba (`terrier.vy = JUMP_FORCE`) en un salto salvador espectacular.
- Bug 2: Reseteo del multiplicador de puntaje y solución de teclas atascadas al reiniciar. Se eliminó el bloqueo de teclas liberadas (`keyup`) durante la animación de muerte (`STATES.DYING`), resolviendo de forma robusta el atasco de controles. Adicionalmente, se previno la ejecución de bucles de animación (`requestAnimationFrame`) simultáneos al reanudar o reiniciar el juego mediante un sistema de tracking de `animationFrameId`, erradicando definitivamente el bug en el cual el multiplicador no se reiniciaba a `1.0` o la velocidad de juego se duplicaba.
- Bug 3: Visibilidad del Modal de Ayuda. Reparada la apertura y cierre del modal agregando y quitando la clase de transición `.active` simultáneamente con `.hidden`, solucionando el problema de la opacidad nula heredada de la clase de pantalla superpuesta.

## [1.9.0] - 2026-05-22
### Added
- Feature 9: Corrección del aspecto de visualización en pantalla completa (`fullscreen-stretch`). Se reconfiguró la regla de pantalla completa de `#game-canvas` utilizando `object-fit: contain` acoplado a dimensiones de llenado de contenedor (`width: 100%`, `height: 100%`) para prevenir deformaciones o estiramientos y conservar estrictamente la proporción 2:1 del juego en cualquier monitor o dispositivo móvil.

## [1.8.0] - 2026-05-22
### Added
- Feature 8: Modal de ayuda interactivo con diseño glassmorphic moderno (utilizando `backdrop-filter` de CSS), integrado con botón `❓ Ayuda` en el encabezado. Permite pausar y reanudar el juego de manera limpia y ofrece documentación detallada sobre jugabilidad, controles, ítems y peligros sureños.

## [1.7.0] - 2026-05-22
### Added
- Feature 7: Efecto visual y de sonido retro "1-UP!" para la recolección del hueso. Incluye un arpegio ascendente de 8 bits en `audio.js` sintetizado con ondas cuadradas a intervalos rápidos y un texto verde neón brillante `"1-UP!"` flotando sobre Cholga con atenuación y movimiento vertical.

## [1.6.0] - 2026-05-22
### Added
- Feature 6: Redimensionamiento visual y físico de las vallas del juego (`fence`) a `52x52` píxeles para aumentar el desafío en la carrera, conservando la compatibilidad táctica de agacharse por debajo para evadir colisiones.

## [1.5.0] - 2026-05-22
### Added
- Feature 5: Rediseño completo de la síntesis del ladrido del Terrier Chileno (`playBarkSound`) en `audio.js` utilizando osciladores duales `sawtooth` con desfase (impulso inicial y de cuerpo), pasados a través de un filtro pasabajos de resonancia variable de 8 bits para emular un ladrido enérgico "GU-AU!".

## [1.4.0] - 2026-05-22
### Added
- Feature 4: Integración de meta tags Open Graph y Twitter Cards para vistas previas enriquecidas en redes sociales, enlazados con la imagen destacada e incorporación de un favicon en formato SVG con la cabeza en pixel-art de un Terrier Chileno tricolor.

## [1.3.0] - 2026-05-22
### Added
- Feature 3: Renombrado oficial del juego a "Cholga Run" en el título de la página, el encabezado de navegación, el menú de inicio y las advertencias táctiles móviles.

## [1.2.0] - 2026-05-22
### Added
- Feature 2: Clima y evento de Tornado en etapas múltiplos de 5 (que no sean múltiplos de 10). Añadido el obstáculo de vacas voladoras giratorias en 3D/2D con oscilación sinusoidal, y líneas cinéticas de ráfagas de viento.

## [1.1.0] - 2026-05-22
### Added
- Feature 1: Lluvia de rocas volcánicas incandescentes que caen en diagonal desde el cielo durante la etapa de erupción volcánica, con sistema de colisiones ajustado.

## [1.0.0] - 2026-05-22
### Added
- Primera versión funcional estable de Cholga Run.
- Runner infinito de 10 etapas con climas dinámicos de Puerto Varas y cinemática de reencuentro con Elo.
- Soporte táctil móvil avanzado con joystick virtual analógico y botón de salto dedicado.
- Síntesis de sonido retro de 8 bits a través de Web Audio API para música adaptativa y SFX.
- Sprites pixel-art personalizables para el Terrier Chileno, vacas, hoyos, volcanes y lagos.
- Soporte para pantalla completa y overlay de detección de orientación en dispositivos móviles.
