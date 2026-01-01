import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, Upload, PenTool, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Plus, ArrowRight, CreditCard, Calendar,
  Shield, Bug, BarChart3, PieChart, FileWarning
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Rubric } from "@shared/schema";

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

  const handleUpgrade = async (tier: string) => {
    setIsUpgrading(true);
    try {
      // You'll need to implement the upgrade logic with Stripe
      toast({
        title: "Upgrade initiated",
        description: `Redirecting to checkout for ${tier} plan...`,
      });
      refetch();
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
      plus: "bg-green-100 text-green-800",
      admin: "bg-red-100 text-red-800",
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

  const isTrialActive = subscription.tier === 'trial' && subscription.status === 'active';
  const daysRemaining = subscription.expires_at ? 
    Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

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
              {subscription.status === 'active' ? 'Expires' : 'Expired'} on:
            </span>
          </div>
          <span className="font-medium">
            {subscription.expires_at ? formatDate(subscription.expires_at) : 'N/A'}
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

        {subscription.status !== 'active' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              Your subscription has expired
            </p>
            <p className="text-xs text-red-700 mt-1">
              Upgrade to continue grading assignments
            </p>
          </div>
        )}

        {isTrialActive && (
          <Button className="w-full" variant="default">
            Upgrade Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardStats() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['/api/dashboard/overview'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch overview');
      return response.json();
    },
  });

  const stats = [
    { 
      label: "Assignments Graded", 
      value: overview?.assignments_graded?.toString() || "0", 
      icon: FileText, 
      trend: overview?.assignments_graded > 0 ? "Keep up the great work!" : "Start grading today" 
    },
    { 
      label: "Time Saved", 
      value: overview ? `${overview.time_saved_hours} hrs` : "0 hrs", 
      icon: Clock, 
      trend: "Track your efficiency" 
    },
    { 
      label: "Average Grade", 
      value: overview?.average_grade ? `${overview.average_grade}%` : "--", 
      icon: TrendingUp, 
      trend: overview?.average_grade ? "Class average" : "No data yet" 
    },
    { 
      label: "Pending Review", 
      value: overview?.pending_review?.toString() || "0", 
      icon: AlertTriangle, 
      trend: overview?.pending_review === 0 ? "You're all caught up" : "Needs attention" 
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
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
  );
}

function AcademicIntegrityCard() {
  const { data: integrity, isLoading } = useQuery({
    queryKey: ['/api/dashboard/academic-integrity'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/academic-integrity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch integrity data');
      return response.json();
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!integrity || integrity.total_assignments === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Academic Integrity
          </CardTitle>
          <CardDescription>Plagiarism, AI detection, and citation tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Grade some assignments to see integrity checks
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Academic Integrity
        </CardTitle>
        <CardDescription>
          Based on {integrity.total_assignments} assignment{integrity.total_assignments !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Plagiarism Detected
            </span>
            <span className="font-semibold">
              {integrity.plagiarism.count} ({integrity.plagiarism.percentage}%)
            </span>
          </div>
          <Progress value={integrity.plagiarism.percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              AI Content Detected
            </span>
            <span className="font-semibold">
              {integrity.ai_detection.count} ({integrity.ai_detection.percentage}%)
            </span>
          </div>
          <Progress value={integrity.ai_detection.percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              Citation Issues
            </span>
            <span className="font-semibold">
              {integrity.citation_issues.count} ({integrity.citation_issues.percentage}%)
            </span>
          </div>
          <Progress value={integrity.citation_issues.percentage} className="h-2" />
        </div>

        <Button variant="outline" className="w-full mt-4" size="sm">
          View Detailed Report
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

function CommonErrorsCard() {
  const { data: errors, isLoading } = useQuery({
    queryKey: ['/api/dashboard/common-errors'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/common-errors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch error data');
      return response.json();
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!errors || errors.common_errors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Common Errors
          </CardTitle>
          <CardDescription>Most frequent writing and presentation issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bug className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Error patterns will appear as you grade assignments
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topErrors = errors.common_errors.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Most Common Errors
        </CardTitle>
        <CardDescription>Top issues across all assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topErrors.map((error: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm capitalize">
                  {error.type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {error.category}
                </p>
              </div>
              <Badge variant="secondary">
                {error.total}×
              </Badge>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" size="sm">
          View All Errors
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

function CriteriaPerformanceCard() {
  const { data: performance, isLoading } = useQuery({
    queryKey: ['/api/dashboard/criteria-performance'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/criteria-performance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch performance data');
      return response.json();
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!performance || performance.criteria_performance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Rubric Criteria Performance
          </CardTitle>
          <CardDescription>Average scores by criterion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Performance data will appear as you grade assignments
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topCriteria = performance.criteria_performance.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Rubric Criteria Performance
        </CardTitle>
        <CardDescription>Average scores across all assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCriteria.map((criterion: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate pr-2">
                  {criterion.criterion_name}
                </span>
                <span className="font-semibold whitespace-nowrap">
                  {criterion.avg_percentage}%
                </span>
              </div>
              <Progress value={criterion.avg_percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {criterion.assignment_count} assignment{criterion.assignment_count !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" size="sm">
          View Detailed Breakdown
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ScoreDistributionCard() {
  const { data: distribution, isLoading } = useQuery({
    queryKey: ['/api/dashboard/score-distribution'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/score-distribution', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch distribution data');
      return response.json();
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!distribution || distribution.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Score Distribution
          </CardTitle>
          <CardDescription>Grade ranges across all assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PieChart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Distribution will appear as you grade assignments
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ranges = [
    { label: '90-100%', count: distribution.distribution.range_90_100, color: 'bg-green-500' },
    { label: '80-89%', count: distribution.distribution.range_80_89, color: 'bg-blue-500' },
    { label: '70-79%', count: distribution.distribution.range_70_79, color: 'bg-yellow-500' },
    { label: '60-69%', count: distribution.distribution.range_60_69, color: 'bg-orange-500' },
    { label: '<60%', count: distribution.distribution.range_below_60, color: 'bg-red-500' },
  ];

  const maxCount = Math.max(...ranges.map(r => r.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Score Distribution
        </CardTitle>
        <CardDescription>
          {distribution.total} assignment{distribution.total !== 1 ? 's' : ''} graded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ranges.map((range, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{range.label}</span>
                <span className="text-muted-foreground">{range.count}</span>
              </div>
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${range.color} transition-all`}
                  style={{ width: maxCount > 0 ? `${(range.count / maxCount) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{distribution.average}%</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{distribution.median}%</p>
            <p className="text-xs text-muted-foreground">Median</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSection() {
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

  // Only show analytics if user has access (Plus or Admin plan)
  if (!features?.features?.analytics_dashboard) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Advanced Analytics
          </CardTitle>
          <CardDescription>Unlock comprehensive grading insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span>Academic integrity tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4 text-primary" />
                <span>Common error pattern analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>Rubric criteria performance breakdown</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <PieChart className="w-4 h-4 text-primary" />
                <span>Score distribution visualization</span>
              </div>
            </div>
            <Button className="w-full" variant="default">
              Upgrade to Plus for Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AcademicIntegrityCard />
        <CommonErrorsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriteriaPerformanceCard />
        <ScoreDistributionCard />
      </div>
    </>
  );
}

export default function Dashboard() {
  const { data: rubrics, isLoading: isLoadingRubrics } = useQuery<Rubric[]>({
    queryKey: ['/api/rubrics'],
    queryFn: async () => {
      const response = await fetch('/api/rubrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch rubrics');
      const data = await response.json();
      return data.rubrics;
    },
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

      <DashboardStats />

      <AnalyticsSection />

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
                          {rubric.totalPoints} points
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