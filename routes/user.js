const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);

router.get('/info/:username', userController.getUserInfo);
router.put('/change-password', userController.changePassword);
router.put('/update-diseases', userController.updateUserDiseases);

module.exports = router;