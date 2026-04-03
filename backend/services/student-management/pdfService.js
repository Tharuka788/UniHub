const PDFDocument = require('pdfkit');

function writeSectionTitle(doc, title) {
  doc.moveDown();
  doc.fontSize(14).fillColor('#0f172a').text(title, { underline: true });
  doc.moveDown(0.5);
}

function writeMetricList(doc, metrics) {
  metrics.forEach((metric) => {
    doc.fontSize(11).fillColor('#334155').text(`${metric.label}: ${metric.value}`);
  });
}

function writeRows(doc, rows, formatRow) {
  rows.forEach((row, index) => {
    doc
      .fontSize(10)
      .fillColor('#1e293b')
      .text(`${index + 1}. ${formatRow(row)}`)
      .moveDown(0.25);
  });
}

function renderConfirmedStudentsReport(doc, report) {
  writeSectionTitle(doc, 'Summary');
  writeMetricList(doc, report.metrics);

  writeSectionTitle(doc, 'Confirmed Students');
  writeRows(
    doc,
    report.exportRows,
    (row) =>
      `${row.studentName} | ${row.email} | ${row.phone} | ${row.kuppiSession} | Payment: ${row.paymentStatus} | Delivery: ${row.deliveryStatus}`,
  );
}

function renderDispatchSummaryReport(doc, report) {
  writeSectionTitle(doc, 'Summary');
  writeMetricList(doc, report.metrics);

  writeSectionTitle(doc, 'Failed Recipients');

  if (report.failedRecipients.length === 0) {
    doc.fontSize(10).fillColor('#334155').text('No failed recipients for the selected filters.');
  } else {
    writeRows(
      doc,
      report.failedRecipients,
      (row) => `${row.studentName} | ${row.email} | ${row.kuppiSession}`,
    );
  }

  writeSectionTitle(doc, 'Recent Dispatch History');

  if (report.recentDispatches.length === 0) {
    doc.fontSize(10).fillColor('#334155').text('No dispatch history available for the selected filters.');
  } else {
    writeRows(
      doc,
      report.recentDispatches,
      (row) =>
        `${row.studentName} | ${row.recipient} | ${row.kuppiSession} | ${row.status} | ${new Date(row.createdAt).toLocaleString('en-US')}`,
    );
  }
}

function renderClassOfferingSummaryReport(doc, report) {
  writeSectionTitle(doc, 'Summary');
  writeMetricList(doc, report.metrics);

  writeSectionTitle(doc, 'Class Offerings');
  writeRows(
    doc,
    report.exportRows,
    (row) =>
      `${row.title} | ${row.kuppiSession} | Status: ${row.status} | Readiness: ${row.readiness.label} (${row.readiness.score}/100) | Confirmed: ${row.confirmedCount} | Sent: ${row.sentCount} | Failed: ${row.failedCount}`,
  );
}

function buildReportPdfBuffer(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 48,
      size: 'A4',
    });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#0f172a').text(report.title);
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor('#475569')
      .text(`Generated at: ${new Date(report.generatedAt).toLocaleString('en-US')}`);

    writeSectionTitle(doc, 'Selected Filters');
    doc.fontSize(11).fillColor('#334155');
    doc.text(`Class offering: ${report.filters.classOfferingLabel}`);
    doc.text(`Date from: ${report.filters.dateFrom}`);
    doc.text(`Date to: ${report.filters.dateTo}`);
    doc.text(`Delivery status: ${report.filters.deliveryStatus}`);
    doc.text(`Include archived: ${report.filters.includeArchived ? 'Yes' : 'No'}`);

    if (report.reportType === 'confirmed-students') {
      renderConfirmedStudentsReport(doc, report);
    } else if (report.reportType === 'dispatch-summary') {
      renderDispatchSummaryReport(doc, report);
    } else {
      renderClassOfferingSummaryReport(doc, report);
    }

    doc.end();
  });
}

module.exports = {
  buildReportPdfBuffer,
};
