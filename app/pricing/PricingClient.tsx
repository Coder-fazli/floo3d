'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NumberFlow from '@number-flow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, Check, Star, Zap, Shield, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';

const plans = [
  {
    id: 'free',
    name: 'Free',
    icon: Star,
    price: {
      oneTime: 'Free forever',
    },
    description: 'Perfect for trying out MyHomeStyler. No credit card required.',
    features: [
      '10 credits — 5 AI renders',
      'All 4 AI tools included',
      'Standard quality (1024px)',
      'Download as PNG / JPG',
      'Personal use only',
    ],
    lockedFeatures: [
      'HD quality export',
      'PDF export',
      'No watermark',
    ],
    cta: 'Get started free',
    href: '/sign-up',
  },
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    price: {
      oneTime: 9,
    },
    credits: 100,
    description: 'Great for homeowners and designers working on a project.',
    features: [
      '100 credits — 50 AI renders',
      'All 4 AI tools included',
      'HD quality renders',
      'PNG, JPG & PDF export',
      'No watermark',
      'Commercial usage rights',
      'Priority support',
    ],
    cta: 'Buy Starter',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Shield,
    price: {
      oneTime: 24,
    },
    credits: 300,
    description: 'Highest accuracy AI renders powered by Gemini 3 Pro — for architects, agencies and real estate professionals.',
    features: [
      '300 credits — 150 AI renders',
      'All Starter features',
      'Isometric & cross-section views',
      'Gemini 3 Pro — highest accuracy',
      'Superior detail & realism',
      'PNG, JPG & PDF export',
      'Commercial usage rights',
      'Priority support',
    ],
    cta: 'Buy Pro',
  },
];

export default function PricingClient() {
  const [mounted, setMounted] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { openSignUp } = useClerk();
  const { isSignedIn } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBuy = async (planId: string) => {
    if (!isSignedIn) {
      localStorage.setItem("pendingPlan", planId);
      openSignUp({ fallbackRedirectUrl: "/pricing" });
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, returnUrl: `${window.location.origin}/dashboard` }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    if (!isSignedIn) return;
    const pending = localStorage.getItem("pendingPlan");
    if (pending) {
      localStorage.removeItem("pendingPlan");
      handleBuy(pending);
    }
  }, [isSignedIn]);

  if (!mounted) return null;

  return (
    <div className="not-prose relative flex w-full flex-col gap-16 px-4 py-24 text-center sm:px-8" style={{ overflow: 'visible' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-[50%] h-[40%] w-[60%] -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'rgba(229,72,77,0.08)' }} />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full blur-3xl" style={{ background: 'rgba(229,72,77,0.05)' }} />
        <div className="absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full blur-3xl" style={{ background: 'rgba(229,72,77,0.05)' }} />
      </div>

      <div className="flex flex-col items-center justify-center gap-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <Badge
            variant="outline"
            className="mb-4 rounded-full px-4 py-1 text-sm font-medium"
            style={{ borderColor: 'rgba(229,72,77,0.2)', background: 'rgba(229,72,77,0.05)', color: '#e5484d' }}
          >
            <Sparkles className="mr-1 h-3.5 w-3.5 animate-pulse" style={{ color: '#e5484d' }} />
            Pricing Plans
          </Badge>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold sm:text-5xl"
            style={{ color: '#0f172a', letterSpacing: '-0.03em' }}
          >
            Pick the perfect plan for your needs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-md pt-2 text-lg"
            style={{ color: '#64748b' }}
          >
            One-time credit purchases. No subscriptions, no hidden fees, no surprises.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="mt-8 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3" style={{ paddingTop: '2rem', overflow: 'visible' }}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex"
              style={{ overflow: 'visible', position: 'relative' }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-14px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                  <Badge className="rounded-full px-4 py-1 shadow-sm" style={{ background: '#e5484d', color: '#fff', whiteSpace: 'nowrap' }}>
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Fan Favorite
                  </Badge>
                </div>
              )}
              {plan.id === 'pro' && (
                <div style={{ position: 'absolute', top: '-14px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                  <Badge className="rounded-full px-4 py-1 shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', whiteSpace: 'nowrap' }}>
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Best Quality
                  </Badge>
                </div>
              )}
              <Card
                className={cn(
                  'relative h-full w-full text-left transition-all duration-300 hover:shadow-lg',
                  plan.popular ? 'shadow-md' : '',
                )}
                style={
                  plan.id === 'pro' ? {
                    outline: '2px solid rgba(99,102,241,0.5)',
                    outlineOffset: '0px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.04))',
                    boxShadow: '0 0 40px rgba(99,102,241,0.12), 0 8px 32px rgba(0,0,0,0.08)',
                  } : plan.popular ? {
                    outline: '2px solid rgba(229,72,77,0.5)',
                    outlineOffset: '0px',
                    background: 'linear-gradient(to bottom, rgba(236,91,19,0.03), transparent)',
                  } : {}
                }
              >

                <CardHeader className={cn('pb-4', plan.popular && 'pt-6')}>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={plan.popular
                        ? { background: 'rgba(229,72,77,0.1)', color: '#e5484d' }
                        : { background: '#f1f5f9', color: '#475569' }}
                    >
                      <plan.icon className="h-4 w-4" />
                    </div>
                    <CardTitle
                      className="text-xl font-bold"
                      style={{ color: plan.popular ? '#e5484d' : '#0f172a' }}
                    >
                      {plan.name}
                    </CardTitle>
                  </div>

                  <CardDescription className="mt-3 space-y-2">
                    <p className="text-sm" style={{ color: '#334155', fontWeight: 600 }}>{plan.description}</p>
                    <div className="pt-2">
                      {typeof plan.price.oneTime === 'number' ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-1">
                            <NumberFlow
                              className="text-3xl font-bold"
                              style={{ color: plan.id === 'pro' ? '#6366f1' : plan.popular ? '#e5484d' : '#0f172a' }}
                              format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                              value={plan.price.oneTime}
                            />
                            <span className="text-sm" style={{ color: '#94a3b8' }}>one-time · {plan.credits} credits</span>
                          </div>
                          {plan.id === 'pro' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>☕ Less than a coffee a week</span>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>$0.17 per render · 150 renders total</span>
                            </div>
                          )}
                          {plan.id === 'starter' && (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>$0.20 per render · 50 renders total</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-2xl font-bold" style={{ color: '#0f172a' }}>
                          {plan.price.oneTime}
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3 pb-6">
                  {plan.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                        style={plan.popular
                          ? { background: 'rgba(229,72,77,0.1)', color: '#e5484d' }
                          : { background: '#f1f5f9', color: '#64748b' }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span style={{ color: plan.popular ? '#0f172a' : '#64748b' }}>{feature}</span>
                    </motion.div>
                  ))}
                  {'lockedFeatures' in plan && (plan as any).lockedFeatures.map((feature: string, i: number) => (
                    <motion.div
                      key={`locked-${i}`}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + (plan.features.length + i) * 0.05 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: '#f1f5f9', color: '#cbd5e1' }}
                      >
                        <Lock className="h-3 w-3" />
                      </div>
                      <span style={{ color: '#cbd5e1', textDecoration: 'line-through' }}>{feature}</span>
                    </motion.div>
                  ))}
                </CardContent>

                <CardFooter style={{ flexDirection: 'column', gap: '0.5rem' }}>
                  {plan.href ? (
                    <Link href={plan.href} className="w-full">
                      <button
                        className="w-full rounded-lg border py-2.5 px-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                        style={{ borderColor: '#e2e8f0', color: '#0f172a', background: '#fff' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(236,91,19,0.3)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#e5484d';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                          (e.currentTarget as HTMLButtonElement).style.color = '#0f172a';
                        }}
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  ) : (
                    <button
                      className="w-full rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                      style={plan.popular
                        ? { background: '#e5484d', color: '#fff', border: 'none' }
                        : { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}
                      disabled={loadingPlan === plan.id}
                      onClick={() => handleBuy(plan.id)}
                      onMouseEnter={e => {
                        if (!plan.popular) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(236,91,19,0.3)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#e5484d';
                        } else {
                          (e.currentTarget as HTMLButtonElement).style.background = '#cc2f34';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!plan.popular) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                          (e.currentTarget as HTMLButtonElement).style.color = '#0f172a';
                        } else {
                          (e.currentTarget as HTMLButtonElement).style.background = '#e5484d';
                        }
                      }}
                    >
                      {loadingPlan === plan.id ? "Redirecting..." : plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {!plan.href && (
                    <p style={{ fontSize: '0.68rem', color: '#cbd5e1', textAlign: 'center', margin: 0 }}>
                      By purchasing you agree to our{' '}
                      <Link href="/terms-of-service" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Terms</Link>
                      {' '}&{' '}
                      <Link href="/privacy-policy" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Privacy Policy</Link>
                    </p>
                  )}
                </CardFooter>

                {plan.popular && (
                  <div className="pointer-events-none absolute inset-0 rounded-lg" style={{ border: '1px solid rgba(229,72,77,0.2)' }} />
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ width: '100%', maxWidth: '720px', background: '#fff', borderRadius: '1rem', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #f1f5f9' }}>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left', color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</th>
                <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Free</th>
                <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#e5484d', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Starter</th>
                <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#6366f1', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'AI renders',         free: '5',               starter: '50',              pro: '150' },
                { label: 'Quality',            free: 'Standard 1024px', starter: 'HD',              pro: 'HD + Gemini 3 Pro' },
                { label: 'Cost per render',    free: '—',               starter: '$0.20',           pro: '$0.17' },
                { label: 'Watermark',          free: '✓',               starter: '✗',               pro: '✗' },
                { label: 'PDF export',         free: '✗',               starter: '✓',               pro: '✓' },
                { label: 'Isometric views',    free: '✗',               starter: '✗',               pro: '✓' },
                { label: 'Commercial use',     free: '✗',               starter: '✓',               pro: '✓' },
                { label: 'Credits expire',     free: 'No',              starter: 'No',              pro: 'No' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i < 7 ? '1px solid #f8fafc' : 'none', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '0.75rem 1.25rem', color: '#334155', fontWeight: 600 }}>{row.label}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94a3b8' }}>{row.free}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#e5484d', fontWeight: 600 }}>{row.starter}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6366f1', fontWeight: 700 }}>{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-sm"
          style={{ color: '#94a3b8' }}
        >
          All plans include access to all 4 AI tools. 2 credits per render. Credits never expire. Secure checkout via Stripe.
        </motion.p>
      </div>
    </div>
  );
}
