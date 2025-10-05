from paddleocr import PaddleOCR
from app.ocr.preprocess import preprocess_image

def text_extraction(img:str):
    ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False)

    result = ocr.predict(
    input=img)
    for res in result:
        res.print()
        res.save_to_img("output")
        res.save_to_json("output")


if __name__=="__main__":
    img=preprocess_image("../../public/sample_data/0001-scaled.jpg")
    text_extraction(img)