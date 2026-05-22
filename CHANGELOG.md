# Changelog - Cholga Run

Todas las modificaciones notables de este proyecto serán documentadas en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.11.2] - 2026-05-22
### Added
- **Improvement 4 (Reducción de Suelo Subterráneo)**: Se redujo a la mitad el alto del suelo subterráneo (cambiando `GROUND_Y` de `320` a `360`), incrementando el cielo y el espacio vertical del juego en un 10%. Las capas de parallax (lago Llanquihue, bosque y edificaciones) y las físicas de juego se adaptaron dinámicamente.

### Fixed
- **Bug 8 (Reinicio Incorrecto en "Intentar de nuevo")**: Se corrigió el problema por el cual el clima, los efectos de partículas y el tema musical de etapas posteriores persistían al reiniciar una nueva partida. Ahora `resetGameVariables()` ejecuta `applyStageEnvironment(1)`, forzando al motor de audio y al clima a reestablecerse a la pacífica Etapa 1 (amanecer).
- **Bug 9 (Superposición en Récord y Multiplicador del Canvas HUD)**: Se optimizó y rediseñó el marcador HUD. Se redujo el alto del contenedor a `32px` con un elegante diseño glassmorphic de bordes redondeados (`8px`), se fusionaron Etapa y Clima en una sola línea horizontal, y se cambió la alineación del multiplicador a la derecha en `x = 775` para erradicar cualquier superposición con `MAX`.

## [1.11.1] - 2026-05-22
### Fixed
- **Bug 6 (Re-colisión Infinita de Bandera en Etapa 10)**: Se corrigió un bucle infinito en el cual, al reanudar la partida presionando cualquier tecla después de la cinemática de abrazo con Eloísa, el perro colisionaba inmediatamente de nuevo con el asta de la bandera porque esta seguía en pantalla a la izquierda del perro. Ahora, al continuar a la Etapa 11, se limpian y restablecen por completo el asta de la bandera y todas las variables físicas de la cinemática en `resumeAfterCutscene()`.
- **Bug 7 (Notas Auténticas del Himno Nacional de Chile)**: Reemplazo de la melodía arpegiada provisional por los compases reales y reconocibles de la melodía de *"Puro, Chile, es tu cielo azulado"* sintetizada proceduralmente en 8 bits (onda cuadrada brillante con sub-armónicos en onda triangular). Adicionalmente, se ajustó el divisor del temporizador de `5.5` a `6.6` para sincronizar a la perfección el izamiento de la bandera con la duración extendida del himno.

## [1.11.0] - 2026-05-22
### Added
- **Feature 12 (Marcador Unificado en Canvas)**: Rediseño completo del HUD para dibujarse directamente dentro del Canvas con estética premium de 8 bits, ocultando la barra superior HTML. Muestra corazones pixelados, contadores dinámicos de salmón/kuchen con sus sprites originales, puntaje con ceros a la izquierda y un multiplicador rosa brillante que oscila y pulsa con una micro-animación `Math.sin(Date.now() / 120)` cuando es superior a `x1.0`.
- **Feature 13 (Asta de Bandera Meta-Física e Himno 8-bit en Etapa 10)**: Implementación de una meta física espectacular para la Etapa 10. Al llegar a la meta, el escenario transiciona suavemente a una pradera verde limpia. El perrito colisiona físicamente en el suelo con un asta de bandera, deteniendo el scroll y detonando una síntesis procedural en tiempo real del Himno Nacional de Chile en 8 bits (onda cuadrada brillante de trompeta y sub-onda triangular armónica). La bandera chilena se iza sincronizadamente y, al terminar, se desliza la cabaña para el abrazo final de Eloísa.
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
- Runner infinito de 10 etapas con climas dinámicos de Puerto Varas y cinemática de reencuentro con Eloísa.
- Soporte táctil móvil avanzado con joystick virtual analógico y botón de salto dedicado.
- Síntesis de sonido retro de 8 bits a través de Web Audio API para música adaptativa y SFX.
- Sprites pixel-art personalizables para el Terrier Chileno, vacas, hoyos, volcanes y lagos.
- Soporte para pantalla completa y overlay de detección de orientación en dispositivos móviles.
