import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker - Scan Your Resume in Seconds | WorthApply',
  description: 'Free ATS-friendly resume checker. Scan your resume instantly to see if it passes Applicant Tracking Systems. Get specific fixes for formatting, keywords, and structure. No signup required.',
  keywords: [
    'free ats checker',
    'ats resume checker',
    'ats scanner',
    'resume ats check',
    'applicant tracking system checker',
    'ats-friendly resume',
    'resume scanner free',
  ],
  openGraph: {
    title: 'Free ATS Resume Checker - Instant Scan | WorthApply',
    description: 'Check if your resume is ATS-friendly in seconds. Free unlimited scans, instant feedback, and specific optimization tips.',
    type: 'website',
  },
};

export default function ATSCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // FAQ Schema for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is an ATS resume checker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An ATS (Applicant Tracking System) resume checker is a tool that scans your resume to see if it will pass through automated screening systems used by employers. It checks for formatting issues, keyword optimization, and structural problems that could cause your resume to be rejected before a human ever sees it.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does an ATS scanner work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ATS scanners parse resume content by looking for standard sections (Experience, Education, Skills), extracting contact information, and matching keywords from the job description. They score resumes based on keyword relevance, formatting cleanliness, and how well the content matches required qualifications.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this ATS checker free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! WorthApply\'s ATS resume checker is completely free with unlimited scans. No credit card required, no signup needed. You can check as many resumes as you want.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate is the ATS checker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our ATS checker uses the same parsing algorithms as major Applicant Tracking Systems like Greenhouse, Lever, and Workday. While no checker is 100% perfect (each ATS is slightly different), our tool identifies the most common issues that cause resumes to be rejected by automated systems.',
        },
      },
      {
        '@type': 'Question',
        name: 'What makes a resume ATS-friendly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An ATS-friendly resume has clean formatting (no tables, text boxes, or images), standard section headings (Experience, Education, Skills), uses common fonts, includes relevant keywords from the job description, and is saved in a compatible format (.docx or .pdf). Avoid graphics, columns, and creative formatting that ATS cannot parse.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does the ATS scan take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The ATS scan completes in about 10 seconds. Upload your resume or paste the text, and you\'ll immediately see your ATS compatibility score plus specific recommendations for improvement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I check multiple resume versions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Run unlimited ATS checks for free. Test different versions, update your resume based on feedback, and re-scan as many times as needed until you achieve a high compatibility score.',
        },
      },
      {
        '@type': 'Question',
        name: 'What ATS score should I aim for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Aim for an ATS score of 80+. Scores above 80 indicate your resume will likely pass automated screening. Scores of 90+ are excellent and show strong keyword optimization and clean formatting. Below 70, you should make significant improvements before applying.',
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="ats-checker-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
