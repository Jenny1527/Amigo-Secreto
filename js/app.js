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
// Cada héroe tiene una breve descripción que se muestra en la página
// de resultados para dar contexto sobre el alter ego elegido.
const HEROES = [
  // ══════════════════ MARVEL (35) ══════════════════
  { id: 'spider-man', name: 'Spider-Man', emoji: '🕷️', universe: 'Marvel', color: '#e23636', desc: 'El trepamuros de Nueva York: ágil, ingenioso y con sentido arácnido. "Un gran poder conlleva una gran responsabilidad".' },
  { id: 'iron-man', name: 'Iron Man', emoji: '🤖', universe: 'Marvel', color: '#b5121b', desc: 'Tony Stark, genio millonario que construyó una armadura de alta tecnología para convertirse en héroe.' },
  { id: 'capitan-america', name: 'Capitán América', emoji: '🛡️', universe: 'Marvel', color: '#0a4b8f', desc: 'El primer Vengador: líder leal y valiente, armado con su icónico escudo de vibranium.' },
  { id: 'thor', name: 'Thor', emoji: '⚡', universe: 'Marvel', color: '#0b5ea2', desc: 'Dios asgardiano del trueno que blande el martillo Mjölnir y controla los rayos.' },
  { id: 'hulk', name: 'Hulk', emoji: '💚', universe: 'Marvel', color: '#3a7d28', desc: 'El científico Bruce Banner que, al enfurecer, se transforma en un gigante verde de fuerza imparable.' },
  { id: 'wolverine', name: 'Wolverine', emoji: '🐺', universe: 'Marvel', color: '#c8a600', desc: 'Mutante rudo con garras de adamantium y factor curativo que lo hace prácticamente inmortal.' },
  { id: 'deadpool', name: 'Deadpool', emoji: '💀', universe: 'Marvel', color: '#cc0000', desc: 'El mercenario bocazas: irreverente, imposible de matar y con un humor muy particular.' },
  { id: 'black-panther', name: 'Black Panther', emoji: '🐾', universe: 'Marvel', color: '#2c003e', desc: 'T\'Challa, rey de Wakanda, protector de su nación con un traje de vibranium.' },
  { id: 'doctor-strange', name: 'Doctor Strange', emoji: '🔮', universe: 'Marvel', color: '#4a0072', desc: 'El Hechicero Supremo: maestro de las artes místicas y guardián de la realidad.' },
  { id: 'black-widow', name: 'Black Widow', emoji: '🕸️', universe: 'Marvel', color: '#1a1a1a', desc: 'Natasha Romanoff, espía y agente letal, experta en combate y sigilo.' },
  { id: 'capitana-marvel', name: 'Capitana Marvel', emoji: '⭐', universe: 'Marvel', color: '#c02b2b', desc: 'Carol Danvers, una de las heroínas más poderosas: vuela, dispara energía y resiste casi todo.' },
  { id: 'scarlet-witch', name: 'Scarlet Witch', emoji: '🔴', universe: 'Marvel', color: '#8b0000', desc: 'Wanda Maximoff, dueña de la magia del caos, capaz de alterar la propia realidad.' },
  { id: 'loki', name: 'Loki', emoji: '🐍', universe: 'Marvel', color: '#1b5e20', desc: 'El dios del engaño: astuto, encantador y maestro de las ilusiones y las travesuras.' },
  { id: 'ant-man', name: 'Ant-Man', emoji: '🐜', universe: 'Marvel', color: '#8b0000', desc: 'Scott Lang, que encoge y crece a voluntad y comanda ejércitos de hormigas.' },
  { id: 'hawkeye', name: 'Hawkeye', emoji: '🏹', universe: 'Marvel', color: '#4a148c', desc: 'Clint Barton, arquero de puntería perfecta que nunca falla un tiro.' },
  { id: 'groot', name: 'Groot', emoji: '🌳', universe: 'Marvel', color: '#5d4037', desc: 'El entrañable árbol viviente de los Guardianes. "Yo soy Groot".' },
  { id: 'star-lord', name: 'Star-Lord', emoji: '🎵', universe: 'Marvel', color: '#c62828', desc: 'Peter Quill, líder de los Guardianes de la Galaxia, aventurero con playlist ochentera.' },
  { id: 'gamora', name: 'Gamora', emoji: '⚔️', universe: 'Marvel', color: '#2e7d32', desc: '"La mujer más letal de la galaxia": guerrera implacable y Guardiana de la Galaxia.' },
  { id: 'rocket', name: 'Rocket Raccoon', emoji: '🦝', universe: 'Marvel', color: '#6d4c41', desc: 'Mapache genio de las armas y la ingeniería, con actitud y mucho carácter.' },
  { id: 'vision', name: 'Visión', emoji: '💎', universe: 'Marvel', color: '#7b1fa2', desc: 'Androide sintético con la Gema de la Mente, sabio y capaz de atravesar la materia.' },
  { id: 'falcon', name: 'Falcon', emoji: '🦅', universe: 'Marvel', color: '#b71c1c', desc: 'Sam Wilson, héroe que vuela con alas mecánicas y hoy porta el escudo del Capitán.' },
  { id: 'war-machine', name: 'War Machine', emoji: '💣', universe: 'Marvel', color: '#37474f', desc: 'James Rhodes en una armadura de combate cargada de armamento pesado.' },
  { id: 'silver-surfer', name: 'Silver Surfer', emoji: '🏄', universe: 'Marvel', color: '#78909c', desc: 'Heraldo cósmico que surca el universo sobre su tabla plateada con el Poder Cósmico.' },
  { id: 'daredevil', name: 'Daredevil', emoji: '😈', universe: 'Marvel', color: '#b71c1c', desc: 'El hombre sin miedo: ciego, pero con sentidos sobrehumanos que protege Hell\'s Kitchen.' },
  { id: 'punisher', name: 'Punisher', emoji: '💀', universe: 'Marvel', color: '#212121', desc: 'Frank Castle, justiciero implacable que persigue el crimen sin tregua.' },
  { id: 'moon-knight', name: 'Moon Knight', emoji: '🌙', universe: 'Marvel', color: '#eceff1', desc: 'El caballero de la luna: avatar del dios egipcio Khonshu, misterioso y feroz.' },
  { id: 'she-hulk', name: 'She-Hulk', emoji: '💪', universe: 'Marvel', color: '#388e3c', desc: 'Jennifer Walters, abogada que conserva su mente al transformarse en una poderosa gigante verde.' },
  { id: 'ms-marvel', name: 'Ms. Marvel', emoji: '💫', universe: 'Marvel', color: '#1565c0', desc: 'Kamala Khan, joven heroína capaz de estirar y agrandar su cuerpo con energía.' },
  { id: 'shang-chi', name: 'Shang-Chi', emoji: '🥋', universe: 'Marvel', color: '#d32f2f', desc: 'El maestro del kung-fu: artista marcial supremo portador de los Diez Anillos.' },
  { id: 'blade', name: 'Blade', emoji: '🗡️', universe: 'Marvel', color: '#1a1a1a', desc: 'El cazador de vampiros: mitad humano, mitad vampiro, con la fuerza de ambos.' },
  { id: 'storm', name: 'Storm', emoji: '⛈️', universe: 'Marvel', color: '#0d47a1', desc: 'Ororo Munroe, mutante que controla el clima: rayos, viento y tormentas.' },
  { id: 'cyclops', name: 'Cyclops', emoji: '👁️', universe: 'Marvel', color: '#c62828', desc: 'Líder de los X-Men que dispara potentes rayos ópticos de energía.' },
  { id: 'jean-grey', name: 'Jean Grey', emoji: '🔥', universe: 'Marvel', color: '#e65100', desc: 'Poderosa telépata y telequinética, portadora de la fuerza cósmica Fénix.' },
  { id: 'drax', name: 'Drax', emoji: '🗡️', universe: 'Marvel', color: '#546e7a', desc: 'Drax el Destructor: guerrero literal y de gran fuerza, Guardián de la Galaxia.' },
  { id: 'nebula', name: 'Nebula', emoji: '🌌', universe: 'Marvel', color: '#4527a0', desc: 'Cyborg guerrera y estratega, sobreviviente que se convirtió en heroína.' },

  // ══════════════════ DC (25) ══════════════════
  { id: 'batman', name: 'Batman', emoji: '🦇', universe: 'DC', color: '#1c1c1c', desc: 'El Caballero Oscuro de Gotham: sin superpoderes, pero con intelecto, tecnología y disciplina.' },
  { id: 'superman', name: 'Superman', emoji: '🦸', universe: 'DC', color: '#0057b8', desc: 'El Hombre de Acero: vuela, tiene super fuerza y visión de calor. El héroe por excelencia.' },
  { id: 'wonder-woman', name: 'Wonder Woman', emoji: '👸', universe: 'DC', color: '#b8860b', desc: 'Princesa amazona guerrera, con su Lazo de la Verdad y brazaletes indestructibles.' },
  { id: 'flash', name: 'Flash', emoji: '⚡', universe: 'DC', color: '#dc143c', desc: 'El hombre más rápido del mundo: corre a velocidades imposibles gracias a la Fuerza de la Velocidad.' },
  { id: 'aquaman', name: 'Aquaman', emoji: '🌊', universe: 'DC', color: '#00796b', desc: 'Rey de Atlantis: nada a gran velocidad y se comunica con la vida marina.' },
  { id: 'green-lantern', name: 'Green Lantern', emoji: '💍', universe: 'DC', color: '#1b5e20', desc: 'Portador de un anillo de poder que materializa cualquier cosa que imagine con su voluntad.' },
  { id: 'supergirl', name: 'Supergirl', emoji: '💪', universe: 'DC', color: '#1565c0', desc: 'Kara Zor-El, prima de Superman, con los mismos poderes kryptonianos y gran corazón.' },
  { id: 'batgirl', name: 'Batgirl', emoji: '🦇', universe: 'DC', color: '#4a148c', desc: 'Barbara Gordon, heroína ágil y brillante que protege Gotham junto a Batman.' },
  { id: 'robin', name: 'Robin', emoji: '🐦', universe: 'DC', color: '#d32f2f', desc: 'El fiel compañero de Batman: acróbata joven, valiente y en entrenamiento constante.' },
  { id: 'green-arrow', name: 'Green Arrow', emoji: '🏹', universe: 'DC', color: '#2e7d32', desc: 'Oliver Queen, arquero justiciero con una flecha para cada situación.' },
  { id: 'cyborg', name: 'Cyborg', emoji: '🤖', universe: 'DC', color: '#455a64', desc: 'Victor Stone, mitad humano mitad máquina, conectado a toda la tecnología.' },
  { id: 'shazam', name: 'Shazam', emoji: '⚡', universe: 'DC', color: '#c62828', desc: 'Un niño que al gritar "¡SHAZAM!" se convierte en un héroe adulto con el poder de seis dioses.' },
  { id: 'nightwing', name: 'Nightwing', emoji: '🌙', universe: 'DC', color: '#1a237e', desc: 'El primer Robin ya crecido: acróbata y líder nato que protege Blüdhaven.' },
  { id: 'harley-quinn', name: 'Harley Quinn', emoji: '🃏', universe: 'DC', color: '#e91e63', desc: 'Ex psiquiatra convertida en antiheroína impredecible, divertida y llena de energía.' },
  { id: 'catwoman', name: 'Catwoman', emoji: '🐱', universe: 'DC', color: '#212121', desc: 'Selina Kyle, ladrona felina, ágil y astuta, con debilidad por Batman.' },
  { id: 'hawkgirl', name: 'Hawkgirl', emoji: '🦅', universe: 'DC', color: '#bf360c', desc: 'Guerrera alada con maza de metal Nth que vuela y combate sin miedo.' },
  { id: 'martian-manhunter', name: 'Martian Manhunter', emoji: '👽', universe: 'DC', color: '#1b5e20', desc: 'El último marciano: telépata, cambiaformas y uno de los seres más poderosos de la Liga.' },
  { id: 'zatanna', name: 'Zatanna', emoji: '🎩', universe: 'DC', color: '#311b92', desc: 'Maga y hechicera que lanza conjuros pronunciando las palabras al revés.' },
  { id: 'blue-beetle', name: 'Blue Beetle', emoji: '🪲', universe: 'DC', color: '#0d47a1', desc: 'Jaime Reyes, unido a un escarabajo alienígena que le da una armadura biotecnológica.' },
  { id: 'black-canary', name: 'Black Canary', emoji: '🎤', universe: 'DC', color: '#1a1a1a', desc: 'Heroína experta en combate cuerpo a cuerpo con un grito sónico devastador.' },
  { id: 'raven', name: 'Raven', emoji: '🌑', universe: 'DC', color: '#311b92', desc: 'Hechicera empática de los Jóvenes Titanes, con poderes oscuros que controla con calma.' },
  { id: 'starfire', name: 'Starfire', emoji: '☀️', universe: 'DC', color: '#e65100', desc: 'Princesa alienígena de Tamaran: vuela y lanza rayos de energía estelar.' },
  { id: 'beast-boy', name: 'Beast Boy', emoji: '🦎', universe: 'DC', color: '#2e7d32', desc: 'Joven Titán que se transforma en cualquier animal. Divertido y de piel verde.' },
  { id: 'constantine', name: 'Constantine', emoji: '🔥', universe: 'DC', color: '#795548', desc: 'Detective de lo oculto: mago cínico que enfrenta demonios con astucia.' },
  { id: 'booster-gold', name: 'Booster Gold', emoji: '🌟', universe: 'DC', color: '#f9a825', desc: 'Héroe del futuro con tecnología avanzada y ganas de fama... con buen corazón.' }
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
    pin: (p.pin || '').replace(/\D/g, '').slice(0, 4)
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
    // return=minimal: NO pedimos que la BD nos devuelva la fila insertada.
    // Así 'anon' no necesita permiso de lectura sobre participants y el PIN
    // (y demás datos) nunca quedan expuestos por la API.
    const res = await fetch(sbUrl('participants'), {
      method: 'POST',
      headers: sbHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify(row)
    });
    if (res.status === 201 || res.status === 200 || res.status === 204) {
      return { ok: true };
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
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail = (body && (body.message || body.details || body.hint)) || '';
      throw dataError('NETWORK', 'No se pudo reiniciar' + (detail ? ': ' + detail : ` (HTTP ${res.status}).`));
    }
    return;
  }
  localSaveParticipants([]);
  localStorage.removeItem(APP_CONFIG.DRAW_KEY);
}

// ─── Sorteo ───

/**
 * ¿Ya se realizó el sorteo? (público, NO expone ningún dato).
 * Usa la RPC public_draw_done que solo devuelve true/false.
 */
async function isDrawDone() {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('public_draw_done'), {
      method: 'POST',
      headers: sbHeaders(),
      body: '{}'
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo consultar el sorteo.');
    return await res.json() === true;
  }
  return !!localStorage.getItem(APP_CONFIG.DRAW_KEY);
}

/**
 * Consulta AUTENTICADA del resultado propio: celular + PIN.
 * El servidor (RPC get_my_result) valida el PIN y devuelve SOLO la
 * asignación de esa persona. Nadie puede ver los datos de los demás.
 * Devuelve el objeto de asignación, o null si no hay sorteo aún.
 * Lanza error con code 'BAD_AUTH' si el celular/PIN no coinciden.
 */
async function getMyResult(celular, pin) {
  const cleanCelular = (celular || '').replace(/\D/g, '');
  const cleanPin = (pin || '').replace(/\D/g, '');

  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('get_my_result'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ p_celular: cleanCelular, p_pin: cleanPin })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body && (body.message || body.details || body.hint) || '') + '';
      if (/NO_DRAW/i.test(msg)) return null;
      if (/BAD_AUTH/i.test(msg)) throw dataError('BAD_AUTH', 'Celular o PIN incorrectos.');
      throw dataError('NETWORK', 'No se pudo consultar el resultado.');
    }
    const data = await res.json();
    // La RPC devuelve null si no hay sorteo, o el objeto de asignación.
    if (data === null || data === undefined) return null;
    return data;
  }

  // ── Respaldo local (1 navegador) ──
  const drawRaw = localStorage.getItem(APP_CONFIG.DRAW_KEY);
  const draw = drawRaw ? JSON.parse(drawRaw) : null;
  if (!draw) return null;
  const participant = localGetParticipants().find(
    p => (p.celular || '').replace(/\D/g, '') === cleanCelular
  );
  if (!participant || ((participant.pin || '').replace(/\D/g, '') !== cleanPin)) {
    throw dataError('BAD_AUTH', 'Celular o PIN incorrectos.');
  }
  const assignment = draw.results.find(
    r => (r.giverCelular || '').replace(/\D/g, '') === cleanCelular
  );
  return assignment || null;
}

// ── ADMIN: Obtener el sorteo completo via RPC (requiere password) ──
async function getDrawResultsAdmin(password) {
  if (supabaseEnabled()) {
    const res = await fetch(sbRpcUrl('admin_get_draw'), {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ pwd: password })
    });
    if (!res.ok) throw dataError('NETWORK', 'No se pudo consultar el sorteo.');
    const data = await res.json();
    if (!data || !data.results) return null;
    return { results: data.results, drawnAt: data.drawn_at || data.drawnAt };
  }
  const local = localStorage.getItem(APP_CONFIG.DRAW_KEY);
  return local ? JSON.parse(local) : null;
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

// ─── Visibilidad del panel de administración ───
// Si window.ADMIN_ENABLED (definido en js/config.js) no es true,
// se oculta cualquier enlace o tarjeta que apunte a admin.html.
function applyAdminVisibility() {
  if (window.ADMIN_ENABLED === true) return;
  document.querySelectorAll('a[href="admin.html"]').forEach(el => {
    const li = el.closest('li');
    (li || el).style.display = 'none';
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initStarBackground();
  applyAdminVisibility();
});
