import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy — GhostMail',
  description:
    'GhostMail privacy policy. Learn how we protect your data and respect your privacy. GDPR compliant.',
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const sections = [
  {
    title: '1. Introduction',
    body: 'GhostMail is committed to protecting your privacy. This policy explains what information we collect, how we use it, and the choices you have regarding your personal data.',
  },
  {
    title: '2. Data We Collect',
    body: 'We collect account data such as your chosen username and hashed password, email data stored on your behalf, limited usage and security data such as login times and IP addresses, and we do not use advertising trackers.',
  },
  {
    title: '3. How We Use Your Data',
    body: 'We use data to provide the email service, secure your account, prevent abuse, and improve reliability. Your data is never sold to third parties.',
  },
  {
    title: '4. Data Storage',
    body: 'Data is stored on secure infrastructure, encrypted at rest where supported, and processed across US and EU service regions depending on platform providers and operational needs.',
  },
  {
    title: '5. Third Party Services',
    body: 'GhostMail relies on Cloudflare for email routing and edge protection, Render for application hosting, and infrastructure providers needed to operate the service. We do not participate in advertising networks.',
  },
  {
    title: '6. Cookies',
    body: 'We use essential session cookies so you can log in and use your dashboard securely. We do not use tracking cookies or third-party ad cookies.',
  },
  {
    title: '7. Data Retention',
    body: 'Account data is retained until you request deletion. Emails remain until deleted by you, removed under retention policy, or deleted with your account. Operational logs are generally retained for around 30 days unless longer retention is needed for security or compliance.',
  },
  {
    title: '8. Your Rights (GDPR)',
    body: 'You may have rights to access, correct, delete, export, or object to processing of your data. Contact us if you want to exercise those rights and we will respond in line with applicable law.',
  },
  {
    title: "9. Children's Privacy",
    body: 'GhostMail is not intended for children under 13 and we do not knowingly collect personal data from children under that age.',
  },
  {
    title: '10. Changes to Policy',
    body: 'We may update this Privacy Policy to reflect operational, legal, or product changes. Material updates will be reflected by revising the last updated date.',
  },
  {
    title: '11. Contact',
    body: 'For privacy-related questions or requests, contact privacy@ghostmail.store.',
  },
];

export default function PrivacyPage() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-32">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur md:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Privacy</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">Privacy Policy</h1>
          <p className="mt-4 text-slate-400">Last updated: May 2025</p>

          <div className="mt-10 space-y-8 text-slate-300">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                <p className="mt-3 leading-8">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
