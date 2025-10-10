from paddleocr import PaddleOCR
from app.ocr.preprocess import preprocess_image

def text_extraction(img: str):
    ocr = PaddleOCR(
        lang='en',
        use_angle_cls=False,
        ocr_version='PP-OCRv3',
        enable_mkldnn=True,
    )

    result = ocr.predict(input=img)
    if result and len(result) > 0:
        if isinstance(result[0], dict) and 'rec_texts' in result[0]:
            text = result[0]['rec_texts']
        else:
            text = []
    else:
        text = []
    text_string = '\n'.join(text)
    return text_string


if __name__=="__main__":
    img=preprocess_image(img_src='../../public/processed/790ef119-4762-44b1-bb32-9d2e0828be8d.jpg')
    print(text_extraction(img=img))