import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileText, Upload, PenTool, Clock, CheckCircle, AlertTriangle, TrendingUp, Plus, ArrowRight, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Rubric } from "@shared/schema";

const stats = [
  { label: "Assignments Graded", value: "0", icon: FileText, trend: "Start grading today" },
  { label: "Time Saved", value: "0 hrs", icon: Clock, trend: "Track your efficiency" },
  { label: "Average Grade", value: "--", icon: TrendingUp, trend: "No data yet" },
  { label: "Pending Review", value: "0", icon: AlertTriangle, trend: "You're all caught up" },
];

const quickActions = [
  {
    title: "Upload Assignments",
    description: "Bulk upload up to 400+ assignments for grading",
    icon: Upload,
    href: "/upload",
    primary: true,
  },
  {
    title: "Create Rubric",
    description: "Build a custom grading rubric for your course",
    icon: PenTool,
    href: "/rubric-builder",
    primary: false,
  },
];

function SubscriptionCard() {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { data: subscription, refetch } = useQuery({
    queryKey: ['/api/subscription'],
    queryFn: () => api.getSubscription(),
  });

  const handleUpgrade = async (tier: string) => {
    setIsUpgrading(true);
    try {
      const response = await api.upgradeSubscription(tier);
      if (response.success) {
        toast({
          title: "Subscription upgraded!",
          description: `You're now on the ${tier} plan.`,
        });
        refetch();
      }
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      trial: "bg-yellow-100 text-yellow-800",
      basic: "bg-blue-100 text-blue-800",
      pro: "bg-purple-100 text-purple-800",
      enterprise: "bg-green-100 text-green-800",
    };
    return colors[tier] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!subscription) {
    return <Skeleton className="h-48" />;
  }

  const isTrialActive = subscription.tier === 'trial' && subscription.subscriptionActive;
  const daysRemaining = subscription.expiresAt ? 
    Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Status
            </CardTitle>
            <CardDescription>Manage your subscription and access</CardDescription>
          </div>
          <Badge className={getTierBadge(subscription.tier || 'trial')}>
            {(subscription.tier || 'trial').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {subscription.subscriptionActive ? 'Expires' : 'Expired'} on:
            </span>
          </div>
          <span className="font-medium">
            {subscription.expiresAt ? formatDate(subscription.expiresAt) : 'N/A'}
          </span>
        </div>

        {isTrialActive && daysRemaining > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining in your trial
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Upgrade now to continue using all features
            </p>
          </div>
        )}

        {!subscription.subscriptionActive && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              Your subscription has expired
            </p>
            <p className="text-xs text-red-700 mt-1">
              Upgrade to continue grading assignments
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {isTrialActive && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="default">
                  Upgrade Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choose Your Plan</DialogTitle>
                  <DialogDescription>
                    Select the plan that works best for you
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleUpgrade('basic')}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Basic</h3>
                        <span className="text-2xl font-bold">$9.99<span className="text-sm text-muted-foreground">/mo</span></span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>✓ Unlimited grading</li>
                        <li>✓ Custom rubrics</li>
                        <li>✓ Email support</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary transition-colors border-primary" onClick={() => handleUpgrade('pro')}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">Pro</h3>
                          <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                        </div>
                        <span className="text-2xl font-bold">$19.99<span className="text-sm text-muted-foreground">/mo</span></span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>✓ Everything in Basic</li>
                        <li>✓ Advanced analytics</li>
                        <li>✓ Priority support</li>
                        <li>✓ Desktop app access</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleUpgrade('enterprise')}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Enterprise</h3>
                        <span className="text-2xl font-bold">$49.99<span className="text-sm text-muted-foreground">/mo</span></span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>✓ Everything in Pro</li>
                        <li>✓ Team collaboration</li>
                        <li>✓ Custom integrations</li>
                        <li>✓ Dedicated support</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: rubrics, isLoading: isLoadingRubrics } = useQuery<Rubric[]>({
    queryKey: ['/api/rubrics'],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
          Welcome back! Here's an overview of your grading activity.
        </p>
      </div>

      <SubscriptionCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardDescription className="text-sm font-medium">{stat.label}</CardDescription>
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-stat-value-${index}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href} data-testid={`link-action-${index}`}>
                <Card
                  className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                    action.primary ? "border-primary/20 bg-primary/5" : ""
                  }`}
                  data-testid={`card-action-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      action.primary ? "bg-primary" : "bg-muted"
                    }`}>
                      <action.icon className={`w-5 h-5 ${
                        action.primary ? "text-primary-foreground" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Your Rubrics</CardTitle>
              <CardDescription>Recently created grading rubrics</CardDescription>
            </div>
            <Link href="/rubric-builder" data-testid="link-new-rubric">
              <Button size="sm" data-testid="button-new-rubric">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingRubrics ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rubrics && rubrics.length > 0 ? (
              <div className="space-y-3">
                {rubrics.slice(0, 5).map((rubric, index) => (
                  <Link key={rubric.id} href={`/rubric-builder/${rubric.id}`} data-testid={`link-rubric-${index}`}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer transition-all"
                      data-testid={`row-rubric-${index}`}
                    >
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <PenTool className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" data-testid={`text-rubric-name-${index}`}>{rubric.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rubric.criteria.length} criteria, {rubric.totalPoints} points
                        </p>
                      </div>
                      {rubric.isTemplate && (
                        <Badge variant="secondary" className="text-xs">Template</Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <PenTool className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No rubrics yet</p>
                <Link href="/rubric-builder" data-testid="link-create-first-rubric">
                  <Button variant="outline" size="sm" data-testid="button-create-first-rubric">
                    Create Your First Rubric
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
          <CardDescription>Complete these steps to start grading efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4" data-testid="row-step-1">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Create your account</p>
                <p className="text-sm text-muted-foreground">You've already completed this step</p>
              </div>
              <Badge variant="secondary">Complete</Badge>
            </div>

            <div className="flex items-center gap-4" data-testid="row-step-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Build a grading rubric</p>
                <p className="text-sm text-muted-foreground">Create criteria for evaluating assignments</p>
              </div>
              <Link href="/rubric-builder" data-testid="link-step-2">
                <Button size="sm" variant="outline" data-testid="button-step-2">
                  Start
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4" data-testid="row-step-3">
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-muted-foreground">3</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">Download the Anonymizer</p>
                <p className="text-sm text-muted-foreground">Install the desktop app for anonymizing files before uploading</p>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>

            <div className="flex items-center gap-4" data-testid="row-step-4">
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-muted-foreground">4</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">Upload assignments</p>
                <p className="text-sm text-muted-foreground">Bulk upload your student submissions</p>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}