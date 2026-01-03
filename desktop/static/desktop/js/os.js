let zIndex = 10;
let currentDir = "/home";

/* ================= APP CONTENT ================= */
const appContent = {
  ai: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('ai')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
    </div>
    <div class="window-body">
      <p><strong>Hello 👋</strong></p>
      <p>I am <strong>Arya Kaushal</strong>, a Backend, AI & DevOps Engineer.</p>
      <p><em>What brings you here today?</em></p>
    </div>
  `,

  terminal: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('terminal')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
    </div>

    <div class="window-body terminal">
      <div id="terminal-output" class="terminal-output">
Welcome to Arya OS Terminal
Type "help" to see available commands.
      </div>

      <div class="terminal-line">
        <span class="prompt-current">arya@os:</span>
        <span id="cwd">${currentDir}</span>$&nbsp;
        <input id="terminal-input" class="terminal-input" autocomplete="off" />
      </div>
    </div>
  `,

  files: `
    <div class="window-header">
      <div class="control red" onclick="closeWindow('files')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
    </div>

    <div class="window-body">
      <button onclick="loadFileTree()">🔄 Refresh</button>
      <div id="file-tree"></div>
    </div>
  `
};

/* ================= WINDOW MANAGER ================= */
function openApp(appName) {
  if (document.getElementById(appName)) return;

  const win = document.createElement("div");
  win.className = "window";
  win.id = appName;
  win.style.top = "120px";
  win.style.left = "180px";
  win.style.zIndex = ++zIndex;

  win.innerHTML = appContent[appName];
  document.body.appendChild(win);
  makeDraggable(win);

  if (appName === "terminal") initTerminal();
  if (appName === "files") loadFileTree();
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) win.remove();
}

/* ================= DRAG ================= */
function makeDraggable(win) {
  const header = win.querySelector(".window-header");
  let offsetX = 0, offsetY = 0, dragging = false;

  header.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = ++zIndex;
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => dragging = false);
}

/* ================= TERMINAL ================= */
let history = [];
let historyIndex = -1;

function initTerminal() {
  const input = document.getElementById("terminal-input");
  const output = document.getElementById("terminal-output");
  const cwdSpan = document.getElementById("cwd");

  input.focus();

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const cmd = input.value.trim();

      output.innerHTML += `
<span class="prompt-used">arya@os:${currentDir}$</span>
<span class="terminal-command">${cmd}</span>\n
`;

      history.push(cmd);
      historyIndex = history.length;
      input.value = "";

      if (!cmd) return;

      if (cmd === "clear") {
        output.innerHTML = "";
        return;
      }

      try {
        const res = await fetch("/api/terminal/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cwd: currentDir,
            command: cmd
          })
        });

        const data = await res.json();

        if (data.cwd) {
          currentDir = data.cwd;
          cwdSpan.textContent = currentDir;
        }

        if (data.output) output.innerHTML += data.output + "\n";
        if (data.error) output.innerHTML += "error: " + data.error + "\n";

        /* 🔔 STEP 8: filesystem sync */
        if (
          cmd.startsWith("mkdir") ||
          cmd.startsWith("touch") ||
          cmd.startsWith("rm") ||
          cmd.startsWith("rmdir")
        ) {
          window.dispatchEvent(new Event("fs:changed"));
        }

      } catch {
        output.innerHTML += "error: backend not reachable\n";
      }

      output.scrollTop = output.scrollHeight;
    }

    if (e.key === "ArrowUp") {
      historyIndex--;
      if (history[historyIndex]) input.value = history[historyIndex];
    }

    if (e.key === "ArrowDown") {
      historyIndex++;
      input.value = history[historyIndex] || "";
    }
  });
}

/* ================= FILE TREE ================= */
function renderTree(node, container) {
  const item = document.createElement("div");
  item.className = node.children ? "tree-folder" : "tree-file";
  item.textContent = node.name;
  container.appendChild(item);

  if (node.children) {
    const children = document.createElement("div");
    children.className = "children";
    node.children.forEach(child => renderTree(child, children));
    container.appendChild(children);

    item.onclick = () => {
      children.style.display =
        children.style.display === "none" ? "block" : "none";
    };
  }
}

function loadFileTree() {
  fetch("/fs/tree/")
    .then(res => res.json())
    .then(data => {
      const tree = document.getElementById("file-tree");
      if (!tree) return;
      tree.innerHTML = "";
      renderTree(data, tree);
    });
}

/* ================= AUTO BOOT ================= */
window.onload = () => {
  setTimeout(() => openApp("ai"), 700);
};

/* ================= STEP 8 LISTENER ================= */
window.addEventListener("fs:changed", () => {
  if (document.getElementById("file-tree")) {
    loadFileTree();
  }
});

console.log("AryaOS loaded");
