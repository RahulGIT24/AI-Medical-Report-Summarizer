# from app.lib import embedder,client
# from fastembed import TextEmbedding
# # embedder = TextEmbedding()

def clean_report(data):
    """Recursively drop None, empty strings, empty lists/dicts."""
    if isinstance(data, dict):
        return {k: clean_report(v) for k, v in data.items() if v not in (None, "", [], {})}
    elif isinstance(data, list):
        return [clean_report(x) for x in data if x not in (None, "", [], {})]
    else:
        return data

def flatten_recursive(data, parent_key=""):
    """Flatten any nested dict/list into key: value pairs as text."""
    items = []
    if isinstance(data, dict):
        for k, v in data.items():
            new_key = f"{parent_key}_{k}" if parent_key else k
            items.extend(flatten_recursive(v, new_key))
    elif isinstance(data, list):
        for i, v in enumerate(data):
            new_key = f"{parent_key}_{i}" if parent_key else str(i)
            items.extend(flatten_recursive(v, new_key))
    else:
        # Always convert to str here
        items.append(f"{parent_key}: {str(data)}")
    return items

def vectorize_raw_report_data(report_dict):
    report_id = report_dict.get("report_id")
    user_id = report_dict.get("user_id")

    cleaned = clean_report(report_dict)
    flat_text = " | ".join(flatten_recursive(cleaned))
    print(flat_text)
    # embeddings  =list(embedder.embed(flat_text))[0]
    # client.insert_raw_report_embedding(embeddings=embeddings,report_id=report_id,user_id=user_id)

if __name__ == "__main__":
    vectorize_raw_report_data({'report_id': 1, 'user_id': 1, 'raw_data': {'report_metadata': {'patient_name': None, 'report_type': 'Lab', 'accession_number': '249068', 'collection_date': '2024-01-07', 'received_date': '2024-01-08 15:53', 'sample_type': 'Urine', 'lab_name': 'Quality Speed Precision', 'lab_director': 'Barry White, M.D.', 'clia_number': '26D0953866', 'cap_number': '8855089', 'report_date': '2024-01-08 15:54', 'notes': None}, 'specimen_validity': {'specific_gravity': {'value': '1.026', 'status': 'Normal'}, 'ph': {'value': '5.7', 'status': 'Normal'}, 'creatinine': {'value': '98', 'unit': 'mg/dL', 'status': 'Normal'}, 'oxidants': {'value': '<200', 'status': 'Normal'}, 'overall_validity': True}, 'test_results': [{'test_name': 'Noroxycodone', 'test_category': 'Opiates', 'outcome': 'positive', 'result_value': '597', 'cutoff_value': '50', 'reference_range': None, 'detection_window': '~1-4 days', 'unit': 'ng/mL', 'is_abnormal': True, 'is_critical': False}, {'test_name': 'Oxycodone', 'test_category': 'Opiates', 'outcome': 'positive', 'result_value': '265', 'cutoff_value': '50', 'reference_range': None, 'detection_window': '~1-4 days', 'unit': 'ng/mL', 'is_abnormal': True, 'is_critical': False}, {'test_name': 'Morphine', 'test_category': 'Opiates', 'outcome': 'positive', 'result_value': '95', 'cutoff_value': '50', 'reference_range': None, 'detection_window': '~1-4 days', 'unit': 'ng/mL', 'is_abnormal': True, 'is_critical': False}, {'test_name': 'Oxymorphone', 'test_category': 'Opiates', 'outcome': 'positive', 'result_value': '385', 'cutoff_value': '50', 'reference_range': None, 'detection_window': '~1-4 days', 'unit': 'ng/mL', 'is_abnormal': True, 'is_critical': False}, {'test_name': 'Ethyl Sulfate', 'test_category': 'Alcohol', 'outcome': 'positive', 'result_value': '659', 'cutoff_value': '200', 'reference_range': None, 'detection_window': 'Up to 80 hours estimated', 'unit': 'ng/mL', 'is_abnormal': True, 'is_critical': False}, {'test_name': 'Ethyl Glucuronide', 'test_category': 'Alcohol', 'outcome': 'positive', 'result_value': '524', 'cutoff_value': '500', 'reference_range': None, 'detection_window': 'Up to 80 hours estimated', 'unit': 'ng/mL', 'is_abnormal': True, 'is_critical': False}, {'test_name': 'THCCOOH', 'test_category': 'Cannabinoids', 'outcome': 'positive', 'result_value': '87', 'cutoff_value': '15', 'reference_range': None, 'detection_window': '~3-30 days', 'unit': 'ng/mL', 'is_abnormal': True, 'is_critical': False}, {'test_name': 'Secobarbital', 'test_category': 'Barbiturates', 'outcome': 'negative', 'result_value': '0', 'cutoff_value': '200', 'reference_range': None, 'detection_window': None, 'unit': 'ng/mL', 'is_abnormal': False, 'is_critical': False}, {'test_name': 'Phenobarbital', 'test_category': 'Barbiturates', 'outcome': 'negative', 'result_value': '0', 'cutoff_value': '200', 'reference_range': None, 'detection_window': None, 'unit': 'ng/mL', 'is_abnormal': False, 'is_critical': False}, {'test_name': 'Butalbital', 'test_category': 'Barbiturates', 'outcome': 'negative', 'result_value': '0', 'cutoff_value': '200', 'reference_range': None, 'detection_window': None, 'unit': 'ng/mL', 'is_abnormal': False, 'is_critical': False}, {'test_name': 'Norhydrocodone', 'test_category': 'Opiates', 'outcome': 'negative', 'result_value': '0', 'cutoff_value': '50', 'reference_range': None, 'detection_window': None, 'unit': 'ng/mL', 'is_abnormal': False, 'is_critical': False}, {'test_name': 'Hydromorphone', 'test_category': 'Opiates', 'outcome': 'negative', 'result_value': '0', 'cutoff_value': '50', 'reference_range': None, 'detection_window': None, 'unit': 'ng/mL', 'is_abnormal': False, 'is_critical': False}, {'test_name': 'Hydrocodone', 'test_category': 'Opiates', 'outcome': 'negative', 'result_value': '0', 'cutoff_value': '50', 'reference_range': None, 'detection_window': None, 'unit': 'ng/mL', 'is_abnormal': False, 'is_critical': False}, {'test_name': 'Codeine', 'test_category': 'Opiates', 'outcome': 'negative', 'result_value': '0', 'cutoff_value': '50', 'reference_range': None, 'detection_window': None, 'unit': 'ng/mL', 'is_abnormal': False, 'is_critical': False}], 'screening_tests': [{'test_name': 'Opiates - Screening', 'outcome': 'positive', 'result_value': 'Positive', 'cutoff_value': '300'}, {'test_name': 'THC - Screening', 'outcome': 'positive', 'result_value': 'Positive', 'cutoff_value': '50'}, {'test_name': 'Oxycodone - Screening', 'outcome': 'positive', 'result_value': 'Positive', 'cutoff_value': '100'}, {'test_name': 'EtG-Screening', 'outcome': 'positive', 'result_value': 'Positive', 'cutoff_value': '500'}], 'confirmation_analysis': [{'test_name': 'LC-MS/MS Confirmation Analysis', 'outcome': 'positive', 'method': 'LC-MS/MS', 'result_value': None, 'cutoff_value': None, 'unit': None, 'detection_window': None}], 'reported_medications': [{'medication_name': 'Ethanol'}]}})