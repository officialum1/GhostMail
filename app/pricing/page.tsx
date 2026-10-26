import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import PricingClient from '@/components/PricingClient';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Pricing & Developer API — GhostMail',
  description:
    'GhostMail pricing. Free web inboxes for individuals, and high-performance Developer REST API for programmatic accounts & automated OTP extraction.',
  alternates: { canonical: `${SITE_URL}/pricing` },
};

export default function PricingPage() {
  return (
    <PageLayout>
      <PricingClient />
    </PageLayout>
  );
}

