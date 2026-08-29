// ============================================================
// ADMIN.JS — Panel de administración y sorteo
// ============================================================
// SEGURIDAD: Todas las operaciones de admin pasan por funciones
// RPC de PostgreSQL que validan un password del lado del servidor.
// El password NO se almacena en el frontend.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();

  // El panel solo funciona si se activó manualmente en js/config.js
  // (window.ADMIN_ENABLED = true). Si no, se bloquea el acceso aunque
  // alguien escriba la dirección admin.html directamente.
  if (window.ADMIN_ENABLED !== true) {
    showAdminDisabled();
    return;
  }

  setupLogin();
  setupAdminActions();
});

// Muestra un aviso y oculta el panel cuando el admin está desactivado.
function showAdminDisabled() {
  const login = document.getElementById('admin-login-section');
  const panel = document.getElementById('admin-panel');
  if (login) login.style.display = 'none';
  if (panel) panel.style.display = 'none';

  const container = document.querySelector('.page-container');
  if (!container) return;
  const box = document.createElement('div');
  box.className = 'form-section';
  box.style.maxWidth = '500px';
  box.style.margin = '0 auto';
  box.style.textAlign = 'center';
  box.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🔒</div>
      <div class="empty-state-text">
        El panel de administración está desactivado.<br>
        Vuelve al <a href="index.html" style="color: var(--comic-gold);">inicio</a>.
      </div>
    </div>
  `;
  const header = container.querySelector('.page-header');
  if (header && header.nextSibling) container.insertBefore(box, header.nextSibling);
  else container.appendChild(box);
}

function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle.addEventListener('click', () => menu.classList.toggle('show'));
}

// ─── Admin Login (validación server-side) ───
let adminPassword = null; // Se guarda en memoria (sesión actual) tras login exitoso
let loginAttempts = 0;
let loginCooldownUntil = 0;

function setupLogin() {
  const btnLogin = document.getElementById('btn-login');
  const passwordInput = document.getElementById('field-password');

  // Check if already logged in this session
  const savedPwd = sessionStorage.getItem('admin_pwd');
  if (savedPwd) {
    adminPassword = savedPwd;
    showAdminPanel();
  }

  btnLogin.addEventListener('click', () => attemptLogin());
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
  });
}

async function attemptLogin() {
  const now = Date.now();

  // Rate limiting: bloquear después de MAX_LOGIN_ATTEMPTS intentos fallidos
  if (loginCooldownUntil > now) {
    const secsLeft = Math.ceil((loginCooldownUntil - now) / 1000);
    showToast(`Demasiados intentos. Espera ${secsLeft} segundos.`, 'error');
    return;
  }

  const password = document.getElementById('field-password').value;

  if (!password) {
    document.getElementById('group-password').classList.add('has-error');
    return;
  }

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = '🔐 Verificando...';

  try {
    const isValid = await adminLogin(password);
    if (isValid) {
      adminPassword = password;
      sessionStorage.setItem('admin_pwd', password);
      loginAttempts = 0;
      showAdminPanel();
      document.getElementById('group-password').classList.remove('has-error');
    } else {
      loginAttempts++;
      document.getElementById('group-password').classList.add('has-error');

      if (loginAttempts >= APP_CONFIG.MAX_LOGIN_ATTEMPTS) {
        loginCooldownUntil = now + APP_CONFIG.LOGIN_COOLDOWN_MS;
        const secs = APP_CONFIG.LOGIN_COOLDOWN_MS / 1000;
        showToast(`${loginAttempts} intentos fallidos. Bloqueado ${secs}s.`, 'error');
        loginAttempts = 0; // Reset counter for next round
      }
    }
  } catch (e) {
    showToast('No se pudo conectar. Revisa tu conexión.', 'error');
  }

  btn.disabled = false;
  btn.textContent = '🔓 Ingresar';
}

function showAdminPanel() {
  document.getElementById('admin-login-section').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  renderParticipantsList();
  renderDrawResults();
}

// ─── Render Participants (datos obtenidos via RPC con password) ───
async function renderParticipantsList() {
  const container = document.getElementById('participants-list');
  const countEl = document.getElementById('participant-count');

  let participants;
  try {
    participants = await getParticipantsAdmin(adminPassword);
  } catch (e) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">No se pudo conectar con la base de datos.<br>Revisa la conexión o la configuración de Supabase.</div>
      </div>
    `;
    return;
  }

  countEl.textContent = participants.length;

  if (participants.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🦸</div>
        <div class="empty-state-text">Aún no hay participantes inscritos.<br>Comparte el link de inscripción con el equipo.</div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="participants-table-wrapper">
      <table class="participants-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Celular</th>
            <th>Nombre</th>
            <th>Cargo</th>
            <th>Superhéroe</th>
            <th>Regalos</th>
            <th>Endulzada</th>
            <th>Alergias</th>
            <th>Accesorio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
  `;

  participants.forEach((p, i) => {
    const hero = getHeroById(p.hero);
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${formatCelularDisplay(p.celular)}</td>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(p.cargo)}</td>
        <td>
          <span class="hero-cell">
            <span>${hero ? hero.emoji : '🦸'}</span>
            <span>${hero ? hero.name : p.hero}</span>
          </span>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">
          1. ${escapeHtml(p.gifts[0])}<br>
          2. ${escapeHtml(p.gifts[1])}<br>
          3. ${escapeHtml(p.gifts[2])}
        </td>
        <td style="font-size: 0.8rem;">${escapeHtml(endulzadaDisplay(p.endulzada, p.endulzadaOtros))}</td>
        <td style="font-size: 0.8rem;">${p.alergias ? '⚠️ ' + escapeHtml(p.alergias) : '—'}</td>
        <td>${p.costume ? '✅' : '❌'}</td>
        <td>
          <button class="delete-btn" data-id="${p.id}" title="Eliminar participante">🗑️</button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // Attach delete listeners
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      showConfirmModal(
        '🗑️ Eliminar Participante',
        '¿Estás seguro de que deseas eliminar este participante? Esta acción no se puede deshacer.',
        async () => {
          try {
            await removeParticipant(id, adminPassword);
            // Al cambiar los participantes, el sorteo previo deja de ser válido.
            await clearDrawResults(adminPassword);
          } catch (e) {
            showToast(e.message || 'No se pudo eliminar', 'error');
            return;
          }
          showToast('Participante eliminado');
          try {
            await renderParticipantsList();
            await renderDrawResults();
          } catch (e) { /* la vista se actualizará al recargar */ }
        }
      );
    });
  });
}

// ─── Admin Actions ───
function setupAdminActions() {
  // Draw button
  document.getElementById('btn-draw').addEventListener('click', async () => {
    if (!adminPassword) {
      showToast('Sesión expirada. Recarga la página.', 'error');
      return;
    }

    let participants, existing;
    try {
      participants = await getParticipantsAdmin(adminPassword);
      existing = await getDrawResultsAdmin(adminPassword);
    } catch (e) {
      showToast('No se pudo conectar con la base de datos', 'error');
      return;
    }

    if (participants.length < 3) {
      showToast('Se necesitan al menos 3 participantes para el sorteo', 'error');
      return;
    }

    if (existing) {
      showConfirmModal(
        '🎲 Nuevo Sorteo',
        'Ya existe un sorteo previo. ¿Deseas realizar uno nuevo? Los resultados anteriores se perderán.',
        () => runDraw()
      );
    } else {
      showConfirmModal(
        '🎲 Realizar Sorteo',
        `Se realizará el sorteo con ${participants.length} participantes. ¿Continuar?`,
        () => runDraw()
      );
    }
  });

  // Export button
  document.getElementById('btn-export').addEventListener('click', async () => {
    if (!adminPassword) {
      showToast('Sesión expirada. Recarga la página.', 'error');
      return;
    }

    let csv;
    try {
      const participants = await getParticipantsAdmin(adminPassword);
      csv = exportToCSV(participants);
    } catch (e) {
      showToast('No se pudo conectar con la base de datos', 'error');
      return;
    }
    if (!csv) {
      showToast('No hay participantes para exportar', 'error');
      return;
    }

    // Add BOM for UTF-8 in Excel
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'amigo_secreto_participantes.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado correctamente');
  });

  // Reset button
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!adminPassword) {
      showToast('Sesión expirada. Recarga la página.', 'error');
      return;
    }

    showConfirmModal(
      '⚠️ Reiniciar Todo',
      'Se eliminarán TODOS los participantes y resultados del sorteo. Esta acción NO se puede deshacer. ¿Estás seguro?',
      async () => {
        // 1) El reinciio en sí. Si esto falla, avisamos con el error real.
        try {
          await resetAll(adminPassword);
        } catch (e) {
          showToast(e.message || 'No se pudo reiniciar', 'error');
          return;
        }
        // 2) El reinicio funcionó. Refrescar la vista es secundario:
        //    si el refresco falla, NO decimos que el reinicio falló.
        showToast('Todos los datos han sido eliminados');
        try {
          await renderParticipantsList();
          await renderDrawResults();
        } catch (e) { /* la vista se actualizará al recargar */ }
      }
    );
  });
}

// ─── Run Draw ───
function runDraw() {
  // Show animation
  const overlay = document.createElement('div');
  overlay.className = 'draw-animation-overlay';
  overlay.id = 'draw-overlay';

  const heroEmojis = HEROES.map(h => h.emoji);
  let emojiIndex = 0;

  overlay.innerHTML = `
    <div class="draw-spinner" id="draw-spinner">${heroEmojis[0]}</div>
    <div class="draw-text">SORTEANDO...</div>
  `;
  document.body.appendChild(overlay);

  // Animate spinner
  const spinnerEl = document.getElementById('draw-spinner');
  const spinInterval = setInterval(() => {
    emojiIndex = (emojiIndex + 1) % heroEmojis.length;
    spinnerEl.textContent = heroEmojis[emojiIndex];
  }, 100);

  // Perform actual draw after animation
  setTimeout(async () => {
    clearInterval(spinInterval);

    try {
      const results = await performDraw(adminPassword);
      overlay.remove();

      // Show success
      const splash = document.createElement('div');
      splash.className = 'comic-splash-overlay';
      splash.innerHTML = `
        <div class="comic-splash-text">¡BOOM!</div>
        <div class="comic-splash-sub">🎯 Sorteo realizado con éxito — ${results.length} asignaciones hechas</div>
      `;
      document.body.appendChild(splash);

      setTimeout(() => {
        splash.remove();
        renderDrawResults();
      }, 2500);

    } catch (error) {
      overlay.remove();
      showToast(error.message, 'error');
    }
  }, 3000);
}

// ─── Render Draw Results ───
async function renderDrawResults() {
  let drawData;
  try {
    drawData = await getDrawResultsAdmin(adminPassword);
  } catch (e) {
    drawData = null;
  }
  const section = document.getElementById('draw-results-section');

  if (!drawData) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  // Draw date
  const date = new Date(drawData.drawnAt);
  document.getElementById('draw-date').textContent =
    `Sorteo realizado el ${date.toLocaleDateString('es-CO')} a las ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;

  // Build a hero → participant name map for backwards compatibility
  // (older draws may not have receiverName stored)
  let heroToName = {};
  try {
    const participants = await getParticipantsAdmin(adminPassword);
    participants.forEach(p => { heroToName[p.hero] = p.name; });
  } catch (e) { /* proceed without names */ }

  const grid = document.getElementById('draw-results-grid');
  grid.innerHTML = '';

  drawData.results.forEach(result => {
    const giverHero = getHeroById(result.giverHero);
    const receiverHero = getHeroById(result.receiverHero);
    // Use stored name first, fallback to hero→name map
    const receiverRealName = result.receiverName || heroToName[result.receiverHero] || '';

    const item = document.createElement('div');
    item.className = 'draw-result-item';
    item.innerHTML = `
      <div class="draw-person">
        <div class="draw-person-emoji">${giverHero ? giverHero.emoji : '🦸'}</div>
        <div class="draw-person-name">${escapeHtml(result.giverName)}</div>
      </div>
      <div class="draw-arrow">➡️</div>
      <div class="draw-person">
        <div class="draw-person-emoji">${receiverHero ? receiverHero.emoji : '🦸'}</div>
        <div class="draw-person-name">${receiverHero ? receiverHero.name : 'Héroe'}</div>
        ${receiverRealName ? `<div class="draw-person-real-name">👤 ${escapeHtml(receiverRealName)}</div>` : ''}
      </div>
    `;
    grid.appendChild(item);
  });
}

// ─── Confirm Modal ───
function showConfirmModal(title, message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">⚠️</div>
      <div class="modal-title">${escapeHtml(title)}</div>
      <div class="modal-message">${escapeHtml(message)}</div>
      <div class="modal-actions">
        <button class="btn btn-outline btn-sm" id="modal-cancel">Cancelar</button>
        <button class="btn btn-primary btn-sm" id="modal-confirm">Confirmar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('modal-cancel').addEventListener('click', () => overlay.remove());
  document.getElementById('modal-confirm').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ─── Utility ───
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
