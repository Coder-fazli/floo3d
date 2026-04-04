import "../legal.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Contact Us — MyHomeStyler",
  description: "Get in touch with the MyHomeStyler team for support, billing, or general inquiries.",
  alternates: { canonical: "https://myhomestyler.com/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="legal-page">
      <Navbar />

      <div className="legal-hero">
        <span className="legal-eyebrow">Support</span>
        <h1 className="legal-hero-title">Contact Us</h1>
        <p className="legal-hero-sub">We typically respond within 1–2 business days</p>
      </div>

      <div className="legal-body">

        <div className="legal-section">
          <h2>General Inquiries</h2>
          <p>For any questions about MyHomeStyler, our AI tools, or your account, reach out to us directly by email:</p>
          <div className="legal-contact-box">
            <p><strong>MyHomeStyler Support</strong></p>
            <p>Email: <a href="mailto:myhomestylercom@gmail.com">myhomestylercom@gmail.com</a></p>
            <p>United States</p>
          </div>
        </div>

        <div className="legal-section">
          <h2>Billing & Refunds</h2>
          <p>For questions about charges, credit purchases, or refund requests, please email us with your registered email address and a description of the issue. We aim to resolve all billing issues within 2 business days.</p>
          <p>See our <a href="/refund-policy">Refund Policy</a> for full details.</p>
        </div>

        <div className="legal-section">
          <h2>Privacy & Data Requests</h2>
          <p>To request access to your data, account deletion, or to report a privacy concern, contact us at <a href="mailto:myhomestylercom@gmail.com">myhomestylercom@gmail.com</a> with the subject line "Data Request".</p>
        </div>

        <div className="legal-section">
          <h2>Report Abuse</h2>
          <p>If you believe someone is misusing our platform or you have found a security vulnerability, please contact us immediately at <a href="mailto:myhomestylercom@gmail.com">myhomestylercom@gmail.com</a> with the subject line "Security Report".</p>
        </div>

        <div className="legal-section">
          <h2>Business & Partnerships</h2>
          <p>For business inquiries, API access, enterprise plans, or partnership opportunities, contact us at <a href="mailto:myhomestylercom@gmail.com">myhomestylercom@gmail.com</a> with the subject line "Business Inquiry".</p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
