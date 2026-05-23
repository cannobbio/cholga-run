import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.STORAGE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.STORAGE_SERVICE_ROLE_KEY;

// Inicializar el cliente sólo si las variables de entorno están presentes
let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

const DEFAULT_LEADERBOARD = [
  { name: "PUSSY-PUSSY", score: 50000, date: 1779505432000 }
];

export default async function handler(req, res) {
  // Agregar cabeceras CORS básicas
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      if (!supabase) {
        // Fallback local/por defecto si no hay conexión a base de datos
        res.status(200).json(DEFAULT_LEADERBOARD);
        return;
      }

      // Obtener el Top 10 ordenado de Supabase (por puntuación desc, y fecha más antigua primero)
      const { data, error } = await supabase
        .from('cholga_leaderboard')
        .select('name, score, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) throw error;

      // Si la tabla está vacía, devolver el récord por defecto
      if (!data || data.length === 0) {
        res.status(200).json(DEFAULT_LEADERBOARD);
        return;
      }

      // Mapear al formato que espera el cliente frontend (date en milisegundos)
      const mapped = data.map(item => ({
        name: item.name,
        score: parseInt(item.score, 10),
        date: new Date(item.created_at).getTime()
      }));

      res.status(200).json(mapped);
      return;
    }

    if (req.method === 'POST') {
      const { name, score } = req.body;

      // Validar datos de entrada
      if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 12) {
        res.status(400).json({ error: 'El nombre debe ser un texto de entre 1 y 12 caracteres.' });
        return;
      }
      
      let cleanScore = score;
      if (cleanScore !== undefined && cleanScore !== null) {
        cleanScore = cleanScore.toString().replace(/[^0-9]/g, '');
      }
      const parsedScore = parseInt(cleanScore, 10);
      if (isNaN(parsedScore) || parsedScore <= 0) {
        res.status(400).json({ error: 'La puntuación debe ser un número entero positivo.' });
        return;
      }

      const formattedName = name.trim().toUpperCase();

      if (!supabase) {
        // Fallback si no está configurada la base de datos
        res.status(200).json({
          success: true,
          isNewTop10: true,
          isAbsoluteRecord: parsedScore >= 50000,
          leaderboard: [
            { name: formattedName, score: parsedScore, date: Date.now() },
            ...DEFAULT_LEADERBOARD
          ].slice(0, 10)
        });
        return;
      }

      // 1. Obtener el Top 10 actual para evaluar si califica
      const { data: currentLeaderboard, error: fetchError } = await supabase
        .from('cholga_leaderboard')
        .select('name, score, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10);

      if (fetchError) throw fetchError;

      const lowestScore = currentLeaderboard.length >= 10 ? parseInt(currentLeaderboard[currentLeaderboard.length - 1].score, 10) : 0;
      const qualifies = currentLeaderboard.length < 10 || parsedScore > lowestScore;

      if (qualifies) {
        // Insertar la nueva clasificación
        const { error: insertError } = await supabase
          .from('cholga_leaderboard')
          .insert([
            { name: formattedName, score: parsedScore }
          ]);

        if (insertError) throw insertError;

        // Volver a consultar el Top 10 actualizado
        const { data: updatedLeaderboard, error: refreshError } = await supabase
          .from('cholga_leaderboard')
          .select('name, score, created_at')
          .order('score', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(10);

        if (refreshError) throw refreshError;

        const mappedLeaderboard = updatedLeaderboard.map(item => ({
          name: item.name,
          score: parseInt(item.score, 10),
          date: new Date(item.created_at).getTime()
        }));

        const isAbsoluteRecord = mappedLeaderboard[0].score === parsedScore && mappedLeaderboard[0].name === formattedName;

        res.status(200).json({
          success: true,
          isNewTop10: true,
          isAbsoluteRecord: isAbsoluteRecord,
          leaderboard: mappedLeaderboard
        });
      } else {
        const mappedLeaderboard = currentLeaderboard.map(item => ({
          name: item.name,
          score: parseInt(item.score, 10),
          date: new Date(item.created_at).getTime()
        }));

        res.status(200).json({
          success: true,
          isNewTop10: false,
          isAbsoluteRecord: false,
          leaderboard: mappedLeaderboard
        });
      }
      return;
    }

    res.status(405).json({ error: 'Método no permitido.' });
  } catch (error) {
    console.error('Error en el endpoint de récords (Supabase):', error);
    // Fallback amigable
    res.status(500).json({
      error: 'Error de servidor.',
      fallback: true,
      leaderboard: DEFAULT_LEADERBOARD
    });
  }
}
