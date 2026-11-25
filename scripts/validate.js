/* 词库与候选池校验：结构、例句、来源标注、重复词、批次完整性
 * 用法：node scripts/validate.js   （校验失败时以非零码退出）
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['js/words.js', 'js/pool.js']) {
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    console.error(`✘ ${f} 语法错误: ${e.message}`);
    process.exit(1);
  }
}
const { BANK_META, WORD_BANK, WORD_POOL } = sandbox.window;
const errors = [];
const warns = [];

if (!BANK_META || !/^\d{4}-\d{2}-\d{2}$/.test(BANK_META.start || '')) errors.push('BANK_META.start 缺失或格式错误');
const dates = Object.keys((WORD_BANK || {}).days || {}).sort();
if (!dates.length) errors.push('WORD_BANK.days 为空');

const seen = new Map();
for (const d of dates) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) errors.push(`批次键不是日期: ${d}`);
  const list = WORD_BANK.days[d];
  if (!Array.isArray(list) || list.length === 0) { errors.push(`批次 ${d} 为空`); continue; }
  if (list.length !== 5) warns.push(`批次 ${d} 有 ${list.length} 个词（惯例为 5）`);
  for (const e of list) {
    for (const k of ['w', 'pos', 'uk', 'us', 'en', 'zh', 'tip']) {
      if (!e[k] || !String(e[k]).trim()) errors.push(`批次 ${d} 的 ${e.w || '?'} 缺少字段 ${k}`);
    }
    if (!Array.isArray(e.ex) || e.ex.length < 2 || e.ex.length > 3) {
      errors.push(`批次 ${d} 的 ${e.w} 例句数量为 ${Array.isArray(e.ex) ? e.ex.length : 'N/A'}（应为 2–3 条）`);
    } else {
      for (const x of e.ex) {
        if (!x.en || !x.zh || !x.src) errors.push(`批次 ${d} 的 ${e.w} 有例句缺少 en/zh/src`);
        else if (!/自编|引用/.test(x.src)) errors.push(`批次 ${d} 的 ${e.w} 例句来源未标注「自编/引用」: ${x.src}`);
      }
    }
    if (seen.has(e.w)) errors.push(`单词重复: ${e.w}（${seen.get(e.w)} 与 ${d}）`);
    seen.set(e.w, d);
  }
}
const poolWords = (WORD_POOL || []).map((p) => p[0]);
const clash = poolWords.filter((w) => seen.has(w));
if (clash.length) errors.push(`候选池与词库重复: ${clash.join(', ')}`);
if (!poolWords.length) warns.push('候选池 WORD_POOL 为空（每日新增将无词可取）');

console.log(`词库：${dates.length} 个批次 / ${seen.size} 词；候选池：${poolWords.length} 词；最新批次：${dates[dates.length - 1]}`);
for (const w of warns) console.log('⚠ ' + w);
if (errors.length) {
  for (const e of errors) console.error('✘ ' + e);
  process.exit(1);
}
console.log('✓ 校验通过');
