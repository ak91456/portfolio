/* ═══════════════════════════════════════════════════════
   ARYAOS  —  os.js  v4
   Sections:
     1.  Theming Engine
     2.  App Window Templates
     3.  Window Manager  (open / close / minimize / focus / shake)
     4.  Drag  (with edge snapping)
     5.  About
     6.  Projects
     7.  Terminal  (history · Tab completion · Markdown · themes · recruiter)
     8.  File Tree  (render · load · cache)
     9.  Full-Screen Boot Sequence
    10.  Dock  (macOS magnification · preview tooltips)
    11.  Uptime Clock
    12.  Auto-boot & Global Listeners
═══════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────
   1. THEMING ENGINE
─────────────────────────────────────────────────────── */
let currentTheme = 'default';

const THEMES = {
  /* Wallpaper + frosted glass — default */
  default: {
    '--bg':               "url('/static/desktop/1U6HqZ.webp') center / cover no-repeat fixed",
    '--win-bg':           'rgba(255,255,255,0.80)',
    '--win-blur':         '28px',
    '--win-border':       'rgba(255,255,255,0.50)',
    '--win-shadow':       '0 20px 50px rgba(0,0,0,0.28)',
    '--win-header-bg':    'rgba(255,255,255,0.55)',
    '--win-title-color':  'rgba(0,0,0,0.72)',
    '--win-body-color':   '#1a1a2e',
    '--win-focus-shadow': '0 0 0 2px rgba(255,100,160,0.45),0 24px 60px rgba(0,0,0,0.32)',
    '--dock-bg':          'rgba(255,255,255,0.28)',
    '--term-bg':          '#0d0d0d',
    '--term-color':       '#e8e8e8',
    '--term-prompt':      '#f06090',
    '--term-err':         '#ff6b6b',
    '--term-ok':          '#5ecc7b',
    '--term-divider':     'rgba(255,255,255,0.08)',
    '--link-color':       '#c2185b',
    '--tree-color':       '#1a1a2e',
    '--subdued-color':    'rgba(0,0,0,0.48)',
    '--project-border':   'rgba(0,0,0,0.10)',
  },

  /* Dark teal engineer grid */
  engineer: {
    '--bg':
      'linear-gradient(rgba(0,200,180,0.07) 1px,transparent 1px) 0 0/40px 40px,' +
      'linear-gradient(90deg,rgba(0,200,180,0.07) 1px,transparent 1px) 0 0/40px 40px,' +
      '#1a1a1a',
    '--win-bg':           'rgba(22,30,34,0.84)',
    '--win-blur':         '20px',
    '--win-border':       'rgba(0,200,180,0.20)',
    '--win-shadow':       '0 20px 50px rgba(0,0,0,0.6)',
    '--win-header-bg':    'rgba(0,200,180,0.07)',
    '--win-title-color':  'rgba(0,200,180,0.80)',
    '--win-body-color':   '#c8d8d4',
    '--win-focus-shadow': '0 0 0 1.5px rgba(0,200,180,0.55),0 24px 60px rgba(0,0,0,0.7)',
    '--dock-bg':          'rgba(14,24,26,0.78)',
    '--term-bg':          '#0d0d0d',
    '--term-color':       '#e8e8e8',
    '--term-prompt':      '#00c8b4',
    '--term-err':         '#ff6b6b',
    '--term-ok':          '#00c8b4',
    '--term-divider':     'rgba(0,200,180,0.10)',
    '--link-color':       '#00b4a0',
    '--tree-color':       '#c8d8d4',
    '--subdued-color':    'rgba(200,216,212,0.5)',
    '--project-border':   'rgba(0,200,180,0.12)',
  },

  /* Classic purple gradient (old default) */
  purple: {
    '--bg':               'linear-gradient(135deg,#667eea 0%,#764ba2 45%,#f093fb 100%)',
    '--win-bg':           'rgba(255,255,255,0.28)',
    '--win-blur':         '25px',
    '--win-border':       'rgba(255,255,255,0.35)',
    '--win-shadow':       '0 20px 50px rgba(0,0,0,0.35)',
    '--win-header-bg':    'rgba(255,255,255,0.12)',
    '--win-title-color':  'rgba(0,0,0,0.55)',
    '--win-body-color':   '#111',
    '--win-focus-shadow': '0 0 0 2px rgba(255,255,255,0.55),0 24px 60px rgba(0,0,0,0.5)',
    '--dock-bg':          'rgba(255,255,255,0.22)',
    '--term-bg':          '#0d0d0d',
    '--term-color':       '#e8e8e8',
    '--term-prompt':      '#5ba3f5',
    '--term-err':         '#ff6b6b',
    '--term-ok':          '#4caf72',
    '--term-divider':     'rgba(255,255,255,0.06)',
    '--link-color':       '#3a7bd5',
    '--tree-color':       '#111',
    '--subdued-color':    'rgba(0,0,0,0.5)',
    '--project-border':   'rgba(0,0,0,0.08)',
  },

  'modern-dark': {
    '--bg':               'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
    '--win-bg':           'rgba(28,28,50,0.88)',
    '--win-blur':         '20px',
    '--win-border':       'rgba(120,120,200,0.22)',
    '--win-shadow':       '0 20px 60px rgba(0,0,0,0.7)',
    '--win-header-bg':    'rgba(100,100,180,0.12)',
    '--win-title-color':  'rgba(200,200,255,0.8)',
    '--win-body-color':   '#d0d0e8',
    '--win-focus-shadow': '0 0 0 2px rgba(100,120,255,0.7),0 24px 60px rgba(0,0,0,0.8)',
    '--dock-bg':          'rgba(28,28,60,0.72)',
    '--term-bg':          '#0a0a14',
    '--term-color':       '#b0c4de',
    '--term-prompt':      '#6a9fff',
    '--term-err':         '#ff6b6b',
    '--term-ok':          '#4caf72',
    '--term-divider':     'rgba(100,100,200,0.15)',
    '--link-color':       '#6a9fff',
    '--tree-color':       '#b0c4de',
    '--subdued-color':    'rgba(180,180,255,0.5)',
    '--project-border':   'rgba(120,120,200,0.15)',
  },

  matrix: {
    '--bg':               'linear-gradient(180deg,#000000 0%,#001400 100%)',
    '--win-bg':           'rgba(0,16,0,0.92)',
    '--win-blur':         '12px',
    '--win-border':       'rgba(0,255,65,0.28)',
    '--win-shadow':       '0 20px 50px rgba(0,0,0,0.9),0 0 18px rgba(0,255,65,0.1)',
    '--win-header-bg':    'rgba(0,255,65,0.06)',
    '--win-title-color':  '#00ff41',
    '--win-body-color':   '#00cc33',
    '--win-focus-shadow': '0 0 0 1px #00ff41,0 0 28px rgba(0,255,65,0.35)',
    '--dock-bg':          'rgba(0,16,0,0.88)',
    '--term-bg':          '#000900',
    '--term-color':       '#00ff41',
    '--term-prompt':      '#00ff41',
    '--term-err':         '#ff4444',
    '--term-ok':          '#00ff41',
    '--term-divider':     'rgba(0,255,65,0.12)',
    '--link-color':       '#00cc33',
    '--tree-color':       '#00cc33',
    '--subdued-color':    'rgba(0,200,50,0.6)',
    '--project-border':   'rgba(0,255,65,0.15)',
  },

  light: {
    '--bg':               'linear-gradient(135deg,#e2e8f5 0%,#d4e4f7 45%,#ece0f5 100%)',
    '--win-bg':           'rgba(255,255,255,0.92)',
    '--win-blur':         '20px',
    '--win-border':       'rgba(0,0,0,0.1)',
    '--win-shadow':       '0 8px 32px rgba(0,0,0,0.12)',
    '--win-header-bg':    'rgba(0,0,0,0.04)',
    '--win-title-color':  'rgba(0,0,0,0.65)',
    '--win-body-color':   '#1a1a2e',
    '--win-focus-shadow': '0 0 0 2px rgba(58,123,213,0.5),0 12px 40px rgba(0,0,0,0.15)',
    '--dock-bg':          'rgba(255,255,255,0.8)',
    '--term-bg':          '#1e1e2e',
    '--term-color':       '#e0e0e0',
    '--term-prompt':      '#5ba3f5',
    '--term-err':         '#ff6b6b',
    '--term-ok':          '#4caf72',
    '--term-divider':     'rgba(255,255,255,0.06)',
    '--link-color':       '#2563eb',
    '--tree-color':       '#1a1a2e',
    '--subdued-color':    'rgba(0,0,0,0.48)',
    '--project-border':   'rgba(0,0,0,0.08)',
  },
};

function applyTheme(name) {
  const t = THEMES[name];
  if (!t) {
    return { error: `theme: '${name}' not found.  Available: ${Object.keys(THEMES).join(', ')}` };
  }
  const root = document.documentElement;
  Object.entries(t).forEach(([k, v]) => root.style.setProperty(k, v));
  currentTheme = name;
  return { output: `Theme switched to '${name}'.` };
}

/* ───────────────────────────────────────────────────────
   2. APP WINDOW TEMPLATES
   Every template MUST contain .window-header
─────────────────────────────────────────────────────── */
let zIndex     = 10;
let currentDir = '/home';

const appContent = {

  about: `
    <div class="window-header">
      <div class="control red"    onclick="minimizeWindow('about')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">About</span>
    </div>
    <div class="window-body scroll-body" id="about-body">
      <div class="about-hero">
        <div class="hero-avatar">AK</div>
        <div>
          <h1 class="hero-name">Arya Kaushal</h1>
          <p class="hero-role">Backend &middot; AI &middot; DevOps</p>
        </div>
        <p class="hero-bio" id="hero-bio-text">Loading…</p>
        <div class="hero-tags">
          <span>Python</span><span>Django</span><span>FastAPI</span>
          <span>LangChain</span><span>RAG</span><span>Docker</span>
          <span>Kubernetes</span><span>PostgreSQL</span>
        </div>
        <div class="hero-links">
          <a href="https://github.com/ak91456" target="_blank" class="hero-btn">GitHub</a>
          <a href="https://www.linkedin.com/in/arya-kaushal-aa530725b/" target="_blank" class="hero-btn hero-btn-outline">LinkedIn</a>
          <a href="https://leetcode.com/u/ak91456/" target="_blank" class="hero-btn hero-btn-outline">LeetCode</a>
          <a href="https://codeforces.com/profile/ak91456" target="_blank" class="hero-btn hero-btn-outline">Codeforces</a>
          <a href="https://www.codechef.com/users/ak91456" target="_blank" class="hero-btn hero-btn-outline">CodeChef</a>
        </div>
      </div>
      <div id="about-sections"></div>

      <!-- ── Timeline ──────────────────────────────────── -->
      <div class="tl-section">
        <p class="tl-section-title">Timeline</p>
        <div class="tl-list">

          <div class="tl-item">
            <span class="tl-dot"></span>
            <span class="tl-year">2026</span>
            <div class="tl-card">
              <p class="tl-title">Open Source Contributions</p>
              <p class="tl-subtitle">GitHub · Active</p>
              <p class="tl-desc">Building Kana Dojo — an interactive Japanese kana learning app. Active contributor with public repositories spanning backend, AI, and DevOps projects.</p>
              <span class="tl-badge">Open Source</span>
            </div>
          </div>

          <div class="tl-item">
            <span class="tl-dot"></span>
            <span class="tl-year">2022–26</span>
            <div class="tl-card">
              <p class="tl-title">B.Tech Computer Science &amp; Engineering</p>
              <p class="tl-subtitle">KIIT University, Bhubaneswar · CGPA 8.41</p>
              <p class="tl-desc">Core subjects: OS, Computer Networks, DSA, DBMS, OOPs, Machine Learning, Deep Learning, Software Engineering.</p>
              <span class="tl-badge">B.Tech · CGPA 8.41</span>
            </div>
          </div>

          <div class="tl-item">
            <span class="tl-dot"></span>
            <span class="tl-year">2022</span>
            <div class="tl-card">
              <p class="tl-title">Class XII — Science (PCM + CS)</p>
              <p class="tl-subtitle">Bradford International School · CBSE · 75%</p>
              <p class="tl-desc">Physics, Chemistry, Mathematics and Computer Science.</p>
              <span class="tl-badge">CBSE · 75%</span>
            </div>
          </div>

          <div class="tl-item">
            <span class="tl-dot"></span>
            <span class="tl-year">2020</span>
            <div class="tl-card">
              <p class="tl-title">Class X</p>
              <p class="tl-subtitle">Gyan Niketan School · CBSE · 90.60%</p>
              <p class="tl-desc">All-round academics with a strong foundation in Mathematics and Science.</p>
              <span class="tl-badge">CBSE · 90.60%</span>
            </div>
          </div>

        </div>
      </div>
    </div>`,

  projects: `
    <div class="window-header">
      <div class="control red"    onclick="minimizeWindow('projects')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">Projects</span>
    </div>
    <div class="window-body scroll-body" id="projects-body">
      <p class="loading">Loading…</p>
    </div>`,

  skills: `
    <div class="window-header">
      <div class="control red"    onclick="minimizeWindow('skills')"></div>
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
      <div class="control red" onclick="minimizeWindow('ai')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">AI Assistant</span>
    </div>
    <div class="window-body ai-chat-body" id="ai-body">
      <div class="ai-blobs">
        <div class="ai-blob ai-blob-1"></div>
        <div class="ai-blob ai-blob-2"></div>
        <div class="ai-blob ai-blob-3"></div>
      </div>
      <div class="ai-mouse-glow" id="ai-mouse-glow"></div>
      <div class="ai-messages" id="ai-messages">
        <div class="ai-welcome">
          <div class="ai-robot-icon">🤖</div>
          <p class="ai-welcome-title">How can I help today?</p>
          <p class="ai-welcome-sub">Ask me anything about Arya</p>
        </div>
      </div>
      <div class="ai-input-area">
        <div class="ai-cmd-palette" id="ai-cmd-palette">
          <div class="ai-cmd-item" data-cmd="/skills" data-query="What are Arya's top skills?">
            <span class="ai-cmd-icon">⚡</span>
            <span class="ai-cmd-label">Skills</span>
            <span class="ai-cmd-prefix">/skills</span>
          </div>
          <div class="ai-cmd-item" data-cmd="/projects" data-query="Tell me about Arya's projects">
            <span class="ai-cmd-icon">📁</span>
            <span class="ai-cmd-label">Projects</span>
            <span class="ai-cmd-prefix">/projects</span>
          </div>
          <div class="ai-cmd-item" data-cmd="/hire" data-query="Is Arya open to work?">
            <span class="ai-cmd-icon">💼</span>
            <span class="ai-cmd-label">Hiring?</span>
            <span class="ai-cmd-prefix">/hire</span>
          </div>
          <div class="ai-cmd-item" data-cmd="/contact" data-query="How can I contact Arya?">
            <span class="ai-cmd-icon">📬</span>
            <span class="ai-cmd-label">Contact</span>
            <span class="ai-cmd-prefix">/contact</span>
          </div>
        </div>
        <div class="ai-input-card" id="ai-input-card">
          <textarea id="ai-input" class="ai-textarea" placeholder="Ask me anything about Arya…" rows="1"
            onkeydown="handleAIKey(event)" oninput="handleAIInput(this)"></textarea>
          <div class="ai-toolbar">
            <div style="display:flex;align-items:center;gap:4px;">
            <button class="ai-tool-btn" id="ai-cmd-btn" title="Commands (type / to trigger)" onclick="toggleAICmdPalette()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </button>
            <button class="ai-tool-btn" id="ai-theme-btn" title="Switch to light mode" onclick="toggleAITheme()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            </button>
            </div>
            <button id="ai-send-btn" class="ai-send-btn" onclick="sendAIMessage()" disabled>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <span>Send</span>
            </button>
          </div>
        </div>
        <div class="ai-suggestions" id="ai-suggestions">
          <button class="ai-chip" onclick="sendAISuggestion('What are Arya\\'s top skills?')">⚡ Skills</button>
          <button class="ai-chip" onclick="sendAISuggestion('Tell me about his projects')">📁 Projects</button>
          <button class="ai-chip" onclick="sendAISuggestion('Is Arya open to work?')">💼 Hiring?</button>
          <button class="ai-chip" onclick="sendAISuggestion('How can I contact Arya?')">📬 Contact</button>
        </div>
      </div>
    </div>`,

  terminal: `
    <div class="window-header">
      <div class="control red"    onclick="minimizeWindow('terminal')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">Terminal</span>
    </div>
    <div class="window-body terminal">
      <div id="terminal-output" class="terminal-output">Welcome to AryaOS Terminal
</div>
      <div class="terminal-input-line">
        <span class="prompt-current">arya@os:</span><span id="cwd-display">${currentDir}</span>$&nbsp;<input id="terminal-input" class="terminal-input" autocomplete="off" spellcheck="false" />
      </div>
    </div>`,

  files: `
    <div class="window-header">
      <div class="control red"    onclick="minimizeWindow('files')"></div>
      <div class="control yellow"></div>
      <div class="control green"></div>
      <span class="win-title">Files</span>
    </div>
    <div class="window-body scroll-body" id="files-body">
      <div id="file-tree"></div>
    </div>`,
};

/* ───────────────────────────────────────────────────────
   3. WINDOW MANAGER
─────────────────────────────────────────────────────── */
const windowOffsets = {};

function focusWindow(id) {
  document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
  const win = document.getElementById(id);
  if (win) win.classList.add('focused');
}

function shakeWindow(win) {
  win.classList.remove('shaking');
  void win.offsetWidth; /* force reflow to restart animation */
  win.classList.add('shaking');
  win.addEventListener('animationend', () => win.classList.remove('shaking'), { once: true });
}

function openApp(appName) {
  const existing = document.getElementById(appName);
  if (existing) {
    existing.style.zIndex = ++zIndex;
    focusWindow(appName);
    shakeWindow(existing);
    return;
  }

  const win = document.createElement('div');
  win.className = 'window';
  win.id        = appName;

  const count = Object.keys(windowOffsets).length;
  win.style.top    = (80  + (count % 5) * 28) + 'px';
  win.style.left   = (140 + (count % 5) * 28) + 'px';
  win.style.zIndex = ++zIndex;
  windowOffsets[appName] = true;

  win.innerHTML = appContent[appName] || '';
  document.body.appendChild(win);

  /* Inject mobile close button into header */
  const hdr = win.querySelector('.window-header');
  if (hdr) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeWindow(appName);
    });
    hdr.appendChild(closeBtn);
  }

  win.addEventListener('mousedown', () => {
    win.style.zIndex = ++zIndex;
    focusWindow(appName);
  });

  const greenBtn = win.querySelector('.control.green');
  if (greenBtn) greenBtn.addEventListener('click', () => toggleMaximize(win));

  /* Animate the folder icon */
  const folderEl = document.querySelector(`.icon[data-app="${appName}"] .folder`);
  if (folderEl) {
    folderEl.classList.add('open');
    setTimeout(() => folderEl.classList.remove('open'), 700);
  }

  makeDraggable(win);
  focusWindow(appName);

  if (appName === 'terminal') initTerminal();
  if (appName === 'files')    loadFileTree();
  if (appName === 'about')    loadAboutContent();
  if (appName === 'projects') loadProjects();
  if (appName === 'ai')       initAIWindow();
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) { win.remove(); delete windowOffsets[id]; }
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  const dockIcon = document.querySelector(`.dock-icon[data-app="${id}"]`);
  if (!dockIcon) { closeWindow(id); return; }

  const wRect = win.getBoundingClientRect();
  const dRect = dockIcon.getBoundingClientRect();

  const tx = (dRect.left + dRect.width  / 2) - (wRect.left + wRect.width  / 2);
  const ty = (dRect.top  + dRect.height / 2) - (wRect.top  + wRect.height / 2);

  win.style.transition     = 'transform 0.38s cubic-bezier(0.4,0,1,1), opacity 0.32s ease';
  win.style.transformOrigin = 'center center';
  win.style.transform      = `translate(${tx}px,${ty}px) scale(0.05)`;
  win.style.opacity        = '0';
  win.style.pointerEvents  = 'none';

  setTimeout(() => { win.remove(); delete windowOffsets[id]; }, 400);
}

function toggleMaximize(win) {
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    win.style.top    = win._origTop;
    win.style.left   = win._origLeft;
    win.style.width  = win._origWidth;
    win.style.maxHeight = win._origMaxH;
  } else {
    win._origTop   = win.style.top;
    win._origLeft  = win.style.left;
    win._origWidth = win.style.width;
    win._origMaxH  = win.style.maxHeight;
    win.classList.add('maximized');
  }
}

/* ───────────────────────────────────────────────────────
   4. DRAG  (with 20 px edge snapping)
─────────────────────────────────────────────────────── */
function makeDraggable(win) {
  const header = win.querySelector('.window-header');
  if (!header) return;

  let ox = 0, oy = 0, dragging = false;

  header.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('control')) return;
    if (win.classList.contains('maximized')) return;
    dragging = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
    win.style.zIndex = ++zIndex;
    focusWindow(win.id);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;

    const SNAP = 20;
    let newLeft = e.clientX - ox;
    let newTop  = e.clientY - oy;
    const w = win.offsetWidth;
    const h = win.offsetHeight;

    if (newLeft                < SNAP) newLeft = 0;
    if (newLeft + w > window.innerWidth  - SNAP) newLeft = window.innerWidth  - w;
    if (newTop                 < SNAP) newTop  = 0;
    if (newTop  + h > window.innerHeight - SNAP) newTop  = window.innerHeight - h;

    win.style.left = newLeft + 'px';
    win.style.top  = newTop  + 'px';
  });

  document.addEventListener('mouseup', () => { dragging = false; });
}

/* ───────────────────────────────────────────────────────
   5. AI CHAT
─────────────────────────────────────────────────────── */
let aiHistory    = [];
let aiCmdActiveIdx = -1;

/* ── Input handler (resize + btn + cmd palette) ──────── */
function handleAIInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  const btn = document.getElementById('ai-send-btn');
  if (btn) btn.disabled = !el.value.trim();
  const val = el.value;
  if (val.startsWith('/') && !val.includes(' ')) {
    showAICmdPalette(val);
  } else {
    hideAICmdPalette();
  }
}

/* ── Command palette ─────────────────────────────────── */
function getAICmdItems() {
  return Array.from(document.querySelectorAll('.ai-cmd-item'));
}

function showAICmdPalette(prefix) {
  const palette = document.getElementById('ai-cmd-palette');
  if (!palette) return;
  const items = getAICmdItems();
  let anyVisible = false;
  items.forEach(item => {
    const match = item.dataset.cmd.startsWith(prefix) || prefix === '/';
    item.style.display = match ? '' : 'none';
    if (match) anyVisible = true;
  });
  palette.classList.toggle('ai-cmd-visible', anyVisible);
  if (anyVisible && aiCmdActiveIdx < 0) setAICmdActive(0);
}

function hideAICmdPalette() {
  const palette = document.getElementById('ai-cmd-palette');
  if (palette) palette.classList.remove('ai-cmd-visible');
  aiCmdActiveIdx = -1;
  getAICmdItems().forEach(i => i.classList.remove('active'));
}

function toggleAICmdPalette() {
  const palette = document.getElementById('ai-cmd-palette');
  if (!palette) return;
  if (palette.classList.contains('ai-cmd-visible')) {
    hideAICmdPalette();
  } else {
    const input = document.getElementById('ai-input');
    if (input) { input.value = '/'; handleAIInput(input); input.focus(); }
  }
}

function setAICmdActive(idx) {
  const items = getAICmdItems().filter(i => i.style.display !== 'none');
  items.forEach(i => i.classList.remove('active'));
  if (idx >= 0 && idx < items.length) {
    items[idx].classList.add('active');
    aiCmdActiveIdx = idx;
  }
}

function selectAICmd(item) {
  const input = document.getElementById('ai-input');
  if (!input) return;
  input.value = item.dataset.query;
  handleAIInput(input);
  hideAICmdPalette();
  input.focus();
}

/* ── Keyboard handler ────────────────────────────────── */
function handleAIKey(e) {
  const palette    = document.getElementById('ai-cmd-palette');
  const paletteOpen = palette && palette.classList.contains('ai-cmd-visible');

  if (paletteOpen) {
    const visible = getAICmdItems().filter(i => i.style.display !== 'none');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAICmdActive((aiCmdActiveIdx + 1) % visible.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAICmdActive((aiCmdActiveIdx - 1 + visible.length) % visible.length);
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (aiCmdActiveIdx >= 0 && visible[aiCmdActiveIdx]) selectAICmd(visible[aiCmdActiveIdx]);
    } else if (e.key === 'Escape') {
      e.preventDefault(); hideAICmdPalette();
    }
    return;
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAIMessage();
  }
}

function sendAISuggestion(text) {
  const input = document.getElementById('ai-input');
  if (!input) return;
  input.value = text;
  handleAIInput(input);
  sendAIMessage();
}

/* ── Theme toggle ────────────────────────────────────── */
const AI_SUN_ICON  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const AI_MOON_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function toggleAITheme() {
  const win  = document.getElementById('ai');
  const body = document.getElementById('ai-body');
  const btn  = document.getElementById('ai-theme-btn');
  if (!body) return;
  const isLight = body.classList.toggle('ai-light');
  if (win) win.classList.toggle('ai-light', isLight);
  if (btn) {
    btn.innerHTML = isLight ? AI_MOON_ICON : AI_SUN_ICON;
    btn.title     = isLight ? 'Switch to dark mode' : 'Switch to light mode';
  }
  localStorage.setItem('ai-theme', isLight ? 'light' : 'dark');
}

/* ── Mouse glow + command palette click wiring ───────── */
function initAIWindow() {
  const body  = document.getElementById('ai-body');
  const glow  = document.getElementById('ai-mouse-glow');
  const input = document.getElementById('ai-input');
  if (!body || !glow || !input) return;

  /* Restore saved theme (default: dark) */
  const win        = document.getElementById('ai');
  const savedTheme = localStorage.getItem('ai-theme') || 'dark';
  const btn        = document.getElementById('ai-theme-btn');
  if (savedTheme === 'light') {
    body.classList.add('ai-light');
    if (win) win.classList.add('ai-light');
    if (btn) { btn.innerHTML = AI_MOON_ICON; btn.title = 'Switch to dark mode'; }
  } else {
    if (btn) { btn.innerHTML = AI_SUN_ICON;  btn.title = 'Switch to light mode'; }
  }

  body.addEventListener('mousemove', e => {
    const r = body.getBoundingClientRect();
    glow.style.left = (e.clientX - r.left) + 'px';
    glow.style.top  = (e.clientY - r.top)  + 'px';
  });
  input.addEventListener('focus', () => glow.classList.add('ai-glow-active'));
  input.addEventListener('blur',  () => glow.classList.remove('ai-glow-active'));

  getAICmdItems().forEach(item => item.addEventListener('click', () => selectAICmd(item)));
}

function appendAIMessage(role, text) {
  const container = document.getElementById('ai-messages');
  if (!container) return;

  // Hide welcome on first message
  const welcome = container.querySelector('.ai-welcome');
  if (welcome) welcome.style.display = 'none';

  // Hide suggestions after first user message
  if (role === 'user') {
    const sugg = document.getElementById('ai-suggestions');
    if (sugg) sugg.style.display = 'none';
  }

  const row = document.createElement('div');
  row.className = `ai-msg ai-msg-${role}`;

  if (role === 'assistant') {
    const rendered = renderMarkdown(text);
    row.innerHTML = `<span class="ai-msg-avatar">🤖</span><div class="ai-msg-bubble ai-msg-md">${rendered}</div>`;
  } else {
    const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    row.innerHTML = `<div class="ai-msg-bubble">${safe}</div>`;
  }

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function showAITyping() {
  const container = document.getElementById('ai-messages');
  if (!container || container.querySelector('.ai-typing')) return;
  const el = document.createElement('div');
  el.className = 'ai-msg ai-msg-assistant ai-typing';
  el.innerHTML = `<span class="ai-msg-avatar">🤖</span>
    <div class="ai-msg-bubble ai-typing-bubble">
      <span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>
    </div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function hideAITyping() {
  const el = document.querySelector('.ai-typing');
  if (el) el.remove();
}

async function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const btn   = document.getElementById('ai-send-btn');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // Clear input
  input.value = '';
  input.style.height = 'auto';
  if (btn) btn.disabled = true;

  appendAIMessage('user', text);
  showAITyping();

  aiHistory.push({ role: 'user', content: text });

  try {
    const res  = await fetch('/api/chat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: aiHistory }),
    });
    const data = await res.json();
    hideAITyping();

    const reply = data.reply || data.error || 'Something went wrong.';
    appendAIMessage('assistant', reply);
    aiHistory.push({ role: 'assistant', content: reply });

  } catch {
    hideAITyping();
    appendAIMessage('assistant', 'Connection error. Please try again.');
  }
}

/* ───────────────────────────────────────────────────────
   6. ABOUT
─────────────────────────────────────────────────────── */
async function loadAboutContent() {
  const bio      = document.getElementById('hero-bio-text');
  const sections = document.getElementById('about-sections');
  if (!bio) return;

  const fallbackBio = "Backend, AI & DevOps engineer who loves building things at the intersection of systems and machine learning.";

  try {
    const res  = await fetch('/api/about/');
    const data = await res.json();
    const lines = (data.text || "").split('\n').map(l => l.trim()).filter(l => l);

    if (!lines.length) { bio.textContent = fallbackBio; return; }

    // First line = intro bio
    bio.textContent = lines[0];

    // Remaining lines: emoji-prefixed lines = section headers, rest = content
    const parsed = [];
    let current  = null;
    const emojiRe = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (let i = 1; i < lines.length; i++) {
      if (emojiRe.test(lines[i])) {
        if (current) parsed.push(current);
        current = { title: lines[i], items: [] };
      } else if (current) {
        current.items.push(lines[i]);
      }
    }
    if (current) parsed.push(current);

    if (!parsed.length || !sections) return;
    sections.innerHTML = '';

    parsed.forEach(sec => {
      const card = document.createElement('div');
      card.className = 'about-section';
      card.innerHTML = `<h3 class="about-sec-title">${sec.title}</h3>` +
        sec.items.map(item =>
          item.startsWith('•')
            ? `<p class="about-sec-bullet">${item}</p>`
            : `<p class="about-sec-line">${item}</p>`
        ).join('');
      sections.appendChild(card);
    });

  } catch {
    bio.textContent = fallbackBio;
  }
}

/* ───────────────────────────────────────────────────────
   6. PROJECTS
─────────────────────────────────────────────────────── */
async function loadProjects() {
  const body = document.getElementById('projects-body');
  if (!body) return;

  try {
    const res  = await fetch('/api/projects/');
    const data = await res.json();
    body.innerHTML = '';

    if (!data.projects || data.projects.length === 0) {
      body.innerHTML = '<p><em>No projects yet. Add them via the Django admin.</em></p>';
      return;
    }

    data.projects.forEach(p => {
      const item   = document.createElement('div');
      item.className = 'project-item';

      const hdr  = document.createElement('div');
      hdr.className = 'project-header';

      const link = document.createElement('a');
      link.href        = p.github_url;
      link.target      = '_blank';
      link.rel         = 'noopener noreferrer';
      link.textContent = p.name;
      link.className   = 'project-link';
      hdr.appendChild(link);

      if (p.description) {
        const toggle = document.createElement('button');
        toggle.className   = 'project-toggle';
        toggle.textContent = '+';
        toggle.title       = 'Show / hide description';

        const desc = document.createElement('div');
        desc.className = 'project-desc';
        desc.textContent = p.description;
        desc.hidden = true;

        toggle.addEventListener('click', () => {
          desc.hidden        = !desc.hidden;
          toggle.textContent = desc.hidden ? '+' : '−';
        });

        hdr.appendChild(toggle);
        item.appendChild(hdr);
        item.appendChild(desc);
      } else {
        item.appendChild(hdr);
      }

      body.appendChild(item);
    });
  } catch {
    body.innerHTML = "<p style='color:red'>Failed to load projects.</p>";
  }
}

/* ───────────────────────────────────────────────────────
   7. TERMINAL
─────────────────────────────────────────────────────── */
let cmdHistory = [];
let historyIdx = -1;

/* ── Markdown renderer (for cat <file>.md) ──────────── */
function renderMarkdown(raw) {
  const lines = raw.split('\n');
  let html    = '';
  let inList  = false;

  for (const line of lines) {
    if (/^### /.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${inlineMd(line.slice(4))}</h3>`;
    } else if (/^## /.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${inlineMd(line.slice(3))}</h2>`;
    } else if (/^# /.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${inlineMd(line.slice(2))}</h1>`;
    } else if (/^[-*] /.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inlineMd(line.slice(2))}</li>`;
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<br>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${inlineMd(line)}</p>`;
    }
  }

  if (inList) html += '</ul>';
  return html;
}

function inlineMd(text) {
  let s = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g,     '<em>$1</em>');
  s = s.replace(/`(.+?)`/g,       '<code>$1</code>');
  // [label](url) → clickable link (https, http, mailto)
  s = s.replace(/\[([^\]]+)\]\(((?:https?|mailto):[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="ai-link">$1</a>');
  // bare URLs not already inside an href
  s = s.replace(/(?<!href=")(https?:\/\/[^\s<"]+)/g,
    '<a href="$1" target="_blank" rel="noopener" class="ai-link">$1</a>');
  return s;
}

/* ── Tab-completion helpers ─────────────────────────── */
let fsTreeCache = null;

async function getOrFetchTree() {
  if (fsTreeCache) return fsTreeCache;
  try {
    const res = await fetch('/fs/tree/');
    fsTreeCache = await res.json();
    return fsTreeCache;
  } catch {
    return null;
  }
}

function getNodeAtPath(node, targetPath) {
  const norm = targetPath.replace(/\/$/, '') || '/';
  if ((node.path === norm) || (norm === '/' && node.path === '/')) return node;
  if (!node.children) return null;
  for (const child of node.children) {
    const found = getNodeAtPath(child, norm);
    if (found) return found;
  }
  return null;
}

function longestCommonPrefix(strs) {
  if (!strs.length) return '';
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (!prefix) return '';
  }
  return prefix;
}

async function handleTabComplete(input, output) {
  const val   = input.value;
  const words = val.split(' ');
  const last  = words[words.length - 1];

  const slash     = last.lastIndexOf('/');
  const dirSuffix = slash >= 0 ? last.slice(0, slash) : '';
  const namePfx   = slash >= 0 ? last.slice(slash + 1) : last;

  const lookupDir = dirSuffix
    ? (dirSuffix.startsWith('/') ? dirSuffix : currentDir.replace(/\/$/, '') + '/' + dirSuffix)
    : currentDir;

  const tree = await getOrFetchTree();
  if (!tree) return;

  const node = getNodeAtPath(tree, lookupDir);
  if (!node || !node.children) return;

  const matches = node.children
    .filter(c => c.name.startsWith(namePfx))
    .map(c => c.name + (c.type === 'folder' ? '/' : ''));

  if (!matches.length) return;

  if (matches.length === 1) {
    words[words.length - 1] = (dirSuffix ? dirSuffix + '/' : '') + matches[0];
    input.value = words.join(' ');
    return;
  }

  const hint = document.createElement('div');
  hint.className   = 'term-out';
  hint.textContent = matches.join('   ');
  output.appendChild(hint);
  scrollOutput(output);

  const common = longestCommonPrefix(matches);
  if (common.length > namePfx.length) {
    words[words.length - 1] = (dirSuffix ? dirSuffix + '/' : '') + common;
    input.value = words.join(' ');
  }
}

/* ── Recruiter fast-path ────────────────────────────── */
function runRecruiterView() {
  const apps = ['about', 'projects', 'skills'];
  apps.forEach(a => { if (!document.getElementById(a)) openApp(a); });

  requestAnimationFrame(() => {
    const pad  = 18;
    const topY = 62;
    const vw   = window.innerWidth;
    const winW = Math.floor((vw - pad * (apps.length + 1)) / apps.length);
    const winH = Math.min(460, window.innerHeight - topY - 90);

    apps.forEach((a, i) => {
      const win = document.getElementById(a);
      if (!win) return;
      win.style.left      = (pad + i * (winW + pad)) + 'px';
      win.style.top       = topY + 'px';
      win.style.width     = winW + 'px';
      win.style.height    = winH + 'px';
      win.style.maxHeight = winH + 'px';
      win.style.zIndex    = ++zIndex;
    });

    focusWindow('about');
  });
}

/* ── Terminal append helpers ────────────────────────── */
function appendPre(parent, text, cls) {
  const el = document.createElement('pre');
  el.className   = cls || 'term-out';
  el.textContent = text;
  parent.appendChild(el);
}

function appendDiv(parent, text, cls) {
  const el = document.createElement('div');
  el.className   = cls || 'term-out';
  el.textContent = text;
  parent.appendChild(el);
}

/* ── Main terminal initialiser ──────────────────────── */
function initTerminal() {
  const input   = document.getElementById('terminal-input');
  const output  = document.getElementById('terminal-output');
  const cwdSpan = document.getElementById('cwd-display');
  if (!input) return;

  input.focus();

  input.addEventListener('keydown', async (e) => {

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) historyIdx--;
      input.value = cmdHistory[historyIdx] ?? '';
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      historyIdx = Math.min(cmdHistory.length, historyIdx + 1);
      input.value = cmdHistory[historyIdx] ?? '';
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      await handleTabComplete(input, output);
      return;
    }

    if (e.key !== 'Enter') return;

    const cmd = input.value.trim();
    input.value = '';

    const echo = document.createElement('div');
    echo.innerHTML =
      `<span class="prompt-used">arya@os:${currentDir}$</span> ` +
      escapeHtml(cmd);
    output.appendChild(echo);

    if (!cmd) { scrollOutput(output); return; }

    cmdHistory.push(cmd);
    historyIdx = cmdHistory.length;

    /* ── Client-side commands ── */
    if (cmd === 'clear') { output.innerHTML = ''; return; }

    if (cmd.startsWith('theme ')) {
      const result = applyTheme(cmd.slice(6).trim());
      if (result.output) appendDiv(output, result.output, 'term-ok');
      if (result.error)  appendDiv(output, result.error,  'term-err');
      scrollOutput(output);
      return;
    }

    if (cmd === 'run recruiter-view') {
      runRecruiterView();
      appendDiv(output, '✓ Recruiter view ready.', 'term-ok');
      scrollOutput(output);
      return;
    }

    /* ── Backend commands ── */
    try {
      const res  = await fetch('/api/terminal/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cwd: currentDir, command: cmd }),
      });
      const data = await res.json();

      if (data.cwd !== undefined) {
        currentDir = data.cwd;
        if (cwdSpan) cwdSpan.textContent = currentDir;
      }

      if (data.output !== undefined) {
        const isMdCat = /^cat\s+\S+\.md$/i.test(cmd);
        if (isMdCat) {
          const div = document.createElement('div');
          div.className = 'term-md';
          div.innerHTML = renderMarkdown(data.output);
          output.appendChild(div);
        } else {
          appendPre(output, data.output, 'term-out');
        }
      }

      if (data.error) appendDiv(output, data.error, 'term-err');

      const MUTATING = ['mkdir', 'touch', 'rm', 'rmdir', 'chmod'];
      if (MUTATING.some(c => cmd.startsWith(c))) {
        fsTreeCache = null;
        window.dispatchEvent(new Event('fs:changed'));
      }

    } catch {
      appendDiv(output, 'error: backend not reachable', 'term-err');
    }

    scrollOutput(output);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function scrollOutput(el) {
  el.scrollTop = el.scrollHeight;
}

/* ───────────────────────────────────────────────────────
   8. FILE TREE
─────────────────────────────────────────────────────── */
function renderTree(node, container) {
  const item     = document.createElement('div');
  const isFolder = Array.isArray(node.children);
  item.className = isFolder ? 'tree-folder' : 'tree-file';
  item.textContent = node.name;
  container.appendChild(item);

  if (isFolder) {
    const kids = document.createElement('div');
    kids.className = 'children';
    node.children.forEach(child => renderTree(child, kids));
    container.appendChild(kids);

    item.addEventListener('click', () => {
      kids.style.display = kids.style.display === 'none' ? 'block' : 'none';
    });
  }
}

function loadFileTree() {
  const treeEl = document.getElementById('file-tree');
  if (!treeEl) return;

  fetch('/fs/tree/')
    .then(r => r.json())
    .then(data => {
      fsTreeCache = data;
      treeEl.innerHTML = '';
      if (data.error) { treeEl.textContent = data.error; return; }
      renderTree(data, treeEl);
    })
    .catch(() => { treeEl.textContent = 'Could not load file tree.'; });
}

/* ───────────────────────────────────────────────────────
   9. WELCOME TOAST
─────────────────────────────────────────────────────── */
let _welcomeTimer = null;

function showWelcome() {
  const toast = document.getElementById('welcome-toast');
  if (!toast) return;
  toast.classList.remove('dismiss');
  toast.classList.add('show');
  _welcomeTimer = setTimeout(dismissWelcome, 5000);
}

function dismissWelcome() {
  clearTimeout(_welcomeTimer);
  const toast = document.getElementById('welcome-toast');
  if (!toast || !toast.classList.contains('show')) return;
  toast.classList.add('dismiss');
  setTimeout(() => {
    toast.classList.remove('show', 'dismiss');
    toast.style.display = 'none';
  }, 460);
}

/* ───────────────────────────────────────────────────────
   10. FULL-SCREEN BOOT SEQUENCE
─────────────────────────────────────────────────────── */
const BOOT_LINES = [
  { text: '',                                                                              delay: 10  },
  { text: '[  0.001] Initializing hardware abstraction layer ...',                        delay: 30  },
  { text: '[  0.023] Loading memory manager ..................... [  OK  ]',               delay: 35  },
  { text: '[  0.045] Mounting /aryaos_storage .................. [  OK  ]',               delay: 35  },
  { text: '[  0.068] Starting Django WSGI application .......... [  OK  ]',               delay: 35  },
  { text: '[  0.112] Connecting SQLite database ................ [  OK  ]',               delay: 35  },
  { text: '[  0.145] Registering REST API endpoints:',                                    delay: 25  },
  { text: '           GET   /api/about/ ........................ [  OK  ]',               delay: 20  },
  { text: '           GET   /api/projects/ ..................... [  OK  ]',               delay: 20  },
  { text: '           POST  /api/terminal/ ..................... [  OK  ]',               delay: 20  },
  { text: '           GET   /fs/tree/ .......................... [  OK  ]',               delay: 20  },
  { text: '[  0.210] Spawning window manager ................... [  OK  ]',               delay: 35  },
  { text: '[  0.245] Loading filesystem service ................ [  OK  ]',               delay: 35  },
  { text: '[  0.278] Starting desktop environment .............. [  OK  ]',               delay: 35  },
  { text: '',                                                                              delay: 30  },
  { text: 'System ready.  Welcome, Arya.  Type  help  in Terminal.',                      delay: 25  },
];

async function typeBootLine(container, text, charDelay) {
  const el = document.createElement('div');
  container.appendChild(el);

  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    if (charDelay > 0) await new Promise(r => setTimeout(r, charDelay));
  }

  /* Highlight [  OK  ] in green */
  if (el.textContent.includes('[  OK  ]')) {
    el.innerHTML = escapeHtml(el.textContent).replace(
      /\[  OK  \]/g,
      '<span class="boot-ok">[  OK  ]</span>'
    );
  }
}

async function runFullscreenBootSequence() {
  const screen = document.getElementById('boot-screen');
  const log    = document.getElementById('boot-log');
  if (!screen || !log) return;

  for (const line of BOOT_LINES) {
    await new Promise(r => setTimeout(r, line.delay ?? 50));

    if (!line.text) {
      log.appendChild(document.createElement('br'));
      continue;
    }

    /* Print line instantly — no char-by-char delay */
    await typeBootLine(log, line.text, 0);
    log.scrollTop = log.scrollHeight;
  }

  /* Brief pause so user can read the last line */
  await new Promise(r => setTimeout(r, 300));

  screen.classList.add('fade-out');

  setTimeout(() => {
    screen.style.display = 'none';
    openApp('ai');
  }, 620);
}

/* ───────────────────────────────────────────────────────
   10. DOCK  (macOS magnification + preview tooltips)
─────────────────────────────────────────────────────── */
const APP_TITLES = {
  about: 'About', projects: 'Projects', skills: 'Skills',
  ai: 'Assistant', terminal: 'Terminal', files: 'Files',
};

let previewEl = null;

function showDockPreview(icon, appName) {
  hideDockPreview();
  previewEl = document.createElement('div');
  previewEl.className   = 'dock-preview';
  previewEl.textContent = APP_TITLES[appName] || appName;
  document.body.appendChild(previewEl);

  const rect = icon.getBoundingClientRect();
  previewEl.style.left   = (rect.left + rect.width / 2) + 'px';
  previewEl.style.bottom = (window.innerHeight - rect.top + 8) + 'px';

  requestAnimationFrame(() => previewEl && previewEl.classList.add('visible'));
}

function hideDockPreview() {
  if (previewEl) { previewEl.remove(); previewEl = null; }
}

function initDock() {
  const dock = document.getElementById('dock');
  if (!dock) return;

  const icons = [...dock.querySelectorAll('.dock-icon')];

  dock.addEventListener('mousemove', (e) => {
    icons.forEach(icon => {
      const rect       = icon.getBoundingClientRect();
      const iconCenter = rect.left + rect.width / 2;
      const dist       = Math.abs(e.clientX - iconCenter);
      const halfW      = rect.width / 2;
      const REACH      = 72; /* px from icon edge where magnification fades */

      let scale;
      if (dist <= halfW) {
        scale = 1.45;
      } else if (dist < halfW + REACH) {
        const t = 1 - (dist - halfW) / REACH;
        scale = 1 + 0.45 * t * t; /* quadratic falloff */
      } else {
        scale = 1;
      }

      const lift = scale > 1 ? -(scale - 1) * 14 : 0;
      icon.style.transform = `scale(${scale.toFixed(3)}) translateY(${lift.toFixed(1)}px)`;
    });
  });

  dock.addEventListener('mouseleave', () => {
    icons.forEach(icon => { icon.style.transform = ''; });
    hideDockPreview();
  });

  /* Preview tooltip for open apps */
  icons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      const appName = icon.dataset.app;
      if (document.getElementById(appName)) showDockPreview(icon, appName);
    });
    icon.addEventListener('mouseleave', hideDockPreview);
  });
}

/* ───────────────────────────────────────────────────────
   11. MOBILE TIME CLOCK
─────────────────────────────────────────────────────── */
function startMobileTime() {
  const el = document.getElementById('mobile-time');
  if (!el) return;

  const tick = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  tick();
  setInterval(tick, 1000);
}

/* ───────────────────────────────────────────────────────
   12. ICON CLOUD  (3-D rotating tech sphere)
─────────────────────────────────────────────────────── */
const CLOUD_ICONS = [
  { src: 'https://cdn.simpleicons.org/python/ffffff',       label: 'Python'     },
  { src: 'https://cdn.simpleicons.org/django/ffffff',       label: 'Django'     },
  { src: 'https://cdn.simpleicons.org/fastapi/ffffff',      label: 'FastAPI'    },
  { src: 'https://cdn.simpleicons.org/docker/ffffff',       label: 'Docker'     },
  { src: 'https://cdn.simpleicons.org/kubernetes/ffffff',   label: 'K8s'        },
  { src: 'https://cdn.simpleicons.org/postgresql/ffffff',   label: 'Postgres'   },
  { src: 'https://cdn.simpleicons.org/redis/ffffff',        label: 'Redis'      },
  { src: 'https://cdn.simpleicons.org/pytorch/ffffff',      label: 'PyTorch'    },
  { src: 'https://cdn.simpleicons.org/git/ffffff',          label: 'Git'        },
  { src: 'https://cdn.simpleicons.org/linux/ffffff',        label: 'Linux'      },
  { src: 'https://cdn.simpleicons.org/javascript/ffffff',   label: 'JS'         },
  { src: 'https://cdn.simpleicons.org/github/ffffff',       label: 'GitHub'     },
  { src: 'https://cdn.simpleicons.org/nodedotjs/ffffff',    label: 'Node.js'    },
  { src: 'https://cdn.simpleicons.org/amazonaws/ffffff',    label: 'AWS'        },
  { src: 'https://cdn.simpleicons.org/html5/ffffff',        label: 'HTML5'      },
  { src: 'https://cdn.simpleicons.org/css3/ffffff',         label: 'CSS3'       },
  { src: 'https://cdn.simpleicons.org/tensorflow/ffffff',   label: 'TensorFlow' },
  { src: 'https://cdn.simpleicons.org/numpy/ffffff',        label: 'NumPy'      },
];

function initIconCloud() {
  const canvas = document.getElementById('icon-cloud-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const radius = W * 0.38;

  // Fibonacci sphere: evenly distribute N points on a unit sphere
  const phi0 = (1 + Math.sqrt(5)) / 2;
  const items = CLOUD_ICONS.map((icon, i) => {
    const theta = 2 * Math.PI * i / phi0;
    const p     = Math.acos(1 - 2 * (i + 0.5) / CLOUD_ICONS.length);
    const img   = new Image();
    img.crossOrigin = 'anonymous';
    img.src = icon.src;
    return { img, label: icon.label, theta, p };
  });

  let rotY = 0;
  let rotX = 0;

  function project(theta, p) {
    // Spherical → cartesian
    const x0 = radius * Math.sin(p) * Math.cos(theta + rotY);
    const y0 = radius * Math.cos(p);
    const z0 = radius * Math.sin(p) * Math.sin(theta + rotY);
    // Rotate around X axis
    const y1 =  y0 * Math.cos(rotX) - z0 * Math.sin(rotX);
    const z1 =  y0 * Math.sin(rotX) + z0 * Math.cos(rotX);
    return { x: x0, y: y1, z: z1 };
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    rotY += 0.006;   // clockwise horizontal
    rotX += 0.003;   // continuous vertical (half speed)

    // Project + sort back-to-front
    const projected = items.map(item => {
      const pos   = project(item.theta, item.p);
      const depth = (pos.z + radius) / (2 * radius); // 0..1
      return { item, ...pos, depth };
    }).sort((a, b) => a.z - b.z);

    projected.forEach(({ item, x, y, depth }) => {
      const size  = 18 + 20 * depth;
      const alpha = 0.25 + 0.75 * depth;
      const sx    = cx + x - size / 2;
      const sy    = cy + y - size / 2;

      ctx.globalAlpha = alpha;

      if (item.img.complete && item.img.naturalWidth > 0) {
        // Circular clip + image
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx + x, cy + y, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(item.img, sx, sy, size, size);
        ctx.restore();
      } else {
        // Fallback: glowing dot
        const grad = ctx.createRadialGradient(cx+x, cy+y, 0, cx+x, cy+y, size/2);
        grad.addColorStop(0, 'rgba(167,139,250,0.9)');
        grad.addColorStop(1, 'rgba(102,126,234,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx + x, cy + y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(frame);
  }

  frame();
}

/* ───────────────────────────────────────────────────────
   13. AUTO-BOOT & GLOBAL LISTENERS
─────────────────────────────────────────────────────── */
window.onload = () => {
  initDock();
  startMobileTime();
  initIconCloud();
  runFullscreenBootSequence();
};

window.addEventListener('fs:changed', () => {
  fsTreeCache = null;
  if (document.getElementById('files')) loadFileTree();
});

console.log('AryaOS v4 loaded');
