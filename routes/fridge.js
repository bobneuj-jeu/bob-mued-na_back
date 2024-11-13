const express = require('express');
const router = express.Router();
const fridgeController = require('../controller/fridgeController');

router.post('/add', fridgeController.addFridgeItem);
router.delete('/delete/:id', fridgeController.deleteFridgeItem);

module.exports = router;