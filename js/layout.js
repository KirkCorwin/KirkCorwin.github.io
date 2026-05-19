(function () {
  const page = document.body.dataset.page || "home";
  const enableSkully = document.body.dataset.skully !== "off";

  const navItems = [
    { id: "home", href: "index.html", label: "Home" },
    { id: "about", href: "about.html", label: "About" },
    { id: "projects", href: "projects.html", label: "Projects" },
    { id: "contact", href: "contact.html", label: "Contact" },
    { id: "game", href: "game.html", label: "Game" },
  ];

  function navHref(item) {
    const depth = document.body.dataset.depth || "0";
    if (depth === "1") return "../" + item.href;
    return item.href;
  }

  const root = document.getElementById("site-root");
  if (!root) return;

  const navLinks = navItems
    .map(
      (item) =>
        `<li><a href="${navHref(item)}" ${item.id === page ? 'aria-current="page"' : ""}>${item.label}</a></li>`
    )
    .join("");

  const brandHref = navHref({ href: "index.html" });

  root.innerHTML = `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="nav-overlay" id="nav-overlay" aria-hidden="true"></div>
    <aside class="site-sidebar" id="site-sidebar" aria-label="Site navigation">
      <div class="sidebar-brand">
        <a href="${brandHref}">Kirk Corwin</a>
        <span>Data science &amp; applied ML</span>
      </div>
      <nav>
        <ul class="site-nav">${navLinks}</ul>
      </nav>
      <div class="sidebar-footer">&copy; ${new Date().getFullYear()} Kirk Corwin</div>
    </aside>
    <div class="site-main-wrap">
      <header class="mobile-header">
        <button type="button" class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="site-sidebar">Menu</button>
        <strong>Kirk Corwin</strong>
      </header>
      <main class="site-main" id="main-content"></main>
      <footer class="site-footer">Data science · software · practical analytics</footer>
    </div>
    <div id="skully-mount"></div>
  `;

  const main = root.querySelector("#main-content");
  const pageContent = document.getElementById("page-content");
  if (pageContent && main) {
    while (pageContent.firstChild) {
      main.appendChild(pageContent.firstChild);
    }
    pageContent.remove();
  }

  const sidebar = document.getElementById("site-sidebar");
  const overlay = document.getElementById("nav-overlay");
  const toggle = document.getElementById("menu-toggle");

  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    sidebar.classList.add("open");
    overlay.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeMenu();
    else openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  if (enableSkully) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      (document.body.dataset.depth === "1" ? "../" : "") + "css/skully-widget.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      (document.body.dataset.depth === "1" ? "../" : "") + "js/skully-widget.js";
    script.defer = true;
    document.body.appendChild(script);
  }
})();
