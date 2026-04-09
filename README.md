
---

# AI-Enhanced QR Code Suite

A modular Python project that generates QR codes and utilizes Computer Vision to verify their scannability and quality. This project represents an evolution from a simple single-script generator to a professional, AI-ready architecture.

## 📂 Project Structure
* **src/generator.py**: The primary engine for creating QR codes with built-in quality checks.
* **src/detector.py**: A diagnostic tool using OpenCV to decode and analyze existing QR codes.
* **assets/**: Storage directory for generated QR code images.
* **QR-CodeGenerator.py**: The original legacy script (preserved for reference/nostalgia).

## 🚀 Features
* **Automated Validation**: Every generated QR code is immediately scanned by OpenCV to ensure it's readable before confirming success.
* **Diagnostic Reporting**: Detailed feedback on whether a QR code is scannable or if it suffers from low contrast or distortion.
* **Secure Input**: Built-in validation to ensure only valid URLs (HTTP/HTTPS) are processed.

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/your-username/QR-CODE-AI.git](https://github.com/your-username/QR-CODE-AI.git)
   cd QR-CODE-AI
   ```

2. **Set up the Virtual Environment**:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install qrcode[pil] opencv-python
   ```

## 💻 Usage

### Generate a QR Code
Run the generator script to create a new QR code in the `assets/` folder. The script will prompt you for a link and automatically perform a quality check.
```bash
python src/generator.py
```

### Run Diagnostics
Use the detector to verify the integrity of a specific image or troubleshoot a QR code that isn't scanning.
```bash
python src/detector.py
```

## 📈 Future Roadmap
- **CNN Integration**: Train a Deep Learning model to classify "Good" vs "Bad" QR codes based on environmental noise and blur.
- **Voice-to-QR**: Implement `SpeechRecognition` to convert voice commands into QR codes.
- **Safety Analysis**: Integrate an API (like Google Safe Browsing) to check if encoded URLs lead to phishing or malware sites.
- **Personalization**: Use AI-generated art (Stable Diffusion) to create stylized, scannable QR codes.

---