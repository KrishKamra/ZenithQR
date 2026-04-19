
# 📡 ZenithQR: AI-Enhanced Diagnostic Suite

> **Project Mission:** A multidisciplinary, high-fidelity system designed for real-time QR code analysis and quality verification. This project bridges the gap between **low-level hardware optimization** and **modern web telemetry**, providing a "Silicon Minimalism" diagnostic experience powered by the **Intel NPU**.

---

## 🚀 Platform Overview

* **Objective:** Proactively assess QR scannability using NPU-accelerated Computer Vision.
* **Target Metric:** `Fidelity Score` (AI-driven probability of a successful traditional decode).
* **Deployment:** Futuristic React 19 Dashboard with zero-latency telemetry sync.
* **Hardware Target:** Intel Core Ultra 5 (ASUS Zenbook 14) using **Intel AI Boost**.

---

## 🏗️ System Architecture & Rigor

The suite operates as a distributed system, separating heavy AI inference from high-frequency UI rendering to maintain a zero-latency feedback loop:

### 1. Intelligence & Hardware Layer (`detector.py`)
* **NPU Acceleration:** Utilizes a CNN model optimized via **OpenVINO** to offload inference to the Intel NPU. 
* **Performance:** Achieves **<15ms latency** at 16TOPS, ensuring the CPU remains available for orchestration and system tasks.

### 2. Communication & Orchestration (`bridge.py` & `orchestrator.py`)
* **FastAPI Relay:** A high-performance bridge that pipes NPU telemetry to the frontend via local JSON endpoints.
* **Multi-Process Sync:** The `orchestrator.py` master script manages the lifecycles of the Python backend and the React frontend simultaneously.

---

## 🤖 Production Pipeline

The project implements a **Full-Stack AI Pipeline** optimized for edge deployment:

* **Silicon Minimalism UI:** A frosted-glass 3D dashboard built with **Framer Motion 3D** and **Tailwind CSS v4**.
* **Live Fidelity Scoring:** Predicts scan success before traditional CV algorithms trigger, allowing for proactive UI feedback.
* **Offline-First Security:** All processing is executed locally on the silicon, ensuring total data sovereignty and privacy.

---

## 💡 Strategic Business & Technical ROI

* **The "Zero-Cloud" Advantage:** Eliminates API costs and latency by processing 100% of telemetry locally on the Intel architecture.
* **Performance Benchmarks:**
    * **Inference Speed:** ~14ms on NPU vs ~36ms on CPU.
    * **Architecture:** Decoupled SaaS-style layout ensures modularity for future NLP or Blockchain integrations.

---

## 🛠️ Installation & Usage

### **1. Environment Setup**
```bash
# Initialize and activate the virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install AI and Backend dependencies
pip install -r requirements.txt

# Install Frontend packages (via Bun)
bun install
```

### **2. Launch the Mission Control**
```bash
# Compiles model for NPU and launches all systems
python orchestrator.py
```
*Access the portal at:* **`http://localhost:8080`**

---

## 📈 Future Roadmap
- **Transformer-Based Decoding:** Implementing Attention-based models for extreme distortion recovery.
- **Advanced NLP Integration:** Utilizing local LLMs for URL summarization and safety intent analysis.
- **Hardware Telemetry Expansion:** Real-time RAM/Thermal monitoring directly on the Zenith dashboard.
- **Blockchain Verification:** Anchoring QR hashes to a ledger for tamper-proof digital twin signatures.

---

## 👨‍🔬 Author
**Krish Kamra**