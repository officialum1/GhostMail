import type { Metadata } from 'next';
import { AlertTriangle, Briefcase, LifeBuoy } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Contact GhostMail — Get Help',
  description:
    'Contact the GhostMail team for support, feedback, or business inquiries.',
};

const contacts = [
  {
    icon: LifeBuoy,
    title: 'Support',
    email: 'support@ghostmail.store',
    body: 'For help with your account, inbox issues, or anything technical.',
  },
  {
    icon: Briefcase,
    title: 'Business',
    email: 'business@ghostmail.store',
    body: 'For partnerships, press requests, integrations, or business inquiries.',
  },
  {
    icon: AlertTriangle,
    title: 'Abuse',
    email: 'abuse@ghostmail.store',
    body: 'To report spam, abuse, phishing, or misuse of the platform.',
  },
];

export default function ContactPage() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Contact</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">Get In Touch</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            We built GhostMail to feel fast and dependable, and we try to offer the
            same experience when you need to reach us.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <div
                key={contact.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
                  <Icon className="h-6 w-6 text-cyan-300" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-white">{contact.title}</h2>
                <p className="mt-3 text-slate-400">{contact.body}</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-6 inline-flex text-base font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  {contact.email}
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-[28px] border border-white/10 bg-[#10182a] p-8 backdrop-blur">
          <p className="text-lg font-semibold text-white">We typically respond within 24 hours.</p>
          <p className="mt-3 text-slate-400">
            Before reaching out, you might find a faster answer in the FAQ.
          </p>
          <a href="/faq" className="mt-6 inline-flex text-cyan-300 hover:text-cyan-200">
            Before reaching out, check our FAQ →
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
