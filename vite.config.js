import { defineConfig } from 'vite';

export default defineConfig(() => {
  // 1. Determinar la URL base absoluta según las variables de entorno de Vercel
  let publicUrl = 'http://localhost:5173'; // Fallback local

  if (process.env.VERCEL_ENV === 'production') {
    // URL de producción (ej. https://supabase-cholga-run.vercel.app o dominio personalizado)
    publicUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'cholga-run.vercel.app'}`;
  } else if (process.env.VERCEL_URL) {
    // URL dinámica del preview actual (ej. https://cholga-run-git-staging-cannobbio.vercel.app)
    publicUrl = `https://${process.env.VERCEL_URL}`;
  }

  // Asegurar que no termine con barra diagonal
  if (publicUrl.endsWith('/')) {
    publicUrl = publicUrl.slice(0, -1);
  }

  return {
    define: {
      'import.meta.env.VITE_PUBLIC_URL': JSON.stringify(publicUrl),
    },
    plugins: [
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          // Reemplazar dinámicamente los placeholders en el index.html al compilar
          return html.replace(/%VITE_PUBLIC_URL%/g, publicUrl);
        }
      }
    ]
  };
});
