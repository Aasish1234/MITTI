import http.server
import socketserver
import webbrowser
import threading
import os
import time
import json
import urllib.request
import urllib.error

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        if self.path == "/api/chat":
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
        else:
            super().do_OPTIONS()

    def do_POST(self):
        if self.path == "/api/chat":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                req_body = json.loads(post_data.decode('utf-8'))
                query = req_body.get('query')
                
                api_key = os.environ.get("GEMINI_API_KEY")
                if not api_key and os.path.exists(".env"):
                    try:
                        with open(".env", "r") as f:
                            for line in f:
                                if line.strip().startswith("GEMINI_API_KEY="):
                                    api_key = line.strip().split("=", 1)[1].strip()
                                    break
                    except Exception:
                        pass
                if not api_key:
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Local server GEMINI_API_KEY not configured"}).encode('utf-8'))
                    return
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                system_instruction = (
                    "You are Mitti, an expert Natural Farming Consultant. "
                    "Answer only questions related to natural farming, organic remedies, companion planting, weather, market rates, and government subsidies (like PKVY, PM-Kisan). "
                    "Strictly refuse to answer off-topic queries (e.g. general knowledge, programming, non-farming topics, recipes of other foods) by saying: "
                    "\"I can only help you with natural farming, organic remedies, companion planting, weather, market rates, and government subsidies. Please ask an agriculture-related question!\"."
                    "Keep your responses concise, action-oriented, and structured. Do not use markdown bold/italic formatting in a way that sounds weird when spoken."
                )
                
                payload = {
                    "contents": [{"parts": [{"text": query}]}],
                    "systemInstruction": {"parts": [{"text": system_instruction}]}
                }
                
                req = urllib.request.Request(
                    url, 
                    data=json.dumps(payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                
                try:
                    with urllib.request.urlopen(req) as response:
                        res_data = json.loads(response.read().decode('utf-8'))
                        if 'candidates' in res_data and len(res_data['candidates']) > 0:
                            reply = res_data['candidates'][0]['content']['parts'][0]['text']
                            self.send_response(200)
                            self.send_header('Content-type', 'application/json')
                            self.send_header('Access-Control-Allow-Origin', '*')
                            self.end_headers()
                            self.wfile.write(json.dumps({"reply": reply}).encode('utf-8'))
                        else:
                            raise Exception("Invalid response structure")
                except urllib.error.HTTPError as e:
                    self.send_response(e.code)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Gemini API error: {e.read().decode('utf-8')}"}).encode('utf-8'))
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Bad request: {str(e)}"}).encode('utf-8'))
        else:
            super().do_POST()

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n🚀 MITTI Local Server started at: http://localhost:{PORT}")
        print("📁 Serving files from:", DIRECTORY)
        httpd.serve_forever()

if __name__ == "__main__":
    print("⏳ Starting local development server...")
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(0.5)
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
