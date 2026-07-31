import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import { getBlogPost, BLOG_POSTS } from '@/lib/blog-posts'
import { SITE_URL } from '@/lib/seo'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug)
  if (!post) return { title: 'Post not found' }

  const url = `${SITE_URL}/blog/${post.slug}`

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  }
}

function ArticleSchema({ post }: { post: NonNullable<ReturnType<typeof getBlogPost>> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'GhostMail',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  return (
    <PageLayout>
      <ArticleSchema post={post} />
      <article className="mx-auto max-w-3xl px-6 py-20 md:py-32">
        <Link href="/blog" className="text-sm text-cyan-600 dark:text-cyan-300 hover:text-slate-900 dark:hover:text-white">
          ← Back to blog
        </Link>
        <p className="mt-8 text-sm uppercase tracking-[0.2em] text-slate-500">
          {post.publishedAt} · {post.author}
        </p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">{post.title}</h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">{post.description}</p>
        <div className="prose prose-invert mt-10 max-w-none space-y-6 text-slate-600 dark:text-slate-300">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-12 rounded-[28px] border border-cyan-400/20 bg-cyan-400/5 p-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Get your free custom email</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Create an account and receive OTPs at your @ghostmail.store address.
          </p>
          <Link
            href="/register"
            className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 font-semibold text-slate-900 dark:text-white"
          >
            Create free account
          </Link>
        </div>
      </article>
    </PageLayout>
  )
}
