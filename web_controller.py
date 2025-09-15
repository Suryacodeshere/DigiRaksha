#!/usr/bin/env python3
"""
Web Controller for DigiRaksha Support Bot
Provides a simple web interface to start/stop the bot services
"""

import os
import subprocess
import sys
import threading
import time
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

# Global variables to track running processes
backend_process = None
frontend_process = None
current_dir = os.path.dirname(os.path.abspath(__file__))

class BotControlHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.serve_html()
        elif self.path == '/status':
            self.check_services_status()
        else:
            self.send_error(404, "File not found")
    
    def do_POST(self):
        if self.path == '/start-services':
            self.start_services()
        elif self.path == '/stop-services':
            self.stop_services()
        else:
            self.send_error(404, "Endpoint not found")
    
    def serve_html(self):
        try:
            html_path = os.path.join(current_dir, 'start_bot_web.html')
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Error serving HTML: {str(e)}")
    
    def start_services(self):
        global backend_process, frontend_process
        
        try:
            # Stop any existing processes first
            self.stop_services_internal()
            
            # Start backend
            backend_path = os.path.join(current_dir, 'backend')
            backend_process = subprocess.Popen([
                sys.executable, 'app.py'
            ], cwd=backend_path, 
               creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0)
            
            # Wait a moment for backend to start
            time.sleep(2)
            
            # Start frontend
            frontend_process = subprocess.Popen([
                'npm', 'run', 'dev'
            ], cwd=current_dir,
               creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"status": "success", "message": "Services started"}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"status": "error", "message": str(e)}
            self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def stop_services_internal(self):
        global backend_process, frontend_process
        
        # Stop backend process
        if backend_process and backend_process.poll() is None:
            try:
                backend_process.terminate()
                backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                backend_process.kill()
            backend_process = None
        
        # Stop frontend process
        if frontend_process and frontend_process.poll() is None:
            try:
                frontend_process.terminate()
                frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                frontend_process.kill()
            frontend_process = None
        
        # Kill any remaining processes on the ports
        if os.name == 'nt':  # Windows
            try:
                # Kill processes on port 5000 (backend)
                subprocess.run(['netstat', '-ano', '|', 'findstr', ':5000'], 
                             shell=True, capture_output=True)
                subprocess.run(['taskkill', '/F', '/IM', 'python.exe'], 
                             shell=True, capture_output=True)
                # Kill processes on port 5174 (frontend)
                subprocess.run(['taskkill', '/F', '/IM', 'node.exe'], 
                             shell=True, capture_output=True)
            except:
                pass
    
    def stop_services(self):
        try:
            self.stop_services_internal()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"status": "success", "message": "Services stopped"}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"status": "error", "message": str(e)}
            self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def check_services_status(self):
        backend_running = False
        frontend_running = False
        
        try:
            # Check backend
            response = requests.get('http://localhost:5000/health', timeout=2)
            backend_running = response.status_code == 200
        except:
            pass
        
        try:
            # Check frontend
            response = requests.get('http://localhost:5174', timeout=2)
            frontend_running = response.status_code == 200
        except:
            pass
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {
            "backend_running": backend_running,
            "frontend_running": frontend_running,
            "both_running": backend_running and frontend_running
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def log_message(self, format, *args):
        # Suppress log messages
        pass

def main():
    # Change to the script directory
    os.chdir(current_dir)
    
    # Create the server
    server_address = ('localhost', 8080)
    httpd = HTTPServer(server_address, BotControlHandler)
    
    print("DigiRaksha Web Controller started!")
    print("Open your browser and go to: http://localhost:8080")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        # Clean up any running processes
        handler = BotControlHandler()
        handler.stop_services_internal()
        httpd.server_close()

if __name__ == "__main__":
    main()