/**
 * CHOLGA - 8-Bit Pixel Sprites & Drawing Engine
 * Contiene los sprites de 8-bits renderizados dinámicamente en Canvas.
 */

// Paleta de colores para mapear caracteres a colores CSS
const COLOR_MAP = {
  '.': 'transparent', // Transparente
  'W': '#ffffff',     // Blanco (Pelaje del terrier, manchas de vaca, crema de kuchen)
  'K': '#1a1a1a',     // Negro (Cabeza del terrier, manchas de vaca, ojos)
  'T': '#cf893c',     // Café/Tan (Mejillas y cejas del Terrier Chileno, cabello)
  'R': '#d61c4e',     // Rojo (Collar, relleno del kuchen de frambuesa, rosa)
  'P': '#ffb3c6',     // Rosado (Interior de oreja del terrier, hocico de vaca, piel)
  'Y': '#ffe066',     // Amarillo/Beige (Cuernos de vaca, masa del kuchen, pico/patas de ave)
  'G': '#4a4f5c',     // Gris Volcánico (Piedras, cuerpo de queltehue)
  'S': '#a5ffd6',     // Plateado / Verde agua (Lomos del salmón)
  'B': '#ff7096',     // Salmón rosado (Panza del salmón brillante)
  'U': '#7c5335',     // Café oscuro (Madera de cerca, paredes de cabaña)
  'L': '#ab7b56',     // Café claro (Vetaduras de madera, detalles)
  'A': '#8ecae6',     // Azul agua (Detalles del salmón, jeans de Elo)
  'H': '#e2e8f0',     // Blanco grisáceo (Nieve del volcán, reflejos de piedra)
  'V': '#143825',     // Verde pino oscuro (Hojas de árbol)
  'O': '#2e7d32',     // Verde bosque brillante (Puntos de árbol)
  'E': '#38b000',     // Verde tallo (Rosa)
  'X': '#800f2f',      // Rojo oscuro sombra (Rosa)
  'N': '#f97316',     // Naranja vibrante (Amanecer, lava, sol)
  'M': '#1e1b4b',     // Índigo oscuro (Noche)
  'F': '#60a5fa',     // Azul suave (Gota de lluvia)
  'Z': '#f59e0b'      // Ámbar/Rayo (Tormenta, fuego)
};

// --- SPRITES DEL TERRIER CHILENO MEJORADO (24x24 px) ---
// Ajustes: Cabeza más baja (acortando cuello en 2px), gran mancha negra en lomo y cola muy corta.
const TERRIER_SPRITES = {
  // Parado / Idle
  idle: [
    "........................",
    "........................",
    "....K...................",
    "...KK.K.................",
    "..KPK.K.................",
    "..KKKKK.................",
    ".KKKTKKT................",
    "KKKKKKKK................",
    "KKKKWWKK................",
    ".KKKKKKK...........KK...", // Cola muy corta de 3px
    "..KKKKR...........KK....", // R = Collar
    "...KWWK..........KK.....",
    "..KWWWWKKKKKKKKKKKWWK...", // Mancha negra grande en lomo (K)
    ".KWWWWKKKKKKKKKKWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    ".KWWWWWWWWWWWWWWWWWWK...",
    "..KWWWWWWWWWWWWWWWWK....",
    "...KWWWWWWWWWWWWWWK.....",
    "....KWWWKKKWWWWKKK......",
    "....KWK.KK..KWK.KK......",
    "....KWK.KK..KWK.KK......",
    "....KWK.KK..KWK.KK......",
    "...KKK.KKK.KKK.KKK......"
  ],

  // Corriendo - Cuadro 1
  run1: [
    "........................",
    "........................",
    "....K...................",
    "...KK.K.................",
    "..KPK.K.................",
    "..KKKKK.................",
    ".KKKTKKT................",
    "KKKKKKKK................",
    "KKKKWWKK................",
    ".KKKKKKK............K...", // Cola muy corta
    "..KKKKR............KK...",
    "...KWWK...........KK....",
    "..KWWWWKKKKKKKKKKKWWK...", // Gran mancha lomo
    ".KWWWWKKKKKKKKKKWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    ".KWWWWWWWWWWWWWWWWWWK...",
    "..KWWWWWWWWWWWWWWWWK....",
    "...KWWWWWWWWWWWWWWK.....",
    "....KWWKKK.KWWWKKK......",
    "....KWK.KK.KWK..KK......",
    "....KWK....KWK..........",
    "...KWK......KWK.........",
    "..KKK........KKK........"
  ],

  // Corriendo - Cuadro 2
  run2: [
    "........................",
    "........................",
    "....K...................",
    "...KK.K.................",
    "..KPK.K.................",
    "..KKKKK.................",
    ".KKKTKKT................",
    "KKKKKKKK................",
    "KKKKWWKK................",
    ".KKKKKKK...........KK...", // Cola muy corta
    "..KKKKR...........KK....",
    "...KWWK..........KK.....",
    "..KWWWWKKKKKKKKKKKWWK...", // Gran mancha lomo
    ".KWWWWKKKKKKKKKKWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    ".KWWWWWWWWWWWWWWWWWWK...",
    "..KWWWWWWWWWWWWWWWWK....",
    "...KWWWWWWWWWWWWWWK.....",
    "....KWWWKK.KKWWKKK......",
    ".....KWK.KK.KWK.KK......",
    ".....KWK.....KWK........",
    ".....KWK......KWK.......",
    "....KKK........KKK......"
  ],

  // Saltando
  jump: [
    "........................",
    "........................",
    "....K...................",
    "...KK.K.................",
    "..KPK.K.................",
    "..KKKKK.................",
    ".KKKTKKT................",
    "KKKKKKKK................",
    "KKKKWWKK................",
    ".KKKKKKK...........KK...", // Cola muy corta
    "..KKKKR...........KK....",
    "...KWWK..........KK.....",
    "..KWWWWKKKKKKKKKKKWWK...", // Gran mancha lomo
    ".KWWWWKKKKKKKKKKWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    ".KWWWWWWWWWWWWWWWWWWK...",
    "..KWWWWWWWWWWWWWWWWK....",
    "...KWWWWWWWWWWWWWWK.....",
    "....KWWKK...KWWKKK......",
    "....KWK......KWK........",
    "....KWK......KWK........",
    "....KWK......KWK........",
    "....KKK......KKK........"
  ],

  // Agachado / Ladrando (Deslizándose)
  duck: [
    "........................",
    "........................",
    "........................",
    "........................",
    "........................",
    "......K.K...............",
    ".....KKKK...............",
    "....KKKTK...............",
    "...KKKKKKR..............",
    "..KKKKWWKKWWKKKK........",
    ".KKKKKKKWWWWWWWWKK......",
    "KWWKKKKKKKKKKKKWWWKKKK..", // Mancha negra ensanchada en deslizamiento
    "KWWKKKKKKKKKKKKWWWWWWK.",
    "KWWWWWWWWWWWWWWWWWWWWWWK",
    ".KWWWWWWWWWWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWWWWWWWWK..",
    "...KWWWKKKWWWKKKWWWKK...",
    "....KWK.KK.KWK.KK.KWK...",
    "....KK..KK.KK..KK.KK....",
    "........................",
    "........................",
    "........................",
    "........................",
    "........................"
  ],

  // Chocado / Game Over
  crash: [
    "........................",
    "........................",
    "....K...................",
    "...K.KK.................",
    "..K.PKK.................",
    "..KKKKK.................",
    ".KKKTKKT................",
    "KKKKKKKK................",
    "KKK.K.KK................", // Ojos dislocados
    ".KKK.KKK...........KK...", // Cola caída muy corta
    "..KKKKR...........KK....",
    "...KWWK..........KK.....",
    "..KWWWWKKKKKKKKKKKWWK...",
    ".KWWWWKKKKKKKKKKWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    "KWWWWWWWWWWWWWWWWWWWK...",
    ".KWWWWWWWWWWWWWWWWWWK...",
    "..KWWWWWWWWWWWWWWWWK....",
    "...KWWWWWWWWWWWWWWK.....",
    "....KWKKKK...KWKKKK.....",
    "....K..KK....K..KK......",
    "....K.KK.....K.KK.......",
    "....KKK......KKK........",
    "........................"
  ],

  // Fantasmita / Death Ghost
  ghost: [
    "........................",
    "........................",
    "....W...................",
    "...WW.W.................",
    "..W.W.W.................",
    "..WWWWW.................",
    ".WWWWWWW................",
    "WWWWWWWW................",
    "WWWWWWWW................",
    ".WWWWWWW................",
    "..WWWWWW................",
    "...WWWW.................",
    "..WWWWWWWWWWWWWWWW......",
    ".WWWWWWWWWWWWWWWWWW.....",
    "WWWWWWWWWWWWWWWWWWWW....",
    "WWWWWWWWWWWWWWWWWWWW....",
    ".WWWWWWWWWWWWWWWWWW.....",
    "..WWWWWWWWWWWWWWWW......",
    "...WWWWWWWWWWWWWW.......",
    "....WWWWWWWWWWWW........",
    "......WWWWWWWW..........",
    ".......WWWWWW...........",
    "........WWWW............",
    ".........WW............."
  ]
};

// --- SPRITES DE OBSTÁCULOS ---
const OBSTACLE_SPRITES = {
  // Vaca Overo Negro (Típica vaca del sur de Chile, 32x24 px)
  cow: [
    "................................",
    ".........HH..........HH.........", // H = Cuernos
    ".........KK..........KK.........",
    "........KKPKKKKKKKKKKPK.........", // P = Orejas
    "........KKKKKKKKKKKKKKK.........",
    "........KKKKKKKKKKKKKKK.........",
    "........KKKPPKKKKKKPPKK.........", // P = Ojos / Hocico
    "........KKPPPPKKKKPPPPK.........",
    "........KKKPPKKKKKKPPKK.........",
    "........KKKKKKKKKKKKKKK.........",
    ".........KKKKKKKKKKKKK..........",
    ".........KRRRRRRRRRRRK..........", // Collar/Cencerro dorado (R/Y)
    ".........KWWWWWWWWWWWK..........",
    "........KWWWWWWWWWWWWWK.........",
    ".......KWWKKWWWWWKKWWWWK........", // Manchas negras (K) en cuerpo blanco (W)
    "......KWWKKKKWWWWKKKKWWWWKK.....",
    ".....KWWWWKKKWWWWWKKKWWWWK.K....",
    ".....KWWWWWWWWWWWWWWWWWWWK..K...",
    ".....KWWWWWWWWPPPPWWWWWWWK..K...", // P = Ubre rosada visible
    ".....KWWWWWWWPPPPWWWWWWWWK.KK...",
    "......KWWKKKWWWWWWKKKWWK.KKK....",
    "......KWK..KWK...KWK..KWK.......", // Patas
    "......KWK..KWK...KWK..KWK.......",
    ".....KKK..KKK...KKK..KKK........"  // Pezuñas
  ],

  // Cerca de Madera de Puerto Varas (16x16 px)
  fence: [
    "................",
    "....U......U....",
    "....U......U....",
    "...UUU....UUU...",
    "..ULLLU..ULLLU..",
    "..UL.LU..UL.LU..",
    ".UUUUUUUUUUUUUU.",
    ".ULLLLLLLLLLLLU.",
    ".ULLLLLLLLLLLLU.",
    ".UUUUUUUUUUUUUU.",
    "..UL.LU..UL.LU..",
    "..ULLLU..ULLLU...",
    "...UUU....UUU...",
    "....U......U....",
    "....U......U....",
    "....U......U...."
  ],

  // Piedra Volcánica de Alto Contraste (16x16 px)
  // Se le da un borde negro grueso y reflejos blancos para mejor contraste en todos los climas
  stone: [
    "......KKKK......",
    "....KKHHHHKK....", // H = Brillo blanco/gris
    "...KHHGGGGHHK...",
    "..KHGGGGGGGGHK..",
    ".KHGGGGGGGGGGHK.",
    "KHGGKKGGGGKKGGHK", // Grietas negras volcánicas (K)
    "KGGKKKKGGKKKKGGK",
    "KGGGGGGGGGGGGGGK",
    "KGGGGGGGGGGGGGGK",
    "KGGGGGGGGGGGGGGK",
    "KGGGGGGGGGGGGGGK",
    "KGGGGGGGGGGGGGGK",
    "KGGGGGGGGGGGGGGK",
    " KGGGGGGGGGGGGK ",
    "  KKKKKKKKKKKK  ",
    "................"
  ],

  // Automóvil de apoderado en Puerto Varas (32x24 px)
  car: [
    "................................",
    "................................",
    "................................",
    "..........KKKKKKKKKK............",
    "........KKAAAAAAAAAAKK..........",
    ".......KAAAHHHAAAHHHAAK.........",
    "......KAAAHHHHAAAHHHHAAK........",
    ".....KAAAHHHHHAAAHHHHHAAAK......",
    "....KKKKKKKKKKKKKKKKKKKKKK......",
    "....KRRRRRRRRRRRRRRRRRRRRK......",
    "...KRRRRRRRRRRRRRRRRRRRRRRK.....",
    "..KRRRRRRRRRRRRRRRRRRRRRRRRK....",
    "..KRRRRRRRRRRRRRRRRRRRRRRRRK....",
    "..KWWKRRRRRRRRRRRRRRRRRRKWWK....",
    "...KKRRRRRRRRRRRRRRRRRRRRKK.....",
    ".....KKKKKKKKKKKKKKKKKKKK.......",
    ".......KKK.........KKK..........",
    "......KGGGK.......KGGGK.........",
    "......KGGGK.......KGGGK.........",
    ".......KKK.........KKK..........",
    "................................",
    "................................",
    "................................",
    "................................"
  ],

  // Quitasol / Sombrilla de playa veraniega (16x16 px)
  quitasol: [
    "......RRRR......",
    "....RRWWYWRR....",
    "...RWWWWYYYWR...",
    "..RWWWRRRYYYYWR.",
    ".RWWWRRRRRRYYYYW",
    "RWWWRRRRRRRRYYYY",
    "KKKKKKKKKKKKKKKK",
    ".......HH.......",
    ".......HH.......",
    ".......HH.......",
    ".......HH.......",
    ".......HH.......",
    ".......HH.......",
    ".......HH.......",
    ".......HH.......",
    ".......HH......."
  ],

  // Coihue / Alerce Sureño (Obstáculo terrestre alto, 16x24 px)
  tree: [
    "......VV........",
    ".....VOVV.......",
    "....VVOVVV......",
    "....VVVVVV......",
    "....VVOVVV......",
    "....VVVVVV......",
    "...VVOVVOVV.....",
    "..VVVVVVVVVV....",
    "..VVOVVOVVOV....",
    "..VVVVVVVVVV....",
    ".VVOVVOVVOVVO...",
    "VVVVVVVVVVVVVV..",
    "VVOVVOVVOVVOVV..",
    "VVVVVVVVVVVVVV..",
    "VVVVVVVVVVVVVV..",
    ".VVOVVOVVOVVO...",
    "..VVVVVVVVVV....",
    "...VVOVVOVV.....",
    "....VVVVVV......",
    ".....TTTT.......",
    ".....TTTT.......",
    ".....TTTT.......",
    ".....TTTT.......",
    "....TTTTTT......"
  ],

  // --- SPRITES DEL QUELTEHUE (16x16 px) ---
  // Cuadro 1: Alas arriba
  queltehue1: [
    "......KK........",
    ".....KWWK.......",
    "....KWWWWK.Y....", // Pico amarillo
    "....KKKKKKYY....",
    "..KKGGGGGGK.....", // Cuerpo gris
    ".KGGGGGGGGK.....",
    "KGGKKKKKGGK.....", // Ala arriba
    "KGKKKKKKKGK.....",
    "KKKK...KKKK.....",
    "........KK......",
    ".......Y..Y.....", // Patas
    "......Y....Y....",
    "................",
    "................",
    "................",
    "................"
  ],

  // Cuadro 2: Alas abajo
  queltehue2: [
    "......KK........",
    ".....KWWK.......",
    "....KWWWWK.Y....",
    "....KKKKKKYY....",
    "..KKGGGGGGK.....",
    ".KGGGGGGGGK.....",
    "KGGGGGGGGGK.....",
    "KGKKKKKKKGK.....",
    "KKKKKKKKKKK.....", // Ala abajo
    "....KKKKK.......",
    ".......Y..Y.....",
    "......Y....Y....",
    "................",
    "................",
    "................",
    "................"
  ],

  // Hoyo Volcánico en el Suelo (32x16 px)
  hole: [
    "................................",
    "................................",
    "................................",
    "......KKKKKKKKKKKKKKKKKKKK......",
    "....KKGGGGGGGGGGGGGGGGGGGGKK....",
    "...KGGGGGGGGGGGGGGGGGGGGGGGGK...",
    "..KGGKKKKKKKKKKKKKKKKKKKKKKGKK..",
    ".KGKKKKKKKKKKKKKKKKKKKKKKKKKKGK.",
    ".GKKKKKKKKKKKKKKKKKKKKKKKKKKKKG.",
    "GKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKG",
    "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    "................................"
  ],

  // Roca Volcánica Incandescente (16x16 px)
  volcanicRock: [
    "......KKKK......",
    "....KKRRRRKK....",
    "...KRRRYYYYRRK..",
    "..KRRRYYYYYYRRK.",
    ".KRRRYYYYYYYYRRK",
    ".KRRRYYKKYYYYRRK",
    "KRRRYYKKKKYYYRRK",
    "KRRRYYYYYYYYYRRK",
    "KRRRYYYYYYYYYRRK",
    "KRRRYYYYYYYYYRRK",
    ".KRRRYYYYYYRRK..",
    ".KRRRRYYYYRRK...",
    "..KRRRRRRRRK....",
    "...KKRRRRKK.....",
    ".....KKKK.......",
    "................"
  ]
};

// --- SPRITES DE COLECCIONABLES Y CINEMÁTICAS ---
const COLLECTIBLE_SPRITES = {
  // Salmón Plateado Saltón (16x16 px)
  salmon: [
    "......SS........",
    "....SSBSSS......", // S = Plateado, B = Panza Rosada
    "...SSBBSSSS.....",
    "..SSBBBSSSSA....", // A = Azul agua
    ".SSBBBBSSSAAK...", // K = Ojo negro
    "SSBBBBBSSSSSAA..",
    "SBBBBBBSSSSSS...",
    "SBBBBBBSSSSS....",
    "SBBBBBBSSSS.....",
    "SBBBBBBSSS......",
    ".SBBBBBSS.......",
    "..SBBBBSS.......",
    "...SBBBSS.......",
    "....SBBSSS......",
    ".....SSSSS......",
    "......SSS......."
  ],

  // Kuchen de Frambuesa Sureño (16x16 px)
  kuchen: [
    "......WW........", // W = Crema chantilly arriba
    ".....WWW........",
    "....WWWWW.......",
    "......R.........", // R = Frambuesa
    "....YYYYY.......", // Y = Masa de kuchen
    "...YRRRRRY......",
    "..YRRRRRRRY.....",
    ".YRRRRRRRRRY....",
    "YYYYYYYYYYYYY...",
    "YYYYYYYYYYYYY...",
    "YCCYCCYCCYCCY...",
    "YCCYCCYCCYCCY...",
    "YYYYYYYYYYYYY...",
    ".YYYYYYYYYYY....",
    "..YYYYYYYYY.....",
    "...YYYYYYY......"
  ],

  // Rosa Roja de Puerto Varas (Doble Salto y Escudo, 16x16 px)
  rose: [
    "......RR........",
    "....RRRRRR......",
    "...RRRRXXRR.....", // X = Rojo oscuro sombra
    "..RRRXXXXRRR....",
    "..RRXXXXXXRR....",
    "...RRXXXXRR.....",
    "....RRRRRR......",
    "......RR........",
    "......EE........", // E = Verde brillante (hojas y tallo)
    "....EEEEE.......",
    "...EEEEEE.......",
    ".....EEE........",
    ".....EE.........",
    ".....EE.........",
    ".....EE.........",
    "....EEE........."
  ],

  // Hueso Blanco de Perro (Vida Extra, 16x16 px)
  bone: [
    "................",
    "..WW.WW.........",
    ".WWWWWWW........",
    "..WW.WWWW.......",
    ".....WWWW.......",
    "......WWWW......",
    ".......WWWW.....",
    "........WWWW....",
    "........WWWW.WW.",
    ".........WWWWWWW",
    ".........WW.WW..",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],

  // Gato Naranjo Corriendo - Fotograma 1 (16x16 px)
  cat_run1: [
    "................",
    "..........T...T.",
    ".........TTT.TT.",
    "....T....TTPTPT.",
    "....TT...TTTTTT.",
    "....TTT..TKTKTT.",
    ".....TT..TTPPTT.",
    ".....TTTTTTTTT..",
    "......TTTTTTTT..",
    ".....TTWWWWWWT..",
    "....TTTWWWWWWT..",
    "....T.T.WW.T.T..",
    "....T.T....T.T..",
    "....W.W....W.W..",
    "................",
    "................"
  ],

  // Gato Naranjo Corriendo - Fotograma 2 (16x16 px)
  cat_run2: [
    "................",
    "..........T...T.",
    ".........TTT.TT.",
    ".........TTPTPT.",
    "...T.....TTTTTT.",
    "...TT....TKTKTT.",
    "....TT...TTPPTT.",
    "....TTTTTTTTTT..",
    ".....TTTTTTTT...",
    "......TWWWWWWT..",
    ".....TTWWWWWWT..",
    ".....T..WW..T...",
    "....TT..TT..TT..",
    "....WW..WW..WW..",
    "................",
    "................"
  ],

  // Gato Naranjo Saltando (16x16 px)
  cat_jump: [
    "..........T...T.",
    ".........TTT.TT.",
    ".........TTPTPT.",
    ".........TTTTTT.",
    ".........TKTKTT.",
    ".........TTPPTT.",
    "....T....TTTTT..",
    "....TT..TTTTTT..",
    ".....TTTTTTTT...",
    "......TWWWWWWT..",
    ".....TTWWWWWWT..",
    "....TT..WW..TT..",
    "....T....T...T..",
    "....W....W...W..",
    "................",
    "................"
  ],

  // Proyectil de Caca Swirl Shaded (16x16 px)
  poop: [
    "......UU........",
    ".....ULLU.......",
    "....ULULLU......",
    "....ULLLLU......",
    ".....UUUU.......",
    "....ULLLLU......",
    "...ULULLLLU.....",
    "..ULLLLLLLLU....",
    "...UUUUUUUU.....",
    "..ULLLLLLLLU....",
    ".ULULLLLLLLLU...",
    "ULLLLLLLLLLLLU..",
    "UUUUUUUUUUUUUU..",
    "................",
    "................",
    "................"
  ]
};

// --- SPRITES DE CINEMÁTICAS (Elo y Cabaña Sureña) ---
const CINEMATIC_SPRITES = {
  // Elo parada (16x24 px)
  eloisa: [
    ".....TTTTTT.....", // T = Cabello castaño
    "....TTTTTTTT....",
    "....TTPPPPTT....", // P = Piel
    "....TPPKKPPT....", // K = Ojos
    "....TPPPPPPT....",
    "....TPPPPPPT....",
    ".....TPPPPT.....",
    "......T TT......",
    "....RRRRRRRR....", // R = Camisa roja
    "...RRRRRRRRRR...",
    "..RRRRRRRRRRRR..",
    "..RRRRRRRRRRRR..",
    "...RRRRRRRRRR...",
    "....AAAAAAAA....", // A = Jeans azules
    "....AAAAAAAA....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....KK    KK....", // K = Zapatos
    "....KK    KK...."
  ],

  // Elo abrazando al Terrier (16x24 px)
  eloisa_hug: [
    ".....TTTTTT.....",
    "....TTTTTTTT....",
    "....TTPPPPTT....",
    "....TPPKKPPT....",
    "....TPPPPPPT....",
    "....TPPPPPPT.....",
    ".....TPPPPT......",
    "....RRRRRRRR....",
    "...RRRRRRRRRR...",
    "..RRRKKRRRKKRR..", // Brazos
    "..RRKKWKKKKWKR..", // Sosteniendo al Terrier tricolor (K/W)
    "..RRKKWWKKWWKR..",
    "...RKKWKKKKWKR..",
    "....AAAAAAAA....",
    "....AAAAAAAA....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....KK    KK....",
    "....KK    KK...."
  ],

  // LA MAMÁ (Mujer de pelo castaño oscuro y blusa rosada)
  mama: [
    ".....UUUUUU.....", // U = Cabello castaño oscuro
    "....UUUUUUUU....",
    "....UUPPPPUU....", // P = Piel
    "....UPPKKPPU....", // K = Ojos
    "....UPPPPPPU....",
    "....UPPPPPPU....",
    ".....UPPPPU.....",
    "......U UU......",
    "....BBBBBBBB....", // B = Blusa rosada
    "...BBBBBBBBBB...",
    "..BBBBBBBBBBBB..",
    "..BBBBBBBBBBBB..",
    "...BBBBBBBBBB...",
    "....AAAAAAAA....", // Jeans azules
    "....AAAAAAAA....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....KK    KK....", // Zapatos
    "....KK    KK...."
  ],

  // LA MAMÁ abrazando al Terrier
  mama_hug: [
    ".....UUUUUU.....",
    "....UUUUUUUU....",
    "....UUPPPPUU....",
    "....UPPKKPPU....",
    "....UPPPPPPU....",
    "....UPPPPPPU.....",
    ".....UPPPPU......",
    "....BBBBBBBB....",
    "...BBBBBBBBBB...",
    "..BBBKKBBBKKBB..", // Brazos
    "..BBKKWKKKKWKB..", // Sosteniendo al Terrier
    "..BBKKWWKKWWKB..",
    "...BKKWKKKKWKB..",
    "....AAAAAAAA....",
    "....AAAAAAAA....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....A      A....",
    "....KK    KK....",
    "....KK    KK...."
  ],

  // EL PAPÁ (Hombre de pelo corto rubio y bigote/barba, camisa verde y pantalones grises)
  papa: [
    ".....YYYYYY.....", // Y = Cabello rubio corto
    "....YYYYYYYY....",
    "....YYPPPPYY....",
    "....YPPKKPPY....",
    "....PPPPPPPP....", // Sin cabello largo a los lados
    "....PPPKKPPP....", // K = Bigote
    ".....PKKKKP.....", // K = Barba
    "......PPPP......", // Cuello
    "....VVVVVVVV....", // V = Camisa verde
    "...VVVVVVVVVV...",
    "..VVVVVVVVVVVV..",
    "..VVVVVVVVVVVV..",
    "...VVVVVVVVVV...",
    "....GGGGGGGG....", // G = Pantalón gris
    "....GGGGGGGG....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....KK    KK....", // Zapatos
    "....KK    KK...."
  ],

  // EL PAPÁ abrazando al Terrier
  papa_hug: [
    ".....YYYYYY.....",
    "....YYYYYYYY....",
    "....YYPPPPYY....",
    "....YPPKKPPY....",
    "....PPPPPPPP....",
    "....PPPKKPPP....",
    ".....PKKKKP.....",
    "......PPPP......",
    "....VVVVVVVV....",
    "...VVVVVVVVVV...",
    "..VVVKKVVVKKVV..", // Brazos
    "..VVKKWKKKKWKV..", // Sosteniendo al Terrier
    "..VVKKWWKKWWKV..",
    "...VKKWKKKKWKV..",
    "....GGGGGGGG....",
    "....GGGGGGGG....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....G      G....",
    "....KK    KK....",
    "....KK    KK...."
  ],

  // Cabaña Sureña de Madera (32x32 px)
  cozy_house: [
    "................................",
    ".............RRRRRR.............", // Chimenea
    "............RLLLLLLR............", // L = Madera
    "...........RLLLLLLLLR...........",
    "..........RLLLLLLLLLLR..........",
    ".........RLLLLLLLLLLLLR.........",
    "........RLLLLLLLLLLLLLLR........",
    ".......RLLLLLLLLLLLLLLLLR.......",
    "......RLLLLLLLLLLLLLLLLLLR......",
    ".....RLLLLLLLLLLLLLLLLLLLLR.....",
    "....RRRRRRRRRRRRRRRRRRRRRRRR....", // Techo rojo
    "....UUUUUUUUUUUUUUUUUUUUUUUU....", // U = Café oscuro pared
    "....ULLLLLLULLLLLLLLULLLLLLU....", // L = Paredes de madera sólida
    "....ULLYYLLULLLLLLLLULLYYLLU....", // Y = Ventanas amarillas
    "....ULLYYLLULLLLLLLLULLYYLLU....",
    "....ULLLLLLULLLLLLLLULLLLLLU....",
    "....UUUUUUUULLLLLLLLUUUUUUUU....",
    "....ULLLLLLULLLLLLLLULLLLLLU....",
    "....ULLLLLLULLKKKKLLULLLLLLU....", // Puerta negra
    "....ULLLLLLULLKWWKLLULLLLLLU....",
    "....ULLLLLLULLKWWKLLULLLLLLU....",
    "....ULLLLLLULLKWWKLLULLLLLLU....",
    "....ULLLLLLULLKKKKLLULLLLLLU....",
    "....UUUUUUUUUUUUUUUUUUUUUUUU....",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................"
  ]
};

const HUD_SPRITES = {
  // Clima Despejado / Sol (`sun`)
  sun: [
    "......NN........",
    "....N.YY.N......",
    ".....YYYY.......",
    "..N.YYYYYY.N....",
    "...YYYYYYYY.....",
    "N.YYYYYYYYYY.N..",
    "YYYYYYYYYYYYYY..",
    "YYYYYYYYYYYYYY..",
    "N.YYYYYYYYYY.N..",
    "...YYYYYYYY.....",
    "..N.YYYYYY.N....",
    ".....YYYY.......",
    "....N.YY.N......",
    "......NN........",
    "................",
    "................"
  ],

  // Clima Lluvia (`rain`)
  rain: [
    "................",
    "......HHHH......",
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "..GGGGGGGGGGGG..",
    ".GGGGGGGGGGGGGG.",
    ".GGGGGGGGGGGGGG.",
    "..GGGGGGGGGGGG..",
    "................",
    "....F....F....F.",
    "...F....F....F..",
    "................",
    "......F....F....",
    ".....F....F.....",
    "................",
    "................"
  ],

  // Clima Tormenta (`storm`)
  storm: [
    "................",
    "......GGGG......",
    "....GGGGGGGG....",
    "...GGGGGGGGGG...",
    "..KKKKKKKKKKKK..",
    ".KKKKKKKKKKKKKK.",
    ".KKKKKKKKKKKKKK.",
    "..KKKKKKKKKKKK..",
    "......ZZZZ......",
    ".....ZZZZ.......",
    "....ZZZZZZ......",
    "......ZZZZ......",
    ".....ZZZZ.......",
    "....ZZZZ........",
    "....ZZ..........",
    "................"
  ],

  // Clima Neblina (`fog`)
  fog: [
    "................",
    "................",
    "..HHHHHHHHHH....",
    "....HHHHHHHHHH..",
    "................",
    "....GGGGGGGGGG..",
    "..GGGGGGGGGG....",
    "................",
    "......HHHHHHHH..",
    "..HHHHHHHH......",
    "................",
    "....GGGGGGGG....",
    "......GGGGGGGG..",
    "................",
    "................",
    "................"
  ],

  // Amanecer (`sunrise`)
  sunrise: [
    "................",
    "......NN........",
    "....N.YY.N......",
    ".....YYYY.......",
    "..N.YYYYYY.N....",
    "YYYYYYYYYYYYYY..",
    "AAAAAAAAAAAAAAAA",
    "................",
    ".AAAAAAAAAAAAAA.",
    "................",
    "..AAAAAAAAAAAA..",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],

  // Atardecer (`sunset`)
  sunset: [
    "................",
    "......RR........",
    "....RRNNRR......",
    "...RNNNNNNR.....",
    "..RNNNNNNNNR....",
    "PPPPPPPPPPPPPPPP",
    "................",
    "AAAAAAAAAAAAAAAA",
    "................",
    ".AAAAAAAAAAAAAA.",
    "................",
    "..AAAAAAAAAAAA..",
    "................",
    "................",
    "................",
    "................"
  ],

  // Noche / Luna (`night`)
  night: [
    "................",
    "......W.........",
    ".........YYYY...",
    ".......YYYYYY...",
    "......YYYYY.....",
    ".....YYYY.......",
    "....YYYY........",
    "....YYYY........",
    ".....YYYY.......",
    "......YYYYY.....",
    ".......YYYYYY...",
    ".........YYYY...",
    "....W...........",
    "................",
    ".........W......",
    "................"
  ],

  // Erupción (`eruption`)
  eruption: [
    "....GGGGGGGG....",
    "...GGGGGGGGGG...",
    "....GGGGGGGG....",
    ".....RR..RR.....",
    "....RNNNNR......",
    "....RUUUUR......",
    "...RUUUUUUR.....",
    "...UUUNUUUU.....",
    "..UUUUNRUUUU....",
    "..UUUUR.RUUU....",
    ".UUUUU...UUUU...",
    ".UUUU.....UUU...",
    "UUUU.......UUU..",
    "UU..........UU..",
    "................",
    "................"
  ],

  // Tornado (`tornado`)
  tornado: [
    "................",
    "HHHHHHHHHHHHHHHH",
    ".GGGGGGGGGGGGGG.",
    "..HHHHHHHHHHHH..",
    "...GGGGGGGGGG...",
    "....HHHHHHHH....",
    ".....GGGGGG.....",
    "......HHHH......",
    "......GGG.......",
    ".......HH.......",
    ".......GG.......",
    "......HH........",
    "......G.........",
    ".....H..........",
    "................",
    "................"
  ],

  // Gato (`cat_face`)
  cat_face: [
    "................",
    "..T..........T..",
    "..TT........TT..",
    "..TPT......TPT..",
    "..TTTTTTTTTTTT..",
    ".TTTTTTTTTTTTTT.",
    ".TTKTKTTTTKTKTT.",
    "TTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTT",
    "TTTTTTTPPTTTTTTT",
    ".TTTTTTWWTTTTTT.",
    "..TTTTTWWTTTTT..",
    "...TTTTTTTTTT...",
    ".....TTTTTT.....",
    "................",
    "................"
  ]
};

/**
 * Dibuja un sprite 8-bit programático en el canvas.
 * @param {CanvasRenderingContext2D} ctx - Contexto 2D del Canvas
 * @param {Array<string>} spriteMatrix - Matriz del sprite (filas de caracteres)
 * @param {number} x - Posición X de renderizado (esquina superior izquierda)
 * @param {number} y - Posición Y de renderizado
 * @param {number} width - Ancho final en la pantalla
 * @param {number} height - Alto final en la pantalla
 * @param {boolean} flipX - Indica si se debe reflejar horizontalmente
 */
function drawPixelSprite(ctx, spriteMatrix, x, y, width, height, flipX = false) {
  const numRows = spriteMatrix.length;
  const numCols = spriteMatrix[0].length;
  
  const pixelW = width / numCols;
  const pixelH = height / numRows;

  ctx.save();

  // Si flipX es verdadero, trasladamos y escalamos el contexto negativamente en X
  if (flipX) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, y);
  }

  // Dibujamos bloque por bloque
  for (let r = 0; r < numRows; r++) {
    const rowStr = spriteMatrix[r];
    for (let c = 0; c < numCols; c++) {
      const char = rowStr[c];
      const color = COLOR_MAP[char] || 'transparent';
      
      if (color !== 'transparent') {
        ctx.fillStyle = color;
        ctx.fillRect(
          Math.floor(c * pixelW),
          Math.floor(r * pixelH),
          Math.ceil(pixelW),
          Math.ceil(pixelH)
        );
      }
    }
  }

  ctx.restore();
}

// Exportar a window para compatibilidad global en módulos Vite/ESM
window.COLOR_MAP = COLOR_MAP;
window.TERRIER_SPRITES = TERRIER_SPRITES;
window.OBSTACLE_SPRITES = OBSTACLE_SPRITES;
window.COLLECTIBLE_SPRITES = COLLECTIBLE_SPRITES;
window.CINEMATIC_SPRITES = CINEMATIC_SPRITES;
window.HUD_SPRITES = HUD_SPRITES;
window.drawPixelSprite = drawPixelSprite;
