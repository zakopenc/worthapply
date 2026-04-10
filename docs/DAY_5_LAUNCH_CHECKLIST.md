# Day 5: Launch & Monitor - Complete Checklist

## 🎯 Priority Pages for Google Search Console Submission

### New SEO Pages (Submit These First)

#### Blog Pages
1. **Blog Index**: `https://worthapply.com/blog`
2. **WorthApply vs Jobscan**: `https://worthapply.com/blog/worthapply-vs-jobscan`
3. **WorthApply vs Teal**: `https://worthapply.com/blog/worthapply-vs-teal`
4. **WorthApply vs Rezi**: `https://worthapply.com/blog/worthapply-vs-rezi`

#### Optimized Tools Page
5. **ATS Checker**: `https://worthapply.com/tools/ats-checker`

#### Infrastructure
6. **Sitemap**: `https://worthapply.com/sitemap.xml`

---

## 📝 Step 1: Submit to Google Search Console

### Option A: Bulk Sitemap Submission (Recommended)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select property: `worthapply.com`
3. Navigate to **Sitemaps** (left sidebar)
4. Enter sitemap URL: `https://worthapply.com/sitemap.xml`
5. Click **Submit**

✅ **Result**: All blog pages + ATS checker will be discovered automatically

### Option B: Individual URL Inspection (For Priority Pages)
For immediate indexing of high-priority pages:

1. Go to **URL Inspection** tool
2. Enter URL (e.g., `https://worthapply.com/blog/worthapply-vs-jobscan`)
3. Click **Test Live URL**
4. Click **Request Indexing**
5. Repeat for all 5 priority URLs above

⏱️ **Timeline**: 
- Sitemap discovery: 1-3 days
- Manual indexing request: 1-7 days (varies)
- Full indexing: 1-2 weeks

---

## 📊 Step 2: Verify Structured Data

### Check Schema.org Markup
Use Google's Rich Results Test:

1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Test these URLs:
   - `https://worthapply.com/blog/worthapply-vs-jobscan` (BlogPosting + FAQPage)
   - `https://worthapply.com/blog/worthapply-vs-teal` (BlogPosting + FAQPage)
   - `https://worthapply.com/blog/worthapply-vs-rezi` (BlogPosting + FAQPage)
   - `https://worthapply.com/tools/ats-checker` (FAQPage - 8 questions)

✅ **Expected Results**:
- ✅ BlogPosting schema detected
- ✅ FAQPage schema detected
- ✅ No errors or warnings

---

## 🎯 Step 3: Set Up Rank Tracking

### Recommended Tools (Choose One)

#### Free Options:
- **Google Search Console** (built-in, 16-month history)
- **Google Analytics 4** (track organic landing pages)

#### Paid Options:
- **Ahrefs** ($99/mo) - Most comprehensive
- **SEMrush** ($119/mo) - Good all-rounder
- **Mangools KWFinder** ($29/mo) - Budget-friendly

### Target Keywords to Track

#### ATS Checker Page:
1. `free ats checker`
2. `ats resume checker`
3. `ats scanner free`
4. `resume ats check`
5. `is my resume ats friendly`

#### Comparison Articles:
1. `worthapply vs jobscan`
2. `worthapply vs teal`
3. `worthapply vs rezi`
4. `jobscan alternative`
5. `best resume checker`
6. `ats checker comparison`

### Track These Metrics:
- **Position**: Where you rank (goal: top 10 = page 1)
- **Impressions**: How often you appear in search
- **Clicks**: How many people click
- **CTR**: Click-through rate (goal: 3-5% average)

---

## 📈 Step 4: Document Baseline Metrics

### Current State (April 6, 2026)

#### Content Published:
- ✅ 3 comparison articles (~38,000 words total)
- ✅ 1 optimized ATS checker page
- ✅ Blog index page
- ✅ Full sitemap with all pages

#### Technical SEO:
- ✅ FAQPage schema on all comparison articles (5+ questions each)
- ✅ FAQPage schema on ATS checker (8 questions)
- ✅ BlogPosting schema on all articles
- ✅ Internal linking between comparisons
- ✅ Quick Answer sections for featured snippets
- ✅ Comparison tables

#### Pages in Sitemap:
```
Total URLs: ~20-25 pages
Priority Pages:
  - Homepage (1.0)
  - Pricing (0.9)
  - ATS Checker (0.8)
  - Blog Index (0.7)
  - Blog Posts (0.6-0.7)
```

---

## 🔍 Step 5: Monitor & Track Progress

### Week 1 (Days 1-7): Initial Crawling
**Expected**: Google discovers sitemap and starts crawling

**Check Daily**:
- [ ] Google Search Console → Coverage → Check for new pages indexed
- [ ] URL Inspection → Verify pages are "URL is on Google"

**Actions**:
- If pages not discovered after 3 days, manually request indexing
- Check for any crawl errors in GSC

### Week 2 (Days 8-14): Initial Rankings
**Expected**: Pages start appearing in search results (position 50-100)

**Check Weekly**:
- [ ] Search Console → Performance → Filter by page
- [ ] Look for impressions (even if no clicks yet)
- [ ] Check "Search Appearance" for rich results

### Week 3-4 (Days 15-30): Ranking Movement
**Expected**: Rankings improve to page 2-3 (position 11-30)

**Target Goals**:
- [ ] 100+ impressions per week for ATS checker
- [ ] 10+ impressions per comparison article
- [ ] At least 1 FAQ rich result appearing

### Month 2-3: Optimization Phase
**Expected**: Some keywords reach page 1 (position 1-10)

**Actions**:
- Analyze which keywords are close to page 1 (position 11-15)
- Add more internal links to those pages
- Update content based on search queries showing in GSC
- Consider adding more comparison articles

---

## 🎨 Bonus: Create Tracking Spreadsheet

### Google Sheets Template

**Tab 1: Keywords**
| Keyword | Target Page | Current Position | Date Checked | Notes |
|---------|-------------|------------------|--------------|-------|
| free ats checker | /tools/ats-checker | Not ranked yet | 2026-04-06 | Just launched |
| worthapply vs jobscan | /blog/worthapply-vs-jobscan | Not ranked yet | 2026-04-06 | Just launched |

**Tab 2: Page Performance**
| URL | Impressions | Clicks | CTR | Avg Position | Date |
|-----|-------------|--------|-----|--------------|------|
| /blog/worthapply-vs-jobscan | 0 | 0 | 0% | - | 2026-04-06 |

**Tab 3: Indexing Status**
| URL | Indexed? | Date Submitted | Date Indexed | Schema Valid? |
|-----|----------|----------------|--------------|---------------|
| /blog | No | 2026-04-06 | Pending | N/A |

---

## ⚠️ Common Issues & Solutions

### Issue: Pages Not Indexed After 7 Days
**Solutions**:
1. Manually request indexing via URL Inspection tool
2. Check `robots.txt` isn't blocking pages
3. Verify internal links point to new pages
4. Check for canonical tag issues

### Issue: Schema Validation Errors
**Solutions**:
1. Run Rich Results Test
2. Check JSON-LD syntax
3. Verify all required fields present
4. Test on live URL (not localhost)

### Issue: No Impressions After 2 Weeks
**Solutions**:
1. Check if pages are indexed (Search Console → Coverage)
2. Verify keywords have search volume (use Google Keyword Planner)
3. Add more internal links from homepage/pricing
4. Check competition (search your target keywords manually)

---

## 🚀 Quick Win Actions (Do These Now)

### Immediate (Today):
1. [ ] Submit sitemap to Google Search Console
2. [ ] Request indexing for 5 priority pages
3. [ ] Test structured data with Rich Results Test
4. [ ] Screenshot current GSC state (for baseline)

### This Week:
5. [ ] Share blog posts on LinkedIn/Twitter
6. [ ] Add internal links to blog posts from homepage
7. [ ] Monitor GSC daily for indexing status
8. [ ] Set up Google Analytics 4 goals for signup conversions

### This Month:
9. [ ] Add "Related Articles" widget to blog posts
10. [ ] Write 2-3 more comparison articles
11. [ ] Add blog content to weekly newsletter
12. [ ] Monitor rankings and optimize based on queries

---

## 📊 Success Criteria (30 Days)

### Minimum Goals:
- ✅ All 5 pages indexed in Google
- ✅ 50+ organic impressions per week
- ✅ At least 1 FAQ rich result showing
- ✅ Blog posts appearing in brand searches

### Stretch Goals:
- 🎯 1+ keyword in top 20 (page 1-2)
- 🎯 100+ organic impressions per week
- 🎯 3+ clicks per week from organic
- 🎯 5+ backlinks to blog content

---

## 📞 Support Resources

- **Google Search Console Help**: https://support.google.com/webmasters
- **Structured Data Testing**: https://search.google.com/test/rich-results
- **Schema.org Docs**: https://schema.org/
- **SEO Community**: r/SEO, r/TechSEO on Reddit

---

**Last Updated**: April 6, 2026  
**Status**: ✅ Day 1-4 Complete, Ready for Launch  
**Next Action**: Submit sitemap to Google Search Console
