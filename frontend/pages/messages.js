import { api } from '../services/api.js';
import { showToast, escapeHtml } from '../services/ui.js';
export async function renderMessages(container, params) {
  const matchId = params?.matchId;

  if (!matchId) {
    container.innerHTML = '<div class="card"><p>Eşleşme seçilmedi. <a href="#/matches">Eşleşmelere dön</a></p></div>';
    return;
  }

  container.innerHTML = `
    <div class="page messages-page">
      <div class="page-header">
        <a href="#/matches" class="back-link">← Eşleşmeler</a>
        <h1>Mesajlar</h1>
      </div>
      <div id="messages-container" class="messages-container card">
        <div id="messages-list" class="messages-list"></div>
        <form id="message-form" class="message-form">
          <input type="text" id="message-input" placeholder="Mesajınızı yazın..." maxlength="2000" required />
          <button type="submit" class="btn btn-primary">Gönder</button>
        </form>
      </div>
    </div>
  `;

  await loadMessages(matchId);

  document.getElementById('message-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const body = input.value.trim();
    if (!body) return;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await api.sendMessage(matchId, body);
      input.value = '';
      await loadMessages(matchId);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

async function loadMessages(matchId) {
  const list = document.getElementById('messages-list');
  const user = api.getUser();

  list.innerHTML = '<p class="muted">Yükleniyor...</p>';
  try {
    const { messages } = await api.getMessages(matchId);
    if (!messages.length) {
      list.innerHTML = '<p class="muted messages-empty">Henüz mesaj yok. İlk mesajı sen gönder!</p>';
      return;
    }
    list.innerHTML = messages
      .map((m) => {
        const isMine = user && m.sender_id === user.id;
        return `
        <div class="message-bubble ${isMine ? 'mine' : 'theirs'}">
          <span class="message-sender">${escapeHtml(m.sender_name)}</span>
          <p>${escapeHtml(m.body)}</p>
          <time class="message-time">${new Date(m.created_at).toLocaleString('tr-TR')}</time>
        </div>
      `;
      })
      .join('');
    list.scrollTop = list.scrollHeight;
  } catch (err) {
    list.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}
