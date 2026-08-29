// ============================================================
// RESULTS.JS — Consulta de resultados del amigo secreto
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  setupSearch();
});

function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle.addEventListener('click', () => menu.classList.toggle('show'));
}

function setupSearch() {
  const btnSearch = document.getElementById('btn-search');
  const celularInput = document.getElementById('field-search-celular');

  btnSearch.addEventListener('click', () => searchResult());
  celularInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchResult();
  });
}

async function searchResult() {
  const celular = document.getElementById('field-search-celular').value.trim();
  const cleanCelular = validateCelular(celular);

  // Clear errors
  document.getElementById('group-search-celular').classList.remove('has-error');
  document.getElementById('error-search').textContent = 'No encontramos ese celular. Verifica que sea el mismo con el que te inscribiste.';

  if (!cleanCelular || cleanCelular.length < 7) {
    document.getElementById('group-search-celular').classList.add('has-error');
    document.getElementById('error-search').textContent = 'Ingresa un número de celular válido';
    return;
  }

  // Check if draw has been done
  const btn = document.getElementById('btn-search');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = '🔮 Consultando...';

  let drawData;
  try {
    drawData = await getDrawResults();
  } catch (e) {
    btn.disabled = false;
    btn.textContent = original;
    showToast('No se pudo conectar. Revisa tu conexión e intenta de nuevo.', 'error');
    return;
  }
  btn.disabled = false;
  btn.textContent = original;

  if (!drawData) {
    document.getElementById('search-section').style.display = 'none';
    document.getElementById('no-draw-section').style.display = 'block';
    return;
  }

  // Find assignment for this celular
  const assignment = drawData.results.find(r =>
    (r.giverCelular || '').replace(/\D/g, '') === cleanCelular
  );

  if (!assignment) {
    document.getElementById('group-search-celular').classList.add('has-error');
    return;
  }

  // Show result!
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
            <div class="result-section-title">👕 ¿Llevará accesorio?</div>
            <span class="result-costume-badge ${assignment.receiverCostume ? 'yes' : 'no'}">
              ${assignment.receiverCostume ? '✅ ¡Sí! Irá con un elemento de su héroe' : '❌ No se comprometió'}
            </span>
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
