// Theme: an explicit choice is stored; otherwise the system preference applies (see the inline head script).
const themeToggle = document.querySelector('.theme-toggle');

if (themeToggle) {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  // The media-scoped tag (ink, for the mobile header) stays fixed; only the default follows the theme.
  const themeColor = document.querySelector('meta[name="theme-color"]:not([media])');
  const sync = () => {
    const dark = currentTheme() === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeColor?.setAttribute('content', dark ? '#8e0b0b' : '#df0000');
  };

  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
    sync();
  });

  systemDark.addEventListener('change', sync);
  sync();
}

// Mobile navigation
const navToggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('primary-nav');

if (navToggle && navList) {
  const setOpen = (open) => {
    navToggle.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('is-open', open);
  };

  navToggle.addEventListener('click', () => {
    setOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  navList.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      navToggle.focus();
    }
  });
}

// Click-to-load YouTube embeds. Without JS the trigger is a plain link to YouTube.
document.querySelectorAll('.video[data-youtube-id]').forEach((video) => {
  const trigger = video.querySelector('.video__trigger');
  if (!trigger) return;

  trigger.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
    event.preventDefault();

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.dataset.youtubeId)}?autoplay=1&rel=0`;
    iframe.title = video.dataset.title || 'YouTube video player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;

    trigger.replaceWith(iframe);
    video.classList.add('is-playing');
    iframe.focus();
  });
});

// Contact form → Formspree. Without JS the form posts directly and Formspree shows its own confirmation.
const form = document.querySelector('[data-contact-form]');

if (form) {
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel = submit.textContent;

  const setStatus = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    setStatus('', '');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        setStatus('Thanks — your message has been sent.', 'success');
      } else {
        const data = await response.json().catch(() => ({}));
        const detail = Array.isArray(data.errors) ? data.errors.map((e) => e.message).join(' ') : '';
        setStatus(detail || 'Something went wrong sending your message. Please try again.', 'error');
      }
    } catch {
      setStatus('Your message could not be sent. Check your connection and try again.', 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = submitLabel;
      form.removeAttribute('aria-busy');
    }
  });
}
