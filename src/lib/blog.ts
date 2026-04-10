import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: 'comparison' | 'guide' | 'tool';
  author: string;
  readTime: string;
  content: string;
  featured?: boolean;
  tags?: string[];
}

export type BlogPostMetadata = Omit<BlogPost, 'content'>;

export async function getAllPosts(): Promise<BlogPostMetadata[]> {
  const categories = ['comparison', 'guides'];
  const allPosts: BlogPostMetadata[] = [];

  for (const category of categories) {
    const categoryPath = path.join(postsDirectory, category);
    
    if (!fs.existsSync(categoryPath)) {
      continue;
    }

    const fileNames = fs.readdirSync(categoryPath);

    for (const fileName of fileNames) {
      if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) {
        continue;
      }

      const slug = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(categoryPath, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      allPosts.push({
        slug,
        title: data.title,
        description: data.description,
        publishedAt: data.publishedAt,
        category: category as 'comparison' | 'guide',
        author: data.author || 'WorthApply Team',
        readTime: data.readTime || '5 min read',
        featured: data.featured || false,
        tags: data.tags || [],
      });
    }
  }

  // Sort by date, newest first
  return allPosts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const categories = ['comparison', 'guides'];

  for (const category of categories) {
    const fullPath = path.join(postsDirectory, category, `${slug}.md`);
    
    if (fs.existsSync(fullPath)) {
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      // Process markdown to HTML
      const processedContent = await remark()
        .use(html, { sanitize: false })
        .process(content);
      const contentHtml = processedContent.toString();

      return {
        slug,
        title: data.title,
        description: data.description,
        publishedAt: data.publishedAt,
        category: category as 'comparison' | 'guide',
        author: data.author || 'WorthApply Team',
        readTime: data.readTime || '5 min read',
        content: contentHtml,
        featured: data.featured || false,
        tags: data.tags || [],
      };
    }
  }

  return null;
}

export async function getFeaturedPosts(): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.featured).slice(0, 3);
}

export async function getPostsByCategory(category: 'comparison' | 'guide'): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.category === category);
}
