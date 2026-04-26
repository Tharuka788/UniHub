const mongoose = require('mongoose');
const ClassOffering = require('../../models/student-management/ClassOffering');
const { createHttpError } = require('../../utils/student-management/http');

async function ensureClassOfferingExists(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(400, 'Invalid class offering id.', {
      errorCode: 'INVALID_IDENTIFIER',
      suggestion: 'Use a valid class offering identifier and try again.',
    });
  }

  const offering = await ClassOffering.findById(id);

  if (!offering) {
    throw createHttpError(404, 'Class offering not found.', {
      errorCode: 'CLASS_OFFERING_NOT_FOUND',
      suggestion: 'Refresh the list and select an existing class offering.',
    });
  }

  return offering;
}

module.exports = {
  ensureClassOfferingExists,
};
