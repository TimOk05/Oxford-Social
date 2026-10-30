document.body.classList.add('has-motion');

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');
const momentButtons = document.querySelectorAll('[data-moment-button]');
const heroVisual = document.querySelector('[data-hero-visual]');
const heroImage = document.querySelector('[data-hero-image]');
const heroCopy = document.querySelector('[data-moment-copy]');
const visualNote = document.querySelector('[data-visual-note]');
const themeColour = document.querySelector('meta[name="theme-color"]');

const moments = {
  day: {
    image: 'assets/images/brunch-table.jpg',
    alt: 'Cocktail with fresh mint served at Oxford Social',
    copy: 'Halal brunch, coffee and catch-ups — then 2-for-1 cocktails whenever the group chat says so.',
    note: 'Daylight · Halal brunch · Catch-ups',
    colour: '#f3ecdf'
  },
  night: {
    image: 'assets/images/bar-interior-4.jpg',
    alt: 'Neon-lit cocktail bar inside Oxford Social',
    copy: 'Brunch that rolls into 2-for-1 cocktails, DJs and late nights — all under one Oxford Street roof.',
    note: 'After dark · Cocktails · DJs',
    colour: '#151412'
  }
};

const setMenu = (open) => {
  document.body.classList.toggle('menu-open', open);
  header?.classList.toggle('menu-open', open);
  menuToggle?.setAttribute('aria-expanded', String(open));
  const label = menuToggle?.querySelector('.menu-toggle__label');

  if (label) {
    label.textContent = open ? 'Close' : 'Menu';
  }
};

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 920) {
    setMenu(false);
  }
});

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 72);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const setMoment = (moment) => {
  const next = moments[moment];

  if (!next || document.body.dataset.moment === moment) {
    return;
  }

  document.body.dataset.moment = moment;
  heroVisual?.classList.add('is-changing');

  momentButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.momentButton === moment));
  });

  if (heroCopy) {
    heroCopy.textContent = next.copy;
  }

  if (visualNote) {
    visualNote.textContent = next.note;
  }

  if (themeColour) {
    themeColour.setAttribute('content', next.colour);
  }

  const imageLoader = new Image();
  imageLoader.src = next.image;
  imageLoader.onload = () => {
    if (heroImage) {
      heroImage.src = next.image;
      heroImage.alt = next.alt;
    }
    requestAnimationFrame(() => heroVisual?.classList.remove('is-changing'));
  };
};

momentButtons.forEach((button) => {
  button.addEventListener('click', () => setMoment(button.dataset.momentButton));
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.08
  });

  revealItems.forEach((item) => observer.observe(item));
}

document.querySelectorAll('.faq details').forEach((details) => {
  details.addEventListener('toggle', () => {
    if (!details.open) {
      return;
    }

    document.querySelectorAll('.faq details[open]').forEach((openDetails) => {
      if (openDetails !== details) {
        openDetails.open = false;
      }
    });
  });
});

const year = document.querySelector('[data-year]');
if (year) {
  year.textContent = String(new Date().getFullYear());
}
