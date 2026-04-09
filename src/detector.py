import cv2
import os

def scan_and_diagnose(image_path):
    """
    Scans a QR code and provides a diagnostic report.
    """
    if not os.path.exists(image_path):
        print(f"File {image_path} not found.")
        return

    img = cv2.imread(image_path)
    detector = cv2.QRCodeDetector()
    data, bbox, straight_qrcode = detector.detectAndDecode(img)

    print(f"--- Diagnostic Report for {os.path.basename(image_path)} ---")
    if bbox is not None:
        print(f"Status: [READABLE]")
        print(f"Encoded Data: {data}")
    else:
        print(f"Status: [FAILED]")
        print("Suggestion: Check for low contrast or extreme blur.")

if __name__ == "__main__":
    # Example: Scanning the file we just generated
    target_file = os.path.join("assets", "my_link_qr.png")
    scan_and_diagnose(target_file)