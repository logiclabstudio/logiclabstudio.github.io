async function loadComponent(el) {
  const path = el.getAttribute("data-component");
  if (!path) return;
  let html = await fetch(path, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(`Component not found: ${path}`);
    return r.text();
  });

  for (const attr of el.attributes) {
    if (!attr.name.startsWith("data-prop-")) continue;
    const key = attr.name.replace("data-prop-", "");
    const token = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    html = html.replace(token, attr.value);
  }

  el.innerHTML = html;
}

async function hydrateComponents() {
  const targets = [...document.querySelectorAll("[data-component]")];
  await Promise.all(targets.map(loadComponent));

  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.getAttribute("href") === path) {
      link.setAttribute("aria-current", "page");
    }
  });

  const yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
}

window.hydrateComponents = hydrateComponents;
