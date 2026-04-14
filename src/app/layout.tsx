import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChatWidget } from "@/components/chat-widget";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#C17F3C' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1B1F' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.worthapply.com'),
  title: {
    default: "WorthApply — Know if you're the right fit, before you apply",
    template: '%s | WorthApply',
  },
  description:
    "Fit-first job search. Analyze your real fit for a role in 10 seconds before tailoring your resume. Evidence-based, no fabrication. Built for selective applicants targeting competitive roles.",
  keywords: [
    "job fit score",
    "resume tailoring",
    "ATS resume checker",
    "jobscan alternative",
    "should I apply for this job",
    "job application tracker",
    "cover letter generator",
    "fit-first job search",
    "job fit analysis",
    "evidence-based resume",
    "AI resume tool",
  ],
  authors: [{ name: 'WorthApply' }],
  creator: 'WorthApply',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
      icons: {
    icon: [
      { url: '/favicon.svg?v=7', sizes: 'any' },
      { url: '/favicon.png?v=7', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=7', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WorthApply',
  },
  verification: {
    google: 'QcP3lEQ7uEke_YNwMKGToJOFRh9BRV4kfj2hpPNxCKs',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Material Symbols Icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${inter.className} bg-background text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container`}
      >
        <PostHogProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <ChatWidget />
        </PostHogProvider>
      </body>
    </html>
  );
}
