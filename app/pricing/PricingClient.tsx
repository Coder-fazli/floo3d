'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { CheckCheck, Zap, Shield, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Component as GlowButton } from '@/components/ui/glow-button';

type PricingSettings = {
  starterPrice: number; starterCredits: number; starterDescription: string; starterFeatures: string[];
  proPrice: number; proCredits: number; proDescription: string; proFeatures: string[];
  elitePrice: number; eliteCredits: number; eliteDescription: string; eliteFeatures: string[];
};

// ── Pricing FAQ Item ───────────────────────────────────────────────────────
function PricingFAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer"
      style={{ background: "#ffffff", border: "1px solid rgba(117,87,96,0.15)" }}
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-semibold text-sm pr-4" style={{ color: "#28030F" }}>{q}</span>
        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-transform" style={{ background: "rgba(235,66,3,0.08)", color: "var(--brand-color)", transform: open ? "rotate(45deg)" : "none" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </span>
      </div>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "#755760", borderTop: "1px solid rgba(117,87,96,0.08)" }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── Tab Switch (exact 21st.dev style) ──────────────────────────────────────
function PricingSwitch({ selected, onSwitch }: { selected: string; onSwitch: (v: string) => void }) {
  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-neutral-50 border border-gray-200 p-1">
        {[
          { value: '0', label: 'Credit Plans' },
          { value: '1', label: 'Custom Pack', badge: 'New' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => onSwitch(tab.value)}
            className={cn(
              'relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-4 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm flex items-center gap-2',
              selected === tab.value ? 'text-white' : 'text-muted-foreground hover:text-black',
            )}
          >
            {selected === tab.value && (
              <motion.span
                layoutId="pricingSwitch"
                className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm shadow-orange-600 border-orange-600 bg-gradient-to-t from-orange-500 via-orange-400 to-orange-600"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">{tab.label}</span>
            {tab.badge && (
              <span className="relative rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Custom credit slider ────────────────────────────────────────────────────
const STEPS = [50, 100, 150, 200, 300, 400, 500, 750, 1000];

function getPrice(credits: number): number {
  if (credits < 100)  return Math.round(credits * 0.12 * 100) / 100;
  if (credits < 300)  return Math.round(credits * 0.10 * 100) / 100;
  if (credits < 600)  return Math.round(credits * 0.085 * 100) / 100;
  return Math.round(credits * 0.069 * 100) / 100;
}

function CustomPlan({ onBuy, loading }: { onBuy: (credits: number, price: number) => void; loading: boolean }) {
  const [stepIdx, setStepIdx] = useState(2); // default 150 credits
  const credits = STEPS[stepIdx];
  const price   = getPrice(credits);
  const renders = Math.floor(credits / 2);

  const perRender = (price / renders).toFixed(3);
  const pct = (stepIdx / (STEPS.length - 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: `2px solid var(--brand-color)`, boxShadow: "0 20px 60px rgba(235,66,3,0.12)" }}>
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(235,66,3,0.08)", border: "1px solid rgba(235,66,3,0.2)" }}>
              <Zap size={18} style={{ color: "var(--brand-color)" }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold" style={{ color: "#28030F", fontFamily: "var(--font-playfair), Georgia, serif" }}>Custom Pack</h3>
              <p className="text-xs" style={{ color: "#755760" }}>Pay exactly what you need — no subscription</p>
            </div>
          </div>

          {/* Price display */}
          <div className="flex items-baseline gap-3 mb-6" style={{ flexWrap: "nowrap" }}>
            <span className="font-bold whitespace-nowrap" style={{ color: "#28030F", display: "inline-flex", alignItems: "baseline", fontSize: "3rem", flexShrink: 0 }}>
              <span>$</span><NumberFlow value={price} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
            </span>
            <div className="text-sm leading-tight">
              <div className="font-bold" style={{ color: "var(--brand-color)" }}>{credits} credits</div>
              <div style={{ color: "#755760" }}>{renders} renders · ${perRender}/render</div>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs font-medium" style={{ color: "#a08888" }}>
              <span>50 cr</span>
              <span>1,000 cr</span>
            </div>
            <input
              type="range"
              min={0}
              max={STEPS.length - 1}
              step={1}
              value={stepIdx}
              onChange={e => setStepIdx(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, "var(--brand-color)" ${pct}%, rgba(117,87,96,0.2) ${pct}%)`, accentColor: "var(--brand-color)" }}
            />
            <div className="flex justify-between text-xs">
              {STEPS.map((s, i) => (
                <button key={s} onClick={() => setStepIdx(i)}
                  className="font-medium transition-colors"
                  style={{ color: i === stepIdx ? "var(--brand-color)" : "#a08888" }}>
                  {s >= 1000 ? '1k' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Volume discount badge */}
          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-6" style={{ background: "rgba(235,66,3,0.06)", border: "1px solid rgba(235,66,3,0.15)" }}>
            <Sparkles size={14} style={{ color: "var(--brand-color)", flexShrink: 0 }} />
            <span className="text-sm font-medium" style={{ color: "var(--brand-color)" }}>
              {credits < 100  && 'Standard rate — $0.12/credit'}
              {credits >= 100 && credits < 300  && '10% volume discount — $0.10/credit'}
              {credits >= 300 && credits < 600  && '15% volume discount — $0.085/credit'}
              {credits >= 600 && '31% volume discount — $0.069/credit'}
            </span>
          </div>

          {/* Buy button */}
          <GlowButton
            label={loading ? 'Redirecting…' : `Buy ${credits} Credits — $${price.toFixed(2)}`}
            onClick={() => onBuy(credits, price)}
          />

          <p className="text-xs text-center mt-3" style={{ color: "#a08888" }}>
            🔒 Secure via Stripe ·{' '}
            <Link href="/terms-of-service" className="underline">Terms</Link>
            {' '}&{' '}
            <Link href="/privacy-policy" className="underline">Privacy</Link>
          </p>
        </div>

        {/* What you get */}
        <div className="px-6 pb-6 pt-4" style={{ borderTop: "1px solid rgba(117,87,96,0.12)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--brand-color)" }}>Includes</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {[
              `${credits} credits (${renders} AI renders)`,
              'HD quality renders + no watermark',
              'All 4 AI tools included',
              'PNG, JPG & PDF export',
              'Credits never expire',
              'Commercial usage rights',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full grid place-content-center flex-shrink-0" style={{ background: "rgba(235,66,3,0.08)", border: "1px solid rgba(235,66,3,0.3)" }}>
                  <CheckCheck className="h-3 w-3" style={{ color: "var(--brand-color)" }} />
                </span>
                <span className="text-xs font-medium" style={{ color: "#755760" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function PricingClient({ pricingSettings }: { pricingSettings?: PricingSettings }) {
  const [tab, setTab] = useState('0');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { openSignUp } = useClerk();
  const { isSignedIn } = useUser();

  useEffect(() => { setMounted(true); }, []);

  const plans = [
    {
      id: 'starter', name: 'Starter', Icon: Zap,
      price: pricingSettings?.starterPrice ?? 9.99,
      credits: pricingSettings?.starterCredits ?? 100,
      description: pricingSettings?.starterDescription ?? 'Great for homeowners and designers working on a single project.',
      includes: [
        'Free includes:',
        '100 credits — 50 AI renders',
        'All 4 AI tools included',
        'HD quality renders',
        'PNG, JPG & PDF export',
        'No watermark',
        'Commercial usage rights',
      ],
      cta: 'Get Starter',
    },
    {
      id: 'pro', name: 'Pro', Icon: Shield,
      price: pricingSettings?.proPrice ?? 24.99,
      credits: pricingSettings?.proCredits ?? 300,
      description: pricingSettings?.proDescription ?? 'Best value for designers who need results fast.',
      popular: true,
      includes: [
        'Everything in Starter, plus:',
        '300 credits — 150 AI renders',
        'Isometric & cross-section views',
        'More design styles',
        'Priority generation queue',
        'Up to 3 active projects',
        '$0.17 per render',
      ],
      cta: 'Get Pro',
    },
    {
      id: 'elite', name: 'Elite', Icon: Star,
      price: pricingSettings?.elitePrice ?? 49.99,
      credits: pricingSettings?.eliteCredits ?? 300,
      description: pricingSettings?.eliteDescription ?? 'Highest accuracy AI — for architects, agencies and real estate professionals.',
      includes: [
        'Everything in Pro, plus:',
        'Highest accuracy AI model',
        'Superior material & texture detail',
        'Sharper architectural lines',
        'Best for client presentations',
        'Priority support',
        'Commercial usage rights',
      ],
      cta: 'Get Elite',
    },
  ];

  const handleBuy = async (planId: string) => {
    if (!isSignedIn) {
      localStorage.setItem('pendingPlan', planId);
      openSignUp({ fallbackRedirectUrl: '/pricing' });
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, returnUrl: `${window.location.origin}/dashboard` }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCustomBuy = async (credits: number, price: number) => {
    if (!isSignedIn) {
      openSignUp({ fallbackRedirectUrl: '/pricing' });
      return;
    }
    setLoadingPlan('custom');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'custom', credits, price, returnUrl: `${window.location.origin}/dashboard` }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    if (!isSignedIn) return;
    const pending = localStorage.getItem('pendingPlan');
    if (pending) { localStorage.removeItem('pendingPlan'); handleBuy(pending); }
  }, [isSignedIn]);

  if (!mounted) return null;

  return (
    <div className="px-4 pt-16 pb-24 min-h-screen max-w-7xl mx-auto relative">

      {/* Header */}
      <article className="text-center mb-10 space-y-4">
        <span className="inline-block text-xs font-black tracking-widest uppercase mb-2" style={{ color: "var(--brand-color)" }}>Pricing</span>
        <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: "#28030F", fontFamily: "var(--font-playfair), Georgia, serif" }}>
          One-time credits.<br />No subscription ever.
        </h2>
        <p className="text-base max-w-lg mx-auto" style={{ color: "#755760" }}>
          Pay once, use across all 4 AI tools. Credits never expire — no monthly fees, no surprises.
        </p>
        <PricingSwitch selected={tab} onSwitch={setTab} />

        {/* Trust bar */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {[
            { icon: "★", text: "2,547 architects & designers" },
            { icon: "🔒", text: "Secure checkout via Stripe" },
            { icon: "∞", text: "Credits never expire" },
            { icon: "⚡", text: "All 4 AI tools included" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: "#ffffff", border: "1px solid rgba(117,87,96,0.2)", color: "#28030F" }}>
              <span style={{ color: "var(--brand-color)" }}>{t.icon}</span>
              {t.text}
            </div>
          ))}
        </div>
      </article>

      {/* Plans tab */}
      <AnimatePresence mode="wait">
        {tab === '0' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid md:grid-cols-3 gap-5 py-4 items-start">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn('relative rounded-2xl text-left transition-all duration-200', plan.popular ? 'md:-mt-4 md:mb-4' : '')}
                  style={plan.popular ? {
                    background: "#ffffff",
                    border: `2px solid var(--brand-color)`,
                    boxShadow: "0 20px 60px rgba(235,66,3,0.18), 0 4px 20px rgba(235,66,3,0.1)",
                  } : plan.id === 'elite' ? {
                    background: "#28030F",
                    border: "1px solid rgba(235,66,3,0.3)",
                  } : {
                    background: "#ffffff",
                    border: "1px solid rgba(117,87,96,0.2)",
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase text-white" style={{ background: "var(--brand-color)" }}>
                        ★ Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-2xl font-bold" style={{ color: plan.id === 'elite' ? "#FDF6F2" : "#28030F", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                        {plan.name}
                      </h3>
                      {plan.id === 'elite' && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(235,66,3,0.2)", color: "var(--brand-color)" }}>
                          Best AI
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-4" style={{ color: plan.id === 'elite' ? "rgba(253,246,242,0.6)" : "#755760" }}>{plan.description}</p>
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-5xl font-bold whitespace-nowrap" style={{ color: plan.id === 'elite' ? "#FDF6F2" : "#28030F", display: "inline-flex", alignItems: "baseline" }}>
                        <span>$</span><NumberFlow value={plan.price} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                      </span>
                      <span className="text-sm ml-1" style={{ color: plan.id === 'elite' ? "rgba(253,246,242,0.5)" : "#755760" }}>one-time · {plan.credits} credits</span>
                    </div>

                    {/* CTA */}
                    <GlowButton
                      label={loadingPlan === plan.id ? 'Redirecting…' : plan.cta}
                      onClick={() => handleBuy(plan.id)}
                    />

                    {/* Trust signal */}
                    <p className="text-xs text-center mt-3" style={{ color: plan.id === 'elite' ? "rgba(253,246,242,0.4)" : "#a08888" }}>
                      🔒 Secure via Stripe · Credits never expire
                    </p>
                  </div>

                  {/* Features */}
                  <div className="px-6 pb-6 pt-3" style={{ borderTop: plan.id === 'elite' ? "1px solid rgba(253,246,242,0.1)" : "1px solid rgba(117,87,96,0.12)" }}>
                    <p className="font-bold text-xs uppercase tracking-widest mb-3" style={{ color: plan.id === 'elite' ? "rgba(253,246,242,0.5)" : "var(--brand-color)" }}>{plan.includes[0]}</p>
                    <ul className="space-y-2.5">
                      {plan.includes.slice(1).map((f, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="h-5 w-5 rounded-full grid place-content-center flex-shrink-0" style={{ background: plan.id === 'elite' ? "rgba(235,66,3,0.2)" : "rgba(235,66,3,0.08)", border: "1px solid rgba(235,66,3,0.4)" }}>
                            <CheckCheck className="h-3 w-3" style={{ color: "var(--brand-color)" }} />
                          </span>
                          <span className="text-sm font-medium" style={{ color: plan.id === 'elite' ? "rgba(253,246,242,0.8)" : "#755760" }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>


{/* FAQ */}
            <div className="w-full max-w-3xl mx-auto mt-14">
              <h3 className="text-center text-2xl font-bold mb-8" style={{ color: "#28030F", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Common Questions
              </h3>
              <div className="space-y-3">
                {[
                  {
                    q: "What if I don't use all my credits?",
                    a: "Credits never expire — ever. Buy today, use them 2 years from now. No pressure, no deadline."
                  },
                  {
                    q: "Is it really a one-time payment?",
                    a: "Yes. No monthly fees, no subscriptions, no hidden charges. You pay once and own those credits."
                  },
                  {
                    q: "What quality renders do I get?",
                    a: "All plans output HD renders with no watermark. Elite uses our highest-accuracy AI model for sharper lines and superior material detail — ideal for client presentations."
                  },
                  {
                    q: "Can I use the renders commercially?",
                    a: "Yes. Every plan includes full commercial usage rights. Use them in proposals, listings, presentations, or sell them to clients."
                  },
                  {
                    q: "How many credits does one render cost?",
                    a: "Every render costs 2 credits regardless of which tool you use — floor plan to 3D, room redesign, virtual staging, or outdoor design."
                  },
                ].map((item, i) => (
                  <PricingFAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Custom tab */}
        {tab === '1' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="py-4"
          >
            <CustomPlan onBuy={handleCustomBuy} loading={loadingPlan === 'custom'} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
