(function () {
  const root = document.querySelector("[data-showcase]");
  if (!root) return;
  const tabs = root.querySelectorAll("[data-tab]");
  const panels = root.querySelectorAll("[data-panel]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.setAttribute("aria-selected", t === tab ? "true" : "false"));
      panels.forEach((p) => {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === id);
      });
    });
  });
})();
