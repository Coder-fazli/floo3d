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
import { Sparkles, ArrowRight, Check, Star, Zap, Shield } from 'lucide-react';
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
      '10 credits on signup',
      '1 credit = 1 AI generation',
      'All 4 AI tools included',
      'Download your renders',
      'Basic support',
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
    credits: 50,
    description: 'Great for homeowners and designers working on a project.',
    features: [
      '50 credits — never expire',
      '2D to 3D floor plan converter',
      'AI interior design',
      'AI floor plan generator',
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
    credits: 150,
    description: 'For architects, agencies, and real estate professionals.',
    features: [
      '150 credits — never expire',
      'All Starter features',
      'Isometric & cross-section views',
      'Bulk project generation',
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
    <div className="not-prose relative flex w-full flex-col gap-16 overflow-hidden px-4 py-24 text-center sm:px-8">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-[50%] h-[40%] w-[60%] -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'rgba(236,91,19,0.08)' }} />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full blur-3xl" style={{ background: 'rgba(236,91,19,0.05)' }} />
        <div className="absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full blur-3xl" style={{ background: 'rgba(236,91,19,0.05)' }} />
      </div>

      <div className="flex flex-col items-center justify-center gap-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <Badge
            variant="outline"
            className="mb-4 rounded-full px-4 py-1 text-sm font-medium"
            style={{ borderColor: 'rgba(236,91,19,0.2)', background: 'rgba(236,91,19,0.05)', color: '#ec5b13' }}
          >
            <Sparkles className="mr-1 h-3.5 w-3.5 animate-pulse" style={{ color: '#ec5b13' }} />
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
        <div className="mt-8 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex"
            >
              <Card
                className={cn(
                  'relative h-full w-full text-left transition-all duration-300 hover:shadow-lg',
                  plan.popular
                    ? 'shadow-md'
                    : '',
                )}
                style={plan.popular ? {
                  outline: '2px solid rgba(236,91,19,0.5)',
                  outlineOffset: '0px',
                  background: 'linear-gradient(to bottom, rgba(236,91,19,0.03), transparent)',
                } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-0 left-0 mx-auto w-fit">
                    <Badge
                      className="rounded-full px-4 py-1 shadow-sm"
                      style={{ background: '#ec5b13', color: '#fff' }}
                    >
                      <Sparkles className="mr-1 h-3.5 w-3.5" />
                      Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className={cn('pb-4', plan.popular && 'pt-8')}>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={plan.popular
                        ? { background: 'rgba(236,91,19,0.1)', color: '#ec5b13' }
                        : { background: '#f1f5f9', color: '#475569' }}
                    >
                      <plan.icon className="h-4 w-4" />
                    </div>
                    <CardTitle
                      className="text-xl font-bold"
                      style={{ color: plan.popular ? '#ec5b13' : '#0f172a' }}
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
                            style={{ color: plan.popular ? '#ec5b13' : '#0f172a' }}
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
                          ? { background: 'rgba(236,91,19,0.1)', color: '#ec5b13' }
                          : { background: '#f1f5f9', color: '#64748b' }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span style={{ color: plan.popular ? '#0f172a' : '#64748b' }}>{feature}</span>
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
                          (e.currentTarget as HTMLButtonElement).style.color = '#ec5b13';
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
                        ? { background: '#ec5b13', color: '#fff', border: 'none' }
                        : { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}
                      onMouseEnter={e => {
                        if (!plan.popular) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(236,91,19,0.3)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#ec5b13';
                        } else {
                          (e.currentTarget as HTMLButtonElement).style.background = '#d4510f';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!plan.popular) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                          (e.currentTarget as HTMLButtonElement).style.color = '#0f172a';
                        } else {
                          (e.currentTarget as HTMLButtonElement).style.background = '#ec5b13';
                        }
                      }}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </CardFooter>

                {plan.popular && (
                  <div className="pointer-events-none absolute inset-0 rounded-lg" style={{ border: '1px solid rgba(236,91,19,0.2)' }} />
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
          All plans include access to all 4 AI tools. Credits never expire. Secure checkout via Stripe.
        </motion.p>
      </div>
    </div>
  );
}
