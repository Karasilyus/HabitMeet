import { api } from '../services/api.js';
import { navigate } from '../services/router.js';
import { showToast } from '../services/ui.js';

export async function renderRegister(container) {
  container.innerHTML = `
    <div class="auth-layout">
      <div class="auth-card card">
        <h1 class="auth-title">Kayıt Ol</h1>
        <p class="auth-subtitle">HabitMeet topluluğuna katıl</p>
        <form id="register-form" class="form" novalidate>
          <div class="form-group">
            <label for="name">Ad Soyad</label>
            <input type="text" id="name" name="name" required minlength="2" />
            <span class="field-error" id="name-error"></span>
          </div>
          <div class="form-group">
            <label for="email">E-posta</label>
            <input type="email" id="email" name="email" required />
            <span class="field-error" id="email-error"></span>
          </div>
          <div class="form-group">
            <label for="password">Şifre</label>
            <input type="password" id="password" name="password" required minlength="6" />
            <span class="field-error" id="password-error"></span>
          </div>
          <div class="form-group">
            <label for="neighborhood">Semt</label>
            <select id="neighborhood" name="neighborhood" required>
              <option value="">Semt seçin...</option>
            </select>
            <span class="field-error" id="neighborhood-error"></span>
          </div>
          <div class="form-group hidden" id="nearby-group">
            <label for="nearby-detail">Yakın semt / mahalle adı</label>
            <input type="text" id="nearby-detail" placeholder="Örn: Moda, Fenerbahçe..." />
            <span class="field-error" id="nearby-error"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Kayıt Ol</button>
        </form>
        <p class="auth-footer">Zaten hesabın var mı? <a href="#/login">Giriş yap</a></p>
      </div>
    </div>
  `;

  let nearbyOption = 'Yakın semt';
  const select = document.getElementById('neighborhood');
  try {
    const { neighborhoods, nearbyOption: opt } = await api.getNeighborhoods();
    nearbyOption = opt;
    neighborhoods.forEach((n) => {
      const o = document.createElement('option');
      o.value = n;
      o.textContent = n;
      select.appendChild(o);
    });
  } catch {
    showToast('Semt listesi yüklenemedi. Yakın semt seçeneğiyle devam edebilirsiniz.', 'error');
  }

  const near = document.createElement('option');
  near.value = nearbyOption;
  near.textContent = nearbyOption;
  select.appendChild(near);

  const nearbyGroup = document.getElementById('nearby-group');
  select.addEventListener('change', () => {
    if (select.value === nearbyOption) {
      nearbyGroup.classList.remove('hidden');
    } else {
      nearbyGroup.classList.add('hidden');
    }
  });

  const form = document.getElementById('register-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const neighborhood = select.value;
    const neighborhoodDetail = document.getElementById('nearby-detail').value.trim();

    let valid = true;
    if (!name || name.length < 2) {
      setError('name-error', 'Ad en az 2 karakter olmalı');
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email-error', 'Geçerli bir e-posta girin');
      valid = false;
    }
    if (!password || password.length < 6) {
      setError('password-error', 'Şifre en az 6 karakter olmalı');
      valid = false;
    }
    if (!neighborhood) {
      setError('neighborhood-error', 'Semt seçin');
      valid = false;
    }
    if (neighborhood === nearbyOption && neighborhoodDetail.length < 2) {
      setError('nearby-error', 'Yakın semt adını yazın');
      valid = false;
    }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const { user, token } = await api.register({
        name,
        email,
        password,
        neighborhood,
        neighborhoodDetail,
      });
      api.setToken(token);
      api.setUser(user);
      showToast('Kayıt başarılı!', 'success');
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
