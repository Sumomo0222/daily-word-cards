# 每日英语单词卡 · Daily Word Cards

每天上午 **08:27**（北京时间，Asia/Shanghai）由 ZCode 定时任务自动生成新一期，每期 5 个
生活 / 职场常用词，难度四六级 → 雅思 6–7。首页为**滑动卡片学习模式**，按艾宾浩斯遗忘曲线调度复习。

- **学习模式（最新一期 + 到期复习）**：http://127.0.0.1:8384/
- **风格预览**：http://127.0.0.1:8384/styles.html
- **往期归档（按日期浏览）**：http://127.0.0.1:8384/archive/index.html
- **手机访问**：手机连同一 Wi-Fi，打开 `http://<本机IP>:8384/`（本机 IP 用 `ipconfig getifaddr en0` 查询）
- **自动更新**：ZCode 定时任务「每天上午8点27分更新每日英语单词卡」（cron `27 8 * * *`，主机时区 Asia/Shanghai）

## 界面风格

2 款主题：**奶油纸感**（默认，暖米色）与**薄荷清爽**（冷绿）。学习页/归档页右上角 🎨 切换，
选择存在浏览器 localStorage，每日更新后依然生效；`styles.html` 可并排对比。
改/换主题：编辑 `build.js` 里的 `THEMES` 数组与 `THEME_BLOCKS`。

## 加练（再来一组）

当日卡组滑完后，完成面板出现「🔁 再来一组 · 加练 5 词」按钮：从历史已学词中抽取 5 个
（未掌握的优先、按薄弱程度排序；已掌握的也会回流加练），一轮接一轮直到词池用完。
加练的滑动照常通过 `/api/review` 计入艾宾浩斯进度（已记住 → 按间隔顺延；明天再记 → 明天重现）。

## 使用方式（滑动卡片）

- **左滑**（或绿色按钮）＝ 已经记住 → 按 **1 · 2 · 4 · 7 · 15 · 30 天**间隔（艾宾浩斯）安排下次复习，
  六轮记住后毕业不再出现。
- **右滑**（或琥珀按钮）＝ 明天继续提醒 → 明天重新出现，直到记住为止。
- **点击卡片翻面**：正面是单词+音标+发音按钮，背面是释义、搭配、例句（附来源）和记忆提示。
- **发音播放**：卡片上有 🔊 英音 / 🔊 美音按钮，音源三级回退：剑桥词典真人录音 → 有道语音接口 → 浏览器内置 TTS（en-GB/en-US），离线时也能发音。
- 打卡记录保存在本机服务（`/api/review` 接口 → `data/review-state.json`），同一路径多设备打开即可共享进度。
- 每天 08:27 构建时自动把到期复习词排进当日卡组（复习在前、新词在后）。

## 目录

```
daily-word-cards/
├── build.js                # 零依赖构建脚本：data/*.json + review-state -> index.html + archive/
├── server.py               # 本地服务（8384）：静态页面 + /api/review 打卡接口
├── data/
│   ├── SCHEMA.md           # 数据格式、选词规则、例句诚信与复习调度铁律（自动运行必须先读）
│   ├── word-history.json   # 已推送词汇总账（去重依据）
│   ├── review-state.json   # 用户滑动打卡状态（server.py 维护，勿手改）
│   └── YYYY-MM-DD.json     # 每日数据（一天一份）
├── archive/                # 历史各期 + 合集页（build.js 自动生成，勿手改）
└── index.html              # 最新一期 · 学习卡组（build.js 自动生成，勿手改）
```

## 手动操作

```bash
# 手动重新生成（改了数据或样式后）
node /Users/livial/ZCodeProject/daily-word-cards/build.js

# 启动服务（必须用 server.py，不能用 python3 -m http.server，否则打卡接口缺失）
nohup python3 /Users/livial/ZCodeProject/daily-word-cards/server.py >/tmp/word-cards-server.log 2>&1 &

# 查看复习状态
curl http://127.0.0.1:8384/api/state
```

改版式/配色/交互：编辑 `build.js` 里的 `CSS` 常量、`renderDeckPage` 与模板函数，然后重新构建。

## 例句诚信规则（摘要，详见 data/SCHEMA.md）

- 词典例句必须摘自本次真实访问过的词条页面，附来源名称与链接；绝不编造 URL。
- 自编的贴近生活/工作场景的例句一律标注「场景例句」，不挂任何词典来源。
