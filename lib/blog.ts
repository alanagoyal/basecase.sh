import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeFormat from 'rehype-format'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'

export interface BlogPost {
  slug: string
  content: string
  meta: {
    'og:title'?: string
    'og:description'?: string
    'og:image'?: string
    'twitter:image'?: string
    'twitter:card'?: string
    'twitter:title'?: string
    'twitter:description'?: string
    author?: string
  }
  title: string
  date: string
  readingTimeMin: number
}

const postsDirectory = path.join(process.cwd(), 'app/blog')

async function processMarkdown(content: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(content)

  return result.toString()
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const fileNames = await fs.promises.readdir(postsDirectory)
    const allPosts = await Promise.all(
      fileNames
        .filter(fileName => fileName.endsWith('.mdx'))
        .map(async (fileName) => {
          const slug = fileName.replace(/\.mdx$/, '')
          const fullPath = path.join(postsDirectory, fileName)
          const fileContents = await fs.promises.readFile(fullPath, 'utf8')
          const { data } = matter(fileContents)

          return {
            slug,
            content: '',  // We don't need content for the listing
            meta: data.meta || {},
            title: data.title || '',
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            readingTimeMin: data.readingTimeMin || 1,
          }
        })
    )

    return allPosts.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
  } catch (error) {
    console.error('Error getting all posts:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)
    const fileContents = await fs.promises.readFile(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const processedContent = await processMarkdown(content)

    return {
      slug,
      content: processedContent,
      meta: data.meta || {},
      title: data.title || '',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      readingTimeMin: data.readingTimeMin || 1,
    }
  } catch (error) {
    console.error('Error getting post by slug:', error)
    return null
  }
}