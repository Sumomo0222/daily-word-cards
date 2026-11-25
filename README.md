# 每日英语单词卡 · Daily Words

适配手机的英语单词学习页：每天 5 个精选单词（生活 + 职场，四六级 ~ 雅思 6-7 难度），左右滑动卡片、英美真人发音、艾宾浩斯间隔复习，进度自动保存在本机。

**线上地址**：<https://sumomo0222.github.io/daily-word-cards/>

## 文件结构

```
index.html          页面骨架（含使用说明、首滑引导抽屉）
css/style.css       两套配色主题（纸间 paper / 夜航 night）
js/words.js         词库：BANK_META.start + WORD_BANK.days["YYYY-MM-DD"] = 5 词
js/pool.js          候选词池 WORD_POOL（每日定时任务从这里取词）
js/app.js           滑动手势、批次解锁、复习调度、发音、进度存储
scripts/validate.js 词库校验（结构 / 例句 / 来源标注 / 重复词）
scripts/deploy.sh   校验 → 提交 → 推送 → 验证线上（定时任务调用）
scripts/fetch-cited.js / apply-cited.js / cited.json
                    引用例句工具：从 Free Dictionary API（数据源 Wiktionary）
                    抓取词典例句，人工审核翻译后合并进词库（新词可复用此流程）
```

## 核心规则

- **解锁**：批次按日期 `YYYY-MM-DD` 命名，北京时间 08:27 起可用（`js/app.js` 中 `batchAvailable`，首日 `BANK_META.start` 直接可用）。页面纯静态，无需后端。
- **滑动**：左滑 = 已记住（按 1 → 2 → 4 → 7 → 15 → 30 天间隔逐轮复习，六轮全部通过后归入「已掌握」）；右滑 = 明天再练（明天重现，记忆等级回退一级）。
- **队列**：到期复习词优先（单轮最多 12 个），其后是「最早一个未学完且已解锁」批次里的剩余新词；中途退出页面，下次打开只补未学过的词，不重复出卡。
- **进度**：localStorage（键 `dwc_v1`），仅保存在本机浏览器；「使用说明」里可导出 / 导入备份、清空进度。

## 例句与来源

例句逐条标注、分两类：

- `自编例句`：结合生活与职场场景编写；
- `引用例句 · Wiktionary`：引自 Wiktionary 词典例句（经 Free Dictionary API 收录），附中文翻译。

新增词时可复用 `scripts/fetch-cited.js` 抓取候选引用例句，人工筛选翻译后写入 `scripts/cited.json`，再运行 `node scripts/apply-cited.js` 合并。

## 每日更新（定时任务）

由本机 ZCode 定时自动化任务执行（每天本地时间 08:27；本机时区为 Asia/Shanghai，即北京时间）：

1. 计算今天的北京日期，检查 `js/words.js` 是否已有当日批次（已预写至 2026-12-01）；
2. 若缺失（含补齐最多 3 天的缺口），从 `js/pool.js` 依序取 5 个未用过的词，编写完整词条后追加到 `days`；
3. 运行 `sh scripts/deploy.sh "feat: 新增 YYYY-MM-DD 批次"`：自动校验、提交、推送并验证线上生效；
4. 词池（132 词）耗尽后：任务自行按相同标准编写新词（不得与词库重复），或如实报告失败。

**运行条件**：任务触发时这台 Mac 需开机且 ZCode 正在运行、网络可用、GitHub 推送凭据有效。错过的时点不会自动补触发，但下一次成功运行会补齐缺失日期的批次。

## 手动更新 / 本地预览

```bash
# 本地预览（需 HTTP 服务，直接双击 file:// 无法加载词库）
python3 -m http.server 8137   # 打开 http://127.0.0.1:8137/

# 手动加词后部署
node scripts/validate.js && sh scripts/deploy.sh "feat: 新增批次"
```

首次部署（v2，2026-11-25）：仓库中原 v1 单文件构建（build.js / data / archive 等）已合并保留在 git 历史中并从主干移除。
