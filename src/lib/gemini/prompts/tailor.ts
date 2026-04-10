export function buildTailoringPrompt(
  resumeData: Record<string, unknown>,
  analysisData: Record<string, unknown>
): string {
  return `You are a professional resume writer and ATS optimization specialist. Your task is to tailor the candidate's resume for a specific job.

## CURRENT RESUME DATA
${JSON.stringify(resumeData, null, 2)}

## JOB ANALYSIS
${JSON.stringify(analysisData, null, 2)}

## INSTRUCTIONS
1. Rewrite ONLY the top 3-5 bullets that matter most for this specific role
2. Reorder skills to front-load matches with the job requirements
3. Generate a tailored 2-3 sentence professional summary
4. Run ATS formatting check:
   - Check section headers are standard (Experience, Education, Skills)
   - Check date formats are consistent
   - Check keyword density for key skills from the JD
5. Human Tone Check:
   - Flag any rewritten bullet that sounds robotic
   - Flag overuse of buzzwords or filler phrases
   - Ensure bullets read naturally

## REQUIRED JSON OUTPUT (respond with ONLY this JSON):
{
  "tailored_summary": "2-3 sentence tailored professional summary",
  "tailored_bullets": [
    {
      "original": "Original bullet text",
      "tailored": "Rewritten bullet optimized for this role",
      "reason": "Why this change was made"
    }
  ],
  "reordered_skills": ["Skill1", "Skill2", "Skill3"],
  "ats_check": {
    "passed": true,
    "issues": ["Any ATS formatting issues found"],
    "keywords_matched": ["keyword1", "keyword2"],
    "keywords_missing": ["keyword3"]
  },
  "tone_check": {
    "passed": true,
    "flags": ["Any tone issues found"]
  },
  "estimated_score_improvement": 12
}`;
}
