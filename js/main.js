// Nav scroll
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
});
document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => { mobileMenu.classList.remove('open'); hamburger.classList.remove('active'); });
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1 });
reveals.forEach(r => observer.observe(r));

// Menu tabs
const tabs = document.querySelectorAll('.menu-tab');
const grids = document.querySelectorAll('.menu-grid');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    grids.forEach(g => g.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// ── Validation helpers ──
function normalizeIndianPhone(raw) {
  const cleaned = raw.replace(/[\s\-()]/g, ''); // strip spaces, dashes, parens
  const match = cleaned.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  return match ? '+91' + match[1] : null;
}
function isValidEmail(raw) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

// ── Cloudflare Worker proxy (hides the real QuickReply webhook + injects ownerphone) ──
const PROXY_URL = 'https://lucky-mud-bd81.rinkesh-singh.workers.dev/';

// Contact form
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button');
  const inputs = form.querySelectorAll('input, textarea');
  const emailInput = inputs[1];
  const phoneInput = inputs[2];

  // Helper: flash an error on a field + the button, then reset
  const flashError = (input, msg) => {
    input.style.borderColor = '#cc0000';
    input.focus();
    const old = btn.textContent;
    btn.textContent = msg;
    btn.style.background = '#cc0000';
    setTimeout(() => {
      btn.textContent = old;
      btn.style.background = '';
      input.style.borderColor = '';
    }, 2500);
  };

  // ── Email validation ──
  if (!isValidEmail(emailInput.value)) {
    flashError(emailInput, 'ENTER A VALID EMAIL');
    return;
  }

  // ── Phone validation (+91) ──
  const normalizedPhone = normalizeIndianPhone(phoneInput.value);
  if (!normalizedPhone) {
    flashError(phoneInput, 'ENTER A VALID +91 NUMBER');
    return;
  }

  const formData = {
    name: inputs[0].value,
    email: emailInput.value.trim(),
    phone: normalizedPhone,   // sent as +919xxxxxxxxx
    message: inputs[3].value
  };

  // Change button state to sending
  const originalText = btn.textContent;
  btn.textContent = 'SENDING...';
  btn.style.background = '#C9A84C'; // Sleek gold feedback color
  btn.disabled = true;

  try {
    // ── Call the Cloudflare Worker (NOT QuickReply directly) ──
    // The Worker validates again server-side, adds ownerphone + source,
    // and forwards to the real webhook. The browser never sees that URL.
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      console.log('Lead successfully sent');
    } else {
      console.warn('Proxy returned status:', response.status);
    }
  } catch (error) {
    // We catch the error but still let the user proceed visually so they aren't blocked
    console.error('Failed to submit lead:', error);
  }

  // Visual success feedback
  btn.textContent = 'SENT!';
  btn.style.background = '#006600';

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    btn.disabled = false;
    form.reset();
  }, 3000);
});
