const API_BASE = "https://github-stats-api.onrender.com"; // FastAPI backend

const form = document.getElementById("search-form");
const input = document.getElementById("repo-input");
const content = document.getElementById("content");
const errorBox = document.getElementById("error");

function parseRepo(inputValue) {
    let val = inputValue.trim();
    if (!val) return null;

    if (val.startsWith("http://") || val.startsWith("https://")) {
    try {
        const url = new URL(val);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
        }
    } catch (e) {
        return null;
    }
    }

    const [owner, repo] = val.split("/");
    if (!owner || !repo) return null;
    return { owner: owner.trim(), repo: repo.trim() };
}

function timeAgo(isoString) {
    if (!isoString) return "N/A";
    const updated = new Date(isoString);
    const now = new Date();
    const diffMs = now - updated;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return diffDays + " days ago";

    const months = Math.floor(diffDays / 30);
    if (months === 1) return "1 month ago";
    return months + " months ago";
}

function renderRepo(repo) {
    content.innerHTML = `
    <div class="card">
        <div class="repo-header">
        <img class="repo-avatar" src="${repo.avatar_url}" alt="avatar" />
        <div>
            <div class="repo-title-row">
            <div class="repo-name">${repo.full_name}</div>
            <a class="repo-link" href="${repo.html_url}" target="_blank" rel="noreferrer">↗</a>
            </div>
            <div class="repo-desc">
            ${repo.description || "No description provided"}
            </div>
        </div>
        </div>

        <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-label">Stars</div>
            <div class="stat-value">${repo.stars}</div>
            <div class="stat-pill">Popularity</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Forks</div>
            <div class="stat-value">${repo.forks}</div>
            <div class="stat-pill">Clones</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Watchers</div>
            <div class="stat-value">${repo.watchers}</div>
            <div class="stat-pill">Watching</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Open Issues</div>
            <div class="stat-value">${repo.open_issues}</div>
            <div class="stat-pill">To be fixed</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Last Updated</div>
            <div class="stat-value" style="font-size:16px;">
            ${timeAgo(repo.last_updated)}
            </div>
            <div class="stat-pill">${new Date(repo.last_updated).toLocaleDateString()}</div>
        </div>
        </div>

        <div class="footer-row">
        <div class="dot"></div>
        <span>Live from GitHub REST API</span>
        </div>
    </div>
    `;
}

async function fetchRepoStats(owner, repo) {
    errorBox.textContent = "";
    content.innerHTML = `<div class="empty-state">Loading...</div>`;
    try {
    const res = await fetch(`${API_BASE}/repo/${owner}/${repo}`);
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || "Failed to fetch repo");
    }
    const data = await res.json();
    renderRepo(data);
    } catch (err) {
    errorBox.textContent = err.message;
    content.innerHTML = `<div class="empty-state">Could not load repository data.</div>`;
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const parsed = parseRepo(input.value);
    if (!parsed) {
    errorBox.textContent = "Enter in format owner/repo or a valid GitHub URL.";
    return;
    }
    fetchRepoStats(parsed.owner, parsed.repo);
});