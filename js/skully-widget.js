(function () {
  const mount = document.getElementById("skully-mount");
  if (!mount) return;

  const mobileMq = window.matchMedia("(max-width: 768px)");
  const isMobile = () => mobileMq.matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  mount.innerHTML = `
    <div id="skully-page-layer" aria-hidden="true"></div>
    <div id="skully-panel">
      <div class="skully-header">
        <div class="skully-drag-region" id="skully-drag-region" title="Drag to move">
          <h2>Skullys</h2>
        </div>
        <div class="skully-header-actions">
          <button type="button" id="skully-beam-btn">Beam 'em up</button>
          <button type="button" id="skully-collapse" aria-label="Collapse">−</button>
        </div>
      </div>
      <div id="skully-panel-body">
        <div class="skully-controls">
          <button type="button" id="addMonsterBtn">Spawn</button>
          <button type="button" id="clearSkullysBtn">Clear</button>
          <span id="skullyCounter">0</span>
        </div>
        <div id="colorSelector">
          <div class="color-swatch" style="background:grey" data-color="grey"></div>
          <div class="color-swatch" style="background:red" data-color="red"></div>
          <div class="color-swatch" style="background:orange" data-color="orange"></div>
          <div class="color-swatch" style="background:yellow" data-color="yellow"></div>
          <div class="color-swatch" style="background:green" data-color="green"></div>
          <div class="color-swatch" style="background:blue" data-color="blue"></div>
          <div class="color-swatch" style="background:violet" data-color="violet"></div>
          <div class="color-swatch rainbow" data-color="rainbow"></div>
          <div class="color-swatch darkRainbow" data-color="darkRainbow"></div>
        </div>
        <div id="skullyArena"></div>
      </div>
      <div class="skully-resize-handle" id="skully-resize" aria-label="Resize panel" title="Drag to resize"></div>
    </div>
  `;

  if (isMobile()) document.body.classList.add("has-mobile-skully");

  const pageLayer = document.getElementById("skully-page-layer");
  const panel = document.getElementById("skully-panel");
  const dragRegion = document.getElementById("skully-drag-region");
  const resizeHandle = document.getElementById("skully-resize");
  const arena = document.getElementById("skullyArena");
  const beamBtn = document.getElementById("skully-beam-btn");
  const skullyCounter = document.getElementById("skullyCounter");

  const MONSTER_W = 100;
  const MONSTER_H = 140;
  const MIN_PANEL_W = 220;
  const MIN_PANEL_H = 200;
  const TELEPORT_MS = reducedMotion ? 80 : 650;

  let location = "widget";
  let teleporting = false;
  let mouseX = 0;
  let mouseY = 0;
  let monsters = [];
  let draggingPanel = false;
  let resizingPanel = false;
  let panelOx = 0;
  let panelOy = 0;
  let resizeStart = { w: 0, h: 0, x: 0, y: 0 };

  const swatchVals = {
    grey: [0, 0, 0, 0, 20, 80],
    red: [0, 10, 25, 100, 15, 90],
    orange: [20, 40, 25, 100, 15, 90],
    yellow: [50, 60, 25, 100, 15, 90],
    green: [100, 140, 25, 100, 15, 90],
    blue: [200, 240, 25, 100, 15, 90],
    violet: [270, 300, 25, 100, 15, 90],
    rainbow: [0, 360, 90, 100, 50, 90],
    darkRainbow: [0, 360, 50, 80, 20, 70],
  };
  let currentSwatch = swatchVals.darkRainbow;

  const bodyPath =
    "m 20.749353,63.467479 c 10.592845,-6.922556 24.829019,-8.051731 24.830811,-8.053503 9.279776,0.141838 19.119533,4.377494 23.124603,6.752665 8.196378,4.966999 10.567025,10.965607 14.775295,16.656954 1.58441,3.762496 4.914249,15.825365 5.266519,21.027925 -0.0329,6.64963 -10.449174,9.22683 -11.437464,5.23191 -1.34396,-6.66078 0.319988,-10.62981 -6.434079,-16.220637 7.110327,23.541287 1.995647,30.982077 3.143147,44.845087 0.41669,6.41597 -0.268114,16.44568 -1.945756,18.79645 -3.642506,2.4805 -9.222717,3.34456 -10.626841,1.62805 -2.399544,-2.62852 -2.461999,-14.91396 -4.639889,-17.31643 -2.426182,-1.485 -20.778987,-3.45207 -25.1452,0.88803 -1.842865,4.60907 -0.602002,11.78247 -4.340541,15.98438 -3.894546,1.33163 -7.683255,0.80043 -11.524884,-2.51606 C 11.758583,142.63012 14.493008,136.24 13.998989,128.82376 13.812204,117.49505 14.704335,105.20615 18.489203,90.342836 16.169691,96.29326 11.607196,104.19803 9.9396382,105.02801 4.6916712,105.73116 0.36741643,101.55345 0.45130443,97.58448 0.49909443,94.221421 5.5244882,85.239778 8.7604062,78.798546 12.284751,72.67125 15.046935,68.168134 20.749353,63.467479 Z";
  const skullPath =
    "m 7.4115599,33.097112 c 0.0693,6.277777 3.3977301,9.579657 2.14662,15.174807 -1.32138,5.9094 2.0376801,9.7647 4.4405901,10.67807 3.53505,5.69314 2.65116,9.5346 4.11192,13.14554 1.05873,2.10599 8.34281,1.88951 9.25622,0.58684 0.9134,-1.30266 0.4508,-2.73379 0.86599,-3.60223 1.49291,-0.75685 0.48071,3.44396 1.39565,4.26101 1.70929,2.81705 7.47732,2.81444 8.17551,0.96146 0.50393,-1.33743 1.17972,-3.91055 1.17972,-3.91055 1.26251,-0.72571 0.0691,2.9798 1.88014,4.06934 1.41163,2.01937 6.90461,2.51631 8.79779,0.0298 1.5155,-3.74508 0.0298,-5.97222 5.45022,-5.15361 7.2575,0.0203 7.92308,-3.94499 9.522,-8.7617 0.13384,-1.7925 7.09549,-5.22814 9.11608,-8.25101 3.57144,-4.28224 4.73444,-15.049928 5.66554,-21.233388 7.457432,-30.47505597 -68.51669,-49.96537 -72.0039901,2.005621 z";

  function getActiveContainer() {
    return location === "page" ? pageLayer : arena;
  }

  function updateBeamButton() {
    if (location === "widget") {
      beamBtn.textContent = "Beam 'em up";
      beamBtn.title = "Send Skullys to roam the page";
    } else {
      beamBtn.textContent = "Beam 'em down";
      beamBtn.title = "Return Skullys to the widget";
    }
    pageLayer.classList.toggle("skully-page-active", location === "page");
    pageLayer.setAttribute("aria-hidden", location === "page" ? "false" : "true");
  }

  function getSidebarMinLeft() {
    const sidebarW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-w")) || 248;
    return isMobile() ? 8 : sidebarW + 12;
  }

  function getPageBounds() {
    const wrap = document.querySelector(".site-main-wrap");
    if (!wrap) {
      return { left: getSidebarMinLeft(), top: 0, width: window.innerWidth - getSidebarMinLeft(), height: window.innerHeight };
    }
    const r = wrap.getBoundingClientRect();
    let top = r.top;
    if (isMobile()) {
      const panelRect = panel.getBoundingClientRect();
      if (panelRect.bottom > r.top) top = panelRect.bottom;
    }
    return {
      left: r.left,
      top,
      width: r.width,
      height: Math.max(200, window.innerHeight - top - 8),
    };
  }

  function syncPageLayerBounds() {
    const b = getPageBounds();
    pageLayer.style.left = b.left + "px";
    pageLayer.style.top = b.top + "px";
    pageLayer.style.width = b.width + "px";
    pageLayer.style.height = b.height + "px";
  }

  function containerSize() {
    const c = getActiveContainer();
    return { w: c.clientWidth, h: c.clientHeight };
  }

  function clientToContainer(cx, cy) {
    const r = getActiveContainer().getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top };
  }

  function clampMonster(m) {
    const { w, h } = containerSize();
    const groundY = Math.max(0, h - MONSTER_H);
    m.x = Math.max(0, Math.min(Math.max(0, w - MONSTER_W), m.x));
    m.y = Math.max(0, Math.min(groundY, m.y));
  }

  function clampPanelPos(left, top) {
    const margin = 8;
    const minLeft = getSidebarMinLeft();
    const maxLeft = window.innerWidth - panel.offsetWidth - margin;
    const minTop = margin;
    const maxTop = window.innerHeight - panel.offsetHeight - margin;
    return {
      left: Math.max(minLeft, Math.min(maxLeft, left)),
      top: Math.max(minTop, Math.min(maxTop, top)),
    };
  }

  function clampPanelSize(w, h) {
    const maxW = Math.min(520, window.innerWidth - getSidebarMinLeft() - 16);
    const maxH = Math.min(window.innerHeight * 0.85, 600);
    return {
      w: Math.max(MIN_PANEL_W, Math.min(maxW, w)),
      h: Math.max(MIN_PANEL_H, Math.min(maxH, h)),
    };
  }

  function applyPanelSize(w, h) {
    const c = clampPanelSize(w, h);
    panel.style.width = c.w + "px";
    panel.style.height = c.h + "px";
    return c;
  }

  function savePanelState() {
    if (isMobile()) return;
    const payload = {
      left: parseInt(panel.style.left, 10) || null,
      top: parseInt(panel.style.top, 10) || null,
      width: panel.offsetWidth,
      height: panel.offsetHeight,
    };
    if (panel.style.right && !panel.style.left) {
      payload.anchor = "bottom-right";
    }
    localStorage.setItem("skullyPanelState", JSON.stringify(payload));
  }

  function loadPanelState() {
    if (isMobile()) return;
    try {
      const s = JSON.parse(localStorage.getItem("skullyPanelState") || "{}");
      if (s.width && s.height) applyPanelSize(s.width, s.height);
      if (s.anchor === "bottom-right") {
        panel.style.right = "24px";
        panel.style.bottom = "24px";
      } else if (typeof s.left === "number" && typeof s.top === "number") {
        const c = clampPanelPos(s.left, s.top);
        panel.style.right = "auto";
        panel.style.bottom = "auto";
        panel.style.left = c.left + "px";
        panel.style.top = c.top + "px";
      } else {
        panel.style.right = "24px";
        panel.style.bottom = "24px";
      }
    } catch (_) {
      panel.style.right = "24px";
      panel.style.bottom = "24px";
    }
  }

  function randomHSL(hMin, hMax, sMin, sMax, lMin, lMax) {
    const h = Math.floor(Math.random() * (hMax - hMin) + hMin);
    const s = Math.floor(Math.random() * (sMax - sMin) + sMin);
    const l = Math.floor(Math.random() * (lMax - lMin) + lMin);
    return `hsl(${h},${s}%,${l}%)`;
  }

  function createMonsterElement(bodyColor, skullColor, eyeColor) {
    const div = document.createElement("div");
    div.className = "monster-wrapper";
    div.innerHTML = `<svg viewBox="0 -20 200 280"><g class="monster-group">
      <path class="monster-body" fill="${bodyColor}" d="${bodyPath}"/>
      <g class="monster-skull" transform="translate(50,40)">
        <path fill="${skullColor}" d="${skullPath}"/>
        <path class="monster-eye" fill="${eyeColor}" d="m 44.8338,36.757882 c -5.26075,3.488957 -6.41693,17.309177 -3.42419,19.118827 8.08455,4.88857 21.06668,0.39968 22.51648,-4.08167 C 68.32604,38.194715 49.41917,33.701627 44.8338,36.757882 Z"/>
        <path class="monster-eye" fill="${eyeColor}" d="m 26.25076,36.52978 c -6.83721,0.914915 -15.27746,5.354139 -11.27222,15.508699 2.68617,6.81029 16.57061,3.22299 17.91425,0.56081 2.33527,-4.62691 -0.5952,-16.289971 -6.64203,-16.069509 z"/>
      </g></g></svg>`;
    getActiveContainer().appendChild(div);
    return div;
  }

  function newMonsterState(el) {
    const { w } = containerSize();
    return {
      el,
      head: el.querySelector(".monster-skull"),
      x: Math.random() * Math.max(0, w - MONSTER_W),
      y: 10,
      vx: 0,
      vy: 0,
      facing: 1,
      walkTime: 0,
      dragOffsetX: 0,
      dragOffsetY: 0,
      dragging: false,
      blinking: false,
      onGround: true,
      speed: 0.012,
      facingTimer: 0,
    };
  }

  function updateCounter() {
    skullyCounter.textContent = String(monsters.length);
  }

  function screenPosForMonster(m) {
    const r = getActiveContainer().getBoundingClientRect();
    return { x: r.left + m.x + MONSTER_W / 2, y: r.top + m.y + MONSTER_H / 2 };
  }

  function spawnBeamFx(screenX, screenY, goingUp) {
    const fx = document.createElement("div");
    fx.className = "skully-beam-fx " + (goingUp ? "beam-up" : "beam-down");
    const height = goingUp ? 140 : 120;
    fx.style.left = screenX + "px";
    fx.style.top = goingUp ? screenY - height + 20 + "px" : screenY - height + 40 + "px";
    fx.style.height = height + "px";
    fx.innerHTML = '<div class="beam-core"></div>';
    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), TELEPORT_MS + 200);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function playTeleportAnimation(m, phase, beamUp) {
    return new Promise((resolve) => {
      const sp = screenPosForMonster(m);
      const isOut = phase === "out";
      spawnBeamFx(sp.x, sp.y, beamUp);
      const beamDy = beamUp ? "-90px" : "90px";
      m.el.style.setProperty("--beam-dy", beamDy);
      m.el.classList.add("skully-teleporting", isOut ? "skully-beam-out" : "skully-beam-in");

      const done = () => {
        m.el.classList.remove("skully-teleporting", "skully-beam-out", "skully-beam-in");
        m.el.style.removeProperty("--beam-dy");
        resolve();
      };

      if (reducedMotion) {
        done();
        return;
      }

      m.el.addEventListener("animationend", done, { once: true });
      setTimeout(done, TELEPORT_MS + 100);
    });
  }

  function reparentMonster(m, targetContainer, newX, newY) {
    targetContainer.appendChild(m.el);
    m.x = newX;
    m.y = newY;
    m.vx = 0;
    m.vy = 0;
    m.dragging = false;
    clampMonster(m);
  }

  async function beamAll(targetLocation) {
    if (teleporting || monsters.length === 0) return;
    teleporting = true;
    beamBtn.disabled = true;
    document.getElementById("addMonsterBtn").disabled = true;

    const goingUp = targetLocation === "page";
    const fromContainer = getActiveContainer();
    const toContainer = goingUp ? pageLayer : arena;

    if (goingUp) syncPageLayerBounds();

    const snapshot = monsters.map((m) => ({
      m,
      fromX: m.x,
      fromY: m.y,
      fromRect: fromContainer.getBoundingClientRect(),
    }));

    await Promise.all(
      snapshot.map(({ m }, i) => wait(i * 90).then(() => playTeleportAnimation(m, "out", goingUp)))
    );

    snapshot.forEach(({ m, fromX, fromY, fromRect }) => {
      const screenX = fromRect.left + fromX;
      const screenY = fromRect.top + fromY;
      const toRect = toContainer.getBoundingClientRect();
      reparentMonster(m, toContainer, screenX - toRect.left, screenY - toRect.top);
    });

    location = targetLocation;
    updateBeamButton();

    await Promise.all(
      monsters.map((m, i) => wait(i * 90).then(() => playTeleportAnimation(m, "in", goingUp)))
    );

    teleporting = false;
    beamBtn.disabled = false;
    document.getElementById("addMonsterBtn").disabled = false;
    savePanelState();
  }

  beamBtn.addEventListener("click", () => {
    if (isMobile()) return;
    if (location === "widget") beamAll("page");
    else beamAll("widget");
  });

  document.getElementById("addMonsterBtn").addEventListener("click", () => {
    if (teleporting) return;
    const el = createMonsterElement(
      randomHSL(currentSwatch[0], currentSwatch[1], currentSwatch[2], currentSwatch[3], currentSwatch[4], currentSwatch[5]),
      randomHSL(0, 60, 60, 90, 90, 98),
      randomHSL(0, 360, 20, 60, 0, 40)
    );
    monsters.push(newMonsterState(el));
    updateCounter();
  });

  document.getElementById("clearSkullysBtn").addEventListener("click", () => {
    monsters.forEach((m) => m.el.remove());
    monsters = [];
    updateCounter();
  });

  document.getElementById("skully-collapse").addEventListener("click", () => {
    panel.classList.toggle("collapsed");
  });

  let lastTime = performance.now();
  function animate() {
    const now = performance.now();
    const dt = now - lastTime;
    lastTime = now;
    if (location === "page") syncPageLayerBounds();

    const { w, h } = containerSize();
    const groundY = Math.max(0, h - MONSTER_H);

    monsters.forEach((m) => {
      if (m.el.classList.contains("skully-teleporting")) return;

      m.walkTime += dt;
      const bodyAngle = Math.sin(m.walkTime * 0.008) * 5;
      const headAngle = Math.sin(m.walkTime * 0.02) * 2;

      if (!m.dragging && !teleporting) {
        const dist = Math.hypot(mouseX - m.x, mouseY - m.y);
        if (dist < 120) {
          m.vx += (mouseX - m.x) * m.speed * 0.035;
          m.vy += (mouseY - m.y) * m.speed * 0.02;
        } else {
          m.vx += (Math.random() - 0.5) * 0.08;
        }
        m.vy += 0.35;
        m.vx *= 0.98;
        if (m.onGround && Math.random() < 0.0025) {
          m.vy = -5 - Math.random() * 2;
          m.onGround = false;
        }
        m.x += m.vx;
        m.y += m.vy;
        if (m.x <= 0) {
          m.x = 0;
          m.vx = Math.abs(m.vx) * 0.4;
        }
        if (m.x >= w - MONSTER_W) {
          m.x = w - MONSTER_W;
          m.vx = -Math.abs(m.vx) * 0.4;
        }
        if (m.y > groundY) {
          m.y = groundY;
          m.vy *= -0.25;
          m.onGround = true;
        }
        clampMonster(m);
        if (m.vx > 0.08) m.facing = -1;
        if (m.vx < -0.08) m.facing = 1;
      } else if (m.dragging) {
        clampMonster(m);
      }

      m.el.style.transform = `translate(${m.x}px,${m.y}px) scaleX(${m.facing}) rotate(${bodyAngle}deg)`;
      if (m.head) m.head.style.transform = `rotate(${headAngle}deg)`;
    });
    requestAnimationFrame(animate);
  }
  animate();

  function bindMonsterDrag() {
    const onDown = (e, cx, cy, target) => {
      if (teleporting) return;
      monsters.forEach((m) => {
        if (target.closest(".monster-wrapper") === m.el) {
          const p = clientToContainer(cx, cy);
          m.dragging = true;
          m.dragOffsetX = p.x - m.x;
          m.dragOffsetY = p.y - m.y;
          m.vx = m.vy = 0;
          e.preventDefault();
        }
      });
    };

    arena.addEventListener("mousedown", (e) => onDown(e, e.clientX, e.clientY, e.target));
    pageLayer.addEventListener("mousedown", (e) => onDown(e, e.clientX, e.clientY, e.target));

    const onMove = (cx, cy) => {
      const p = clientToContainer(cx, cy);
      mouseX = p.x;
      mouseY = p.y;
      monsters.forEach((m) => {
        if (m.dragging) {
          m.x = p.x - m.dragOffsetX;
          m.y = p.y - m.dragOffsetY;
          clampMonster(m);
        }
      });
    };

    document.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));

    const onUp = () => {
      monsters.forEach((m) => {
        if (m.dragging) m.dragging = false;
      });
    };
    document.addEventListener("mouseup", onUp);
    window.addEventListener("blur", onUp);
  }
  bindMonsterDrag();

  document.querySelectorAll(".color-swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach((s) => (s.style.border = "2px solid transparent"));
      sw.style.border = "2px solid var(--accent-hover, #7566a8)";
      currentSwatch = swatchVals[sw.dataset.color];
    });
  });

  function stopPanelDrag() {
    if (!draggingPanel) return;
    draggingPanel = false;
    panel.classList.remove("skully-panel-dragging");
    document.body.classList.remove("skully-panel-dragging");
    const c = clampPanelPos(parseInt(panel.style.left, 10) || 0, parseInt(panel.style.top, 10) || 0);
    panel.style.left = c.left + "px";
    panel.style.top = c.top + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    savePanelState();
  }

  function stopPanelResize() {
    if (!resizingPanel) return;
    resizingPanel = false;
    document.body.classList.remove("skully-panel-resizing");
    savePanelState();
    monsters.forEach(clampMonster);
  }

  if (!isMobile()) {
    loadPanelState();
    panel.style.position = "fixed";

    dragRegion.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      draggingPanel = true;
      panel.classList.add("skully-panel-dragging");
      document.body.classList.add("skully-panel-dragging");
      const r = panel.getBoundingClientRect();
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.style.left = r.left + "px";
      panel.style.top = r.top + "px";
      panelOx = e.clientX - r.left;
      panelOy = e.clientY - r.top;
    });

    resizeHandle.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      resizingPanel = true;
      document.body.classList.add("skully-panel-resizing");
      resizeStart = {
        w: panel.offsetWidth,
        h: panel.offsetHeight,
        x: e.clientX,
        y: e.clientY,
      };
    });

    document.addEventListener("mousemove", (e) => {
      if (!(e.buttons & 1)) {
        stopPanelDrag();
        stopPanelResize();
        return;
      }
      if (resizingPanel) {
        const dw = e.clientX - resizeStart.x;
        const dh = e.clientY - resizeStart.y;
        applyPanelSize(resizeStart.w + dw, resizeStart.h + dh);
        const c = clampPanelPos(parseInt(panel.style.left, 10) || 0, parseInt(panel.style.top, 10) || 0);
        panel.style.left = c.left + "px";
        panel.style.top = c.top + "px";
        monsters.forEach(clampMonster);
        return;
      }
      if (draggingPanel) {
        const c = clampPanelPos(e.clientX - panelOx, e.clientY - panelOy);
        panel.style.left = c.left + "px";
        panel.style.top = c.top + "px";
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        stopPanelDrag();
        stopPanelResize();
      }
    });

    window.addEventListener("resize", () => {
      syncPageLayerBounds();
      if (panel.style.left) {
        const c = clampPanelPos(parseInt(panel.style.left, 10) || 0, parseInt(panel.style.top, 10) || 0);
        panel.style.left = c.left + "px";
        panel.style.top = c.top + "px";
      }
      applyPanelSize(panel.offsetWidth, panel.offsetHeight);
      monsters.forEach(clampMonster);
    });
  } else {
    document.body.insertBefore(panel, document.body.firstChild);
    beamBtn.disabled = true;
    beamBtn.title = "Beam on desktop only";
  }

  updateBeamButton();
  syncPageLayerBounds();

  mobileMq.addEventListener("change", () => location.reload());
})();
