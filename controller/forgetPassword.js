const User = require('../models/user');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Step 1: Send reset code
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'This email is not registered' });

    // Generate 4-digit reset code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    user.resetCode = hashedResetCode;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // valid for 10 minutes
    await user.save();

    // Email transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MedScan" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset Code',
      text: `Your password reset code is ${resetCode}. It expires in 10 minutes.`,
    });

    return res.status(200).json({ message: 'Reset code sent to your email' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return res.status(500).json({ message: 'Issue while sending reset code' });
  }
};

// Step 2: Verify code and reset password
const verifyCodeAndReset = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    if (!email || !code || !newPassword || !confirmPassword)
      return res.status(400).json({ message: 'All fields are required' });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    if (newPassword.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'This email is not registered' });

    // Hash provided code for comparison
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    if (user.resetCode !== hashedCode || user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Hash new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset code
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password has been changed. You can now log in.' });
  } catch (err) {
    console.error('Verify & Reset Password Error:', err);
    return res.status(500).json({ message: 'Error while changing password' });
  }
};

module.exports = { forgotPassword, verifyCodeAndReset };
