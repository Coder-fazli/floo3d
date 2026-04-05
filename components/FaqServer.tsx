// Server component — no "use client", no JS needed
// Uses native <details>/<summary> so all answers are in the HTML from the start
// Google reads every answer without executing JavaScript

export default function FaqServer({
  faqs,
  twoColumns,
}: {
  faqs: { q: string; a: string }[];
  twoColumns?: boolean;
}) {
  return (
    <section className="faq-section" id="answers">
      <div className={`faq-inner${twoColumns ? " faq-inner-full" : ""}`}>
        <div className={`faq-left${twoColumns ? " faq-left-full" : ""}`}>
          <header className="faq-header">
            <span className="faq-eyebrow">Help Center</span>
            <h2 className="faq-title">Got Questions?<br />We&apos;ve Got Answers.</h2>
            <p className="faq-sub">Everything you need to know about the AI floor plan generator.</p>
          </header>

          <div className={`faq-list${twoColumns ? " faq-list-two-col" : ""}`}>
            {faqs.map((faq, i) => (
              <details key={i} className="faq-item faq-details">
                <summary className="faq-trigger">
                  <span className="faq-q">{faq.q}</span>
                  <span className="faq-arrow">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                </summary>
                <div className="faq-answer-body">
                  <p className="faq-answer-text">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
