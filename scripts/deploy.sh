#!/bin/sh
# 每日更新部署脚本：词库校验 → git 提交 → 推送 GitHub Pages → 验证线上
# 用法：sh scripts/deploy.sh ["提交说明"]
set -e
cd "$(dirname "$0")/.."
MSG="${1:-chore: 每日词库更新}"

node scripts/validate.js

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "✘ 不在 git 仓库中，无法部署"; exit 1
fi
git add -A
if git diff --cached --quiet; then
  echo "无变更，跳过提交与推送"; exit 0
fi
git commit -m "$MSG"

NEWEST=$(node -e "
const fs=require('fs'),vm=require('vm'),path=require('path');
const sb={window:{}};vm.createContext(sb);
vm.runInContext(fs.readFileSync('js/words.js','utf8'),sb);
console.log(Object.keys(sb.window.WORD_BANK.days).sort().pop());
")

# 推送：优先 gh CLI 登录态；否则用钥匙串中的 github.com 凭据（git askpass）
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  git push origin main
else
  ASKPASS="$(mktemp)"
  cat > "$ASKPASS" <<'EOF'
#!/bin/sh
case "$1" in
  Username*) echo "Sumomo0222" ;;
  *) exec security find-internet-password -s github.com -w ;;
esac
EOF
  chmod +x "$ASKPASS"
  GIT_ASKPASS="$ASKPASS" GIT_TERMINAL_PROMPT=0 git push origin main
  rm -f "$ASKPASS"
fi

echo "已推送，等待 GitHub Pages 构建…"
sleep 50
i=0
while [ "$i" -lt 5 ]; do
  if curl -fsS -m 20 "https://sumomo0222.github.io/daily-word-cards/js/words.js?v=$(date +%s)" | grep -q "\"$NEWEST\""; then
    echo "✓ 线上已包含最新批次 $NEWEST：https://sumomo0222.github.io/daily-word-cards/"
    exit 0
  fi
  i=$((i + 1)); sleep 20
done
echo "✘ 推送完成，但 2 分钟内未在线上验证到批次 $NEWEST（Pages 构建可能仍在进行，可稍后手动检查）"
exit 1
