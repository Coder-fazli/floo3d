import "../legal.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Refund Policy — MyHomeStyler",
  description: "MyHomeStyler refund and cancellation policy for AI credits and subscriptions.",
  alternates: { canonical: "https://myhomestyler.com/refund-policy" },
  robots: { index: true, follow: true },
};

export default function RefundPolicy() {
  return (
    <div className="legal-page">
      <Navbar />

      <div className="legal-hero">
        <span className="legal-eyebrow">Legal</span>
        <h1 className="legal-hero-title">Refund Policy</h1>
        <p className="legal-hero-sub">Last updated: April 4, 2026</p>
      </div>

      <div className="legal-body">
        <p className="legal-updated">
          This Refund Policy applies to all purchases made on MyHomeStyler at <a href="https://myhomestyler.com">myhomestyler.com</a>. Payments are processed securely by Stripe.
        </p>

        <div className="legal-section">
          <h2>1. Credit Purchases</h2>
          <p>MyHomeStyler sells AI generation credits that are consumed when you generate renders. Because AI generation consumes real compute resources the moment it runs, the following policy applies:</p>
          <ul>
            <li><strong>Unused credits</strong> — if you purchased credits and have not used them, you may request a full refund within 7 days of purchase</li>
            <li><strong>Partially used credits</strong> — if you have used some credits, we may offer a partial refund for the unused portion at our discretion</li>
            <li><strong>Used credits</strong> — credits that have been consumed through AI generation are non-refundable, as the compute cost has already been incurred</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>2. Failed Generations</h2>
          <p>If an AI generation fails due to a technical error on our side and credits were deducted, we will restore those credits to your account. To report a failed generation, contact us with your account email and the approximate time of the failure.</p>
        </div>

        <div className="legal-section">
          <h2>3. Dissatisfaction with AI Results</h2>
          <p>Because AI-generated results are inherently variable and subjective, we do not offer refunds based on dissatisfaction with the visual quality of results. We encourage you to use the free credits provided on signup to evaluate the service before purchasing.</p>
        </div>

        <div className="legal-section">
          <h2>4. Duplicate Charges</h2>
          <p>If you were charged more than once for the same purchase due to a payment error, contact us immediately. We will verify and issue a full refund for the duplicate charge within 5 business days.</p>
        </div>

        <div className="legal-section">
          <h2>5. How to Request a Refund</h2>
          <p>To request a refund, email us at <a href="mailto:myhomestylercom@gmail.com">myhomestylercom@gmail.com</a> with:</p>
          <ul>
            <li>Your registered email address</li>
            <li>Date of purchase</li>
            <li>Amount charged</li>
            <li>Reason for the refund request</li>
          </ul>
          <p>We aim to respond within 2 business days. Approved refunds are processed through Stripe and typically appear on your statement within 5–10 business days depending on your bank.</p>
        </div>

        <div className="legal-section">
          <h2>6. Chargebacks</h2>
          <p>If you initiate a chargeback with your bank without contacting us first, we reserve the right to suspend your account pending resolution. We encourage you to contact us directly — we are happy to resolve any issues fairly and quickly.</p>
        </div>

        <div className="legal-section">
          <h2>7. Contact Us</h2>
          <p>For any refund-related questions, reach out to us:</p>
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
