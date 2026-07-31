import type { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/components/PageLayout'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'GhostMail Blog — Email Privacy Tips & Guides',
  description:
    'Email privacy tips, OTP guides, and GhostMail updates. Learn how to protect your real inbox and receive verification emails safely.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

const upcomingPosts = [
  {
    slug: 'protect-email-privacy-2025',
    title: 'How to Protect Your Email Privacy in 2025',
    excerpt: 'Practical steps to keep your real inbox private when signing up online.',
  },
  {
    slug: 'receive-otps-without-real-email',
    title: 'Best Ways to Receive OTPs Without Your Real Email',
    excerpt: 'Use a dedicated address for verification codes without risking spam.',
  },
  {
    slug: 'never-give-real-email-to-random-sites',
    title: 'Why You Should Never Give Your Real Email to Random Sites',
    excerpt: 'How data brokers, leaks, and marketing lists start with one sign-up.',
  },
  {
    slug: 'ghostmail-cloudflare-instant-delivery',
    title: 'How GhostMail Uses Cloudflare for Instant Email Delivery',
    excerpt: 'A look at the infrastructure behind sub-second OTP delivery.',
  },
  {
    slug: 'free-vs-paid-email-services',
    title: 'Free vs Paid Email Services: What You Actually Need',
    excerpt: 'When a free custom inbox is enough—and when you might want more.',
  },
]

export default function BlogPage() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Blog</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">Email privacy tips &amp; guides</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Articles on custom email addresses, OTP delivery, and keeping your real inbox
            spam-free. Full posts are coming soon.
          </p>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
          Coming soon — subscribe via{' '}
          <Link href="/contact" className="underline hover:text-white">
            contact
          </Link>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {upcomingPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-8 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Coming soon</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">{post.title}</h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-6 inline-flex text-sm font-medium text-cyan-300 hover:text-white"
              >
                Preview post →
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[28px] border border-cyan-400/20 bg-cyan-400/5 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Ready for your own address?</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Create a free @ghostmail.store inbox and start receiving OTPs in seconds.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-slate-900 dark:text-white"
          >
            Create free account
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
