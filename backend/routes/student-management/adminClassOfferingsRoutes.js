const express = require('express');
const {
  createAdminClassOffering,
  deleteAdminClassOffering,
  getAdminClassOfferingDetail,
  getAdminClassOfferingList,
  updateAdminClassOffering,
} = require('../../controllers/student-management/adminClassOfferingsController');
const { validateBody, validateQuery } = require('../../middleware/student-management/validateRequest');
const {
  classOfferingListQuerySchema,
  createClassOfferingSchema,
  updateClassOfferingSchema,
} = require('../../utils/student-management/validations/classOfferingSchemas');

const router = express.Router();

router.post('/', validateBody(createClassOfferingSchema), createAdminClassOffering);
router.get('/', validateQuery(classOfferingListQuerySchema), getAdminClassOfferingList);
router.get('/:id', getAdminClassOfferingDetail);
router.patch('/:id', validateBody(updateClassOfferingSchema), updateAdminClassOffering);
router.delete('/:id', deleteAdminClassOffering);

module.exports = router;
