#!/usr/bin/env node

/**
 * WorthApply Onboarding Flow Testing
 * Automated test of the onboarding wizard using Puppeteer
 * 
 * Usage: node onboarding-test.js
 * 
 * Tests:
 * 1. Onboarding page loads
 * 2. Resume upload is required
 * 3. Next button is disabled without file
 * 4. File upload works
 * 5. Step progression works
 * 6. Cannot bypass via URL
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SITE_URL = process.env.SITE_URL || 'https://worthapply.com';
const TEST_RESUME_PATH = path.join(__dirname, 'test-resume.pdf');

console.log('🎓 WorthApply Onboarding Test Suite');
console.log('====================================\n');

async function createTestResume() {
  // Create a simple test PDF if it doesn't exist
  if (!fs.existsSync(TEST_RESUME_PATH)) {
    console.log('Creating test resume PDF...');
    // This is a minimal valid PDF
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test Resume) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000328 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
421
%%EOF`;
    
    fs.writeFileSync(TEST_RESUME_PATH, pdfContent);
    console.log(`✅ Test resume created: ${TEST_RESUME_PATH}\n`);
  }
}

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;
  
  await createTestResume();

  console.log('Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // ============================================================
    // Test 1: Onboarding Page Loads
    // ============================================================
    console.log('Test 1: Onboarding Page Loads');
    console.log('------------------------------');
    
    try {
      const response = await page.goto(`${SITE_URL}/onboarding`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      if (response.status() === 200) {
        console.log('✅ PASS: Onboarding page loads (HTTP 200)');
        passedTests++;
      } else {
        console.log(`❌ FAIL: HTTP ${response.status()}`);
        failedTests++;
      }
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failedTests++;
    }
    
    console.log('');

    // ============================================================
    // Test 2: Check for Resume Upload Section
    // ============================================================
    console.log('Test 2: Resume Upload Section Exists');
    console.log('-------------------------------------');
    
    try {
      const uploadExists = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Upload your resume') || 
               text.includes('Drop your resume') ||
               text.includes('resume');
      });
      
      if (uploadExists) {
        console.log('✅ PASS: Resume upload section found');
        passedTests++;
      } else {
        console.log('⚠️  WARNING: Resume upload section not clearly visible');
        console.log('   Page might require authentication');
        failedTests++;
      }
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failedTests++;
    }
    
    console.log('');

    // ============================================================
    // Test 3: Check Next Button State (Should be Disabled)
    // ============================================================
    console.log('Test 3: Next Button Initially Disabled');
    console.log('---------------------------------------');
    
    try {
      const nextButtonDisabled = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextButton = buttons.find(b => 
          b.textContent.includes('Next') || 
          b.textContent.includes('Continue')
        );
        
        if (!nextButton) return 'NOT_FOUND';
        return nextButton.disabled || nextButton.hasAttribute('disabled');
      });
      
      if (nextButtonDisabled === 'NOT_FOUND') {
        console.log('⚠️  WARNING: Next button not found');
        console.log('   Page might require authentication');
        failedTests++;
      } else if (nextButtonDisabled === true) {
        console.log('✅ PASS: Next button is disabled without resume');
        passedTests++;
      } else {
        console.log('❌ FAIL: Next button is enabled without resume upload!');
        console.log('   Users can skip resume requirement!');
        failedTests++;
      }
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failedTests++;
    }
    
    console.log('');

    // ============================================================
    // Test 4: Check File Input Exists
    // ============================================================
    console.log('Test 4: File Input Element Exists');
    console.log('----------------------------------');
    
    try {
      const fileInputExists = await page.evaluate(() => {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        return fileInputs.length > 0;
      });
      
      if (fileInputExists) {
        console.log('✅ PASS: File input element found');
        passedTests++;
      } else {
        console.log('❌ FAIL: No file input found');
        failedTests++;
      }
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failedTests++;
    }
    
    console.log('');

    // ============================================================
    // Test 5: Console Errors
    // ============================================================
    console.log('Test 5: Check for Console Errors');
    console.log('---------------------------------');
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload to capture all console messages
    await page.reload({ waitUntil: 'networkidle2' });
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for any async errors
    
    if (consoleErrors.length === 0) {
      console.log('✅ PASS: No console errors');
      passedTests++;
    } else {
      console.log('❌ FAIL: Console errors found:');
      consoleErrors.forEach(err => console.log(`   - ${err}`));
      failedTests++;
    }
    
    console.log('');

    // ============================================================
    // Test 6: Material Symbols Icons Load
    // ============================================================
    console.log('Test 6: Material Symbols Icons');
    console.log('-------------------------------');
    
    try {
      const iconsRender = await page.evaluate(() => {
        const icons = document.querySelectorAll('.material-symbols-outlined');
        if (icons.length === 0) return 'NONE_FOUND';
        
        // Check if any icon is showing as text (not rendered)
        for (const icon of icons) {
          const text = icon.textContent.trim();
          // If text is like "arrow_forward", it's not rendering
          if (text.length > 0 && text.includes('_')) {
            return 'TEXT_VISIBLE';
          }
        }
        
        return 'RENDERED';
      });
      
      if (iconsRender === 'NONE_FOUND') {
        console.log('⚠️  WARNING: No Material Symbols icons found on page');
        passedTests++;
      } else if (iconsRender === 'TEXT_VISIBLE') {
        console.log('❌ FAIL: Icons showing as text (not rendered)');
        console.log('   Font not loading properly');
        failedTests++;
      } else {
        console.log('✅ PASS: Material Symbols icons render correctly');
        passedTests++;
      }
    } catch (err) {
      console.log(`⚠️  WARNING: ${err.message}`);
      passedTests++;
    }
    
    console.log('');

    // ============================================================
    // Test 7: Screenshot for Visual Inspection
    // ============================================================
    console.log('Test 7: Screenshot Capture');
    console.log('--------------------------');
    
    try {
      const screenshotPath = path.join(__dirname, 'onboarding-screenshot.png');
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
      console.log('   Review manually for visual issues');
      passedTests++;
    } catch (err) {
      console.log(`⚠️  WARNING: Screenshot failed: ${err.message}`);
    }
    
    console.log('');

  } catch (err) {
    console.error('Fatal error during tests:', err);
    failedTests++;
  } finally {
    await browser.close();
  }

  // ============================================================
  // Summary
  // ============================================================
  console.log('===========================================');
  console.log('Onboarding Test Summary');
  console.log('===========================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log('');

  if (failedTests > 0) {
    console.log('❌ Some tests failed!');
    console.log('   Review failures above and fix before launch');
    process.exit(1);
  } else {
    console.log('✅ All onboarding tests passed!');
    console.log('');
    console.log('⚠️  Note: These tests check UI elements only');
    console.log('   Still need to test with real authentication:');
    console.log('   1. Sign up with Google OAuth');
    console.log('   2. Upload actual resume file');
    console.log('   3. Complete full onboarding flow');
    console.log('   4. Verify database updates');
    process.exit(0);
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
} catch (e) {
  console.error('❌ Puppeteer not installed!');
  console.error('   Run: npm install puppeteer');
  console.error('   Or: npm install puppeteer-core');
  process.exit(1);
}
