"use client";
import {useState, useEffect, useCallback, TouchEvent} from "react";
import Image from "next/image";
import {ProductsSectionProps} from "./types";

const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#172722";
const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#CBD894";

export function ProductsSection(props: ProductsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const minSwipeDistance = 50;
  const itemsPerView = isMobile ? 1 : 3;
  const totalPages = Math.ceil(props.products.length / itemsPerView);

  function pauseAutoPlay() {
    setIsAutoPlaying(false);
  }

  function resumeAutoPlay() {
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  function goToSlide(index: number) {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }

  function handleTouchStart(e: TouchEvent) {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: TouchEvent) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 5000);
    } else if (isRightSwipe) {
      prevSlide();
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  }

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || totalPages <= 1) return;

    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, totalPages]);

  useEffect(() => {
    if (currentIndex >= totalPages) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalPages]);

  if (props.products.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      <div
        className="h-32 md:h-40 relative"
        style={{background: `linear-gradient(to bottom, ${primaryColor} 0%, ${primaryColor} 20%, ${secondaryColor} 100%)`}}
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white/20 rounded-full" />
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white/30 rounded-full" />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40 rounded-full" />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 rounded-full" />
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white/60 rounded-full" />
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white/70 rounded-full" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white/80 rounded-full" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white/90 rounded-full" />
          </div>
          <div className="bg-white rounded-full p-2 shadow-lg">
            <Image src="/assets/icon.png" alt="Logo" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white/90 rounded-full" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white/80 rounded-full" />
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white/70 rounded-full" />
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white/60 rounded-full" />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 rounded-full" />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40 rounded-full" />
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white/30 rounded-full" />
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="py-12 md:py-16 relative" style={{backgroundColor: secondaryColor}}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-2" style={{color: primaryColor}}>
              Nossos Produtos Mais Vendidos!
            </h2>
            <p className="text-sm md:text-base max-w-xl mx-auto" style={{color: primaryColor, opacity: 0.8}}>
              Descubra os favoritos dos nossos clientes
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              <div className="flex transition-transform duration-500 ease-out" style={{transform: `translateX(-${currentIndex * 100}%)`}}>
                {Array.from({length: totalPages}).map((_, pageIndex) => (
                  <div key={pageIndex} className="w-full flex-shrink-0">
                    <div className="flex justify-center gap-6 px-2 py-4">
                      {props.products.slice(pageIndex * itemsPerView, pageIndex * itemsPerView + itemsPerView).map((product, index) => (
                        <div
                          key={index}
                          className="group relative w-full md:w-[360px] flex-shrink-0"
                          onMouseEnter={pauseAutoPlay}
                          onMouseLeave={resumeAutoPlay}
                        >
                          <div
                            className="absolute -inset-[3px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{backgroundColor: primaryColor}}
                          />
                          <div className="relative bg-white rounded-2xl overflow-hidden transition-all duration-300 h-[540px]">
                            <div className="relative h-[350px] md:h-[350px]">
                              {product.image ? (
                                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                                  <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )}
                              <div className="absolute top-2 left-2">
                                <span className="inline-flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Destaque
                                </span>
                              </div>
                            </div>
                            <div className="p-5 flex-1">
                              <h3 className="text-xl font-bold text-gray-800 mb-3">{product.name}</h3>
                              {product.description && (
                                <div className="max-h-[120px] overflow-y-auto pr-2">
                                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <>
                <button
                  onClick={() => {
                    prevSlide();
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 5000);
                  }}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 group"
                  aria-label="Anterior"
                >
                  <svg
                    className="w-5 h-5 text-gray-800 group-hover:text-amber-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    nextSlide();
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 5000);
                  }}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 group"
                  aria-label="Próximo"
                >
                  <svg
                    className="w-5 h-5 text-gray-800 group-hover:text-amber-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({length: totalPages}).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex ? "w-6 h-2 bg-amber-500" : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Ir para página ${index + 1}`}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && <p className="text-center text-gray-500 text-xs mt-4 md:hidden">Deslize para ver mais</p>}

          <div className="text-center mt-8">
            <a
              href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Encomende Pelo Whatsapp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
