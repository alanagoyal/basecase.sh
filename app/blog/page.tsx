import Link from 'next/link'
import Layout from '@/components/layout'
import { getAllPosts } from '@/lib/blog'


export const metadata = {
  title: 'blog',
  description: 'first check to future founders',
}

export default async function BlogPage() {
  try {
    const posts = await getAllPosts()

    return (
      <Layout>
        <h1 className="text-4xl mb-8 text-foreground">blog</h1>
        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-border pb-8">
              <Link href={`/blog/${post.slug}`} className="block group">
                <h2 className="text-xl mb-2 text-foreground group-hover:[color:var(--color-primary)]">
                  {post.meta?.['og:title'] || post.title}
                </h2>
                <div className="flex items-center text-muted-foreground text-sm mb-4 font-mono">
                  <span>{new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }).toLowerCase()}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readingTimeMin} min read</span>
                  {post.meta?.author && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{post.meta.author.toLowerCase()}</span>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground font-mono">
                  {post.meta?.['og:description'] || ''}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('Error getting all posts:', error)
    return (
      <Layout>
        <h1 className="text-4xl mb-8 text-foreground">blog</h1>
        <p className="text-muted-foreground">no posts found.</p>
      </Layout>
    )
  }
}