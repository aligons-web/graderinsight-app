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
  buttonBg: string;
  headline1: string;
  headline2: string;
  description: string;
  badges?: string[];
  features?: SlideFeature[];
  decorative: { type: "circle" | "shield" | "card"; text?: string; highlight?: string; subtext?: string; line1?: string; line2?: string };
};

const slides: Slide[] = [
  {
    image: image2,
    bg: "#0c0b1d",
    accent: "#f5c518",
    buttonBg: "#f5c518",
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
    buttonBg: "#22d3ee",
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
    buttonBg: "#4ade80",
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
    buttonBg: "#d946ef",
    headline1: "Grade precisely.",
    headline2: "Inspire excellence.",
    description: "Detailed insights. Clear feedback. Better writing. Stronger results.",
    badges: ["Grammar & Clarity", "Thesis Evaluation", "Evidence Review", "Sentence-Level Feedback"],
    decorative: { type: "card", line1: "Precision You Can See.", line2: "Results They Can Feel." },
  },
];

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
      className="relative w-full overflow-hidden transition-colors duration-700"
      style={{ background: slide.bg, minHeight: "520px" }}
      data-testid="hero-slider"
    >
      {slides.map((s, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-600 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          data-testid={`slide-${index}`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center" style={{ minHeight: "520px" }}>
            <div className="flex flex-col lg:flex-row items-center w-full gap-6 py-12">

              {/* Left: Content */}
              <div
                className={`flex-1 z-10 transition-all duration-700 ease-out ${index === currentSlide && animating ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 text-white">
                  {s.headline1}<br />
                  <span style={{ color: s.accent }}>{s.headline2}</span>
                </h1>
                <p className="text-white/70 text-base md:text-lg mb-5 max-w-md leading-relaxed">
                  {s.description}
                </p>

                {s.badges && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {s.badges.map((b) => (
                      <span key={b} className="flex items-center gap-1.5 text-white/80 text-sm">
                        <CheckCircle className="w-4 h-4" style={{ color: s.accent }} />
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                {s.features && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
                    {s.features.map((f) => (
                      <span key={f.label} className="flex items-center gap-2 text-white/80 text-sm">
                        <f.icon className="w-4 h-4" style={{ color: s.accent }} />
                        {f.label}
                      </span>
                    ))}
                  </div>
                )}

                <Link href="/signup" data-testid="link-slider-cta">
                  <Button
                    size="lg"
                    className="font-bold px-7 text-[#0c0b1d] hover:opacity-90 transition-opacity"
                    style={{ background: s.accent, color: "#0c0b1d" }}
                    data-testid="button-slider-cta"
                  >
                    Start Your 7-Day Trial →
                  </Button>
                </Link>
                <p className="text-white/40 text-xs mt-2">No credit card required.</p>
              </div>

              {/* Right: Image + Decorative */}
              <div
                className={`relative flex-1 flex items-center justify-center transition-all duration-700 ease-out delay-100 ${index === currentSlide && animating ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
                style={{ minHeight: "340px" }}
              >
                <div className="relative w-full h-full flex items-center justify-end">
                  {/* Gradient fade on left of image */}
                  <div
                    className="absolute inset-y-0 left-0 w-32 z-10"
                    style={{ background: `linear-gradient(to right, ${s.bg}, transparent)` }}
                  />
                  <img
                    src={s.image}
                    alt="Educator"
                    className="w-full max-w-md object-cover rounded-lg"
                    style={{ maxHeight: "380px", objectPosition: "center top" }}
                  />

                  {/* Decorative element */}
                  {s.decorative.type === "circle" && (
                    <div
                      className="absolute bottom-4 right-0 w-28 h-28 rounded-full flex flex-col items-center justify-center text-center shadow-xl border-4 z-20"
                      style={{ background: s.bg, borderColor: s.accent, color: s.accent }}
                    >
                      <span className="text-white/70 text-[10px] font-medium leading-tight">{s.decorative.text}</span>
                      <span className="text-3xl font-extrabold leading-none" style={{ color: s.accent }}>{s.decorative.highlight}</span>
                      <span className="text-white/70 text-[10px] leading-tight">{s.decorative.subtext}</span>
                    </div>
                  )}

                  {s.decorative.type === "shield" && (
                    <div
                      className="absolute bottom-4 right-0 w-28 h-32 flex flex-col items-center justify-center text-center z-20 rounded-t-2xl rounded-b-3xl shadow-xl border-2 px-2"
                      style={{ background: `${s.accent}22`, borderColor: s.accent }}
                    >
                      <ShieldCheck className="w-8 h-8 mb-1" style={{ color: s.accent }} />
                      <span className="text-white text-[10px] font-semibold leading-tight">{s.decorative.text}</span>
                    </div>
                  )}

                  {s.decorative.type === "card" && (
                    <div
                      className="absolute bottom-4 right-0 w-36 rounded-xl shadow-xl border px-3 py-3 z-20"
                      style={{ background: `${s.accent}22`, borderColor: s.accent }}
                    >
                      <p className="text-white text-xs font-bold leading-snug">{s.decorative.line1}</p>
                      <p className="text-xs mt-1 leading-snug" style={{ color: s.accent }}>{s.decorative.line2}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Previous slide"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="w-7 h-7 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Next slide"
        data-testid="button-next-slide"
      >
        <ChevronRight className="w-7 h-7 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{ background: i === currentSlide ? s.accent : "rgba(255,255,255,0.35)" }}
            aria-label={`Go to slide ${i + 1}`}
            data-testid={`button-dot-${i}`}
          />
        ))}
      </div>
    </section>
  );
}
