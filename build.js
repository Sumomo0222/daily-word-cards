#!/usr/bin/env node
// 每日英语单词卡 · 零依赖构建脚本
// data/YYYY-MM-DD.json + data/review-state.json
//   -> index.html（滑动卡片学习页，艾宾浩斯调度，6 款可切换主题）
//   -> styles.html（风格对比预览页）
//   -> archive/YYYY-MM-DD.html（各期列表页） + archive/index.html（合集）
// 用法：node build.js

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const ARCHIVE = path.join(ROOT, 'archive');
const INTERVALS = [1, 2, 4, 7, 15, 30]; // 艾宾浩斯复习间隔（天），与 server.py 保持一致

/* ---------- 数据加载 ---------- */
const issueFiles = fs.readdirSync(DATA)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .sort();
if (issueFiles.length === 0) {
  console.error('data/ 下没有任何 YYYY-MM-DD.json，先写数据再构建。');
  process.exit(1);
}
const issues = issueFiles.map(f => {
  const j = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  if (!j.date || !Array.isArray(j.words) || j.words.length === 0) {
    console.error(`${f} 缺少 date 或 words 字段`);
    process.exit(1);
  }
  return j;
});
issues.sort((a, b) => a.date.localeCompare(b.date));

let state = { updatedAt: '', words: {} };
const statePath = path.join(DATA, 'review-state.json');
if (fs.existsSync(statePath)) {
  try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch (e) { /* 损坏则按空状态构建 */ }
}

let history = { total: 0, words: [] };
const historyPath = path.join(DATA, 'word-history.json');
if (fs.existsSync(historyPath)) history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

/* ---------- 工具 ---------- */
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const weekdayCN = iso => { const [y, m, d] = iso.split('-').map(Number); return WEEK[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; };

/* ---------- 卡组调度（艾宾浩斯） ---------- */
function computeDeck(latestDate, state) {
  const cards = [];
  for (const issue of issues) {
    for (const w of issue.words) {
      const st = (state.words || {})[w.word];
      if (st && st.graduated) continue;
      if (st && st.due && st.due <= latestDate) {
        cards.push({ ...w, kind: 'review', stage: st.stage || 0, dueDate: st.due, issueDate: issue.date, missed: false });
      } else if (!st && issue.date < latestDate) {
        cards.push({ ...w, kind: 'review', stage: 0, dueDate: issue.date, issueDate: issue.date, missed: true });
      } else if (!st && issue.date === latestDate) {
        cards.push({ ...w, kind: 'new', stage: 0, issueDate: issue.date });
      }
    }
  }
  cards.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'review' ? -1 : 1;
    return String(a.dueDate || a.issueDate).localeCompare(String(b.dueDate || b.issueDate));
  });
  return cards;
}

function computeSchedule(latestDate, state) {
  const sched = {};
  for (const [, st] of Object.entries(state.words || {})) {
    if (!st.graduated && st.due && st.due > latestDate) sched[st.due] = (sched[st.due] || 0) + 1;
  }
  return sched;
}

/* 加练词池：构建时不再计算，改由页面在浏览器端从全部历史词生成（见 appJS 的 extraPoolFrom） */

/* ---------- 主题系统 ---------- */
// 默认 :root = 奶油纸感；其余主题用 [data-theme=...] 覆盖变量
const THEMES = [
  { id: 'paper', name: '奶油纸感', dot: 'linear-gradient(135deg,#fffdf6,#e8dcc4)', sw: '#b9722e' },
  { id: 'mint', name: '薄荷清爽', dot: 'linear-gradient(135deg,#ffffff,#d9efe3)', sw: '#27965f' }
];

const THEME_BLOCKS = `
:root{
  --bg:#f6f1e7; --panel:#fffdf8; --panel2:#f8f3e8;
  --card-a:#fffef9; --card-b:#fbf6ea; --face-glow:rgba(185,114,46,.12);
  --line:rgba(90,74,50,.14); --line-strong:rgba(90,74,50,.30);
  --ink:#3a3226; --muted:#7c7059; --faint:#a89b83;
  --accent:#b9722e; --accent-soft:rgba(185,114,46,.11); --accent-line:rgba(185,114,46,.48); --accent-wash:rgba(185,114,46,.05);
  --info:#3f7fa6; --info-soft:rgba(63,127,166,.10); --info-line:rgba(63,127,166,.48);
  --ok:#4e8f56; --ok-soft:rgba(78,143,86,.12); --ok-line:rgba(78,143,86,.5);
  --warn:#c98a2a; --warn-soft:rgba(201,138,42,.12); --warn-line:rgba(201,138,42,.5);
  --vio:#8f6bb3; --vio-soft:rgba(143,107,179,.10); --vio-line:rgba(143,107,179,.42);
  --shadow-card:0 16px 40px rgba(96,78,46,.15),0 2px 8px rgba(96,78,46,.08),inset 0 1px 0 rgba(255,255,255,.85);
  --shadow-soft:0 10px 28px rgba(96,78,46,.13);
  --grid-line:rgba(80,66,44,.05); --noise-op:.05;
  --word-glow:0 3px 22px rgba(185,114,46,.20); --stamp-bg:rgba(255,253,248,.72);
}
[data-theme="mint"]{
  --bg:#eef7f1; --panel:#ffffff; --panel2:#f0f9f4;
  --card-a:#ffffff; --card-b:#f1faf5; --face-glow:rgba(39,150,95,.10);
  --line:rgba(30,80,55,.12); --line-strong:rgba(30,80,55,.28);
  --ink:#1c3a2d; --muted:#5e7a6c; --faint:#94aca0;
  --accent:#27965f; --accent-soft:rgba(39,150,95,.10); --accent-line:rgba(39,150,95,.48); --accent-wash:rgba(39,150,95,.05);
  --info:#3a7ca8; --info-soft:rgba(58,124,168,.09); --info-line:rgba(58,124,168,.46);
  --ok:#2f8f5f; --ok-soft:rgba(47,143,95,.11); --ok-line:rgba(47,143,95,.5);
  --warn:#cf8a2d; --warn-soft:rgba(207,138,45,.11); --warn-line:rgba(207,138,45,.5);
  --vio:#8a6fb8; --vio-soft:rgba(138,111,184,.09); --vio-line:rgba(138,111,184,.42);
  --shadow-card:0 16px 40px rgba(24,74,50,.13),0 2px 8px rgba(24,74,50,.07),inset 0 1px 0 rgba(255,255,255,.9);
  --shadow-soft:0 10px 28px rgba(24,74,50,.12);
  --grid-line:rgba(24,74,50,.045); --noise-op:.04;
  --word-glow:0 3px 20px rgba(39,150,95,.18); --stamp-bg:rgba(255,255,255,.72);
}
`;

/* ---------- 样式 ---------- */
const CSS = `
${THEME_BLOCKS}
:root{
  --serif:'Noto Serif SC','Songti SC','STSong',serif;
  --sans:'Noto Sans SC','PingFang SC','Hiragino Sans GB',sans-serif;
  --mono:'IBM Plex Mono','SF Mono','Menlo',monospace;
}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  background-color:var(--bg);color:var(--ink);font-family:var(--sans);
  font-size:14px;line-height:1.75;
  background-image:
    radial-gradient(900px 480px at 15% -6%, var(--accent-soft), transparent 60%),
    radial-gradient(800px 560px at 108% 22%, var(--info-soft), transparent 60%),
    radial-gradient(700px 700px at 50% 115%, var(--vio-soft), transparent 60%);
  min-height:100vh;transition:background-color .3s,color .3s;
}
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:linear-gradient(var(--grid-line) 1px, transparent 1px),
  linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);background-size:72px 72px}
::selection{background:var(--accent-soft)}
a{color:inherit}
button{font-family:inherit}

/* ===== 主题切换按钮 ===== */
.theme-btn{position:fixed;top:calc(10px + env(safe-area-inset-top));right:12px;z-index:90;
  width:38px;height:38px;border-radius:50%;border:1px solid var(--line-strong);cursor:pointer;
  background:var(--panel);box-shadow:var(--shadow-soft);font-size:17px;display:flex;align-items:center;justify-content:center;
  touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .15s}
.theme-btn:active{transform:scale(.92)}
.theme-panel{position:fixed;top:calc(56px + env(safe-area-inset-top));right:12px;z-index:91;
  background:var(--panel);border:1px solid var(--line-strong);border-radius:16px;box-shadow:var(--shadow-pop);
  padding:10px;display:none;min-width:170px}
.theme-panel.show{display:block;animation:pop .25s ease}
.tp-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;cursor:pointer;border:none;background:none;width:100%;text-align:left}
.tp-item:hover{background:var(--accent-soft)}
.tp-dot{width:22px;height:22px;border-radius:50%;border:1px solid var(--line-strong);flex:none}
.tp-name{font-size:13px;color:var(--ink)}
.tp-item .tp-check{margin-left:auto;color:var(--accent);font-weight:700;visibility:hidden}
.tp-item.active .tp-check{visibility:visible}
.tp-foot{border-top:1px solid var(--line);margin-top:8px;padding:8px 10px 2px;font-family:var(--mono);font-size:10px;color:var(--faint);letter-spacing:.06em}
.tp-foot a{color:var(--info);text-decoration:none}

/* ===== 学习页（移动优先） ===== */
.topbar{position:relative;z-index:5;display:flex;justify-content:space-between;align-items:center;
  padding:14px 62px 8px 18px;max-width:560px;margin:0 auto;gap:10px}
.brand{font-family:var(--serif);font-weight:900;font-size:clamp(15px,4.4vw,18px);letter-spacing:.03em;
  display:flex;align-items:center;gap:8px;white-space:nowrap}
.brand .logo{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;flex:none;
  background:var(--accent-soft);border:1px solid var(--accent-line);color:var(--accent);
  font-size:15px;font-family:var(--serif)}
.tb-date{font-family:var(--mono);font-size:10.5px;color:var(--faint);letter-spacing:.1em;text-align:right;line-height:1.6;white-space:nowrap}
.tb-date b{color:var(--muted);font-weight:500}
@media (max-width:430px){.tb-sub{display:none}}

.chipsbar{position:relative;z-index:5;display:flex;gap:8px;justify-content:center;padding:4px 18px 2px;max-width:560px;margin:0 auto;flex-wrap:wrap}
.cchip{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;padding:4px 12px;border-radius:999px;border:1px solid var(--line-strong);color:var(--muted)}
.cchip.rev{color:var(--info);border-color:var(--info-line);background:var(--info-soft)}
.cchip.new{color:var(--accent);border-color:var(--accent-line);background:var(--accent-soft)}
.cchip.ext{color:var(--vio);border-color:var(--vio-line);background:var(--vio-soft)}
.cchip.hidden{display:none}

.deck-zone{position:relative;z-index:4;max-width:560px;margin:0 auto;padding:8px 18px 0}
.prog{position:relative;height:22px;margin:2px 0 10px}
.prog-track{position:absolute;left:0;right:0;top:9px;height:3px;background:var(--line);border-radius:2px}
.prog-fill{position:absolute;left:0;top:9px;height:3px;background:linear-gradient(90deg,var(--accent),var(--info));border-radius:2px;width:0%;transition:width .3s;z-index:1}
.prog-text{position:absolute;right:0;top:-3px;font-family:var(--mono);font-size:11px;color:var(--faint);letter-spacing:.1em}

.deck{position:relative;width:min(100%,420px);height:clamp(420px,58vh,600px);margin:0 auto}
.cardpos{position:absolute;inset:0;transition:transform .38s cubic-bezier(.22,.9,.32,1.15),opacity .3s;will-change:transform;touch-action:pan-y}
.cardpos[data-pos="0"]{z-index:30}
.cardpos[data-pos="1"]{transform:translateY(14px) scale(.965) rotate(.7deg);z-index:20;opacity:.8}
.cardpos[data-pos="2"]{transform:translateY(27px) scale(.93) rotate(-.6deg);z-index:10;opacity:.55}
.cardpos[data-pos="hide"]{transform:translateY(40px) scale(.9);opacity:0;z-index:0;pointer-events:none}
.cardpos.dragging{transition:none}
.cardpos.fly-left{transform:translateX(-135%) rotate(-17deg)!important;opacity:0}
.cardpos.fly-right{transform:translateX(135%) rotate(17deg)!important;opacity:0}

.card3d{position:relative;width:100%;height:100%;perspective:1300px}
.card-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.3,.7,.25,1)}
.card-inner.flipped{transform:rotateY(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;
  border-radius:22px;border:1px solid var(--line-strong);
  background:linear-gradient(168deg,var(--card-a) 0%,var(--card-b) 100%);
  box-shadow:var(--shadow-card)}

.face.front{display:flex;flex-direction:column;padding:20px 22px 16px;cursor:pointer;overflow:hidden}
.face.front::before{content:'';position:absolute;inset:0;pointer-events:none;border-radius:22px;
  background:radial-gradient(320px 180px at 82% -10%, var(--face-glow), transparent 65%)}
.f-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.chip{font-family:var(--mono);font-size:10px;letter-spacing:.14em;padding:3px 10px;border-radius:999px;border:1px solid}
.chip.new{color:var(--accent);border-color:var(--accent-line);background:var(--accent-soft)}
.chip.rev{color:var(--info);border-color:var(--info-line);background:var(--info-soft)}
.chip.ext{color:var(--vio);border-color:var(--vio-line);background:var(--vio-soft)}
.chip.lv{margin-left:auto;color:var(--muted);border-color:var(--line-strong)}
.f-audio{display:flex;gap:10px;justify-content:center;margin-top:2px}
.audio-btn{font-family:var(--mono);font-size:11px;letter-spacing:.08em;padding:5px 14px;border-radius:999px;
  border:1px solid var(--info-line);color:var(--info);background:var(--info-soft);cursor:pointer;
  touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .12s;display:inline-flex;align-items:center;gap:4px}
.audio-btn:active{transform:scale(.94)}
.audio-btn.playing{color:var(--accent);border-color:var(--accent-line);background:var(--accent-soft);animation:pulse .9s ease infinite}
@keyframes pulse{50%{opacity:.55}}
.f-mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;position:relative}
.f-word{font-family:var(--serif);font-weight:900;font-size:clamp(30px,10vw,46px);letter-spacing:.01em;line-height:1.1;
  text-shadow:var(--word-glow)}
.f-phon{font-family:var(--mono);font-size:clamp(10.5px,3.2vw,12.5px);color:var(--info);letter-spacing:.02em;
  max-width:100%;overflow-wrap:anywhere;line-height:1.7}
.f-pos{font-size:12px;color:var(--faint);overflow-wrap:anywhere;max-width:100%}
.f-issue{font-family:var(--mono);font-size:9.5px;color:var(--faint);letter-spacing:.16em;margin-top:4px;opacity:.8}
.f-bot{display:flex;align-items:center;justify-content:center;gap:6px;padding-top:10px;border-top:1px dashed var(--line)}
.flip-hint{font-family:var(--mono);font-size:10px;letter-spacing:.22em;color:var(--faint);text-transform:uppercase}

.face.back{transform:rotateY(180deg);padding:18px 20px 14px;overflow-y:auto;-webkit-overflow-scrolling:touch;cursor:pointer}
.b-head{display:flex;align-items:baseline;gap:12px;border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:12px;
  position:sticky;top:-18px;background:var(--card-a);margin-left:-20px;margin-right:-20px;padding-left:20px;padding-right:20px;padding-top:12px;z-index:2}
.b-word{font-family:var(--serif);font-weight:900;font-size:24px}
.b-audio{display:flex;gap:6px;margin-left:8px}
.b-audio .audio-btn{font-size:9px;padding:3px 9px}
.b-close{margin-left:auto;font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;color:var(--faint);text-transform:uppercase;white-space:nowrap}
.b-sec{margin-bottom:14px}
.lab{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.26em;color:var(--accent);text-transform:uppercase;margin-bottom:6px}
.def-en{font-size:13.5px;font-style:italic;color:var(--ink)}
.def-zh{margin-top:3px;font-size:12.5px;color:var(--muted)}
.coll{font-family:var(--mono);font-size:11px;color:var(--faint);line-height:1.9}
.ex{padding:8px 0;border-bottom:1px dashed var(--line)}
.ex:last-child{border-bottom:none;padding-bottom:0}
.ex .tag{display:inline-block;font-family:var(--mono);font-size:8.5px;letter-spacing:.12em;padding:1.5px 7px;border-radius:3px;margin-bottom:4px}
.ex .tag.src{background:var(--ok-soft);color:var(--ok);border:1px solid var(--ok-line)}
.ex .tag.src a{color:inherit;text-decoration:none}
.ex .tag.sc{background:var(--vio-soft);color:var(--vio);border:1px solid var(--vio-line)}
.ex .en{font-size:13px;line-height:1.65}
.ex .zh{margin-top:2px;font-size:12px;color:var(--muted)}
.tip{padding:11px 14px;border-left:3px solid var(--accent);background:var(--accent-soft);font-size:12.5px;border-radius:0 10px 10px 0}
.lab2{display:block;font-family:var(--mono);font-size:8.5px;letter-spacing:.24em;color:var(--accent);text-transform:uppercase;margin-bottom:4px}
.b-foot{font-family:var(--mono);font-size:9px;color:var(--faint);letter-spacing:.14em;text-align:center;padding:6px 0 2px}

.stamp{position:absolute;top:20px;z-index:6;padding:5px 14px;border-radius:9px;font-family:var(--serif);font-weight:900;
  font-size:19px;letter-spacing:.12em;border:3px solid;opacity:0;pointer-events:none;backdrop-filter:blur(2px)}
.st-l{left:16px;color:var(--ok);border-color:var(--ok);background:var(--stamp-bg);transform:rotate(-11deg)}
.st-r{right:16px;color:var(--warn);border-color:var(--warn);background:var(--stamp-bg);transform:rotate(11deg)}

.actions{position:relative;z-index:5;display:flex;gap:14px;width:min(92%,420px);margin:16px auto 8px}
.btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;padding:11px 0 9px;border-radius:16px;cursor:pointer;
  font-size:15px;font-weight:700;letter-spacing:.04em;border:1px solid;transition:transform .12s;background:transparent;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.btn .btn-sub{font-family:var(--mono);font-size:9px;letter-spacing:.2em;opacity:.65;font-weight:400}
.btn.known{color:var(--ok);border-color:var(--ok-line);background:var(--ok-soft)}
.btn.again{color:var(--warn);border-color:var(--warn-line);background:var(--warn-soft)}
.btn:active{transform:scale(.95)}
.btn.hidden,.hint.hidden{display:none}
.actions.hidden{display:none}
.hint{position:relative;z-index:5;text-align:center;font-family:var(--mono);font-size:10px;letter-spacing:.14em;color:var(--faint);padding:2px 18px 0}

/* 完成面板 */
.done{display:none;width:min(100%,420px);margin:0 auto;padding:26px 22px;border:1px solid var(--line-strong);border-radius:22px;
  background:var(--panel);text-align:center;box-shadow:var(--shadow-soft)}
.done.show{display:block;animation:pop .4s cubic-bezier(.22,.9,.32,1.2)}
@keyframes pop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
.done .big{font-size:34px}
.done h2{font-family:var(--serif);font-size:21px;margin:6px 0 2px}
.done .sum{color:var(--muted);font-size:12.5px}
.done .sum b{color:var(--ok)}
.done .sum i{color:var(--warn);font-style:normal}
.forecast{display:flex;align-items:flex-end;gap:7px;height:88px;margin:18px 6px 4px}
.fc-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;gap:4px;text-align:center}
.fc-bar{background:linear-gradient(180deg,var(--accent),var(--accent-soft));border-radius:4px 4px 2px 2px;min-height:3px;transition:height .4s}
.fc-col .n{font-family:var(--mono);font-size:9.5px;color:var(--muted)}
.fc-col .d{font-family:var(--mono);font-size:8.5px;color:var(--faint);letter-spacing:.04em}
.ebbing{font-family:var(--mono);font-size:9.5px;color:var(--faint);letter-spacing:.1em;line-height:1.9;margin-top:10px}
.done .toarc{display:inline-block;margin-top:12px;font-family:var(--mono);font-size:11px;color:var(--info);text-decoration:none;border:1px solid var(--info-line);padding:6px 16px;border-radius:999px;background:transparent;cursor:pointer}
.done .toarc:active{transform:scale(.96)}
#btn-extra{margin-right:10px;color:var(--vio);border-color:var(--vio-line);background:var(--vio-soft)}
#btn-extra:disabled{opacity:.5}

.pfoot{position:relative;z-index:4;max-width:560px;margin:22px auto 0;padding:16px 18px 30px;border-top:3px double var(--line-strong);text-align:center}
.pfoot a{font-family:var(--mono);font-size:11px;color:var(--info);text-decoration:none;letter-spacing:.08em}
.pfoot p{font-family:var(--mono);font-size:9.5px;color:var(--faint);letter-spacing:.08em;line-height:2;margin-top:8px}
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99;background:var(--panel);border:1px solid var(--line-strong);
  color:var(--ink);font-size:12px;padding:9px 18px;border-radius:999px;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap;box-shadow:var(--shadow-soft)}
.toast.show{opacity:1}

/* ===== 归档列表页 ===== */
.wrap{position:relative;z-index:2;max-width:980px;margin:0 auto;padding:0 28px 72px}
.strip{border-bottom:1px solid var(--line-strong);background:var(--accent-wash);
  font-family:var(--mono);font-size:10.5px;letter-spacing:.22em;color:var(--accent);
  padding:7px 0;text-align:center;text-transform:uppercase}
.strip .dim{color:var(--faint)}
.masthead{display:flex;justify-content:space-between;align-items:flex-end;gap:32px;padding:44px 0 26px;border-bottom:3px double var(--line-strong);flex-wrap:wrap}
.masthead h1{font-family:var(--serif);font-weight:900;font-size:44px;line-height:1.15;letter-spacing:.04em}
.masthead .sub{margin-top:10px;font-family:var(--mono);font-size:11px;letter-spacing:.3em;color:var(--faint);text-transform:uppercase}
.masthead .sub b{color:var(--accent);font-weight:600}
.meta{text-align:right;font-family:var(--mono);font-size:11px;line-height:2;color:var(--muted)}
.meta .date{font-size:20px;color:var(--ink);font-weight:600;letter-spacing:.08em}
.meta .date small{font-size:12px;color:var(--accent)}
.theme-line{padding:18px 0 4px;font-family:var(--serif);font-size:17px}
.theme-line .lab{font-family:var(--mono);font-size:10px;letter-spacing:.28em;color:var(--accent);margin-right:12px;text-transform:uppercase}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:14px 0 8px}
.chips a{font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--muted);border:1px solid var(--line-strong);padding:4px 12px;text-decoration:none;border-radius:2px}
.chips a b{color:var(--accent);font-weight:600;margin-right:6px}
.chips a:hover{color:var(--ink);border-color:var(--accent)}
.card{border:1px solid var(--line-strong);background:var(--panel);margin:24px 0;scroll-margin-top:16px}
.card-head{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;padding:20px 26px 16px;border-bottom:1px solid var(--line);background:var(--panel2)}
.no{font-family:var(--mono);font-size:11px;color:var(--faint);letter-spacing:.2em}
.word-title{font-family:var(--serif);font-weight:900;font-size:36px;letter-spacing:.02em;line-height:1}
.phon{font-family:var(--mono);font-size:12.5px;color:var(--info)}
.badge{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;border:1px solid var(--line-strong);color:var(--muted);padding:3px 10px;border-radius:2px;margin-left:auto}
.badge.lv{border-color:var(--accent-line);color:var(--accent)}
.defs{padding:16px 26px;border-bottom:1px solid var(--line)}
.def-en{font-size:14.5px;font-style:italic}
.def-zh{margin-top:6px;color:var(--muted)}
.def-zh b{font-weight:600}
.coll{margin-top:10px;font-family:var(--mono);font-size:11.5px;color:var(--faint)}
.coll b{color:var(--info);font-weight:500;letter-spacing:.1em;margin-right:8px;text-transform:uppercase;font-size:10px}
.exs{padding:6px 26px 14px}
.ex{padding:12px 0;border-bottom:1px dashed var(--line)}
.ex:last-child{border-bottom:none}
.ex .tag{display:inline-block;font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;padding:2px 8px;border-radius:2px;margin-bottom:6px}
.ex .tag.src{background:var(--ok-soft);color:var(--ok);border:1px solid var(--ok-line)}
.ex .tag.src a{color:inherit;text-decoration:none}
.ex .tag.scenario{background:var(--vio-soft);color:var(--vio);border:1px solid var(--vio-line)}
.ex .en{font-size:14.5px}
.ex .zh{margin-top:3px;font-size:13px;color:var(--muted)}
.tip{margin:0 26px 24px;padding:14px 18px;border-left:3px solid var(--accent);background:var(--accent-soft);font-size:13.5px}
.tip .lab{display:block;font-family:var(--mono);font-size:9.5px;letter-spacing:.28em;color:var(--accent);text-transform:uppercase;margin-bottom:6px}
.footer{margin-top:48px;padding-top:22px;border-top:3px double var(--line-strong)}
.footer h3{font-family:var(--mono);font-size:11px;letter-spacing:.28em;color:var(--accent);text-transform:uppercase;margin-bottom:14px;font-weight:500}
.issue-list{display:flex;flex-wrap:wrap;gap:8px}
.issue-list a{font-family:var(--mono);font-size:11px;color:var(--muted);text-decoration:none;border:1px solid var(--line-strong);padding:4px 12px;border-radius:2px}
.issue-list a:hover{color:var(--ink);border-color:var(--accent)}
.issue-list a.cur{color:var(--accent);border-color:var(--accent-line)}
.note{margin-top:16px;font-family:var(--mono);font-size:10.5px;color:var(--faint);line-height:2}
.note a{color:var(--info)}
.issue-rows{margin-top:6px}
.issue-row{display:block;text-decoration:none;border:1px solid var(--line-strong);background:var(--panel);padding:18px 24px;margin:14px 0}
.issue-row:hover{border-color:var(--accent)}
.issue-row .top{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.issue-row .d{font-family:var(--mono);font-size:13px;color:var(--accent);letter-spacing:.08em}
.issue-row .n{font-family:var(--mono);font-size:10px;color:var(--faint);letter-spacing:.2em}
.issue-row .t{font-family:var(--serif);font-size:15px;margin-left:auto}
.issue-row .ws{margin-top:8px;font-size:12.5px;color:var(--muted)}
.issue-row .ws span{display:inline-block;margin-right:14px}
.issue-row .ws b{color:var(--info);font-weight:500}
@media (max-width:640px){
  .masthead h1{font-size:32px}
  .word-title{font-size:28px}
  .meta{text-align:left}
  .wrap{padding:0 18px 60px}
}
@media (prefers-reduced-motion: reduce){
  .cardpos,.card-inner{transition:none}
}

/* ===== 风格预览页 ===== */
.sw-wrap{position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:0 28px 72px}
.sw-note{padding:16px 0 6px;color:var(--muted);font-size:13px}
.style-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:26px;padding:16px 0 8px}
.style-cell{text-align:center}
.style-label{display:flex;align-items:center;gap:9px;justify-content:center;font-family:var(--serif);
  font-weight:700;font-size:15px;margin-bottom:10px}
.style-dot{width:20px;height:20px;border-radius:50%;border:1px solid var(--line-strong);display:inline-block}
.style-id{font-family:var(--mono);font-size:10px;color:var(--faint);letter-spacing:.12em;font-weight:400}
.phone{width:min(100%,390px);margin:0 auto;border-radius:26px;border:1px solid var(--line-strong);
  box-shadow:var(--shadow-card);overflow:hidden;background:var(--panel)}
.phone iframe{display:block;width:100%;height:600px;border:none}
.style-use{margin-top:10px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--accent);
  border:1px solid var(--accent-line);background:var(--accent-soft);padding:7px 18px;border-radius:999px;cursor:pointer}
.style-use:hover{color:var(--ink)}
@media (max-width:640px){
  .sw-wrap{padding:0 14px 60px}
}
`;

/* 主题应用 + 切换器（所有页面共用） */
const THEME_HEAD_JS = `
try{
  var t=new URLSearchParams(location.search).get('theme');
  if(!t)t=localStorage.getItem('wc-theme');
  if(t&&['paper','mint'].indexOf(t)>=0){
    document.documentElement.setAttribute('data-theme',t);
  }
}catch(e){}
`;
const THEME_UI_JS = `
(function(){
'use strict';
var THEMES=[
 {id:'paper',name:'奶油纸感',dot:'linear-gradient(135deg,#fffdf6,#e8dcc4)'},
 {id:'mint',name:'薄荷清爽',dot:'linear-gradient(135deg,#ffffff,#d9efe3)'}
];
function cur(){return document.documentElement.getAttribute('data-theme')||'paper';}
var btn=document.createElement('button');
btn.className='theme-btn';btn.type='button';btn.setAttribute('aria-label','切换风格');btn.textContent='🎨';
var panel=document.createElement('div');
panel.className='theme-panel';
var base=/\\/archive\\//.test(location.pathname)?'../':'';
var html='';
THEMES.forEach(function(t){
  html+='<button type="button" class="tp-item'+(cur()===t.id?' active':'')+'" data-t="'+t.id+'">'+
    '<span class="tp-dot" style="background:'+t.dot+'"></span>'+
    '<span class="tp-name">'+t.name+'</span><span class="tp-check">✓</span></button>';
});
html+='<div class="tp-foot">全部风格对比 → <a href="'+base+'styles.html">styles.html</a><br>预览页链接不会记住选择</div>';
panel.innerHTML=html;
document.body.appendChild(btn);document.body.appendChild(panel);
function sync(){
  panel.querySelectorAll('.tp-item').forEach(function(it){
    it.classList.toggle('active',it.getAttribute('data-t')===cur());
  });
}
btn.addEventListener('click',function(e){e.stopPropagation();panel.classList.toggle('show');sync();});
document.addEventListener('click',function(e){
  if(panel.classList.contains('show')&&!panel.contains(e.target))panel.classList.remove('show');
});
panel.addEventListener('click',function(e){
  var it=e.target.closest('.tp-item');
  if(!it)return;
  var id=it.getAttribute('data-t');
  document.documentElement.setAttribute('data-theme',id);
  try{localStorage.setItem('wc-theme',id);}catch(err){}
  sync();
});
})();
`;

const HEAD = (title, desc) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#f6f1e7">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="description" content="${esc(desc)}">
<title>${esc(title)}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23f6f1e7'/%3E%3Ctext x='16' y='22' font-size='16' text-anchor='middle' fill='%23b9722e' font-family='serif' font-weight='bold'%3EA%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700;900&family=Noto+Sans+SC:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script>${THEME_HEAD_JS}</script>
<style>${CSS}</style>
</head>
<body>`;

/* ---------- 交互卡组页（index.html） ---------- */
function renderDeckPage(latest) {
  const deck = computeDeck(latest.date, state);
  const schedule = computeSchedule(latest.date, state);
  const graduated = Object.values(state.words || {}).filter(s => s.graduated).length;
  const reviewCount = deck.filter(c => c.kind === 'review').length;
  const newCount = deck.filter(c => c.kind === 'new').length;
  const payload = {
    today: latest.date,
    issue: latest.issue,
    intervals: INTERVALS,
    allWords: issues.flatMap(is => is.words.map(w => ({ ...w, issueDate: is.date }))),
    srsSeed: (state && state.words) || {},
    stats: { review: reviewCount, new: newCount, graduated }
  };
  const appJS = `
(function(){
'use strict';
var D=window.__DECK__||{};
var INTERVALS=D.intervals||[1,2,4,7,15,30];
var ALL=D.allWords||[];
var LATEST=D.today;
var deckEl=document.getElementById('deck');
var doneEl=document.getElementById('done');
var els=[];var idx=0,known=0,again=0,grad=0,busy=false,finished=false;
var drag=null,THRESH=90;
var extraRound=false;

function shuffle(a){
  for(var i=a.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=a[i];a[i]=a[j];a[j]=t;
  }
  return a;
}

/* 复习状态以浏览器 localStorage 为准（首次访问用构建时嵌入的服务器状态作种子），
   这样纯静态 CDN 托管下艾宾浩斯调度依然完整；本地服务部署时另行 fire-and-forget 同步 */
function loadSRS(){
  try{
    var v=JSON.parse(localStorage.getItem('wc-srs')||'null');
    if(v&&v.words)return v;
  }catch(e){}
  var seed={words:{}};
  var src=D.srsSeed||{};
  for(var w in src){seed.words[w]=src[w];}
  return seed;
}
var SRS=loadSRS();
function saveSRS(){try{localStorage.setItem('wc-srs',JSON.stringify(SRS));}catch(e){}}
function gradCount(){var n=0;for(var w in SRS.words){if(SRS.words[w].graduated)n++;}return n;}

function deckFrom(latestDate){
  var cards=[];
  ALL.forEach(function(w){
    var st=SRS.words[w.word];
    var o=function(){var c={};for(var k in w)c[k]=w[k];return c;};
    if(st&&st.graduated)return;
    if(st&&st.due&&st.due<=latestDate){
      var c=o();c.kind='review';c.stage=st.stage||0;c.dueDate=st.due;c.missed=false;cards.push(c);
    }else if(!st&&w.issueDate<latestDate){
      var c2=o();c2.kind='review';c2.stage=0;c2.dueDate=w.issueDate;c2.missed=true;cards.push(c2);
    }else if(!st&&w.issueDate===latestDate){
      var c3=o();c3.kind='new';c3.stage=0;cards.push(c3);
    }
  });
  cards.sort(function(a,b){
    if(a.kind!==b.kind)return a.kind==='review'?-1:1;
    return String(a.dueDate||a.issueDate).localeCompare(String(b.dueDate||b.issueDate));
  });
  return cards;
}
function extraPoolFrom(deckCards){
  var inDeck={};deckCards.forEach(function(c){inDeck[c.word]=1;});
  var pool=[];
  ALL.forEach(function(w){
    if(inDeck[w.word])return;
    var st=SRS.words[w.word];
    pool.push(Object.assign({},w,{kind:'extra',stage:(st&&st.stage)||0,graduated:!!(st&&st.graduated),dueDate:(st&&st.due)||null}));
  });
  pool.sort(function(a,b){
    if(a.graduated!==b.graduated)return a.graduated?1:-1;
    return (a.stage||0)-(b.stage||0);
  });
  return pool.slice(0,60);
}
function schedFrom(){
  var s={};
  for(var w in SRS.words){
    var st=SRS.words[w];
    if(!st.graduated&&st.due&&st.due>LATEST)s[st.due]=(s[st.due]||0)+1;
  }
  return s;
}
var CARDS=deckFrom(LATEST);
var EXTRA=shuffle(extraPoolFrom(CARDS));

/* 演示模式（styles.html 预览用）：真实卡组为空时注入样例卡，不写打卡 */
var DEMO=false;
if(/demo=1/.test(location.search)&&CARDS.length===0){
  DEMO=true;
  var pad=function(n){return (n<10?'0':'')+n;};
  var d0=new Date();
  var iso=function(n){var t=new Date(d0.getTime()+n*86400000);return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());};
  var mk=function(word,phon,pos,lv,en,zh,tip,kind,stage){
    return {word:word,phonetic:phon,pos:pos,level:lv,issueDate:'演示',
      defs:{en:en,zh:zh},collocations:'',
      audio:{uk:'https://dictionary.cambridge.org/media/english/uk_pron/u/uke/ukemb/ukembar023.mp3',
             us:'https://dictionary.cambridge.org/media/english/us_pron/e/eus/eus75/eus75666.mp3'},
      examples:[{en:'We should embrace new challenges rather than avoid them.',zh:'我们应该拥抱新挑战，而不是回避它们。',
        source:{type:'scenario',name:'场景例句 · 演示数据'}}],
      tip:tip,kind:kind,stage:stage};
  };
  CARDS=[
    mk('embrace','UK /ɪmˈbreɪs/ · US /ɪmˈbreɪs/','v. 及物动词','CET-4 · IELTS 6',
      'to accept something willingly and enthusiastically','拥抱；欣然接受','演示卡片：左滑、右滑试试手感，不会记录进度。','review',1),
    mk('deadline','UK /ˈded.laɪn/ · US /ˈded.laɪn/','n. 可数名词','CET-4 · 职场高频',
      'a time or day by which something must be done','截止日期，最后期限','演示卡片：点击可以翻面看背面排版。','new',0)
  ];
  SCHED[iso(1)]=2;SCHED[iso(2)]=1;SCHED[iso(4)]=2;
  document.querySelector('.cchip.rev').textContent='复习 1';
  document.querySelector('.cchip.new').textContent='新词 1';
}

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function pad(n){return (n<10?'0':'')+n;}
function isoLocal(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function addDaysISO(n){return isoLocal(new Date(Date.now()+n*86400000));}

function exHTML(ex){
  var s=ex.source||{};var tag;
  if(s.type==='authoritative'&&s.url){
    tag='<span class="tag src">来源：<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.name)+'</a></span>';
  }else{
    tag='<span class="tag sc">'+esc(s.name||'场景例句')+'</span>';
  }
  return '<div class="ex">'+tag+'<div class="en">'+esc(ex.en)+'</div><div class="zh">'+esc(ex.zh)+'</div></div>';
}
function cardHTML(c){
  var kindBadge=c.kind==='new'
    ?'<span class="chip new">新词</span>'
    :c.kind==='extra'
    ?'<span class="chip ext">🔁 加练 · '+(c.graduated?'已掌握':'第'+((c.stage||0)+1)+'轮')+'</span>'
    :'<span class="chip rev">'+(c.missed?'漏学补复习':'复习 · 第'+((c.stage||0)+1)+'轮')+'</span>';
  var front='<div class="face front">'+
    '<div class="f-top">'+kindBadge+'<span class="chip lv">'+esc(c.level||'')+'</span></div>'+
    '<div class="f-mid"><div class="f-word">'+esc(c.word)+'</div>'+
    '<div class="f-phon">'+esc(c.phonetic||'')+'</div>'+
    '<div class="f-audio">'+
      '<button type="button" class="audio-btn" data-accent="uk">🔊 英音</button>'+
      '<button type="button" class="audio-btn" data-accent="us">🔊 美音</button>'+
    '</div>'+
    '<div class="f-pos">'+esc(c.pos||'')+'</div>'+
    '<div class="f-issue">'+esc(c.issueDate==='演示'?'演示卡片':c.issueDate+' 期')+'</div></div>'+
    '<div class="f-bot"><span class="flip-hint">☝ 点击翻面 · 左滑记住 · 右滑再记</span></div>'+
    '</div>';
  var back='<div class="face back">'+
    '<div class="b-head"><span class="b-word">'+esc(c.word)+'</span>'+
    '<span class="b-audio">'+
      '<button type="button" class="audio-btn" data-accent="uk">英 UK</button>'+
      '<button type="button" class="audio-btn" data-accent="us">美 US</button>'+
    '</span>'+
    '<span class="b-close">翻回正面 ⤴</span></div>'+
    '<div class="b-sec"><span class="lab">释义</span><div class="def-en">'+esc(c.defs.en)+'</div><div class="def-zh">'+esc(c.defs.zh)+'</div></div>'+
    (c.collocations?'<div class="b-sec"><span class="lab">搭配</span><div class="coll">'+esc(c.collocations)+'</div></div>':'')+
    '<div class="b-sec"><span class="lab">例句</span>'+c.examples.map(exHTML).join('')+'</div>'+
    '<div class="b-sec"><div class="tip"><span class="lab2">💡 记忆提示</span>'+esc(c.tip)+'</div></div>'+
    '<div class="b-foot">艾宾浩斯间隔 · 记住后 1 · 2 · 4 · 7 · 15 · 30 天重现</div>'+
    '</div>';
  return '<div class="stamp st-l">✓ 记住了</div><div class="stamp st-r">↻ 明天再记</div>'+
    '<div class="card3d"><div class="card-inner">'+front+back+'</div></div>';
}
function buildCards(){
  CARDS.forEach(function(c){
    var e=document.createElement('div');
    e.className='cardpos';
    e.innerHTML=cardHTML(c);
    deckEl.appendChild(e);
    els.push(e);
  });
}
function applyPositions(){
  for(var i=0;i<els.length;i++){
    var rel=i-idx,e=els[i];
    if(i<idx){e.style.display='none';continue;}
    e.style.display='';
    e.classList.remove('dragging');
    e.style.transform='';
    e.dataset.pos=rel===0?'0':rel===1?'1':rel===2?'2':'hide';
    var sts=e.querySelectorAll('.stamp');
    if(sts[0])sts[0].style.opacity=0;
    if(sts[1])sts[1].style.opacity=0;
    var inner=e.querySelector('.card-inner');
    if(inner)inner.classList.remove('flipped');
  }
  var total=CARDS.length,cur=Math.min(idx+1,total);
  document.getElementById('prog-text').textContent=total===0?'':cur+' / '+total;
  document.getElementById('prog-fill').style.width=(total===0?0:(idx/total*100))+'%';
}
function setStamps(e,l,r){
  var sts=e.querySelectorAll('.stamp');
  if(sts[0])sts[0].style.opacity=l;
  if(sts[1])sts[1].style.opacity=r;
}
function moveCard(dx,dy){
  var e=els[idx];if(!e)return;
  e.style.transform='translate('+dx+'px,'+(dy*0.3)+'px) rotate('+(dx/16)+'deg)';
  setStamps(e,Math.max(0,Math.min(1,-dx/THRESH)),Math.max(0,Math.min(1,dx/THRESH)));
}
function toggleFlip(e){
  if(!e)return;
  var inner=e.querySelector('.card-inner');
  if(inner)inner.classList.toggle('flipped');
}
function commit(kind){
  var c=CARDS[idx];if(!c)return;
  if(DEMO)return;
  var res=srsApply(c.word,kind,c.issueDate);
  if(kind==='known'){
    known++;
    if(res.grad){grad++;updateChip('chip-done',String(gradCount()));}
  }else{
    again++;
  }
  apiSync(c.word,kind,c.issueDate);
}
function srsApply(word,action,issueDate){
  var w=SRS.words[word]||{issueDate:issueDate,stage:0,graduated:false,reviews:0,againCount:0};
  w.reviews=(w.reviews||0)+1;
  w.lastAction=action;
  w.lastDate=isoLocal(new Date());
  var due=null,isGrad=false;
  if(action==='known'){
    w.stage=(w.stage||0)+1;
    if(w.stage-1>=INTERVALS.length){w.graduated=true;w.due=null;isGrad=true;}
    else{w.graduated=false;w.due=addDaysISO(INTERVALS[w.stage-1]);}
  }else{
    w.stage=0;w.graduated=false;w.againCount=(w.againCount||0)+1;w.due=addDaysISO(1);
  }
  SRS.words[word]=w;saveSRS();
  return {grad:isGrad};
}
function apiSync(word,action,issueDate){
  try{
    fetch('/api/review',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({word:word,action:action,issueDate:issueDate})}).catch(function(){});
  }catch(e){}
}
function swipe(kind){
  if(busy||finished)return;
  var e=els[idx];if(!e)return;
  busy=true;
  e.classList.remove('dragging');
  e.classList.add(kind==='known'?'fly-left':'fly-right');
  commit(kind);
  setTimeout(function(){
    idx++;busy=false;
    if(idx>=CARDS.length){showDone();}
    else{applyPositions();}
  },330);
}
function updateChip(id,v){
  var el=document.getElementById(id);
  if(el){el.textContent=el.textContent.replace(/[0-9]+/,String(v));}
}
function showDone(){
  finished=true;
  deckEl.style.display='none';
  document.getElementById('actions').classList.add('hidden');
  document.querySelector('.hint').classList.add('hidden');
  document.getElementById('prog-fill').style.width='100%';
  document.getElementById('prog-text').textContent=CARDS.length+' / '+CARDS.length;
  var sum=document.getElementById('done-sum');
  if(CARDS.length===0){
    sum.innerHTML='今天没有待学卡片，明天 08:27 再来～';
  }else{
    sum.innerHTML=(extraRound?'本轮加练：':'')+'已记住 <b>'+known+'</b> 个 · 明天再记 <i>'+again+'</i> 个'+(grad?' · 新掌握 '+grad+' 个 🎓':'');
  }
  doneEl.classList.add('show');
  renderForecast();
  syncExtraBtn();
}
function syncExtraBtn(){
  var b=document.getElementById('btn-extra');
  if(!b)return;
  b.style.display=EXTRA.length>0?'inline-block':'none';
  b.textContent='🔁 再来一组 · 加练 5 词（剩 '+EXTRA.length+'）';
}
function startExtra(){
  if(busy||EXTRA.length===0)return;
  var batch=EXTRA.splice(0,5);
  CARDS=batch;
  deckEl.innerHTML='';
  els=[];idx=0;known=0;again=0;grad=0;busy=false;finished=false;
  extraRound=true;
  buildCards();
  applyPositions();
  doneEl.classList.remove('show');
  deckEl.style.display='';
  document.getElementById('actions').classList.remove('hidden');
  document.querySelector('.hint').classList.remove('hidden');
  var ce=document.getElementById('chip-ext');
  if(ce){
    ce.classList.remove('hidden');
    ce.textContent='🔁 加练中 · 剩 '+EXTRA.length;
  }
  syncExtraBtn();
  toast('加练历史词 · 滑动照常计入复习进度');
}
function renderForecast(){
  var wrap=document.getElementById('forecast');wrap.innerHTML='';
  var SCHED=schedFrom();
  var names=['周日','周一','周二','周三','周四','周五','周六'];
  var days=[],max=1;
  for(var i=0;i<7;i++){
    var t=new Date(Date.now()+i*86400000);
    var iso=isoLocal(t);
    var n=SCHED[iso]||0;
    if(n>max)max=n;
    days.push({lab:(i===0?'今天':i===1?'明天':names[t.getDay()]),n:n});
  }
  days.forEach(function(x){
    var col=document.createElement('div');col.className='fc-col';
    var h=Math.round((x.n/max)*62);
    col.innerHTML='<span class="n">'+(x.n||'')+'</span><div class="fc-bar" style="height:'+h+'px"></div><span class="d">'+x.lab+'</span>';
    wrap.appendChild(col);
  });
}
var toastTimer=null;
function toast(msg){
  var t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){t.classList.remove('show');},2600);
}

/* ---- 发音播放：剑桥真人录音 → 有道语音 → 浏览器内置 TTS ---- */
function markPlaying(accent,on){
  var b=els[idx]&&els[idx].querySelectorAll('.audio-btn[data-accent="'+accent+'"]');
  if(!b)return;
  for(var i=0;i<b.length;i++){b[i].classList.toggle('playing',!!on);}
}
function playWord(word,accent,audio){
  try{window.speechSynthesis&&speechSynthesis.cancel();}catch(e){}
  markPlaying(accent,true);
  setTimeout(function(){markPlaying(accent,false);},2200);
  var cam=audio&&audio[accent];
  if(cam){
    var a=new Audio(cam);
    var fell=false;
    var fellBack=function(){if(fell)return;fell=true;youDao(word,accent);};
    a.onerror=fellBack;
    var p=a.play();
    if(p&&p.catch){p.catch(fellBack);}
  }else{
    youDao(word,accent);
  }
}
function youDao(word,accent){
  var a=new Audio('https://dict.youdao.com/dictvoice?type='+(accent==='uk'?'1':'2')+'&word='+encodeURIComponent(word));
  var fell=false;
  var fellBack=function(){if(fell)return;fell=true;speakTTS(word,accent);};
  a.onerror=fellBack;
  var p=a.play();
  if(p&&p.catch){p.catch(fellBack);}
}
function speakTTS(word,accent){
  try{
    if(!window.speechSynthesis)return;
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(word);
    u.lang=accent==='uk'?'en-GB':'en-US';
    u.rate=0.85;
    var vs=speechSynthesis.getVoices()||[];
    var v=null,i;
    for(i=0;i<vs.length;i++){if(vs[i].lang&&vs[i].lang.replace('_','-')===u.lang){v=vs[i];break;}}
    if(!v){for(i=0;i<vs.length;i++){if(vs[i].lang&&vs[i].lang.indexOf('en')===0){v=vs[i];break;}}}
    if(v)u.voice=v;
    speechSynthesis.speak(u);
  }catch(e){}
}
try{
  if(window.speechSynthesis){
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged=function(){speechSynthesis.getVoices();};
  }
}catch(e){}

deckEl.addEventListener('pointerdown',function(e){
  if(busy||finished)return;
  if(e.target.closest&&e.target.closest('.audio-btn'))return;
  if(e.target.closest&&e.target.closest('a'))return;
  var top=els[idx];if(!top)return;
  drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,dx:0,dy:0,moved:false};
});
deckEl.addEventListener('pointermove',function(e){
  if(!drag||e.pointerId!==drag.id)return;
  drag.dx=e.clientX-drag.sx;drag.dy=e.clientY-drag.sy;
  if(!drag.moved&&Math.abs(drag.dx)>6&&Math.abs(drag.dx)>Math.abs(drag.dy)){
    drag.moved=true;
    try{deckEl.setPointerCapture(e.pointerId);}catch(err){}
    var top=els[idx];if(top)top.classList.add('dragging');
  }
  if(drag.moved){moveCard(drag.dx,drag.dy);if(e.cancelable)e.preventDefault();}
},{passive:false});
function endDrag(e){
  if(!drag||e.pointerId!==drag.id)return;
  var dx=drag.dx,moved=drag.moved;
  drag=null;
  var top=els[idx];if(!top)return;
  if(moved){
    if(Math.abs(dx)>=THRESH){swipe(dx<0?'known':'again');}
    else{top.classList.remove('dragging');top.style.transform='';setStamps(top,0,0);}
  }else{
    toggleFlip(top);
  }
}
deckEl.addEventListener('pointerup',endDrag);
deckEl.addEventListener('pointercancel',function(e){
  if(!drag||e.pointerId!==drag.id)return;
  drag=null;
  var top=els[idx];
  if(top){top.classList.remove('dragging');top.style.transform='';setStamps(top,0,0);}
});
document.getElementById('btn-known').addEventListener('click',function(){swipe('known');});
document.getElementById('btn-again').addEventListener('click',function(){swipe('again');});
var btnExtra=document.getElementById('btn-extra');
if(btnExtra)btnExtra.addEventListener('click',startExtra);
deckEl.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.audio-btn');
  if(!b)return;
  var c=CARDS[idx];
  if(!c)return;
  playWord(c.word,b.getAttribute('data-accent'),c.audio);
});
document.addEventListener('keydown',function(e){
  if(e.key==='ArrowLeft'){swipe('known');}
  else if(e.key==='ArrowRight'){swipe('again');}
  else if(e.key===' '||e.key==='f'||e.key==='F'){
    if(document.activeElement&&document.activeElement.tagName==='BUTTON')return;
    e.preventDefault();toggleFlip(els[idx]);
  }
});
buildCards();
applyPositions();
updateChip('chip-rev',CARDS.filter(function(c){return c.kind==='review';}).length);
updateChip('chip-new',CARDS.filter(function(c){return c.kind==='new';}).length);
updateChip('chip-done',gradCount());
if(CARDS.length===0){showDone();}
})();
`;
  return `${HEAD(`每日英语单词卡 · ${latest.date}`, `每日英语单词卡：滑动卡片复习，艾宾浩斯遗忘曲线调度。${latest.date} 第${latest.issue}期。`)}
<header class="topbar">
  <div class="brand"><span class="logo">A</span>每日英语单词卡</div>
  <div class="tb-date"><b>${latest.date} ${weekdayCN(latest.date)}</b><br><span class="tb-sub">第 ${latest.issue} 期 · 每日 08:27 更新</span></div>
</header>
<div class="chipsbar">
  <span class="cchip rev">复习 ${reviewCount}</span>
  <span class="cchip new">新词 ${newCount}</span>
  <span class="cchip done">已掌握 ${graduated}</span>
  <span class="cchip ext hidden" id="chip-ext">🔁 加练中</span>
</div>
<div class="deck-zone">
  <div class="prog"><div class="prog-track"></div><div class="prog-fill" id="prog-fill"></div><span class="prog-text" id="prog-text"></span></div>
  <div class="deck" id="deck"></div>
  <div class="done" id="done">
    <div class="big">🎉</div>
    <h2>今日卡片完成</h2>
    <p class="sum" id="done-sum"></p>
    <div class="forecast" id="forecast"></div>
    <p class="ebbing">艾宾浩斯复习节奏：点「已记住」后按 1 · 2 · 4 · 7 · 15 · 30 天间隔重现<br>点「明天再记」则明天重新出现，直到记住为止</p>
    <button type="button" class="toarc" id="btn-extra" style="display:none">🔁 再来一组</button>
    <a class="toarc" href="archive/index.html">📁 按日期浏览往期 →</a>
  </div>
</div>
<div class="actions" id="actions">
  <button class="btn known" id="btn-known">✓ 已记住<span class="btn-sub">← 左滑</span></button>
  <button class="btn again" id="btn-again">↻ 明天再记<span class="btn-sub">右滑 →</span></button>
</div>
<p class="hint">左滑＝已经记住 · 右滑＝明天继续提醒 · 点击卡片翻面 · 右上角 🎨 换风格</p>
<footer class="pfoot">
  <a href="archive/index.html">往期归档（按日期浏览全部词汇）</a>
  <p>词典例句附来源链接，标注「场景例句」为自编 · 累计已学 ${history.total} 词<br>
  复习记录保存在本机服务（/api/review），多设备打开同一地址即可同步进度</p>
</footer>
<div class="toast" id="toast"></div>
<script>window.__DECK__=${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>
<script>${appJS}</script>
<script>${THEME_UI_JS}</script>
</body>
</html>`;
}

/* ---------- 归档列表页（浏览用） ---------- */
function latestDateOf(all) { return all[all.length - 1].date; }

function renderIssue(issue, allIssues, context) {
  const atRoot = context === 'root';
  const linkFor = it => {
    if (it.date === issue.date) return atRoot ? '#' : (it.date === latestDateOf(allIssues) ? '../index.html' : `${it.date}.html`);
    if (it.date === latestDateOf(allIssues)) return atRoot ? 'index.html' : '../index.html';
    return atRoot ? `archive/${it.date}.html` : `${it.date}.html`;
  };
  const chips = issue.words.map((w, i) =>
    `<a href="#w-${i}"><b>${String(i + 1).padStart(2, '0')}</b>${esc(w.word)}</a>`).join('\n');
  const cards = issue.words.map((w, i) => wordCard(w, i)).join('\n');
  const links = allIssues.slice().reverse().map(it =>
    `<a href="${linkFor(it)}"${it.date === issue.date ? ' class="cur"' : ''}>${it.date}</a>`).join('\n');
  const total = history.total || allIssues.reduce((n, it) => n + it.words.length, 0);
  return `${HEAD(`每日英语单词卡 · ${issue.date}`, `每日英语单词卡 第${issue.issue}期：生活与职场常用词，四六级到雅思6-7难度。${issue.date} 期。`)}
<div class="strip">Daily English Vocabulary <span class="dim">·</span> 每日英语单词卡 <span class="dim">·</span> 往期浏览</div>
<div class="wrap">
  <header class="masthead">
    <div>
      <h1>每日英语单词卡</h1>
      <div class="sub">第 <b>${issue.issue}</b> 期 · 5 New Words · 生活 × 职场</div>
    </div>
    <div class="meta">
      <div class="date">${issue.date} <small>${weekdayCN(issue.date)}</small></div>
      <div>本期 5 词 · 累计已学 ${total} 词</div>
    </div>
  </header>
  <p class="theme-line"><span class="lab">本期主题</span>${esc(issue.theme)}</p>
  <nav class="chips">${chips}</nav>
  ${cards}
  <footer class="footer">
    <h3>往期回顾</h3>
    <div class="issue-list">${links}
      <a href="${atRoot ? 'archive/index.html' : 'index.html'}">全部归档</a>
    </div>
    <p class="note"><a href="${atRoot ? 'index.html' : '../index.html'}">← 返回学习模式（滑动卡片复习）</a><br>
    词典例句均附来源链接，标注「场景例句」的条目为自编例句 · 本页路径 ${atRoot ? 'index.html' : `archive/${issue.date}.html`}</p>
  </footer>
</div>
<script>${THEME_UI_JS}</script>
</body>
</html>`;
}

function wordCard(w, idx) {
  const examples = w.examples.map(ex => {
    const s = ex.source || {};
    let tag;
    if (s.type === 'authoritative' && s.url) {
      tag = `<span class="tag src">来源：<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name || '权威词典')}</a></span>`;
    } else {
      tag = `<span class="tag scenario">${esc(s.name || '场景例句')}</span>`;
    }
    return `<div class="ex">${tag}
      <div class="en">${esc(ex.en)}</div>
      <div class="zh">${esc(ex.zh)}</div>
    </div>`;
  }).join('\n');
  return `<section class="card" id="w-${idx}">
  <div class="card-head">
    <span class="no">WORD ${String(idx + 1).padStart(2, '0')}</span>
    <span class="word-title">${esc(w.word)}</span>
    <span class="phon">${esc(w.phonetic)}</span>
    <span class="badge">${esc(w.pos)}</span>
    <span class="badge lv">${esc(w.level)}</span>
  </div>
  <div class="defs">
    <div class="def-en">${esc(w.defs.en)}</div>
    <div class="def-zh"><b>${esc(w.word)}</b> ${esc(w.defs.zh)}</div>
    ${w.collocations ? `<div class="coll"><b>搭配</b>${esc(w.collocations)}</div>` : ''}
  </div>
  <div class="exs">${examples}</div>
  <div class="tip"><span class="lab">💡 记忆提示</span>${esc(w.tip)}</div>
</section>`;
}

function renderArchiveIndex(allIssues) {
  const rows = allIssues.slice().reverse().map(it => {
    const ws = it.words.map(w => `<span><b>${esc(w.word)}</b> ${esc((w.defs.zh || '').split(/[；;，]/)[0])}</span>`).join('');
    return `<a class="issue-row" href="${it.date}.html">
      <div class="top"><span class="d">${it.date}</span><span class="n">第 ${it.issue} 期</span><span class="t">${esc(it.theme)}</span></div>
      <div class="ws">${ws}</div>
    </a>`;
  }).join('\n');
  return `${HEAD('每日英语单词卡 · 往期归档', '每日英语单词卡历史各期归档，按日期查看。')}
<div class="strip">Archive <span class="dim">·</span> 往期归档 <span class="dim">·</span> 按日期查看</div>
<div class="wrap">
  <header class="masthead">
    <div>
      <h1>往期归档</h1>
      <div class="sub">Daily Word Cards <b>${allIssues.length}</b> issues</div>
    </div>
    <div class="meta">
      <div class="date">累计 <small>${history.total || allIssues.reduce((n, it) => n + it.words.length, 0)} 词</small></div>
      <div><a href="../index.html" style="color:var(--accent)">← 返回学习模式</a></div>
    </div>
  </header>
  <div class="issue-rows">
  ${rows || '<p class="note">还没有往期内容。</p>'}
  </div>
  <footer class="footer"><p class="note">每天上午 08:27（北京时间）自动更新 · 页面由 build.js 生成 · <a href="../styles.html">风格预览</a></p></footer>
</div>
<script>${THEME_UI_JS}</script>
</body>
</html>`;
}

/* ---------- 风格预览页 ---------- */
function renderStylesPage(latest) {
  const frames = THEMES.map(t => `
  <div class="style-cell">
    <div class="style-label"><span class="style-dot" style="background:${t.dot}"></span>${t.name}<span class="style-id">${t.id}</span></div>
    <div class="phone"><iframe src="index.html?theme=${t.id}&demo=1" loading="lazy" title="${t.name} 预览"></iframe></div>
    <button type="button" class="style-use" data-t="${t.id}">设为我的风格</button>
  </div>`).join('\n');
  return `${HEAD('每日英语单词卡 · 风格预览', '六款界面风格对比预览：奶油纸感、薄荷清爽、樱花软语、晴空学院、宣纸墨韵、暗夜琥珀。')}
<div class="strip">Style Gallery <span class="dim">·</span> 风格预览 <span class="dim">·</span> 两款可选</div>
<div class="sw-wrap">
  <header class="masthead">
    <div>
      <h1>风格预览</h1>
      <div class="sub">2 Themes <b>·</b> 点「设为我的风格」记住选择</div>
    </div>
    <div class="meta">
      <div><a href="index.html" style="color:var(--accent)">← 返回学习模式</a></div>
    </div>
  </header>
  <p class="sw-note">下面是学习页在每种风格下的实时预览（390px 手机宽度，可直接滑动体验）。也可以在学习页右上角点 🎨 随时切换。</p>
  <div class="style-grid">
  ${frames}
  </div>
  <footer class="footer"><p class="note">主题保存在浏览器本地（localStorage），每天自动更新后依然生效 · 页面由 build.js 生成</p></footer>
</div>
<script>
(function(){
  document.addEventListener('click',function(e){
    var b=e.target.closest('.style-use');
    if(!b)return;
    var t=b.getAttribute('data-t');
    document.documentElement.setAttribute('data-theme',t);
    try{localStorage.setItem('wc-theme',t);}catch(err){}
    b.textContent='✓ 已设为我的风格';
    document.querySelectorAll('.style-use').forEach(function(x){if(x!==b)x.textContent='设为我的风格';});
  });
})();
</script>
<script>${THEME_UI_JS}</script>
</body>
</html>`;
}

/* ---------- 输出 ---------- */
fs.mkdirSync(ARCHIVE, { recursive: true });

const latest = issues[issues.length - 1];
fs.writeFileSync(path.join(ROOT, 'index.html'), renderDeckPage(latest));
fs.writeFileSync(path.join(ROOT, 'styles.html'), renderStylesPage(latest));

for (const issue of issues) {
  fs.writeFileSync(path.join(ARCHIVE, `${issue.date}.html`), renderIssue(issue, issues, 'archive'));
}
fs.writeFileSync(path.join(ARCHIVE, 'index.html'), renderArchiveIndex(issues));

const deck = computeDeck(latest.date, state);
console.log(`已生成：index.html（学习卡组 ${deck.length} 张：复习 ${deck.filter(c => c.kind === 'review').length} + 新词 ${deck.filter(c => c.kind === 'new').length}）`);
console.log(`styles.html（2 款风格预览） · archive/（${issues.length} 期 + 合集页） · 累计词汇 ${history.total} 个`);
