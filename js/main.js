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
  tipo:       '',
  ancho:      30,
  alto:       40,
  espesor:    '80',
  fuelle:     5,
  fuelleTipo: 'lateral',
  material:   'Polietileno Baja Densidad (BD)',
  color:      '#d4eaf7',
  impresion:  0,
  cantidad:   1000,
  logoDataUrl: null,
  logoName:    '',
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
    cfgToggleFuelle();
    cfgUpdatePreview();
  });
});

/* ── Dimension inputs ── */
['cfg-ancho', 'cfg-alto'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    cfg[id === 'cfg-ancho' ? 'ancho' : 'alto'] = +el.value || 0;
    cfgClampFuelle();
    cfgUpdateFuelleDisclaimer();
    cfgUpdatePreview();
  });
});

document.getElementById('cfg-espesor')?.addEventListener('input', e => {
  let v = +e.target.value;
  if (v < 25) { v = 25; e.target.value = 25; }
  if (v > 200) { v = 200; e.target.value = 200; }
  cfg.espesor = v ? String(v) : '';
  cfgUpdatePreview();
});

/* ── Fuelle input ── */
document.getElementById('cfg-fuelle')?.addEventListener('input', e => {
  const maxF = cfgFuelleMax();
  let v = +e.target.value || 0;
  if (v > maxF) { v = maxF; e.target.value = maxF; }
  cfg.fuelle = v;
  cfgUpdateFuelleDisclaimer();
  cfgUpdatePreview();
});

function cfgFuelleMax() {
  const dim = cfg.fuelleTipo === 'americano' ? cfg.alto : cfg.ancho;
  return Math.max(1, +(dim / 2 - 2.5).toFixed(1));
}

function cfgClampFuelle() {
  const input = document.getElementById('cfg-fuelle');
  if (!input) return;
  const maxF = cfgFuelleMax();
  input.max = maxF;
  if (cfg.fuelle > maxF) {
    cfg.fuelle = maxF;
    input.value = maxF;
  }
}

/* ── Fuelle tipo radio ── */
document.querySelectorAll('input[name="cfg-fuelle-tipo"]').forEach(r => {
  r.addEventListener('change', () => {
    cfg.fuelleTipo = r.value;
    cfgUpdateFuelleTipoUI();
    cfgClampFuelle();
    cfgUpdateFuelleDisclaimer();
    cfgUpdatePreview();
  });
});

function cfgUpdateFuelleTipoUI() {
  const desc  = document.getElementById('fuelle-tipo-desc');
  const label = document.getElementById('fuelle-dim-label');
  const unit  = document.getElementById('fuelle-unit-label');
  if (cfg.fuelleTipo === 'americano') {
    if (desc)  desc.textContent  = 'Pliegue horizontal en la base de la bolsa. Forma el fondo al llenarse.';
    if (label) label.innerHTML   = 'Alto del fuelle (cm)';
    if (unit)  unit.textContent  = 'cm de fondo';
  } else {
    if (desc)  desc.textContent  = 'Pliegues verticales en los costados de la bolsa.';
    if (label) label.innerHTML   = 'Ancho del fuelle (cm) <span class="fuelle-each">— por cada lado</span>';
    if (unit)  unit.textContent  = 'cm por lado';
  }
}

function cfgUpdateFuelleDisclaimer() {
  const txt = document.getElementById('fuelle-disclaimer-text');
  if (!txt) return;
  const maxF = cfgFuelleMax();
  if (cfg.fuelleTipo === 'americano') {
    txt.innerHTML =
      `El fuelle americano de <strong>${cfg.fuelle} cm</strong> forma el fondo de la bolsa ` +
      `mediante un pliegue horizontal en la base. El ancho de la bolsa no se modifica. ` +
      `<em>Máximo permitido: ${maxF} cm (alto ÷ 2 − 2,5).</em>`;
  } else {
    txt.innerHTML =
      `El fuelle lateral de <strong>${cfg.fuelle} cm</strong> crea pliegues verticales en cada costado ` +
      `que le dan profundidad a la bolsa al abrirse. El ancho de la bolsa no se modifica. ` +
      `<em>Máximo permitido: ${maxF} cm (ancho ÷ 2 − 2,5).</em>`;
  }
}

function cfgToggleFuelle() {
  const sec = document.getElementById('fuelle-section');
  if (!sec) return;
  const show = cfg.tipo === 'Bolsas con Fuelles';
  sec.style.display = show ? 'block' : 'none';
  if (show) {
    cfgUpdateFuelleTipoUI();
    cfgClampFuelle();
    cfgUpdateFuelleDisclaimer();
  }
}

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

/* ── Logo upload ── */
const logoInput    = document.getElementById('cfg-logo');
const uploadArea   = document.getElementById('upload-area');
const placeholder  = document.getElementById('upload-placeholder');
const previewBox   = document.getElementById('upload-preview');
const thumbImg     = document.getElementById('upload-thumb');
const fileNameEl   = document.getElementById('upload-filename');
const clearBtn     = document.getElementById('upload-clear');

logoInput?.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  cfg.logoName = file.name;

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = ev => {
      cfg.logoDataUrl = ev.target.result;
      thumbImg.src = ev.target.result;
      showUploadPreview(file.name);
      cfgUpdatePreview();
    };
    reader.readAsDataURL(file);
  } else {
    /* Non-image file (PDF, AI, EPS) — show filename only, no image preview */
    cfg.logoDataUrl = null;
    thumbImg.src = '';
    showUploadPreview(file.name);
    cfgUpdatePreview();
  }
});

function showUploadPreview(name) {
  placeholder.style.display = 'none';
  previewBox.style.display  = 'flex';
  fileNameEl.textContent    = name;
  if (!cfg.logoDataUrl) thumbImg.style.display = 'none';
  else thumbImg.style.display = 'block';
}

clearBtn?.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  cfg.logoDataUrl = null;
  cfg.logoName    = '';
  logoInput.value = '';
  placeholder.style.display = '';
  previewBox.style.display  = 'none';
  thumbImg.src = '';
  cfgUpdatePreview();
});

/* Drag & drop support */
uploadArea?.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--cyan)'; });
uploadArea?.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
uploadArea?.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  logoInput.files = dt.files;
  logoInput.dispatchEvent(new Event('change'));
});

/* ── SVG bag shapes ── */
function cfgBagSVG(tipo, color, fuelle) {
  const fill   = color;
  const stroke = shadeColor(color, -30);
  const hi     = lightenColor(color, 40);
  /* Proportional fuelle strip width (10–45px based on fuelle vs ancho) */
  const totalW   = Math.max(cfg.ancho + fuelle * 2, 1);
  const fuellePx = Math.round((fuelle / totalW) * 150);
  const fp = Math.min(Math.max(fuellePx, 10), 45);

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

    'Bolsas con Fuelles': cfg.fuelleTipo === 'americano' ? `
      <rect x="25" y="30" width="150" height="210" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <rect x="25" y="${240-fp}" width="150" height="${fp}" rx="4" fill="${shadeColor(fill,-18)}" opacity=".55"/>
      <line x1="25" y1="${240-fp}" x2="175" y2="${240-fp}" stroke="${stroke}" stroke-width="2" opacity=".6"/>
      <ellipse cx="100" cy="${240-fp/2}" rx="40" ry="${Math.round(fp*0.35)}" fill="${shadeColor(fill,-28)}" opacity=".25"/>` : `
      <rect x="25" y="30" width="150" height="210" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <rect x="25" y="30" width="${fp}" height="210" rx="4" fill="${shadeColor(fill,-18)}" opacity=".5"/>
      <rect x="${175-fp}" y="30" width="${fp}" height="210" rx="4" fill="${shadeColor(fill,-18)}" opacity=".5"/>
      <line x1="${25+fp}" y1="30" x2="${25+fp}" y2="240" stroke="${stroke}" stroke-width="2" opacity=".6"/>
      <line x1="${175-fp}" y1="30" x2="${175-fp}" y2="240" stroke="${stroke}" stroke-width="2" opacity=".6"/>`,

    'Bolsas Camiseta/Riñón': `
      <!-- Bag body -->
      <rect x="25" y="38" width="150" height="198" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <!-- Oval die-cut handle hole -->
      <ellipse cx="100" cy="60" rx="36" ry="17" fill="white" stroke="${stroke}" stroke-width="2.5"/>
      <!-- Subtle body highlight -->
      <ellipse cx="100" cy="150" rx="42" ry="60" fill="${hi}" opacity=".22"/>
      <!-- Bottom seam line -->
      <line x1="25" y1="225" x2="175" y2="225" stroke="${stroke}" stroke-width="1.5" opacity=".4"/>`,

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

  svg.innerHTML = cfgBagSVG(tipo, cfg.color, cfg.fuelle);

  /* Logo overlay */
  if (cfg.logoDataUrl) {
    const lx = 60, ly = Math.round(svgH * 0.28), lw = 80, lh = 80;
    svg.innerHTML += `<image href="${cfg.logoDataUrl}" x="${lx}" y="${ly}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMid meet" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.18))"/>`;
  }

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
  const fuelleLabel  = cfg.fuelleTipo === 'americano' ? 'fuelle americano' : 'fuelle lateral';
  const fuelleSuffix = cfg.tipo === 'Bolsas con Fuelles' ? ` + ${fuelleLabel} ${cfg.fuelle} cm` : '';
  setText('sum-medidas',   cfg.ancho && cfg.alto ? `${cfg.ancho} × ${cfg.alto} cm${fuelleSuffix}` : '—');
  setText('sum-espesor',   cfg.espesor   ? cfg.espesor + ' µ' : '—');
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
    `📐 *Medidas:* ${cfg.ancho} cm × ${cfg.alto} cm${cfg.tipo === 'Bolsas con Fuelles' ? ` | Fuelle ${cfg.fuelleTipo === 'americano' ? 'americano (base)' : 'lateral'}: ${cfg.fuelle} cm` : ''}\n` +
    `📏 *Espesor:* ${cfg.espesor ? cfg.espesor + ' µ' : '—'}\n` +
    `🔩 *Material:* ${cfg.material}\n` +
    `🎨 *Impresión:* ${imp}\n` +
    `📦 *Cantidad:* ${cfg.cantidad.toLocaleString('es-AR')} unidades\n` +
    (cfg.logoName ? `🖼️ *Logo/diseño:* ${cfg.logoName} (adjunto por separado)\n` : '') +
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

/* ══════════════════════════════════════
   INTERACTIVE FEATURES
══════════════════════════════════════ */

/* ── Scroll reveal ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── Stat counter animation ── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function runCounter(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const val = Math.round(easeOutCubic(progress) * target);
    el.textContent = val.toLocaleString('es-AR') + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.classList.add('counted');
  }
  requestAnimationFrame(tick);
}

const statObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat__number[data-count]').forEach(runCounter);
    statObs.unobserve(entry.target);
  });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.stats');
if (statsSection) statObs.observe(statsSection);

/* ── 3D card tilt ── */
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / r.height) * -10;
    const ry = ((x - r.width  / 2) / r.width)  *  10;
    card.style.transition = 'box-shadow .28s cubic-bezier(.4,0,.2,1)';
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    card.style.boxShadow = `0 20px 50px rgba(12,26,46,.18), 0 0 0 1px rgba(41,184,217,.2)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1), box-shadow .55s cubic-bezier(.4,0,.2,1)';
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

/* ── Hero orb parallax on scroll ── */
const orbs = document.querySelectorAll('.hero__orb');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (orbs[0]) orbs[0].style.transform = `translateY(${y * 0.25}px)`;
  if (orbs[1]) orbs[1].style.transform = `translateY(${y * 0.15}px)`;
}, { passive: true });
