# Changelog - Cholga Run

Todas las modificaciones notables de este proyecto serán documentadas en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
