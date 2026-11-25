/* 将 scripts/cited.json 的词典引用例句合并进 words.js：
 * - 有引用例句的词条变为「2 条自编 + 1 条引用（第 3 条）」
 * - 重新序列化 words.js，保持原有排版格式
 * 用法：node scripts/apply-cited.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'words.js'), 'utf8'), sandbox);
const { BANK_META, WORD_BANK } = sandbox.window;
const cited = JSON.parse(fs.readFileSync(path.join(__dirname, 'cited.json'), 'utf8'));

let merged = 0;
for (const [word, c] of Object.entries(cited)) {
  let hit = null;
  for (const d of Object.values(WORD_BANK.days)) {
    const e = d.find((x) => x.w === word);
    if (e) { hit = e; break; }
  }
  if (!hit) { console.error('未找到词条:', word); continue; }
  const item = { en: c.en, zh: c.zh, src: '引用例句 · Wiktionary' };
  if (hit.ex.length >= 3) hit.ex = [hit.ex[0], hit.ex[1], item];
  else hit.ex.push(item);
  merged++;
}

const q = (s) => JSON.stringify(String(s));
function serialize() {
  const L = [];
  L.push(`/* 每日英语单词卡 · 词库`);
  L.push(` * 每天 5 词；每天北京时间 08:27 解锁当日批次（首日 start 直接可用）。`);
  L.push(` * 例句逐条标注来源：src「自编例句」为结合生活/职场场景自编；`);
  L.push(` * src「引用例句 · Wiktionary」引自 Wiktionary 词典例句（经 Free Dictionary API 收录）。`);
  L.push(` * 之后的批次由定时任务追加到 days 对象中（见 js/pool.js 候选池）。`);
  L.push(` */`);
  L.push(`window.BANK_META = ${JSON.stringify(BANK_META)};`);
  L.push(``);
  L.push(`window.WORD_BANK = {`);
  L.push(`  days: {`);
  const dates = Object.keys(WORD_BANK.days).sort();
  dates.forEach((d, di) => {
    L.push(`    ${q(d)}: [`);
    WORD_BANK.days[d].forEach((e, ei) => {
      L.push(`      {`);
      L.push(`        w: ${q(e.w)}, pos: ${q(e.pos)},`);
      L.push(`        uk: ${q(e.uk)}, us: ${q(e.us)},`);
      L.push(`        en: ${q(e.en)},`);
      L.push(`        zh: ${q(e.zh)},`);
      L.push(`        ex: [`);
      e.ex.forEach((x, xi) => {
        L.push(`          { en: ${q(x.en)}, zh: ${q(x.zh)}, src: ${q(x.src)} }${xi < e.ex.length - 1 ? ',' : ''}`);
      });
      L.push(`        ],`);
      L.push(`        tip: ${q(e.tip)}`);
      L.push(`      }${ei < WORD_BANK.days[d].length - 1 ? ',' : ''}`);
    });
    L.push(`    ]${di < dates.length - 1 ? ',' : ''}`);
    if (di < dates.length - 1) L.push('');
  });
  L.push(`  }`);
  L.push(`};`);
  return L.join('\n') + '\n';
}
fs.writeFileSync(path.join(ROOT, 'js', 'words.js'), serialize());
console.log(`已合并 ${merged} 条引用例句 → js/words.js`);
