#!/usr/bin/env python3
"""Take the 4 screenshots for Leonida Press r5.

Reads shots.json, serves app/ with `node serve.ts`, and screenshots each
shot with headless Chromium. Each shot is then resized with PIL to fit the
make.fun gate (long side <= 1280, short side >= 480, <= 256 KiB) and saved
as a quality-85 JPEG. Also dumps the DOM to check the page reported
'shot-ready' and that no window error was captured.
"""
import json, os, subprocess, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHOTS = json.loads((ROOT / "shots.json").read_text())
CHROME = os.environ.get(
    "CHROME_BIN",
    os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell"))
PORT = 8123

def wait_up(url, timeout=20):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            urllib.request.urlopen(url, timeout=2)
            return True
        except Exception:
            time.sleep(0.3)
    return False

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=120)

def main():
    server = subprocess.Popen(
        ["node", "serve.ts", "--port", str(PORT)],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        if not wait_up(f"http://127.0.0.1:{PORT}/"):
            print("server did not come up"); return 1
        outdir = ROOT / "screenshots"
        outdir.mkdir(exist_ok=True)
        from PIL import Image
        for shot in SHOTS:
            url = f"http://127.0.0.1:{PORT}/{shot['query']}"
            tmp = f"/tmp/r5-shot-{shot['name']}.png"
            r = run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
                     "--hide-scrollbars", f"--window-size={shot['w']},{shot['h']}",
                     "--virtual-time-budget=8000", f"--screenshot={tmp}", url])
            if r.returncode != 0 or not os.path.exists(tmp):
                print(f"{shot['name']}: CHROME FAILED\n{r.stderr[-2000:]}")
                return 1
            # DOM check: shot-ready title + no captured window errors
            dom = run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
                       "--virtual-time-budget=8000", "--dump-dom", url])
            if "shot-ready" not in dom.stdout:
                print(f"{shot['name']}: WARNING shot-ready not seen in DOM dump")
            if "ERROR:" in dom.stdout:
                print(f"{shot['name']}: WINDOW ERROR in page:\n{dom.stdout[dom.stdout.find('ERROR:'):][:500]}")
                return 1
            if "CONSOLE" in (r.stderr or ""):
                print(f"{shot['name']}: console output: {r.stderr[-1000:]}")
            img = Image.open(tmp).convert("RGB")
            w, h = img.size
            scale = min(1.0, 1280 / max(w, h))
            if scale < 1.0:
                img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
            dest = outdir / shot["name"]
            img.save(dest, "JPEG", quality=85)
            size = dest.stat().st_size
            print(f"{shot['name']}: {img.size[0]}x{img.size[1]} {size} bytes")
            if size > 262144:
                print(f"{shot['name']}: OVER 256 KiB!"); return 1
            if min(img.size) < 480:
                print(f"{shot['name']}: short side < 480!"); return 1
        print("all shots ok")
        return 0
    finally:
        server.terminate()

if __name__ == "__main__":
    sys.exit(main())
