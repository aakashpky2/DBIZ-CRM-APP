const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Hierarchy routes
router.get('/', protect, userController.getUsers);
router.post('/', protect, userController.createUser);
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;
