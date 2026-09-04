import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, DownloadCloud, ArrowRight, ClipboardCheck, CreditCard, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthToken } from "@/lib/api";

const authHeaders = () => ({ Authorization: `Bearer ${getAuthToken()}` });
const steps = [
  { key: "account_created", title: "Create your account", description: "You've already completed this step.", action: null },
  { key: "app_downloaded", title: "Download the desktop app", description: "Install the GraderInsight batch grader on your computer.", action: { label: "Download", href: "/downloads" } },
  { key: "csv_viewer_downloaded", title: "Download the CSV viewer", description: "View and analyze your grading results.", action: { label: "Download", href: "/downloads" } },
  { key: "tutorial_watched", title: "Watch the quick start guide", description: "Learn how to grade your first batch in under 5 minutes.", action: { label: "Watch", href: "/downloads#guide" } },
  { key: "first_rubric_created", title: "Build your first rubric template", description: "Create reusable grading criteria for your courses.", action: { label: "Start", href: "/rubric-templates/new" } },
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [gettingStartedOpen, setGettingStartedOpen] = useState(true);
  const { data: profile } = useQuery({ queryKey: ["/api/auth/me"], queryFn: async () => (await fetch("/api/auth/me", { headers: authHeaders() })).json() });
  const { data: subscription } = useQuery({ queryKey: ["/api/user/subscription"], queryFn: async () => { const r = await fetch("/api/user/subscription", { headers: authHeaders() }); return r.ok ? (await r.json()).subscription : null; } });
  const { data: onboarding, isLoading: loadingOnboarding } = useQuery({ queryKey: ["/api/onboarding"], queryFn: async () => { const r = await fetch("/api/onboarding", { headers: authHeaders() }); if (!r.ok) throw new Error("Unable to load onboarding"); return r.json(); } });
  const { data: rubrics = [], isLoading: loadingRubrics } = useQuery({ queryKey: ["/api/rubric-templates"], queryFn: async () => { const r = await fetch("/api/rubric-templates?limit=3", { headers: authHeaders() }); if (!r.ok) throw new Error("Unable to load templates"); return (await r.json()).templates; } });
  const complete = useMutation({ mutationFn: async (step: string) => { const r = await fetch(`/api/onboarding/${step}`, { method: "PATCH", headers: { ...authHeaders(), "Content-Type": "application/json" } }); if (!r.ok) throw new Error("Unable to update onboarding"); return r.json(); }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] }) });
  const progress = onboarding?.progress || onboarding || {};
  const completed = steps.filter((step) => step.key === "account_created" || progress[`step_${step.key}`] || progress[step.key]).length;
  const days = subscription?.expires_at ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000)) : 0;
  const allDone = completed === steps.length;
  useEffect(() => {
    if (allDone && localStorage.getItem("gettingStartedExpanded") !== "true") {
      setGettingStartedOpen(false);
    }
  }, [allDone]);

  return <div className="max-w-6xl mx-auto space-y-6">
    <div><h1 className="text-3xl font-bold">Welcome back{profile?.user?.name ? `, ${profile.user.name}` : ""}!</h1><p className="text-muted-foreground">Manage your GraderInsight account and desktop grading resources.</p></div>
    <Card className="border-primary/20"><CardHeader className="flex-row justify-between gap-4"><div><CardTitle className="flex gap-2 items-center"><CreditCard className="w-5 h-5" />Subscription status</CardTitle><CardDescription>Your desktop app access and plan details</CardDescription></div><Badge>{(subscription?.tier || "Free Trial").toUpperCase()}</Badge></CardHeader><CardContent className="space-y-3"><div className="grid sm:grid-cols-3 gap-4 text-sm"><div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{subscription?.status || "No active plan"}</p></div><div><p className="text-muted-foreground">{subscription?.tier === "trial" ? "Trial remaining" : "Renews"}</p><p className="font-medium">{subscription?.tier === "trial" ? `${days} days` : subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "—"}</p></div><div className="flex items-end"><Link href="/settings#subscription"><Button size="sm">Manage plan</Button></Link></div></div>{subscription?.tier === "trial" && <><Progress value={(days / 7) * 100} /><p className="text-sm text-muted-foreground">{days} days remaining in your trial. <Link href="/settings#subscription" className="text-primary font-medium">Upgrade to keep access.</Link></p></>}</CardContent></Card>
    <Card><CardHeader className="cursor-pointer" onClick={() => { const next = !gettingStartedOpen; setGettingStartedOpen(next); localStorage.setItem("gettingStartedExpanded", String(next)); }}><CardTitle className="flex items-center justify-between"><span>Getting started {allDone && <span className="ml-2 text-sm font-normal text-green-600">All set! You&apos;re ready to grade.</span>}</span><Button size="sm" variant="ghost" aria-label={gettingStartedOpen ? "Hide getting started" : "Show getting started"}><ChevronDown className={`w-4 h-4 transition-transform ${gettingStartedOpen ? "rotate-180" : ""}`} /></Button></CardTitle><CardDescription>Complete these steps to prepare your local grading workflow.</CardDescription></CardHeader>{gettingStartedOpen && <CardContent>{loadingOnboarding ? <Skeleton className="h-48" /> : <div className="space-y-3">{steps.map((step, i) => { const done = step.key === "account_created" || progress[`step_${step.key}`] || progress[step.key]; return <div key={step.key} className="flex gap-3 rounded-lg border p-3 items-center"><div className={done ? "text-green-600" : "text-muted-foreground"}>{done ? <CheckCircle2 /> : <Circle />}</div><div className="flex-1"><p className="font-medium">{i + 1}. {step.title}</p><p className="text-sm text-muted-foreground">{step.description}</p></div>{step.action ? <Link href={step.action.href}><Button size="sm" variant="outline">{step.action.label}</Button></Link> : <Badge variant="secondary">Complete</Badge>}</div>})}</div>}</CardContent>}</Card>
    <div className="grid lg:grid-cols-2 gap-6"><Card><CardHeader><CardTitle>Quick actions</CardTitle></CardHeader><CardContent className="space-y-3">{[{ title: "Download GraderInsight", description: "Windows desktop application for batch grading", href: "/downloads", icon: DownloadCloud }, { title: "Rubric Templates", description: "Build and manage reusable grading criteria", href: "/rubric-templates", icon: ClipboardCheck }].map(a => <Link href={a.href} key={a.title}><div className="mb-3 flex items-center gap-4 rounded-lg border p-4 hover-elevate"><a.icon className="text-primary" /><div className="flex-1"><p className="font-medium">{a.title}</p><p className="text-sm text-muted-foreground">{a.description}</p></div><ArrowRight className="w-4 h-4" /></div></Link>)}</CardContent></Card>
    <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Your rubric templates</CardTitle><CardDescription>Recently created templates</CardDescription></div><Link href="/rubric-templates" className="text-sm text-primary">View all</Link></CardHeader><CardContent>{loadingRubrics ? <Skeleton className="h-32" /> : rubrics.length ? <div className="space-y-2">{rubrics.slice(0,3).map((r: any) => <Link href={`/rubric-templates/${r.id}`} key={r.id}><div className="p-3 rounded-lg hover-elevate"><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.total_points || r.totalPoints} points · {r.rubric_criteria?.length || 0} criteria</p></div></Link>)}</div> : <div className="text-center py-4"><p className="text-muted-foreground mb-3">No templates yet</p><Link href="/rubric-templates/new"><Button variant="outline" size="sm">Create Your First Template</Button></Link></div>}</CardContent></Card></div>
  </div>;
}