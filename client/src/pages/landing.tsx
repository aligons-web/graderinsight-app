import { Link } from "wouter";
import {
  CheckCircle, Clock, FileText, Zap, Users, ArrowRight,
  SpellCheck, BookOpen, AlignLeft, Quote, LayoutTemplate, DownloadCloud,
  Zap as ZapIcon, Shield, BarChart2, Heart, UploadCloud, GraduationCap, Star, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroSlider } from "@/components/hero-slider";
import logoImage from "@assets/logo4_1767212330511.png";

const DARK_BG = "#0c0b1d";
const CARD_BG = "#13122a";
const CARD_BORDER = "#2a2850";

const featureCards = [
  {
    icon: SpellCheck,
    title: "Download the Desktop Grader",
    description: "Grade locally on your Windows computer while student data stays in your control.",
  },
  {
    icon: BookOpen,
    title: "Build Rubric Templates",
    description: "Create reusable criteria that work consistently across your courses.",
  },
  {
    icon: AlignLeft,
    title: "Manage Your Subscription",
    description: "Keep your desktop app access, billing, and account details in one place.",
  },
  {
    icon: Quote,
    title: "Supporting Content Review",
    description: "Evaluate evidence quality, relevance, and support for arguments.",
  },
  {
    icon: LayoutTemplate,
    title: "Custom Rubric Builder",
    description: "Create, customize, and save rubrics that align with your evaluation criteria.",
  },
  {
    icon: DownloadCloud,
    title: "Private, Local Workflow",
    description: "Import LMS files and export reports directly from the desktop app.",
  },
];

const benefitCards = [
  {
    icon: Clock,
    title: "Save Hours Every Week",
    description: "Grade assignments in minutes instead of hours with intelligent evaluation and instant feedback.",
    stat: "10+",
    statLabel: "Hours Saved Weekly",
    color: "#894596",
  },
  {
    icon: CheckCircle,
    title: "Consistent Rubric-Based Grading",
    description: "Apply custom rubrics consistently across all assignments for fair and objective evaluations.",
    stat: "95%",
    statLabel: "Consistency Achieved",
    color: "#22d3ee",
  },
  {
    icon: ZapIcon,
    title: "Bulk Assignment Processing",
    description: "Import and process up to 400+ assignments locally in the desktop app, perfect for large classes and multiple sections.",
    stat: "400+",
    statLabel: "Assignments at Once",
    color: "#f5c518",
  },
  {
    icon: BarChart2,
    title: "Comprehensive Writing Analysis",
    description: "Evaluate grammar, punctuation, thesis quality, topic sentences, and supporting evidence in one pass.",
    stat: "6",
    statLabel: "Analysis Areas",
    color: "#4ade80",
  },
  {
    icon: Heart,
    title: "Work–Life Balance",
    description: "Spend less time grading and more time teaching, mentoring, or enjoying your personal life.",
    stat: "Less Stress",
    statLabel: "More Impact",
    color: "#d946ef",
  },
];

const stats = [
  { icon: Users, value: "To reach 10,000+", label: "Educators Trust Us" },
  { icon: GraduationCap, value: "To reach 500K+", label: "Students Impacted" },
  { icon: Star, value: "To reach 4.9/5", label: "Average Rating" },
  { icon: Award, value: "To reach 2M+", label: "Assignments Graded" },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ background: DARK_BG }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="GraderInsight" className="h-10" data-testid="img-logo" />
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium" data-testid="link-features">Features</a>
              <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">How It Works</a>
              <a href="#benefits" className="text-white/70 hover:text-white transition-colors text-sm font-medium" data-testid="link-benefits">Benefits</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium" data-testid="link-pricing">Pricing</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" data-testid="link-login">
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" data-testid="button-login">Log In</Button>
              </Link>
              <Link href="/signup" data-testid="link-signup-header">
                <Button className="bg-[#894596] hover:bg-[#7a3d85] text-white font-semibold" data-testid="button-signup-header">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <HeroSlider />

      {/* ─── Features ─── */}
      <section id="features" className="py-20 lg:py-28" style={{ background: DARK_BG }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-14 items-start">

            {/* Left: title + feature cards */}
            <div className="flex-1 min-w-0">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 border border-white/20 text-white/60">Features</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4" data-testid="text-features-title">
                Everything You Need to<br />
                <span className="text-[#4ade80]">Grade Efficiently</span>
              </h2>
              <p className="text-white/60 text-base mb-10 max-w-md leading-relaxed">
                Comprehensive writing analysis and evaluation tools designed specifically for educators.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featureCards.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-5 border transition-colors hover:border-[#894596]/60"
                    style={{ background: CARD_BG, borderColor: CARD_BORDER }}
                    data-testid={`card-feature-${i}`}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#894596" + "33" }}>
                      <f.icon className="w-5 h-5" style={{ color: "#894596" }} />
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug">{f.title}</h3>
                    <p className="text-white/50 text-xs leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div className="lg:w-[420px] flex-shrink-0 relative">
              {/* AI badge */}
              <div className="absolute -top-14 right-0 z-10 flex items-center gap-2 px-3 py-2 rounded-xl border border-[#894596] text-xs font-semibold text-white shadow-lg" style={{ background: "#894596" }}>
                <ZapIcon className="w-3.5 h-3.5" />
                AI-Powered Grading Assistant
              </div>

              {/* Mock dashboard card */}
              <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
                {/* Dashboard header bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: CARD_BORDER }}>
                  <img src={logoImage} alt="" className="h-5" />
                  <span className="text-white/60 text-xs ml-auto">Dashboard</span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Stat cards row */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Assignments", value: "1,248", color: "#894596" },
                      { label: "Quality Score", value: "82.5", color: "#22d3ee" },
                      { label: "Students", value: "320", color: "#4ade80" },
                      { label: "Avg Score", value: "87%", color: "#f5c518" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg p-2 text-center border" style={{ background: "#0c0b1d", borderColor: CARD_BORDER }}>
                        <p className="text-[10px] text-white/40 leading-tight mb-0.5">{s.label}</p>
                        <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent assignments */}
                  <div className="rounded-lg border overflow-hidden" style={{ borderColor: CARD_BORDER }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: CARD_BORDER }}>
                      <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">Recent Assignments</p>
                    </div>
                    {[
                      { name: "Research Paper – Climate Change", score: "88", status: "Graded" },
                      { name: "Essay – Social Media Impact", score: "74", status: "Graded" },
                      { name: "Literary Analysis – The Great Gatsby", score: "92", status: "Completed" },
                      { name: "Argumentative Essay – Education", score: "79", status: "Completed" },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 border-b last:border-0 text-[10px]" style={{ borderColor: CARD_BORDER }}>
                        <span className="text-white/60 truncate mr-2 flex-1">{a.name}</span>
                        <span className="text-white/80 font-semibold mr-2">{a.score}</span>
                        <span className="text-[#4ade80] font-medium">{a.status}</span>
                      </div>
                    ))}
                  </div>

                  {/* Scores distribution */}
                  <div className="rounded-lg border p-3" style={{ borderColor: CARD_BORDER }}>
                    <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wide mb-3">Scores Distribution</p>
                    <div className="flex items-center gap-3">
                      {/* Donut placeholder */}
                      <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: "conic-gradient(#894596 0% 38%, #22d3ee 38% 70%, #4ade80 70% 90%, #f5c518 90% 100%)" }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: CARD_BG }}>1,248</div>
                      </div>
                      <div className="space-y-1.5 text-[9px] text-white/60">
                        {[
                          { label: "90–100%", pct: "38%", color: "#894596" },
                          { label: "80–89%", pct: "32%", color: "#22d3ee" },
                          { label: "70–79%", pct: "20%", color: "#4ade80" },
                          { label: "Below 70%", pct: "10%", color: "#f5c518" },
                        ].map((d) => (
                          <div key={d.label} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                            <span>{d.label}</span>
                            <span className="ml-auto pl-2 font-semibold text-white/80">{d.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section id="benefits" className="py-20 lg:py-28 border-t" style={{ background: "#0f0e22", borderColor: CARD_BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 border border-white/20 text-white/60">Benefits</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4" data-testid="text-benefits-title">
              Why Educators will<span style={{ color: "#894596" }}> Love</span> GraderInsight
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
              Be part of Grader Insight's mission to impact thousands of professors, instructors, and teachers who have transformed their grading workflow.
            </p>
          </div>

          {/* Benefit cards */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefitCards.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl border p-5 flex flex-col items-center text-center w-full md:w-[calc(33.333%-16px)] min-w-[220px] max-w-[320px]"
                style={{ background: CARD_BG, borderColor: CARD_BORDER }}
                data-testid={`card-benefit-${i}`}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: b.color + "22", border: `1.5px solid ${b.color}44` }}>
                  <b.icon className="w-6 h-6" style={{ color: b.color }} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{b.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed mb-4">{b.description}</p>
                <div className="mt-auto">
                  <p className="text-2xl font-extrabold" style={{ color: b.color }}>{b.stat}</p>
                  <p className="text-white/40 text-[11px]">{b.statLabel}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-5 py-4 border"
                style={{ background: CARD_BG, borderColor: CARD_BORDER }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#894596" + "33" }}>
                  <s.icon className="w-5 h-5" style={{ color: "#894596" }} />
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">{s.value}</p>
                  <p className="text-white/50 text-xs">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-20 lg:py-24 border-t" style={{ background: DARK_BG, borderColor: CARD_BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 border border-white/20 text-white/60">How it works</span>
            <h2 className="text-4xl font-extrabold text-white mb-3">A better grading workflow starts here</h2>
            <p className="text-white/50 max-w-2xl mx-auto">Use this portal to manage your account, then do your grading privately in the GraderInsight desktop app.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["01", "Sign up and choose your plan", "Start your 7-day trial and manage your account here."],
              ["02", "Download the desktop app", "Install GraderInsight on your Windows computer."],
              ["03", "Import and grade locally", "Bring in LMS exports and grade batches with AI."],
              ["04", "Review and export feedback", "Keep results on your computer and export reports."],
            ].map(([number, title, text]) => <div key={number} className="rounded-xl border p-5" style={{ background: CARD_BG, borderColor: CARD_BORDER }}><p className="text-[#4ade80] font-bold mb-4">{number}</p><h3 className="text-white font-semibold mb-2">{title}</h3><p className="text-white/50 text-sm leading-relaxed">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-16 border-t" style={{ background: "#0f0e22", borderColor: CARD_BORDER }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-white/50 text-sm font-semibold uppercase tracking-widest mb-3">Works with your existing LMS</p>
          <h2 className="text-3xl font-extrabold text-white mb-8">Import assignment exports from the tools you already use</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["D2L Brightspace", "Canvas", "Blackboard", "Moodle"].map((lms) => <div key={lms} className="rounded-xl border px-4 py-5 text-white font-semibold" style={{ background: CARD_BG, borderColor: CARD_BORDER }}>{lms}</div>)}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 lg:py-28 border-t" style={{ background: "#0f0e22", borderColor: CARD_BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4" data-testid="text-pricing-title">Simple, Transparent Pricing</h2>
            <p className="text-white/50 text-base max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 7-day free trial.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Basic */}
            <div className="rounded-2xl border p-6" style={{ background: CARD_BG, borderColor: CARD_BORDER }} data-testid="card-pricing-basic">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Basic</h3>
                <div className="text-4xl font-bold text-white mb-1">$14.99<span className="text-lg text-white/40 font-normal">/mo</span></div>
                <p className="text-white/40 text-sm">For individual educators</p>
              </div>
              <ul className="space-y-3 mb-6">
                {["Test-drive AI off-line grading with API Key", "Custom rubrics", "Up to 100 assignments/month"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#4ade80" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" data-testid="link-pricing-basic">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Start Free Trial</Button>
              </Link>
            </div>

            {/* Desktop App */}
            <div className="rounded-2xl border p-6 relative" style={{ background: CARD_BG, borderColor: "#894596" }} data-testid="card-pricing-pro">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-white text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#894596" }}>Most Popular</span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Desktop App Plan</h3>
                <div className="text-4xl font-bold text-white mb-1">$21.99<span className="text-lg text-white/40 font-normal">/mo</span></div>
                <p className="text-white/40 text-sm">For power users</p>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "Everything in Basic",
                  "On-going use of API Key for off-line (desktop processing) AI grading (subscription-based)",
                  "Priority support",
                  "Desktop app access",
                  "Unlimited assignments",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#4ade80" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" data-testid="link-pricing-pro">
                <Button className="w-full font-semibold" style={{ background: "#894596" }}>Start Free Trial</Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 lg:py-20 border-t" style={{ background: "#894596", borderColor: "#7a3d85" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" data-testid="text-cta-title">Ready to Transform Your Grading?</h2>
          <p className="text-white/80 text-lg mb-8">
            Start grading assignments faster and reclaim your time today.
          </p>
          <Link href="/signup" data-testid="link-cta-footer">
            <Button size="lg" className="text-lg px-8 bg-white font-bold hover:bg-white/90" style={{ color: "#894596" }} data-testid="button-cta-footer">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-10 border-t" style={{ background: "#08071a", borderColor: CARD_BORDER }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={logoImage} alt="GraderInsight" className="h-8" data-testid="img-logo-footer" />
            <p className="text-sm text-white/30">
              Helping educators grade smarter since 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
