# PDF Extraction Implementation Plan for WorthApply

## 1. Goal
Implement structured resume data extraction to replace the current placeholder warning.

## 2. Approach: LLM-Based Extraction (High Accuracy)
Instead of a simple library (like `pdf-parse`) that often loses layout context, we will use a structured LLM extraction workflow:
- **Phase A (Storage Trigger):** Use Supabase storage event (or manual trigger after upload) to queue a background job.
- **Phase B (Processing):** 
  - Download PDF from Supabase storage.
  - Convert PDF to text/markdown using a robust server-side tool (e.g., `pdf-parse` or an API like Unstructured.io).
  - Feed the text into a structured LLM prompt (using `gemini-3.1-flash` or similar) to extract:
    - Name
    - Contact Info
    - Experience (Structured JSON)
    - Skills (List)
- **Phase C (Persist):** Update `resumes` table in Supabase with `parsed_data` and `items_extracted`.

## 3. Recommended Tools
- **Parsing:** `pdf-parse` (standard Node.js library).
- **Extraction:** Gemini via API.
- **Queue/Background:** Since it's a Next.js app, Vercel Cron or a dedicated worker in a Supabase Edge Function is recommended to avoid blocking the API route.

## 4. Verification Plan
- Upload a standard test PDF resume.
- Monitor `parse_status` transition from 'failed' to 'completed'.
- Validate the JSON structure in `parsed_data`.

## 5. Decision Required
- Do we have existing API keys for a document AI service, or should we use our Gemini credentials for the extraction?
- Are you okay with me adding `pdf-parse` as a dependency?
