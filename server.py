"""
server.py — Local HTTP Server with PVGIS Proxy and CORS support
"""
import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import sys

PORT = 8080

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/pvgis'):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            lat = params.get('lat', ['12.18'])[0]
            lon = params.get('lon', ['-71.28'])[0]
            pvgis_url = f"https://re.jrc.ec.europa.eu/api/PVcalc?lat={lat}&lon={lon}&peakpower=1&optimalangles=1&loss=0&outputformat=json"
            try:
                req = urllib.request.Request(pvgis_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                with urllib.request.urlopen(req, timeout=12) as response:
                    data = response.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(data)
                    return
            except Exception as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
                return
        super().do_GET()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    with socketserver.TCPServer(("", port), ProxyHandler) as httpd:
        print(f"Serving at http://localhost:{port} with PVGIS proxy enabled")
        httpd.serve_forever()
