const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    passwordHash: String,
    profileImage: String,
    country: String,
    state: String,
    city: String,
    dob: Date,
    interests: [String],
    social: {
      googleId: String,
      linkedInId: String,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
