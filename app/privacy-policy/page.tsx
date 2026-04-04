import "../legal.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Privacy Policy — MyHomeStyler",
  description: "Learn how MyHomeStyler collects, uses, and protects your personal information.",
  alternates: { canonical: "https://myhomestyler.com/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <Navbar />

      <div className="legal-hero">
        <span className="legal-eyebrow">Legal</span>
        <h1 className="legal-hero-title">Privacy Policy</h1>
        <p className="legal-hero-sub">Last updated: April 4, 2026</p>
      </div>

      <div className="legal-body">
        <p className="legal-updated">
          This Privacy Policy explains how MyHomeStyler ("we", "us", or "our") collects, uses, and shares information about you when you use our website at <a href="https://myhomestyler.com">myhomestyler.com</a>.
        </p>

        <div className="legal-section">
          <h2>1. Information We Collect</h2>
          <h3>Account Information</h3>
          <p>When you sign up, we collect your name, email address, and authentication data through Clerk, our identity provider. We do not store your password directly.</p>

          <h3>Images You Upload</h3>
          <p>When you upload floor plans or room photos for AI processing, those images are stored securely on Cloudinary (a cloud media platform). Images are used solely to generate your AI renders and are not shared with third parties for marketing purposes.</p>

          <h3>Usage Data</h3>
          <p>We automatically collect information about how you use our service, including pages visited, features used, generation count, and device/browser information. This data is collected through Yandex Metrica analytics.</p>

          <h3>Payment Information</h3>
          <p>If you purchase credits, payments are processed by Stripe. We do not store your credit card number or payment details on our servers. Stripe's privacy policy applies to payment data.</p>

          <h3>Cookies and Tracking</h3>
          <p>We use cookies and similar technologies to operate our service, remember your preferences, and serve relevant advertising through Google AdSense. Cookies may include:</p>
          <ul>
            <li><strong>Essential cookies</strong> — required for authentication and site functionality</li>
            <li><strong>Analytics cookies</strong> — help us understand how visitors use our site (Yandex Metrica)</li>
            <li><strong>Advertising cookies</strong> — used by Google AdSense to show relevant ads based on your interests</li>
          </ul>
          <p>You can control cookies through your browser settings. Disabling cookies may affect site functionality.</p>
        </div>

        <div className="legal-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our AI design services</li>
            <li>Process your image uploads and generate AI renders</li>
            <li>Manage your account, credits, and project history</li>
            <li>Process payments and prevent fraud</li>
            <li>Send you service-related emails (no spam)</li>
            <li>Display personalized advertising through Google AdSense</li>
            <li>Analyze usage to improve features and performance</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Google AdSense and Advertising</h2>
          <p>MyHomeStyler uses Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
          <p>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website and/or other websites on the Internet. The use of advertising cookies enables Google and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</p>
        </div>

        <div className="legal-section">
          <h2>4. How We Share Your Information</h2>
          <p>We do not sell your personal information. We share information only in these cases:</p>
          <ul>
            <li><strong>Service providers</strong> — Clerk (authentication), Cloudinary (image storage), Stripe (payments), Google (AI/analytics/ads), Yandex (analytics)</li>
            <li><strong>Legal requirements</strong> — when required by law or to protect our rights</li>
            <li><strong>Business transfers</strong> — if we are acquired or merged, your data may be transferred</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. Data Retention</h2>
          <p>We retain your account information and project history for as long as your account is active. You can request deletion of your account and associated data at any time by contacting us. Images uploaded for processing are retained on Cloudinary as part of your project history. Deleted accounts have their data removed within 30 days.</p>
        </div>

        <div className="legal-section">
          <h2>6. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access</strong> — request a copy of the data we hold about you</li>
            <li><strong>Correction</strong> — request correction of inaccurate data</li>
            <li><strong>Deletion</strong> — request deletion of your account and data</li>
            <li><strong>Opt-out</strong> — opt out of marketing emails or personalized ads</li>
            <li><strong>Data portability</strong> — request your data in a portable format</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:myhomestylercom@gmail.com">myhomestylercom@gmail.com</a>.</p>
        </div>

        <div className="legal-section">
          <h2>7. Children's Privacy</h2>
          <p>MyHomeStyler is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it immediately.</p>
        </div>

        <div className="legal-section">
          <h2>8. Security</h2>
          <p>We take reasonable measures to protect your information, including HTTPS encryption, secure authentication via Clerk, and access controls on our databases. However, no method of transmission over the internet is 100% secure.</p>
        </div>

        <div className="legal-section">
          <h2>9. Third-Party Links</h2>
          <p>Our website may contain links to third-party sites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.</p>
        </div>

        <div className="legal-section">
          <h2>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of the service after changes constitutes acceptance of the new policy.</p>
        </div>

        <div className="legal-section">
          <h2>11. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <div className="legal-contact-box">
            <p><strong>MyHomeStyler</strong></p>
            <p>United States</p>
            <p>Email: <a href="mailto:myhomestylercom@gmail.com">myhomestylercom@gmail.com</a></p>
            <p>Website: <a href="https://myhomestyler.com">myhomestyler.com</a></p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
