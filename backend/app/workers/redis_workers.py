from app.db import SessionLocal
from app.models import Reports
from app.ocr import preprocess_image,text_extraction,llm_class

db=SessionLocal()

def process_reports(report_ids: list[int]):
    for rid in report_ids:
        report = Reports.get_report(db=db, id=rid)

        if not report:
            continue

        report_src=report.url
        img=preprocess_image(img_src=report_src)
        raw_text=text_extraction(img=img)
        llm = llm_class(report_data=raw_text)
        cleaned_report = llm.call_llm()
        print(cleaned_report)