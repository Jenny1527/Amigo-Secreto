// ============================================================
// APP.JS — Datos compartidos, superhéroes y lógica de storage
// ============================================================
// SEGURIDAD: Las operaciones de admin (listar participantes,
// eliminar, sortear, resetear) pasan por funciones RPC de
// PostgreSQL que validan un password del lado del servidor.
// La anon key solo permite INSERT en participants y SELECT en
// draw_results. Ver supabase_setup.sql para los detalles.
// ============================================================

const APP_CONFIG = {
  STORAGE_KEY: 'superhero_secret_friend',
  DRAW_KEY: 'superhero_draw_results',
  BUDGET: '$50.000 COP',
  APP_NAME: 'Liga de Superhéroes — Amigo Secreto',
  // Rate limiting para login de admin
  MAX_LOGIN_ATTEMPTS: 3,
  LOGIN_COOLDOWN_MS: 30000 // 30 segundos
};

// ─── Lista completa de superhéroes (60, ordenados por fama) ───
const HEROES = [
  // ══════════════════ MARVEL (35) ══════════════════
  { id: 'spider-man', name: 'Spider-Man', emoji: '🕷️', universe: 'Marvel', color: '#e23636' },
  { id: 'iron-man', name: 'Iron Man', emoji: '🤖', universe: 'Marvel', color: '#b5121b' },
  { id: 'capitan-america', name: 'Capitán América', emoji: '🛡️', universe: 'Marvel', color: '#0a4b8f' },
  { id: 'thor', name: 'Thor', emoji: '⚡', universe: 'Marvel', color: '#0b5ea2' },
  { id: 'hulk', name: 'Hulk', emoji: '💚', universe: 'Marvel', color: '#3a7d28' },
  { id: 'wolverine', name: 'Wolverine', emoji: '🐺', universe: 'Marvel', color: '#c8a600' },
  { id: 'deadpool', name: 'Deadpool', emoji: '💀', universe: 'Marvel', color: '#cc0000' },
  { id: 'black-panther', name: 'Black Panther', emoji: '🐾', universe: 'Marvel', color: '#2c003e' },
  { id: 'doctor-strange', name: 'Doctor Strange', emoji: '🔮', universe: 'Marvel', color: '#4a0072' },
  { id: 'black-widow', name: 'Black Widow', emoji: '🕸️', universe: 'Marvel', color: '#1a1a1a' },
  { id: 'capitana-marvel', name: 'Capitana Marvel', emoji: '⭐', universe: 'Marvel', color: '#c02b2b' },
  { id: 'scarlet-witch', name: 'Scarlet Witch', emoji: '🔴', universe: 'Marvel', color: '#8b0000' },
  { id: 'loki', name: 'Loki', emoji: '🐍', universe: 'Marvel', color: '#1b5e20' },
  { id: 'ant-man', name: 'Ant-Man', emoji: '🐜', universe: 'Marvel', color: '#8b0000' },
  { id: 'hawkeye', name: 'Hawkeye', emoji: '🏹', universe: 'Marvel', color: '#4a148c' },
  { id: 'groot', name: 'Groot', emoji: '🌳', universe: 'Marvel', color: '#5d4037' },
  { id: 'star-lord', name: 'Star-Lord', emoji: '🎵', universe: 'Marvel', color: '#c62828' },
  { id: 'gamora', name: 'Gamora', emoji: '⚔️', universe: 'Marvel', color: '#2e7d32' },
  { id: 'rocket', name: 'Rocket Raccoon', emoji: '🦝', universe: 'Marvel', color: '#6d4c41' },
  { id: 'vision', name: 'Visión', emoji: '💎', universe: 'Marvel', color: '#7b1fa2' },
  { id: 'falcon', name: 'Falcon', emoji: '🦅', universe: 'Marvel', color: '#b71c1c' },
  { id: 'war-machine', name: 'War Machine', emoji: '💣', universe: 'Marvel', color: '#37474f' },
  { id: 'silver-surfer', name: 'Silver Surfer', emoji: '🏄', universe: 'Marvel', color: '#78909c' },
  { id: 'daredevil', name: 'Daredevil', emoji: '😈', universe: 'Marvel', color: '#b71c1c' },
  { id: 'punisher', name: 'Punisher', emoji: '💀', universe: 'Marvel', color: '#212121' },
  { id: 'moon-knight', name: 'Moon Knight', emoji: '🌙', universe: 'Marvel', color: '#eceff1' },
  { id: 'she-hulk', name: 'She-Hulk', emoji: '💪', universe: 'Marvel', color: '#388e3c' },
  { id: 'ms-marvel', name: 'Ms. Marvel', emoji: '💫', universe: 'Marvel', color: '#1565c0' },
  { id: 'shang-chi', name: 'Shang-Chi', emoji: '🥋', universe: 'Marvel', color: '#d32f2f' },
  { id: 'blade', name: 'Blade', emoji: '🗡️', universe: 'Marvel', color: '#1a1a1a' },
  { id: 'storm', name: 'Storm', emoji: '⛈️', universe: 'Marvel', color: '#0d47a1' },
  { id: 'cyclops', name: 'Cyclops', emoji: '👁️', universe: 'Marvel', color: '#c62828' },
  { id: 'jean-grey', name: 'Jean Grey', emoji: '🔥', universe: 'Marvel', color: '#e65100' },
  { id: 'drax', name: 'Drax', emoji: '🗡️', universe: 'Marvel', color: '#546e7a' },
  { id: 'nebula', name: 'Nebula', emoji: '🌌', universe: 'Marvel', color: '#4527a0' },

  // ══════════════════ DC (25) ══════════════════
  { id: 'batman', name: 'Batman', emoji: '🦇', universe: 'DC', color: '#1c1c1c' },
  { id: 'superman', name: 'Superman', emoji: '🦸', universe: 'DC', color: '#0057b8' },
  { id: 'wonder-woman', name: 'Wonder Woman', emoji: '👸', universe: 'DC', color: '#b8860b' },
  { id: 'flash', name: 'Flash', emoji: '⚡', universe: 'DC', color: '#dc143c' },
  { id: 'aquaman', name: 'Aquaman', emoji: '🌊', universe: 'DC', color: '#00796b' },
  { id: 'green-lantern', name: 'Green Lantern', emoji: '💍', universe: 'DC', color: '#1b5e20' },
  { id: 'supergirl', name: 'Supergirl', emoji: '💪', universe: 'DC', color: '#1565c0' },
  { id: 'batgirl', name: 'Batgirl', emoji: '🦇', universe: 'DC', color: '#4a148c' },
  { id: 'robin', name: 'Robin', emoji: '🐦', universe: 'DC', color: '#d32f2f' },
  { id: 'green-arrow', name: 'Green Arrow', emoji: '🏹', universe: 'DC', color: '#2e7d32' },
  { id: 'cyborg', name: 'Cyborg', emoji: '🤖', universe: 'DC', color: '#455a64' },
  { id: 'shazam', name: 'Shazam', emoji: '⚡', universe: 'DC', color: '#c62828' },
  { id: 'nightwing', name: 'Nightwing', emoji: '🌙', universe: 'DC', color: '#1a237e' },
  { id: 'harley-quinn', name: 'Harley Quinn', emoji: '🃏', universe: 'DC', color: '#e91e63' },
  { id: 'catwoman', name: 'Catwoman', emoji: '🐱', universe: 'DC', color: '#212121' },
  { id: 'hawkgirl', name: 'Hawkgirl', emoji: '🦅', universe: 'DC', color: '#bf360c' },
  { id: 'martian-manhunter', name: 'Martian Manhunter', emoji: '👽', universe: 'DC', color: '#1b5e20' },
  { id: 'zatanna', name: 'Zatanna', emoji: '🎩', universe: 'DC', color: '#311b92' },
  { id: 'blue-beetle', name: 'Blue Beetle', emoji: '🪲', universe: 'DC', color: '#0d47a1' },
  { id: 'black-canary', name: 'Black Canary', emoji: '🎤', universe: 'DC', color: '#1a1a1a' },
  { id: 'raven', name: 'Raven', emoji: '🌑', universe: 'DC', color: '#311b92' },
  { id: 'starfire', name: 'Starfire', emoji: '☀️', universe: 'DC', color: '#e65100' },
  { id: 'beast-boy', name: 'Beast Boy', emoji: '🦎', universe: 'DC', color: '#2e7d32' },
  { id: 'constantine', name: 'Constantine', emoji: '🔥', universe: 'DC', color: '#795548' },
  { id: 'booster-gold', name: 'Booster Gold', emoji: '🌟', universe: 'DC', color: '#f9a825' }
];

// No se usa lista predefinida — el cargo es texto libre

// Opciones para las "endulzadas" de los dos primeros viernes
const ENDULZADA_OPTIONS = [
  { id: 'dulce', label: 'Dulce 🍬' },
  { id: 'salado', label: 'Salado 🥨' },
  { id: 'ambos', label: 'Ambos me gustan 😋' }
];

function getEndulzadaLabel(id) {
  const found = ENDULZADA_OPTIONS.find(o => o.id === id);
  return found ? found.label : (id || '—');
}

// Muestra la preferencia de endulzada incluyendo el detalle de "Otros"
function endulzadaDisplay(value, otros) {
  const base = getEndulzadaLabel(value);
  if (value === 'otros') return otros ? `Otros: ${otros}` : base;
  if (otros) return `${base} (${otros})`;
  return base;
}

const PREFERENCE_OPTIONS = [
  { id: 'dulces', label: 'Dulces 🍫', icon: '🍫' },
  { id: 'cafe', label: 'Café ☕', icon: '☕' },
  { id: 'tecnologia', label: 'Tecnología 📱', icon: '📱' },
  { id: 'cuidado-personal', label: 'Cuidado Personal 🧴', icon: '🧴' },
  { id: 'accesorios', label: 'Accesorios 💍', icon: '💍' },
  { id: 'libros', label: 'Libros 📚', icon: '📚' },
  { id: 'papeleria', label: 'Papelería ✏️', icon: '✏️' },
  { id: 'ropa', label: 'Ropa 👕', icon: '👕' }
];

// ============================================================
// SANITIZACIÓN Y VALIDACIÓN DE INPUTS (OWASP A03)
// ============================================================

/**
 * Sanitiza un string de texto libre: recorta, limita longitud,
 * elimina caracteres de control y secuencias peligrosas.
 */
function sanitizeInput(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .slice(0, maxLength)
    // Eliminar caracteres de control (excepto saltos de línea)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Eliminar null bytes
    .replace(/\0/g, '');
}

/**
 * Valida un número de celular colombiano.
 * Formato: 10 dígitos, empieza con 3.
 * Acepta espacios, puntos y guiones como separadores.
 */
function validateCelular(raw) {
  const clean = (raw || '').replace(/[\s.\-()]/g, '');
  if (!/^\d{7,15}$/.test(clean)) return null;
  return clean;
}

/**
 * Valida que un heroId exista en la lista conocida.
 */
function isValidHeroId(heroId) {
  return HEROES.some(h => h.id === heroId);
}

// ============================================================
// CAPA DE DATOS — Supabase (nube compartida) con respaldo local
// La configuración vive en js/config.js
//   window.SUPABASE_URL / window.SUPABASE_ANON_KEY
// Si no está configurada, la app funciona en modo local (1 navegador).
// ============================================================

function supabaseEnabled() {
  return typeof window !== 'undefined'
    && !!window.SUPABASE_URL && !!window.SUPABASE_ANON_KEY
    && !/TU_|PEGA_|xxxx/i.test(window.SUPABASE_URL)
    && !/TU_|PEGA_|xxxx/i.test(window.SUPABASE_ANON_KEY);
}

function dataError(code, message) {
  const e = new Error(message);
  e.code = code;
  return e;
}

function sbHeaders(extra) {
  return Object.assign({
    'apikey': window.SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + window.SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }, extra || {});
}

function sbUrl(path) {
  return window.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/' + path;
}

function sbRpcUrl(fnName) {
  return window.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/rpc/' + fnName;
}

// Fila de la BD (snake_case) -> objeto participante usado por la UI (camelCase)
function rowToParticipant(r) {
  return {
    id: r.id,
    celular: r.celular,
    name: r.name,
    cargo: r.cargo,
    hero: r.hero,
    gifts: r.gifts || [],
    noGift: r.no_gift || '',
    preferences: r.preferences || [],
    endulzada: r.endulzada,
    endulzadaOtros: r.endulzada_otros || '',
    alergias: r.alergias || '',
    costume: !!r.costume,
    registeredAt: r.created_at
  };
}

function participantToRow(p) {
  return {
    celular: sanitizeInput(p.celular, 15).replace(/\D/g, ''),
    name: sanitizeInput(p.name, 100),
    cargo: sanitizeInput(p.cargo, 100),
    hero: p.hero,
    gifts: (p.gifts || []).map(g => sanitizeInput(g, 200)),
    no_gift: sanitizeInput(p.noGift || '', 200),
    preferences: (p.preferences || []).filter(id =>
      PREFERENCE_OPTIONS.some(opt => opt.id === id)
    ),
    endulzada: sanitizeInput(p.endulzada, 20),
    endulzada_otros: sanitizeInput(p.endulzadaOtros || '', 200),
    alergias: sanitizeInput(p.alergias || '', 200),
    costume: !!p.costume
  };
}

// ─── Respaldo local (localStorage) ───
function localGetParticipants() {
  const data = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
function localSaveParticipants(participants) {
  localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(participants));
}

// ─── API pública de datos (asíncrona) ───

/**
 * Obtiene la cantidad de participantes inscritos (sin datos sensibles).
 * Usa la función RPC pública que solo retorna el conteo.
 */
async function getParticipantCount() {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('public_participant_count'), {
      method: 'POST',
      headers: sbHeaders(),
      body: '{}'
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo conectar con la base de datos.');
    return await res.json();
  }
  return localGetParticipants().length;
}

/**
 * Obtiene la lista de héroes ya tomados (sin datos personales).
 */
async function getTakenHeroes() {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('public_taken_heroes'), {
      method: 'POST',
      headers: sbHeaders(),
      body: '{}'
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo conectar con la base de datos.');
    return await res.json();
  }
  return localGetParticipants().map(p => p.hero);
}

async function isHeroTaken(heroId) {
  const taken = await getTakenHeroes();
  return taken.includes(heroId);
}

// ── ADMIN: Obtener todos los participantes (requiere password) ──
async function getParticipantsAdmin(password) {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('admin_list_participants'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ pwd: password })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (/contraseña/i.test(body.message || '')) throw dataError('AUTH', 'Contraseña incorrecta');
      throw dataError('NETWORK', 'No se pudo conectar con la base de datos.');
    }
    const rows = await res.json();
    return rows.map(rowToParticipant);
  }
  return localGetParticipants();
}

// ── ADMIN: Verificar login via RPC (server-side) ──
async function adminLogin(password) {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('admin_login'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ pwd: password })
    });
    if (!res.ok) return false;
    return await res.json();
  }
  // Fallback local — solo para desarrollo
  return password === 'superhero2026';
}

// Inserta el participante. La unicidad de héroe y celular la garantiza la BD:
// si dos personas eligen el mismo héroe a la vez, solo una queda registrada.
async function addParticipant(participant) {
  // Validar hero del lado del cliente
  if (!isValidHeroId(participant.hero)) {
    throw dataError('INVALID', 'Superhéroe no válido.');
  }

  if (supabaseEnabled()) {
    const row = participantToRow(participant);
    const res = await fetch(sbUrl('participants'), {
      method: 'POST',
      headers: sbHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(row)
    });
    if (res.status === 201) {
      const rows = await res.json();
      return rowToParticipant(rows[0]);
    }
    let body = {};
    try { body = await res.json(); } catch (e) {}
    const msg = ((body && (body.message || body.details || body.hint)) || '') + '';
    if (res.status === 409 || /duplicate key|unique/i.test(msg)) {
      if (/hero/i.test(msg)) throw dataError('HERO_TAKEN', 'Este superhéroe acaba de ser elegido por otra persona. Elige otro.');
      if (/celular/i.test(msg)) throw dataError('CELULAR_TAKEN', 'Este celular ya está registrado.');
      throw dataError('CONFLICT', 'Ya existe un registro con esos datos.');
    }
    throw dataError('NETWORK', 'No se pudo guardar la inscripción. Revisa tu conexión e intenta de nuevo.');
  }
  // Respaldo local
  const participants = localGetParticipants();
  const clean = (participant.celular || '').replace(/\D/g, '');
  if (participants.some(p => (p.celular || '').replace(/\D/g, '') === clean)) {
    throw dataError('CELULAR_TAKEN', 'Este celular ya está registrado.');
  }
  if (participants.some(p => p.hero === participant.hero)) {
    throw dataError('HERO_TAKEN', 'Este superhéroe acaba de ser elegido por otra persona. Elige otro.');
  }
  participant.id = generateId();
  participant.registeredAt = new Date().toISOString();
  participants.push(participant);
  localSaveParticipants(participants);
  return participant;
}

// ── ADMIN: Eliminar participante via RPC ──
async function removeParticipant(id, password) {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('admin_delete_participant'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ pwd: password, participant_id: id })
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo eliminar el participante.');
    return;
  }
  let participants = localGetParticipants();
  participants = participants.filter(p => p.id !== id);
  localSaveParticipants(participants);
}

// ── ADMIN: Resetear todo via RPC ──
async function resetAll(password) {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('admin_reset_all'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ pwd: password })
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo reiniciar.');
    return;
  }
  localSaveParticipants([]);
  localStorage.removeItem(APP_CONFIG.DRAW_KEY);
}

// ─── Sorteo ───
async function getDrawResults() {
  if (supabaseEnabled()) {
    const res = await fetch(sbUrl('draw_results?id=eq.1&select=*'), { headers: sbHeaders() });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo consultar el sorteo.');
    const rows = await res.json();
    if (!rows.length) return null;
    return { results: rows[0].results, drawnAt: rows[0].drawn_at };
  }
  const data = localStorage.getItem(APP_CONFIG.DRAW_KEY);
  return data ? JSON.parse(data) : null;
}

// ── ADMIN: Guardar resultados del sorteo via RPC ──
async function saveDrawResults(results, password) {
  const drawnAt = new Date().toISOString();
  const payload = { results: results, drawnAt: drawnAt };
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('admin_save_draw'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({
        pwd: password,
        draw_results: results,
        draw_time: drawnAt
      })
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo guardar el sorteo.');
    return payload;
  }
  localStorage.setItem(APP_CONFIG.DRAW_KEY, JSON.stringify(payload));
  return payload;
}

// ── ADMIN: Limpiar sorteo via RPC ──
async function clearDrawResults(password) {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('admin_clear_draw'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ pwd: password })
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo limpiar el sorteo.');
    return;
  }
  localStorage.removeItem(APP_CONFIG.DRAW_KEY);
}

/**
 * Fisher-Yates based circular permutation for secret friend assignment.
 * Guarantees no one draws themselves.
 */
async function performDraw(password) {
  const participants = await getParticipantsAdmin(password);
  if (participants.length < 3) {
    throw new Error('Se necesitan al menos 3 participantes para el sorteo.');
  }

  // Create a derangement (permutation where no element maps to itself)
  let assignments;
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    assignments = createDerangement(participants);
    attempts++;
  } while (!assignments && attempts < maxAttempts);

  if (!assignments) {
    throw new Error('No se pudo generar un sorteo válido. Intenta de nuevo.');
  }

  const results = participants.map((giver, index) => ({
    giverId: giver.id,
    giverName: giver.name,
    giverCelular: giver.celular,
    giverHero: giver.hero,
    receiverId: assignments[index].id,
    receiverHero: assignments[index].hero,
    receiverGifts: assignments[index].gifts,
    receiverNoGift: assignments[index].noGift,
    receiverPreferences: assignments[index].preferences,
    receiverEndulzada: assignments[index].endulzada,
    receiverEndulzadaOtros: assignments[index].endulzadaOtros,
    receiverAlergias: assignments[index].alergias,
    receiverCostume: assignments[index].costume
  }));

  await saveDrawResults(results, password);
  return results;
}

function createDerangement(arr) {
  const n = arr.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const result = new Array(n);

  // Sattolo's algorithm for derangement
  const shuffled = [...indices];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i); // Note: not i+1, this creates a cycle
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Verify derangement
  for (let i = 0; i < n; i++) {
    if (shuffled[i] === i) return null;
    result[i] = arr[shuffled[i]];
  }

  return result;
}

// ─── Utility ───
function generateId() {
  return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

function getHeroById(heroId) {
  return HEROES.find(h => h.id === heroId);
}

function formatCelularDisplay(celular) {
  const clean = (celular || '').replace(/\D/g, '');
  if (clean.length === 10) {
    // Formato colombiano: 300 123 4567
    return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  return celular || '';
}

function exportToCSV(participants) {
  participants = participants || [];
  if (participants.length === 0) return '';

  const headers = ['Celular', 'Nombre', 'Cargo', 'Superhéroe', 'Regalo 1', 'Regalo 2', 'Regalo 3', 'No quiere', 'Preferencias', 'Endulzada', 'Alergias', 'Accesorio'];
  const rows = participants.map(p => {
    const hero = getHeroById(p.hero);
    return [
      p.celular,
      p.name,
      p.cargo,
      hero ? hero.name : p.hero,
      p.gifts[0] || '',
      p.gifts[1] || '',
      p.gifts[2] || '',
      p.noGift || '',
      (p.preferences || []).join('; '),
      endulzadaDisplay(p.endulzada, p.endulzadaOtros),
      p.alergias || 'Ninguna',
      p.costume ? 'Sí' : 'No'
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// ─── Shared UI Helpers ───
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  // Sanitizar el mensaje para evitar XSS en toasts dinámicos
  const safeMessage = document.createElement('span');
  safeMessage.textContent = message;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast-message"></span>
  `;
  toast.querySelector('.toast-message').textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-show'));

  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Initialize star background animation
function initStarBackground() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let stars = [];
  const numStars = 120;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.005 + 0.002,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001;
    stars.forEach(star => {
      const flicker = Math.sin(time * star.speed * 100 + star.phase) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * flicker})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createStars();
  draw();
  window.addEventListener('resize', () => {
    resize();
    createStars();
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initStarBackground();
});
