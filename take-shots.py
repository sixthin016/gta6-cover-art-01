#!/usr/bin/env python3
"""Takes the Neon Coast screenshots from shots.json via headless Chromium."""
import json
import os
import subprocess
import sys
import time

ROOT = os.path.expanduser("~/workspace/makefun/gta6-cover-art-01-r7")
VENV_PY = os.path.expanduser("~/workspace/airdrop-agent/.venv/bin/python")

SHOTS = json.load(open(os.path.join(ROOT, "shots.json")))

def main():
    server = subprocess.Popen(
        ["node", "serve.ts", "--port", "8080"],
        cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )
    time.sleep(1.5)
    code = 0
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--no-sandbox", "--force-device-scale-factor=1"])
            for shot in SHOTS:
                page = browser.new_page(viewport={"width": shot["w"], "height": shot["h"]})
                page.on("console", lambda m: print("console:", m.type, m.text[:200]))
                page.on("pageerror", lambda e: print("pageerror:", str(e)[:300]))
                page.goto("http://localhost:8080/" + shot["query"], wait_until="load")
                try:
                    page.wait_for_function("window.__shotReady === true", timeout=30000)
                except Exception as e:
                    print("TIMEOUT waiting for shotReady:", shot["name"], e)
                    code = 1
                out = os.path.join(ROOT, "screenshots", shot["name"])
                page.screenshot(path=out, type="jpeg", quality=82)
                print("saved", out, os.path.getsize(out), "bytes")
                page.close()
            browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except Exception:
            server.kill()
    sys.exit(code)

if __name__ == "__main__":
    main()
