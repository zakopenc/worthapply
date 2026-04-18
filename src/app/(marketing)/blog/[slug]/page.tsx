import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { Clock, ArrowLeft, Tag } from '@/components/ui/phosphor-icons';
import Script from 'next/script';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | WorthApply Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // BlogPosting schema for SEO
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'WorthApply',
      logo: {
        '@type': 'ImageObject',
        url: 'https://worthapply.com/logo.png',
      },
    },
  };

  // Extract FAQ content for schema (comparison articles have FAQ sections)
  const rawContent = post.content.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\n/g, ' ');
  const faqSections = rawContent.split(/\*\*Q:/i).slice(1);
  
  const parsedFAQs = faqSections.map(section => {
    const parts = section.split(/\*\*\s+A:/i);
    if (parts.length !== 2) return null;
    
    const question = parts[0].replace(/\*\*/g, '').trim();
    const answer = parts[1].split(/\*\*Q:/i)[0].trim();
    
    return question && answer ? { question, answer } : null;
  }).filter(Boolean) as { question: string; answer: string }[];
  
  const faqSchema = parsedFAQs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: parsedFAQs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <>
      {/* BlogPosting Schema */}
      <Script
        id={`blog-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* FAQ Schema (for comparison articles) */}
      {faqSchema && (
        <Script
          id={`faq-schema-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="min-h-screen bg-surface">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Back Link */}
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-on-surface/70 hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft size={16} weight="bold" />
              Back to Blog
            </Link>

            {/* Category Badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                post.category === 'comparison' 
                  ? 'bg-secondary/20 text-secondary' 
                  : 'bg-tertiary/20 text-tertiary'
              }`}>
                {post.category === 'comparison' ? 'Comparison' : 'Guide'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-4">
              {post.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-on-surface/70 mb-6">
              {post.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-on-surface/60">
              <span>By {post.author}</span>
              <span>•</span>
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} weight="duotone" />
                {post.readTime}
              </span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-6 flex-wrap">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs bg-surface text-on-surface/70 flex items-center gap-1">
                    <Tag size={12} weight="fill" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div 
            className="prose prose-lg prose-slate dark:prose-invert max-w-none
                       prose-headings:text-on-surface prose-headings:font-bold
                       prose-p:text-on-surface/80 prose-p:leading-relaxed
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-on-surface prose-strong:font-semibold
                       prose-ul:text-on-surface/80 prose-ol:text-on-surface/80
                       prose-li:marker:text-primary
                       prose-code:text-secondary prose-code:bg-surface-container prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                       prose-pre:bg-surface-container prose-pre:border prose-pre:border-outline-variant/10
                       prose-table:border-collapse prose-table:w-full
                       prose-th:border prose-th:border-outline-variant/20 prose-th:bg-surface-container prose-th:p-3 prose-th:text-left
                       prose-td:border prose-td:border-outline-variant/10 prose-td:p-3
                       prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-surface-container prose-blockquote:py-2 prose-blockquote:px-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-on-surface mb-4">
              Ready to Apply Smarter?
            </h3>
            <p className="text-lg text-on-surface/70 mb-6">
              Use WorthApply to analyze job fit, tailor your resume with AI, and track your applications—all in one place.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/signup"
                className="px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Try Free →
              </Link>
              <Link
                href="/features"
                className="px-6 py-3 bg-surface-container text-on-surface rounded-xl font-semibold hover:bg-surface-container/80 transition-colors border border-outline-variant/10"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Related Posts CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              ← View All Articles
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
