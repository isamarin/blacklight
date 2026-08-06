/**
 * Port of packages/desktop-tauri/.../AuthScreenBackdrop.svelte
 * Smooth pointer parallax for hero backdrop image.
 */
(function () {
  const MAX_SHIFT = 20;
  const IMAGE_SCALE = 1.08;
  const EASE = 0.09;

  function initParallax(root) {
    const imageEl = root.querySelector("[data-parallax-image]");
    if (!imageEl) return;

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    let rafId;
    let motionEnabled = true;

    function applyTransform(x, y) {
      imageEl.style.transform = "translate3d(" + x + "px, " + y + "px, 0) scale(" + IMAGE_SCALE + ")";
    }

    function tick() {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      if (Math.abs(dx) < 0.04 && Math.abs(dy) < 0.04) {
        currentX = targetX;
        currentY = targetY;
        applyTransform(currentX, currentY);
        rafId = undefined;
        return;
      }
      currentX += dx * EASE;
      currentY += dy * EASE;
      applyTransform(currentX, currentY);
      rafId = requestAnimationFrame(tick);
    }

    function startAnimation() {
      if (rafId !== undefined) return;
      rafId = requestAnimationFrame(tick);
    }

    function setTarget(x, y) {
      if (!motionEnabled) return;
      targetX = x;
      targetY = y;
      startAnimation();
    }

    function onMove(event) {
      const rect = root.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      setTarget(nx * MAX_SHIFT, ny * MAX_SHIFT);
    }

    function onLeave() { setTarget(0, 0); }

    function disableMotion() {
      motionEnabled = false;
      targetX = targetY = currentX = currentY = 0;
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
        rafId = undefined;
      }
      applyTransform(0, 0);
    }

    applyTransform(0, 0);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (media.matches) disableMotion();
      else motionEnabled = true;
    };
    sync();
    media.addEventListener("change", sync);

    // Pause when off-screen
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) onLeave();
        });
      }, { threshold: 0.05 });
      io.observe(root);
    }
  }

  document.querySelectorAll("[data-parallax-root]").forEach(initParallax);
})();
