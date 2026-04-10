# WorthApply Free Plan Testing Guide

## Free Plan Feature Map

### 1. Job Analysis (3/month)
**What users get:**
- ✅ Overall fit score (0-100)
- ✅ Fit grade/verdict ("Worth applying", "Maybe", "Skip")
- ✅ Verdict reasoning
- ✅ Sub-scores: Skills, Experience, Domain
- ✅ Matched skills with evidence from resume
- ❌ Missing skills analysis (Pro only)
- ❌ Seniority match analysis (Pro only)
- ❌ Recruiter concerns (Pro only)

**API endpoint:** `/api/analyze`
**Implementation:** `src/app/api/analyze/route.ts`
**UI:** `src/app/(app)/analyzer/page.tsx`
**Prompt:** `src/lib/gemini/prompts/analyze.ts`

**What needs AI training:**
- Parse job description → extract: title, company, location, type, seniority level
- Parse resume data → extract: skills, experience, projects, metrics
- Generate fit score (0-100) based on:
  - Skills alignment
  - Experience relevance
  - Domain knowledge match
- Generate verdict: "Worth applying" | "Strong fit" | "Uncertain" | "Skip"
- Match user skills to job requirements with specific evidence
- Provide verdict reasoning

---

### 2. Resume Tailoring (2/month)
**What users get:**
- ✅ Basic tailoring (summary + bullet improvements)
- ✅ Role-specific rewrite suggestions
- ❌ Skills reordering (Pro only)
- ❌ ATS keyword injection (Pro only)
- ❌ ATS format check (Pro only)
- ❌ Natural Voice Pass (Pro only)
- ❌ Before/after score comparison (Pro only)
- ❌ DOCX download (Pro only)

**API endpoint:** `/api/tailor`
**Implementation:** `src/app/api/tailor/route.ts`
**UI:** `src/app/(app)/applications/[id]/page.tsx` (workspace)
**Prompt:** `src/lib/gemini/prompts/tailor.ts`

**What needs AI training:**
- Take user's resume + job description
- Generate improved professional summary
- Rewrite bullet points to:
  - Match job requirements
  - Highlight relevant achievements
  - Use stronger action verbs
  - Include metrics when available
- Keep suggestions grounded in user's actual experience
- Maintain human-sounding language (not robotic/keyword-stuffed)

---

### 3. ATS Checker (included in job analysis)
**What users get:**
- ✅ Basic ATS compatibility check
- ✅ Format warnings
- ❌ Detailed keyword optimization (Pro only)
- ❌ ATS keyword list (Pro only)

**Implementation:** Built into job analysis flow
**What needs AI training:**
- Detect ATS-unfriendly formatting (tables, columns, graphics)
- Flag missing keywords from job description
- Provide basic ATS readiness score

---

### 4. Application Tracking (8 jobs max)
**What users get:**
- ✅ Track up to 8 applications
- ✅ Status tracking (Applied, Interviewing, Offer, Rejected)
- ✅ Notes per application
- ❌ Ghost flag detection (Pro only)
- ❌ Follow-up alerts (Pro only)
- ❌ Interview stage tracking (Pro only)
- ❌ Resume version per app (Pro only)

**API endpoint:** `/api/applications`
**Implementation:** `src/app/api/applications/route.ts`
**UI:** `src/app/(app)/tracker/page.tsx`

**What needs AI training:**
- N/A - this is mostly CRUD operations
- No AI needed for basic tracking

---

### 5. Evidence Bank (15 items max)
**What users get:**
- ✅ Store up to 15 achievements/wins/metrics
- ✅ Tag by skill/category
- ✅ Reuse evidence across applications

**Implementation:** Likely in resume/profile data
**What needs AI training:**
- N/A - this is storage/retrieval
- Could use AI to suggest evidence categorization

---

### 6. Cover Letter (verdict only, no generation)
**What users get:**
- ✅ Cover letter fit verdict ("Write one" | "Skip it" | "Risky")
- ❌ Cover letter generation (Pro only)
- ❌ Cover letter editor (Pro only)

**API endpoint:** `/api/cover-letter`
**Implementation:** `src/app/api/cover-letter/route.ts`
**Prompt:** `src/lib/gemini/prompts/cover-letter.ts`

**What needs AI training:**
- Analyze job description + user profile
- Determine if cover letter is worth writing:
  - "Required" → strong recommendation
  - "Optional but valuable" → write one
  - "Not mentioned/standard role" → skip
- Return verdict with reasoning

---

## Testing Workflow for Free Plan

### Test Case 1: Job Analysis
**Steps:**
1. User uploads resume (or uses existing)
2. User pastes job description
3. Click "Analyze job"
4. System should return:
   - Overall score
   - Skills/Experience/Domain scores
   - Verdict
   - Matched skills with evidence
   - Job metadata (title, company, etc.)

**AI prompt testing focus:**
- Does it correctly parse job requirements?
- Does it match resume skills accurately?
- Is the verdict reasonable?
- Is the evidence mapping credible?

---

### Test Case 2: Resume Tailoring
**Steps:**
1. User has analyzed a job (from Test Case 1)
2. User navigates to workspace for that job
3. User requests tailoring
4. System should return:
   - Improved summary
   - Rewritten bullet points
   - Role-specific edits

**AI prompt testing focus:**
- Are edits grounded in user's real experience?
- Does language sound human (not AI-generated spam)?
- Are metrics/achievements preserved?
- Does it match job requirements?

---

### Test Case 3: ATS Check
**Steps:**
1. User uploads resume
2. System runs ATS compatibility check
3. System should flag:
   - Format issues (if any)
   - Basic keyword gaps
   - ATS readiness verdict

**AI prompt testing focus:**
- Does it detect common ATS blockers?
- Are keyword suggestions relevant?

---

### Test Case 4: Application Tracking
**Steps:**
1. User adds a job to tracker (manual or from analysis)
2. User updates status
3. User adds notes
4. System should:
   - Store job details
   - Track status changes
   - Show all tracked jobs

**AI prompt testing focus:**
- N/A - this is CRUD, no AI needed for free tier

---

### Test Case 5: Cover Letter Verdict
**Steps:**
1. User analyzes a job
2. User requests cover letter verdict
3. System should return:
   - "Write one" | "Skip it" | "Optional"
   - Reasoning for verdict

**AI prompt testing focus:**
- Does it correctly assess when a cover letter is needed?
- Is reasoning helpful?

---

## Limits Enforcement Testing

### Monthly Limit Tests
1. **Job Analysis Limit (3/month)**
   - Try to run 4th analysis in same month
   - Should see upgrade prompt

2. **Resume Tailoring Limit (2/month)**
   - Try to run 3rd tailoring in same month
   - Should see upgrade prompt

3. **Tracker Limit (8 jobs)**
   - Try to add 9th job to tracker
   - Should see upgrade prompt

4. **Evidence Bank Limit (15 items)**
   - Try to add 16th evidence item
   - Should see upgrade prompt

---

## AI Prompt Files to Review/Test

1. **Job Analysis Prompt**
   - `src/lib/gemini/prompts/analyze.ts`
   - Input: job description + resume data
   - Output: fit scores, verdict, matched skills

2. **Resume Tailoring Prompt**
   - `src/lib/gemini/prompts/tailor.ts`
   - Input: resume + job description + analysis
   - Output: summary + bullet rewrites

3. **Cover Letter Prompt**
   - `src/lib/gemini/prompts/cover-letter.ts`
   - Input: job description + user profile
   - Output: verdict + reasoning

---

## Next Steps for AI Training

1. **Review existing prompts** in `src/lib/gemini/prompts/`
2. **Test with real job descriptions** (3-5 different types)
3. **Verify output quality**:
   - Is fit score reasonable?
   - Are matched skills accurate?
   - Are tailoring suggestions credible?
4. **Tune prompts** based on test results
5. **Set up quality gates**:
   - Min/max score ranges
   - Evidence validation
   - Keyword matching thresholds

