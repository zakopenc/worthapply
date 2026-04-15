import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/home/zak/projects/worthapply';
const read = (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');

const plans = await import(path.join(root, 'src/lib/plans.ts'));

assert.equal(plans.getFeatureAccess('pro').docx_download, true, 'Pro should keep DOCX downloads enabled.');
assert.equal(plans.getFeatureAccess('premium').docx_download, true, 'Premium should keep DOCX downloads enabled.');
assert.equal(plans.getFeatureAccess('premium').cover_letter_generation, true, 'Premium should keep cover letter generation enabled.');

const tailorPage = await read('src/app/(app)/tailor/page.tsx');
assert.ok(
  !tailorPage.includes("plan: plan === 'premium' ? 'pro' : plan"),
  'Tailor page should preserve the premium plan instead of downgrading it to pro in the client payload.'
);

const coverLetterClient = await read('src/app/(app)/cover-letter/CoverLetterClient.tsx');
assert.ok(
  coverLetterClient.includes("const isPaid = plan === 'pro' || plan === 'premium' || plan === 'lifetime';"),
  'Cover letter client should unlock full draft + downloads for premium users as well as pro/lifetime users.'
);
assert.ok(
  coverLetterClient.includes('Download PDF'),
  'Cover letter workspace should offer PDF downloads for paid users.'
);

const applicationWorkspace = await read('src/app/(app)/applications/[id]/page.tsx');
assert.ok(
  applicationWorkspace.includes('Download tailored PDF'),
  'Application workspace should expose tailored resume PDF downloads when tailored content exists.'
);
assert.ok(
  applicationWorkspace.includes('Download cover letter PDF'),
  'Application workspace should expose cover letter PDF downloads when cover letters exist.'
);

console.log('download gating checks passed');
