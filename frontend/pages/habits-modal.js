import { api } from '../services/api.js';
import { showToast, escapeHtml } from '../services/ui.js';
import { openReportModal } from './report-modal.js';

export async function openHabitModal(habit, { onSaved, onClose, defaultTypeId } = {}) {
  const modal = document.getElementById('habit-modal');
  const isEdit = habit && habit.id;
  modal.classList.remove('hidden');

  let types = [];
  try {
    const res = await api.getActivityTypes();
    types = res.types || [];
  } catch {
    showToast('Tür listesi yüklenemedi', 'error');
  }

  const selectedTypeId = isEdit ? habit.type_id : defaultTypeId;
  const optionsHtml = types
    .map(
      (t) =>
        `<option value="${t.id}" ${selectedTypeId === t.id ? 'selected' : ''}>${escapeHtml(t.name)} (${t.usage_count || 0})</option>`
    )
    .join('');

  modal.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop"></div>
    <div class="modal-content card">
      <h2>${isEdit ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite Seç'}</h2>
      <form id="habit-form" class="form">
        <div class="form-group" id="existing-type-group">
          <label for="habit-type-id">Aktivite Türü</label>
          <div class="type-report-row">
            <select id="habit-type-id">
              <option value="">Aktivite seçin...</option>
              ${optionsHtml}
            </select>
            <button type="button" id="report-activity-btn" class="btn btn-ghost btn-sm">Aktiviteyi Bildir</button>
          </div>
          <span class="field-error" id="type-error"></span>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="cancel-habit">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Kaydet' : 'Ekle'}</button>
        </div>
      </form>
    </div>
  `;

  const close = () => {
    modal.classList.add('hidden');
    modal.innerHTML = '';
    onClose?.();
  };

  document.getElementById('modal-backdrop').addEventListener('click', close);
  document.getElementById('cancel-habit').addEventListener('click', close);

  const typeSelect = document.getElementById('habit-type-id');
  const reportBtn = document.getElementById('report-activity-btn');

  function updateReportButton() {
    reportBtn.disabled = !typeSelect.value;
  }

  reportBtn.addEventListener('click', () => {
    const selectedTypeId = parseInt(typeSelect.value, 10);
    const type = types.find((t) => t.id === selectedTypeId);
    if (!type) {
      showToast('Önce bir aktivite seçin', 'error');
      return;
    }
    openReportModal(document.getElementById('type-modal'), {
      type: 'activity',
      id: selectedTypeId,
      name: type.name,
    });
  });

  typeSelect.addEventListener('change', updateReportButton);
  updateReportButton();

  document.getElementById('habit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('type-error').textContent = '';

    const typeId = document.getElementById('habit-type-id').value;
    if (!typeId) {
      document.getElementById('type-error').textContent = 'Bir aktivite seçmelisiniz';
      return;
    }
    
    const payload = { type_id: parseInt(typeId, 10) };

    try {
      if (isEdit) {
        await api.updateHabit(habit.id, payload);
        showToast('Güncellendi', 'success');
      } else {
        await api.createHabit(payload);
        showToast('Eklendi', 'success');
      }
      close();
      await onSaved?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
