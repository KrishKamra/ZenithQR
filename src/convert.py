import openvino as ov
import tensorflow as tf
import numpy as np
import os

# 1. Load your trained model
model_path = 'models/qr_quality_model.keras'
model = tf.keras.models.load_model(model_path)

# 2. Define the static input shape [Batch_Size, Height, Width, Channels]
# We use 1 for batch size to optimize for single-image inference on your NPU
input_shape = [1, 128, 128, 1]

# 3. Convert to OpenVINO Intermediate Representation
# We provide an example input tensor to resolve the "unknown rank" error
print("⏳ Converting model to OpenVINO IR... this may take a moment.")
ov_model = ov.convert_model(model, example_input=np.zeros(input_shape, dtype=np.float32))

# 4. Save the .xml and .bin files
output_dir = 'models/openvino_model'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

ov.save_model(ov_model, os.path.join(output_dir, 'qr_quality_model.xml'))
print(f"✅ Success: OpenVINO IR files generated in {output_dir}")