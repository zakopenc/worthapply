# WorthApply Manual Testing Session #1

**Date:** 2026-04-01  
**Tester:** Penny (AI Assistant)  
**Test Account:** test.worthapply.2026@gmail.com  
**Test Plan:** Free Plan Feature Testing

---

## Test Results

### ✅ Phase 1: Account Creation & Onboarding

#### 1.1 Homepage Load
- **Status:** ✅ PASS
- **URL:** https://worthapply.com
- **Observations:**
  - New homepage messaging visible
  - "Stop guessing which jobs are worth applying to" headline active
  - Trust strip showing
  - Hero CTA: "Analyze a job free" working
  - All sections loading correctly

#### 1.2 Signup Flow
- **Status:** ✅ PASS
- **Test Data:**
  - Name: Test User
  - Email: test.worthapply.2026@gmail.com
  - Password: TestPassword123!
- **Observations:**
  - Signup form accessible
  - Email/password fields working
  - Google OAuth button present
  - Account created successfully
  - Email verification required ✓ (security best practice)

#### 1.3 Email Verification
- **Status:** ⏸️ BLOCKED
- **Reason:** Need access to email to verify account
- **Next Step:** Use real email address OR disable email verification in Supabase for testing

---

## Testing Continuation Options

### Option A: Use Real Email for Testing
**Recommended for comprehensive testing**

Steps:
1. Create new account with accessible email
2. Verify email
3. Complete onboarding
4. Test all free features end-to-end

Email options:
- Your personal email
- Create temp email at temp-mail.org
- Use Gmail/Outlook test account

### Option B: Disable Email Verification (Dev/Test Only)
**For faster iteration testing**

Supabase settings to change:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Set "Confirm your signup" to disabled OR
3. Use Supabase local dev with auto-confirm

⚠️ **Warning:** Don't disable in production!

### Option C: Manual Database Insert (Advanced)
**Skip signup, insert user directly**

```sql
-- Insert test user directly into Supabase
-- Mark email as verified
-- This bypasses the normal flow
```

---

## Free Plan Features to Test (Once Logged In)

### Test Case 1: Job Analysis (3/month limit)

**Preparation:**
- Need 1-2 test job descriptions
- Need 1 test resume uploaded

**Test Steps:**
1. Navigate to /analyzer
2. Upload resume (or use existing)
3. Paste job description
4. Click "Analyze job"
5. Wait for AI response

**Expected Output:**
```json
{
  "job_metadata": {
    "title": "Senior React Engineer",
    "company": "Tech Corp",
    "location": "Remote",
    "type": "full-time",
    "seniority_level": "Senior"
  },
  "overall_score": 75,
  "sub_scores": {
    "skills": 80,
    "experience": 70,
    "domain": 75
  },
  "verdict": "apply",
  "matched_skills": [
    {
      "skill": "React",
      "evidence_from_resume": "3 years building React SPAs"
    }
  ]
}
```

**Quality Checks:**
- [ ] Score is reasonable (0-100)
- [ ] Verdict matches score
- [ ] Matched skills are accurate
- [ ] Evidence is from actual resume
- [ ] No hallucinated skills
- [ ] Response time < 5 seconds

**Limit Test:**
- [ ] Run 4th analysis
- [ ] Should see "Free plan limit reached (3 analyses/month)"
- [ ] Should see upgrade prompt

---

### Test Case 2: Resume Tailoring (2/month limit)

**Preparation:**
- Need completed job analysis from Test Case 1
- Resume must be uploaded

**Test Steps:**
1. From job analysis, click "Tailor resume"
2. Wait for AI tailoring response
3. Review suggested edits

**Expected Output:**
```json
{
  "tailored_summary": "Senior software engineer with 5 years...",
  "tailored_bullets": [
    {
      "original": "Built web applications",
      "tailored": "Architected React-based web applications serving 100k+ users",
      "reason": "Added specificity and metrics for senior role"
    }
  ],
  "reordered_skills": ["React", "TypeScript", "Node.js"],
  "ats_check": {
    "passed": true,
    "keywords_matched": ["React", "TypeScript"],
    "keywords_missing": ["Kubernetes"]
  }
}
```

**Quality Checks:**
- [ ] Summary is tailored to role
- [ ] Bullets stay grounded (no fabrication)
- [ ] Tone is human (not robotic)
- [ ] Metrics are preserved
- [ ] ATS keywords match job description
- [ ] Response time < 8 seconds

**Limit Test:**
- [ ] Run 3rd tailoring
- [ ] Should see "Free plan limit reached (2 tailorings/month)"
- [ ] Should see upgrade prompt

---

### Test Case 3: ATS Checker

**Test Steps:**
1. Upload resume
2. System automatically runs ATS check
3. Review ATS feedback

**Expected Output:**
- ATS compatibility score
- Format warnings (if any)
- Basic keyword analysis

**Quality Checks:**
- [ ] Detects common ATS issues
- [ ] Keyword suggestions relevant
- [ ] No false positives

---

### Test Case 4: Application Tracker (8 jobs limit)

**Test Steps:**
1. Navigate to /tracker
2. Add a job to tracker
3. Update status
4. Add notes
5. Repeat until 8 jobs tracked

**Quality Checks:**
- [ ] Jobs display correctly
- [ ] Status updates save
- [ ] Notes persist
- [ ] Can edit/delete jobs

**Limit Test:**
- [ ] Try to add 9th job
- [ ] Should see "Free plan limit reached (8 tracked jobs)"
- [ ] Should see upgrade prompt

---

### Test Case 5: Cover Letter Verdict

**Test Steps:**
1. From job analysis, request cover letter verdict
2. Review verdict and reasoning

**Expected Output:**
```json
{
  "recommendation": "short-note",
  "reasoning": "Medium fit (72%) with some gaps to address",
  "content": "",
  "key_points_addressed": []
}
```

**Quality Checks:**
- [ ] Recommendation aligns with fit score
- [ ] Reasoning is specific
- [ ] Content is empty (free tier)
- [ ] No generation attempted

---

### Test Case 6: Evidence Bank (15 items limit)

**Test Steps:**
1. Navigate to evidence bank
2. Add achievements/metrics
3. Tag by category
4. Try to add 16th item

**Quality Checks:**
- [ ] Items save correctly
- [ ] Tags work
- [ ] Can edit/delete items

**Limit Test:**
- [ ] 16th item blocked
- [ ] Upgrade prompt shown

---

## AI Quality Testing Checklist

### Job Analysis AI
- [ ] Accurately parses job title/company
- [ ] Scores are reasonable and consistent
- [ ] Verdict aligns with score thresholds
- [ ] Matched skills have valid evidence
- [ ] No hallucinated experience
- [ ] Missing skills (Pro) properly gated

### Resume Tailoring AI
- [ ] Edits stay grounded in resume
- [ ] No fabricated metrics
- [ ] Tone sounds human
- [ ] Keywords match job description
- [ ] ATS check is helpful
- [ ] Natural Voice Pass (Pro) properly gated

### Cover Letter AI
- [ ] Verdict logic is sound
- [ ] Reasoning is specific
- [ ] Generation (Pro) properly gated

---

## Issues Found

### Blockers
1. ⏸️ Email verification required for testing
   - **Impact:** Cannot proceed past signup
   - **Fix:** Use real email or disable verification

### Bugs
_(To be filled during testing)_

### Enhancement Opportunities
_(To be filled during testing)_

---

## Sample Test Data

### Test Job Description #1: Senior React Engineer
```
Title: Senior React Engineer
Company: Tech Innovations Inc.
Location: Remote (US)
Type: Full-time

We're looking for a Senior React Engineer to join our product team. You'll work on our customer-facing SaaS platform serving 500k+ users.

Requirements:
- 5+ years of software development experience
- 3+ years with React and modern JavaScript
- Experience with TypeScript, Redux, and REST APIs
- Strong understanding of web performance optimization
- Experience with CI/CD pipelines
- Excellent communication skills

Nice to have:
- Experience with Next.js
- Knowledge of GraphQL
- AWS or cloud platform experience
- Previous SaaS product experience

Responsibilities:
- Build and maintain core product features
- Collaborate with designers and backend engineers
- Optimize application performance
- Participate in code reviews
- Mentor junior engineers
```

### Test Resume #1: Mid-Senior Frontend Engineer
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "summary": "Frontend engineer with 4 years of experience building modern web applications with React and TypeScript.",
  "experience": [
    {
      "title": "Frontend Engineer",
      "company": "StartupCo",
      "duration": "2022 - Present",
      "bullets": [
        "Built customer dashboard with React and TypeScript serving 50k users",
        "Reduced page load time by 40% through code splitting and lazy loading",
        "Implemented REST API integration with Redux state management",
        "Collaborated with design team on component library"
      ]
    },
    {
      "title": "Junior Frontend Developer",
      "company": "WebAgency",
      "duration": "2020 - 2022",
      "bullets": [
        "Developed responsive websites using React and vanilla JavaScript",
        "Worked on 15+ client projects across various industries",
        "Improved test coverage from 30% to 75% using Jest and React Testing Library"
      ]
    }
  ],
  "skills": ["React", "TypeScript", "JavaScript", "Redux", "HTML/CSS", "Git", "Jest", "REST APIs"],
  "education": {
    "degree": "BS Computer Science",
    "school": "State University",
    "year": 2020
  }
}
```

**Expected Analysis:**
- Overall Score: ~75-80 (good fit)
- Skills: ~85 (strong React/TS match)
- Experience: ~70 (4 years vs 5+ required)
- Domain: ~75 (some SaaS experience)
- Verdict: "apply" or "low-priority"

---

## Next Steps

1. **Choose testing approach:**
   - Option A: Use real email
   - Option B: Disable email verification
   - Option C: Manual DB insert

2. **Complete onboarding**

3. **Run through all 6 test cases**

4. **Document AI output quality**

5. **Identify prompt tuning opportunities**

6. **Move to Pro feature testing**

---

## Test Session Ready

I've prepared:
- Test account credentials
- Sample job description
- Sample resume data
- Comprehensive test checklist
- Quality evaluation criteria

**What would you like to do next?**

1. Provide a real email for me to use for testing
2. Tell me how to disable email verification in your Supabase
3. You manually test and share screenshots/results
4. Focus on specific feature first
