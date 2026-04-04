import "../legal.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Terms of Service — MyHomeStyler",
  description: "Read the terms and conditions governing your use of MyHomeStyler.",
  alternates: { canonical: "https://myhomestyler.com/terms-of-service" },
  robots: { index: true, follow: true },
};

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <Navbar />

      <div className="legal-hero">
        <span className="legal-eyebrow">Legal</span>
        <h1 className="legal-hero-title">Terms of Service</h1>
        <p className="legal-hero-sub">Last updated: April 4, 2026</p>
      </div>

      <div className="legal-body">
        <p className="legal-updated">
          Please read these Terms of Service carefully before using MyHomeStyler. By accessing or using our service, you agree to be bound by these terms.
        </p>

        <div className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By creating an account or using MyHomeStyler ("the Service"), you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the Service. We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance.</p>
        </div>

        <div className="legal-section">
          <h2>2. Description of Service</h2>
          <p>MyHomeStyler is an AI-powered design platform that allows users to:</p>
          <ul>
            <li>Convert 2D floor plans into 3D renders using AI</li>
            <li>Generate AI floor plans from configuration inputs</li>
            <li>Redesign interior rooms using AI style transfer</li>
            <li>Redesign outdoor spaces using AI</li>
            <li>Perform virtual staging of empty spaces</li>
          </ul>
          <p>AI-generated results are produced by our proprietary StyleAI models and may vary in quality and accuracy. Results are not guaranteed to be architecturally precise or construction-ready.</p>
        </div>

        <div className="legal-section">
          <h2>3. Accounts and Registration</h2>
          <p>You must be at least 13 years old to create an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. Notify us immediately at <a href="mailto:myhomestylercom@gmail.com">myhomestylercom@gmail.com</a> if you suspect unauthorized access.</p>
        </div>

        <div className="legal-section">
          <h2>4. Credits and Payments</h2>
          <p>MyHomeStyler operates on a credit-based system. New accounts receive free credits upon registration. Additional credits may be purchased through our platform, processed securely by Stripe.</p>
          <ul>
            <li>Credits are deducted per AI generation</li>
            <li>Credits are non-transferable between accounts</li>
            <li>Purchased credits do not expire</li>
            <li>We reserve the right to change credit pricing with notice</li>
          </ul>
          <p>For refund information, see our <a href="/refund-policy">Refund Policy</a>.</p>
        </div>

        <div className="legal-section">
          <h2>5. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Upload images you do not own or have rights to use</li>
            <li>Generate content that is illegal, harmful, abusive, or violates third-party rights</li>
            <li>Attempt to reverse-engineer or circumvent our AI systems</li>
            <li>Use automated scripts or bots to generate content at scale</li>
            <li>Resell or redistribute access to the Service without our consent</li>
            <li>Upload malicious files or attempt to attack our infrastructure</li>
            <li>Upload images of real people without their consent</li>
          </ul>
          <p>Violation of these rules may result in immediate account suspension without refund.</p>
        </div>

        <div className="legal-section">
          <h2>6. Intellectual Property</h2>
          <h3>Your Content</h3>
          <p>You retain ownership of images you upload. By uploading content, you grant MyHomeStyler a non-exclusive license to process, store, and display your images solely for the purpose of providing the Service.</p>
          <h3>AI-Generated Output</h3>
          <p>AI-generated renders produced using your uploaded content are provided for your personal and commercial use. We do not claim ownership of your generated outputs. However, we may use anonymized renders to improve our AI models.</p>
          <h3>Our Platform</h3>
          <p>The MyHomeStyler platform, branding, code, and design are owned by us and protected by intellectual property laws. You may not copy, modify, or redistribute our platform without written permission.</p>
        </div>

        <div className="legal-section">
          <h2>7. AI-Generated Content Disclaimer</h2>
          <p>Our AI renders are generated by StyleAI and are intended for visualization purposes only. They are:</p>
          <ul>
            <li>Not architectural drawings or construction blueprints</li>
            <li>Not guaranteed to be structurally accurate</li>
            <li>Not suitable as official design documents without professional review</li>
            <li>Subject to variation based on input quality and AI model limitations</li>
          </ul>
          <p>Always consult a licensed architect or designer before making construction decisions based on AI-generated content.</p>
        </div>

        <div className="legal-section">
          <h2>8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, MyHomeStyler shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, revenue, or business opportunities. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
        </div>

        <div className="legal-section">
          <h2>9. Disclaimer of Warranties</h2>
          <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that AI results will meet your expectations.</p>
        </div>

        <div className="legal-section">
          <h2>10. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time. Upon termination, your right to use the Service ceases and unused credits are forfeited unless otherwise required by law.</p>
        </div>

        <div className="legal-section">
          <h2>11. Governing Law</h2>
          <p>These Terms are governed by the laws of the United States. Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with US law, unless prohibited by applicable regulations.</p>
        </div>

        <div className="legal-section">
          <h2>12. Contact Us</h2>
          <p>For questions about these Terms, contact us:</p>
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
