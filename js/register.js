// ============================================================
// REGISTER.JS — Lógica del formulario de inscripción
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  populateHeroGrid();
  populatePreferences();
  setupFormSubmission();
  startGridAutoRefresh();
});

// Refresca la lista de héroes tomados cada pocos segundos (y al volver a la pestaña),
// para que se marquen los que otras personas acaban de elegir, sin recargar la página.
function startGridAutoRefresh() {
  setInterval(() => { if (!document.hidden) refreshTakenHeroes(); }, 12000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshTakenHeroes(); });
}

async function refreshTakenHeroes() {
  let taken;
  try { taken = await getTakenHeroes(); } catch (e) { return; }
  const grid = document.getElementById('hero-grid');
  if (!grid) return;

  taken.forEach(hid => {
    const card = grid.querySelector(`.hero-card[data-hero-id="${CSS.escape(hid)}"]`);
    if (card && !card.classList.contains('hero-taken')) {
      card.classList.add('hero-taken');
      const hero = getHeroById(hid);
      card.title = `${hero ? hero.name : 'Héroe'} ya fue elegido`;
      // Quita el comportamiento de clic clonando el nodo (elimina listeners)
      card.parentNode.replaceChild(card.cloneNode(true), card);
    }
  });

  // Si el héroe que YO tenía seleccionado lo acaba de tomar otra persona
  if (selectedHero && taken.includes(selectedHero)) {
    selectedHero = null;
    document.getElementById('field-hero').value = '';
    const he = document.getElementById('error-hero');
    he.textContent = 'Ese superhéroe acaba de ser elegido por otra persona. Elige otro. 🦸';
    he.style.display = 'block';
    showToast('Un héroe que tenías seleccionado ya fue tomado', 'error');
  }
}

function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle.addEventListener('click', () => menu.classList.toggle('show'));
}

// ─── Populate Hero Grid ───
let selectedHero = null;

async function populateHeroGrid() {
  const grid = document.getElementById('hero-grid');
  grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color: var(--text-muted); padding: 1rem;">Cargando héroes disponibles… ⏳</div>';

  let takenHeroes = [];
  try {
    takenHeroes = await getTakenHeroes();
  } catch (e) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color: var(--comic-red); padding: 1rem;">No se pudo cargar la lista. Revisa tu conexión y recarga la página.</div>';
    return;
  }
  grid.innerHTML = '';

  let currentUniverse = '';

  HEROES.forEach(hero => {
    // Add universe divider
    if (hero.universe !== currentUniverse) {
      currentUniverse = hero.universe;
      const divider = document.createElement('div');
      divider.className = 'universe-divider';
      divider.textContent = `${hero.universe === 'Marvel' ? '🔴' : '🔵'} ${hero.universe}`;
      grid.appendChild(divider);
    }

    const card = document.createElement('div');
    card.className = 'hero-card';
    card.dataset.heroId = hero.id;

    const isTaken = takenHeroes.includes(hero.id);
    if (isTaken) {
      card.classList.add('hero-taken');
      card.title = `${hero.name} ya fue elegido`;
    }

    card.innerHTML = `
      <span class="hero-card-emoji">${hero.emoji}</span>
      <div class="hero-card-name">${hero.name}</div>
      <div class="hero-card-universe">${hero.universe}</div>
    `;

    if (!isTaken) {
      card.addEventListener('click', () => selectHero(hero.id, card));
    }

    grid.appendChild(card);
  });
}

function selectHero(heroId, cardElement) {
  // Deselect previous
  const prev = document.querySelector('.hero-card.hero-selected');
  if (prev) prev.classList.remove('hero-selected');

  // Select new
  cardElement.classList.add('hero-selected');
  selectedHero = heroId;
  document.getElementById('field-hero').value = heroId;

  // Clear error
  document.getElementById('error-hero').style.display = 'none';
}

// ─── Populate Preferences ───
function populatePreferences() {
  const grid = document.getElementById('prefs-grid');

  PREFERENCE_OPTIONS.forEach(pref => {
    const label = document.createElement('label');
    label.className = 'pref-checkbox';
    label.innerHTML = `
      <input type="checkbox" name="preferences" value="${pref.id}">
      <span class="checkbox-visual"></span>
      <span class="pref-label">${pref.label}</span>
    `;
    grid.appendChild(label);
  });
}

// ─── Form Validation & Submission ───
function setupFormSubmission() {
  const form = document.getElementById('register-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear all errors
    document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
    document.getElementById('error-hero').style.display = 'none';
    document.getElementById('error-costume').style.display = 'none';
    document.getElementById('error-endulzada').style.display = 'none';
    document.getElementById('error-celular').textContent = 'Ingresa un número de celular válido';

    let isValid = true;

    // Validate celular
    const celularRaw = document.getElementById('field-celular').value.trim();
    const cleanCelular = validateCelular(celularRaw);
    if (!cleanCelular || cleanCelular.length < 7 || cleanCelular.length > 15) {
      document.getElementById('group-celular').classList.add('has-error');
      isValid = false;
    }

    // Validate name
    const name = sanitizeInput(document.getElementById('field-name').value);
    if (!name || name.length < 2) {
      document.getElementById('group-name').classList.add('has-error');
      isValid = false;
    }

    // Validate cargo
    const cargo = sanitizeInput(document.getElementById('field-cargo').value);
    if (!cargo) {
      document.getElementById('group-cargo').classList.add('has-error');
      isValid = false;
    }

    // Validate hero selection (la unicidad definitiva la valida la base de datos al guardar)
    document.getElementById('error-hero').textContent = 'Debes seleccionar un superhéroe';
    if (!selectedHero || !isValidHeroId(selectedHero)) {
      document.getElementById('error-hero').style.display = 'block';
      isValid = false;
    }

    // Validate gifts
    const gift1 = sanitizeInput(document.getElementById('field-gift1').value);
    const gift2 = sanitizeInput(document.getElementById('field-gift2').value);
    const gift3 = sanitizeInput(document.getElementById('field-gift3').value);
    if (!gift1) { document.getElementById('group-gift1').classList.add('has-error'); isValid = false; }
    if (!gift2) { document.getElementById('group-gift2').classList.add('has-error'); isValid = false; }
    if (!gift3) { document.getElementById('group-gift3').classList.add('has-error'); isValid = false; }

    // Validate endulzada preference
    const endulzadaRadio = document.querySelector('input[name="endulzada"]:checked');
    if (!endulzadaRadio) {
      document.getElementById('error-endulzada').style.display = 'block';
      isValid = false;
    }

    // If "Otros" is chosen, the detail field is required
    const endulzadaOtros = sanitizeInput(document.getElementById('field-endulzada-otros').value);
    if (endulzadaRadio && endulzadaRadio.value === 'otros' && !endulzadaOtros) {
      document.getElementById('group-endulzada-otros').classList.add('has-error');
      isValid = false;
    }

    // Validate costume radio
    const costumeRadio = document.querySelector('input[name="costume"]:checked');
    if (!costumeRadio) {
      document.getElementById('error-costume').style.display = 'block';
      isValid = false;
    }

    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector('.has-error, .form-error[style*="block"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Collect preferences (solo IDs válidos)
    const preferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked'))
      .map(cb => cb.value)
      .filter(id => PREFERENCE_OPTIONS.some(opt => opt.id === id));

    // Build participant object
    const participant = {
      celular: cleanCelular,
      name: name,
      cargo: cargo,
      hero: selectedHero,
      gifts: [gift1, gift2, gift3],
      noGift: sanitizeInput(document.getElementById('field-no-gift').value),
      preferences: preferences,
      endulzada: endulzadaRadio.value,
      endulzadaOtros: endulzadaOtros,
      alergias: sanitizeInput(document.getElementById('field-alergias').value),
      costume: costumeRadio.value === 'yes'
    };

    // Save — la base de datos garantiza que el héroe y el celular no se dupliquen,
    // incluso si dos personas envían al mismo tiempo.
    const btn = document.getElementById('btn-submit');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Guardando...';

    try {
      await addParticipant(participant);
      showComicSplash();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = originalText;

      if (err.code === 'HERO_TAKEN') {
        // Alguien tomó el héroe primero: refrescamos la grilla y avisamos
        selectedHero = null;
        document.getElementById('field-hero').value = '';
        await populateHeroGrid();
        const heroErr = document.getElementById('error-hero');
        heroErr.textContent = '¡Ese superhéroe acaba de ser tomado! Por favor elige otro. 🦸';
        heroErr.style.display = 'block';
        heroErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Ese héroe ya fue elegido, escoge otro', 'error');
      } else if (err.code === 'CELULAR_TAKEN') {
        const g = document.getElementById('group-celular');
        g.classList.add('has-error');
        document.getElementById('error-celular').textContent = 'Este celular ya está registrado';
        g.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Este celular ya está registrado', 'error');
      } else {
        showToast(err.message || 'No se pudo guardar. Intenta de nuevo.', 'error');
      }
    }
  });
}

// ─── Success Splash Animation ───
function showComicSplash() {
  const heroData = getHeroById(selectedHero);
  const overlay = document.createElement('div');
  overlay.className = 'comic-splash-overlay';
  overlay.innerHTML = `
    <div class="comic-splash-text">¡POW!</div>
    <div class="comic-splash-sub">
      ${heroData ? heroData.emoji : '🦸'} ¡Te has unido a la liga como <strong>${heroData ? heroData.name : 'un héroe'}</strong>! ${heroData ? heroData.emoji : '🦸'}
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 3000);
}
