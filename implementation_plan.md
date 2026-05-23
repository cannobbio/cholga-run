# Plan de Implementación - Refinamientos de la Expansión (v1.19.1)

Este documento detalla el plan de implementación para refinar y perfeccionar la expansión **v1.19.0** en respuesta directa al feedback del usuario:

1. **Extender Duración de Playa**: Las playas tendrán una duración extendida reduciendo a la mitad el incremento del recorrido (`distanceTraveled`).
2. **Incrementar Obstáculos en Playa y Colegio**: Modificar el loop de spawn en `game.js` para aumentar significativamente la frecuencia de obstáculos terrestres (quitasoles y autos) durante sus respectivas etapas especiales.
3. **Sprite de Auto en Perfil Lateral**: Rediseñar el sprite `car` en `sprites.js` para representar un coche en vista lateral mirando hacia la izquierda (dirección de avance contra el perro).
4. **Efecto de Claxon al Saltar Auto**: Play `playCarSpawnSound` (bocina 8-bit) al saltar con éxito sobre un automóvil.
5. **Análisis de Vercel Toolbar**: Explicar técnicamente al usuario por qué ve la barra de herramientas sin el paquete y cuándo es realmente necesario agregarlo.

---

## Proposed Changes

### 1. Sprites e Identidad Visual

#### [MODIFY] [sprites.js](file:///Users/marcelo/Repositorios/antigravity/cholga-run/sprites.js)
* **`OBSTACLE_SPRITES`**:
  * Agregar `car`: Sprite pixel-art de 32x24 px representando un automóvil de apoderado (colores azul/rojo con brillo y ruedas).
  * Agregar `quitasol`: Sprite pixel-art de 16x16 px representando una sombrilla de playa a rayas de colores vivos.
* **`BACKGROUND_SPRITES`**:
  * Diseñar las funciones para renderizar el **Colegio Alemán** (un bloque grande de 80x45px con paneles amarillos, rojos, negros y azules, y una gran bandera alemana ondeando arriba).
  * Diseñar la decoración de la playa (capa de arena volcánica y siluetas pixel-art de toallas y gente).

---

### 2. Mecánicas de Juego y Ciclos de Etapa

#### [MODIFY] [game.js](file:///Users/marcelo/Repositorios/antigravity/cholga-run/game.js)
* **Banderas Alemanas Procedimentales**:
  * Crear la función `drawGermanFlag(x, y)` paralela a `drawChileanFlag`.
  * Integrar en `drawForestForeground()` una fórmula determinista estable: `const isGerman = ((blockId * 3 + i) % 10 === 0)`.
  * Si la fórmula se cumple, dibujar una bandera alemana en lugar de la chilena. Esto garantiza un ratio exacto y fluido de 1:10 banderas sin usar estado mutable.
* **Ciclo de 20 Etapas y Reencuentro**:
  * Modificar todas las lógicas que forzaban la bandera final en la etapa 10 a que ahora ocurran en múltiplos de 20 (`currentStage % 20 === 0`).
  * Ajustar el cálculo de la cinemática de abrazo y el texto final de Elo/Padres para que transicione armónicamente al finalizar la etapa 20.
* **Integración de las 5 Etapas Especiales**:
  * Rediseñar la distribución del ciclo de 20 etapas en `applyStageEnvironment()`:
    * `stage % 20 === 3`: Alerta de Erupción Volcánica (`isEruptionStage`).
    * `stage % 20 === 6`: Salida de Colegios (`isColegioStage`).
    * `stage % 20 === 10`: Tornado / Vacas voladoras (`isTornadoStage`).
    * `stage % 20 === 13`: Turistas en la Playa (`isTuristasStage`).
    * `stage % 20 === 17`: ¡Alerta de Gato! (`isGatoStage`).
    * `stage % 20 === 0`: Asta de Bandera final y Cabaña (`isFlagScene`).
* **Obstáculos Específicos de Etapa**:
  * Modificar la clase `Obstacle` y el loop de spawns en `update()` para soportar:
    * `car`: Generar bocina sintética instantánea en `audio.js` al spawnearse y requerir salto similar a la vaca.
    * `quitasol`: Obstáculo estático terrestre similar a la cerca.
* **Escenario de Playa para Turistas**:
  * Si `isTuristasStage` está activo, desactivar el césped verde y dibujar en su lugar arena de playa clara con detalles veraniegos.

---

### 3. Motores de Síntesis de Sonido y Música Procedural 8-Bit

#### [MODIFY] [audio.js](file:///Users/marcelo/Repositorios/antigravity/cholga-run/audio.js)
* **Música de "Salida de Colegios" (Colegios)**:
  * Generar un sintetizador de timbres/campanas metálicas 8-bit (mezclando ondas sinusoidales de frecuencias inarmónicas de modulación en anillo rápida).
  * Crear un motor de bocinas y motor procedural (usando osciladores con onda de sierra distorsionada y envolventes rápidas de volumen para imitar el claxon `"¡PIIIIP!"` retro).
* **Música de "Turistas" (Cumbia)**:
  * Sintetizar proceduralmente una base rítmica de cumbia en 8-bits:
    * Bajo constante y sabroso en onda triangular.
    * Güiro/Hi-hat sintético usando generador de ruido blanco periódico.
    * Melodía alegre y tropical en onda cuadrada.
* **Controlador de Audio**:
  * Actualizar `playStageMusic()` para seleccionar estas nuevas pistas según las nuevas etapas `isColegioStage` e `isTuristasStage`.

---

### 4. Versión y Documentación

#### [MODIFY] [package.json](file:///Users/marcelo/Repositorios/antigravity/cholga-run/package.json)
* Incrementar la versión del proyecto a `"1.19.0"`.

#### [MODIFY] [CHANGELOG.md](file:///file:///Users/marcelo/Repositorios/antigravity/cholga-run/CHANGELOG.md)
* Documentar a fondo todas las adiciones estructurales de la versión 1.19.0.

---

## Verification Plan

### Automated & Manual Verification
* **Compilación**: Ejecutar `npm run build` para asegurar un empaquetado 100% libre de advertencias con Vite.
* **Prueba de Depuración del Entorno**:
  * Modificar provisionalmente la etapa inicial en el código para iniciar directamente en la Etapa 6 ("Salida de Colegios") y Etapa 13 ("Turistas") para comprobar:
    1. Renderizado perfecto de los colegios, banderas ondeantes grandes y playa soleada.
    2. Spawn consistente de automóviles con su bocina retro característica al aparecer.
    3. Reproducción impecable del timbre de colegio 8-bit y la cumbia playera procedimental.
* **Auto-Despliegue Vercel**: Realizar commits ordenados a GitHub `main` para detonar la compilación automática en la nube.
