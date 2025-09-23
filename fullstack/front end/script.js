const API_URL = "http://localhost:5000/api"; // backend base URL

// Signup
async function signupUser(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  alert(data.msg || "Signup success!");
}

// Login
async function loginUser(e) {
  e.preventDefault();
  const identifier = e.target.identifier.value;
  const password = e.target.password.value;
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Login successful!");
    window.location = "change.html"; // redirect example
  } else {
    alert(data.msg || "Login failed");
  }
}

// Forgot password
async function forgotPassword(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  alert("OTP sent to email!");
}

// Reset password
async function resetPassword(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const otp = e.target.otp.value;
  const newPassword = e.target.newPassword.value;
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword })
  });
  const data = await res.json();
  alert(data.msg || "Password reset success");
}

// Change password
async function changePassword(e) {
  e.preventDefault();
  const currentPassword = e.target.currentPassword.value;
  const newPassword = e.target.newPassword.value;
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await res.json();
  alert(data.msg || "Password changed!");
}
