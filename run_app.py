import http.server
import socketserver
import webbrowser
import threading
import os
import time

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    # Allow port reuse to avoid 'Address already in use' errors
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n🚀 MITTI Local Server started at: http://localhost:{PORT}")
        print("📁 Serving files from:", DIRECTORY)
        httpd.serve_forever()

if __name__ == "__main__":
    print("⏳ Starting local development server...")
    
    # Start server in a background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Give the server a moment to bind to the port
    time.sleep(0.5)
    
    # Open browser automatically
    webbrowser.open(f"http://localhost:{PORT}/index.html")
    
    print("\n--------------------------------------------------")
    print("👉 If the browser does not open automatically, visit:")
    print(f"   http://localhost:{PORT}/index.html")
    print("--------------------------------------------------")
    print("🛑 Press Ctrl+C to terminate the server.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🔌 Shutting down server. Goodbye!")
