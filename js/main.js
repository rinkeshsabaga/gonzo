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

// Contact form
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button');
  const inputs = form.querySelectorAll('input, textarea');

  const formData = {
    name: inputs[0].value,
    email: inputs[1].value,
    phone: inputs[2].value,
    message: inputs[3].value
  };

  // Change button state to sending
  const originalText = btn.textContent;
  btn.textContent = 'SENDING...';
  btn.style.background = '#C9A84C'; // Sleek gold feedback color
  btn.disabled = true;

  try {
    // ── CRM API / WEBHOOK CALL ──
    // Replace this placeholder URL with your actual CRM API endpoint or Webhook (e.g. HubSpot, Zapier, Make, custom API)
    const response = await fetch('https://api.yourcrm.com/v1/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // If your CRM requires authorization headers (note: serverless backends are recommended to hide keys):
        // 'Authorization': 'Bearer YOUR_CRM_API_KEY'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        source: 'Gonzo Kitchen Landing Page'
      })
    });

    if (response.ok) {
      console.log('Lead successfully sent to CRM');
    } else {
      console.warn('CRM API returned status:', response.status);
    }
  } catch (error) {
    // We catch the error but still let the user proceed visually so they aren't blocked
    console.error('Failed to submit lead to CRM:', error);
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
