const { buildReportPdfBuffer } = require('../../services/student-management/pdfService');
const {
  getReportPdfPayload,
  getReportSummary,
} = require('../../services/student-management/reportService');
const { sendSuccess } = require('../../utils/student-management/response');

async function getAdminReportSummary(request, response, next) {
  try {
    const data = await getReportSummary(request.validatedQuery);

    sendSuccess(response, {
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function downloadAdminReportPdf(request, response, next) {
  try {
    const report = await getReportPdfPayload(request.validatedQuery);
    const buffer = await buildReportPdfBuffer(report);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.filename}"`,
    );
    response.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminReportSummary,
  downloadAdminReportPdf,
};
