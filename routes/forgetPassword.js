const express = require('express');
const router = express.Router();

const { forgotPassword, verifyCodeAndReset } = require('../controller/forgetPassword');

router.post('/forget-password', forgotPassword);
router.post('/verify-reset', verifyCodeAndReset);

module.exports = router;