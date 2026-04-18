'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname);

  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://worthapply.com${item.href}`
    }))
  };

  if (breadcrumbs.length <= 1) return null; // Don't show breadcrumbs on homepage

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className={`py-4 ${className}`}>
        <ol className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <Link 
              href="/" 
              className="hover:text-secondary transition-colors flex items-center gap-1"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <li key={crumb.href} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                {isLast ? (
                  <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link 
                    href={crumb.href}
                    className="hover:text-secondary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

// Helper to generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/') return [];

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = formatSegment(segment);
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

// Format URL segment to readable label
function formatSegment(segment: string): string {
  // Handle special cases
  const specialLabels: Record<string, string> = {
    'ats-checker': 'ATS Checker',
    'jobscan-alternative': 'Jobscan Alternative',
    'teal-alternative': 'Teal Alternative',
    'rezi-alternative': 'Rezi Alternative',
  };

  if (specialLabels[segment]) return specialLabels[segment];

  // Default: capitalize and remove hyphens
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
