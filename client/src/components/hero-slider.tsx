import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, CheckCircle, BarChart2, FileText, UploadCloud, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import image1 from "@assets/image1r_1778623148758.jpg";
import image2 from "@assets/image2r_1778623148758.jpg";
import image3 from "@assets/image3r_1778623148759.jpg";
import image4 from "@assets/image4r_1778623148759.jpg";

type SlideFeature = { icon: React.ElementType; label: string };

type Slide = {
  image: string;
  bg: string;
  accent: string;
  headline1: string;
  headline2: string;
  description: string;
  badges?: string[];
  features?: SlideFeature[];
  decorative: {
    type: "circle" | "shield" | "card";
    text?: string;
    highlight?: string;
    subtext?: string;
    line1?: string;
    line2?: string;
  };
};

const slides: Slide[] = [
  {
    image: image2,
    bg: "#0c0b1d",
    accent: "#f5c518",
    headline1: "Grade quicker.",
    headline2: "Teach more.",
    description: "AI-powered writing analysis that gives you clear insights, consistent grading, and hours back in your week.",
    badges: ["Accurate", "Consistent", "Time-Saving"],
    decorative: { type: "circle", text: "Save up to", highlight: "10+", subtext: "hours per week" },
  },
  {
    image: image3,
    bg: "#0c0b1d",
    accent: "#22d3ee",
    headline1: "Grade efficiently.",
    headline2: "Drive impact.",
    description: "Powerful AI tools to evaluate writing, deliver meaningful feedback, and elevate student success.",
    features: [
      { icon: BarChart2, label: "Deep Analysis" },
      { icon: FileText, label: "Custom Rubrics" },
      { icon: UploadCloud, label: "Bulk Grading" },
      { icon: MessageSquare, label: "Actionable Feedback" },
    ],
    decorative: { type: "circle", text: "Grade", highlight: "400+", subtext: "assignments at once" },
  },
  {
    image: image4,
    bg: "#071a0b",
    accent: "#4ade80",
    headline1: "Grade smarter.",
    headline2: "Empower students.",
    description: "Deliver better feedback, promote academic growth, and keep integrity at the center.",
    badges: ["Writing Analysis", "Originality Review", "Rubric-Based Grading", "Consistency You Can Trust"],
    decorative: { type: "shield", text: "Support Academic Integrity" },
  },
  {
    image: image1,
    bg: "#1a0c30",
    accent: "#d946ef",
    headline1: "Grade precisely.",
    headline2: "Inspire excellence.",
    description: "Detailed insights. Clear feedback. Better writing. Stronger results.",
    badges: ["Grammar & Clarity", "Thesis Evaluation", "Evidence Review", "Sentence-Level Feedback"],
    decorative: { type: "card", line1: "Precision You Can See.", line2: "Results They Can Feel." },
  },
];

const SLIDE_H = 560;

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(true);

  const goToSlide = useCallback((index: number) => {
    setAnimating(false);
    setTimeout(() => {
      setCurrentSlide(index);
      setAnimating(true);
    }, 60);
  }, []);

  const nextSlide = useCallback(() => goToSlide((currentSlide + 1) % slides.length), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide((currentSlide - 1 + slides.length) % slides.length), [currentSlide, goToSlide]);

  useEffect(() => {
    const t = setTimeout(nextSlide, 6000);
    return () => clearTimeout(t);
  }, [currentSlide, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: `${SLIDE_H}px`, background: slide.bg, transition: "background 0.6s ease" }}
      data-testid="hero-slider"
    >
      {slides.map((s, index) => {
        const active = index === currentSlide;
        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{ opacity: active ? 1 : 0, zIndex: active ? 10 : 0, transition: "opacity 0.6s ease", pointerEvents: active ? "auto" : "none" }}
            data-testid={`slide-${index}`}
          >
            {/* Full-bleed image on the right half */}
            <div className="absolute inset-0 flex">
              {/* left spacer so image starts at ~45% */}
              <div className="w-[45%] flex-shrink-0" />
              <div className="flex-1 relative">
                <img
                  src={s.image}
                  alt="Educator"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: "center top" }}
                />
              </div>
            </div>

            {/* Gradient overlays for seamless blend */}
            {/* left-to-right: solid bg → transparent (covers left 60%) */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${s.bg} 0%, ${s.bg} 38%, ${s.bg}cc 50%, ${s.bg}55 62%, transparent 78%)`,
              }}
            />
            {/* bottom fade for dot area */}
            <div
              className="absolute bottom-0 left-0 right-0 h-20"
              style={{ background: `linear-gradient(to top, ${s.bg}cc, transparent)` }}
            />

            {/* Left content — sits on top of gradients */}
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full max-w-7xl mx-auto px-8 lg:px-12"
                style={{
                  opacity: active && animating ? 1 : 0,
                  transform: active && animating ? "translateX(0)" : "translateX(-24px)",
                  transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
              >
                <div className="max-w-[520px]">
                  <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white">
                    {s.headline1}
                    <br />
                    <span style={{ color: s.accent }}>{s.headline2}</span>
                  </h1>

                  <p className="text-white/70 text-base lg:text-lg mb-6 leading-relaxed max-w-sm">
                    {s.description}
                  </p>

                  {s.badges && (
                    <div className="flex flex-wrap gap-x-5 gap-y-2 mb-7">
                      {s.badges.map((b) => (
                        <span key={b} className="flex items-center gap-1.5 text-white/80 text-sm">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: s.accent }} />
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {s.features && (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 mb-7">
                      {s.features.map((f) => (
                        <span key={f.label} className="flex items-center gap-2 text-white/80 text-sm">
                          <f.icon className="w-4 h-4 flex-shrink-0" style={{ color: s.accent }} />
                          {f.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link href="/signup" data-testid="link-slider-cta">
                    <Button
                      size="lg"
                      className="font-bold px-8 text-sm hover:opacity-90 transition-opacity"
                      style={{ background: s.accent, color: "#0c0b1d" }}
                      data-testid="button-slider-cta"
                    >
                      Start Your 7-Day Trial →
                    </Button>
                  </Link>
                  <p className="text-white/35 text-xs mt-2.5">No credit card required.</p>
                </div>
              </div>
            </div>

            {/* Decorative badge — bottom-right of image area */}
            <div
              className="absolute bottom-10 right-8 z-20"
              style={{
                opacity: active && animating ? 1 : 0,
                transform: active && animating ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
              }}
            >
              {s.decorative.type === "circle" && (
                <div
                  className="w-32 h-32 rounded-full flex flex-col items-center justify-center text-center shadow-2xl border-4"
                  style={{ background: s.bg, borderColor: s.accent }}
                >
                  <span className="text-white/60 text-[10px] font-medium leading-tight px-2">{s.decorative.text}</span>
                  <span className="text-4xl font-extrabold leading-none" style={{ color: s.accent }}>{s.decorative.highlight}</span>
                  <span className="text-white/60 text-[10px] leading-tight px-2">{s.decorative.subtext}</span>
                </div>
              )}

              {s.decorative.type === "shield" && (
                <div
                  className="w-32 flex flex-col items-center justify-center text-center rounded-t-3xl rounded-b-[40%] shadow-2xl border-2 px-3 py-4"
                  style={{ background: `${s.accent}1a`, borderColor: s.accent }}
                >
                  <ShieldCheck className="w-10 h-10 mb-2" style={{ color: s.accent }} />
                  <span className="text-white text-[11px] font-semibold leading-snug">{s.decorative.text}</span>
                </div>
              )}

              {s.decorative.type === "card" && (
                <div
                  className="w-40 rounded-2xl shadow-2xl border px-4 py-4"
                  style={{ background: `${s.accent}1a`, borderColor: `${s.accent}66` }}
                >
                  <p className="text-white text-sm font-bold leading-snug mb-1">{s.decorative.line1}</p>
                  <p className="text-sm leading-snug font-medium" style={{ color: s.accent }}>{s.decorative.line2}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Prev / Next arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Previous slide"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Next slide"
        data-testid="button-next-slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="rounded-full transition-all"
            style={{
              width: i === currentSlide ? "24px" : "8px",
              height: "8px",
              background: i === currentSlide ? s.accent : "rgba(255,255,255,0.3)",
            }}
            aria-label={`Go to slide ${i + 1}`}
            data-testid={`button-dot-${i}`}
          />
        ))}
      </div>
    </section>
  );
}
