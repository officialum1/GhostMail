import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import { FaqSchemaMarkup } from '@/components/seo/SchemaMarkup';
import FAQAccordion from '@/components/FAQAccordion';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'FAQ — GhostMail Frequently Asked Questions',
  description:
    'Find answers to common questions about GhostMail. Learn how to receive OTPs, use your custom email address, and keep your inbox private.',
  alternates: { canonical: `${SITE_URL}/faq` },
};

const faqCategories = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'What is GhostMail?',
        answer:
          'GhostMail is a free custom email service that gives you a real @ghostmail.store email address instantly. Use it to receive OTPs, sign up for services, and keep your real inbox spam-free.',
      },
      {
        question: 'How do I get started?',
        answer:
          'Click Create Account, choose a username, and you instantly get username@ghostmail.store. No credit card required.',
      },
      {
        question: 'Is GhostMail really free?',
        answer:
          'Yes, completely free. Core features such as receiving emails, viewing your inbox, and using your custom address are always free with no hidden charges.',
      },
      {
        question: 'Do I need to verify my email to sign up?',
        answer:
          'No. You only need a username and password. We do not ask for your real email address.',
      },
    ],
  },
  {
    title: 'Using GhostMail',
    items: [
      {
        question: 'Can I receive OTPs with GhostMail?',
        answer:
          'Yes. OTPs from Google, Reddit, X, banks, and other services arrive in seconds.',
      },
      {
        question: 'How fast do emails arrive?',
        answer:
          'Typically in under 3 seconds. GhostMail is powered by Cloudflare-backed routing and a fast web inbox.',
      },
      {
        question: 'Can I send emails too?',
        answer:
          'GhostMail is primarily optimized for receiving email today. Outbound sending is still evolving and should be considered limited compared with the inbox experience.',
      },
      {
        question: 'What happens to old emails?',
        answer:
          'Emails are stored securely and can be deleted from your dashboard whenever you want.',
      },
      {
        question: 'Can I use GhostMail for Reddit?',
        answer:
          'Yes. Use your @ghostmail.store address when Reddit asks for an email and the verification email should arrive in your inbox.',
      },
      {
        question: 'Does GhostMail work with Google, Facebook, and Twitter sign-ups?',
        answer:
          'Yes. It works with any service that sends email to a normal address.',
      },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        question: 'Who can read my emails?',
        answer:
          'Only you. We do not read, sell, or share your emails with anyone.',
      },
      {
        question: 'Do you track me?',
        answer:
          'We do not use advertising trackers. Basic service analytics may be used to keep the platform reliable and secure.',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Yes. Emails are stored encrypted, traffic is served over HTTPS, and the app follows modern security practices.',
      },
      {
        question: 'Can I delete my account?',
        answer:
          'Yes. Contact us and we can delete your account and associated data.',
      },
    ],
  },
  {
    title: 'Technical',
    items: [
      {
        question: 'What email formats are supported?',
        answer:
          'All standard email formats, including HTML emails, plain text, OTPs, newsletters, and verification messages.',
      },
      {
        question: 'Is there an API?',
        answer: 'API access is planned for future developer workflows.',
      },
      {
        question: 'What is the maximum email size?',
        answer:
          'Up to 25MB per email, which matches standard mailbox expectations.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <PageLayout>
      <FaqSchemaMarkup />
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">FAQ</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Answers for the questions people ask before trusting a new inbox.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Everything below is here to make GhostMail simple, predictable, and easy
            to use from day one.
          </p>
        </div>

        <div className="mt-14 space-y-10">
          {faqCategories.map((category) => (
            <div key={category.title}>
              <h2 className="mb-5 text-2xl font-semibold text-white">{category.title}</h2>
              <FAQAccordion items={category.items} />
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
