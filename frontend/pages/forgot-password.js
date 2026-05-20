import { api } from '../services/api.js';
import { navigate } from '../services/router.js';
import { showToast, escapeHtml } from '../services/ui.js';

export function renderForgotPassword(container) {
  container.innerHTML = `
    <div class="auth-layout">
      <div class="auth-card card">
        <h1 class="auth-title">Şifremi Unuttum</h1>
        <p class="auth-subtitle">Kayıtlı e-posta adresinize sıfırlama bağlantısı gönderilir.</p>
        <form id="forgot-form" class="form" novalidate>
          <div class="form-group">
            <label for="email">E-posta</label>
            <input type="email" id="email" name="email" required autocomplete="email" />
            <span class="field-error" id="email-error"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Bağlantı Gönder</button>
        </form>
        <div id="forgot-success" class="forgot-success hidden"></div>
        <p class="auth-footer">
          <a href="#/login">← Giriş sayfasına dön</a>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById('forgot-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('email-error').textContent = '';

    const email = form.email.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('email-error').textContent = 'Geçerli bir e-posta girin';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const data = await api.forgotPassword(email);
      form.classList.add('hidden');
      const box = document.getElementById('forgot-success');
      box.classList.remove('hidden');

      let html = `<p class="success-text">${escapeHtml(data.message)}</p>`;

      if (data.devResetUrl) {
        html += `
          <div class="dev-reset-box">
            <p class="muted">${escapeHtml(data.devNote || '')}</p>
            <a href="${escapeHtml(data.devResetUrl)}" class="btn btn-primary btn-block dev-reset-link">
              Şifreyi Sıfırla
            </a>
            <p class="dev-url muted"><small>${escapeHtml(data.devResetUrl)}</small></p>
          </div>
        `;
      }

      box.innerHTML = html;
      showToast('Talimatlar gönderildi', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}
