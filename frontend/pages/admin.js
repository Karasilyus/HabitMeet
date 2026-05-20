import { api } from '../services/api.js';
import { showToast, escapeHtml } from '../services/ui.js';

export async function renderAdmin(container) {
  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Yönetim Paneli</h1>
          <p class="muted">Raporlanan içerikleri inceleyin ve gereğini yapın.</p>
        </div>
      </div>
      <div id="admin-reports" class="admin-reports"></div>
    </div>
  `;

  await loadReports(container);
}

async function loadReports(container) {
  const content = document.getElementById('admin-reports');
  content.innerHTML = '<p class="muted">Yükleniyor...</p>';

  try {
    const { reports } = await api.getReports();
    if (!reports || reports.length === 0) {
      content.innerHTML = '<div class="card empty-state"><p>Henüz rapor yok.</p></div>';
      return;
    }

    content.innerHTML = `
      <table class="table admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Hedef</th>
            <th>Neden</th>
            <th>Açıklama</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map((report) => renderReportRow(report)).join('')}
        </tbody>
      </table>
    `;

    document.querySelectorAll('.admin-action-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const reportId = parseInt(btn.dataset.id, 10);
        const status = btn.dataset.status;
        await handleReview(reportId, status, container);
      });
    });
  } catch (err) {
    content.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function renderReportRow(report) {
  return `
    <tr>
      <td>${report.id}</td>
      <td>${renderReportTarget(report)}</td>
      <td>${escapeHtml(report.reason)}</td>
      <td>${escapeHtml(report.description || '')}</td>
      <td>${escapeHtml(report.status)}</td>
      <td>${new Date(report.created_at).toLocaleString('tr-TR')}</td>
      <td>
        ${report.status === 'pending' ? `
          <button class="btn btn-primary btn-sm admin-action-btn" data-id="${report.id}" data-status="approved">Onayla</button>
          <button class="btn btn-danger btn-sm admin-action-btn" data-id="${report.id}" data-status="rejected">Reddet</button>
        ` : '<span class="muted">Tamamlandı</span>'}
      </td>
    </tr>
  `;
}

function renderReportTarget(report) {
  if (report.reportedPostId) {
    return `Forum gönderisi #${report.reportedPostId}`;
  }
  if (report.reportedActivityId) {
    return `Aktivite #${report.reportedActivityId}`;
  }
  if (report.reportedUserId) {
    return `Kullanıcı #${report.reportedUserId}`;
  }
  return 'Bilinmeyen hedef';
}

async function handleReview(reportId, status, container) {
  try {
    await api.reviewReport(reportId, status);
    showToast(`Rapor ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`, 'success');
    await loadReports(container);
  } catch (err) {
    showToast(err.message, 'error');
  }
}
