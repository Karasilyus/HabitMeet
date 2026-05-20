import { api } from './services/api.js';
import { registerRoute, startRouter, navigate } from './services/router.js';
import { showToast } from './services/ui.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderHabits } from './pages/habits.js';
import { renderMatches } from './pages/matches.js';
import { renderForum } from './pages/forum.js';
import { renderMessages } from './pages/messages.js';
import { renderAdmin } from './pages/admin.js';
import { renderForgotPassword } from './pages/forgot-password.js';
import { renderResetPassword } from './pages/reset-password.js';

const main = document.getElementById('main');
const header = document.getElementById('header');
const nav = document.getElementById('nav');

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

function isAuthenticated() {
  return !!api.getToken();
}

function updateNav(path) {
  if (!isAuthenticated()) {
    header.classList.add('hidden');
    return;
  }
  header.classList.remove('hidden');
  const user = api.getUser();
  const links = [
    { path: '/habits', label: 'Alışkanlıklar' },
    { path: '/matches', label: 'Eşleşmeler' },
    { path: '/forum', label: 'Forum' },
    ...(user && user.isAdmin ? [{ path: '/admin', label: 'Yönetim' }] : []),
  ];
  nav.innerHTML = links
    .map(
      (l) =>
        `<a href="#${l.path}" class="nav-link${path === l.path ? ' active' : ''}">${l.label}</a>`
    )
    .join('');
}

function guard(handler) {
  return (params) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    handler(params);
  };
}

registerRoute('/login', () => {
  if (isAuthenticated()) {
    navigate('/habits');
    return;
  }
  updateNav('/login');
  renderLogin(main);
});

registerRoute('/register', () => {
  if (isAuthenticated()) {
    navigate('/habits');
    return;
  }
  updateNav('/register');
  renderRegister(main);
});

registerRoute('/forgot-password', () => {
  if (isAuthenticated()) {
    navigate('/habits');
    return;
  }
  updateNav('/forgot-password');
  renderForgotPassword(main);
});

registerRoute('/reset-password', (params) => {
  if (isAuthenticated()) {
    navigate('/habits');
    return;
  }
  updateNav('/reset-password');
  renderResetPassword(main, params);
});

registerRoute('/habits', guard((params) => {
  updateNav('/habits');
  renderHabits(main, params);
}));

registerRoute('/matches', guard(() => {
  updateNav('/matches');
  renderMatches(main);
}));

registerRoute('/forum', guard(() => {
  updateNav('/forum');
  renderForum(main);
}));

function adminGuard(handler) {
  return (params) => {
    const user = api.getUser();
    if (!user?.isAdmin) {
      navigate('/habits');
      return;
    }
    handler(params);
  };
}

registerRoute('/admin', adminGuard(() => {
  updateNav('/admin');
  renderAdmin(main);
}));

registerRoute('/messages', guard((params) => {
  updateNav('/matches');
  renderMessages(main, params);
}));

registerRoute('/404', () => {
  main.innerHTML = '<div class="card"><h2>Sayfa bulunamadı</h2><a href="#/habits">Ana sayfaya dön</a></div>';
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  api.clearAuth();
  showToast('Çıkış yapıldı', 'info');
  navigate('/login');
});

startRouter((path) => updateNav(path));

if (!window.location.hash) {
  navigate(isAuthenticated() ? '/habits' : '/login');
}
