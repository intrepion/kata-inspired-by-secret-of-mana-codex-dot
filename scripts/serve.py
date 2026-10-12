#!/usr/bin/env python3
"""Start a session-only detached production preview, with no autostart settings."""
from pathlib import Path
import shutil
import socket
import subprocess
import time

root = Path(__file__).resolve().parent.parent
node = shutil.which('node')
if not node:
    raise SystemExit('Node.js 20.19+ or 22.12+ is required. Enable Node in your shell first.')
if not (root / 'dist' / 'index.html').exists():
    raise SystemExit('Run npm run build first.')
with socket.socket() as probe:
    if probe.connect_ex(('127.0.0.1', 5213)) == 0:
        raise SystemExit('Port 5213 already has a listener. Stop only this game’s recorded process before restarting.')
log_path = Path('/tmp/wildheart-preview.log')
with log_path.open('ab') as log:
    process = subprocess.Popen(
        [node, str(root / 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', '5213', '--strictPort'],
        cwd=root, stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True,
    )
time.sleep(0.7)
if process.poll() is not None:
    raise SystemExit(f'Preview failed to start. See {log_path}.')
(root / '.preview.pid').write_text(str(process.pid))
print(f'Lanterns of the Wildheart: http://127.0.0.1:5213/ (PID {process.pid}; log {log_path})')
