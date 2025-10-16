from langchain_core.prompts import PromptTemplate
from app.lib import llm
import json
import re
from app.db import SessionLocal
from app.models import Reports

class llm_class:
    prompt = ""
    prompt_template = None
    report_data = None
    report_id = None

    def __init__(self,report_data:str):
      self.prompt = """
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

  Return ONLY valid JSON, no additional text or explanation. If it is not a valid test report please Simply return in string format NOT A VALID TEST REPORT.
  """
      self.report_data=report_data

    def chain_prompt(self):
      self.prompt_template = PromptTemplate.from_template(self.prompt)

    def parse_llm_output(self,raw_text:str):
        """
        Cleans LLM output and parses JSON. Handles non-string input gracefully.
        """
        if raw_text is None:
            print("Warning: LLM output is None")
            return None

        # If input is already a dict, return it
        if isinstance(raw_text, dict):
            return raw_text

        # Ensure it's a string
        if not isinstance(raw_text, str):
            raw_text = str(raw_text)

        # Remove markdown code fences
        cleaned = re.sub(r"```(?:json)?\s*(.*?)```", r"\1", raw_text, flags=re.DOTALL).strip()

        # Remove surrounding quotes if present
        if cleaned.startswith('"') and cleaned.endswith('"'):
            cleaned = cleaned[1:-1]

        # Parse JSON
        try:
            data = json.loads(cleaned)
            return data
        except json.JSONDecodeError as e:
            print("Error parsing JSON:", e)
            return None

    def set_report_id(self,id:int):
      self.report_id = id

    def call_llm(self):
        self.chain_prompt()
        response=self.prompt_template | llm
        result = response.invoke({"report_text": self.report_data})
        if(result.content.lower() == "not a valid test report"):
            with SessionLocal() as db:
                Reports.mark_error(errormsg=result.content,db=db,id=self.report_id)
                return

        removedPrefix=result.content.removeprefix("```json")
        final_text=removedPrefix.removesuffix("```")
        json_text=json.loads(final_text)
        return json_text