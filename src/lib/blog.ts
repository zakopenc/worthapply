import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Converts markdown pipe tables to HTML before remark processes content.
// remark-html alone doesn't support GFM tables; this avoids needing remark-gfm.
function convertMarkdownTables(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const nextLine = lines[i + 1] ?? '';
    // Detect a markdown table: current line has pipes, next line is a separator row
    if (
      line.trim().startsWith('|') &&
      /^\s*\|[\s:\-|]+\|\s*$/.test(nextLine)
    ) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      result.push(tableToHTML(tableLines));
    } else {
      result.push(line);
      i++;
    }
  }

  return result.join('\n');
}

function inlineMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function tableToHTML(rows: string[]): string {
  const parseCells = (row: string): string[] =>
    row.split('|').slice(1, -1).map(cell => cell.trim());

  const headers = parseCells(rows[0]);
  const bodyRows = rows.slice(2); // skip header + separator

  const headerHTML = headers.map(h => `<th>${inlineMd(h)}</th>`).join('');
  const bodyHTML = bodyRows
    .map(row => {
      const cells = parseCells(row);
      return `<tr>${cells.map(c => `<td>${inlineMd(c)}</td>`).join('')}</tr>`;
    })
    .join('\n');

  return `<table>\n<thead><tr>${headerHTML}</tr></thead>\n<tbody>\n${bodyHTML}\n</tbody>\n</table>`;
}

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

      // Process markdown to HTML (pre-process tables since remark-html lacks GFM support)
      const processedContent = await remark()
        .use(html, { sanitize: false })
        .process(convertMarkdownTables(content));
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

export async function getPostsByCategory(category: 'compa