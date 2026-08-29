// ============================================================
// CONFIGURACIÓN DE SUPABASE (base de datos compartida en la nube)
// ------------------------------------------------------------
// Estos dos datos conectan la app con tu proyecto de Supabase.
// Si algún día creas otro proyecto, reemplázalos por los nuevos
// (Settings → API Keys).
// ============================================================

window.SUPABASE_URL = "https://wogxwcvdvtvsriywxuqs.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ3h3Y3ZkdnR2c3JpeXd4dXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTM0OTQsImV4cCI6MjEwMzQyOTQ5NH0.tZhuNrgzedelfTSesIb1wxrGSPpq0yua5M6wqZ2wFNk";

// ============================================================
// PANEL DE ADMINISTRACIÓN — visibilidad manual
// ------------------------------------------------------------
// Con false (por defecto): el enlace "Admin" del menú y la tarjeta
// del panel NO se muestran en la app, y la página admin.html queda
// bloqueada aunque alguien escriba la dirección directamente.
//
// Para ACTIVAR el panel: cambia esta línea a  true  , guarda el
// archivo y recarga la página. Para volver a ocultarlo, ponla en
// false de nuevo. (El control vive aquí, no en el HTML.)
// ============================================================
window.ADMIN_ENABLED = false;
