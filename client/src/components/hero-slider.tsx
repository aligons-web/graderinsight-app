import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, CheckCircle, BarChart2, FileText, UploadCloud, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import image1 from "@assets/i1_1779742652462.jpg";
import image2 from "@assets/i2_1778626320629.jpg";
import image3 from "@assets/I3_1778626320629.jpg";
import image4 from "@assets/I4_1778626320629.jpg";

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
};

const slides: Slide[] = [
  {
    image: image1,
    bg: "#0c0b1d",
    accent: "#f5c518",
    headline1: "Grade quicker.",
    headline2: "Teach more.",
    description: "AI-powered writing analysis that gives you clear insights, consistent grading, and hours back in your week.",
    badges: ["Accurate", "Consistent", "Time-Saving"],
  },
  {
    image: image2,
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
  },
  {
    image: image3,
    bg: "#071a0b",
    accent: "#4ade80",
    headline1: "Grade smarter.",
    headline2: "Empower students.",
    description: "Deliver better feedback, promote academic growth, and keep integrity at the center.",
    badges: ["Writing Analysis", "Originality Review", "Rubric-Based Grading", "Consistency You Can Trust"],
  },
  {
    image: image4,
    bg: "#1a0c30",
    accent: "#d946ef",
    headline1: "Grade precisely.",
    headline2: "Inspire excellence.",
    description: "Detailed insights. Clear feedback. Better writing. Stronger results.",
    badges: ["Grammar & Clarity", "Thesis Evaluation", "Evidence Review", "Sentence-Level Feedback"],
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
            style={{
              opacity: active ? 1 : 0,
              zIndex: active ? 10 : 0,
              transition: "opacity 0.6s ease",
              pointerEvents: active ? "auto" : "none",
            }}
            data-testid={`slide-${index}`}
          >
            {/* Full-bleed image fills the right half of the slide */}
            <div className="absolute inset-0 flex">
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

            {/* Gradient: solid bg on left, fades out over image */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${s.bg} 0%, ${s.bg} 36%, ${s.bg}cc 50%, ${s.bg}55 62%, transparent 78%)`,
              }}
            />

            {/* Bottom fade for dot area readability */}
            <div
              className="absolute bottom-0 left-0 right-0 h-20"
              style={{ background: `linear-gradient(to top, ${s.bg}bb, transparent)` }}
            />

            {/* Left content */}
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full max-w-7xl mx-auto px-8 lg:px-14"
                style={{
                  opacity: active && animating ? 1 : 0,
                  transform: active && animating ? "translateX(0)" : "translateX(-24px)",
                  transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
              >
                <div className="max-w-[500px]">
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
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2 items-center">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="rounded-full transition-all duration-300"
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
