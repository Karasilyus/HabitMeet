import { api } from '../services/api.js';
import { showToast, escapeHtml } from '../services/ui.js';

const REPORT_REASONS = [
  { value: 'uygunsuz_konuşma', label: 'Uygunsuz konuşma' },
  { value: 'spam', label: 'Spam' },
  { value: 'yasadışı_içerik', label: 'Yasadışı içerik' },
  { value: 'sahte_hesap', label: 'Sahte hesap' },
  { value: 'sahtekarlık', label: 'Sahtekarlık' },
  { value: 'diğer', label: 'Diğer' },
];

function getTargetLabel(target) {
  if (target.type === 'post') {
    return `Gönderi: ${escapeHtml(target.name || '')}`;
  }
  if (target.type === 'activity') {
    return `Aktivite: ${escapeHtml(target.name || '')}`;
  }
  if (target.type === 'user') {
    return `Kullanıcı: ${escapeHtml(target.name || '')}`;
  }
  return 'Rapor';
}

export function openReportModal(container, target, { onClosed } = {}) {
  if (!container) return;

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="modal-backdrop" id="report-backdrop"></div>
    <div class="modal-content card">
      <h2>Rapor Gönder</h2>
      <p class="muted">${getTargetLabel(target)}</p>
      <form id="report-form" class="form">
        <div class="form-group">
          <label for="report-reason">Rapor Nedeni</label>
          <select id="report-reason" required>
            <option value="">Neden seçin...</option>
            ${REPORT_REASONS.map((reason) => `<option value="${reason.value}">${reason.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="report-description">Açıklama (İsteğe bağlı)</label>
          <textarea id="report-description" name="description" placeholder="Detaylı açıklama..." maxlength="500"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="cancel-report">İptal</button>
          <button type="submit" class="btn btn-primary">Rapor Gönder</button>
        </div>
      </form>
    </div>
  `;

  const close = () => {
    container.classList.add('hidden');
    container.innerHTML = '';
    onClosed?.();
  };

  document.getElementById('report-backdrop').addEventListener('click', close);
  document.getElementById('cancel-report').addEventListener('click', close);

  document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reason = document.getElementById('report-reason').value;
    const description = document.getElementById('report-description').value.trim();

    if (!reason) {
      showToast('Rapor nedeni seçin', 'error');
      return;
    }

    const payload = { reason, description };
    if (target.type === 'post') payload.reportedPostId = target.id;
    if (target.type === 'activity') payload.reportedActivityId = target.id;
    if (target.type === 'user') payload.reportedUserId = target.id;

    try {
      await api.createReport(payload);
      showToast('Raporunuz gönderildi. İnceleyeceğiz.', 'success');
      close();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
