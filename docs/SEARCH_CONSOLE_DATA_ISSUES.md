# Google Search Console Data Issues & Logging Errors

**Last Updated:** May 1, 2026  
**Status:** Historical Record of Known Data Anomalies

## Overview
This document tracks confirmed logging errors and data issues affecting Google Search Console performance reporting for this property.

---

## Critical Issues

### 1. **Job Listing & Job Details Search Appearance Logging Error**
**Duration:** April 16 – April 27, 2026 (12 days)  
**Affected Metrics:**
- Impressions (Job listing search appearance)
- Clicks (Job listing search appearance)
- Impressions (Job details search appearance)
- Clicks (Job details search appearance)

**Impact:** Data logging only — Search Console could not report performance metrics for these schema types during this window.

**Status:** ✅ Resolved as of April 28, 2026

**Action Items:**
- [ ] Verify Job listing & Job details schema markup is still correctly implemented
- [ ] Monitor April 28 onwards for normal reporting
- [ ] Reconcile expected vs. actual traffic for this period using analytics

---

### 2. **Impression Logging Error (Extended)**
**Duration:** May 13, 2025 – April 27, 2026 (349 days)  
**Affected Metrics:**
- Impressions (all types) — **significantly underreported**
- CTR (calculated metric, affected by impression undercount)
- Average Position (calculated metric, affected by impression undercount)

**NOT Affected:**
- Clicks (accurate)

**Impact:** 
- Impression counts are artificially low for this entire period
- CTR appears artificially high (same clicks ÷ lower impressions)
- Average position metrics may be skewed

**Status:** ✅ Resolved as of April 27, 2026

**Implications for Analysis:**
- Performance reports before May 13, 2025 and after April 28, 2026 are reliable
- Any year-over-year comparisons involving this period should account for this undercount
- Organic traffic may have been higher than reported
- Recommendations and feature optimization decisions made during this period may have been based on incomplete data

---

### 3. **Missing Bulk Data Exports**
**Duration:** February 28 & March 1, 2026 (2 days)  
**Affected Data:**
- Bulk data exports for all properties during these dates

**Status:** ⚠️ Unrecoverable

**Impact:**
- Historical data for Feb 28 – Mar 1 cannot be exported
- Analytics for this 2-day window incomplete in bulk exports
- Manual reporting required if data from these dates is critical

---

## Recommendations

### Short-term
1. ✅ Document these issues for stakeholder awareness
2. Review performance trends starting April 28, 2026 (when logging was fixed)
3. Validate Job listing schema continues to render and report correctly

### Medium-term
1. Reconcile organic traffic (Google Analytics 4) with Search Console clicks for April 16–27
2. Analyze click data against impression undercount (May 13, 2025 – April 27, 2026)
3. Identify which pages/queries were most affected

### Long-term
1. Set up Search Console monitoring for recurring logging anomalies
2. Document baseline expectations for Job listing/details schema coverage
3. Establish quarterly data audits to catch anomalies early

---

## Reference
- **Source:** Google Search Console Performance Reports
- **Reported:** May 1, 2026
- **Related Files:**
  - [SEARCH_CONSOLE_GUIDE.md](SEARCH_CONSOLE_GUIDE.md)
  - [SEO_AUDIT_index_and_blog.md](../SEO_AUDIT_index_and_blog.md)
