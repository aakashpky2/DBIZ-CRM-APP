const express = require('express');
const router = express.Router();
const { 
  getItems, 
  createItem, 
  updateItem, 
  deleteItem 
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

router.use(protect); // All item routes are protected

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
