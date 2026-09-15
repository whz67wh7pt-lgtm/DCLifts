const menuButton = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// Subtle animated network-line background for the homepage hero.
// This intentionally avoids a particle-field look: the lines are the visual,
// with only tiny junction marks at connection points.
(() => {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  if (!ctx || !hero) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  let links = [];
  let frameId = null;
  let lastTime = 0;

  function makeNetwork() {
    const cols = width < 720 ? 5 : 8;
    const rows = width < 720 ? 4 : 5;
    const gapX = width / (cols + 1);
    const gapY = height / (rows + 1);

    nodes = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Leave some gaps so it feels like an abstract digital network,
        // rather than a full mathematical grid.
        if (Math.random() < 0.18) continue;

        const baseX = gapX * (x + 1);
        const baseY = gapY * (y + 1);

        nodes.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          ampX: 8 + Math.random() * 15,
          ampY: 5 + Math.random() * 11,
          speed: 0.00012 + Math.random() * 0.00011
        });
      }
    }

    links = [];

    // Connect each point to the closest useful neighbours.
    for (let i = 0; i < nodes.length; i++) {
      const candidates = [];
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const distance = Math.hypot(dx, dy);
        const maxDistance = Math.max(gapX, gapY) * 1.65;

        if (distance < maxDistance) {
          candidates.push({ j, distance });
        }
      }

      candidates.sort((a, b) => a.distance - b.distance);

      // Two connections per node at most keeps the background airy.
      candidates.slice(0, 2).forEach(({ j, distance }) => {
        if (!links.some(link => (link.a === i && link.b === j) || (link.a === j && link.b === i))) {
          links.push({ a: i, b: j, distance });
        }
      });
    }
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeNetwork();
    draw(0);
  }

  function update(time) {
    nodes.forEach(node => {
      node.x = node.baseX + Math.sin(time * node.speed + node.phaseX) * node.ampX;
      node.y = node.baseY + Math.cos(time * node.speed * 0.86 + node.phaseY) * node.ampY;
    });
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    // Lines are intentionally more visible than the junctions.
    links.forEach((link, index) => {
      const a = nodes[link.a];
      const b = nodes[link.b];
      if (!a || !b) return;

      const pulse = 0.5 + 0.5 * Math.sin(time * 0.00035 + index * 0.8);
      const alpha = 0.105 + pulse * 0.055;

      const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      gradient.addColorStop(0, `rgba(101, 176, 199, ${alpha})`);
      gradient.addColorStop(1, `rgba(83, 207, 202, ${alpha * 0.88})`);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // Tiny connection markers only — not a particle field.
    nodes.forEach((node, i) => {
      if (i % 2 !== 0) return;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(137, 216, 218, 0.25)';
      ctx.fill();
    });
  }

  function animate(time) {
    update(time);
    draw(time);
    frameId = requestAnimationFrame(animate);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(hero);
  resize();

  if (!reduceMotion) {
    frameId = requestAnimationFrame(animate);
  }

  document.addEventListener('visibilitychange', () => {
    if (reduceMotion) return;

    if (document.hidden) {
      cancelAnimationFrame(frameId);
      frameId = null;
    } else if (!frameId) {
      frameId = requestAnimationFrame(animate);
    }
  });
})();
