/* ============================================================
   DIGITAL SHIRU — PORTFOLIO INTERACTIONS
   Spline scene switching · lightbox for Design/Social.
   Fully defensive: no-ops until real content is wired in.
============================================================ */
(function () {
  'use strict';

  /* ---- Spline thumbnail rail → swap featured scene ---- */
  const splineStage = document.getElementById('splineStage');
  const splineThumbs = document.querySelectorAll('.spline-thumb');
  if (splineStage && splineThumbs.length) {
    const titleEl = splineStage.querySelector('.ssc-title');
    const subEl = splineStage.querySelector('.ssc-sub');

    const ensureSplineLib = () => {
      if (document.querySelector('script[data-spline-viewer]')) return;
      const s = document.createElement('script');
      s.type = 'module';
      s.dataset.splineViewer = '1';
      s.src = 'https://unpkg.com/@splinetool/viewer@1.9.48/build/spline-viewer.js';
      document.head.appendChild(s);
    };

    const loadScene = (url, title, sub) => {
      if (!url) return; // placeholder thumbs have no URL yet
      ensureSplineLib();
      let viewer = splineStage.querySelector('spline-viewer');
      const ph = splineStage.querySelector('.spline-ph');
      if (ph) ph.style.display = 'none';
      if (!viewer) {
        viewer = document.createElement('spline-viewer');
        viewer.setAttribute('loading-anim-type', 'spinner-small-dark');
        const inner = splineStage.querySelector('.spline-stage-inner') || splineStage;
        inner.prepend(viewer);
      }
      viewer.setAttribute('url', url);
      if (titleEl && title) titleEl.textContent = title;
      if (subEl && sub) subEl.textContent = sub;
    };

    splineThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        splineThumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        loadScene(thumb.dataset.url, thumb.dataset.title, thumb.dataset.sub);
      });
    });

    // Auto-load first thumb that already has a real URL
    const firstReal = [...splineThumbs].find(t => t.dataset.url);
    if (firstReal) firstReal.click();
  }

  /* ---- Lightbox for Design + Social (opt-in via [data-lightbox]) ---- */
  const lightboxItems = document.querySelectorAll('[data-lightbox]');
  if (lightboxItems.length) {
    let lb = document.getElementById('pf-lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'pf-lightbox';
      lb.style.cssText = 'position:fixed;inset:0;z-index:9998;display:none;place-items:center;background:rgba(6,9,7,0.92);backdrop-filter:blur(8px);cursor:zoom-out;padding:5vh 5vw;';
      lb.innerHTML = '<img alt="" style="max-width:100%;max-height:90vh;border-radius:6px;box-shadow:0 40px 120px -30px #000;border:1px solid rgba(232,184,101,0.25)">';
      document.body.appendChild(lb);
      lb.addEventListener('click', () => { lb.style.display = 'none'; });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.style.display = 'none'; });
    }
    const lbImg = lb.querySelector('img');
    lightboxItems.forEach(item => {
      item.addEventListener('click', () => {
        const src = item.dataset.lightbox || item.querySelector('img')?.src;
        if (!src) return; // placeholder — nothing to open yet
        lbImg.src = src;
        lb.style.display = 'grid';
      });
    });
  }
})();
