
import { createClient } from '@/lib/supabase/server';
import { PDFParse } from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function processResumeExtraction(resumeId: string) {
  const supabase = await createClient();
  
  // 1. Fetch resume record
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (fetchError || !resume) {
    console.error('Extraction worker: Resume not found', fetchError);
    return;
  }

  // 2. Download file from storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('resumes')
    .download(resume.storage_path);

  if (downloadError || !fileData) {
    console.error('Extraction worker: Download failed', downloadError);
    await supabase.from('resumes').update({ parse_status: 'failed' }).eq('id', resumeId);
    return;
  }

  // 3. Extract text from PDF
  const buffer = Buffer.from(await fileData.arrayBuffer());
  const parser = new PDFParse({ data: buffer });
  const pdfData = await parser.getText();
  const rawText = pdfData.text;
  await parser.destroy();

  // 4. Extract structured data using Gemini
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `
    Extract structured information from this resume text:
    ${rawText}
    
    Return ONLY a JSON object with these fields:
    - name: string
    - email: string
    - phone: string
    - skills: string[]
    - experience: { title: string, company: string, duration: string, summary: string }[]
    
    If a field is missing, use null or an empty list.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const parsedData = JSON.parse(response.text());

  // 5. Update database
  await supabase
    .from('resumes')
    .update({ 
      parse_status: 'complete',
      raw_text: rawText,
      parsed_data: parsedData,
      items_extracted: Object.keys(parsedData).length
    })
    .eq('id', resumeId);
}
