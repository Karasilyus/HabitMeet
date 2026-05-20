import { api } from '../services/api.js';
import { showToast, escapeHtml } from '../services/ui.js';
import { openHabitModal } from './habits-modal.js';

const TABLE_DAYS = 14;
let chartInstances = [];
let sleepChartInstance = null;

export async function renderHabits(container) {
  container.innerHTML = `
    <div class="page habits-dashboard">
      <div class="page-header">
        <div>
          <h1>Hedeflerim</h1>
          <p class="muted">Hücreye tıklayarak işaretle</p>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button id="create-type-btn" class="btn btn-ghost">Yeni Aktivite Üret</button>
          <button id="add-habit-btn" class="btn btn-primary">+ Aktivite Ekle</button>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="table-panel card">
          <div class="table-scroll">
            <table class="habits-table" id="habits-table">
              <thead id="habits-thead"></thead>
              <tbody id="habits-tbody"></tbody>
            </table>
          </div>
          <p id="table-empty" class="muted hidden">Henüz hedef yok. İlk aktivitenizi ekleyin.</p>
        </div>

        <div class="charts-panel">
          <div class="chart-card card">
            <h3>Günlük</h3>
            <canvas id="chart-daily"></canvas>
            <p class="chart-value" id="val-daily">0%</p>
          </div>
          <div class="chart-card card">
            <h3>Haftalık</h3>
            <canvas id="chart-weekly"></canvas>
            <p class="chart-value" id="val-weekly">0%</p>
          </div>
          <div class="chart-card card">
            <h3>Genel</h3>
            <canvas id="chart-overall"></canvas>
            <p class="chart-value" id="val-overall">0%</p>
          </div>
        </div>
      </div>

      <section class="sleep-section card">
        <div class="sleep-header">
          <h2>Uyku Takibi</h2>
          <form id="sleep-form" class="sleep-form">
            <input type="date" id="sleep-date" required />
            <input type="number" id="sleep-hours" min="0" max="24" step="0.5" placeholder="Saat" required />
            <button type="submit" class="btn btn-primary btn-sm">Kaydet</button>
          </form>
        </div>
        <div class="sleep-chart-wrap">
          <canvas id="chart-sleep"></canvas>
        </div>
      </section>

      <div id="habit-modal" class="modal hidden"></div>
      <div id="type-modal" class="modal hidden"></div>
    </div>
  `;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('sleep-date').value = today;

  document.getElementById('add-habit-btn').addEventListener('click', () =>
    openHabitModal(null, { onSaved: refreshDashboard })
  );
  
  document.getElementById('create-type-btn').addEventListener('click', () => {
    openTypeModal();
  });

  document.getElementById('sleep-form').addEventListener('submit', onSleepSubmit);

  await refreshDashboard();
}

function openTypeModal() {
  const modal = document.getElementById('type-modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <div class="modal-backdrop" id="type-backdrop"></div>
    <div class="modal-content card">
      <h2>Yeni Aktivite Türü Üret</h2>
      <form id="type-form" class="form">
        <div class="form-group">
          <label for="type-name">Aktivite türü adı</label>
          <input type="text" id="type-name" placeholder="Örn: Yoga, Meditasyon" required minlength="2" />
          <span class="field-error" id="type-name-error"></span>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="cancel-type">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('type-backdrop').addEventListener('click', closeTypeModal);
  document.getElementById('cancel-type').addEventListener('click', closeTypeModal);
  document.getElementById('type-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('type-name');
    const error = document.getElementById('type-name-error');
    const name = input.value.trim();
    error.textContent = '';

    if (name.length < 2) {
      error.textContent = 'En az 2 karakter girin';
      return;
    }

    try {
      await api.createActivityType(name);
      showToast('Aktivite türü üretildi ve herkese açıldı!', 'success');
      closeTypeModal();
      await refreshDashboard();
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

function closeTypeModal() {
  const modal = document.getElementById('type-modal');
  modal.classList.add('hidden');
  modal.innerHTML = '';
}

async function refreshDashboard() {
  destroyCharts();
  try {
    const [habitData, sleepData] = await Promise.all([
      api.getHabits(TABLE_DAYS),
      api.getSleep(TABLE_DAYS),
    ]);
    renderTable({
      habits: habitData.habits,
      dates: habitData.dates,
      stats: habitData.stats,
    });
    renderCompletionCharts(habitData.stats);
    renderSleepChart(sleepData);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.toLocaleDateString('tr-TR', { weekday: 'short' });
  const num = d.getDate();
  return `${day}<br><small>${num}</small>`;
}

function renderTable({ habits, dates, stats }) {
  const thead = document.getElementById('habits-thead');
  const tbody = document.getElementById('habits-tbody');
  const empty = document.getElementById('table-empty');
  const today = dates[dates.length - 1];

  if (!habits || !habits.length) {
    thead.innerHTML = '';
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  thead.innerHTML = `
    <tr>
      <th class="col-goal">Hedef</th>
      ${dates.map((d) => `<th class="col-day${d === today ? ' today' : ''}">${formatDayLabel(d)}</th>`).join('')}
      <th class="col-actions">İşlemler</th>
    </tr>
  `;

  let rowsHtml = '';

  for (const habit of habits) {
    const cells = dates
      .map((d) => {
        const done = habit.logs[d];
        return `<td class="cell-day${d === today ? ' today' : ''}">
          <button type="button" class="cell-btn ${done ? 'done' : ''}" data-habit="${habit.id}" data-date="${d}">${done ? '✓' : ''}</button>
        </td>`;
      })
      .join('');

    const label = escapeHtml(habit.name || habit.type_name || 'Hedef');

    rowsHtml += `
      <tr data-id="${habit.id}" class="habit-row">
        <td class="col-goal">
          <span class="goal-name">${label}</span>
        </td>
        ${cells}
        <td class="col-actions">
          <button type="button" class="btn btn-primary btn-sm btn-done-today" data-id="${habit.id}">Yaptım</button>
          <button type="button" class="btn btn-ghost btn-sm btn-edit" data-id="${habit.id}">Düzenle</button>
          <button type="button" class="btn btn-danger btn-sm btn-delete" data-id="${habit.id}">Sil</button>
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = rowsHtml;

  tbody.querySelectorAll('.cell-btn').forEach((btn) => {
    btn.addEventListener('click', () => toggleCell(btn));
  });

  tbody.querySelectorAll('.btn-done-today').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id, 10);
      try {
        const res = await api.logHabit(id, today, true);
        if (res.newMatches?.length) showToast(`${res.newMatches.length} yeni eşleşme!`, 'success');
        await refreshDashboard();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  tbody.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const habit = habits.find((h) => h.id === parseInt(btn.dataset.id, 10));
      if (habit) openHabitModal(habit, { onSaved: refreshDashboard });
    });
  });

  tbody.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Bu hedefi silmek istediğine emin misin?')) return;
      try {
        await api.deleteHabit(parseInt(btn.dataset.id, 10));
        showToast('Silindi', 'info');
        await refreshDashboard();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  if (stats) {
    document.getElementById('val-daily').textContent = `${stats.daily}%`;
    document.getElementById('val-weekly').textContent = `${stats.weekly}%`;
    document.getElementById('val-overall').textContent = `${stats.overall}%`;
  }
}

async function toggleCell(btn) {
  const habitId = parseInt(btn.dataset.habit, 10);
  const date = btn.dataset.date;
  const wasDone = btn.classList.contains('done');
  btn.disabled = true;
  try {
    const res = await api.logHabit(habitId, date, !wasDone);
    if (res.newMatches?.length) showToast(`${res.newMatches.length} yeni eşleşme!`, 'success');
    await refreshDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

function destroyCharts() {
  chartInstances.forEach((c) => c.destroy());
  chartInstances = [];
  if (sleepChartInstance) {
    sleepChartInstance.destroy();
    sleepChartInstance = null;
  }
}

function renderCompletionCharts(stats) {
  if (!window.Chart || !stats) return;

  const configs = [
    { id: 'chart-daily', value: stats.daily, color: '#3d9cf5' },
    { id: 'chart-weekly', value: stats.weekly, color: '#4ade80' },
    { id: 'chart-overall', value: stats.overall, color: '#fbbf24' },
  ];

  configs.forEach(({ id, value, color }) => {
    const ctx = document.getElementById(id);
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Tamamlanan', 'Kalan'],
        datasets: [
          {
            data: [value, Math.max(0, 100 - value)],
            backgroundColor: [color, '#2d3a4f'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: false } },
        maintainAspectRatio: true,
      },
    });
    chartInstances.push(chart);
  });
}

function renderSleepChart({ dates, logs }) {
  if (!window.Chart) return;

  const labels = dates.map((d) => {
    const x = new Date(d + 'T12:00:00');
    return x.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  });
  const data = dates.map((d) => (logs[d] != null ? logs[d] : null));

  const ctx = document.getElementById('chart-sleep');
  sleepChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Uyku (saat)',
          data,
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.15)',
          fill: true,
          tension: 0.35,
          spanGaps: true,
          pointRadius: 4,
          pointBackgroundColor: '#a78bfa',
        },
      ],
    },
    options: {
      scales: {
        y: { min: 0, max: 12, title: { display: true, text: 'Saat' } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

async function onSleepSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('sleep-date').value;
  const hours = document.getElementById('sleep-hours').value;
  try {
    await api.saveSleep({ date, hours: parseFloat(hours) });
    showToast('Uyku kaydedildi', 'success');
    document.getElementById('sleep-hours').value = '';
    const sleepData = await api.getSleep(TABLE_DAYS);
    if (sleepChartInstance) sleepChartInstance.destroy();
    renderSleepChart(sleepData);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

