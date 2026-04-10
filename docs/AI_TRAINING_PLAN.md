# WorthApply AI Engine Training & Testing Plan

## Current AI Implementation Status

### ✅ Already Implemented
1. **Job Analysis Prompt** (`src/lib/gemini/prompts/analyze.ts`)
   - Parses job description
   - Generates fit scores (skills, experience, domain)
   - Matches skills with resume evidence
   - Identifies skill gaps
   - Analyzes seniority alignment
   - Flags recruiter concerns

2. **Resume Tailoring Prompt** (`src/lib/gemini/prompts/tailor.ts`)
   - Rewrites top 3-5 bullets
   - Reorders skills for ATS
   - Generates tailored summary
   - ATS formatting check
   - Human tone validation

3. **Cover Letter Triage Prompt** (`src/lib/gemini/prompts/cover-letter.ts`)
   - Decides: skip | short-note | full-letter
   - Generates cover letter content (Pro feature)
   - Addresses specific gaps

---

## Testing Strategy: Free Plan Features

### Phase 1: Job Analysis Testing

#### Test Dataset Needed
Create 5-10 test cases covering:
1. **High Fit Match** (score 80-95)
   - User has most required skills
   - Experience level matches
   - Domain knowledge clear

2. **Medium Fit Match** (score 60-79)
   - Some skill gaps
   - Experience level close but not perfect
   - Domain transferable

3. **Low Fit Match** (score 40-59)
   - Major skill gaps
   - Experience mismatch
   - Domain stretch

4. **Poor Fit** (score <40)
   - Missing core requirements
   - Seniority mismatch
   - Wrong domain

5. **Edge Cases**
   - Job description missing company/location
   - Very short JD
   - Very long JD (5000+ words)
   - Resume with no work experience (entry-level)

#### What to Test
For each test case:
```
Input:
- Job description (paste real JD from Indeed/LinkedIn)
- Resume data (JSON from parsed resume)

Expected Output:
- job_metadata: { title, company, location, type, seniority_level }
- overall_score: 0-100
- sub_scores: { skills, experience, domain }
- verdict: "apply" | "low-priority" | "skip"
- matched_skills: [{ skill, evidence_from_resume }]

Quality Checks:
✓ Is overall_score reasonable?
✓ Are sub_scores aligned with actual match?
✓ Is verdict consistent with score?
✓ Are matched_skills accurate (not hallucinated)?
✓ Is evidence actually from the resume?
```

#### Testing Checklist
- [ ] Run 10 job analyses with real JDs
- [ ] Verify scores are reasonable
- [ ] Check matched skills are accurate
- [ ] Validate verdict matches score
- [ ] Test with missing resume data
- [ ] Test with incomplete JD
- [ ] Measure response time (<5 seconds)

---

### Phase 2: Resume Tailoring Testing

#### Test Dataset Needed
Use same job analyses from Phase 1, then tailor resumes.

#### What to Test
For each tailoring:
```
Input:
- Resume data (JSON)
- Analysis data (from Phase 1)

Expected Output:
- tailored_summary: "2-3 sentence summary"
- tailored_bullets: [{ original, tailored, reason }]
- reordered_skills: [ordered skill list]
- ats_check: { passed, issues, keywords_matched, keywords_missing }
- tone_check: { passed, flags }
- estimated_score_improvement: number

Quality Checks:
✓ Does tailored_summary match the role?
✓ Are bullet rewrites grounded in original resume?
✓ Do bullets still sound human (not AI spam)?
✓ Are metrics/achievements preserved?
✓ Are skills reordered logically?
✓ Are ATS keywords relevant?
```

#### Testing Checklist
- [ ] Run 5 tailoring tests
- [ ] Verify bullets stay grounded
- [ ] Check tone is human
- [ ] Validate ATS keywords match JD
- [ ] Ensure no fabricated achievements
- [ ] Test with minimal resume data
- [ ] Measure response time (<8 seconds)

---

### Phase 3: Cover Letter Verdict Testing

#### Test Dataset Needed
Same analyses from Phase 1.

#### What to Test
For each cover letter triage:
```
Input:
- Analysis data

Expected Output:
- recommendation: "skip" | "short-note" | "full-letter"
- reasoning: "Why this recommendation"
- content: "" (empty for free tier)
- key_points_addressed: []

Quality Checks:
✓ Is recommendation aligned with fit score?
✓ Is reasoning clear and helpful?
✓ For free tier, content should be empty
```

#### Testing Checklist
- [ ] Run 5 cover letter verdicts
- [ ] Verify recommendation logic
- [ ] Check reasoning is helpful
- [ ] Confirm free tier gets verdict only
- [ ] Test edge cases (very high/low fit)

---

## AI Prompt Tuning Recommendations

### 1. Job Analysis Prompt Improvements

**Current Issues to Watch:**
- Over-optimistic scoring (inflating matches)
- Hallucinated evidence (claiming skills not in resume)
- Generic verdicts without nuance

**Tuning Suggestions:**
```typescript
// Add to analyze.ts prompt:
"CRITICAL RULES:
1. NEVER invent skills or experience not explicitly in the resume
2. If unsure about a match, score conservatively
3. Matched skills MUST have direct evidence from resume
4. Verdict reasoning must reference specific gaps or strengths
5. If resume is missing, overall_score should be < 50 and note 'estimate only'"
```

**Add Quality Gates:**
```typescript
// After AI response, validate:
- matched_skills.length <= actual skills in resume
- Evidence strings actually appear in resume data
- overall_score = weighted average of sub_scores
- verdict aligns with score thresholds
```

---

### 2. Resume Tailoring Prompt Improvements

**Current Issues to Watch:**
- AI inventing metrics/achievements
- Over-keyword-stuffing (sounds robotic)
- Losing user's authentic voice

**Tuning Suggestions:**
```typescript
// Add to tailor.ts prompt:
"CRITICAL RULES:
1. NEVER add metrics not in the original bullet
2. NEVER invent technologies or tools not mentioned
3. Keep 80% of original wording when possible
4. If a bullet is already strong, minimal edits
5. Flag any rewrite that sounds like ChatGPT wrote it"
```

**Add Quality Gates:**
```typescript
// After AI response, validate:
- No new company names appear in bullets
- No new metrics appear (can reorder/rephrase existing)
- Tailored bullets are < 2x length of original
- tone_check.passed === true OR has specific flags
```

---

### 3. Cover Letter Verdict Improvements

**Current Issues to Watch:**
- Too many "full-letter" recommendations
- Generic reasoning

**Tuning Suggestions:**
```typescript
// Add to cover-letter.ts prompt:
"DECISION THRESHOLDS:
- score >= 80: SKIP (waste of time, apply directly)
- score 60-79 + gaps: SHORT-NOTE
- score < 60 BUT strategic role: FULL-LETTER
- score < 40: SKIP (not worth effort)

Reasoning must be specific: cite exact fit score, specific gap, or strategic reason."
```

---

## Testing Tools Setup

### 1. Create Test Harness
```bash
# Create test runner script
mkdir -p test-data/job-analyses
mkdir -p test-data/resumes
mkdir -p test-results
```

### 2. Test Data Format
```json
// test-data/job-analyses/test-case-1.json
{
  "name": "Senior React Engineer - High Fit",
  "job_description": "...",
  "resume_data": { ... },
  "expected": {
    "overall_score_range": [75, 90],
    "verdict": "apply",
    "matched_skills_min": 5
  }
}
```

### 3. Run Tests
```bash
# Pseudo-code for test runner
for each test_case in test-data/job-analyses/*
  POST /api/analyze with test_case.job_description + test_case.resume_data
  Compare response to test_case.expected
  Log pass/fail to test-results/
```

---

## Quality Metrics to Track

### Job Analysis Quality
- **Accuracy**: % of verdicts that match manual review
- **Evidence Grounding**: % of matched skills with valid resume evidence
- **Score Consistency**: Correlation between sub_scores and overall_score
- **Response Time**: p50, p95, p99 latency

### Resume Tailoring Quality
- **Authenticity**: % of bullets that preserve user's voice
- **Keyword Relevance**: % of ATS keywords actually in JD
- **Fabrication Rate**: % of tailored bullets with invented facts
- **Human Tone**: % passing tone_check

### Cover Letter Verdict Quality
- **Recommendation Alignment**: % of verdicts aligned with fit score
- **Reasoning Quality**: Subjective 1-5 rating

---

## Production Monitoring

### Track in Dashboard
1. **Usage Metrics**
   - Analyses run per day
   - Tailorings per day
   - Free tier limit hits

2. **Quality Metrics**
   - Avg fit score distribution
   - Verdict distribution (apply vs skip)
   - Tailoring acceptance rate (do users apply edits?)

3. **Error Tracking**
   - API failures
   - Gemini timeout rate
   - Invalid JSON responses
   - Validation failures

---

## Next Steps

### Week 1: Setup & Initial Testing
- [ ] Create 10 test job descriptions (real JDs)
- [ ] Create 3 test resumes (varied experience levels)
- [ ] Run 30 job analyses (10 JDs × 3 resumes)
- [ ] Document issues/patterns

### Week 2: Prompt Tuning
- [ ] Review analysis accuracy
- [ ] Tune scoring thresholds
- [ ] Add validation rules
- [ ] Re-test with tuned prompts

### Week 3: Tailoring Testing
- [ ] Run 15 tailoring tests
- [ ] Check for fabrication
- [ ] Validate tone quality
- [ ] Tune tailoring prompt

### Week 4: Production Readiness
- [ ] Set up monitoring
- [ ] Add error handling
- [ ] Create fallback responses
- [ ] Deploy with feature flags

---

## Ready to Start Testing?

Would you like me to:
1. **Create test job descriptions** (I can draft 5-10 realistic JDs)
2. **Create test resume data** (mock parsed resume JSON)
3. **Build a test runner script** (automated testing)
4. **Run live tests** (actually call the API endpoints)

Or would you prefer to manually test the live site first?
