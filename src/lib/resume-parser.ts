import { createClient } from '@/lib/supabase/server';
import { PDFParse } from 'pdf-parse';
import { getGeminiClient } from '@/lib/gemini/client';

function extractJsonPayload(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  return trimmed;
}

export async function processResumeExtraction(resumeId: string) {
  const supabase = await createClient();

  try {
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (fetchError || !resume) {
      console.error('Extraction worker: Resume not found', fetchError);
      return;
    }

    await supabase.from('resumes').update({ parse_status: 'processing' }).eq('id', resumeId);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resume.storage_path);

    if (downloadError || !fileData) {
      throw downloadError || new Error('Resume download failed');
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const parser = new PDFParse({ data: buffer });

    try {
      const pdfData = await parser.getText();
      const rawText = pdfData.text?.trim();

      if (!rawText) {
        throw new Error('Resume text extraction returned empty content');
      }

      const model = getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-flash' });
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
      const responseText = extractJsonPayload(result.response.text());
      const parsedData = JSON.parse(responseText) as Record<string, unknown>;
      const itemsExtracted = Object.values(parsedData).reduce<number>((count, value) => {
        if (Array.isArray(value)) return count + value.length;
        return value ? count + 1 : count;
      }, 0);

      await supabase
        .from('resumes')
        .update({
          parse_status: 'complete',
          raw_text: rawText,
          parsed_data: parsedData,
          items_extracted: itemsExtracted,
        })
        .eq('id', resumeId);
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.error('Extraction worker failed', error);
    await supabase.from('resumes').update({ parse_status: 'failed' }).eq('id', resumeId);
  }
}
