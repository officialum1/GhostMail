export const metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'yourdomain.com';

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 font-sans pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using GhostMail (&quot;the Service&quot;) at {domain}, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>GhostMail provides users with custom, temporary-style email addresses for receiving emails, primarily intended for OTPs, verifications, and protecting personal inboxes from spam. We do not support sending emails.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
            <p>You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You may not use GhostMail to engage in abuse, harassment, or distribution of malware.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Privacy</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding your data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimers</h2>
            <p>The Service is provided &quot;as is&quot; and &quot;as available&quot;. We do not guarantee that the service will be uninterrupted or error-free. We are not responsible for any missed, lost, or deleted emails.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
            <p>We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
