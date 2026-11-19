#!/usr/bin/env python3
"""Take the 4 Leonida Press screenshots with headless Chromium, save as JPEG <=256 KiB."""
import json, subprocess, sys, os
from PIL import Image

REPO = "/home/hatch/workspace/makefun/gta6-cover-art-01-r4"
CHROME = os.path.expanduser("~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome")
BASE = "http://localhost:8901/index.html"

with open(os.path.join(REPO, "shots.json")) as f:
    shots = json.load(f)

os.makedirs(os.path.join(REPO, "screenshots"), exist_ok=True)

for shot in shots:
    url = BASE + shot["query"]
    tmp = f"/tmp/{shot['name']}.png"
    cmd = [CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
           "--enable-logging=stderr", "--v=0",
           "--virtual-time-budget=9000",
           f"--window-size={shot['w']},{shot['h']}",
           f"--screenshot={tmp}", url]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    console = [l for l in (r.stderr or "").splitlines() if "CONSOLE" in l or "Uncaught" in l]
    if console:
        print(f"!! {shot['name']} console:", *console[:5], sep="\n  ")
    im = Image.open(tmp).convert("RGB")
    out = os.path.join(REPO, "screenshots", shot["name"])
    q = 88
    while True:
        im.save(out, "JPEG", quality=q, optimize=True)
        if os.path.getsize(out) <= 256 * 1024 or q <= 40:
            break
        q -= 8
    print(f"{shot['name']}: {im.size} q={q} {os.path.getsize(out)} bytes")
print("done")
