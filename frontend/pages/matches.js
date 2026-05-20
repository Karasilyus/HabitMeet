import { api } from '../services/api.js';
import { escapeHtml } from '../services/ui.js';

export async function renderMatches(container) {
  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>Eşleşmelerim</h1>
        <p class="muted">Aynı semtte, aynı kategoride 7+ gün seri yapan kullanıcılar</p>
      </div>
      <div id="matches-list" class="matches-list"></div>
    </div>
  `;

  const list = document.getElementById('matches-list');
  list.innerHTML = '<p class="muted">Yükleniyor...</p>';

  try {
    const { matches } = await api.getMatches();
    if (!matches.length) {
      list.innerHTML =
        '<div class="card empty-state"><p>Henüz eşleşme yok. Alışkanlıklarını 7 gün üst üste tamamla!</p></div>';
      return;
    }

    list.innerHTML = matches
      .map(
        (m) => `
      <div class="card match-card">
        <div class="match-info">
          <h3>${escapeHtml(m.partner_name)}</h3>
          <p class="muted">${escapeHtml(m.habit_name || 'Hedef')}</p>
          <span class="badge badge-match">Eşleşme #${m.id}</span>
        </div>
        <div class="match-actions">
          <a href="#/messages?matchId=${m.id}" class="btn btn-primary btn-sm">Mesajlaş</a>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    list.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}
