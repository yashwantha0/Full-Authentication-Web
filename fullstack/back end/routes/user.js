const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash -otp");
  res.json(user);
});

module.exports = router;
