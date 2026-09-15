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

// Fine animated data-network background for the homepage hero.
// Short local connections only: no large polygon/grid shapes.
(() => {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const hero = canvas.closest('.hero');
  const ctx = canvas.getContext('2d');

  if (!hero || !ctx) return;

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  let frameId = null;

  function pointCount() {
    const area = width * height;

    if (width < 700) {
      return Math.max(
        22,
        Math.min(34, Math.round(area / 19000))
      );
    }

    return Math.max(
      54,
      Math.min(82, Math.round(area / 17000))
    );
  }

  function makePoints() {
    const total = pointCount();

    points = Array.from({ length: total }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.055,
      vy: (Math.random() - 0.5) * 0.055
    }));
  }

  function resize() {
    const rect = hero.getBoundingClientRect();

    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);

    dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    makePoints();
    draw();
  }

  function update() {
    points.forEach(point => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -15) {
        point.x = width + 15;
      }

      if (point.x > width + 15) {
        point.x = -15;
      }

      if (point.y < -15) {
        point.y = height + 15;
      }

      if (point.y > height + 15) {
        point.y = -15;
      }
    });
  }

  function draw() {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    const maxDistance =
      width < 700
        ? 105
        : 125;

    for (let i = 0; i < points.length; i++) {
      const pointA = points[i];

      for (
        let j = i + 1;
        j < points.length;
        j++
      ) {
        const pointB = points[j];

        const dx =
          pointA.x - pointB.x;

        const dy =
          pointA.y - pointB.y;

        const distanceSquared =
          dx * dx + dy * dy;

        if (
          distanceSquared >
          maxDistance * maxDistance
        ) {
          continue;
        }

        const distance =
          Math.sqrt(distanceSquared);

        const closeness =
          1 - distance / maxDistance;

        // Prevents a dense spiderweb.
        if (closeness < 0.18) {
          continue;
        }

        const alpha =
          0.035 + closeness * 0.11;

        ctx.beginPath();

        ctx.moveTo(
          pointA.x,
          pointA.y
        );

        ctx.lineTo(
          pointB.x,
          pointB.y
        );

        ctx.strokeStyle =
          `rgba(82, 194, 199, ${alpha})`;

        ctx.lineWidth = 0.65;

        ctx.stroke();
      }
    }

    // Very small junction points only.
    points.forEach(point => {
      ctx.beginPath();

      ctx.arc(
        point.x,
        point.y,
        0.65,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        'rgba(116, 217, 218, 0.16)';

      ctx.fill();
    });
  }

  function animate() {
    update();
    draw();

    frameId =
      requestAnimationFrame(animate);
  }

  const resizeObserver =
    new ResizeObserver(resize);

  resizeObserver.observe(hero);

  resize();

  if (!reduceMotion) {
    frameId =
      requestAnimationFrame(animate);
  }

  document.addEventListener(
    'visibilitychange',
    () => {
      if (reduceMotion) return;

      if (document.hidden) {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }

        frameId = null;
      } else if (!frameId) {
        frameId =
          requestAnimationFrame(animate);
      }
    }
  );
})();
