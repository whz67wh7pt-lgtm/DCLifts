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


/* =========================================================
   DATA CENTRE NETWORK BACKGROUND
   Fine, short animated connections.
   Slightly denser through the centre/right of the hero.
   ========================================================= */

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
        24,
        Math.min(
          36,
          Math.round(area / 18000)
        )
      );
    }

    return Math.max(
      62,
      Math.min(
        88,
        Math.round(area / 16000)
      )
    );
  }


  function createPoints() {
    const total = getPointCount();

    points = [];

    /*
      Main evenly distributed network
    */

    for (let i = 0; i < total; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,

        vx:
          (Math.random() - 0.5) *
          0.045,

        vy:
          (Math.random() - 0.5) *
          0.045
      });
    }


    /*
      Additional subtle density around the
      centre/right side of the hero.

      This helps the network sit behind and
      around the DataLift without becoming busy.
    */

    const extraPoints =
      width < 700
        ? 4
        : 12;

    for (let i = 0; i < extraPoints; i++) {
      points.push({
        x:
          width *
          (
            0.43 +
            Math.random() * 0.5
          ),

        y:
          height *
          (
            0.1 +
            Math.random() * 0.8
          ),

        vx:
          (Math.random() - 0.5) *
          0.04,

        vy:
          (Math.random() - 0.5) *
          0.04
      });
    }
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

    /*
      Still deliberately short.

      This prevents the effect turning back
      into the large polygon mesh.
    */

    const maxDistance =
      width < 700
        ? 105
        : 130;


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
          Only close neighbours connect.

          Slightly lower threshold than before
          gives us more short connections without
          introducing long lines.
        */

        if (
          closeness <
          0.22
        ) {
          continue;
        }


        const alpha =
          0.028 +
          closeness *
          0.12;


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
            72,
            196,
            202,
            ${alpha}
          )`;


        ctx.lineWidth =
          0.72;

        ctx.stroke();
      }
    }


    /*
      Tiny connection nodes.

      Visible enough to reinforce the
      network idea, but not enough to look
      like floating particles.
    */

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
        'rgba(120, 220, 220, 0.16)';

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
