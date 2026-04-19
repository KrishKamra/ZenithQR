import cv2
import numpy as np
import os
import random
from generator import MyQR # Reusing your existing class

class QRDatasetGenerator:
    def __init__(self, output_dir="dataset"):
        self.output_dir = output_dir
        self.generator = MyQR(size=10, padding=2)
        
        # Create folder structure
        for label in ["0", "1"]: # 0 = Unscannable, 1 = Scannable
            os.makedirs(os.path.join(output_dir, label), exist_ok=True)

    def apply_corruption(self, image_path):
        img = cv2.imread(image_path)
        if img is None: return
        
        h, w, _ = img.shape
        corruption_type = random.choice(['blur', 'contrast', 'occlusion', 'none'])
        
        if corruption_type == 'blur':
            # Random kernel size for Gaussian Blur
            ksize = random.choice([7, 9, 11, 15])
            img = cv2.GaussianBlur(img, (ksize, ksize), 0)
            
        elif corruption_type == 'contrast':
            # Randomly reduce contrast and brightness
            alpha = random.uniform(0.3, 0.7) 
            img = cv2.convertScaleAbs(img, alpha=alpha, beta=30)
            
        elif corruption_type == 'occlusion':
            # Draw random black rectangles over the QR
            for _ in range(random.randint(2, 5)):
                x1, y1 = random.randint(0, w//2), random.randint(0, h//2)
                x2, y2 = x1 + random.randint(20, 50), y1 + random.randint(20, 50)
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 0), -1)

        return img

    def generate_batch(self, count=1000):
        print(f"🚀 Generating {count} samples...")
        
        for i in range(count):
            temp_path = "temp_gen.png"
            # Generate a random URL-like string
            dummy_data = f"https://example.com/ref={random.randint(1000, 9999)}"
            
            # Using your class's internal QR logic to make the image
            self.generator.qr.clear()
            self.generator.qr.add_data(dummy_data)
            self.generator.qr.make(fit=True)
            qr_img = self.generator.qr.make_image(fill_color="black", back_color="white")
            qr_img.save(temp_path)

            # Apply random corruption
            processed_img = self.apply_corruption(temp_path)
            
            # Auto-Labeling using your check_quality logic
            # We save it temporarily to let OpenCV try to read it
            cv2.imwrite("test_label.png", processed_img)
            is_scannable = self.generator.check_quality("test_label.png")
            
            label = "1" if is_scannable else "0"
            final_filename = os.path.join(self.output_dir, label, f"qr_{i}.png")
            cv2.imwrite(final_filename, processed_img)

        # Cleanup
        if os.path.exists("temp_gen.png"): os.remove("temp_gen.png")
        if os.path.exists("test_label.png"): os.remove("test_label.png")
        print(f"✅ Dataset complete. Check the '{self.output_dir}' folder.")

if __name__ == "__main__":
    data_gen = QRDatasetGenerator()
    data_gen.generate_batch(1000)