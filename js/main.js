/* ── Sticky header ── */
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Mobile nav toggle ── */
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

/* Close menu when a link is clicked */
navMenu.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(sec => observer.observe(sec));

/* ── Contact form ── */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  form.querySelectorAll('[required]').forEach(field => {
    const empty = !field.value.trim();
    field.classList.toggle('error', empty);
    if (empty) valid = false;
  });

  if (!valid) return;

  /* Simulate send — replace with fetch() to a real backend */
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Enviando…';
  btn.disabled = true;

  setTimeout(() => {
    success.textContent = '¡Gracias! Nos pondremos en contacto muy pronto.';
    form.reset();
    btn.textContent = 'Enviar Consulta';
    btn.disabled = false;
    setTimeout(() => (success.textContent = ''), 6000);
  }, 1200);
});

/* Clear error state on input */
form.querySelectorAll('[required]').forEach(field => {
  field.addEventListener('input', () => field.classList.remove('error'));
});
