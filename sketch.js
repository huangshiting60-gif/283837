/* 🎯 教育科技學系互動作品 — 宇宙公轉 + 完整特效版
 * 🪐 背景：tomxor 行星+環
 * 🌌 封面：標題/姓名繞中心公轉（前亮後暗、星塵）
 * 🧭 目錄：滑鼠靠左自動滑出（作品一/作品二/作品三）
 * 🧠 測驗：CSV 題庫（10 題），亂數出題、成績、回饋、特效
 */

let appState = 'home';

// === 側邊選單 ===
const MENU_W = 100, HANDLE_W = 14;
let hoverZone = 40;
const DETAIL_CARD_W = 260, DETAIL_CARD_H = 320;
let menuX = -MENU_W + HANDLE_W, menuTarget = -MENU_W + HANDLE_W;
let MENU_BG, MENU_BG_HOVER, MENU_TEXT, MENU_ACCENT;
let sideMenuBoxes = [];
let sideMenuItems = [
  { id: 'balloon', label: "氣球爆破遊戲", type: "link", url: "https://huangshiting60-gif.github.io/202511033/"},
  { id: 'notes', label: "上課筆記", type: "link", url: "https://hackmd.io/@DVFtTMYjTmumEkY6i9d0lw/SkBeKOyhll"},
  { id: 'quiz', label: "測驗系統", type: "quiz"},
  { id: 'profile', label: "自我介紹", type: "profile" },
  { 
    id: 'tku',
    label: "淡江大學", 
    type: "submenu",
    url: "https://www.tku.edu.tw/",
    submenu: [
      { id: 'et', label: "教育科技學系", type: "link", url: "https://www.et.tku.edu.tw/" }
    ]
  }
];
const MENU_DETAIL_CONTENT = {
  balloon: {
    title: '氣球爆破遊戲',
    subtitle: '互動小遊戲',
    description: '在節奏感十足的宇宙背景下，瞄準並爆破氣球，挑戰你的反應力與準確度。',
    accent: '#f472b6',
    gradient: ['#ff6cab', '#7366ff'],
    badge: 'Playful Cosmos',
    emoji: '🎈',
    action: { kind: 'link', label: '立即前往', url: 'https://huangshiting60-gif.github.io/202511033/' }
  },
  notes: {
    title: '上課筆記',
    subtitle: '知識整理',
    description: '統整課堂亮點與學習心得，讓複習更有效率，隨時補充新靈感。',
    accent: '#38bdf8',
    gradient: ['#38bdf8', '#818cf8'],
    badge: 'Creative Notes',
    emoji: '📝',
    action: { kind: 'link', label: '開啟筆記', url: 'https://hackmd.io/@DVFtTMYjTmumEkY6i9d0lw/SkBeKOyhll' }
  },
  quiz: {
    title: '測驗系統',
    subtitle: '隨機出題，挑戰滿分',
    description: '十題快問快答，附即時回饋與繽紛特效，幫助你掌握 p5.js 要點。',
    accent: '#a855f7',
    gradient: ['#a855f7', '#6366f1'],
    badge: 'Ready to Quiz',
    emoji: '🧠',
    action: { kind: 'quiz', label: '開始測驗' }
  },
  profile: {
    title: '黃詩婷',
    subtitle: '學號｜414730175',
    description: '我是黃詩婷，一個重視細節、也樂於學習的新世代學生。\n我個性穩重但不失好奇，喜歡主動嘗試新事物，從挑戰中累積經驗。\n平時熱愛拍照與創作，透過鏡頭觀察生活的細節，也學會以不同角度理解世界。\n我相信學習不只是一段求知歷程，更是探索自我與成長的過程。\n期望未來能持續發揮創意與行動力，找到屬於自己的方向，並在過程中成為更有影響力的人。',
    accent: '#0ea5e9',
    badge: 'Tamkang University',
    emoji: '⭐',
    imageType: 'photo'
  },
  tku: {
    title: '淡江大學',
    subtitle: 'Tamkang University',
    description: '迎向世界的跨域養成，透過創新與實作培育全方位人才。',
    accent: '#f97316',
    gradient: ['#fb7185', '#f97316'],
    badge: 'TKU Spirit',
    emoji: '🏫',
    action: { kind: 'link', label: '造訪官網', url: 'https://www.tku.edu.tw/' }
  },
  et: {
    title: '教育科技學系',
    subtitle: 'Department of Educational Technology',
    description: '結合學習理論與科技應用，打造富有互動與創意的教學方案。',
    accent: '#22d3ee',
    gradient: ['#22d3ee', '#38bdf8'],
    badge: 'Innovate Education',
    emoji: '📚',
    action: { kind: 'link', label: '瞭解更多', url: 'https://www.et.tku.edu.tw/' }
  }
};

function getMenuDetail(key) {
  if (!key) return null;
  const base = MENU_DETAIL_CONTENT[key];
  if (!base) return null;
  const detail = Object.assign({ key, kind: key === 'profile' ? 'profile' : 'feature' }, base);
  if (detail.imageType === 'photo') detail.image = profileImg;
  return detail;
}

// === 背景（tomxor） ===
let tCounter = 100;

// === 封面：公轉參數 ===
let orbitAngle = 0;
const ORBIT_SPEED = 0.018;   // >0 順時針；<0 逆時針
const ORBIT_R_BASE = 0.22;
const ORBIT_R_SWAY = 0.06;
const ORBIT_GLOW = 0.18;

// === 測驗 ===
const NUM_QUESTIONS = 10;
let allRows = [], quiz = [], qIdx = 0, score = 0;
let buttons = [];
let particles = [];
let toastTimer = 0, toastText = '', toastGood = true;
let shakeT = 0;
let pendingAdvance = false; // 防連點+保證特效顯示完
let profileImg = null;
let detailCardBounds = { x: 0, y: 0, w: DETAIL_CARD_W, h: DETAIL_CARD_H };
let detailHoverAmt = 0;
let detailHoverTarget = 0;
let hoverDetail = null;
let expandedDetail = null;
let overlayBounds = null;
let coverSparkles = [];
let coverLastBurst = 0;

// 內建備援題庫（讀不到外部 CSV 時使用）
const FALLBACK_CSV = `question,optionA,optionB,optionC,optionD,answer,feedback
p5.js 的 setup 什麼時候執行？,每一幀都執行,只在開始執行一次,按滑鼠時,視窗縮放時,B,setup 只在開始呼叫一次
哪個函數會不斷重複執行?,"draw()","setup()","mousePressed()","keyTyped()",A,draw 是動畫主循環
用於載入外部檔案的函數?,"loadImage()","loadTable()","background()","fill()",B,loadTable 用於讀CSV
設定畫布大小的函數是?,"setSize()","canvas()","createCanvas()","window()",C,createCanvas 設定畫布大小
改變填色顏色的函數是?,"fill()","stroke()","rect()","color()",A,fill 控制填色
畫布原點(0,0)在哪裡?,"左上角","右下角","中心","左下角",A,左上角是原點
每幀重繪畫面要用哪個函數?,"background()","clearRect()","erase()","save()",A,background 清除舊圖
fetch() 讀檔後要怎麼取文字?,"res.json()","res.text()","res.body","res.file()",B,用 text() 取文字
JavaScript 嚴格等於運算子是哪個?,"==","=","===","!==",C,=== 比較值與型別
p5.js 畫線的函數是?,"line()","rect()","stroke()","shape()",A,line 畫線
`;

// === 載入題庫（先試讀 data/questions.csv，失敗用備援） ===
async function preload() {
  try {
    profileImg = await new Promise((resolve, reject) => {
      loadImage('assets/profile.jpg', resolve, reject);
    });
  } catch {
    profileImg = null;
  }
  try {
    const res = await fetch('data/questions.csv', { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const txt = await res.text();
    allRows = parseCSV(txt);
    if (!allRows.length) throw new Error();
  } catch {
    allRows = parseCSV(FALLBACK_CSV);
  }
}
function parseCSV(txt) {
  const lines = txt.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const head = lines[0].split(',');
  const qi = head.indexOf('question'),
        ai = head.indexOf('optionA'),
        bi = head.indexOf('optionB'),
        ci = head.indexOf('optionC'),
        di = head.indexOf('optionD'),
        an = head.indexOf('answer'),
        fb = head.indexOf('feedback');
  const arr = [];
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(',');
    if (c.length < 6) continue;
    const row = {
      question: c[qi],
      options: [c[ai], c[bi], c[ci], c[di]],
      answer: (c[an]||'').trim().toUpperCase(),
      feedback: c[fb]||''
    };
    if (row.question && row.options.every(Boolean) && 'ABCD'.includes(row.answer)) arr.push(row);
  }
  return arr;
}

function setup() {
  createCanvas(windowWidth, windowHeight).parent("game-container");
  textFont('ZCOOL KuaiLe');

  // 選單配色
  MENU_BG = color(17, 24, 39, 180);
  MENU_BG_HOVER = color(30, 41, 59, 210);
  MENU_TEXT = color(238);
  MENU_ACCENT = color(14, 165, 233);
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function draw() {
  if (appState === 'home') {
    drawTomxorBackground();
    drawOrbitingTitle();
    updateCoverSparkles();
    drawSideMenu();
    return;
  }

  if (appState === 'quiz_loading') {
    background(0);
    fill(255); textAlign(CENTER, CENTER); textSize(22);
    text('載入題庫中...', width/2, height/2);
    if (allRows.length) { buildQuiz(allRows); appState = 'quiz'; }
    drawSideMenu();
    return;
  }

  if (appState === 'quiz') {
    background(20);

    // 震動特效（錯題）
    if (shakeT > 0) { push(); translate(random(-4,4), random(-4,4)); shakeT--; drawQuiz(); pop(); }
    else { drawQuiz(); }

    // 一定要在題目後畫這兩個，特效才會出現
    updateParticles();
    drawToastTop();

    drawSideMenu();
    return;
  }

  if (appState === 'result') {
    background(20);
    drawResult();

    // 結果頁也保留最後一波特效
    updateParticles();
    drawToastTop();

    drawSideMenu();
    return;
  }
}

// === 背景（tomxor） ===
function drawTomxorBackground() {
  background(0);
  stroke(255);
  tCounter += 0.01;
  for (let i = 2000; i > 0; i -= 2) drawTomxorPoint(i, 0); // 偶數：行星
  for (let i = 1999; i > 0; i -= 2) drawTomxorPoint(i, 1); // 奇數：環

  // 霧化星雲光暈
  push();
  noStroke();
  const halo = drawingContext.createRadialGradient(width/2, height*0.5, 0, width/2, height*0.58, max(width, height) * 0.6);
  halo.addColorStop(0, 'rgba(56,189,248,0.16)');
  halo.addColorStop(0.55, 'rgba(99,102,241,0.09)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  drawingContext.fillStyle = halo;
  rect(0, 0, width, height);

  const aurora = drawingContext.createLinearGradient(width*0.2, height*0.15, width*0.8, height*0.75);
  aurora.addColorStop(0, 'rgba(14,165,233,0.05)');
  aurora.addColorStop(0.6, 'rgba(236,72,153,0.035)');
  aurora.addColorStop(1, 'rgba(37,99,235,0.04)');
  drawingContext.fillStyle = aurora;
  rect(0, 0, width, height);
  pop();
}
function drawTomxorPoint(i, p) {
  const r = tCounter / cos(tCounter / i) + p * (tCounter / 2 + (i % tCounter));
  const a = tCounter / 9 + i * i;
  const x = width / 2 + r * sin(a) * cos((1 - p) * i / tCounter);
  const y = height / 2 + r * cos(a + p * 2);
  const s = 1 - cos(a);
  strokeWeight(s);
  point(x, y);
}

// === 封面：繞宇宙公轉（前亮後暗＋星塵） ===
function drawOrbitingTitle() {
  const cx = width / 2, cy = height / 2;
  const title = '教育科技学系';
  const subtitle = '414730175 黃詩婷';
  const titleSize = min(width, height) * 0.09;
  const subtitleSize = min(width, height) * 0.035;

  orbitAngle += ORBIT_SPEED;

  const base = min(width, height);
  const r0 = base * ORBIT_R_BASE, rAmp = base * ORBIT_R_SWAY;
  const a1 = orbitAngle, a2 = orbitAngle + 0.7;
  const r1 = r0 + rAmp * sin(a1 * 1.3);
  const r2 = r0 * 0.78 + rAmp * sin(a2 * 1.4);
  const z1 = sin(a1), z2 = sin(a2);
  const s1 = map(z1, -1, 1, 0.82, 1.18);
  const s2 = map(z2, -1, 1, 0.82, 1.12);
  const alpha1 = map(z1, -1, 1, 140, 255);
  const alpha2 = map(z2, -1, 1, 120, 230);
  const glow1 = map(z1, -1, 1, ORBIT_GLOW * 0.4, ORBIT_GLOW);
  const glow2 = map(z2, -1, 1, ORBIT_GLOW * 0.4, ORBIT_GLOW * 0.85);

  const x1 = cx + r1 * cos(a1);
  const y1 = cy + r1 * sin(a1);
  const x2 = cx + r2 * cos(a2);
  const y2 = cy + r2 * sin(a2);

  // 星塵（主標尾端）
  noFill();
  stroke(255, 100);
  for (let i = 0; i < 50; i++) {
    const da = -i * 0.03;
    const ar = a1 + da;
    point(cx + (r1 + random(-2,2)) * cos(ar), cy + (r1 + random(-2,2)) * sin(ar));
  }
  noStroke();

  // 依深度排序，避免互遮突兀
  const order = z1 >= z2 ? [2, 1] : [1, 2];
  for (const which of order) {
    if (which === 1) {
      push(); translate(x1, y1); scale(s1);
      textAlign(CENTER, CENTER);
      fill(255, alpha1);
      textSize(titleSize);
      text(title, 0, 0);
      noFill();
      stroke(255, alpha1 * glow1);
      strokeWeight(2);
      ellipse(0, 0, titleSize * 1.6, titleSize * 0.54);
      pop();
    } else {
      push(); translate(x2, y2); scale(s2);
      textAlign(CENTER, CENTER);
      fill(255, alpha2);
      textSize(subtitleSize);
      text(subtitle, 0, 0);
      noFill();
      stroke(255, alpha2 * glow2);
      strokeWeight(1.4);
      ellipse(0, 0, subtitleSize * 4.2, subtitleSize * 1.1);
      pop();
    }

    // Tamkang University with pulsating effect
    const tkBaseSize = subtitleSize * 1.2;
    const pulse = sin(frameCount * 0.05);
    const tkSize = tkBaseSize + pulse * 2;
    const tkAlpha = 180 + pulse * 40;

    const mixAmt = (sin(frameCount * 0.04) + 1) * 0.5;
    const tkMix = lerpColor(color(96, 165, 250), color(244, 114, 182), mixAmt);
    tkMix.setAlpha(tkAlpha);
    fill(tkMix);
    textSize(tkSize);
    text('Tamkang University', cx, height * 0.9);
  }

  // 互動提示
  const hintPulse = (sin(frameCount * 0.05) + 1) * 0.5;
  const hintAlpha = lerp(70, 160, hintPulse);
  const hintSize = min(width, height) * 0.024;
  const hintY = height * 0.82;
  const hintW = min(width * 0.68, 520);

  push();
  translate(cx - hintW / 2, hintY - hintSize * 1.4);
  const hintBgAlpha = lerp(40, 90, hintPulse);
  fill(15, 23, 42, hintBgAlpha);
  rect(0, 0, hintW, hintSize * 2.4, 18);
  fill(255, hintAlpha);
  textAlign(CENTER, CENTER);
  textSize(hintSize);
  text('將滑鼠移到左側，展開宇宙選單探索每個作品', hintW / 2, hintSize * 1.18);
  pop();
}

function updateCoverSparkles() {
  const now = millis();
  const interval = expandedDetail ? 7200 : random(4200, 6400);
  const readyForBurst = now > 2000 && (coverLastBurst === 0 || now - coverLastBurst > interval);
  if (readyForBurst) {
    spawnCoverBurst(width / 2, height / 2);
    coverLastBurst = now;
  }

  for (let i = coverSparkles.length - 1; i >= 0; i--) {
    const sp = coverSparkles[i];
    sp.x += sp.vx;
    sp.y += sp.vy;
    sp.vx *= 0.98;
    sp.vy *= 0.985;
    sp.roll += sp.spin;
    sp.life--;

    const fade = map(sp.life, sp.maxLife, 0, 1, 0);
    const alpha = constrain(fade * 140, 0, 140);
    const glow = constrain(fade * 70, 0, 70);

    if (alpha <= 0) {
      coverSparkles.splice(i, 1);
      continue;
    }

    push();
    translate(sp.x, sp.y);
    rotate(sp.roll);
    noStroke();
    fill(sp.color[0], sp.color[1], sp.color[2], glow);
    ellipse(0, 0, sp.size * 2.8, sp.size * 1.4);
    fill(sp.color[0], sp.color[1], sp.color[2], alpha);
    ellipse(0, 0, sp.size, sp.size);
    pop();
  }

  if (coverSparkles.length > 140) coverSparkles.splice(0, coverSparkles.length - 140);
}

function spawnCoverBurst(cx, cy) {
  for (let i = 0; i < 16; i++) {
    const ang = random(TWO_PI);
    const speed = random(0.5, 1.4);
    const palette = random([
      [56, 189, 248],
      [125, 211, 252],
      [129, 140, 248],
      [236, 181, 255]
    ]);
    const lifetime = random(80, 140);
    coverSparkles.push({
      x: cx + cos(ang) * random(12, 40),
      y: cy + sin(ang) * random(12, 40),
      vx: cos(ang) * speed,
      vy: sin(ang) * speed * 0.6 - random(0.15, 0.4),
      life: lifetime,
      maxLife: lifetime,
      size: random(5, 11),
      roll: random(TWO_PI),
      spin: random(-0.06, 0.06),
      color: palette
    });
  }
}

// === 側邊選單 ===
function drawSideMenu() {
  const baseHover = max(36, min(width * 0.06, 54));
  hoverZone = lerp(hoverZone, baseHover, 0.12);
  const tentativeCardX = menuX + MENU_W + 16;
  const tentativeCardY = height / 2 - DETAIL_CARD_H / 2;
  const mouseInCard = mouseX >= tentativeCardX && mouseX <= tentativeCardX + DETAIL_CARD_W && mouseY >= tentativeCardY && mouseY <= tentativeCardY + DETAIL_CARD_H;

  const nearEdge = mouseX < hoverZone;
  const insideMenu = mouseX >= menuX && mouseX <= menuX + MENU_W;
  const keepOpen = nearEdge || insideMenu || mouseInCard || !!expandedDetail;
  menuTarget = keepOpen ? 0 : (-MENU_W + HANDLE_W);
  menuX = lerp(menuX, menuTarget, 0.15);

  detailCardBounds = {
    x: menuX + MENU_W + 16,
    y: height / 2 - DETAIL_CARD_H / 2,
    w: DETAIL_CARD_W,
    h: DETAIL_CARD_H
  };

  if (!expandedDetail) overlayBounds = null;

  rectMode(CORNER);
  noStroke(); fill(MENU_BG); rect(menuX, 0, MENU_W, height);
  fill(MENU_ACCENT); rect(menuX - 1, height/2 - 40, HANDLE_W, 80, 6);
  stroke(255); strokeWeight(2);
  for (let i=0;i<3;i++) line(menuX+4, height/2-20+i*10, menuX+10, height/2-20+i*10);
  noStroke();

  const itemH = 36, gap = 12;
  let totalH = 0;
  sideMenuItems.forEach(item => {
    totalH += itemH + gap;
  });
  totalH -= gap;

  let y = height / 2 - totalH / 2;
  sideMenuBoxes = [];

  let hoverDetailKey = null;

  textAlign(LEFT, CENTER); textSize(14);
  for (let i = 0; i < sideMenuItems.length; i++) {
    const item = sideMenuItems[i];
    const box = { x: menuX, y, w: MENU_W, h: itemH, i, detailKey: item.detailKey || item.id || null, itemRef: item };
    const isHover = mouseX >= box.x && mouseX <= box.x + box.w && mouseY >= box.y && mouseY <= box.y + box.h;

    fill(isHover ? MENU_BG_HOVER : MENU_BG);
    rect(box.x, box.y, box.w, box.h);
    if (isHover) {
      fill(MENU_ACCENT);
      rect(box.x, box.y, 3, box.h);
      hoverDetailKey = box.detailKey;
    }
    fill(MENU_TEXT);
    text(item.label, box.x + 16, box.y + box.h / 2);
    sideMenuBoxes.push(box);

    if (item.type === 'submenu') {
      const submenuHover = isHover || (mouseX > menuX + MENU_W && mouseX < menuX + MENU_W * 2 && mouseY > y && mouseY < y + item.submenu.length * (itemH + gap));
      if (submenuHover) {
        for (let j = 0; j < item.submenu.length; j++) {
          const subItem = item.submenu[j];
          const subBox = { x: menuX + MENU_W, y: y + j * (itemH + gap), w: MENU_W, h: itemH, i, j, detailKey: subItem.detailKey || subItem.id || null, itemRef: subItem };
          const isSubHover = mouseX >= subBox.x && mouseX <= subBox.x + subBox.w && mouseY >= subBox.y && mouseY <= subBox.y + subBox.h;
          fill(isSubHover ? MENU_BG_HOVER : MENU_BG);
          rect(subBox.x, subBox.y, subBox.w, subBox.h);
          if (isSubHover) {
            fill(MENU_ACCENT);
            rect(subBox.x, subBox.y, 3, subBox.h);
            hoverDetailKey = subBox.detailKey;
          }
          fill(MENU_TEXT);
          text(subItem.label, subBox.x + 16, subBox.y + subBox.h / 2);
          sideMenuBoxes.push(subBox);
        }
      }
    }
    y += itemH + gap;
  }

  hoverDetail = hoverDetailKey ? getMenuDetail(hoverDetailKey) : null;
  detailHoverTarget = hoverDetail ? 1 : 0;
  if (expandedDetail) detailHoverTarget = 0;
  detailHoverAmt = expandedDetail ? 0 : lerp(detailHoverAmt, detailHoverTarget, 0.16);
  if (!expandedDetail && detailHoverAmt > 0.01 && hoverDetail) drawDetailCard(detailCardBounds, detailHoverAmt, hoverDetail);
  if (expandedDetail) drawDetailOverlay(expandedDetail);
}
function drawDetailCard(bounds, reveal, detail) {
  if (!detail) return;
  const ease = reveal < 1 ? pow(reveal, 0.85) : 1;
  const cx = bounds.x + bounds.w / 2;
  const cy = bounds.y + bounds.h / 2;
  const dx = constrain((mouseX - cx) / (bounds.w / 2), -1, 1);
  const dy = constrain((mouseY - cy) / (bounds.h / 2), -1, 1);
  const pad = 18;
  const mediaH = bounds.h * 0.52;
  const mediaW = bounds.w - pad * 2;
  const wobble = ease * 4;
  const accent = color(detail.accent || '#0ea5e9');
  const accentSoft = lerpColor(color(255), accent, constrain(0.35 + ease * 0.45, 0, 1));

  push();
  translate(cx, cy);
  const scaleAmt = map(ease, 0, 1, 0.82, 1);
  scale(scaleAmt);
  rotate(radians(dx * 2));
  translate(-bounds.w / 2, -bounds.h / 2);
  rectMode(CORNER);

  drawingContext.save();
  const shadowCol = `rgba(${red(accent)},${green(accent)},${blue(accent)},${0.16 + ease * 0.32})`;
  drawingContext.shadowColor = shadowCol;
  drawingContext.shadowBlur = 30 * ease;
  fill(24, 35, 54, 220);
  rect(0, 0, bounds.w, bounds.h, 20);
  drawingContext.shadowBlur = 0;

  const mediaShiftX = dx * wobble;
  const mediaShiftY = dy * wobble;
  if (detail.image && detail.imageType === 'photo') {
    push();
    translate(pad + mediaShiftX, pad + mediaShiftY);
    imageMode(CENTER);
    const ratio = detail.image.width / detail.image.height;
    let drawW = mediaW;
    let drawH = mediaH;
    if (drawW / drawH > ratio) drawW = drawH * ratio;
    else drawH = drawW / ratio;
    translate(mediaW / 2, mediaH / 2);
    scale(map(ease, 0, 1, 1.08, 1));
    image(detail.image, 0, 0, drawW, drawH);
    pop();
  } else {
    const gStart = color(detail.gradient && detail.gradient[0] ? detail.gradient[0] : detail.accent || '#4f46e5');
    const gEnd = color(detail.gradient && detail.gradient[1] ? detail.gradient[1] : '#1d4ed8');
    push();
    translate(pad + mediaShiftX, pad + mediaShiftY);
    noStroke();
    for (let i = 0; i <= 1.01; i += 0.04) {
      const col = lerpColor(gStart, gEnd, i);
      fill(red(col), green(col), blue(col), 220);
      rect(0, i * mediaH, mediaW, mediaH * 0.08, 12);
    }
    if (detail.emoji) {
      fill(255, 230);
      textAlign(CENTER, CENTER);
      textSize(mediaH * 0.45);
      text(detail.emoji, mediaW / 2, mediaH / 2 + 6);
    }
    pop();
  }

  const textX = pad;
  const textY = pad + mediaH + 20;
  const tilt = dx * 0.2;

  const titleSize = detail.kind === 'profile' ? 26 : 22;
  const subtitleSize = detail.kind === 'profile' ? 16 : 14;
  const bodySize = detail.kind === 'profile' ? 14.5 : 12.5;
  const bodyLeading = detail.kind === 'profile' ? 22 : 18;

  fill(accentSoft);
  textAlign(LEFT, TOP);
  textSize(titleSize);
  text(detail.title || '', textX, textY);

  if (detail.subtitle) {
    fill(220, 200 + ease * 40);
    textSize(subtitleSize);
    text(detail.subtitle, textX, textY + 30);
  }

  const bodyOffset = detail.subtitle ? 54 : 32;
  const bodyText = (detail.description || '').replace(/\n/g, '\n');
  if (bodyText) {
    fill(200, 190, 255, 150 + ease * 70);
    textSize(bodySize);
    textLeading(bodyLeading);
    const maxHeight = detail.kind === 'profile' ? bounds.h * 0.42 : bounds.h * 0.36;
    const lines = bodyText.split('\n');
    let drawn = 0;
    for (let i = 0; i < lines.length; i++) {
      const yy = textY + bodyOffset + drawn * bodyLeading;
      if (yy - (textY + bodyOffset) > maxHeight) {
        fill(200, 190, 255, 120 + ease * 40);
        text('⋯', textX, yy);
        break;
      }
      text(lines[i], textX, yy, bounds.w - pad * 2);
      drawn++;
    }
  }

  const orbitR = map(ease, 0, 1, 54, 68);
  const lum = map(sin(frameCount * 0.06 + tilt), -1, 1, 0.4, 0.9);
  const orbitCx = bounds.w - pad - 36;
  const orbitCy = textY + 18;
  noFill();
  stroke(red(accent), green(accent), blue(accent), 150 * ease);
  strokeWeight(1.6);
  ellipse(orbitCx, orbitCy, orbitR * 2, orbitR * 0.6);

  noStroke();
  const sparkle = map(ease, 0, 1, 6, 12);
  for (let i = 0; i < sparkle; i++) {
    const ang = TWO_PI * i / sparkle + frameCount * 0.04;
    const px = orbitCx + cos(ang) * orbitR * 0.9;
    const py = orbitCy + sin(ang) * orbitR * 0.3;
    const size = 3 + sin(frameCount * 0.12 + i) * 1.4;
    fill(red(accent), green(accent), blue(accent), (140 + i * 8) * ease * lum);
    ellipse(px, py, size, size);
  }

  if (detail.badge) {
    fill(255, 220 * ease);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(detail.badge, orbitCx, orbitCy + 1);
  }

  drawingContext.restore();
  pop();
}
function drawDetailOverlay(state) {
  const key = typeof state === 'string' ? state : state?.key;
  const detail = getMenuDetail(key);
  if (!detail) {
    expandedDetail = null;
    return;
  }

  overlayBounds = null;

  push();
  noStroke();
  rectMode(CORNER);
  fill(0, 200);
  rect(0, 0, width, height);
  pop();

  const overlayW = min(width * 0.7, detail.kind === 'profile' ? 560 : 520);
  const overlayH = min(height * 0.82, detail.kind === 'profile' ? 640 : 600);
  const bounds = {
    x: width / 2 - overlayW / 2,
    y: height / 2 - overlayH / 2,
    w: overlayW,
    h: overlayH
  };
  overlayBounds = bounds;

  drawDetailCard(bounds, 1, detail);

  const hint = detail.closeHint || '點擊背景即可關閉';
  const hintY = min(height - 80, bounds.y + bounds.h + 32);
  push();
  textAlign(CENTER, CENTER);
  textSize(14);
  fill(220, 190);
  text(hint, width / 2, hintY);
  pop();

  if (detail.action) {
    const btnY = min(height - 36, hintY + 42);
    drawBtn(width / 2, btnY, min(width * 0.4, 220), 50, detail.action.label || '前往', () => {
      triggerDetailAction(detail, detail.action);
    });
  }
}
function triggerDetailAction(detail, action) {
  if (!action) return;
  expandedDetail = null;
  if (fullscreen()) fullscreen(false);
  if (action.kind === 'link' && action.url) {
    window.location.href = action.url;
  } else if (action.kind === 'quiz') {
    appState = 'quiz_loading';
  }
}
function mousePressed() {
  if (expandedDetail) {
    if (overlayBounds && mouseX >= overlayBounds.x && mouseX <= overlayBounds.x + overlayBounds.w && mouseY >= overlayBounds.y && mouseY <= overlayBounds.y + overlayBounds.h) {
      return;
    }
    expandedDetail = null;
    if (fullscreen()) fullscreen(false);
    return;
  }

  const insideDetailCard = hoverDetail && mouseX >= detailCardBounds.x && mouseX <= detailCardBounds.x + detailCardBounds.w && mouseY >= detailCardBounds.y && mouseY <= detailCardBounds.y + detailCardBounds.h;
  if (insideDetailCard && hoverDetail) {
    if (hoverDetail.action && hoverDetail.kind !== 'profile') {
      triggerDetailAction(hoverDetail, hoverDetail.action);
    } else {
      expandedDetail = { key: hoverDetail.key };
      if (!fullscreen()) fullscreen(true);
    }
    return;
  }

  for (const box of sideMenuBoxes) {
    if (mouseX >= box.x && mouseX <= box.x + box.w && mouseY >= box.y && mouseY <= box.y + box.h) {
      const detailKey = box.detailKey || box.itemRef?.id || (typeof box.i === 'number' ? sideMenuItems[box.i]?.id : null);
      const detail = detailKey ? getMenuDetail(detailKey) : null;
      if (detail) {
        if (detail.action && detail.kind !== 'profile') {
          triggerDetailAction(detail, detail.action);
        } else {
          expandedDetail = { key: detail.key };
          if (!fullscreen()) fullscreen(true);
        }
        return;
      }
      const item = box.itemRef || (typeof box.i === 'number' ? sideMenuItems[box.i] : null);
      if (!item) return;
      if (item.type === 'link' && item.url) {
        window.location.href = item.url;
      } else if (item.type === 'quiz') {
        appState = 'quiz_loading';
      } else if (item.type === 'submenu' && item.url) {
        window.location.href = item.url;
      }
      return;
    }
  }

  if (appState === 'quiz') {
    for (const btn of buttons) if (btn.hit(mouseX, mouseY)) checkAnswer(btn);
  }
}
function touchStarted(){ mousePressed(); }
function touchMoved() {
  // 防止觸控拖曳時選單閃爍
  hoverZone = max(hoverZone, 60);
  return false;
}

// === 測驗 ===
function buildQuiz(rows){
  const pool = shuffle(rows.slice());
  quiz = pool.slice(0, NUM_QUESTIONS);
  qIdx=0; score=0; buttons=[]; particles=[]; toastTimer=0; shakeT=0; pendingAdvance=false;
}
function drawQuiz(){
  const q = quiz[qIdx];
  fill(255); textAlign(LEFT, TOP); textSize(20);
  text(`第 ${qIdx+1} 題／共 ${quiz.length} 題`, 32, 28);
  textSize(28);
  textWrap(WORD);
  text(q.question, 32, 64, width-64);

  ensureButtons(4);
  const labels=['A','B','C','D'];
  for (let i=0;i<4;i++){
    const bw = min(width*0.72, 720);
    const bh = 60;
    const bx = width/2;
    const by = 210+i*86;
    buttons[i].set(bx,by,bw,bh,`${labels[i]}. ${q.options[i]}`);
    buttons[i].draw();
  }
}
function checkAnswer(btn){
  if (pendingAdvance) return;
  const q = quiz[qIdx];
  const picked = btn.label.slice(0,1);
  const correct = picked === q.answer;

  makeToast(correct ? '答對了！' : `答錯了：${q.feedback || ''}`, correct);

  if (correct){
    score++;
    for (let i=0;i<60;i++) particles.push(new Particle(width/2, 0));
  } else {
    shakeT = 18; // 約 300ms 震動
  }

  // 保證特效可見：延遲 800ms 再換題
  pendingAdvance = true;
  setTimeout(() => {
    qIdx++;
    if (qIdx >= quiz.length) appState = 'result';
    pendingAdvance = false;
  }, 800);
}

// === 結果 ===
function drawResult(){
  fill(255); textAlign(CENTER,CENTER);
  const percent=Math.round((score/quiz.length)*100);
  const msg = percent===100?'滿分！太棒了 🎉':
              percent>=70?'很不錯！繼續努力 👍':
              percent>=40?'還可以，再加油 💪':'重考一次吧！💡';
  textSize(48); text(`${score}/${quiz.length}`, width/2, height*0.35);
  textSize(22); text(`${percent} 分\n${msg}`, width/2, height*0.52);
  drawBtn(width/2, height*0.68, 220, 56, '再測一次', ()=>{ buildQuiz(allRows); appState='quiz'; });
  drawBtn(width/2, height*0.78, 220, 44, '返回首頁', ()=>{ appState='home'; });
}

// === UI / 元件 ===
class ChoiceButton{
  constructor(){ this.x=this.y=this.w=this.h=0; this.label=''; }
  set(x,y,w,h,label){ this.x=x; this.y=y; this.w=w; this.h=h; this.label=label; }
  draw(){
    const hover = mouseX>=this.x-this.w/2 && mouseX<=this.x+this.w/2 && mouseY>=this.y-this.h/2 && mouseY<=this.y+this.h/2;
    push(); translate(this.x,this.y); rectMode(CENTER);
    const baseCol = hover ? color(56, 189, 248, 180) : color(15, 23, 42, 180);
    const grad = drawingContext.createLinearGradient(-this.w/2, -this.h/2, this.w/2, this.h/2);
    if (hover) {
      grad.addColorStop(0, 'rgba(56,189,248,0.7)');
      grad.addColorStop(1, 'rgba(129,140,248,0.7)');
    } else {
      grad.addColorStop(0, 'rgba(15,23,42,0.55)');
      grad.addColorStop(1, 'rgba(30,41,59,0.55)');
    }
    drawingContext.fillStyle = grad;
    noStroke();
    rect(0,0,this.w,this.h,14);
    if (hover) {
      drawingContext.shadowColor = 'rgba(56,189,248,0.35)';
      drawingContext.shadowBlur = 18;
      rect(0,0,this.w,this.h,14);
      drawingContext.shadowBlur = 0;
    }
    fill(255);
    textAlign(CENTER,CENTER);
    textSize(18);
    text(this.label,0,2);
    pop();
  }
  hit(mx,my){ return mx>=this.x-this.w/2 && mx<=this.x+this.w/2 && my>=this.y-this.h/2 && my<=this.y+this.h/2; }
}
function ensureButtons(n){ while(buttons.length<n) buttons.push(new ChoiceButton()); }

// 粒子（彩帶）
class Particle{
  constructor(x,y){
    this.x=x+random(-40,40); this.y=y+random(-10,20);
    this.vx=random(-2.4,2.4); this.vy=random(1.6,4.8);
    this.life=70+random(30); this.size=random(3.5,8.5);
    const palette = random([
      color(56,189,248),
      color(129,140,248),
      color(236,181,255),
      color(45,212,191)
    ]);
    this.c = palette;
  }
  update(){ this.x+=this.vx; this.y+=this.vy; this.vy+=0.12; this.life--; }
  draw(){ noStroke(); fill(this.c); circle(this.x,this.y,this.size); }
  get dead(){ return this.life<=0 || this.y>height+50; }
}
function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){
    particles[i].update(); particles[i].draw();
    if (particles[i].dead) particles.splice(i,1);
  }
  if (particles.length > 220) particles.splice(0, particles.length - 220);
}

// 按鈕（防長按重複觸發）
function drawBtn(cx,cy,w,h,label,onClick){
  const hover = mouseX>=cx-w/2 && mouseX<=cx+w/2 && mouseY>=cy-h/2 && mouseY<=cy+h/2;
  push();
  rectMode(CENTER);
  const btnGrad = drawingContext.createLinearGradient(-w/2, 0, w/2, 0);
  if (hover) {
    btnGrad.addColorStop(0, '#38bdf8');
    btnGrad.addColorStop(1, '#6366f1');
  } else {
    btnGrad.addColorStop(0, '#1e3a8a');
    btnGrad.addColorStop(1, '#312e81');
  }
  drawingContext.fillStyle = btnGrad;
  rect(cx,cy,w,h,12);
  fill(255);
  textAlign(CENTER,CENTER);
  textSize(18);
  text(label,cx,cy+1);
  pop();
  if (hover && mouseIsPressed && !drawBtn._pressed) { drawBtn._pressed = true; onClick && onClick(); }
  if (!mouseIsPressed) drawBtn._pressed = false;
}

// Toast（答對/答錯提示）
function makeToast(txt,good){ toastText=txt; toastGood=!!good; toastTimer=60; }
function drawToastTop(){
  if (toastTimer<=0) return;
  const y = height*0.12;
  fill(toastGood ? 'rgba(78,205,196,0.95)' : 'rgba(255,99,71,0.95)');
  rectMode(CENTER); rect(width/2, y, Math.min(width*0.7, 640), 44, 10);
  fill(0); textAlign(CENTER,CENTER); textSize(16); text(toastText, width/2, y+1);
  toastTimer--;
}

// 工具
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
