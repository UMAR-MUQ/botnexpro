// ── Telegram Web App ──────────────────────────────────────
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Telegram theme ranglarini olish
document.documentElement.style.setProperty(
  '--accent', tg.themeParams.button_color || '#4f8ef7'
);

// ── Sahifa almashtirish ───────────────────────────────────
function openPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');

  // Zakaz sahifasiga kelsak — step1 ko'rsatish
  if (name === 'order') resetOrderSteps();

  window.scrollTo(0, 0);
}

// ── Zakaz turlari ─────────────────────────────────────────
function selectOrderType(type) {
  document.getElementById('order-step-1').classList.add('hidden');

  if (type === 'bot') {
    document.getElementById('order-step-bot').classList.remove('hidden');
  } else {
    document.getElementById('order-step-website').classList.remove('hidden');
  }
}

function backToStep1() {
  document.getElementById('order-step-bot').classList.add('hidden');
  document.getElementById('order-step-website').classList.add('hidden');
  document.getElementById('order-success').classList.add('hidden');
  document.getElementById('order-step-1').classList.remove('hidden');
}

function resetOrderSteps() {
  document.getElementById('order-step-1').classList.remove('hidden');
  document.getElementById('order-step-bot').classList.add('hidden');
  document.getElementById('order-step-website').classList.add('hidden');
  document.getElementById('order-success').classList.add('hidden');
}

function resetOrder() {
  openPage('home');
}

// ── Zakaz yuborish ────────────────────────────────────────
async function submitOrder(type) {
  let name, desc, phone;

  if (type === 'bot') {
    name  = document.getElementById('bot-name').value.trim();
    desc  = document.getElementById('bot-desc').value.trim();
    phone = document.getElementById('bot-phone').value.trim();
  } else {
    name  = document.getElementById('web-name').value.trim();
    desc  = document.getElementById('web-desc').value.trim();
    phone = document.getElementById('web-phone').value.trim();
  }

  if (!name || !desc || !phone) {
    tg.showAlert('⚠️ Iltimos, barcha maydonlarni to\'ldiring!');
    return;
  }

  const user = tg.initDataUnsafe?.user;
  const userName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'Noma\'lum';
  const username = user?.username ? `@${user.username}` : 'username yo\'q';

  const orderType = type === 'bot' ? '🤖 Telegram Bot' : '🌐 Web Sayt';

  const text =
    `🔔 *Yangi zakaz! — NexCode.uz*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📦 *Tur:* ${orderType}\n` +
    `📝 *Nomi:* ${name}\n` +
    `💬 *Tavsif:*\n${desc}\n` +
    `📞 *Telefon:* ${phone}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Telegram:* ${userName}\n` +
    `🔗 *Username:* ${username}`;

  try {
    // Botga ma'lumot yuborish
    await fetch('/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.error('Yuborishda xato:', e);
  }

  // Muvaffaqiyat ekrani
  document.getElementById('order-step-bot').classList.add('hidden');
  document.getElementById('order-step-website').classList.add('hidden');
  document.getElementById('order-step-1').classList.add('hidden');
  document.getElementById('order-success').classList.remove('hidden');

  // Formalarni tozalash
  ['bot-name','bot-desc','bot-phone','web-name','web-desc','web-phone']
    .forEach(id => { document.getElementById(id).value = ''; });
}

// ── Banner Slider ─────────────────────────────────────────
let currentSlide = 0;
const totalSlides = 3;

function goSlide(index) {
  currentSlide = index;
  document.getElementById('bannerSlider').style.transform =
    `translateX(-${currentSlide * 100}%)`;

  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

// Avtomatik slider
setInterval(() => {
  goSlide((currentSlide + 1) % totalSlides);
}, 3500);

// ── "Biz haqimizda" ma'lumotini serverdan olish ───────────
async function loadAbout() {
  try {
    const res = await fetch('/about-info');
    if (res.ok) {
      const data = await res.json();
      if (data.text)     document.getElementById('about-text').textContent     = data.text;
      if (data.phone)    document.getElementById('contact-phone').textContent  = data.phone;
      if (data.telegram) document.getElementById('contact-telegram').textContent = data.telegram;
      if (data.instagram)document.getElementById('contact-instagram').textContent = data.instagram;
      if (data.projects) document.getElementById('stat-projects').textContent  = data.projects;
      if (data.clients)  document.getElementById('stat-clients').textContent   = data.clients;
      if (data.years)    document.getElementById('stat-years').textContent     = data.years;
    }
  } catch (e) {
    console.log('Ma\'lumot yuklanmadi');
  }
}

loadAbout();
