// ============================================================
// RESULTS.JS — Consulta de resultados del amigo secreto
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  checkDrawAndInit();
});

function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle.addEventListener('click', () => menu.classList.toggle('show'));
}

// Al cargar la página decidimos qué mostrar:
//   - Si el sorteo NO se ha realizado → pantalla de "aún no hay sorteo".
//   - Si ya se realizó → formulario de verificación (celular + PIN).
async function checkDrawAndInit() {
  const loading = document.getElementById('loading-section');
  const search = document.getElementById('search-section');
  const noDraw = document.getElementById('no-draw-section');

  let done;
  try {
    done = await isDrawDone();
  } catch (e) {
    // Si no se puede consultar, dejamos que intente con el formulario.
    loading.style.display = 'none';
    search.style.display = 'block';
    setupSearch();
    showToast('No se pudo verificar el estado del sorteo. Intenta consultar directamente.', 'error');
    return;
  }

  loading.style.display = 'none';

  if (!done) {
    noDraw.style.display = 'block';
    return;
  }

  search.style.display = 'block';
  setupSearch();
}

function setupSearch() {
  const btnSearch = document.getElementById('btn-search');
  const celularInput = document.getElementById('field-search-celular');
  const pinInput = document.getElementById('field-search-pin');

  btnSearch.addEventListener('click', () => searchResult());
  const onEnter = (e) => { if (e.key === 'Enter') searchResult(); };
  celularInput.addEventListener('keydown', onEnter);
  pinInput.addEventListener('keydown', onEnter);
  // El PIN solo admite dígitos
  pinInput.addEventListener('input', () => {
    pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 4);
  });
}

async function searchResult() {
  const celular = document.getElementById('field-search-celular').value.trim();
  const pin = document.getElementById('field-search-pin').value.trim();
  const cleanCelular = validateCelular(celular);
  const cleanPin = (pin || '').replace(/\D/g, '');

  // Clear errors
  document.getElementById('group-search-celular').classList.remove('has-error');
  document.getElementById('group-search-pin').classList.remove('has-error');
  document.getElementById('error-search').textContent = 'Celular o PIN incorrectos. Verifica los datos con los que te inscribiste.';

  let hasError = false;
  if (!cleanCelular || cleanCelular.length < 7) {
    document.getElementById('group-search-celular').classList.add('has-error');
    hasError = true;
  }
  if (cleanPin.length !== 4) {
    document.getElementById('group-search-pin').classList.add('has-error');
    hasError = true;
  }
  if (hasError) {
    if (cleanPin.length !== 4) {
      document.getElementById('error-search').textContent = 'Ingresa tu celular y un PIN de 4 dígitos.';
    }
    return;
  }

  const btn = document.getElementById('btn-search');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = '🔮 Consultando...';

  let assignment;
  try {
    assignment = await getMyResult(cleanCelular, cleanPin);
  } catch (e) {
    btn.disabled = false;
    btn.textContent = original;
    if (e.code === 'BAD_AUTH') {
      document.getElementById('group-search-pin').classList.add('has-error');
      document.getElementById('error-search').textContent = 'Celular o PIN incorrectos. Verifica los datos con los que te inscribiste.';
      showToast('Celular o PIN incorrectos', 'error');
    } else {
      showToast('No se pudo conectar. Revisa tu conexión e intenta de nuevo.', 'error');
    }
    return;
  }
  btn.disabled = false;
  btn.textContent = original;

  // Sin sorteo (caso borde: se limpió entre la carga y la consulta)
  if (!assignment) {
    document.getElementById('search-section').style.display = 'none';
    document.getElementById('no-draw-section').style.display = 'block';
    return;
  }

  // ¡Mostrar resultado!
  showResult(assignment);
}

function showResult(assignment) {
  const searchSection = document.getElementById('search-section');
  const resultSection = document.getElementById('result-section');

  // Fade out search
  searchSection.style.opacity = '0';
  searchSection.style.transition = 'opacity 0.4s ease-out';

  setTimeout(() => {
    searchSection.style.display = 'none';

    const hero = getHeroById(assignment.receiverHero);
    const preferences = assignment.receiverPreferences || [];
    const prefLabels = preferences.map(prefId => {
      const found = PREFERENCE_OPTIONS.find(p => p.id === prefId);
      return found ? found.label : prefId;
    });

    let html = `
      <div class="result-card">
        <div class="result-card-header" style="background: linear-gradient(135deg, ${hero ? hero.color : '#6C2EB9'} 0%, ${hero ? hero.color + '99' : '#1A237E'} 100%);">
          <span class="result-hero-emoji">${hero ? hero.emoji : '🦸'}</span>
          <div class="result-hero-name">${hero ? hero.name : 'Superhéroe'}</div>
          <div class="result-hero-universe">${hero ? hero.universe : ''}</div>
        </div>

        <div class="result-card-body">
          <div class="result-section">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <p style="color: var(--text-secondary); font-size: 0.9rem;">Tu amigo secreto escogió este superhéroe <strong>solo para mantener el secreto</strong>.<br>El regalo <strong>no tiene que ser de la temática</strong>: guíate por sus opciones y gustos. 🎁</p>
            </div>
          </div>

          ${hero && hero.desc ? `
          <div class="result-section">
            <div class="result-section-title">${hero.emoji} Sobre ${escapeHtml(hero.name)}</div>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">${escapeHtml(hero.desc)}</p>
          </div>
          ` : ''}

          <div class="result-section">
            <div class="result-section-title">🎁 Opciones de Regalo</div>
            <ul class="result-gift-list">
              ${assignment.receiverGifts.map((gift, i) => `
                <li class="result-gift-item">
                  <span class="result-gift-number">${i + 1}</span>
                  <span>${escapeHtml(gift)}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          ${assignment.receiverNoGift ? `
          <div class="result-section">
            <div class="result-section-title">🚫 No quiere recibir</div>
            <div class="result-no-gift">${escapeHtml(assignment.receiverNoGift)}</div>
          </div>
          ` : ''}

          ${prefLabels.length > 0 ? `
          <div class="result-section">
            <div class="result-section-title">🍫 Preferencias</div>
            <div class="result-tags">
              ${prefLabels.map(label => `<span class="result-tag">${escapeHtml(label)}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          <div class="result-section">
            <div class="result-section-title">🍬 Endulzada (prefiere)</div>
            <div class="result-tags">
              <span class="result-tag">${escapeHtml(endulzadaDisplay(assignment.receiverEndulzada, assignment.receiverEndulzadaOtros))}</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">
              Los dos primeros viernes déjale un detalle así en la <strong>caja de la cafetería</strong>.
            </p>
          </div>

          <div class="result-section">
            <div class="result-section-title">🚑 Alergias</div>
            <div class="result-no-gift" style="${assignment.receiverAlergias ? 'background: rgba(226, 54, 54, 0.12); border-color: rgba(226, 54, 54, 0.4);' : ''}">
              ${assignment.receiverAlergias ? '⚠️ ' + escapeHtml(assignment.receiverAlergias) : 'No reportó alergias 👍'}
            </div>
          </div>

          <div class="result-section">
            <div class="result-budget">
              <div class="result-budget-amount">${APP_CONFIG.BUDGET}</div>
              <div class="result-budget-label">Presupuesto máximo del regalo</div>
            </div>
          </div>

          <div class="result-section">
            <div class="result-section-title">📅 Fechas importantes</div>
            <ul class="result-gift-list">
              <li class="result-gift-item">
                <span class="result-gift-number">🍬</span>
                <span>Viernes 4 y 11 de sept — <strong>endulzadas</strong>: deja un detalle dulce o salado en la caja de la cafetería.</span>
              </li>
              <li class="result-gift-item">
                <span class="result-gift-number">🎁</span>
                <span>Viernes 18 de sept, <strong>2:00 p. m.</strong> en la cafetería — <strong>entrega de regalos</strong>.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 2rem;">
        <button class="btn btn-outline" id="btn-back">
          ← Volver a buscar
        </button>
      </div>
    `;

    resultSection.innerHTML = html;
    resultSection.style.display = 'block';

    // Back button
    document.getElementById('btn-back').addEventListener('click', () => {
      resultSection.style.display = 'none';
      searchSection.style.display = 'block';
      searchSection.style.opacity = '1';
    });

  }, 400);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
