let zIndex = 10;
let currentDir = "/home";

/* ─────────────────────────────────────────────────────────
   APP WINDOW TEMPLATES
   Every app must have a .window-header so makeDraggable works
───────────────────────────────────────────────────────── */
const appContent = {

  about: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('about')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">About</span>
    </div>
    <div class="window-body scroll-body" id="about-body">
      <p class="loading">Loading…</p>
    </div>`,

  projects: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('projects')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">Projects</span>
    </div>
    <div class="window-body scroll-body" id="projects-body">
      <p class="loading">Loading…</p>
    </div>`,

  skills: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('skills')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">Skills</span>
    </div>
    <div class="window-body scroll-body">
      <p><strong>Backend</strong><br>Python · Django · FastAPI · Node.js</p>
      <p><strong>AI / ML</strong><br>LangChain · RAG · Embeddings · PyTorch</p>
      <p><strong>DevOps</strong><br>Docker · Kubernetes · CI/CD · Redis</p>
      <p><strong>Databases</strong><br>PostgreSQL · SQLite · Redis</p>
    </div>`,

  ai: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('ai')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">Assistant</span>
    </div>
    <div class="window-body scroll-body">
      <p><strong>Hello 👋</strong></p>
      <p>I am <strong>Arya Kaushal</strong>, a Backend, AI &amp; DevOps Engineer.</p>
      <p><em>What brings you here today?</em></p>
    </div>`,

  terminal: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('terminal')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">Terminal</span>
    </div>
    <div class="window-body terminal">
      <div id="terminal-output" class="terminal-output">Welcome to AryaOS Terminal
Type <span style="color:#0884ea">help</span> to see available commands.
</div>
      <div class="terminal-input-line">
        <span class="prompt-current">arya@os:</span><span id="cwd-display">${currentDir}</span>$&nbsp;<input id="terminal-input" class="terminal-input" autocomplete="off" spellcheck="false" />
      </div>
    </div>`,

  files: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('files')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">Files</span>
    </div>
    <div class="window-body scroll-body" id="files-body">
      <div id="file-tree"></div>
    </div>`,
};

/* ─────────────────────────────────────────────────────────
   WINDOW MANAGER
───────────────────────────────────────────────────────── */
const windowOffsets = {};

function openApp(appName) {
  if (document.getElementById(appName)) {
    // bring existing window to front
    document.getElementById(appName).style.zIndex = ++zIndex;
    return;
  }

  const win = document.createElement("div");
  win.className = "window";
  win.id = appName;

  // stagger windows slightly
  const count = Object.keys(windowOffsets).length;
  const top  = 80  + (count % 5) * 28;
  const left = 140 + (count % 5) * 28;
  windowOffsets[appName] = true;

  win.style.top  = top  + "px";
  win.style.left = left + "px";
  win.style.zIndex = ++zIndex;

  win.innerHTML = appContent[appName] || "";
  document.body.appendChild(win);
  makeDraggable(win);

  if (appName === "terminal") initTerminal();
  if (appName === "files")    loadFileTree();
  if (appName === "about")    loadAboutContent();
  if (appName === "projects") loadProjects();
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.remove();
    delete windowOffsets[id];
  }
}

/* ─────────────────────────────────────────────────────────
   DRAG
───────────────────────────────────────────────────────── */
function makeDraggable(win) {
  const header = win.querySelector(".window-header");
  if (!header) return;

  let offsetX = 0, offsetY = 0, dragging = false;

  header.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("control")) return;
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = ++zIndex;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = (e.clientX - offsetX) + "px";
    win.style.top  = (e.clientY - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => { dragging = false; });
}

/* ─────────────────────────────────────────────────────────
   ABOUT
───────────────────────────────────────────────────────── */
async function loadAboutContent() {
  const body = document.getElementById("about-body");
  if (!body) return;

  try {
    const res  = await fetch("/api/about/");
    const data = await res.json();
    body.innerHTML = "";

    if (!data.text) {
      body.innerHTML = "<p><em>No content yet. Add it via the Django admin.</em></p>";
      return;
    }

    // Render each newline-separated paragraph
    data.text.split("\n").forEach(line => {
      const p = document.createElement("p");
      p.textContent = line;
      body.appendChild(p);
    });
  } catch {
    body.innerHTML = "<p style='color:red'>Failed to load about content.</p>";
  }
}

/* ─────────────────────────────────────────────────────────
   PROJECTS
───────────────────────────────────────────────────────── */
async function loadProjects() {
  const body = document.getElementById("projects-body");
  if (!body) return;

  try {
    const res  = await fetch("/api/projects/");
    const data = await res.json();

    body.innerHTML = "";

    if (!data.projects || data.projects.length === 0) {
      body.innerHTML = "<p><em>No projects yet. Add them via the Django admin.</em></p>";
      return;
    }

    data.projects.forEach(p => {
      const item = document.createElement("div");
      item.className = "project-item";

      const header = document.createElement("div");
      header.className = "project-header";

      const link = document.createElement("a");
      link.href      = p.github_url;
      link.target    = "_blank";
      link.rel       = "noopener noreferrer";
      link.textContent = p.name;
      link.className = "project-link";

      header.appendChild(link);

      if (p.description) {
        const toggle = document.createElement("button");
        toggle.className   = "project-toggle";
        toggle.textContent = "+";
        toggle.title       = "Show / hide description";

        const desc = document.createElement("div");
        desc.className = "project-desc";
        desc.textContent = p.description;

        toggle.addEventListener("click", () => {
          const open = !desc.hidden;
          desc.hidden        = open;
          toggle.textContent = open ? "+" : "−";
        });

        header.appendChild(toggle);
        item.appendChild(header);
        item.appendChild(desc);
      } else {
        item.appendChild(header);
      }

      body.appendChild(item);
    });
  } catch {
    body.innerHTML = "<p style='color:red'>Failed to load projects.</p>";
  }
}

/* ─────────────────────────────────────────────────────────
   TERMINAL
───────────────────────────────────────────────────────── */
let cmdHistory  = [];
let historyIdx  = -1;

function initTerminal() {
  const input   = document.getElementById("terminal-input");
  const output  = document.getElementById("terminal-output");
  const cwdSpan = document.getElementById("cwd-display");
  if (!input) return;

  input.focus();

  input.addEventListener("keydown", async (e) => {

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIdx > 0) historyIdx--;
      input.value = cmdHistory[historyIdx] ?? "";
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx < cmdHistory.length - 1) historyIdx++;
      else historyIdx = cmdHistory.length;
      input.value = cmdHistory[historyIdx] ?? "";
      return;
    }

    if (e.key !== "Enter") return;

    const cmd = input.value.trim();
    input.value = "";

    // Echo typed command
    const echo = document.createElement("div");
    echo.innerHTML =
      `<span class="prompt-used">arya@os:${currentDir}$</span> ` +
      escapeHtml(cmd);
    output.appendChild(echo);

    if (!cmd) { scrollOutput(output); return; }

    cmdHistory.push(cmd);
    historyIdx = cmdHistory.length;

    // Client-side: clear
    if (cmd === "clear") {
      output.innerHTML = "";
      return;
    }

    try {
      const res  = await fetch("/api/terminal/", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cwd: currentDir, command: cmd }),
      });
      const data = await res.json();

      if (data.cwd !== undefined) {
        currentDir = data.cwd;
        cwdSpan.textContent = currentDir;
      }

      if (data.output !== undefined) {
        const out = document.createElement("pre");
        out.className   = "term-out";
        out.textContent = data.output;
        output.appendChild(out);
      }

      if (data.error) {
        const err = document.createElement("div");
        err.className   = "term-err";
        err.textContent = data.error;
        output.appendChild(err);
      }

      // Sync file tree if filesystem was mutated
      const mutating = ["mkdir","touch","rm","rmdir","chmod"];
      if (mutating.some(c => cmd.startsWith(c))) {
        window.dispatchEvent(new Event("fs:changed"));
      }

    } catch {
      const err = document.createElement("div");
      err.className   = "term-err";
      err.textContent = "error: backend not reachable";
      output.appendChild(err);
    }

    scrollOutput(output);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function scrollOutput(el) {
  el.scrollTop = el.scrollHeight;
}

/* ─────────────────────────────────────────────────────────
   FILE TREE
───────────────────────────────────────────────────────── */
function renderTree(node, container) {
  const item = document.createElement("div");
  const isFolder = Array.isArray(node.children);
  item.className = isFolder ? "tree-folder" : "tree-file";
  item.textContent = node.name;

  container.appendChild(item);

  if (isFolder) {
    const children = document.createElement("div");
    children.className = "children";
    node.children.forEach(child => renderTree(child, children));
    container.appendChild(children);

    item.addEventListener("click", () => {
      children.style.display =
        children.style.display === "none" ? "block" : "none";
    });
  }
}

function loadFileTree() {
  const treeEl = document.getElementById("file-tree");
  if (!treeEl) return;

  fetch("/fs/tree/")
    .then(r => r.json())
    .then(data => {
      treeEl.innerHTML = "";
      if (data.error) {
        treeEl.textContent = data.error;
        return;
      }
      renderTree(data, treeEl);
    })
    .catch(() => { treeEl.textContent = "Could not load file tree."; });
}

/* ─────────────────────────────────────────────────────────
   AUTO-BOOT & EVENT LISTENERS
───────────────────────────────────────────────────────── */
window.onload = () => {
  setTimeout(() => openApp("ai"), 700);
};

window.addEventListener("fs:changed", () => {
  if (document.getElementById("files")) loadFileTree();
});

console.log("AryaOS loaded");
