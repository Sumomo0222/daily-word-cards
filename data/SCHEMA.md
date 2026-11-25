# 每日英语单词卡 · 数据格式与选词铁律（自动运行必须先读）

每天上午 08:27（Asia/Shanghai）由 ZCode 定时任务生成一期。**生成新一期之前，必须先读完本文档。**

## 目录

```
daily-word-cards/
├── build.js                # 零依赖构建脚本：data/*.json + review-state -> index.html + archive/
├── server.py               # 本地服务（8384 端口）：静态页面 + /api/review 打卡接口
├── data/
│   ├── SCHEMA.md           # 本文件
│   ├── word-history.json   # 已推送词汇总账（选词去重的唯一依据，每期必须追加）
│   ├── review-state.json   # 用户滑动打卡状态（server.py 维护，构建时读取做复习调度；勿手改）
│   └── YYYY-MM-DD.json     # 每日数据（一天一份，日期即文件名）
├── archive/                # 历史各期 + 合集页（build.js 自动生成，勿手改）
└── index.html              # 最新一期（build.js 自动生成，勿手改）
```

## 选词铁律

1. **每天 5 个新词**。选词前先读 `word-history.json`，候选词（含其常见变形如名词/动词/形容词形式）一律不得与历史重复。
2. **难度区间**：大学英语四六级 → 雅思 6–7 分。太基础（如 apple、meeting）不选；太生僻（如 quixotic）不选。
3. **题材配比**：优先生活场景与职场沟通常用词，每期尽量生活、职场各占一半；一天内 5 个词尽量围绕一个宽松主题，便于联想记忆。
4. **词汇信息**：音标（注明英/美）、词性、中文释义、英文释义。英文释义取自权威词典原文，不得改写杜撰。

## 例句与来源铁律（诚信第一）

- **权威例句**：必须来自真实词典页面（如 Cambridge Dictionary、Merriam-Webster、Oxford Learner's Dictionary）。
  生成时用网页抓取工具访问该词条页面摘取原句，来源 `url` 必须是本次真实访问过的页面地址，
  **绝不凭记忆编造 URL、绝不假装某句是词典原句**。抓不到权威例句时，宁可用场景例句补足。
- **场景例句**：自行编写、贴近真实生活/工作场景的句子，`type` 必须为 `"scenario"`，
  `name` 写「场景例句 · <场景>」，**不得标注任何词典来源**。
- 权威例句的中文翻译由我们翻译，翻译不标注来源（来源仅针对英文原句）。
- 每词 2–3 条例句：至少 1 条权威 + 1–2 条场景。

## 每日数据格式（YYYY-MM-DD.json）

```jsonc
{
  "date": "YYYY-MM-DD",
  "issue": 3,                          // 上一期期号 +1
  "generatedAt": "YYYY-MM-DD HH:MM (+08:00)",
  "theme": "本期主题（一句话）",
  "words": [
    {
      "word": "word",
      "phonetic": "UK /.../ · US /.../",
      "pos": "v. 及物动词 / n. ...",
      "level": "CET-6 · IELTS 6.5（可附剑桥等级标注）",
      "defs": { "en": "词典英文释义原文", "zh": "中文释义" },
      "collocations": "常用搭配 2-3 个",
      "audio": {
        "uk": "https://dictionary.cambridge.org/media/english/uk_pron/....mp3",
        "us": "https://dictionary.cambridge.org/media/english/us_pron/....mp3"
      },
      "examples": [
        {
          "en": "英文例句原句",
          "zh": "中文翻译",
          "source": {
            "type": "authoritative",   // authoritative=词典原句 | scenario=场景例句
            "name": "Cambridge Dictionary",
            "url": "https://..."       // scenario 类型无 url 字段
          }
        }
      ],
      "tip": "记忆提示：词根拆解 / 谐音联想 / 场景画面，一到两句，具体可操作"
    }
  ]
}
```

## 复习调度（艾宾浩斯遗忘曲线）

首页 `index.html` 是滑动卡片学习页，用户交互与调度规则：

- **左滑 / 「✓ 已记住」按钮**：该词进入艾宾浩斯下一阶段，按间隔 **1 → 2 → 4 → 7 → 15 → 30 天**
  安排下次复习；六轮「记住」全部完成后标记已掌握（graduated），不再出现。
- **右滑 / 「↻ 明天再记」按钮**：进度重置，明天（+1 天）重新出现，直到记住为止。
- 打卡通过 `POST /api/review {"word":..., "action":"known"|"again"}` 写入 `data/review-state.json`。
- **构建时** build.js 读取 `review-state.json` 组装卡组：到期复习词（due ≤ 当日）在前，
  标注「复习 · 第 n 轮」；从未打卡的往期词按「漏学补复习」兜底排入；当日新词在后。
- 每期数据只写新词，复习安排完全由构建脚本从打卡状态推导，**不要在每日 JSON 里手写复习词**。

## 发音音频（audio 字段）

- 卡片正面/背面有 🔊 英音、美音按钮，播放优先级：**剑桥真人录音 → 有道语音接口 → 浏览器内置 TTS**，
  前端自动逐级回退。
- 生成时抓取剑桥词条页面，用正则从 HTML 中提取真人发音 mp3 相对路径
  （形如 `/media/english/uk_pron/....mp3` 与 `/media/english/us_pron/....mp3`），
  补全为 `https://dictionary.cambridge.org` 开头的完整地址写入 `audio.uk` / `audio.us`。
- 提取不到（小众词无录音）就**省略 audio 字段**，播放端自动走有道/内置 TTS；
  **绝不编造音频 URL**，也不要用例句页之外来源的地址。

`review-state.json` 单词条目结构（server.py 维护）：

```jsonc
{
  "words": {
    "negotiate": {
      "issueDate": "YYYY-MM-DD",   // 所属期
      "stage": 2,                  // 已连续「记住」次数（0=尚未记住过）
      "due": "YYYY-MM-DD",         // 下次复习日期；graduated 后为 null
      "graduated": false,
      "reviews": 3,                // 累计滑动次数
      "againCount": 1,             // 「明天再记」次数
      "lastAction": "known",       // 最近一次动作
      "lastDate": "YYYY-MM-DD"
    }
  }
}
```

## 生成流程（定时任务执行）

1. 读本文件 + `word-history.json`，确定 5 个不重复的新词。
2. 用网页抓取工具逐词访问词典页面，摘取真实释义、音标与例句。
3. 写 `data/YYYY-MM-DD.json`（当日日期），更新 `word-history.json`（追加 5 条，更新 total 与 updatedAt）。
4. 运行 `node /Users/livial/ZCodeProject/daily-word-cards/build.js`（自动生成 index.html 与 archive/，
   并按打卡状态把到期复习词排进卡组）。
5. 确认本地服务在 8384 端口可访问；若 `curl -sf http://127.0.0.1:8384/` 失败，重启：
   `nohup python3 /Users/livial/ZCodeProject/daily-word-cards/server.py >/tmp/word-cards-server.log 2>&1 &`
   **必须用 server.py**（静态页面 + 打卡接口一体）；用 `python3 -m http.server` 会导致用户滑动打卡失败。
6. 简短汇报：日期、期号、5 个新词、今日卡组中的复习词数量、页面地址 http://127.0.0.1:8384/ 。

## 手动操作

```bash
node /Users/livial/ZCodeProject/daily-word-cards/build.js    # 手动重新生成
nohup python3 /Users/livial/ZCodeProject/daily-word-cards/server.py >/tmp/word-cards-server.log 2>&1 &  # 启动服务
curl http://127.0.0.1:8384/api/state                          # 查看当前复习状态
```
