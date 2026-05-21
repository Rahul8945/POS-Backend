const express = require('express');
const AuthController = require('./auth.controller');
const { validate } = require('../../common/middleware/validation.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');
const { protect } = require('../../common/middleware/auth.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/logout', protect, AuthController.logout);

module.exports = router;
