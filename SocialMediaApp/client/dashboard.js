/* ---------- TOAST (IMPROVED & SAFE) ---------- */
let toastTimer = null;

function showToast(message, type = "success") {
  // remove old toast if exists
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function openAbout() {
  document.getElementById("aboutModal").classList.add("show");
}

function closeAbout() {
  document.getElementById("aboutModal").classList.remove("show");
}


/* ---------- TIME AGO ---------- */
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 }
  ];

  for (let i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) {
      return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

/* ---------- LOAD DASHBOARD ---------- */
async function load() {
  const me = await fetch("/auth/me").then(r => r.json());
  if (!me) {
    location.href = "login.html";
    return;
  }

  // Skeleton loader
  posts.innerHTML = `
    <div class="skeleton skeleton-post"></div>
    <div class="skeleton skeleton-post"></div>
    <div class="skeleton skeleton-post"></div>
  `;

  const res = await fetch("/posts");
  const postsData = await res.json();

  posts.innerHTML = "";

  for (let p of postsData) {
    const comments = await fetch(`/comments/${p._id}`).then(r => r.json());

    posts.innerHTML += `
      <div class="post">
        <div style="display:flex; justify-content:space-between;">
          <b>@${p.user.username}</b>
          <small>${timeAgo(p.createdAt)}</small>
        </div>

        <p>${p.content}</p>
          <button onclick="likePost('${p._id}')">
  ❤️ ${p.likes.length}
</button>

        <div class="comments">
          ${comments.map(c => `
            <div class="comment">
              <b>@${c.user.username}</b>: ${c.text}
            </div>
          `).join("")}
        </div>

        <input 
          type="text"
          id="c-${p._id}" 
          placeholder="Write a comment..." 
        />
        <button onclick="addComment('${p._id}')">Comment</button>
      </div>
    `;
  }
}

/* ---------- CREATE POST ---------- */
async function post() {
  const me = await fetch("/auth/me").then(r => r.json());

  if (!content.value.trim()) {
    showToast("Post content cannot be empty.", "error");
    return;
  }

  showToast("Publishing post...");

  await fetch("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: content.value.trim(),
      user: me._id
    })
  });

  content.value = "";
  showToast("Post published successfully.");
  load();
}

/* ---------- ADD COMMENT ---------- */
async function addComment(postId) {
  const me = await fetch("/auth/me").then(r => r.json());
  const input = document.getElementById(`c-${postId}`);
  const text = input.value.trim();

  if (!text) {
    showToast("Comment cannot be empty.", "error");
    return;
  }

  await fetch("/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      user: me._id,
      post: postId
    })
  });

  input.value = "";
  showToast("Comment added.");
  load();
}

/* ---------- LOGOUT ---------- */
async function logout() {
  await fetch("/auth/logout", { method: "POST" });

  showToast("Logged out successfully.");
  setTimeout(() => {
    location.href = "login.html";
  }, 900);
}

/* ---------- INIT ---------- */
load();

async function likePost(postId) {
  const me = await fetch("/auth/me").then(r => r.json());

  await fetch(`/posts/${postId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: me._id })
  });

  load(); // refresh posts
}

