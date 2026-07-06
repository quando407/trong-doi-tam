const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });
revealEls.forEach((el) => observer.observe(el));

// Hero parallax
const hero = document.querySelector('.hero-v3');
window.addEventListener('scroll', () => {
  if (!hero) return;
  const y = window.scrollY;
  const bg = document.querySelector('.hero-bg-img');
  const title = document.querySelector('.title-img');
  const drum = document.querySelector('.drum-img');
  const max = Math.min(y, window.innerHeight);
  if (bg) bg.style.transform = `scale(1.04) translateY(${max * 0.08}px)`;
  if (title) title.style.transform = `translateX(-50%) translateY(${max * -0.035}px)`;
  if (drum) drum.style.filter = `drop-shadow(0 34px 28px rgba(28,0,0,.55)) drop-shadow(0 0 ${38 + max * 0.02}px rgba(255,180,64,.36))`;
}, { passive: true });

// Interactive book: closed on scroll, click once for page 1, click twice for page 2
const bookWrap = document.querySelector('.book-wrap');
const leftPageParagraphs = document.querySelectorAll('.page-left p');
const rightPageParagraphs = document.querySelectorAll('.page-right p');
const chapterNav = document.querySelector('.chapter-nav');
let bookStep = 0;
let isRevealingBook = false;

function revealParagraphs(paragraphs, startDelay = 220) {
  paragraphs.forEach((p, index) => {
    setTimeout(() => p.classList.add('show'), startDelay + index * 380);
  });
}

function advanceBook() {
  if (!bookWrap || isRevealingBook || bookStep >= 2) return;
  isRevealingBook = true;
  bookStep += 1;

  if (bookStep === 1) {
    bookWrap.classList.remove('book-closed');
    bookWrap.classList.add('open-left');
    setTimeout(() => {
      revealParagraphs(leftPageParagraphs, 80);
      isRevealingBook = false;
    }, 820);
    return;
  }

  if (bookStep === 2) {
    bookWrap.classList.add('open-right');
    setTimeout(() => revealParagraphs(rightPageParagraphs, 80), 120);
    setTimeout(() => {
      chapterNav?.classList.add('visible');
      isRevealingBook = false;
    }, 120 + rightPageParagraphs.length * 380 + 260);
  }
}

if (bookWrap) {
  bookWrap.addEventListener('click', (event) => {
    if (event.target.closest('.chapter-nav')) return;
    advanceBook();
  });
  bookWrap.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      advanceBook();
    }
  });
}

// Count-up stats disabled here; v34 controlled counter below.

// Process tabs
const stepData = [
  { no: '01', title: 'Làm tang trống', video: 'assets/video/cong-doan-1.mp4', body: 'Sau khi thanh gỗ được luộc chín và đưa vào máy uốn thành hình vòng cung, người thợ bước vào khâu ghép tang để tạo hình quả trống. Các mép ghép phải đều tăm tắp để khi dựng lên, quả trống tròn đều, các mạch ghép khít rịt, không có khe hở.' },
  { no: '02', title: 'Làm mặt trống', video: 'assets/video/cong-doan-2.mp4', body: 'Da phải được xử lý ngay khi mới cắt tiết để mặt da còn tươi nguyên. Người làm dùng dao bào đặt riêng để nạo sạch lớp váng thịt thừa, rồi phơi đủ nắng để da đạt độ dẻo và bền.' },
  { no: '03', title: 'Căng mặt trống', video: 'assets/video/cong-doan-3.mp4', body: 'Khi tang trống đã tròn phom và da trâu đủ độ khô dẻo, người thợ dùng tời kích kéo căng mặt da từ bốn phía, dẫm trực tiếp lên mặt trống và liên tục thẩm âm.' },
  { no: '04', title: 'Làm đẹp trống', video: 'assets/video/cong-doan-4.mp4', body: 'Sau khi âm thanh đạt độ tròn, trong và thanh thoát, chiếc đinh tre cuối cùng được chốt xuống. Từ đó, tiếng trống được giữ lại trước khi bước sang khâu sơn vẽ hoa văn hoàn thiện.' }
];
const stepButtons = document.querySelectorAll('.step');
const stepCard = document.querySelector('.step-card');
stepButtons.forEach((button) => {
  button.addEventListener('click', () => {
    stepButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const data = stepData[Number(button.dataset.step)];
    stepCard.innerHTML = `<p class="step-number">${data.no}</p><h3>${data.title}</h3><div class="step-video-placeholder">Video công đoạn ${data.no} · <code>${data.video}</code></div><p>${data.body}</p>`;
  });
});

// Secret card
const secretButton = document.querySelector('.secret-card');
const secretDetail = document.querySelector('.secret-detail');
if (secretButton && secretDetail) {
  secretButton.addEventListener('click', () => {
    const isOpen = secretButton.getAttribute('aria-expanded') === 'true';
    secretButton.setAttribute('aria-expanded', String(!isOpen));
    secretDetail.hidden = isOpen;
    secretButton.querySelector('span').textContent = isOpen ? 'Chạm để mở' : 'Đã mở';
  });
}

// Mini game: Ghép trống Đọi Tam
const gameBank = document.querySelector('.game-bank');
const gamePieces = document.querySelectorAll('.game-piece');
const dropSlots = document.querySelectorAll('.drop-slot');
const gameMessage = document.querySelector('.game-message');
const checkGameButton = document.querySelector('.check-game');
const resetGameButton = document.querySelector('.reset-game');
let draggedPiece = null;
let selectedPiece = null;

function clearSlotStates() {
  dropSlots.forEach((slot) => slot.classList.remove('correct', 'wrong', 'drag-over'));
  if (gameMessage) gameMessage.classList.remove('success', 'error');
}
function sortBankPieces() {
  if (!gameBank) return;
  [...gameBank.querySelectorAll('.game-piece')]
    .sort((a, b) => Number(a.dataset.shuffle || a.dataset.order) - Number(b.dataset.shuffle || b.dataset.order))
    .forEach((piece) => gameBank.appendChild(piece));
}
function placePiece(piece, slot) {
  if (!piece || !slot) return;
  clearSlotStates();
  const existing = slot.querySelector('.game-piece');
  if (existing && existing !== piece && gameBank) {
    existing.classList.remove('selected');
    gameBank.appendChild(existing);
  }
  slot.appendChild(piece);
  piece.classList.add('placed');
  piece.classList.remove('selected');
  selectedPiece = null;
  if (gameMessage) gameMessage.textContent = 'Tiếp tục ghép các công đoạn còn lại.';
}
function returnPieceToBank(piece) {
  if (!piece || !gameBank) return;
  clearSlotStates();
  piece.classList.remove('placed', 'selected');
  gameBank.appendChild(piece);
  sortBankPieces();
  selectedPiece = null;
}

gamePieces.forEach((piece) => {
  piece.addEventListener('dragstart', () => {
    draggedPiece = piece;
    piece.classList.add('selected');
  });
  piece.addEventListener('dragend', () => {
    piece.classList.remove('selected');
    draggedPiece = null;
  });
  piece.addEventListener('click', () => {
    const inSlot = piece.closest('.drop-slot');
    if (inSlot) {
      returnPieceToBank(piece);
      if (gameMessage) gameMessage.textContent = 'Đã đưa công đoạn về kho thẻ. Chọn lại nếu cần.';
      return;
    }
    gamePieces.forEach((p) => p.classList.remove('selected'));
    selectedPiece = selectedPiece === piece ? null : piece;
    if (selectedPiece) {
      piece.classList.add('selected');
      if (gameMessage) gameMessage.textContent = 'Đã chọn thẻ. Chạm vào một ô thứ tự để đặt.';
    } else if (gameMessage) {
      gameMessage.textContent = 'Gợi ý: tang trống có trước; âm thanh chỉ được giữ lại sau khi chốt đinh.';
    }
  });
});

dropSlots.forEach((slot) => {
  slot.addEventListener('dragover', (event) => { event.preventDefault(); slot.classList.add('drag-over'); });
  slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
  slot.addEventListener('drop', (event) => { event.preventDefault(); slot.classList.remove('drag-over'); placePiece(draggedPiece, slot); });
  slot.addEventListener('click', () => { if (selectedPiece) placePiece(selectedPiece, slot); });
});

if (checkGameButton) {
  checkGameButton.addEventListener('click', () => {
    if (!dropSlots.length || !gameMessage) return;
    let filled = 0;
    let correct = 0;
    dropSlots.forEach((slot) => {
      const piece = slot.querySelector('.game-piece');
      slot.classList.remove('correct', 'wrong');
      if (!piece) return;
      filled += 1;
      if (piece.dataset.order === slot.dataset.slot) {
        correct += 1;
        slot.classList.add('correct');
      } else {
        slot.classList.add('wrong');
      }
    });
    if (filled < dropSlots.length) {
      gameMessage.textContent = 'Còn thiếu công đoạn. Hãy ghép đủ 5 mảnh trước khi kiểm tra.';
      gameMessage.classList.add('error');
      return;
    }
    if (correct === dropSlots.length) {
      gameMessage.textContent = 'Hồi trống hoàn chỉnh đã vang lên. Bạn đã ghép đúng quy trình Đọi Tam.';
      gameMessage.classList.add('success');
      gameMessage.classList.remove('error');
      document.querySelector('.mini-drum')?.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.08)' },
        { transform: 'scale(1)' }
      ], { duration: 520, iterations: 2, easing: 'ease-out' });
    } else {
      gameMessage.textContent = 'Chưa đúng hết. Gợi ý: tang trống → da trâu → bưng mặt → chốt đinh → sơn vẽ.';
      gameMessage.classList.add('error');
      gameMessage.classList.remove('success');
    }
  });
}

if (resetGameButton) {
  resetGameButton.addEventListener('click', () => {
    clearSlotStates();
    gamePieces.forEach((piece) => {
      piece.classList.remove('placed', 'selected');
      gameBank?.appendChild(piece);
    });
    sortBankPieces();
    selectedPiece = null;
    if (gameMessage) gameMessage.textContent = 'Gợi ý: tang trống có trước; âm thanh chỉ được giữ lại sau khi chốt đinh.';
  });
}

// V8: chapter-based navigation + homepage audio start
const pageScreens = document.querySelectorAll('.page-screen');
const navButtons = document.querySelectorAll('[data-go]');
const chromeButtons = document.querySelectorAll('.site-chrome [data-go]');

function setActiveChrome(pageId) {
  chromeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.go === pageId);
  });
}

function showPage(pageId, shouldUpdateHash = true) {
  const target = document.getElementById(pageId);
  if (!target) return;
  pageScreens.forEach((screen) => screen.classList.toggle('active', screen === target));
  setActiveChrome(pageId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (shouldUpdateHash) history.replaceState(null, '', pageId === 'home' ? window.location.pathname : `#${pageId}`);
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const pageId = button.dataset.go;
    if (pageId) showPage(pageId);
  });
});

const initialPage = location.hash ? location.hash.replace('#', '') : 'home';
if (document.getElementById(initialPage)) {
  showPage(initialPage, false);
}

const drumAudio = document.getElementById('drumAudio');
const drumStart = document.querySelector('.drum-start');
if (drumStart) {
  drumStart.addEventListener('click', async () => {
    document.body.classList.add('sound-started');
    try {
      if (drumAudio) {
        drumAudio.currentTime = 0;
        await drumAudio.play();
      }
    } catch (error) {
      console.info('Audio chưa có file hoặc bị trình duyệt chặn. Animation vẫn tiếp tục.', error);
    }
  });
}

// V9: Part 1 interactive history timeline
const historyData = [
  {
    year: 'Năm 987',
    title: 'Tiếng Trống Khởi Nguyên',
    era: '987',
    body: 'Cụ Nguyễn Đức Năng và Nguyễn Đức Bản làm chiếc trống khổng lồ dâng vua Lê Đại Hành trong lễ Tịch điền dưới chân núi Đọi.'
  },
  {
    year: 'Hơn 1.000 năm qua',
    title: 'Bí Truyền & Tiếp Nối',
    era: '1000+',
    body: 'Từ bí nghệ của một dòng họ, nghề làm trống lan tỏa, nuôi sống cả làng. Cụ Nguyễn Đức Năng được tôn làm "Trạng Sấm" – Thành hoàng làng.'
  },
  {
    year: 'Năm 2004',
    title: 'Sắc Phong Làng Nghề',
    era: '2004',
    body: 'UBND tỉnh Hà Nam chính thức cấp bằng công nhận Làng nghề truyền thống tiểu thủ công nghiệp Đọi Tam.'
  },
  {
    year: 'Năm 2007',
    title: 'Tôn Vinh Tầm Quốc Gia',
    era: '2007',
    body: 'Hiệp hội Làng nghề Việt Nam trao tặng Bằng khen “Làng nghề tiêu biểu Việt Nam”.'
  },
  {
    year: '20/12/2019',
    title: 'Di Sản Quốc Gia',
    era: '2019',
    body: 'Nghề làm trống Đọi Tam chính thức được đưa vào Danh mục Di sản văn hóa phi vật thể quốc gia.'
  }
];
const historyTabs = document.querySelectorAll('.history-tab');
const historyCard = document.querySelector('.history-card');
const historyTrack = document.querySelector('.timeline-tabs');
function setHistoryProgress(index) {
  if (!historyTrack || !historyTabs.length) return;
  const percent = historyTabs.length <= 1 ? 100 : (index / (historyTabs.length - 1)) * 100;
  historyTrack.style.setProperty('--history-progress', `${Math.max(8, percent)}%`);
}
if (historyCard && historyData[0]) historyCard.dataset.era = historyData[0].era || '987';
setHistoryProgress(0);
historyTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const index = Number(tab.dataset.history);
    const data = historyData[index];
    if (!data || !historyCard) return;
    historyTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.classList.remove('pulsing');
    });
    tab.classList.add('pulsing');
    setHistoryProgress(index);
    const panel = tab.closest('.timeline-panel');
    if (panel) {
      panel.style.setProperty('--drum-rotation', `${index * 16}deg`);
      panel.classList.remove('orbit-hit');
      void panel.offsetWidth;
      panel.classList.add('orbit-hit');
      setTimeout(() => panel.classList.remove('orbit-hit'), 620);
    }
    historyCard.classList.add('changing');
    setTimeout(() => {
      historyCard.dataset.era = data.era || data.year;
      historyCard.innerHTML = `<p class="history-year">${data.year}</p><h3>${data.title}</h3><p>${data.body}</p>`;
      historyCard.classList.remove('changing');
      setTimeout(() => tab.classList.remove('pulsing'), 760);
    }, 180);
  });
});

// V18 album stagger reveal for Part 2
const albumImages = document.querySelectorAll('.album-grid img');
if (albumImages.length) {
  const albumObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const index = [...albumImages].indexOf(img);
      setTimeout(() => img.classList.add('album-visible'), Math.max(0, index) * 90);
      albumObserver.unobserve(img);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  albumImages.forEach((img) => albumObserver.observe(img));

  albumImages.forEach((img) => {
    img.addEventListener('mouseenter', () => {
      albumImages.forEach((other) => {
        if (other !== img) other.classList.add('album-soft-hide');
      });
    });
    img.addEventListener('mouseleave', () => {
      albumImages.forEach((other) => other.classList.remove('album-soft-hide'));
    });
  });
}

// V24: Part 3 sound cards + commerce image scroll reveal
const soundCards = document.querySelectorAll('.sound-card');
soundCards.forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    const href = card.dataset.folder;
    if (href) window.open(href, '_blank', 'noopener');
  });
});

const commerceSection = document.querySelector('.commerce-reveal');
const commerceImage = document.querySelector('.commerce-image');
function updateCommerceReveal() {
  if (!commerceSection || !commerceImage) return;
  const rect = commerceSection.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const total = rect.height + vh;
  const passed = vh - rect.top;
  const progress = Math.max(0, Math.min(1, passed / total));
  const pct = 18 + progress * 82;
  commerceImage.style.setProperty('--commerce-reveal', `${pct}%`);
}
/* v34: commerce still image, no scroll reveal */

// V25: audio-style buttons and podcast reveal
const allSoundPlayers = document.querySelectorAll('.sound-audio-card');
allSoundPlayers.forEach((card) => {
  const button = card.querySelector('.sound-play');
  const audio = card.querySelector('audio');
  if (!button || !audio) return;
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    document.querySelectorAll('.sound-audio-card audio').forEach((other) => {
      if (other !== audio) { other.pause(); other.currentTime = 0; }
    });
    try {
      if (audio.paused) {
        await audio.play();
        button.classList.add('playing');
        button.querySelector('span').textContent = 'Ⅱ';
      } else {
        audio.pause();
        button.classList.remove('playing');
        button.querySelector('span').textContent = '▶';
      }
    } catch (err) {
      button.classList.add('missing-audio');
      const drive = button.dataset.preview || audio.dataset.preview;
      if (drive) {
        window.open(drive, '_blank', 'noopener');
      }
    }
  });
  audio.addEventListener('ended', () => {
    button.classList.remove('playing');
    const icon = button.querySelector('span');
    if (icon) icon.textContent = '▶';
  });
});

document.querySelectorAll('.podcast-play').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.target || '');
    if (!target) return;
    const nowHidden = target.hidden;
    target.hidden = !nowHidden;
    button.innerHTML = nowHidden ? '<span>Ⅱ</span> Đang mở chia sẻ' : '<span>▶</span> Nghe chia sẻ';
  });
});

// V30: diverse scroll reveal directions + route map progress + click drum image for audio
const revealPalette = ['from-left', 'from-right', 'from-bottom', 'from-zoom'];
document.querySelectorAll('.reveal').forEach((el, index) => {
  if (!el.classList.contains('visible') && !revealPalette.some(c => el.classList.contains(c))) {
    el.classList.add(revealPalette[index % revealPalette.length]);
  }
});

window.addEventListener('pointermove', (event) => {
  document.documentElement.style.setProperty('--mx', `${(event.clientX / window.innerWidth) * 100}%`);
  document.documentElement.style.setProperty('--my', `${(event.clientY / window.innerHeight) * 100}%`);
}, { passive: true });

document.querySelectorAll('.sound-audio-card img').forEach((img) => {
  img.addEventListener('click', () => img.closest('.sound-audio-card')?.querySelector('.sound-play')?.click());
});

// V34: route map controlled by clicking route cards, not scroll.
// V30: let stats reanimate when entering Part 3 again
const part3Button = document.querySelector('.site-chrome [data-go="part3"]');
if (part3Button) {
  part3Button.addEventListener('click', () => {
    document.querySelectorAll('.part3-stat strong[data-count]').forEach(el => { el.textContent = '0'; });
  });
}


// V31: robust stat counter removed; v34 controlled counter below.
// V32: force Part 3 stats removed; v34 controlled counter below.



// V34: controlled stat counter — reset on entering Part 3, count slowly only when stats are actually scrolled into view.
(function(){
  const section = document.querySelector('#vitality');
  const statEls = Array.from(document.querySelectorAll('#vitality .part3-stat strong[data-count]'));
  if (!section || !statEls.length) return;
  let token = 0;
  let hasRun = false;
  function resetStats(){
    token++;
    hasRun = false;
    statEls.forEach(el => { el.textContent = '0'; el.classList.remove('counting'); });
  }
  function sectionReady(){
    const rect = section.getBoundingClientRect();
    return document.getElementById('part3')?.classList.contains('active') && rect.top < window.innerHeight * 0.58 && rect.bottom > window.innerHeight * 0.28;
  }
  function animateStats(){
    if (hasRun || !sectionReady()) return;
    hasRun = true;
    const run = ++token;
    statEls.forEach((el, i) => {
      const target = Number(el.dataset.count || '0');
      const suffix = target === 20 ? '+' : '';
      const start = performance.now() + i * 180;
      const duration = 2600;
      el.classList.add('counting');
      function tick(now){
        if (run !== token) return;
        const p = Math.max(0, Math.min((now - start) / duration, 1));
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('vi-VN') + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else setTimeout(() => el.classList.remove('counting'), 500);
      }
      requestAnimationFrame(tick);
    });
  }
  window.addEventListener('scroll', animateStats, { passive: true });
  window.addEventListener('resize', animateStats);
  document.querySelectorAll('[data-go="part3"]').forEach(btn => btn.addEventListener('click', () => {
    resetStats();
    setTimeout(() => { window.scrollTo({top:0, behavior:'auto'}); }, 80);
  }));
  resetStats();
})();

// V34: clickable heritage map flashcards.
(function(){
  const map = document.querySelector('.heritage-map-scroll');
  if (!map) return;
  const cards = Array.from(map.querySelectorAll('.route-stop-card'));
  const dots = Array.from(map.querySelectorAll('.route-dot'));
  const progress = [0.02, 0.35, 0.67, 1];
  function setRoute(index){
    const p = progress[index] ?? 0.02;
    map.style.setProperty('--route-progress', p.toFixed(3));
    map.style.setProperty('--route-offset', String(900 - 900 * p));
    cards.forEach((card,i)=>card.classList.toggle('active', i===index));
    dots.forEach((dot,i)=>dot.classList.toggle('active', i<=index));
  }
  cards.forEach((card, i) => {
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.addEventListener('click', () => setRoute(i));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRoute(i); }
    });
  });
  setRoute(0);
})();

// V34-polish11: route flashcard click cycles to next card and updates the map.
(function(){
  const map = document.querySelector('.heritage-map-scroll');
  if (!map) return;
  const cards = Array.from(map.querySelectorAll('.route-stop-card'));
  const dots = Array.from(map.querySelectorAll('.route-dot'));
  const progress = [0.02, 0.35, 0.67, 1];
  let current = 0;
  function show(index){
    current = (index + cards.length) % cards.length;
    const p = progress[current] ?? 0.02;
    map.style.setProperty('--route-progress', p.toFixed(3));
    map.style.setProperty('--route-offset', String(900 - 900 * p));
    cards.forEach((card,i)=>card.classList.toggle('active', i===current));
    dots.forEach((dot,i)=>dot.classList.toggle('active', i<=current));
  }
  cards.forEach((card, i)=>{
    card.onclick = () => show(i + 1);
    card.onkeydown = (e) => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); show(i + 1); } };
  });
  show(0);
})();

// V34-polish11: restart stat count only when the stat grid itself is visibly reached.
(function(){
  const part3 = document.getElementById('part3');
  const grid = document.querySelector('#vitality .part3-stat-grid');
  const nums = Array.from(document.querySelectorAll('#vitality .part3-stat strong[data-count]'));
  if (!part3 || !grid || !nums.length) return;
  let done = false;
  function reset(){ done = false; nums.forEach(n=>{ n.textContent='0'; n.classList.remove('counting'); }); }
  function run(){
    if(done || !part3.classList.contains('active')) return;
    const r = grid.getBoundingClientRect();
    if(r.top > innerHeight * .72 || r.bottom < innerHeight * .15) return;
    done = true;
    nums.forEach((el,i)=>{
      const target = Number(el.dataset.count||0); const suffix = target===20 ? '+' : '';
      const start = performance.now() + i*160; const dur = 2300;
      el.classList.add('counting');
      function tick(now){
        const p=Math.max(0,Math.min(1,(now-start)/dur));
        el.textContent = Math.round(target*(1-Math.pow(1-p,3))).toLocaleString('vi-VN') + suffix;
        if(p<1) requestAnimationFrame(tick); else setTimeout(()=>el.classList.remove('counting'), 600);
      }
      requestAnimationFrame(tick);
    });
  }
  window.addEventListener('scroll', run, {passive:true});
  document.querySelectorAll('[data-go="part3"]').forEach(b=>b.addEventListener('click',()=>setTimeout(reset,20)));
  reset();
})();
