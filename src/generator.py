import qrcode
import cv2
import os

class MyQR:
    def __init__(self, size: int, padding: int):
        self.qr = qrcode.QRCode(box_size=size, border=padding)
    
    def check_quality(self, file_path: str):
        """Uses OpenCV to verify if the generated QR is readable."""
        img = cv2.imread(file_path)
        if img is None:
            return False
        detector = cv2.QRCodeDetector()
        data, bbox, _ = detector.detectAndDecode(img)
        return bbox is not None

    def create_qr(self, file_name: str, fg: str, bg: str):
        user_input = input("Enter the link (starting with http): ") 
        
        # Validation Logic
        if not user_input.startswith("http"):
            print("Error: Only links are allowed.")
            return

        self.qr.add_data(user_input)
        self.qr.make(fit=True)
        img = self.qr.make_image(fill_color=fg, back_color=bg)
        
        # Ensure the assets directory exists
        if not os.path.exists('assets'): 
            os.makedirs('assets')
            
        path = os.path.join('assets', file_name)
        img.save(path)

        # Quality Check
        if self.check_quality(path):
            print(f"Success! QR Code is scannable and saved to: {path}")
        else:
            print("Warning: Generated QR might be unreadable. Try higher contrast.")

if __name__ == "__main__":
    # Initialize and run
    my_qr_gen = MyQR(size=10, padding=5)
    my_qr_gen.create_qr("my_link_qr.png", "darkblue", "white")