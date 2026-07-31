import type { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms of Service — GhostMail',
  description:
    'Read GhostMail terms of service. Understand your rights and responsibilities when using our free email service.',
  alternates: { canonical: `${SITE_URL}/terms` },
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using GhostMail, you agree to these Terms of Service. If you do not agree, do not use the service.',
  },
  {
    title: '2. Description of Service',
    body: 'GhostMail provides a free custom email address at @ghostmail.store, web-based inbox access, email receiving, and secure storage of messages routed to your account.',
  },
  {
    title: '3. User Accounts',
    body: 'Usernames must generally be 3 to 20 characters and use supported alphanumeric formats. You are responsible for keeping your password secure and for activity that occurs under your account. We may limit one account per user where abuse prevention requires it.',
  },
  {
    title: '4. Acceptable Use Policy',
    body: 'You may not use GhostMail for spam, bulk messaging, illegal content, phishing, fraud, harassment, malware distribution, or other abusive behavior. We may suspend or terminate accounts that violate these rules.',
  },
  {
    title: '5. Privacy',
    body: 'Your use of GhostMail is also governed by our Privacy Policy. That policy explains what data we collect and how we use it to operate and secure the service.',
  },
  {
    title: '6. Email Storage',
    body: 'We store email on your behalf so it can be accessed through your dashboard. We may delete old emails based on retention rules, account status, or operational needs. Permanent storage is not guaranteed.',
  },
  {
    title: '7. Service Availability',
    body: 'We aim for 99.9% uptime, but maintenance, provider outages, and third-party issues can affect availability. There is no formal SLA for the free tier.',
  },
  {
    title: '8. Intellectual Property',
    body: 'GhostMail, its software, branding, and visual assets remain our property or the property of our licensors. Using the service does not transfer ownership to you.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'GhostMail is provided as-is. To the fullest extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service.',
  },
  {
    title: '10. Termination',
    body: 'We may suspend or terminate access if you violate these terms, abuse the platform, or create security risk. You may stop using the service at any time and request account deletion.',
  },
  {
    title: '11. Changes to Terms',
    body: 'We may update these terms from time to time. Continued use of GhostMail after changes take effect means you accept the revised terms.',
  },
  {
    title: '12. Governing Law',
    body: 'These terms are governed by applicable laws in the jurisdiction in which GhostMail operates, subject to consumer rights that may apply in your region.',
  },
  {
    title: '13. Contact Information',
    body: 'For questions about these terms, contact us at support@ghostmail.store.',
  },
];

export default function TermsPage() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-32">
        <div className="rounded-[32px] border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-8 backdrop-blur md:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Legal</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">Terms of Service</h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Last updated: May 2025</p>

          <div className="mt-10 space-y-8 text-slate-600 dark:text-slate-300">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
                <p className="mt-3 leading-8">{section.body}</p>
              </section>
            ))}
          </div>

          <p className="mt-10 text-slate-500 dark:text-slate-400">
            You should also review our
            {' '}
            <Link href="/privacy" className="text-cyan-300 hover:text-cyan-200">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
