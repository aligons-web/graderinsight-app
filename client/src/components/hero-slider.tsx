import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import image1 from "@assets/image1_1767111780441.jpg";
import image2 from "@assets/image2_1767111780441.jpg";
import image3 from "@assets/image3_1767110758724.jpg";
import image4 from "@assets/image4_1767111780441.jpg";

const slides = [
  {
    image: image1,
    text: "Grade precisely and accurately",
    showButton: false,
  },
  {
    image: image2,
    text: "Grade quicker and smarter",
    showButton: false,
  },
  {
    image: image3,
    text: "Grade efficiently and effectively",
    showButton: false,
  },
  {
    image: image4,
    text: "Grade and maintain life-work balance!",
    showButton: true,
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const goToSlide = useCallback((index: number) => {
    setIsAnimating(false);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(true);
    }, 50);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide, nextSlide]);

  return (
    <section className="relative w-full h-[250px] md:h-[300px] lg:h-[350px] overflow-hidden" data-testid="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          data-testid={`slide-${index}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="relative h-full flex items-center justify-center px-4">
            <div
              className={`text-center transform transition-all duration-700 ease-out ${
                index === currentSlide && isAnimating
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
              style={{
                animation: index === currentSlide && isAnimating 
                  ? "slideInBounce 0.8s ease-out forwards" 
                  : "none"
              }}
            >
              <div
                className="inline-block px-6 py-4 md:px-10 md:py-6 rounded-lg"
                style={{ backgroundColor: "rgba(93, 58, 122, 0.8)" }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {slide.text}
                </h2>
                {slide.showButton && (
                  <Link href="/signup" data-testid="link-slider-cta">
                    <Button
                      size="lg"
                      className="mt-4 text-lg font-bold px-8"
                      style={{ backgroundColor: "#5D3A7A", color: "white" }}
                      data-testid="button-slider-cta"
                    >
                      Start Your 7-Day Trial
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-all hover:bg-white/20"
        aria-label="Previous slide"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-all hover:bg-white/20"
        aria-label="Next slide"
        data-testid="button-next-slide"
      >
        <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            data-testid={`button-dot-${index}`}
          />
        ))}
      </div>

      <style>{`
        @keyframes slideInBounce {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          60% {
            opacity: 1;
            transform: translateX(8px);
          }
          80% {
            transform: translateX(-4px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
