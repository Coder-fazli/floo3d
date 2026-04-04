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
    description: 'For architects, agencies, and real estate professionals.',
    features: [
      '300 credits — 150 AI renders',
      'All Starter features',
      'Isometric & cross-section views',
      'HD quality renders',
      'PNG, JPG & PDF export',
      'Commercial usage rights',
      'Priority support',
    ],
    cta: 'Buy Pro',
  },
];

export default function PricingClient() {
  const [mounted, setMounted] = useState(false);
  const { openSignUp } = useClerk();
  const { isSignedIn } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

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
              style={{ overflow: 'visible' }}
            >
              {plan.popular && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-16px', position: 'relative', zIndex: 10 }}>
                  <Badge
                    className="rounded-full px-4 py-1 shadow-sm"
                    style={{ background: '#e5484d', color: '#fff' }}
                  >
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Best Value
                  </Badge>
                </div>
              )}
              <Card
                className={cn(
                  'relative h-full w-full text-left transition-all duration-300 hover:shadow-lg',
                  plan.popular ? 'shadow-md' : '',
                )}
                style={plan.popular ? {
                  outline: '2px solid rgba(229,72,77,0.5)',
                  outlineOffset: '0px',
                  background: 'linear-gradient(to bottom, rgba(236,91,19,0.03), transparent)',
                } : {}}
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
                    <p className="text-sm" style={{ color: '#64748b' }}>{plan.description}</p>
                    <div className="pt-2">
                      {typeof plan.price.oneTime === 'number' ? (
                        <div className="flex items-baseline gap-1">
                          <NumberFlow
                            className="text-3xl font-bold"
                            style={{ color: plan.popular ? '#e5484d' : '#0f172a' }}
                            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                            value={plan.price.oneTime}
                          />
                          <span className="text-sm" style={{ color: '#94a3b8' }}>one-time · {plan.credits} credits</span>
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

                <CardFooter>
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
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </CardFooter>

                {plan.popular && (
                  <div className="pointer-events-none absolute inset-0 rounded-lg" style={{ border: '1px solid rgba(229,72,77,0.2)' }} />
                )}
              </Card>
            </motion.div>
          ))}
        </div>

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
