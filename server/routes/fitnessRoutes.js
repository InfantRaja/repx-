const express = require('express');
const router = express.Router();
const {
  getFitnessRecords,
  getFitnessRecordById,
  createFitnessRecord,
  updateFitnessRecord,
  deleteFitnessRecord,
  getAdminStats
} = require('../controllers/fitnessController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All fitness record operations require authentication
router.use(authenticateToken);

// Admin dashboard stats
router.get('/stats', requireAdmin, getAdminStats);

// Records CRUD
router.get('/', getFitnessRecords);
router.post('/', createFitnessRecord);
router.get('/:id', getFitnessRecordById);
router.put('/:id', requireAdmin, updateFitnessRecord);
router.delete('/:id', requireAdmin, deleteFitnessRecord);

module.exports = router;
