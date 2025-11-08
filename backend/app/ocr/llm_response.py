from langchain_core.prompts import PromptTemplate
from app.lib import llm
import json
import re
from app.db import SessionLocal
from fastapi.responses import StreamingResponse
from app.models import Reports

class llm_class:
    prompt = ""
    prompt_template = None
    report_data = None
    report_id = None

    def __init__(self,prompt:str,report_data=None):
      self.prompt = prompt

      if report_data:
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

        if self.report_data:
          result = response.invoke({"report_text": self.report_data})
          if(result.content.lower() == "not a valid test report"):
              with SessionLocal() as db:
                  Reports.mark_error(errormsg=result.content,db=db,id=self.report_id)
                  return

          removedPrefix=result.content.removeprefix("```json")
          final_text=removedPrefix.removesuffix("```")
          json_text=json.loads(final_text)
          return json_text
    
    def call_llm_stream(self, user_q, q_context,prev_context):
        self.chain_prompt()
        response = self.prompt_template | llm  # Groq pipeline

        # Directly yield content chunks
        for chunk in response.stream({"query": user_q, "search_results": q_context,"context":prev_context}):
            if chunk and getattr(chunk, "content", None):
                yield chunk.content