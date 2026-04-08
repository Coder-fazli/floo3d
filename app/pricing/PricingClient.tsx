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
      <Card className="border border-neutral-200 bg-white shadow-lg">
        <CardHeader className="text-left pb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
              <Zap size={18} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Custom Pack</h3>
              <p className="text-xs text-gray-500">Pay exactly what you need — no subscription</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {/* Price display */}
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold text-gray-900">
              $<NumberFlow value={price} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
            </span>
            <div className="text-sm text-gray-500 leading-tight">
              <div className="font-semibold text-orange-500">{credits} credits</div>
              <div>{renders} renders · ${perRender}/render</div>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>50 cr</span>
              <span>1,000 cr</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={STEPS.length - 1}
                step={1}
                value={stepIdx}
                onChange={e => setStepIdx(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ec5b13 ${pct}%, #e2e8f0 ${pct}%)`,
                  accentColor: '#ec5b13',
                }}
              />
            </div>
            {/* Step labels */}
            <div className="flex justify-between text-xs text-gray-400">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStepIdx(i)}
                  className={cn(
                    'font-medium transition-colors',
                    i === stepIdx ? 'text-orange-500' : 'hover:text-gray-600'
                  )}
                >
                  {s >= 1000 ? '1k' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Volume discount badge */}
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
            <Sparkles size={14} className="text-orange-500 flex-shrink-0" />
            <span className="text-sm font-medium text-orange-700">
              {credits < 100  && 'Standard rate — $0.12/credit'}
              {credits >= 100 && credits < 300  && '10% volume discount applied — $0.10/credit'}
              {credits >= 300 && credits < 600  && '15% volume discount applied — $0.085/credit'}
              {credits >= 600 && '31% volume discount applied — $0.069/credit'}
            </span>
          </div>

          {/* What you get — 2 columns */}
          <div className="pt-2 border-t border-neutral-100">
            <h4 className="text-sm font-semibold uppercase text-gray-400 tracking-wide mb-3">Includes</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                `${credits} credits (${renders} AI renders)`,
                'HD quality renders + no watermark',
                'All 4 AI tools included',
                'PNG, JPG & PDF export',
                'Credits never expire',
                'Commercial usage rights',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-5 w-5 bg-white border border-orange-500 rounded-full grid place-content-center flex-shrink-0">
                    <CheckCheck className="h-3 w-3 text-orange-500" />
                  </span>
                  <span className="text-xs text-gray-600 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buy button */}
          <GlowButton
            label={loading ? 'Redirecting…' : `Buy ${credits} Credits — $${price.toFixed(2)}`}
            onClick={() => onBuy(credits, price)}
          />

          <p className="text-xs text-gray-400 text-center">
            Secure checkout via Stripe ·{' '}
            <Link href="/terms-of-service" className="underline hover:text-gray-600">Terms</Link>
            {' '}&{' '}
            <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy</Link>
          </p>
        </CardContent>
      </Card>
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
      <div className="w-full absolute inset-0 h-full z-0 bg-[radial-gradient(circle,_black_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_white_1px,_transparent_1px)] opacity-10 [background-size:20px_20px] pointer-events-none" />

      {/* Header */}
      <article className="text-center mb-10 space-y-4">
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
          We've got a plan that's perfect for you
        </h2>
        <p className="text-base text-gray-500 max-w-lg mx-auto">
          One-time credit purchases — no subscriptions, no hidden fees. Use credits across all 4 AI tools. They never expire.
        </p>
        <PricingSwitch selected={tab} onSwitch={setTab} />
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
            <div className="grid md:grid-cols-3 gap-5 py-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative border text-left transition-all duration-200 hover:shadow-md',
                    plan.popular
                      ? 'ring-2 ring-orange-500 bg-orange-50'
                      : 'border-neutral-200 bg-white',
                  )}
                >
                  <CardHeader className="text-left">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
                        {plan.name} Plan
                      </h3>
                      {plan.popular && (
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold text-gray-900">
                        $<NumberFlow value={plan.price} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} className="text-4xl font-semibold" />
                      </span>
                      <span className="text-gray-500 ml-1 text-sm">one-time · {plan.credits} credits</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {/* Buy button */}
                    <GlowButton
                      label={loadingPlan === plan.id ? 'Redirecting…' : plan.cta}
                      onClick={() => handleBuy(plan.id)}
                      className={plan.popular ? '' : 'glow-btn-dark'}
                    />

                    {/* Features */}
                    <div className="space-y-2.5 pt-3 border-t border-neutral-200">
                      <h4 className="text-sm font-semibold uppercase text-gray-400 tracking-wide mb-3">
                        Features
                      </h4>
                      <p className="font-semibold text-sm text-gray-800">{plan.includes[0]}</p>
                      <ul className="space-y-2">
                        {plan.includes.slice(1).map((f, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <span className="h-5 w-5 bg-white border border-orange-500 rounded-full grid place-content-center flex-shrink-0">
                              <CheckCheck className="h-3 w-3 text-orange-500" />
                            </span>
                            <span className="text-sm text-gray-600 font-medium">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-gray-400 text-center pt-1">
                      <Link href="/terms-of-service" className="underline">Terms</Link>
                      {' '}&{' '}
                      <Link href="/privacy-policy" className="underline">Privacy Policy</Link>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 w-full max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
            >
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="py-3 px-5 text-left text-xs font-bold uppercase text-gray-400 tracking-wider">Feature</th>
                    <th className="py-3 px-4 text-center text-xs font-bold uppercase text-gray-700">Starter</th>
                    <th className="py-3 px-4 text-center text-xs font-bold uppercase text-orange-500">Pro</th>
                    <th className="py-3 px-4 text-center text-xs font-bold uppercase text-amber-500">Elite</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'AI renders',      starter: '50',        pro: '150',              elite: '150' },
                    { label: 'AI model',        starter: 'Standard',  pro: 'Standard',         elite: 'Highest accuracy' },
                    { label: 'Cost per render', starter: '$0.20',     pro: '$0.17',            elite: '$0.33' },
                    { label: 'No watermark',    starter: '✓',         pro: '✓',               elite: '✓' },
                    { label: 'PDF export',      starter: '✓',         pro: '✓',               elite: '✓' },
                    { label: 'Isometric views', starter: '✗',         pro: '✓',               elite: '✓' },
                    { label: 'Material detail', starter: 'HD',        pro: 'HD',               elite: 'Superior' },
                    { label: 'Commercial use',  starter: '✓',         pro: '✓',               elite: '✓' },
                    { label: 'Credits expire',  starter: 'Never',     pro: 'Never',            elite: 'Never' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-5 font-semibold text-gray-700">{row.label}</td>
                      <td className="py-3 px-4 text-center text-gray-600 font-medium">{row.starter}</td>
                      <td className="py-3 px-4 text-center text-orange-500 font-bold">{row.pro}</td>
                      <td className="py-3 px-4 text-center text-amber-500 font-bold">{row.elite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <p className="text-sm text-gray-400 text-center mt-8">
              All plans include access to all 4 AI tools · 2 credits per render · Credits never expire · Secure checkout via Stripe
            </p>
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
