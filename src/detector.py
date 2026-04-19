import cv2
import openvino as ov
import numpy as np
import os
import time

import requests

class SmartDetector:
    def __init__(self, model_xml):
        """
        Initializes OpenVINO and compiles the model for both NPU and CPU for benchmarking.
        """
        if not os.path.exists(model_xml):
            raise FileNotFoundError(f"AI Model not found at {model_xml}. Run convert.py first.")

        self.core = ov.Core()
        self.model = self.core.read_model(model_xml)
        
        # Compile for NPU
        try:
            self.npu_model = self.core.compile_model(self.model, "NPU")
            self.npu_available = True
        except Exception:
            self.npu_available = False
            print("⚠️ NPU not available for benchmarking.")

        # Compile for CPU for side-by-side comparison
        self.cpu_model = self.core.compile_model(self.model, "CPU")
        self.output_layer_idx = 0
        
        print(f"🚀 AI Engines initialized. NPU Ready: {self.npu_available}")

    def run_benchmark(self, input_data):
        """Measures inference time on different hardware."""
        results = {}
        
        # Benchmark CPU
        start = time.perf_counter()
        _ = self.cpu_model([input_data])[0]
        results['CPU'] = (time.perf_counter() - start) * 1000 # convert to ms
        
        # Benchmark NPU
        if self.npu_available:
            start = time.perf_counter()
            _ = self.npu_model([input_data])[0]
            results['NPU'] = (time.perf_counter() - start) * 1000
            
        return results

    def diagnose_and_scan(self, image_path):
        if not os.path.exists(image_path):
            return

        raw_img = cv2.imread(image_path)
        gray_img = cv2.cvtColor(raw_img, cv2.COLOR_BGR2GRAY)
        resized_img = cv2.resize(gray_img, (128, 128))
        input_data = resized_img.reshape(1, 128, 128, 1).astype(np.float32) / 255.0
        
        # --- Phase 1: Benchmarking & AI Analysis ---
        benchmarks = self.run_benchmark(input_data)
        
        # We'll use the NPU result for the actual diagnostic if available
        active_model = self.npu_model if self.npu_available else self.cpu_model
        prediction = active_model([input_data])[0]
        confidence = prediction[0][0]
        
        # ADJUSTED THRESHOLD: 0.6 instead of 0.5 for stricter quality control
        is_scannable_ai = confidence > 0.6

        print(f"\n--- AI Diagnostic: {os.path.basename(image_path)} ---")
        print(f"Quality Score: {confidence:.2%}")
        print(f"Latency: CPU: {benchmarks['CPU']:.2f}ms" + 
              (f" | NPU: {benchmarks.get('NPU', 0):.2f}ms" if self.npu_available else ""))
        
        # --- Phase 2: Decoding ---
        detector = cv2.QRCodeDetector()
        data, bbox, _ = detector.detectAndDecode(raw_img)

        if bbox is not None and data:
            print(f"Status: [SUCCESS] ✅ | Data: {data}")
        elif is_scannable_ai:
            print(f"Status: [DECODE ERROR] ⚠️ (AI Score high, algorithm failed)")
        else:
            print(f"Status: [QUALITY FAILED] ❌ (AI Score: {confidence:.2%})")


def push_to_dashboard(score=None, latency=None, status=None, qr_text=None):
    payload = {}
    if score is not None: payload["qualityScore"] = score
    if latency is not None: payload["latencyMs"] = latency
    if status is not None: payload["safetyStatus"] = status
    if qr_text is not None: payload["qrData"] = qr_text
    
    try:
        requests.post("http://localhost:8000/update", json=payload)
    except Exception as e:
        print(f"Dashboard offline: {e}")

if __name__ == "__main__":
    MODEL_PATH = os.path.join("models", "openvino_model", "qr_quality_model.xml")
    
    try:
        scanner = SmartDetector(MODEL_PATH)
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        
        # PERSISTENT DETECTOR: Don't re-create inside the loop
        qr_detector = cv2.QRCodeDetector()
        
        frame_count = 0
        confidence = 0.5 # Initial state

        print("📸 Optimized NPU Stream Active. Press 'q' to quit.")

        while True:
            ret, frame = cap.read()
            if not ret: break
            frame_count += 1

            # 1. OPTIMIZATION: AI analysis every 3rd frame
            if frame_count % 3 == 0:
                # Convert to grayscale
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # --- CALIBRATION STEP: Histogram Equalization ---
                # Laptops often wash out blacks. This forces deep contrast.
                equalized = cv2.equalizeHist(gray)
                
                # Resize for the model input
                resized_ai = cv2.resize(equalized, (128, 128))
                
                # --- CALIBRATION STEP: Normalization Check ---
                # If your score is stuck at 51%, try toggling "/ 255.0" 
                # If you didn't normalize during training, remove the division.
                input_data = resized_ai.reshape(1, 128, 128, 1).astype(np.float32) / 255.0
                
                active_model = scanner.npu_model if scanner.npu_available else scanner.cpu_model
                prediction = active_model([input_data])[0]
                
                # Extract raw confidence
                confidence = float(prediction[0][0])

            # 2. QR DECODE (Run on every frame for responsiveness)
            data, bbox, _ = qr_detector.detectAndDecode(frame)

            # 3. DASHBOARD LOGIC
            status = "warning"
            if data:
                status = "verified" # This triggers the Lime glow
            elif confidence < 0.35:
                status = "blocked"

            # 4. DASHBOARD PUSH (Only push when frame_count is even to clear traffic)
            if frame_count % 2 == 0:
                benchmarks = scanner.run_benchmark(input_data) if frame_count % 9 == 0 else {'CPU': 0}
                push_to_dashboard(
                    score=confidence * 100, 
                    latency=benchmarks.get('NPU', benchmarks['CPU']), 
                    status=status,
                    qr_text=data if data else "Scanning..."
                )

            # Visual overlay
            color = (100, 242, 190) if data else (0, 165, 255)
            cv2.putText(frame, f"NPU FIDELITY: {confidence:.1%}", (20, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            
            cv2.imshow("ZenithQR - NPU Stream", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'): break

        cap.release()
        cv2.destroyAllWindows()
    except Exception as e:
        print(f"Hardware Error: {e}")