const reportService = require('../services/reportService');

function create(req, res, next) {
  const { reportedUserId, reportedPostId, reportedActivityId, reason, description } = req.body;
  const reporterId = req.user.id;

  reportService.createReport(reporterId, {
    reportedUserId,
    reportedPostId,
    reportedActivityId,
    reason,
    description,
  })
    .then((report) => {
      res.status(201).json({
        message: 'Rapor başarıyla gönderildi',
        report,
      });
    })
    .catch(next);
}

function list(req, res, next) {
  const { status } = req.query;

  reportService.listReports(status)
    .then((reports) => {
      res.status(200).json({ reports });
    })
    .catch(next);
}

function review(req, res, next) {
  const { id } = req.params;
  const { status } = req.body;
  const reviewedBy = req.user.id;

  reportService.reviewReport(id, { status, reviewedBy })
    .then((report) => {
      res.status(200).json({
        message: 'Rapor incelemesi tamamlandı',
        report,
      });
    })
    .catch(next);
}

module.exports = { create, list, review };
