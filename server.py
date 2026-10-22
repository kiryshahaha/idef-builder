"""
IDEF Builder - Local HTTP Server with Auto-Launch
Runs on localhost and opens the default browser
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    
    # Try preferred port, or increment if busy
    port = PORT
    httpd = None
    for p in range(PORT, PORT + 20):
        try:
            httpd = socketserver.TCPServer(("", p), Handler)
            port = p
            break
        except OSError:
            continue

    if not httpd:
        print("ERROR: Could not bind to any port.")
        sys.exit(1)

    url = f"http://localhost:{port}/index.html"
    print("=" * 60)
    print(f"  IDEF Builder (ГОСТ Р 50.1.028-2001) запущен!")
    print(f"  Адрес: {url}")
    print("  Для остановки нажмите Ctrl + C в этом окне.")
    print("=" * 60)

    webbrowser.open(url)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен.")
        httpd.server_close()

if __name__ == "__main__":
    run()
