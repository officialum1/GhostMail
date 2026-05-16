export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'yourdomain.com';

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 font-sans pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>When you register for GhostMail, we collect your chosen username and securely hashed password. As you use the service, we temporarily store the emails sent to your `{domain}` address, including sender, subject, and content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p>We use your information exclusively to provide the GhostMail service—allowing you to log in and read the emails sent to your custom address. We do not sell, rent, or share your data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Storage and Security</h2>
            <p>Your data is stored securely. Passwords are cryptographically hashed using bcrypt. While we implement strong security measures, no system is entirely foolproof, and we cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
            <p>GhostMail utilizes Cloudflare Email Routing to receive emails. Cloudflare securely forwards incoming emails to our servers. Please refer to Cloudflare&apos;s privacy policy for information on how they handle transient email routing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
            <p>We use essential cookies solely to maintain your active session when logged into the dashboard. We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
            <p>Emails may be automatically deleted from our servers after a certain period (e.g., 30 days) to conserve storage space. You may also manually delete emails from your inbox.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights (GDPR Friendly)</h2>
            <p>You have the right to access, update, or request the deletion of your personal data. If you wish to delete your account and all associated emails, please contact our support team.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us via the information provided on our Contact page.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
