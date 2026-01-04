function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function register() {
  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value.trim(),
      password: password.value.trim()
    })
  });

  const data = await res.json();

  if (data.error) {
    showToast("Username already exists.", "error");
    return;
  }

  showToast("Account created successfully. Please login.");
  setTimeout(() => location.href = "login.html", 1200);
}

async function login() {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value.trim(),
      password: password.value.trim()
    })
  });

  const data = await res.json();

  if (data.error) {
    showToast("Invalid username or password.", "error");
    return;
  }

  showToast("Login successful. Redirecting...");
  setTimeout(() => location.href = "dashboard.html", 1200);
}
