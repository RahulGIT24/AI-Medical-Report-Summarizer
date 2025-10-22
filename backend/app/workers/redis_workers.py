from app.db import SessionLocal
from app.models import ConfirmationTests, Reports
from app.ocr import preprocess_image,text_extraction,llm_class
from app.models import ReportMetaData, SpecimenValidity, TestResults, ScreeningTests,ReportedMedications, ConfirmationTests
from app.lib import raw_data_vectorization,get_extraction_prompt
from app.workers.vector_db_workers import vectorize_raw_report_data

db=SessionLocal()

def base_template(collection_name,collection_id,data):
    return {
            "name":collection_name,
            "collection_id":collection_id,
            "data":data
    }

def process_reports(report_ids: list[int]):
    try:
        for rid in report_ids:
            report = Reports.get_report(db=db, id=rid)

            if not report:
                continue

            report_src=report.url
            img=preprocess_image(img_src=report_src)
            raw_text=text_extraction(img=img)
            llm = llm_class(report_data=raw_text,prompt=get_extraction_prompt(),query_context=None,user_query=None)
            llm.set_report_id(rid)
            cleaned_report = llm.call_llm()

            report_metadata = cleaned_report["report_metadata"]
            specimen_validity = cleaned_report["specimen_validity"]

            test_results = cleaned_report["test_results"]
            screening_tests = cleaned_report["screening_tests"] 
            confirmation_analysis = cleaned_report["confirmation_analysis"] 
            reported_medications = cleaned_report["reported_medications"]

            # Thinking....

            data_to_vectorize = []


            # name id data="" user_id

            # creating metadata     
            report_metadata,id = ReportMetaData.create(
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

            metadata = base_template(collection_id=id,collection_name="report_metadata",data=report_metadata)
            data_to_vectorize.append(metadata)

            specimen_validity_data,id = SpecimenValidity.create(
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

            specimen_validity = base_template(collection_id=id,collection_name="specimen_validity",data=specimen_validity_data)

            data_to_vectorize.append(specimen_validity)

            for test in test_results:
                test_results_data,id = TestResults.create(
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
                test_res = base_template(collection_id=id,collection_name="test_results",data=test_results_data)

                data_to_vectorize.append(test_res)

            for test in screening_tests:
                screening_tests_data,id = ScreeningTests.create(
                    session=db,
                    report_id=report.id,
                    test_name=test.get("test_name",None),
                    outcome=test.get("outcome",None),
                    result_value=test.get("result_value",None),
                    cutoff_value=test.get("cutoff_value",None),
                )
                screening_test_res = base_template(collection_id=id,collection_name="screening_tests",data=screening_tests_data)

                data_to_vectorize.append(screening_test_res)

            for test in confirmation_analysis:
                confirmation_tests,id = ConfirmationTests.create(
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
                confirmation_test_res = base_template(collection_id=id,collection_name="confirmation_tests",data=confirmation_tests)

                data_to_vectorize.append(confirmation_test_res)

            for medication in reported_medications:
                reported_meds_data,id = ReportedMedications.create(
                    session=db,
                    report_id=report.id,
                    medication_name=medication.get("medication_name",None),
                    is_tested=medication.get("is_tested",None),
                )
                reported_meds = base_template(collection_id=id,collection_name="reported_medications",data=reported_meds_data)

                data_to_vectorize.append(reported_meds)
            
            # # for collection1
            raw_report_vectorize = {
                "report_id":rid,
                "user_id":report.owner,
                "data":data_to_vectorize
            }

            Reports.mark_completed(db=db,id=rid)

            raw_data_vectorization.enqueue(vectorize_raw_report_data,raw_report_vectorize)
    except Exception:
        db.rollback()
        # Reports.mark_error(db=db,errormsg="Unable to Store data",id=rid)