const menuButton = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');

    menuButton.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');

      menuButton.setAttribute(
        'aria-expanded',
        'false'
      );
    });
  });
}

document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});


// Fine animated data-network background.
// The visual is made from short local connections only.
// No giant polygon mesh and no obvious particle-field effect.

(() => {
  const canvas = document.getElementById('network-canvas');

  if (!canvas) {
    return;
  }

  const hero = canvas.closest('.hero');
  const ctx = canvas.getContext('2d');

  if (!hero || !ctx) {
    return;
  }

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let width = 0;
  let height = 0;
  let dpr = 1;

  let points = [];
  let frameId = null;


  function getPointCount() {
    const area = width * height;

    if (width < 700) {
      return Math.max(
        20,
        Math.min(
          30,
          Math.round(area / 22000)
        )
      );
    }

    return Math.max(
      50,
      Math.min(
        72,
        Math.round(area / 18500)
      )
    );
  }


  function createPoints() {
    const total = getPointCount();

    points = Array.from(
      { length: total },
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,

        vx:
          (Math.random() - 0.5) *
          0.045,

        vy:
          (Math.random() - 0.5) *
          0.045
      })
    );
  }


  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();

    width = Math.max(
      1,
      rect.width
    );

    height = Math.max(
      1,
      rect.height
    );

    dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width =
      Math.round(width * dpr);

    canvas.height =
      Math.round(height * dpr);

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    createPoints();

    drawNetwork();
  }


  function movePoints() {
    points.forEach(point => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -20) {
        point.x =
          width + 20;
      }

      if (point.x > width + 20) {
        point.x = -20;
      }

      if (point.y < -20) {
        point.y =
          height + 20;
      }

      if (point.y > height + 20) {
        point.y = -20;
      }
    });
  }


  function drawNetwork() {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    const maxDistance =
      width < 700
        ? 95
        : 120;


    for (
      let i = 0;
      i < points.length;
      i++
    ) {
      const pointA =
        points[i];

      for (
        let j = i + 1;
        j < points.length;
        j++
      ) {
        const pointB =
          points[j];

        const dx =
          pointA.x -
          pointB.x;

        const dy =
          pointA.y -
          pointB.y;

        const distanceSquared =
          dx * dx +
          dy * dy;

        if (
          distanceSquared >
          maxDistance *
          maxDistance
        ) {
          continue;
        }

        const distance =
          Math.sqrt(
            distanceSquared
          );

        const closeness =
          1 -
          distance /
          maxDistance;


        /*
        Only draw reasonably close neighbours.

        This is what stops the effect
        becoming the large polygon mesh
        you were seeing before.
        */

        if (
          closeness <
          0.28
        ) {
          continue;
        }


        const alpha =
          0.02 +
          closeness *
          0.095;


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
          `rgba(
            65,
            190,
            200,
            ${alpha}
          )`;


        ctx.lineWidth =
          0.7;

        ctx.stroke();
      }
    }


    /*
    Very small junction markers.

    These are deliberately faint
    so the effect reads as
    "connected network lines"
    rather than "floating particles".
    */

    points.forEach(point => {
      ctx.beginPath();

      ctx.arc(
        point.x,
        point.y,
        0.55,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        'rgba(115, 215, 218, 0.12)';

      ctx.fill();
    });
  }


  function animate() {
    movePoints();

    drawNetwork();

    frameId =
      requestAnimationFrame(
        animate
      );
  }


  const resizeObserver =
    new ResizeObserver(
      resizeCanvas
    );

  resizeObserver.observe(
    hero
  );

  resizeCanvas();


  if (!reduceMotion) {
    frameId =
      requestAnimationFrame(
        animate
      );
  }


  document.addEventListener(
    'visibilitychange',
    () => {

      if (reduceMotion) {
        return;
      }

      if (document.hidden) {
        if (frameId) {
          cancelAnimationFrame(
            frameId
          );
        }

        frameId = null;
      }

      else if (!frameId) {
        frameId =
          requestAnimationFrame(
            animate
          );
      }
    }
  );
})();
