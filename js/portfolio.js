/* ============================================================
   DIGITAL SHIRU — PORTFOLIO INTERACTIONS
   Spline scene switching · lightbox for Design/Social.
   Fully defensive: no-ops until real content is wired in.
============================================================ */
(function () {
  'use strict';

  /* ---- Spline gallery — lazy-load each scene as it scrolls into view ---- */
  const splineCards = document.querySelectorAll('.spline-card[data-url]');
  if (splineCards.length) {
    const ensureSplineLib = () => {
      if (document.querySelector('script[data-spline-viewer]')) return;
      const s = document.createElement('script');
      s.type = 'module';
      s.dataset.splineViewer = '1';
      s.src = 'https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js';
      document.head.appendChild(s);
    };

    /* Safety net: a scene created while its card is off-screen can sit at the
       viewer's default canvas size until something makes it re-measure. */
    let nudgeTimer = null;
    const nudgeResize = () => {
      clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    };

    /* Scroll over a scene should scroll the page, not zoom the camera.
       Swallowing the wheel event before it reaches the canvas keeps drag-to-pan
       intact while leaving the page's own scrolling untouched (no preventDefault). */
    const blockWheelZoom = (card) => {
      card.addEventListener('wheel', (e) => e.stopPropagation(), { capture: true });
    };

    /* A Spline scene renders at a fixed world scale: shrink the container and
       it crops rather than scales down, which is why the scenes only showed a
       fragment in these cards. So render each scene at the size it was framed
       for (data-design="WxH") and CSS-scale that down into the card, which
       brings the whole composition back. */
    const applyDesignScale = (card) => {
      const holder = card.querySelector('.spline-scale');
      if (!holder) return;
      const d = (card.dataset.design || '').split('x').map(Number);
      const dw = d[0], dh = d[1];
      if (!dw || !dh) return;
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      holder.style.width = dw + 'px';
      holder.style.height = dh + 'px';
      const s = Math.max(r.width / dw, r.height / dh);
      holder.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
    };

    const loadCard = (card) => {
      if (card.dataset.loaded) return;
      card.dataset.loaded = '1';
      ensureSplineLib();
      const viewer = document.createElement('spline-viewer');
      viewer.setAttribute('url', card.dataset.url);
      const stage = card.querySelector('.spline-card-stage') || card;
      if (card.dataset.design) {
        const holder = document.createElement('div');
        holder.className = 'spline-scale';
        holder.appendChild(viewer);
        stage.appendChild(holder);
        applyDesignScale(card);
      } else {
        stage.appendChild(viewer);
      }
      const done = () => {
        card.classList.add('is-loaded');
        applyDesignScale(card);
        nudgeResize();
        setTimeout(nudgeResize, 400);
        setTimeout(nudgeResize, 1400);
      };
      viewer.addEventListener('load', done);
      viewer.addEventListener('load-complete', done);
      setTimeout(done, 9000); // fallback if the load event never fires
    };

    let rescaleTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(rescaleTimer);
      rescaleTimer = setTimeout(() => splineCards.forEach(applyDesignScale), 120);
    }, { passive: true });

    splineCards.forEach(blockWheelZoom);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { loadCard(e.target); io.unobserve(e.target); } });
      }, { rootMargin: '400px 0px' });
      splineCards.forEach(c => io.observe(c));
    } else {
      splineCards.forEach(loadCard);
    }
  }

  /* ---- TikTok lightbox — official embed, loaded on click ---- */
  const ttCards = document.querySelectorAll('.tt-card');
  if (ttCards.length) {
    let ttLb = document.getElementById('tt-lightbox');
    if (!ttLb) {
      ttLb = document.createElement('div');
      ttLb.id = 'tt-lightbox';
      ttLb.innerHTML =
        '<div class="tt-lb-frame">' +
          '<button class="tt-lb-close" aria-label="Close">✕ Close</button>' +
          '<iframe allow="autoplay; encrypted-media; fullscreen" scrolling="no"></iframe>' +
        '</div>';
      document.body.appendChild(ttLb);
      const frame = ttLb.querySelector('.tt-lb-frame');
      const iframe = ttLb.querySelector('iframe');
      const close = () => { ttLb.style.display = 'none'; iframe.src = 'about:blank'; };
      ttLb.addEventListener('click', close);
      frame.addEventListener('click', e => e.stopPropagation());
      ttLb.querySelector('.tt-lb-close').addEventListener('click', close);
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && ttLb.style.display === 'grid') close(); });
      ttLb._iframe = iframe;
    }
    ttCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.tiktok;
        if (!id) return;
        ttLb._iframe.src = 'https://www.tiktok.com/embed/v2/' + id;
        ttLb.style.display = 'grid';
      });
    });
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
