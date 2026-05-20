const reportModel = require('../models/reportModel');
const userModel = require('../models/userModel');
const forumModel = require('../models/forumModel');
const activityTypeModel = require('../models/activityTypeModel');

const REPORT_REASONS = ['uygunsuz_konuşma', 'spam', 'yasadışı_içerik', 'sahte_hesap', 'sahtekarlık', 'diğer'];

function validateReportInput({ reportedUserId, reportedPostId, reportedActivityId, reason, description }) {
  const errors = [];

  if (!reportedUserId && !reportedPostId && !reportedActivityId) {
    errors.push('Kişi, gönderi veya aktivite seçilmelidir');
  }

  if (reportedUserId && reportedPostId) {
    errors.push('Yalnızca bir tür rapor yapılabilir');
  }

  if (!reason || !REPORT_REASONS.includes(reason)) {
    errors.push('Geçerli bir neden seçin');
  }

  if (description && description.length > 500) {
    errors.push('Açıklama en fazla 500 karakter olabilir');
  }

  return errors;
}

async function createReport(reporterId, {
  reportedUserId,
  reportedPostId,
  reportedActivityId,
  reason,
  description = '',
}) {
  const errors = validateReportInput({
    reportedUserId,
    reportedPostId,
    reportedActivityId,
    reason,
    description,
  });

  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.status = 400;
    throw err;
  }

  if (reportedUserId) {
    const user = await userModel.findById(reportedUserId);
    if (!user) {
      const err = new Error('Kullanıcı bulunamadı');
      err.status = 404;
      throw err;
    }
    if (user.id === reporterId) {
      const err = new Error('Kendiniz hakkında rapor yapamazsınız');
      err.status = 400;
      throw err;
    }
  }

  if (reportedPostId) {
    const post = await forumModel.findById(reportedPostId);
    if (!post) {
      const err = new Error('Gönderi bulunamadı');
      err.status = 404;
      throw err;
    }
  }

  if (reportedActivityId) {
    const activity = await activityTypeModel.findById(reportedActivityId);
    if (!activity) {
      const err = new Error('Aktivite bulunamadı');
      err.status = 404;
      throw err;
    }
  }

  return reportModel.create({
    reportedUserId,
    reportedPostId,
    reportedActivityId,
    reporterId,
    reason,
    description: description.trim(),
  });
}

async function listReports(status = null) {
  if (status) {
    return reportModel.findByStatus(status);
  }
  return reportModel.findAll();
}

async function reviewReport(reportId, { status, reviewedBy }) {
  const report = await reportModel.findById(reportId);
  if (!report) {
    const err = new Error('Rapor bulunamadı');
    err.status = 404;
    throw err;
  }

  if (!['approved', 'rejected', 'dismissed'].includes(status)) {
    const err = new Error('Geçerli bir durum seçin');
    err.status = 400;
    throw err;
  }

  return reportModel.update(reportId, { status, reviewedBy });
}

module.exports = {
  createReport,
  listReports,
  reviewReport,
  REPORT_REASONS,
};
