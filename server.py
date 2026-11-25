#!/usr/bin/env python3
"""每日英语单词卡 · 静态服务 + 复习打卡 API

- 静态文件服务（本目录），监听 8384 端口
- POST /api/review  {"word": "...", "action": "known"|"again", "issueDate": "..."}
    known = 左滑「已记住」：进入艾宾浩斯下一阶段，间隔 1/2/4/7/15/30 天
    again = 右滑「明天再记」：重置进度，明天（+1 天）复习
- GET  /api/state   返回当前复习状态
- 状态持久化到 data/review-state.json，每天 08:27 的构建脚本据此把到期词排进卡组

启动：nohup python3 /Users/livial/ZCodeProject/daily-word-cards/server.py >/tmp/word-cards-server.log 2>&1 &
"""
import json
import os
import threading
from datetime import datetime, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
STATE_PATH = os.path.join(ROOT, "data", "review-state.json")
INTERVALS = [1, 2, 4, 7, 15, 30]  # 艾宾浩斯复习间隔（天）
PORT = 8384
LOCK = threading.Lock()


def today_str():
    return datetime.now().strftime("%Y-%m-%d")


def load_state():
    if os.path.exists(STATE_PATH):
        try:
            with open(STATE_PATH, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"updatedAt": "", "words": {}}


def save_state(state):
    state["updatedAt"] = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")
    tmp = STATE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    os.replace(tmp, STATE_PATH)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):  # 安静一些，避免日志膨胀
        pass

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/state":
            with LOCK:
                state = load_state()
            return self._json(200, state)
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/review":
            return self._json(404, {"ok": False, "error": "not found"})
        try:
            length = int(self.headers.get("Content-Length") or 0)
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            word = str(payload.get("word", "")).strip()
            action = payload.get("action")
            if not word or action not in ("known", "again"):
                return self._json(400, {"ok": False, "error": "word/action invalid"})
        except Exception:
            return self._json(400, {"ok": False, "error": "bad request"})

        now = datetime.now()
        d = now.strftime("%Y-%m-%d")
        with LOCK:
            state = load_state()
            entry = state["words"].get(word) or {
                "issueDate": payload.get("issueDate") or d,
                "stage": 0,
                "graduated": False,
                "reviews": 0,
                "againCount": 0,
            }
            entry["reviews"] = int(entry.get("reviews", 0)) + 1
            entry["lastAction"] = action
            entry["lastDate"] = d
            if action == "known":
                entry["stage"] = int(entry.get("stage", 0)) + 1
                if entry["stage"] - 1 >= len(INTERVALS):
                    # 六轮「记住」全部完成 → 已掌握
                    entry["graduated"] = True
                    entry["due"] = None
                else:
                    entry["graduated"] = False
                    entry["due"] = (now + timedelta(days=INTERVALS[entry["stage"] - 1])).strftime("%Y-%m-%d")
            else:  # again：明天再记，进度重置
                entry["stage"] = 0
                entry["graduated"] = False
                entry["againCount"] = int(entry.get("againCount", 0)) + 1
                entry["due"] = (now + timedelta(days=1)).strftime("%Y-%m-%d")
            state["words"][word] = entry
            save_state(state)
        return self._json(200, {"ok": True, "word": word, "stage": entry["stage"],
                                "due": entry["due"], "graduated": entry["graduated"]})


if __name__ == "__main__":
    server = ThreadingHTTPServer(("", PORT), Handler)
    print(f"daily-word-cards server on :{PORT} (static + /api/review)")
    server.serve_forever()
