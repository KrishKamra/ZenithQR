import qrcode
import cv2
import os

class MyQR:
    def __init__(self, size: int, padding: int):
        # Initialize with standard box size and border padding
        self.qr = qrcode.QRCode(box_size=size, border=padding)
    
    def check_quality(self, file_path: str):
        """Uses OpenCV to verify if the generated QR is readable."""
        img = cv2.imread(file_path)
        if img is None:
            return False
        detector = cv2.QRCodeDetector()
        data, bbox, _ = detector.detectAndDecode(img)
        return bbox is not None

    def generate_save_verify(self, text: str, file_name: str, fg: str, bg: str):
        """Core logic to generate, save to assets, and verify quality."""
        self.qr.clear() # Clear state before adding new data
        self.qr.add_data(text)
        self.qr.make(fit=True)
        img = self.qr.make_image(fill_color=fg, back_color=bg)
        
        # Ensure the assets directory exists for professional structure
        if not os.path.exists('assets'): 
            os.makedirs('assets')
            
        path = os.path.join('assets', file_name)
        img.save(path)

        # Quality Check
        if self.check_quality(path):
            print(f"✅ Success! QR Code is scannable and saved to: {path}")
        else:
            print(f"⚠️ Warning: Generated QR might be unreadable. Try higher contrast colors than {fg} on {bg}.")
        return path

    def create_qr(self, file_name: str, fg: str, bg: str):
        """Standard manual input generation."""
        user_input = input("Enter the text or link (starting with http): ") 
        
        # Basic validation
        if not user_input.strip():
            print("Error: Input cannot be empty.")
            return

        return self.generate_save_verify(user_input, file_name, fg, bg)

    def create_qr_from_text(self, text: str, file_name: str, fg: str, bg: str):
        """Automated generation for Voice-to-QR or other inputs."""
        return self.generate_save_verify(text, file_name, fg, bg)

if __name__ == "__main__":
    # Initialize and run manual test
    my_qr_gen = MyQR(size=10, padding=5)
    my_qr_gen.create_qr("manual_test_qr.png", "darkblue", "white")