const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const passport = require("passport");
const User = require("../models/User");
const { generateOtpCode } = require("../utils/otp");
const { sendMail } = require("../utils/mailer");
const authMiddleware = require("../middleware/authMiddleware");

const upload = multer({ dest: "uploads/" });

// Helper: JWT
function generateToken(user) {
  return jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Signup
router.post("/signup", upload.single("profileImage"), [
  body("fullName").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("termsAccepted").equals("true"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, password, phone, country, state, city, dob, interests } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      fullName, email, phone, passwordHash,
      country, state, city, dob, interests: interests ? JSON.parse(interests) : [],
      profileImage: req.file ? req.file.path : null
    });

    await user.save();
    const token = generateToken(user);
    res.json({ token, msg: "Signup successful" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Login
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
  if (!user || !user.passwordHash) return res.status(400).json({ msg: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = generateToken(user);
  res.json({ token, msg: "Login successful" });
});

// Forgot Password (OTP)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "No account with that email" });

  const code = generateOtpCode(6);
  user.otp = { code, expiresAt: new Date(Date.now() + 15 * 60000) };
  await user.save();

  await sendMail({ to: email, subject: "Reset Password OTP", text: `OTP: ${code}` });
  res.json({ msg: "OTP sent" });
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.otp || user.otp.code !== otp) return res.status(400).json({ msg: "Invalid OTP" });
  if (Date.now() > new Date(user.otp.expiresAt)) return res.status(400).json({ msg: "OTP expired" });

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  user.otp = undefined;
  await user.save();

  res.json({ msg: "Password reset successful" });
});

// Change Password
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash || "");
  if (!isMatch) return res.status(400).json({ msg: "Current password invalid" });

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ msg: "Password changed" });
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: process.env.FRONTEND_URL + "/index.html" }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/success.html?token=${token}`);
  }
);

// LinkedIn OAuth
router.get("/linkedin", passport.authenticate("linkedin"));
router.get("/linkedin/callback",
  passport.authenticate("linkedin", { session: false, failureRedirect: process.env.FRONTEND_URL + "/index.html" }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/success.html?token=${token}`);
  }
);

module.exports = router;
