# Tareas de Ejecución - Refinamientos de Expansión (v1.19.1)

- [x] **1. Rediseñar el Sprite de Coche a Vista de Perfil Lateral**
  - [x] Dibujar la matriz de 32x24 `car` en `sprites.js` mirando hacia la izquierda.
  - [x] Usar color amarillo `Y` para luces frontales izquierdas y rojo `R` para las traseras derechas.

- [x] **2. Extender Duración de la Etapa de la Playa**
  - [x] Modificar el incremento de `distanceTraveled` en `game.js` para que avance 1.8 veces más lento cuando `isTuristasStage` está activo.

- [x] **3. Incrementar la Frecuencia de Obstáculos en Playa y Colegio**
  - [x] Reducir el intervalo mínimo de spawn y el factor de dificultad en `updateSpawns()` durante `isColegioStage` e `isTuristasStage`.
  - [x] Incrementar la probabilidad de obstáculo terrestre y la proporción de autos/quitasoles en sus respectivas etapas.

- [x] **4. Activar Bocina/Claxon al Saltar el Coche**
  - [x] Añadir detección en `update()` al superar un obstáculo de tipo `car` para llamar a `window.audioEngine.playCarSpawnSound()`.

- [x] **5. Compilar y Validar**
  - [x] Correr `npm run build` en local para verificar que todo compile sin errores.
  - [x] Realizar commit y push para desplegar automáticamente a Vercel.

