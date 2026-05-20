import { api } from '../services/api.js';
import { navigate } from '../services/router.js';
import { showToast } from '../services/ui.js';

export function renderResetPassword(container, params) {
  const token = params?.token;

  if (!token) {
    container.innerHTML = `
      <div class="auth-layout">
        <div class="auth-card card">
          <h1 class="auth-title">Geçersiz Bağlantı</h1>
          <p class="muted">Sıfırlama bağlantısı eksik veya hatalı.</p>
          <p class="auth-footer"><a href="#/forgot-password">Yeni bağlantı iste</a></p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="auth-layout">
      <div class="auth-card card">
        <h1 class="auth-title">Yeni Şifre</h1>
        <p class="auth-subtitle">Yeni şifrenizi belirleyin (en az 6 karakter)</p>
        <form id="reset-form" class="form" novalidate>
          <div class="form-group">
            <label for="password">Yeni şifre</label>
            <input type="password" id="password" name="password" required minlength="6" autocomplete="new-password" />
            <span class="field-error" id="password-error"></span>
          </div>
          <div class="form-group">
            <label for="password2">Yeni şifre (tekrar)</label>
            <input type="password" id="password2" name="password2" required minlength="6" autocomplete="new-password" />
            <span class="field-error" id="password2-error"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Şifreyi Güncelle</button>
        </form>
        <p class="auth-footer"><a href="#/login">← Giriş yap</a></p>
      </div>
    </div>
  `;

  document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    let valid = true;
    if (!password || password.length < 6) {
      setError('password-error', 'Şifre en az 6 karakter olmalı');
      valid = false;
    }
    if (password !== password2) {
      setError('password2-error', 'Şifreler eşleşmiyor');
      valid = false;
    }
    if (!valid) return;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await api.resetPassword(token, password);
      showToast('Şifreniz güncellendi', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
}
