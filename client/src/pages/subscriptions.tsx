import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Calendar, Download, Monitor, Shield, Wifi, WifiOff, FileText, CheckCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function SubscriptionStatus() {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { data: subscription, refetch, isLoading } = useQuery({
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
      trial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      pro: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      enterprise: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  if (!subscription) {
    return null;
  }

  const isTrialActive = subscription.tier === 'trial' && subscription.subscriptionActive;
  const daysRemaining = subscription.expiresAt ? 
    Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const hasDesktopAccess = subscription.tier === 'pro' || subscription.tier === 'enterprise';

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Your subscription status and details</CardDescription>
            </div>
            <Badge className={getTierBadge(subscription.tier || 'trial')} data-testid="badge-subscription-tier">
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
            <span className="font-medium" data-testid="text-subscription-expiry">
              {subscription.expiresAt ? formatDate(subscription.expiresAt) : 'N/A'}
            </span>
          </div>

          {isTrialActive && daysRemaining > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining in your trial
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Upgrade now to continue using all features
              </p>
            </div>
          )}

          {!subscription.subscriptionActive && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                Your subscription has expired
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Upgrade to continue grading assignments
              </p>
            </div>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" data-testid="button-upgrade-subscription">
                {isTrialActive ? 'Upgrade Subscription' : 'Choose a Plan'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Choose Your Plan</DialogTitle>
                <DialogDescription>
                  Select the plan that works best for you
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Card className="cursor-pointer hover-elevate transition-colors" onClick={() => handleUpgrade('basic')} data-testid="card-plan-basic">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-semibold">Basic</h3>
                      <span className="text-2xl font-bold">$9.99<span className="text-sm text-muted-foreground">/mo</span></span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Unlimited grading</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Custom rubrics</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Email support</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover-elevate transition-colors border-primary" onClick={() => handleUpgrade('pro')} data-testid="card-plan-pro">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold">Pro</h3>
                        <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                      </div>
                      <span className="text-2xl font-bold">$19.99<span className="text-sm text-muted-foreground">/mo</span></span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Everything in Basic</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Advanced analytics</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Priority support</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Desktop App Access</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover-elevate transition-colors" onClick={() => handleUpgrade('enterprise')} data-testid="card-plan-enterprise">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-semibold">Enterprise</h3>
                      <span className="text-2xl font-bold">$49.99<span className="text-sm text-muted-foreground">/mo</span></span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Everything in Pro</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Team collaboration</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Custom integrations</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Dedicated support</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {hasDesktopAccess && (
        <Card className="border-accent/30 bg-accent/5" data-testid="card-desktop-app">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Desktop Name Anonymizer</CardTitle>
                <CardDescription>Available with your {subscription.tier} subscription</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Requires Login</p>
                  <p className="text-xs text-muted-foreground">Sign in with your GraderInsight account</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Validates Subscription</p>
                  <p className="text-xs text-muted-foreground">Only Pro/Enterprise subscribers can use it</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Anonymizes Names</p>
                  <p className="text-xs text-muted-foreground">Replaces student names with "Student 1", "Student 2", etc.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <WifiOff className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Works Offline</p>
                  <p className="text-xs text-muted-foreground">Continues working for 24 hours after last validation</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Installation Instructions
              </h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="step-1">
                  <AccordionTrigger data-testid="accordion-step-1">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
                      Create the desktop app folder
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-8">
                    Create a new folder on your computer (outside of any web browser) where you want to store the desktop application files.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-2">
                  <AccordionTrigger data-testid="accordion-step-2">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                      Copy all the files from the artifact
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-8">
                    Download or copy all the desktop app files into the folder you created. Make sure to include all JavaScript files, package.json, and any configuration files.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-3">
                  <AccordionTrigger data-testid="accordion-step-3">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">3</span>
                      Update the API URL
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-8">
                    Open <code className="bg-muted px-1 py-0.5 rounded text-sm">main.js</code> and update the <code className="bg-muted px-1 py-0.5 rounded text-sm">API_URL</code> variable to your GraderInsight app URL (this Replit deployment URL).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-4">
                  <AccordionTrigger data-testid="accordion-step-4">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">4</span>
                      Install dependencies and test
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-8">
                    <p className="mb-2">Open a terminal in your desktop app folder and run:</p>
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm space-y-1">
                      <p>npm install</p>
                      <p>npm start</p>
                    </div>
                    <p className="mt-2">This will install all required packages and start the app for testing.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-5">
                  <AccordionTrigger data-testid="accordion-step-5">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">5</span>
                      Build the Windows executable
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-8">
                    <p className="mb-2">To create a distributable .exe file, run:</p>
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                      <p>npm run build:win</p>
                    </div>
                    <p className="mt-2">This will generate an executable that can be shared and run on any Windows computer.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                How It Connects to Your Subscription
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The desktop app authenticates with your GraderInsight account using these endpoints:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <code className="bg-background px-2 py-1 rounded text-xs">/api/desktop/login</code>
                  <span className="text-muted-foreground">- Validates credentials & subscription</span>
                </li>
                <li className="flex items-center gap-2">
                  <code className="bg-background px-2 py-1 rounded text-xs">/api/desktop/validate</code>
                  <span className="text-muted-foreground">- Checks if subscription is still active</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Only users with active Pro or Enterprise subscriptions can log in to the desktop app.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasDesktopAccess && (
        <Card className="border-dashed" data-testid="card-desktop-app-locked">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Desktop Name Anonymizer</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to Pro or Enterprise to access the desktop app for offline name anonymization.
            </p>
            <Badge variant="outline">Available with Pro & Enterprise</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Subscriptions() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-subscriptions-title">Subscriptions</h1>
        <p className="text-muted-foreground" data-testid="text-subscriptions-subtitle">
          Manage your subscription and access exclusive features.
        </p>
      </div>

      <SubscriptionStatus />
    </div>
  );
}
