import cv2
import numpy as np
import requests
from urllib.parse import urlparse
import os

def preprocess_image(img_src: str):
    # --- Load image ---
    if urlparse(img_src).scheme in ("http", "https"):
        # Load from URL
        resp = requests.get(img_src)
        if resp.status_code != 200:
            raise ValueError(f"Cannot fetch image from URL: {img_src}")
        arr = np.frombuffer(resp.content, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    else:
        # Load from local file
        if not os.path.exists(img_src):
            raise ValueError(f"File does not exist: {img_src}")
        img = cv2.imread(img_src)

    if img is None:
        raise ValueError(f"Failed to load image: {img_src}")

    # --- Ensure BGR for denoising ---
    if len(img.shape) == 2:  # grayscale
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    # --- Denoising ---
    img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

    # --- Convert to grayscale ---
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # --- Cropping non-zero area ---
    coords = cv2.findNonZero(gray)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        cropped = gray[y:y+h, x:x+w]
    else:
        cropped = gray  # fallback if image is empty

    # --- Thresholding ---
    ret, thresh = cv2.threshold(cropped, 127, 255, cv2.THRESH_TOZERO)

    # --- Resizing ---
    resized = cv2.resize(thresh, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)

    # --- Save and return ---
    name=img_src.split("/")
    name = name[len(name)-1]
    output_path = f"public/processed/{name}"
    cv2.imwrite(output_path, resized)
    return output_path

if __name__ == "__main__":
    preprocess_image("http://localhost:5000/uploads/790ef119-4762-44b1-bb32-9d2e0828be8d.jpg")
