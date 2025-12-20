import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileText, Upload, PenTool, Clock, CheckCircle, AlertTriangle, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
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