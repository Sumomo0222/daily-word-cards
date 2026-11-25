/* 每日英语单词卡 · 交互逻辑
 * - 左滑「已记住」：按艾宾浩斯间隔 1/2/4/7/15/30 天安排复习，六轮后归入已掌握
 * - 右滑「明天再练」：明天重现，记忆等级回退一级
 * - 批次按日期解锁：每天北京时间 08:27（首日直接可用）
 * - 进度保存在 localStorage（dwc_v1）
 */
'use strict';

/* ---------- 小工具 ---------- */
const $ = (s) => document.querySelector(s);
const BJ = 'Asia/Shanghai';
const UNLOCK_T = 'T08:27:00+08:00';

const bjDateStr = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: BJ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const addDays = (ds, n) => {
  const d = new Date(ds + 'T04:00:00Z'); // 12:00 北京时间，避开边界
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const diffDays = (a, b) => Math.round((new Date(b + 'T04:00:00Z') - new Date(a + 'T04:00:00Z')) / 864e5);
const unlockMs = (ds) => new Date(ds + UNLOCK_T).getTime();
const fmtMD = (ds) => { const p = ds.split('-'); return `${+p[1]}月${+p[2]}日`; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function hl(sentence, word) {
  const i = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (i < 0) return esc(sentence);
  return esc(sentence.slice(0, i)) + '<mark>' + esc(sentence.slice(i, i + word.length)) + '</mark>' + esc(sentence.slice(i + word.length));
}

/* ---------- 词库 ---------- */
const META = window.BANK_META;
const DAYS = window.WORD_BANK.days;
const START = META.start;
const INTERVALS = [1, 2, 4, 7, 15, 30]; // 艾宾浩斯复习间隔（天）

const allDates = () => Object.keys(DAYS).sort();
const batchAvailable = (ds) => (ds === START ? true : Date.now() >= unlockMs(ds));
const batchNo = (ds) => diffDays(START, ds) + 1;

function findEntry(w) {
  for (const d of allDates()) {
    const hit = DAYS[d].find((e) => e.w === w);
    if (hit) return { ...hit, batch: d };
  }
  return null;
}

/* ---------- 状态 ---------- */
const KEY = 'dwc_v1';
let S;
function defaultState() {
  const dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    v: 1,
    theme: dark ? 'night' : 'paper',
    hintSeen: false,
    words: {},          // word -> {stage, next, status:'learning'|'mastered', last}
    batchesDone: [],    // 已学完的批次日期
    streak: { count: 0, last: null }
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 1 && s.words && s.batchesDone) return s;
    }
  } catch (e) { /* 损坏则重置 */ }
  return defaultState();
}
function saveState() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
}
S = loadState();

/* ---------- 队列 ---------- */
let queue = [];
let round = null;
let busy = false;

function nextUnlearnedBatch() {
  const today = bjDateStr();
  for (const d of allDates()) {
    if (d > today || !batchAvailable(d)) break;
    // 批次里还有从未学过的词才算未学完；中途退出的批次只补剩余的新词
    if (!S.batchesDone.includes(d) && DAYS[d].some((e) => !S.words[e.w])) return d;
  }
  return null;
}
function nextLockedBatch() {
  return allDates().find((d) => !batchAvailable(d)) || null;
}
function dueList() {
  const today = bjDateStr();
  const out = [];
  for (const d of allDates()) {
    for (const e of DAYS[d]) {
      const r = S.words[e.w];
      if (r && r.status === 'learning' && r.next && r.next <= today) out.push({ ...e, batch: d });
    }
  }
  return out;
}
function buildRound() {
  const due = dueList().slice(0, 12);
  const batch = nextUnlearnedBatch();
  // 只取本批次里尚未学过的新词（中途退出后补学剩余部分）
  const news = batch ? DAYS[batch].filter((e) => !S.words[e.w]).map((e) => ({ ...e, batch })) : [];
  queue = [...due, ...news];
  round = { batch, total: queue.length, done: 0, kept: 0, agained: 0, news: news.length, reviews: due.length };
}

/* ---------- 结果写入 ---------- */
function applyResult(entry, kept) {
  const today = bjDateStr();
  const rec = S.words[entry.w] || { stage: 0, next: today, status: 'learning', last: null };
  if (kept) {
    const stage = rec.stage + 1;
    if (stage > INTERVALS.length) {
      // 通过全部 6 档间隔（1/2/4/7/15/30 天）后毕业
      rec.stage = INTERVALS.length;
      rec.status = 'mastered';
      rec.next = null;
    } else {
      rec.stage = stage;
      rec.status = 'learning';
      rec.next = addDays(today, INTERVALS[stage - 1]);
    }
  } else {
    rec.stage = Math.max(0, rec.stage - 1);
    rec.status = 'learning';
    rec.next = addDays(today, 1);
  }
  rec.last = today;
  S.words[entry.w] = rec;
  saveState();
}
function bumpStreak() {
  const today = bjDateStr();
  if (S.streak.last === today) return;
  S.streak.count = S.streak.last === addDays(today, -1) ? S.streak.count + 1 : 1;
  S.streak.last = today;
  saveState();
}

/* ---------- 发音 ---------- */
const audioCache = {};
async function getAudio(word) {
  if (audioCache[word] !== undefined) return audioCache[word];
  audioCache[word] = null;
  try {
    const r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
    if (r.ok) {
      const j = await r.json();
      const ph = ((j[0] || {}).phonetics || []).filter((p) => p.audio);
      audioCache[word] = {
        uk: (ph.find((p) => /\/uk\.mp3/i.test(p.audio)) || {}).audio || null,
        us: (ph.find((p) => /\/us\.mp3/i.test(p.audio)) || {}).audio || (ph[0] || {}).audio || null
      };
    }
  } catch (e) { /* 离线时静默降级 */ }
  return audioCache[word];
}
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.addEventListener ? speechSynthesis.addEventListener('voiceschanged', loadVoices) : (speechSynthesis.onvoiceschanged = loadVoices);
}
function speakLocal(word, accent) {
  if (!('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(word);
    const want = accent === 'uk' ? 'en-GB' : 'en-US';
    u.lang = want;
    u.rate = 0.9;
    const pick = voices.find((v) => v.lang === want) || voices.find((v) => v.lang && v.lang.indexOf('en') === 0);
    if (pick) u.voice = pick;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) {}
}
async function play(word, accent) {
  const a = await getAudio(word);
  const url = a && (accent === 'uk' ? a.uk : a.us);
  if (url) {
    try {
      const audio = new Audio(url);
      audio.play().catch(() => speakLocal(word, accent));
      return;
    } catch (e) {}
  }
  speakLocal(word, accent);
}

/* ---------- 图标 ---------- */
const ICON_SPK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="M15.5 9.5a4 4 0 0 1 0 5"/><path d="M18 7a7.5 7.5 0 0 1 0 10"/></svg>';
const ICON_BULB = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6.5 6.5 0 0 0-4 11.6c.8.7 1.3 1.5 1.5 2.4h5c.2-.9.7-1.7 1.5-2.4A6.5 6.5 0 0 0 12 3Z"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/* ---------- 卡片渲染 ---------- */
function cardEl(entry, idx) {
  const el = document.createElement('article');
  el.className = 'card c' + idx;
  el.innerHTML = `
    <div class="card-scroll">
      <div class="card-inner">
        <div class="word-row">
          <h2 class="word">${esc(entry.w)}</h2>
          <span class="pos">${esc(entry.pos)}</span>
        </div>
        <div class="phon">
          <button class="say" data-accent="uk" data-w="${esc(entry.w)}"><span class="tag">英</span>${ICON_SPK}<span>${esc(entry.uk)}</span></button>
          <button class="say" data-accent="us" data-w="${esc(entry.w)}"><span class="tag">美</span>${ICON_SPK}<span>${esc(entry.us)}</span></button>
        </div>
        <div class="defs">
          <p class="def-en">${esc(entry.en)}</p>
          <p class="def-zh">${esc(entry.zh)}</p>
        </div>
        <div class="sec-title">例句 <span class="mini">（来源逐条标注）</span></div>
        ${entry.ex.map((x) => `
          <div class="ex">
            <p class="ex-en">${hl(x.en, entry.w)}</p>
            <p class="ex-zh">${esc(x.zh)}</p>
            <span class="ex-src">${esc(x.src)}</span>
          </div>`).join('')}
        <div class="tip">${ICON_BULB}<div><b>记忆锚点</b>${esc(entry.tip)}</div></div>
      </div>
    </div>
    <div class="stamp keep">已记住</div>
    <div class="stamp again">明天再练</div>`;
  if (idx === 0) attachDrag(el);
  el.querySelectorAll('.say').forEach((b) => b.addEventListener('click', () => play(b.dataset.w, b.dataset.accent)));
  return el;
}

/* ---------- 滑动 ---------- */
const SWIPE_RATIO = 0.3;
function attachDrag(card) {
  let st = null;
  card.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('button')) return;
    st = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, mode: null, t: Date.now(), id: e.pointerId };
    try { card.setPointerCapture(e.pointerId); } catch (err) {}
  });
  card.addEventListener('pointermove', (e) => {
    if (!st || e.pointerId !== st.id) return;
    st.dx = e.clientX - st.x;
    st.dy = e.clientY - st.y;
    if (!st.mode) {
      if (Math.abs(st.dx) < 6 && Math.abs(st.dy) < 6) return;
      st.mode = Math.abs(st.dx) >= Math.abs(st.dy) ? 'h' : 'v';
      if (st.mode === 'h') card.classList.add('dragging');
    }
    if (st.mode !== 'h') return;
    const th = card.offsetWidth * SWIPE_RATIO;
    card.style.setProperty('--tx', st.dx + 'px');
    card.style.setProperty('--rot', (st.dx * 0.045) + 'deg');
    card.style.setProperty('--keep-o', String(Math.min(1, Math.max(0, -st.dx / th))));
    card.style.setProperty('--again-o', String(Math.min(1, Math.max(0, st.dx / th))));
  });
  const end = (e) => {
    if (!st || e.pointerId !== st.id) return;
    const s = st;
    st = null;
    if (s.mode !== 'h') return;
    const th = card.offsetWidth * SWIPE_RATIO;
    const vel = s.dx / Math.max(80, Date.now() - s.t);
    if (s.dx < -th || vel < -0.7) commit(card, 'keep');
    else if (s.dx > th || vel > 0.7) commit(card, 'again');
    else {
      card.classList.remove('dragging');
      card.style.removeProperty('--tx');
      card.style.removeProperty('--rot');
      card.style.removeProperty('--keep-o');
      card.style.removeProperty('--again-o');
    }
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}

function commit(card, dir) {
  if (busy || !queue.length || !card) return;
  busy = true;
  const entry = queue[0];
  if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
  card.classList.remove('dragging');
  card.classList.add('fly');
  card.style.setProperty('--tx', (dir === 'keep' ? -1 : 1) * (window.innerWidth * 0.85 + 80) + 'px');
  card.style.setProperty('--rot', (dir === 'keep' ? -26 : 26) + 'deg');
  card.style.setProperty('--keep-o', dir === 'keep' ? '1' : '0');
  card.style.setProperty('--again-o', dir === 'again' ? '1' : '0');
  applyResult(entry, dir === 'keep');
  if (dir === 'keep') round.kept++; else round.agained++;
  round.done++;
  queue.shift();
  if (round.batch && !queue.some((e) => e.batch === round.batch)) {
    if (!S.batchesDone.includes(round.batch)) S.batchesDone.push(round.batch);
    saveState();
    if (round.batch === nextUnlearnedBatch()) toast('本批 5 个新词已全部过完 ✓');
  }
  if (!queue.length) bumpStreak();
  setTimeout(() => { busy = false; render(); }, 300);
}

/* ---------- 页面渲染 ---------- */
function renderMeta() {
  const cur = (queue[0] && queue[0].batch) || nextUnlearnedBatch()
    || allDates().filter((d) => S.batchesDone.includes(d)).slice(-1)[0] || START;
  $('#dayChip').textContent = `${fmtMD(cur)} · 第 ${batchNo(cur)} 期`;
  const mastered = Object.values(S.words).filter((r) => r.status === 'mastered').length;
  const due = dueList().length;
  $('#statsRow').textContent = `已掌握 ${mastered} · 待复习 ${due} · 连续打卡 ${S.streak.count} 天`;
  const total = (round && round.total) || 0;
  $('#progressFill').style.width = (total ? (round.done / total) * 100 : 0) + '%';
  $('#progressText').textContent = `${Math.min(round.done, total)} / ${total}`;
}

function render() {
  renderMeta();
  const stack = $('#stack');
  if (!queue.length) { renderDoneCard(); return; }
  stack.innerHTML = '';
  const top3 = queue.slice(0, 3);
  for (let i = top3.length - 1; i >= 0; i--) stack.appendChild(cardEl(top3[i], i));
  $('#actions').classList.remove('hidden');
  $('.swipe-hint').classList.remove('hidden');
}

function renderDoneCard() {
  $('#actions').classList.add('hidden');
  $('.swipe-hint').classList.add('hidden');
  const stack = $('#stack');
  const nextBatch = nextUnlearnedBatch();
  const locked = nextLockedBatch();
  const tomorrow = addDays(bjDateStr(), 1);
  const dueTomorrow = Object.values(S.words).filter((r) => r.status === 'learning' && r.next === tomorrow).length;
  const el = document.createElement('article');
  el.className = 'card done-card c0';
  let unlockText;
  if (nextBatch) {
    unlockText = '词库里还有已解锁的未学批次，点上方按钮继续。';
  } else if (locked) {
    unlockText = `下一批新词（${fmtMD(locked)} · 第 ${batchNo(locked)} 期）将于北京时间 08:27 解锁 · 倒计时 <span id="cd">--:--:--</span>`;
  } else {
    unlockText = '内置词库已全部学完，等待数据源更新。';
  }
  el.innerHTML = `
    <div class="card-scroll"><div class="done-inner">
      <div class="done-ico">${ICON_CHECK}</div>
      <h2>本轮完成</h2>
      <p class="done-sum">新词 ${round.news} · 复习 ${round.reviews} ｜ 记住 ${round.kept} · 明天再练 ${round.agained}</p>
      ${dueTomorrow ? `<p class="done-note">艾宾浩斯安排：明天有 ${dueTomorrow} 个词到复习期</p>` : ''}
      <button id="btnNextBatch" class="primary" ${nextBatch ? '' : 'disabled'}>再学 5 个新词</button>
      <p class="hint">${unlockText}</p>
      <div class="done-links"><button id="btnAbout2" class="ghost">查看使用说明</button></div>
    </div></div>`;
  stack.innerHTML = '';
  stack.appendChild(el);
  $('#btnNextBatch').addEventListener('click', () => {
    buildRound();
    if (queue.length) { toast('已载入新的学习批次'); render(); }
  });
  $('#btnAbout2').addEventListener('click', openAbout);
}

/* ---------- 倒计时与解锁 ---------- */
function tick() {
  if (queue.length) return;
  const locked = nextLockedBatch();
  const cd = $('#cd');
  if (!locked || !cd) {
    // 批次可能刚好解锁：自动刷新
    if (!queue.length && locked === null && $('#btnNextBatch') && nextUnlearnedBatch()) { buildRound(); render(); }
    return;
  }
  const left = unlockMs(locked) - Date.now();
  if (left <= 0) {
    buildRound();
    if (queue.length) { toast('今日新词已解锁，共 5 个'); render(); }
    return;
  }
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  cd.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ---------- 主题 ---------- */
function applyTheme() {
  document.documentElement.dataset.theme = S.theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', S.theme === 'night' ? '#0e1420' : '#f5f0e6');
}

/* ---------- 抽屉 ---------- */
function openAbout() { $('#aboutOverlay').classList.remove('hidden'); }
function closeAbout() { $('#aboutOverlay').classList.add('hidden'); }

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2400);
}

/* ---------- 初始化 ---------- */
function init() {
  applyTheme();
  buildRound();
  render();

  $('#btnTheme').addEventListener('click', () => {
    S.theme = S.theme === 'paper' ? 'night' : 'paper';
    saveState();
    applyTheme();
  });
  $('#btnAbout').addEventListener('click', openAbout);
  $('#btnCloseAbout').addEventListener('click', closeAbout);
  $('#aboutOverlay').addEventListener('click', (e) => { if (e.target.id === 'aboutOverlay') closeAbout(); });

  $('#btnKeep').addEventListener('click', () => commit($('.card.c0'), 'keep'));
  $('#btnAgain').addEventListener('click', () => commit($('.card.c0'), 'again'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') commit($('.card.c0'), 'keep');
    if (e.key === 'ArrowRight') commit($('.card.c0'), 'again');
  });

  $('#btnExport').addEventListener('click', () => {
    const data = JSON.stringify(S);
    const done = () => toast('备份已复制到剪贴板');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(data).then(done, () => fallbackPromptExport(data));
    else fallbackPromptExport(data);
  });
  function fallbackPromptExport(data) { window.prompt('全选复制以下内容保存：', data); }
  $('#btnImport').addEventListener('click', () => {
    const raw = window.prompt('粘贴此前导出的备份内容：');
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      if (s && s.v === 1 && s.words && s.batchesDone) {
        S = s;
        saveState();
        applyTheme();
        buildRound();
        render();
        toast('导入成功');
        closeAbout();
      } else toast('备份格式不正确');
    } catch (e) { toast('备份解析失败'); }
  });
  $('#btnReset').addEventListener('click', () => {
    if (window.confirm('确定清空全部学习进度吗？此操作不可恢复。')) {
      localStorage.removeItem(KEY);
      S = defaultState();
      saveState();
      applyTheme();
      buildRound();
      render();
      closeAbout();
      toast('进度已清空');
    }
  });

  $('#btnStart').addEventListener('click', () => {
    S.hintSeen = true;
    saveState();
    $('#hintOverlay').classList.add('hidden');
  });

  if (!S.hintSeen) $('#hintOverlay').classList.remove('hidden');
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
}

init();
