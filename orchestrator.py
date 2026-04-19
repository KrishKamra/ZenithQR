import subprocess
import time
import sys
import os
from threading import Thread

def run_bridge():
    """Starts the FastAPI Telemetry Server"""
    print("🚀 [ORCHESTRATOR] Launching FastAPI Bridge...")
    subprocess.run([sys.executable, "bridge.py"])

def run_frontend():
    """Starts the Vite React Dashboard"""
    print("🎨 [ORCHESTRATOR] Launching React Dashboard...")
    # Using 'shell=True' for Windows/Bun execution
    subprocess.run("bun dev", shell=True)

def run_detector():
    """Starts your NPU-accelerated Detector loop"""
    print("👁️ [ORCHESTRATOR] Initializing NPU Detector...")
    time.sleep(5)  # Give the bridge a moment to warm up
    subprocess.run([sys.executable, "src/detector.py"])

if __name__ == "__main__":
    print("--- ZENITH-QR SYSTEM STARTUP ---")
    
    try:
        # 1. Start Bridge (Threaded)
        bridge_thread = Thread(target=run_bridge, daemon=True)
        bridge_thread.start()

        # 2. Start Frontend (Threaded)
        frontend_thread = Thread(target=run_frontend, daemon=True)
        frontend_thread.start()

        # 3. Start Detector (Main Thread)
        # We run this in the main thread to keep the script alive
        run_detector()

    except KeyboardInterrupt:
      print("\n🛑 [ORCHESTRATOR] System shutdown initiated...")
      sys.exit(0)