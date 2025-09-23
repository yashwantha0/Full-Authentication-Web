const crypto = require("crypto");

function generateOtpCode(length = 6) {
  const code = crypto
    .randomInt(0, Math.pow(10, length))
    .toString()
    .padStart(length, "0");
  return code;
}

module.exports = { generateOtpCode };
