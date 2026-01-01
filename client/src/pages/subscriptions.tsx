import { useQuery } from "@tanstack/react-query";
import { CreditCard, Check, Zap, Crown, Shield, ArrowRight, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const plans = [
  {
    tier: "basic",
    name: "Basic",
    price: "$9.99",
    period: "month",
    icon: CreditCard,
    features: [
      "50 rubrics maximum",
      "200 uploads per month",
      "Custom rubrics",
      "Template access",
      "AI grading",
      "Email support",
    ],
    notIncluded: [
      "Anonymizer app",
      "User dashboard",
      "Analytics dashboard",
      "Error tracking",
      "Academic integrity checks",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: "$19.99",
    period: "month",
    icon: Zap,
    popular: true,
    features: [
      "100 rubrics maximum",
      "500 uploads per month",
      "Everything in Basic",
      "Anonymizer app access",
      "Advanced rubrics",
      "Priority email support",
    ],
    notIncluded: [
      "User dashboard",
      "Analytics dashboard",
      "Error tracking",
      "Academic integrity checks",
    ],
  },
  {
    tier: "plus",
    name: "Plus",
    price: "$29.99",
    period: "month",
    icon: Crown,
    features: [
      "Unlimited rubrics",
      "1,500 uploads per month",
      "Everything in Pro",
      "User dashboard access",
      "Full analytics dashboard",
      "Error pattern tracking",
      "Academic integrity checks",
      "Plagiarism detection",
      "AI content detection",
      "Citation issue tracking",
    ],
    notIncluded: [],
  },
];

function PlanCard({ plan, currentTier, onUpgrade }: any) {
  const isCurrentPlan = currentTier === plan.tier;
  const Icon = plan.icon;

  return (
    <Card className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">{plan.price}</span>
              <span className="text-muted-foreground">/{plan.period}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {plan.features.map((feature: string, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
          {plan.notIncluded && plan.notIncluded.length > 0 && (
            <>
              {plan.notIncluded.map((feature: string, index: number) => (
                <div key={`not-${index}`} className="flex items-start gap-2 opacity-50">
                  <div className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm line-through">{feature}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
          disabled={isCurrentPlan}
          onClick={() => onUpgrade(plan.tier)}
        >
          {isCurrentPlan ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Current Plan
            </>
          ) : (
            <>
              Upgrade to {plan.name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Subscriptions() {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['/api/user/subscription'],
    queryFn: async () => {
      const response = await fetch('/api/user/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      return data.subscription;
    },
  });

  const { data: features } = useQuery({
    queryKey: ['/api/user/features'],
    queryFn: async () => {
      const response = await fetch('/api/user/features', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch features');
      return response.json();
    },
  });

  const handleUpgrade = async (tier: string) => {
    setIsUpgrading(true);
    try {
      // TODO: Implement Stripe checkout
      // For now, just show a message
      toast({
        title: "Upgrade initiated",
        description: `You'll be redirected to checkout for the ${tier} plan`,
      });

      // In production, you would:
      // 1. Create Stripe checkout session
      // 2. Redirect to Stripe
      // 3. Handle webhook for successful payment
      // 4. Update subscription in database

    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      trial: "bg-yellow-100 text-yellow-800",
      basic: "bg-blue-100 text-blue-800",
      pro: "bg-purple-100 text-purple-800",
      plus: "bg-green-100 text-green-800",
      admin: "bg-red-100 text-red-800",
    };
    return colors[tier] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const isTrialActive = subscription?.tier === 'trial' && subscription?.status === 'active';
  const daysRemaining = subscription?.expires_at ? 
    Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the plan that works best for you
        </p>
      </div>

      {/* Current Subscription Card */}
      {subscription && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Current Subscription
                </CardTitle>
                <CardDescription>Your active plan and usage</CardDescription>
              </div>
              <Badge className={getTierBadge(subscription.tier)}>
                {subscription.tier.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {subscription.status === 'active' ? 'Expires' : 'Expired'} on
                  </p>
                  <p className="font-medium">
                    {subscription.expires_at ? formatDate(subscription.expires_at) : 'N/A'}
                  </p>
                </div>
              </div>

              {features?.uploadUsage && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Uploads</p>
                    <p className="font-medium">
                      {features.uploadUsage.current} / {features.uploadUsage.limit || '∞'} used
                    </p>
                  </div>
                </div>
              )}
            </div>

            {isTrialActive && daysRemaining > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining in your trial
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Upgrade now to continue using all features
                  </p>
                </div>
              </div>
            )}

            {subscription.status !== 'active' && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">
                    Your subscription has expired
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Choose a plan below to continue grading assignments
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feature Comparison */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Compare Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.tier}
              plan={plan}
              currentTier={subscription?.tier}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Can I change my plan later?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">What happens when I upgrade?</h3>
            <p className="text-sm text-muted-foreground">
              You'll get instant access to all features in your new plan. We'll prorate the charges based on your billing cycle.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards through our secure payment processor, Stripe.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! New users get a 7-day trial with access to all Plus features. No credit card required.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Absolutely. You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}