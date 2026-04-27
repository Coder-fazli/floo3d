'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    title: 'Billing & Auto-Renewal',
    body: 'Your subscription is billed monthly on the same date you first subscribed. It auto-renews automatically unless you cancel before the renewal date. You will receive an email receipt after each successful charge.',
  },
  {
    title: 'Credits & Monthly Reset',
    body: 'Credits are added to your account at the start of every billing cycle. Unused credits do not roll over — they reset when your plan renews. Credits are available immediately after a successful payment.',
  },
  {
    title: 'Cancellation',
    body: 'You can cancel anytime from your account dashboard. Cancelling stops future renewals. You retain access to your remaining credits until the end of the current billing period. No partial refunds are issued for unused time.',
  },
  {
    title: 'Failed Payments',
    body: 'If a payment fails, your account is marked as past due and generation access is paused. We will retry the payment automatically. You can update your card details at any time via the billing portal. Access is restored once payment succeeds.',
  },
  {
    title: 'Refund Policy',
    body: 'Subscription fees are non-refundable once a billing cycle has started and credits have been issued. If you believe you were charged in error, contact us at support@myhomestyler.com within 7 days and we will review your case.',
  },
  {
    title: 'Plan Changes',
    body: 'You can upgrade or downgrade your plan at any time. Upgrades take effect immediately and are prorated. Downgrades take effect at the next billing cycle.',
  },
];

export default function SubscriptionTermsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '1.25rem',
          width: '100%', maxWidth: '560px',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e8eaed',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#27282f', margin: 0 }}>
              Subscription Terms
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
              Last updated April 2025
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '2rem', height: '2rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ marginBottom: i < SECTIONS.length - 1 ? '1.25rem' : 0 }}>
              <h3 style={{
                fontSize: '0.82rem', fontWeight: 700,
                color: 'var(--brand-color)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                margin: '0 0 0.4rem',
              }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e8eaed',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Questions? <a href="mailto:support@myhomestyler.com" style={{ color: 'var(--brand-color)', textDecoration: 'none', fontWeight: 600 }}>support@myhomestyler.com</a>
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'var(--brand-color)', color: '#fff',
              border: 'none', borderRadius: '0.6rem',
              padding: '0.5rem 1.25rem',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
