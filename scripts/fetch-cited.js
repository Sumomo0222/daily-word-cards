/* 抓取 dictionaryapi.dev（数据源 Wiktionary）的词典例句，供人工审核翻译后合并进词库。
 * 用法：node scripts/fetch-cited.js  → 输出 cited-candidates.json
 */
const fs = require('fs');
const path = require('path');

function loadBank() {
  const sandbox = { window: {} };
  require('vm').createContext(sandbox);
  for (const f of ['words.js', 'pool.js']) {
    const code = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
    require('vm').runInContext(code, sandbox);
  }
  return sandbox.window;
}

(async () => {
  const { WORD_BANK } = loadBank();
  const words = [...new Set(Object.values(WORD_BANK.days).flat().map((e) => e.w))];
  const out = {};
  for (const w of words) {
    try {
      const r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w));
      if (r.ok) {
        const j = await r.json();
        const exs = [];
        for (const m of j[0]?.meanings || [])
          for (const d of m.definitions || [])
            if (d.example && d.example.trim().length >= 12 && d.example.trim().length <= 220)
              exs.push({ pos: m.partOfSpeech, en: d.example.trim() });
        out[w] = exs.slice(0, 3);
      } else out[w] = [];
    } catch (e) { out[w] = []; console.error(w, e.message); }
    await new Promise((res) => setTimeout(res, 350));
  }
  fs.writeFileSync(path.join(__dirname, '..', 'cited-candidates.json'), JSON.stringify(out, null, 2));
  const have = Object.entries(out).filter(([, v]) => v.length).length;
  console.log(`共 ${words.length} 词，其中 ${have} 词有可用词典例句 → cited-candidates.json`);
})();
