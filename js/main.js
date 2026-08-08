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

form.querySelectorAll('[required]').forEach(field => {
  field.addEventListener('input', () => field.classList.remove('error'));
});

/* ══════════════════════════════════════
   BAG CONFIGURATOR
══════════════════════════════════════ */
let cfgStep = 1;
const TOTAL_STEPS = 4;

/* State */
const cfg = {
  tipo:      '',
  ancho:     30,
  alto:      40,
  espesor:   '80',
  material:  'Polietileno Baja Densidad (BD)',
  color:     '#d4eaf7',
  impresion: 0,
  cantidad:  1000,
  nombre:    '',
  empresa:   '',
  email:     '',
  tel:       '',
  notas:     '',
};

/* ── Step navigation ── */
window.cfgNext = function () {
  if (cfgStep < TOTAL_STEPS) { cfgStep++; cfgRender(); }
};
window.cfgPrev = function () {
  if (cfgStep > 1) { cfgStep--; cfgRender(); }
};

function cfgRender() {
  document.querySelectorAll('.config__panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === cfgStep);
  });
  document.querySelectorAll('.config__step[data-step]').forEach(s => {
    const n = +s.dataset.step;
    s.classList.toggle('active', n === cfgStep);
    s.classList.toggle('done', n < cfgStep);
  });
  cfgUpdatePreview();
}

/* ── Bag type selection ── */
document.querySelectorAll('.type-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    cfg.tipo = card.dataset.type;
    card.querySelector('input').checked = true;
    cfgUpdatePreview();
  });
});

/* ── Dimension inputs ── */
['cfg-ancho', 'cfg-alto'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    cfg[id === 'cfg-ancho' ? 'ancho' : 'alto'] = +el.value || 0;
    cfgUpdatePreview();
  });
});

document.getElementById('cfg-espesor')?.addEventListener('change', e => {
  cfg.espesor = e.target.value;
  cfgUpdatePreview();
});

/* ── Material ── */
document.querySelectorAll('input[name="cfg-material"]').forEach(r => {
  r.addEventListener('change', () => { cfg.material = r.value; cfgUpdatePreview(); });
});

/* ── Color ── */
document.getElementById('cfg-color')?.addEventListener('input', e => {
  cfg.color = e.target.value;
  cfgUpdatePreview();
});

/* ── Print pills ── */
document.getElementById('print-pills')?.addEventListener('click', e => {
  const pill = e.target.closest('.print-pill');
  if (!pill) return;
  document.querySelectorAll('.print-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  cfg.impresion = +pill.dataset.val;
  cfgUpdatePreview();
});

/* ── Quantity ── */
document.getElementById('cfg-cantidad')?.addEventListener('input', e => {
  cfg.cantidad = +e.target.value || 0;
  cfgUpdatePreview();
});

/* ── SVG bag shapes ── */
function cfgBagSVG(tipo, color) {
  const fill   = color;
  const stroke = shadeColor(color, -30);
  const hi     = lightenColor(color, 40);

  const shapes = {
    'Láminas Cortadas': `
      <rect x="20" y="30" width="160" height="200" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <line x1="20" y1="100" x2="180" y2="100" stroke="${stroke}" stroke-width="1.5" opacity=".5"/>
      <line x1="20" y1="160" x2="180" y2="160" stroke="${stroke}" stroke-width="1.5" opacity=".5"/>
      <rect x="20" y="30" width="160" height="10" rx="3" fill="${stroke}" opacity=".3"/>`,

    'Bolsas Tubo': `
      <rect x="30" y="40" width="140" height="190" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <line x1="30" y1="40" x2="170" y2="40" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="6 4"/>
      <ellipse cx="100" cy="130" rx="40" ry="55" fill="${hi}" opacity=".25"/>`,

    'Bolsas con Fuelles': `
      <rect x="30" y="40" width="140" height="190" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <line x1="30" y1="40" x2="170" y2="40" stroke="${stroke}" stroke-width="2" stroke-dasharray="5 3"/>
      <line x1="30" y1="90" x2="50" y2="110" stroke="${stroke}" stroke-width="1.5" opacity=".7"/>
      <line x1="170" y1="90" x2="150" y2="110" stroke="${stroke}" stroke-width="1.5" opacity=".7"/>
      <line x1="30" y1="180" x2="50" y2="160" stroke="${stroke}" stroke-width="1.5" opacity=".7"/>
      <line x1="170" y1="180" x2="150" y2="160" stroke="${stroke}" stroke-width="1.5" opacity=".7"/>
      <ellipse cx="100" cy="130" rx="35" ry="48" fill="${hi}" opacity=".22"/>`,

    'Bolsas Camiseta/Riñón': `
      <path d="M68,20 L48,60 L30,60 L30,230 L170,230 L170,60 L152,60 L132,20
               C124,34 114,42 100,42 C86,42 76,34 68,20Z"
            fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="100" cy="140" rx="38" ry="52" fill="${hi}" opacity=".22"/>`,

    'Bolsas Ecommerce': `
      <rect x="30" y="55" width="140" height="175" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <rect x="30" y="28" width="140" height="30" rx="4" fill="${shadeColor(color,-15)}" stroke="${stroke}" stroke-width="2"/>
      <line x1="44" y1="43" x2="156" y2="43" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="4 3" opacity=".6"/>
      <ellipse cx="100" cy="145" rx="38" ry="50" fill="${hi}" opacity=".22"/>`,

    'Bolsas con Doble Soldadura': `
      <rect x="30" y="55" width="140" height="175" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <line x1="30" y1="75" x2="170" y2="75" stroke="${stroke}" stroke-width="2.5"/>
      <line x1="30" y1="90" x2="170" y2="90" stroke="${stroke}" stroke-width="2.5"/>
      <rect x="30" y="55" width="140" height="20" rx="4" fill="${stroke}" opacity=".15"/>
      <ellipse cx="100" cy="155" rx="38" ry="48" fill="${hi}" opacity=".22"/>`,
  };

  return shapes[tipo] || shapes['Bolsas Tubo'];
}

function shadeColor(hex, pct) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + pct));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + pct));
  const b = Math.min(255, Math.max(0, (n & 0xff) + pct));
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}
function lightenColor(hex, pct) { return shadeColor(hex, pct); }

/* ── Update preview ── */
function cfgUpdatePreview() {
  const svg  = document.getElementById('cfg-bag-svg');
  const tipo = cfg.tipo || 'Bolsas Tubo';

  /* Adjust viewBox proportions roughly based on dimensions */
  const w = Math.max(cfg.ancho, 8);
  const h = Math.max(cfg.alto, 8);
  const ratio = Math.min(Math.max(h / w, 0.6), 2.5);
  const svgH = Math.round(200 * ratio);
  svg.setAttribute('viewBox', `0 0 200 ${svgH}`);

  svg.innerHTML = cfgBagSVG(tipo, cfg.color);

  /* Print color dots overlay */
  if (cfg.impresion > 0) {
    const colors = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];
    let dots = '';
    for (let i = 0; i < cfg.impresion; i++) {
      dots += `<circle cx="${32 + i * 22}" cy="${svgH - 18}" r="8" fill="${colors[i]}" stroke="white" stroke-width="1.5"/>`;
    }
    svg.innerHTML += dots;
  }

  /* Update summary */
  setText('sum-tipo',      cfg.tipo      || '—');
  setText('sum-medidas',   cfg.ancho && cfg.alto ? `${cfg.ancho} × ${cfg.alto} cm` : '—');
  setText('sum-espesor',   cfg.espesor   ? cfg.espesor + (cfg.espesor === 'Otro' ? '' : ' µ') : '—');
  setText('sum-material',  cfg.material  || '—');
  setText('sum-impresion', cfg.impresion === 0 ? 'Sin impresión' : cfg.impresion + ' color' + (cfg.impresion > 1 ? 'es' : ''));
  setText('sum-cantidad',  cfg.cantidad  ? cfg.cantidad.toLocaleString('es-AR') + ' u.' : '—');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── Build quote message ── */
function buildMessage() {
  const nombre   = document.getElementById('cfg-nombre')?.value.trim()  || '';
  const empresa  = document.getElementById('cfg-empresa')?.value.trim() || '';
  const email    = document.getElementById('cfg-email')?.value.trim()   || '';
  const tel      = document.getElementById('cfg-tel')?.value.trim()     || '';
  const notas    = document.getElementById('cfg-notas')?.value.trim()   || '';

  const imp = cfg.impresion === 0 ? 'Sin impresión' : `${cfg.impresion} color${cfg.impresion > 1 ? 'es' : ''}`;

  return `¡Hola! Quisiera solicitar una cotización:\n\n` +
    `🛍️ *Tipo de bolsa:* ${cfg.tipo || '—'}\n` +
    `📐 *Medidas:* ${cfg.ancho} cm × ${cfg.alto} cm\n` +
    `📏 *Espesor:* ${cfg.espesor}${cfg.espesor === 'Otro' ? '' : ' µ'}\n` +
    `🔩 *Material:* ${cfg.material}\n` +
    `🎨 *Impresión:* ${imp}\n` +
    `📦 *Cantidad:* ${cfg.cantidad.toLocaleString('es-AR')} unidades\n` +
    (notas ? `📝 *Notas:* ${notas}\n` : '') +
    `\n👤 *Nombre:* ${nombre || '—'}\n` +
    (empresa ? `🏢 *Empresa:* ${empresa}\n` : '') +
    (email   ? `✉️ *Email:* ${email}\n`    : '') +
    (tel     ? `📞 *Teléfono:* ${tel}\n`  : '');
}

/* ── Send via WhatsApp ── */
document.getElementById('cfg-send-wa')?.addEventListener('click', () => {
  const nombre = document.getElementById('cfg-nombre')?.value.trim();
  if (!nombre) { alert('Por favor ingresá tu nombre antes de enviar.'); return; }
  const msg = encodeURIComponent(buildMessage());
  window.open(`https://wa.me/5491144437900?text=${msg}`, '_blank');
});

/* ── Send via Email ── */
document.getElementById('cfg-send-email')?.addEventListener('click', () => {
  const nombre = document.getElementById('cfg-nombre')?.value.trim();
  if (!nombre) { alert('Por favor ingresá tu nombre antes de enviar.'); return; }
  const msg = buildMessage().replace(/\*/g, '');
  const subject = encodeURIComponent('Solicitud de cotización – ' + (cfg.tipo || 'bolsa'));
  const body    = encodeURIComponent(msg);
  window.location.href = `mailto:ventas@plasticosexclusivos.com.ar?subject=${subject}&body=${body}`;
});

/* ── Init ── */
cfgUpdatePreview();
