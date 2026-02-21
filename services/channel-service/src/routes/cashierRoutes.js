const express = require('express');
const router = express.Router();
const cashierController = require('../controllers/cashierController');

router.get('/', cashierController.list);
router.get('/:id', cashierController.get);
router.post('/', cashierController.create);
router.put('/:id', cashierController.update);
router.delete('/:id', cashierController.remove);

module.exports = router;
