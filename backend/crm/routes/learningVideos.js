const express = require('express');
const router = express.Router();
const { getAllVideos, createVideo, updateVideo, deleteVideo } = require('../controllers/learningVideosController');
const { protect } = require('../middleware/auth');

// Protected route - list videos (Filtered by permissions in controller)
router.get('/', protect, getAllVideos);

// Protected routes - only admin/superadmin
router.post('/', protect, createVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);

module.exports = router;
