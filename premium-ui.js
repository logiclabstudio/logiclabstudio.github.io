(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }
    fn();
  };

  const markMainForLoadAnimation = () => {
    const mains = document.querySelectorAll('main');
    mains.forEach((main) => main.classList.add('premium-main'));
    if (reduceMotion) {
      document.body.classList.add('premium-loaded');
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('premium-loaded');
      });
    });
  };

  const initNavbarScrollState = () => {
    const header = document.querySelector('header');
    if (!header) return;

    let ticking = false;
    const applyState = () => {
      document.body.classList.toggle('nav-scrolled', window.scrollY > 18);
      ticking = false;
    };

    applyState();
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(applyState);
    }, { passive: true });
  };

  const collectRevealNodes = () => {
    const nodes = new Set();

    document.querySelectorAll('main section').forEach((el) => nodes.add(el));
    document.querySelectorAll('.card, .tool-card, .price, .hero-card, #faq details').forEach((el) => nodes.add(el));

    document.querySelectorAll('.grid-3, .grid-2, .pricing').forEach((group) => {
      const children = Array.from(group.children);
      children.forEach((child, index) => {
        child.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
        nodes.add(child);
      });
    });

    return Array.from(nodes);
  };

  const initReveals = () => {
    const nodes = collectRevealNodes();
    if (!nodes.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    nodes.forEach((node) => node.classList.add('reveal'));

    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    nodes.forEach((node) => observer.observe(node));
  };

  const animateFaqPanel = (panel, open) => {
    const start = panel.getBoundingClientRect().height;
    const end = open ? panel.scrollHeight : 0;

    panel.style.overflow = 'hidden';
    panel.style.height = `${start}px`;

    requestAnimationFrame(() => {
      panel.style.transition = `height 320ms cubic-bezier(0.22, 1, 0.36, 1)`;
      panel.style.height = `${end}px`;
    });

    const done = () => {
      panel.style.transition = '';
      panel.style.overflow = 'hidden';
      if (open) {
        panel.style.height = 'auto';
      }
      panel.removeEventListener('transitionend', done);
    };

    panel.addEventListener('transitionend', done);
  };

  const initFaqAccordion = () => {
    const detailsNodes = Array.from(document.querySelectorAll('#faq details'));
    if (!detailsNodes.length) return;
    if (reduceMotion) return;

    detailsNodes.forEach((detail) => {
      const summary = detail.querySelector('summary');
      const answer = detail.querySelector('.faq-a');
      if (!summary || !answer) return;

      const panel = document.createElement('div');
      panel.className = 'faq-content';
      answer.parentNode.insertBefore(panel, answer);
      panel.appendChild(answer);

      if (!detail.open) {
        panel.style.height = '0px';
      }

      summary.addEventListener('click', (event) => {
        event.preventDefault();
        const opening = !detail.open;

        if (opening) {
          detail.open = true;
          panel.style.height = '0px';
          animateFaqPanel(panel, true);
          return;
        }

        panel.style.height = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => {
          animateFaqPanel(panel, false);
        });

        panel.addEventListener('transitionend', () => {
          if (!detail.open) return;
          detail.open = false;
        }, { once: true });
      });
    });
  };

  onReady(() => {
    markMainForLoadAnimation();
    initNavbarScrollState();
    initReveals();
    initFaqAccordion();
  });
})();
