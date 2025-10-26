def get_extraction_prompt():
    return """
  You are a medical document data extraction assistant. Your task is to extract structured information from health/lab reports.

  Extract the following information from the text below and return it in JSON format. If a field is not found, use null as the value.

  **Report Text:**
  {report_text}

  **Instructions:**
  1. Extract ALL test names and their corresponding results, outcomes, cutoffs, and reference ranges
  2. Extract report metadata (accession number, collection date, lab details, etc.)
  3. Do NOT extract patient name or patient identifying information
  4. For test results, create an array of objects with: test_name, result, outcome, cutoff, reference_range, detection_window
  5. Normalize values (remove extra spaces, standardize formats)
  6. If multiple tests have the same name, include all occurrences

  *** Remember this enum ***
  class TestOutcome(enum.Enum):
      POSITIVE = "positive"
      NEGATIVE = "negative"
      NORMAL = "normal"
      ABNORMAL = "abnormal"
      INCONCLUSIVE = "inconclusive"

  **Required JSON Structure:**
  {{
    "report_metadata": {{
      "patient_name":"string",
      "report_type":"string", # "Lab", "Radiology", "Blood Test", etc.
      "accession_number": "string",
      "collection_date": "YYYY-MM-DD",
      "received_date": "YYYY-MM-DD HH:MM AM/PM",
      "sample_type": "string",  # "Urine", "Blood", etc.
      "lab_name": "string",
      "lab_director": "string",
      "clia_number": "string",
      "cap_number": "string",
      "report_date": "YYYY-MM-DD HH:MM AM/PM"
      "notes":"string" (only if present)
    }},
    "specimen_validity": {{
      "specific_gravity": {{"value": "string", "status": "Normal/Abnormal"}},
      "ph": {{"value": "string", "status": "Normal/Abnormal"}},
      "creatinine": {{"value": "string", "unit": "mg/dL", "status": "Normal/Abnormal"}},
      "oxidants": {{"value": "string", "status": "Normal/Abnormal"}},
      "overall_validity": "bool" (Predict Accordingly)
    }},
    "test_results": [
      {{
        "test_name": "string",
        "test_category": "string", # "Opiates", "Barbiturates", etc.
        "outcome": "From TESTOUTCOME enum",
        "result_value": "string", # (should be convertible to numeric)
        "cutoff_value": "string",
        "reference_range": "string or null",
        "detection_window": "string or null",
        "unit": "string or null",
        "is_abnormal": "bool",
        "is_critical" : "bool"
      }}
    ],
    "screening_tests": [
      {{
        "test_name": "string",
        "outcome": "From TESTOUTCOME enum",
        "result_value": "string",
        "cutoff_value": "string"
      }}
    ],
    "confirmation_analysis": [
      {{
        "test_name": "string",
        "outcome": "From TESTOUTCOME enum",
        "method": "string", # "LC-MS/MS", "GC-MS", etc.
        "result_value": "string",
        "cutoff_value": "string",
        "unit": "string or null",
        "detection_window": "string or null"
      }}
    ],
    "reported_medications": [
    {{
      "medication_name":"string"
    }}
    ],
  }}

  IF THE REPORT CONTAINS SOME OTHER NAMES THAT HAVE SIMILAR MEANING ITEM PRESENT IN REQUIRED JSON THEN PLEASE IN THE OUTPUT JSON DON'T CHANGE THE KEY, MAP THAT DATA ACCORDING TO REQUIRED JSON FIELDS.
  Return ONLY valid JSON, no additional text or explanation. If it is not a valid test report please Simply return in string format NOT A VALID TEST REPORT. 
"""

def get_query_prompt():
    return """
    You are an intelligent data reasoning assistant. 
    You are given a list of documents retrieved from a vector database based on semantic similarity to a user query. 
    Your task is to carefully read these documents and generate the most relevant, accurate, and concise answer to the query.

    ### User Query:
    {query}

    ### Retrieved Documents:
    {search_results}

    ### Instructions:
    1. Read all the documents and understand their context.
    2. Use only the factual information from these documents to answer.
    3. If multiple documents provide overlapping or conflicting information, reconcile them logically.
    4. If none of the documents directly answer the query, say "No relevant information found."
    5. Provide your final answer in a clear, human-readable format without repeating irrelevant details.

    **PLEASE DONT INCLUDE FIELDS AS IT IS PAST IN CONTEXT MAKE SURE YOU FORMAT IT AND MAKE IT HUMAN UNDERSTANDABLE THEY ARE DB FIELDS DONT EXPOSE THEM.**

    ### Output Format Specification:
    Return output in plain string. (DONT USE ESCAPE SEQUENCES WHILE ANSWERING) 
    You can at the end you can specify the date/dates of source report/reports (dates should be human understandable) and other relevant info if you think is necessary. 

"""