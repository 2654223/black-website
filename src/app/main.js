const ASSET_BASE = window.SITE_BASE ?? '';
const categories = [
  { id: '001', slug: 'profile', title: '关于我', titleEn: 'About Me', summary: '个人介绍', summaryEn: 'Personal introduction', catAsset: `${ASSET_BASE}public/images/cats/cat-01-lounge.png`, folder: '05-个人素材与项目资料', achievements: [['庞可欣 / Black · 研二学生；本科与硕士均就读于西安邮电大学', 'Black · second-year master’s student; bachelor’s and master’s studies at Xi’an University of Posts and Telecommunications'], ['03 | vibe coding | 医学图像安全', '03 | vibe coding | Medical Image Security'], ['各项成果证明', 'Achievement certificates']] },
  { id: '002', slug: 'research', title: '论文与科研', titleEn: 'Research & Publications', summary: '医学图像安全方向的科研探索与学术成果', summaryEn: 'Research exploration and academic work in medical image security', catAsset: `${ASSET_BASE}public/images/cats/cat-02-peek.png`, folder: '02-论文与科研', achievements: [['医学图像安全与隐私保护', 'Medical image security and privacy protection'], ['参与可逆数据隐藏、图像认证相关研究', 'Research in reversible data hiding and image authentication'], ['SCI 四区论文相关学术成果', 'Academic work related to a Q4 SCI publication']] },
  { id: '003', slug: 'patents', title: '专利与技术实践', titleEn: 'Patents & Technical Practice', summary: '从研究想法到技术方案的实践成果', summaryEn: 'Applied work translating research ideas into technical solutions', catAsset: `${ASSET_BASE}public/images/cats/cat-03-curl.png`, folder: '03-专利与技术成果', achievements: [['参与团队国家专利申请', 'Contributed to a national patent application'], ['RGB-D 语义分割相关技术方案', 'Technical work related to RGB-D semantic segmentation'], ['关注研究成果的可实现性和应用价值', 'Focused on practicality and application value']] },
  { id: '004', slug: 'experience', title: '实习与职业实践', titleEn: 'Internship & Practice', summary: '视觉算法实践与持续成长', summaryEn: 'Computer vision practice and continuous growth', catAsset: `${ASSET_BASE}public/images/cats/cat-04-sleep.png`, folder: '04-实习与职业材料', achievements: [['视觉算法实习经历', 'Internship experience in computer vision algorithms'], ['参与真实问题的分析、实现与验证', 'Analysis, implementation, and validation of real-world problems'], ['在协作与交付中建立工程视角', 'Building an engineering perspective through collaboration and delivery']] },
  { id: '005', slug: 'awards', title: '竞赛与创新', titleEn: 'Awards & Innovation', summary: '创新创业、软件创新与信息技术相关经历', summaryEn: 'Innovation, software, and information technology experiences', catAsset: `${ASSET_BASE}public/images/cats/cat-05-hold.png`, folder: '01-竞赛与奖项', achievements: [['国家级大学生创新创业训练计划', 'National Student Innovation & Entrepreneurship Training Program'], ['全国大学生软件创新大赛：区域赛一等奖、全国总决赛三等奖', 'Software Innovation Competition: regional first prize and national third prize'], ['信息技术创新应用、互联网+、信息安全相关赛事获奖经历', 'Awards in information technology, Internet+, and information security competitions']] },
];

const app = document.querySelector('#app');
const rain = document.querySelector('#rain');
let rotation = 0;
let active = 0;
let dragging = false;
let moved = false;
let startX = 0;
let startRotation = 0;
let lastX = 0;
let velocity = 0;
let raf = 0;
let unmountProofCarousel = null;
let proofFallbackTimer = null;

function clearProofCarousel() {
  unmountProofCarousel?.();
  unmountProofCarousel = null;
  clearInterval(proofFallbackTimer);
  proofFallbackTimer = null;
}

function makeRain() {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 36; i += 1) {
    const drop = document.createElement('i');
    drop.className = 'drop';
    drop.style.setProperty('--x', `${Math.random() * 100}%`);
    drop.style.setProperty('--size', `${3 + Math.random() * 10}px`);
    drop.style.setProperty('--delay', `${Math.random() * -8}s`);
    drop.style.setProperty('--duration', `${6 + Math.random() * 8}s`);
    drop.style.setProperty('--drift', `${-25 + Math.random() * 50}px`);
    drop.style.setProperty('--opacity', `${0.15 + Math.random() * 0.3}`);
    fragment.append(drop);
  }
  rain.append(fragment);
}

function pad(n) { return String(n).padStart(3, '0'); }

function nearestIndex() {
  const slot = 360 / categories.length;
  return ((Math.round(-rotation / slot) % categories.length) + categories.length) % categories.length;
}

function renderCards() {
  const currentStage = document.querySelector('#orbit-stage');
  if (!currentStage) return;
  const radius = Math.min(280, Math.max(155, currentStage.clientWidth * 0.34));
  const verticalRadius = radius * 0.46;
  currentStage.querySelectorAll('.cat-card').forEach((card, index) => {
    const slot = 360 / categories.length;
    const angle = (index * slot) + rotation;
    const radians = angle * Math.PI / 180;
    const depth = Math.cos(radians);
    const x = Math.sin(radians) * radius;
    const y = Math.cos(radians) * verticalRadius;
    const scale = 0.76 + ((depth + 1) / 2) * 0.28;
    const opacity = 0.48 + ((depth + 1) / 2) * 0.52;
    card.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
    card.style.opacity = opacity;
    card.style.zIndex = String(100 + Math.round(depth * 50));
    card.classList.toggle('is-active', index === active);
  });
  const item = categories[active];
  document.querySelector('#active-number').textContent = `${pad(active + 1)} / ${pad(categories.length)}`;
  document.querySelector('#active-title').textContent = item.title;
  document.querySelector('#active-summary').textContent = item.summary;
}

function snapToNearest() {
  const slot = 360 / categories.length;
  const target = Math.round(rotation / slot) * slot;
  const from = rotation;
  const started = performance.now();
  cancelAnimationFrame(raf);
  function tick(now) {
    const t = Math.min(1, (now - started) / 420);
    const eased = 1 - (1 - t) ** 4;
    rotation = from + (target - from) * eased;
    active = nearestIndex();
    renderCards();
    if (t < 1) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}

function rotateBy(delta) {
  rotation += delta;
  active = nearestIndex();
  renderCards();
}

function rotateToIndex(index) {
  const slot = 360 / categories.length;
  const baseTarget = -index * slot;
  const turns = Math.round((rotation - baseTarget) / 360);
  const target = baseTarget + turns * 360;
  const from = rotation;
  const started = performance.now();
  cancelAnimationFrame(raf);
  active = index;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    rotation = target;
    renderCards();
    return;
  }
  renderCards();
  function tick(now) {
    const t = Math.min(1, (now - started) / 560);
    const eased = 1 - (1 - t) ** 4;
    rotation = from + (target - from) * eased;
    renderCards();
    if (t < 1) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}

function categoryDetail(item) {
  cancelAnimationFrame(raf);
  clearProofCarousel();
  document.title = `${item.title} — Black`;
  app.innerHTML = `
    <section class="detail-view" aria-labelledby="detail-title">
      <a class="back-link" href="#">← Back / 返回</a>
      <p class="detail-kicker">${item.id} / CATEGORY DETAIL</p>
      <h1 id="detail-title">${item.title}</h1>
      <p class="english-title">${item.titleEn}</p>
      <div class="detail-grid">
        <img src="${item.catAsset}" alt="${item.title} — ${item.titleEn}" />
        <div>
          <div class="detail-copy"><strong>${item.summary}</strong><br>${item.summaryEn}</div>
          <p class="outcome-label">SELECTED OUTCOMES / 成果概览</p>
          <ul class="detail-list">${item.achievements.map(([zh, en], index) => `<li>${item.slug === 'profile' && index === 2 ? `<a class="proof-entry" href="#proofs" aria-label="查看各项成果证明"><small>${item.id}.${index + 1}</small><span>${zh} ↗</span><em>${en}</em></a>` : `<small>${item.id}.${index + 1}</small><span>${zh}</span><em>${en}</em>`}</li>`).join('')}</ul>
        </div>
      </div>
      <nav class="detail-nav" aria-label="Category navigation">
        <a class="back-link" href="#category=${categories[(categories.indexOf(item) - 1 + categories.length) % categories.length].slug}">← Previous</a>
        <a class="back-link" href="#category=${categories[(categories.indexOf(item) + 1) % categories.length].slug}">Next →</a>
      </nav>
    </section>`;
  app.querySelectorAll('a[href="#"]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); history.pushState({}, '', '#'); renderHome(); }));
}

function renderHome() {
  clearProofCarousel();
  document.title = 'Black — Personal Archive';
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#">BLACK <b>/ PERSONAL ARCHIVE</b></a>
      <div class="topbar-actions"><span class="language">中文 / EN</span><button class="contact-link" id="contact-trigger" type="button">Contact / 联系</button></div>
    </header>
    <section class="hero-copy">
      <p class="eyebrow">001 — 005 / personal archive</p>
      <h1>Softly  curious.<br><em>Quietly  building.</em></h1>
      <p>我是庞可欣，英文名 <em>Black</em>。<br>一名研二学生，关注医学图像安全，也用 vibe coding 探索技术、视觉与表达。</p>
    </section>
    <section class="stage-wrap" aria-label="Personal categories">
      <div id="orbit-stage" class="orbit-stage" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Five personal categories">
        <div class="orbit-center" aria-hidden="true"></div>
        ${categories.map((item, index) => `<button class="cat-card" type="button" data-index="${index}" aria-label="${item.title}, ${item.titleEn}"><img src="${item.catAsset}" alt="" draggable="false"><span class="cat-label"><span class="cat-number">${item.id}</span><span class="cat-name">${item.title}</span><span class="cat-name-en">${item.titleEn}</span></span></button>`).join('')}
        <div class="stage-caption" aria-live="polite"><span id="active-number" class="caption-number"></span><h2 id="active-title"></h2><p id="active-summary"></p><div class="hint">Drag · Arrow keys · Click to center · Click again for detail</div></div>
      </div>
    </section>
    <footer class="footer"><span>Xi'an / China</span><span>Medical Image Security · Vibe Coding</span></footer>
    <dialog id="contact-modal" class="contact-modal" aria-labelledby="contact-title">
      <button class="modal-close" id="contact-close" type="button" aria-label="关闭">×</button>
      <p class="detail-kicker">CONTACT / 联系方式</p>
      <h2 id="contact-title">找到我</h2>
      <p class="contact-note">如果你想聊聊医学图像安全、视觉算法或 vibe coding，欢迎联系。</p>
      <div class="contact-details">
        <a href="tel:13050987345"><span>电话</span><strong>13050987345</strong></a>
        <a href="mailto:2252246606@qq.com"><span>邮箱</span><strong>2252246606@qq.com</strong></a>
      </div>
    </dialog>`;
  bindStage();
  bindContact();
  renderCards();
}

function bindContact() {
  const trigger = document.querySelector('#contact-trigger');
  const modal = document.querySelector('#contact-modal');
  const close = document.querySelector('#contact-close');
  if (!trigger || !modal || !close) return;
  trigger.addEventListener('click', () => modal.showModal());
  close.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });
}

function bindStage() {
  const currentStage = document.querySelector('#orbit-stage');
  currentStage.querySelectorAll('.cat-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (moved && event.detail !== 0) return;
      const index = Number(card.dataset.index);
      const angle = index * (360 / categories.length) + rotation;
      const distanceToCenter = Math.abs(((angle + 180) % 360 + 360) % 360 - 180);
      if (index !== active || distanceToCenter > 0.1) {
        rotateToIndex(index);
        return;
      }
      const item = categories[index];
      history.pushState({}, '', `#category=${item.slug}`);
      categoryDetail(item);
    });
    card.addEventListener('pointerenter', () => card.classList.add('is-hover'));
    card.addEventListener('pointerleave', () => card.classList.remove('is-hover'));
  });
  currentStage.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    cancelAnimationFrame(raf);
    dragging = true;
    moved = false;
    startX = event.clientX;
    lastX = event.clientX;
    startRotation = rotation;
    velocity = 0;
    // Preserve the button as the click target; capture the stage only for a real drag.
    const card = event.target.closest('.cat-card');
    if (card) card.setPointerCapture(event.pointerId);
  });
  currentStage.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    if (!moved) {
      if (Math.abs(event.clientX - startX) <= 6) return;
      moved = true;
      currentStage.dataset.dragging = 'true';
      currentStage.setPointerCapture(event.pointerId);
    }
    velocity = event.clientX - lastX;
    rotation = startRotation + (event.clientX - startX) * 0.24;
    active = nearestIndex();
    lastX = event.clientX;
    renderCards();
  });
  currentStage.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    currentStage.dataset.dragging = 'false';
    if (moved) {
      rotation += velocity * 0.8;
      snapToNearest();
    }
  });
  currentStage.addEventListener('pointercancel', () => { dragging = false; currentStage.dataset.dragging = 'false'; snapToNearest(); });
  currentStage.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); rotateBy(360 / categories.length); snapToNearest(); } if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); rotateBy(-360 / categories.length); snapToNearest(); } if (event.key === 'Enter' && event.target === currentStage) { event.preventDefault(); const item = categories[active]; history.pushState({}, '', `#category=${item.slug}`); categoryDetail(item); } });
}

function renderRoute() {
  if (location.hash === '#proofs') {
    renderProofs();
    return;
  }
  const slug = new URLSearchParams(location.hash.replace('#', '?')).get('category');
  const item = categories.find((entry) => entry.slug === slug);
  if (item) categoryDetail(item); else renderHome();
}

function renderProofs() {
  clearProofCarousel();
  document.title = '各项成果证明 — Black';
  app.innerHTML = `
    <section class="proof-view" aria-labelledby="proof-title">
      <a class="back-link" href="#category=profile">← 返回关于我</a>
      <p class="detail-kicker">001.3 / ACHIEVEMENT CERTIFICATES</p>
      <h1 id="proof-title">各项成果证明</h1>
      <p class="english-title">Achievement certificates</p>
      <div id="proof-carousel-root" aria-label="成果证明图片轮播"></div>
    </section>`;
  const mount = document.querySelector('#proof-carousel-root');
  try {
    unmountProofCarousel = window.BlackProofCarousel.mountProofCarousel(mount);
  } catch {
    renderProofFallback(mount);
  }
}

function renderProofFallback(mount) {
  try {
    const items = window.PROOF_ITEMS;
    if (document.querySelector('#proof-carousel-root') !== mount || !items.length) return;

    mount.innerHTML = `
      <div class="proof-fallback">
        <div class="proof-fallback-stage" aria-label="成果证明图片轮播">
          <button class="proof-fallback-arrow prev" type="button" aria-label="上一张">‹</button>
          <figure class="proof-fallback-card" data-position="previous"><img alt=""></figure>
          <figure class="proof-fallback-card" data-position="next"><img alt=""></figure>
          <figure class="proof-fallback-card" data-position="current"><img alt=""></figure>
          <button class="proof-fallback-arrow next" type="button" aria-label="下一张">›</button>
        </div>
        <div class="proof-caption" aria-live="polite"><span></span><strong></strong><a target="_blank" rel="noopener noreferrer">查看完整图片 ↗</a></div>
      </div>`;
    let index = 0;
    const cards = mount.querySelectorAll('.proof-fallback-card');
    const caption = mount.querySelector('.proof-caption');
    function show() {
      const positions = [index - 1, index + 1, index];
      cards.forEach((card, cardIndex) => {
        const item = items[(positions[cardIndex] + items.length) % items.length];
        const img = card.querySelector('img');
        img.src = new URL(`${ASSET_BASE}${item.image}`, document.baseURI).href;
        img.alt = card.dataset.position === 'current' ? item.alt : '';
      });
      caption.querySelector('span').textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      caption.querySelector('strong').textContent = items[index].title;
      caption.querySelector('a').href = new URL(`${ASSET_BASE}${items[index].image}`, document.baseURI).href;
    }
    mount.querySelector('.prev').addEventListener('click', () => { index = (index - 1 + items.length) % items.length; show(); });
    mount.querySelector('.next').addEventListener('click', () => { index = (index + 1) % items.length; show(); });
    show();
    proofFallbackTimer = window.setInterval(() => { index = (index + 1) % items.length; show(); }, 5000);
  } catch {
    if (document.querySelector('#proof-carousel-root') === mount) {
      mount.textContent = '图片暂时无法加载，请刷新后重试。';
    }
  }
}

makeRain();
window.addEventListener('popstate', renderRoute);
window.addEventListener('hashchange', renderRoute);
renderRoute();
const welcomeModal = document.querySelector('#welcome-modal');
document.querySelector('#welcome-close').addEventListener('click', () => welcomeModal.close());
document.querySelector('#welcome-start').addEventListener('click', () => welcomeModal.close());
welcomeModal.addEventListener('click', (event) => { if (event.target === welcomeModal) welcomeModal.close(); });
welcomeModal.showModal();
