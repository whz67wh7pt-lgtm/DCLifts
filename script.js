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
   Connected local clusters
   ========================================================= */

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


  function getPointCount() {
    const area = width * height;

    if (width < 700) {
      return Math.max(
        24,
        Math.min(
          34,
          Math.round(area / 19000)
        )
      );
    }

    return Math.max(
      58,
      Math.min(
        82,
        Math.round(area / 17000)
      )
    );
  }


  function createPoints() {
    const total = getPointCount();

    points = [];

    for (let i = 0; i < total; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,

        vx:
          (Math.random() - 0.5) *
          0.04,

        vy:
          (Math.random() - 0.5) *
          0.04
      });
    }


    /*
      Add a little extra network density
      through the centre/right around the lift.
    */

    const extraPoints =
      width < 700
        ? 3
        : 10;

    for (let i = 0; i < extraPoints; i++) {
      points.push({
        x:
          width *
          (
            0.45 +
            Math.random() * 0.45
          ),

        y:
          height *
          (
            0.08 +
            Math.random() * 0.84
          ),

        vx:
          (Math.random() - 0.5) *
          0.035,

        vy:
          (Math.random() - 0.5) *
          0.035
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
        point.x = width + 20;
      }

      if (point.x > width + 20) {
        point.x = -20;
      }

      if (point.y < -20) {
        point.y = height + 20;
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
        ? 115
        : 145;

    const drawnConnections =
      new Set();


    /*
      Connect every point to its nearest
      2 or 3 neighbours only.
    */

    points.forEach((pointA, indexA) => {

      const neighbours = [];

      points.forEach((pointB, indexB) => {

        if (indexA === indexB) {
          return;
        }

        const dx =
          pointA.x -
          pointB.x;

        const dy =
          pointA.y -
          pointB.y;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );

        if (distance <= maxDistance) {
          neighbours.push({
            index: indexB,
            distance
          });
        }

      });


      neighbours.sort(
        (a, b) =>
          a.distance -
          b.distance
      );


      const connectionCount =
        indexA % 3 === 0
          ? 3
          : 2;


      neighbours
        .slice(0, connectionCount)
        .forEach(neighbour => {

          const indexB =
            neighbour.index;

          const connectionKey =
            indexA < indexB
              ? `${indexA}-${indexB}`
              : `${indexB}-${indexA}`;


          if (
            drawnConnections.has(
              connectionKey
            )
          ) {
            return;
          }


          drawnConnections.add(
            connectionKey
          );


          const pointB =
            points[indexB];


          const closeness =
            1 -
            neighbour.distance /
            maxDistance;


          /*
            Slightly brighter than before,
            but still subtle.
          */

          const alpha =
            0.045 +
            closeness *
            0.14;


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
              76,
              198,
              204,
              ${alpha}
            )`;


          ctx.lineWidth =
            0.75;

          ctx.stroke();

        });

    });


    /*
      Tiny network nodes.
    */

    points.forEach(point => {

      ctx.beginPath();

      ctx.arc(
        point.x,
        point.y,
        0.7,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        'rgba(125, 220, 222, 0.18)';

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

      } else if (!frameId) {

        frameId =
          requestAnimationFrame(
            animate
          );

      }

    }
  );
})();
