import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, BlogPostMetadata } from '@/lib/blog';
import { Clock, Tag, TrendUp } from '@/components/ui/phosphor-icons';
import { RevealOnScroll, StaggerGroup, FadeUp, HoverCard } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Blog | WorthApply - Job Search Tips & Resume Guides',
  description: 'Expert guides on resume optimization, ATS checkers, job fit analysis, and application tracking. Learn how to land your dream job faster.',
};

function PostCard({ post }: { post: BlogPostMetadata }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block"
    >
      <HoverCard className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg">
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
            post.category === 'comparison' 
              ? 'bg-secondary/20 text-secondary' 
              : 'bg-tertiary/20 text-tertiary'
          }`}>
            {post.category === 'comparison' ? 'Comparison' : 'Guide'}
          </span>
          {post.featured && (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary/20 text-primary flex items-center gap-1">
              <TrendUp size={12} weight="duotone" />
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#171411] mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-lg text-[#6e665f] leading-relaxed mb-4 line-clamp-2">
          {post.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-[#6e665f]">
          <span className="flex items-center gap-1">
            <Clock size={14} weight="bold" />
            {post.readTime}
          </span>
          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 rounded text-xs bg-surface text-[#6e665f] flex items-center gap-1">
                <Tag size={10} weight="bold" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      </HoverCard>
    </Link>
  );
}

export default async function BlogPage() {
  const posts = await getAllPosts();
  const featuredPosts = posts.filter(p => p.featured);
  const comparisonPosts = posts.filter(p => p.category === 'comparison');
  const guidePosts = posts.filter(p => p.category === 'guide');

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-16">
        <div className="max-w-6xl mx-auto px-4">
          <RevealOnScroll className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold text-[#171411] tracking-tight leading-[1.0] mb-4">
              Job Search Resources & Guides
            </h1>
            <p className="text-lg text-[#6e665f] leading-relaxed">
              Expert advice on resume optimization, job fit analysis, ATS checkers,
              and landing your dream job faster.
            </p>
          </RevealOnScroll>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-6 flex items-center gap-2">
              <TrendUp weight="duotone" className="text-primary" />
              Featured Articles
            </h2>
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map(post => (
                <FadeUp key={post.slug}>
                  <PostCard post={post} />
                </FadeUp>
              ))}
            </StaggerGroup>
          </section>
        )}

        {/* Comparison Posts */}
        {comparisonPosts.length > 0 && (
          <section className="mb-16">
            <RevealOnScroll>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-6">
                Tool Comparisons
              </h2>
            </RevealOnScroll>
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisonPosts.map(post => (
                <FadeUp key={post.slug}>
                  <PostCard post={post} />
                </FadeUp>
              ))}
            </StaggerGroup>
          </section>
        )}

        {/* Guide Posts */}
        {guidePosts.length > 0 && (
          <section className="mb-16">
            <RevealOnScroll>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-6">
                Guides & How-Tos
              </h2>
            </RevealOnScroll>
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidePosts.map(post => (
                <FadeUp key={post.slug}>
                  <PostCard post={post} />
                </FadeUp>
              ))}
            </StaggerGroup>
          </section>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-[#6e665f] leading-relaxed">
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}

        {/* CTA Section */}
        <RevealOnScroll>
        <section className="mt-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10 rounded-3xl p-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg text-[#6e665f] leading-relaxed mb-8 max-w-2xl mx-auto">
            Stop wasting time on bad-fit jobs. Use WorthApply&apos;s AI to analyze job fit, 
            tailor your resume, and track applications in one place.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors text-lg"
          >
            Try WorthApply Free →
          </Link>
        </section>
        </RevealOnScroll>
      </div>
    </div>
  );
}
