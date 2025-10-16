from app.db import SessionLocal
from app.models import ConfirmationTests, Reports
from app.ocr import preprocess_image,text_extraction,llm_class
from app.models import ReportMetaData, SpecimenValidity, TestResults, ScreeningTests,ReportedMedications, ConfirmationTests

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
        llm.set_report_id(rid)
        cleaned_report = llm.call_llm()

        report_metadata = cleaned_report["report_metadata"]
        specimen_validity = cleaned_report["specimen_validity"]

        test_results = cleaned_report["test_results"] # Array
        screening_tests = cleaned_report["screening_tests"] #Array
        confirmation_analysis = cleaned_report["confirmation_analysis"] #Array
        reported_medications = cleaned_report["reported_medications"] #Array

        # creating metadata 
        ReportMetaData.create(
            session=db,
            patient_name=report_metadata.get('patient_name',None),
            report_type=report_metadata.get('report_type',None),
            accession_number=report_metadata.get('accession_number',None),
            collection_date=report_metadata.get('collection_date',None),
            received_date=report_metadata.get('received_date',None),
            sample_type=report_metadata.get('sample_type',None),
            lab_name=report_metadata.get('lab_name',None),
            lab_director=report_metadata.get('lab_director',None),
            clia_number=report_metadata.get('clia_number',None),
            report_date=report_metadata.get('report_date',None),
            cap_number=report_metadata.get('cap_number',None),
            notes=report_metadata.get('notes',None),
            report_id=report.id
        )

        SpecimenValidity.create(
            session=db,
            specific_gravity=(specimen_validity.get("specific_gravity",None)).get("value",None),
            specific_gravity_status=(specimen_validity.get("specific_gravity",None)).get("status",None),
            ph_level=(specimen_validity.get("ph",None)).get("value",None),
            ph_status=(specimen_validity.get("ph",None)).get("status",None),
            creatinine=(specimen_validity.get("creatinine",None)).get("value",None),
            creatinine_unit=(specimen_validity.get("creatinine",None)).get("unit",None),
            creatinine_status=(specimen_validity.get("creatinine",None)).get("status",None),
            oxidants=(specimen_validity.get("oxidants",None)).get("value",None),
            oxidants_status=(specimen_validity.get("oxidants",None)).get("status",None),
            is_valid=(specimen_validity.get("overall_validity",None)),
            report_id=report.id
        )

        for test in test_results:
            TestResults.create(
                session=db,
                report_id=report.id,
                test_name=test.get('test_name',None),
                test_category=test.get('test_category',None),
                outcome=test.get('outcome',None),
                result_value=test.get('result_value',None),
                result_numeric=test.get('result_numeric',None),
                unit=test.get('unit',None),
                cutoff_value=test.get('cutoff_value',None),
                reference_range=test.get('reference_range',None),
                is_abnormal=test.get('is_abnormal',None),
                is_critical=test.get('is_critical',None),
            )

        for test in screening_tests:
            ScreeningTests.create(
                session=db,
                report_id=report.id,
                test_name=test.get("test_name",None),
                outcome=test.get("outcome",None),
                result_value=test.get("result_value",None),
                cutoff_value=test.get("cutoff_value",None),
            )

        for test in confirmation_analysis:
            ConfirmationTests.create(
                session=db,
                report_id=report.id,
                test_name=test.get("test_name",None),
                method=test.get("method",None),
                outcome=test.get("outcome",None),
                result_value=test.get("result_value",None),
                result_numeric=test.get("result_numeric",None),
                unit=test.get("unit",None),
                cutoff_value=test.get("cutoff_value",None),
                detection_window=test.get("detection_window",None),
            )

        for medication in reported_medications:
            ReportedMedications.create(
                session=db,
                report_id=report.id,
                medication_name=medication.get("medication_name",None),
                is_tested=medication.get("is_tested",None),
            )