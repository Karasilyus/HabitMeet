import { api } from '../services/api.js';
import { navigate } from '../services/router.js';
import { showToast } from '../services/ui.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="auth-layout">
      <div class="auth-card card">
        <h1 class="auth-title">HabitMeet</h1>
        <p class="auth-subtitle">Alışkanlıklarını takip et, komşularınla eşleş</p>
        <form id="login-form" class="form" novalidate>
          <div class="form-group">
            <label for="email">E-posta</label>
            <input type="email" id="email" name="email" required autocomplete="email" />
            <span class="field-error" id="email-error"></span>
          </div>
          <div class="form-group">
            <label for="password">Şifre</label>
            <input type="password" id="password" name="password" required minlength="6" autocomplete="current-password" />
            <span class="field-error" id="password-error"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Giriş Yap</button>
        </form>
        <p class="auth-footer auth-links">
          <a href="#/forgot-password">Şifremi unuttum</a>
          <span class="auth-sep">·</span>
          <span>Hesabın yok mu? <a href="#/register">Kayıt ol</a></span>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = form.email.value.trim();
    const password = form.password.value;

    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email-error', 'Geçerli bir e-posta girin');
      valid = false;
    }
    if (!password || password.length < 6) {
      setError('password-error', 'Şifre en az 6 karakter olmalı');
      valid = false;
    }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const { user, token } = await api.login({ email, password });
      api.setToken(token);
      api.setUser(user);
      showToast('Hoş geldin, ' + user.name + '!', 'success');
      navigate('/habits');
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
