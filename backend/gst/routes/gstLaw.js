const express = require('express');
const router = express.Router();
const { getActiveLinks, getAllLinks, addLink, updateLink, deleteLink } = require('../controllers/gstLaw');

router.get('/active', getActiveLinks);
router.get('/all', getAllLinks);
router.post('/', addLink);
router.put('/:id', updateLink);
router.delete('/:id', deleteLink);

module.exports = router;
