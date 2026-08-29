// ============================================================
// APP.JS — Datos compartidos, superhéroes y lógica de storage
// ============================================================

const APP_CONFIG = {
  STORAGE_KEY: 'superhero_secret_friend',
  DRAW_KEY: 'superhero_draw_results',
  ADMIN_PASSWORD: 'superhero2026',
  BUDGET: '$50.000 COP',
  APP_NAME: 'Liga de Superhéroes — Amigo Secreto'
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

// Fila de la BD (snake_case) -> objeto participante usado por la UI (camelCase)
function rowToParticipant(r) {
  return {
    id: r.id,
    cedula: r.cedula,
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
    cedula: p.cedula,
    name: p.name,
    cargo: p.cargo,
    hero: p.hero,
    gifts: p.gifts || [],
    no_gift: p.noGift || '',
    preferences: p.preferences || [],
    endulzada: p.endulzada,
    endulzada_otros: p.endulzadaOtros || '',
    alergias: p.alergias || '',
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
async function getParticipants() {
  if (supabaseEnabled()) {
    const res = await fetch(sbUrl('participants?select=*&order=created_at.asc'), { headers: sbHeaders() });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo conectar con la base de datos.');
    const rows = await res.json();
    return rows.map(rowToParticipant);
  }
  return localGetParticipants();
}

async function getTakenHeroes() {
  const participants = await getParticipants();
  return participants.map(p => p.hero);
}

async function isHeroTaken(heroId) {
  const taken = await getTakenHeroes();
  return taken.includes(heroId);
}

async function isCedulaRegistered(cedula) {
  const clean = (cedula || '').replace(/\D/g, '');
  const participants = await getParticipants();
  return participants.some(p => (p.cedula || '').replace(/\D/g, '') === clean);
}

async function getParticipantByCedula(cedula) {
  const clean = (cedula || '').replace(/\D/g, '');
  const participants = await getParticipants();
  return participants.find(p => (p.cedula || '').replace(/\D/g, '') === clean);
}

// Inserta el participante. La unicidad de héroe y cédula la garantiza la BD:
// si dos personas eligen el mismo héroe a la vez, solo una queda registrada.
async function addParticipant(participant) {
  if (supabaseEnabled()) {
    const res = await fetch(sbUrl('participants'), {
      method: 'POST',
      headers: sbHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(participantToRow(participant))
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
      if (/cedula/i.test(msg)) throw dataError('CEDULA_TAKEN', 'Esta cédula ya está registrada.');
      throw dataError('CONFLICT', 'Ya existe un registro con esos datos.');
    }
    throw dataError('NETWORK', 'No se pudo guardar la inscripción. Revisa tu conexión e intenta de nuevo.');
  }
  // Respaldo local
  const participants = localGetParticipants();
  const clean = (participant.cedula || '').replace(/\D/g, '');
  if (participants.some(p => (p.cedula || '').replace(/\D/g, '') === clean)) {
    throw dataError('CEDULA_TAKEN', 'Esta cédula ya está registrada.');
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

async function removeParticipant(id) {
  if (supabaseEnabled()) {
    const res = await fetch(sbUrl('participants?id=eq.' + encodeURIComponent(id)), {
      method: 'DELETE', headers: sbHeaders()
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo eliminar el participante.');
    return;
  }
  let participants = localGetParticipants();
  participants = participants.filter(p => p.id !== id);
  localSaveParticipants(participants);
}

async function resetAll() {
  if (supabaseEnabled()) {
    await fetch(sbUrl('participants?id=not.is.null'), { method: 'DELETE', headers: sbHeaders() });
    await fetch(sbUrl('draw_results?id=eq.1'), { method: 'DELETE', headers: sbHeaders() });
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

async function saveDrawResults(results) {
  const payload = { results: results, drawnAt: new Date().toISOString() };
  if (supabaseEnabled()) {
    // El sorteo vive en una sola fila (id = 1): la reemplazamos.
    await fetch(sbUrl('draw_results?id=eq.1'), { method: 'DELETE', headers: sbHeaders() });
    const res = await fetch(sbUrl('draw_results'), {
      method: 'POST',
      headers: sbHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ id: 1, results: results, drawn_at: payload.drawnAt })
    });
    if (res.status !== 201 && !res.ok) throw dataError('NETWORK', 'No se pudo guardar el sorteo.');
    return payload;
  }
  localStorage.setItem(APP_CONFIG.DRAW_KEY, JSON.stringify(payload));
  return payload;
}

async function clearDrawResults() {
  if (supabaseEnabled()) {
    await fetch(sbUrl('draw_results?id=eq.1'), { method: 'DELETE', headers: sbHeaders() });
    return;
  }
  localStorage.removeItem(APP_CONFIG.DRAW_KEY);
}

/**
 * Fisher-Yates based circular permutation for secret friend assignment.
 * Guarantees no one draws themselves.
 */
async function performDraw() {
  const participants = await getParticipants();
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
    giverCedula: giver.cedula,
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

  await saveDrawResults(results);
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

function formatCedulaDisplay(cedula) {
  const clean = (cedula || '').replace(/\D/g, '');
  if (clean.length >= 6) {
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  return cedula || '';
}

function exportToCSV(participants) {
  participants = participants || [];
  if (participants.length === 0) return '';

  const headers = ['Cédula', 'Nombre', 'Cargo', 'Superhéroe', 'Regalo 1', 'Regalo 2', 'Regalo 3', 'No quiere', 'Preferencias', 'Endulzada', 'Alergias', 'Accesorio'];
  const rows = participants.map(p => {
    const hero = getHeroById(p.hero);
    return [
      p.cedula,
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
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;
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
