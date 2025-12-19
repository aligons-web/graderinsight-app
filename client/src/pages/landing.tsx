import { Link } from "wouter";
import { CheckCircle, Clock, FileText, Shield, Zap, Users, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Clock,
    title: "Save Hours Every Week",
    description: "Grade assignments in minutes instead of hours with AI-powered evaluation and instant feedback generation.",
  },
  {
    icon: FileText,
    title: "Consistent Rubric-Based Grading",
    description: "Apply custom rubrics consistently across all assignments, ensuring fair and objective evaluations.",
  },
  {
    icon: Shield,
    title: "AI & Plagiarism Detection",
    description: "Automatically detect AI-generated content and plagiarism to maintain academic integrity.",
  },
  {
    icon: Zap,
    title: "Bulk Assignment Processing",
    description: "Upload and process up to 400+ assignments at once, perfect for large classes and multiple sections.",
  },
  {
    icon: CheckCircle,
    title: "Comprehensive Writing Analysis",
    description: "Evaluate grammar, punctuation, thesis quality, topic sentences, and supporting evidence in one pass.",
  },
  {
    icon: Users,
    title: "Work-Life Balance",
    description: "Spend less time grading and more time teaching, mentoring, or enjoying your personal life.",
  },
];

const features = [
  "Grammar & punctuation checking",
  "Thesis statement evaluation",
  "Topic sentence analysis",
  "Supporting content review",
  "AI content detection",
  "Plagiarism scanning",
  "Custom rubric builder",
  "Bulk assignment uploads",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-xl" data-testid="text-brand-name">GraderInsight</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-benefits">Benefits</a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">Features</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" data-testid="link-login">
                <Button variant="ghost" data-testid="button-login">Log In</Button>
              </Link>
              <Link href="/signup" data-testid="link-signup-header">
                <Button data-testid="button-signup-header">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              Grade Smarter,<br />
              <span className="text-primary">Not Harder</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              AI-powered assignment grading that helps educators save time, maintain consistency, and achieve the work-life balance they deserve.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" data-testid="link-cta-primary">
                <Button size="lg" className="text-lg px-8" data-testid="button-cta-primary">
                  Start Grading Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login" data-testid="link-cta-secondary">
                <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-cta-secondary">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-features-title">Everything You Need to Grade Efficiently</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive writing analysis and evaluation tools designed specifically for educators.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="p-4 text-center" data-testid={`card-feature-${index}`}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <p className="font-medium text-sm">{feature}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-benefits-title">Why Educators Love GraderInsight</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join thousands of professors, instructors, and teachers who have transformed their grading workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6" data-testid={`card-benefit-${index}`}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Ready to Transform Your Grading?</h2>
          <p className="text-lg mb-8 opacity-90">
            Start grading assignments faster and reclaim your time today.
          </p>
          <Link href="/signup" data-testid="link-cta-footer">
            <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="button-cta-footer">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">GraderInsight</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Helping educators grade smarter since 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}