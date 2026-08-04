const express = require('express');
const router = express.Router();
const gstStatisticsController = require('../controllers/gstStatistics');

// Statistics Table Routes
router.get('/', gstStatisticsController.getAllStatistics);
router.post('/', gstStatisticsController.addOrUpdateStatistic);
router.delete('/:id', gstStatisticsController.deleteStatistic);

// Additional Reports Routes
router.get('/reports', gstStatisticsController.getAllReports);
router.post('/reports', gstStatisticsController.addReport);
router.delete('/reports/:id', gstStatisticsController.deleteReport);

module.exports = router;
