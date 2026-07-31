import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Sparkles, ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface PanoramicSlideItem {
  id: string;
  toolId: string;
  title: string;
  subtitle: string;
  theme: 'taupe' | 'helios' | 'monica' | 'wedding' | 'loopscale' | 'larsen' | 'akris' | 'sands' | 'japanese' | 'normal';
  headerImg?: string;
  gridImgs: string[];
}

export interface Hero3DGalleryProps {
  slides?: PanoramicSlideItem[];
  radius?: number;
  slidesInRing?: number;
  rotationSpeed?: number;
  autoRotate?: boolean;
  pauseOnHover?: boolean;
  onSelectTool?: (toolId: string) => void;
}

const baseSlides: PanoramicSlideItem[] = [
  {
    id: 'taupe',
    toolId: 'raw-jpg',
    title: 'Studio Taupe',
    subtitle: 'RAW to JPG Development',
    theme: 'taupe',
    gridImgs: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'helios',
    toolId: 'heic-jpg',
    title: 'HELIOS',
    subtitle: 'Apple HEIC Studio',
    theme: 'helios',
    headerImg: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
    ],
  },
  {
    id: 'monica',
    toolId: 'png-jpg',
    title: 'MONICA VINADER',
    subtitle: 'PNG Compression',
    theme: 'monica',
    headerImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=250&q=80',
    ],
  },
  {
    id: 'wedding',
    toolId: 'raw-png',
    title: 'Wedding Aisle',
    subtitle: 'RAW to Lossless PNG',
    theme: 'wedding',
    headerImg: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=200&q=80',
    ],
  },
  {
    id: 'loopscale',
    toolId: 'jpg-webp',
    title: 'G loopscale',
    subtitle: 'JPG to WebP Pipeline',
    theme: 'loopscale',
    gridImgs: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80',
    ],
  },
  {
    id: 'larsen',
    toolId: 'webp-png',
    title: 'Larsen Sotelo',
    subtitle: 'WebP to PNG Studio',
    theme: 'larsen',
    headerImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    ],
  },
  {
    id: 'akris',
    toolId: 'png-webp',
    title: 'A-K-R-I-S-',
    subtitle: 'PNG to WebP High Speed',
    theme: 'akris',
    headerImg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
    ],
  },
  {
    id: 'sands',
    toolId: 'png-raw',
    title: 'Sands of Time',
    subtitle: 'PNG to DNG Container',
    theme: 'sands',
    headerImg: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=200&q=80',
    ],
  },
  {
    id: 'japanese',
    toolId: 'raw-png',
    title: 'Japanese Restaurant',
    subtitle: 'Architecture RAW to PNG',
    theme: 'japanese',
    headerImg: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1526371889698-cf78c088247c?auto=format&fit=crop&w=250&q=80',
    ],
  },
  {
    id: 'normal',
    toolId: 'png-raw',
    title: 'NORMAL Studio',
    subtitle: 'PNG to Uncompressed DNG',
    theme: 'normal',
    gridImgs: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=250&q=80',
    ],
  },
];

export const Hero3DGallery: React.FC<Hero3DGalleryProps> = ({
  slides = baseSlides,
  radius = 1200,
  slidesInRing = 18, // 18 slides evenly distributed around 360-degree cylinder
  rotationSpeed = 0.12, // Degrees per frame
  autoRotate = true,
  pauseOnHover = true,
  onSelectTool,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Duplicate slides array if necessary to fill slidesInRing count
  const allSlides = React.useMemo(() => {
    const list: PanoramicSlideItem[] = [];
    for (let i = 0; i < slidesInRing; i++) {
      list.push(slides[i % slides.length]);
    }
    return list;
  }, [slides, slidesInRing]);

  const anglePerSlide = 360 / slidesInRing;
  // Arc length width for each slide card
  const slideWidth = Math.round((anglePerSlide * (Math.PI / 180)) * radius);
  const slideHeight = 420;

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // LIGHTSPUN CREATIVE GSAP TICKER 3D CYLINDER ROTATION SYSTEM
  useEffect(() => {
    if (!ringRef.current) return;
    const ring = ringRef.current;

    let updateRotationFunction: (() => void) | null = null;
    let speedTween: gsap.core.Tween | null = null;
    let lastUpdateTime = Date.now();
    const speedController = { value: 0 };
    const rotationDirection = 1; // 1 for clockwise left-to-right rotation

    // Set initial ring angle
    gsap.set(ring, { rotationY: 0 });

    // Function updated by GSAP Ticker
    function updateRotation() {
      const currentSpeed = speedController.value;
      if (currentSpeed === 0) return;

      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime;
      lastUpdateTime = currentTime;

      const rotationAmount = (deltaTime / 16.67) * currentSpeed * rotationDirection;
      gsap.to(ring, {
        rotationY: `+=${rotationAmount}`,
        duration: 0,
        overwrite: true,
      });
    }

    function startAutoRotation() {
      if (!autoRotate) return;
      lastUpdateTime = Date.now();
      updateRotationFunction = updateRotation;
      gsap.ticker.add(updateRotationFunction);

      if (speedTween) speedTween.kill();
      speedTween = gsap.to(speedController, {
        value: rotationSpeed,
        duration: 0.5,
        ease: 'power1.out',
      });
    }

    function stopAutoRotation() {
      if (speedTween) speedTween.kill();
      speedTween = gsap.to(speedController, {
        value: 0,
        duration: 0.5,
        ease: 'power1.in',
        onComplete: () => {
          if (updateRotationFunction) {
            gsap.ticker.remove(updateRotationFunction);
            updateRotationFunction = null;
          }
        },
      });
    }

    startAutoRotation();

    // Hover event listeners with ease-in / ease-out
    const container = containerRef.current;
    if (container && pauseOnHover) {
      const handleEnter = () => stopAutoRotation();
      const handleLeave = () => startAutoRotation();

      container.addEventListener('mouseenter', handleEnter);
      container.addEventListener('mouseleave', handleLeave);
      container.addEventListener('touchstart', handleEnter, { passive: true });
      container.addEventListener('touchend', handleLeave);

      return () => {
        container.removeEventListener('mouseenter', handleEnter);
        container.removeEventListener('mouseleave', handleLeave);
        container.removeEventListener('touchstart', handleEnter);
        container.removeEventListener('touchend', handleLeave);
        if (updateRotationFunction) gsap.ticker.remove(updateRotationFunction);
      };
    }

    return () => {
      if (updateRotationFunction) gsap.ticker.remove(updateRotationFunction);
    };
  }, [autoRotate, rotationSpeed, pauseOnHover]);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-white text-slate-900 pt-20 pb-16 select-none">
      {/* Soft Lighting & Glow */}
      <div className="absolute inset-0 bg-radial from-slate-50 via-white to-slate-100/60 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-gradient-to-tr from-brand-violet/10 via-blue-100/20 to-indigo-100/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 text-center pt-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-violet/15 bg-white/80 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-brand-violet shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Browser Image Converter Engine</span>
        </span>
      </div>

      {/* Lightspun Creative Panoramic 3D Carousel Stage */}
      <div
        ref={containerRef}
        className="ls-curved-carousel relative w-full h-[480px] sm:h-[530px] my-auto flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          maskImage: 'linear-gradient(90deg, transparent 0%, white 18%, white 82%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, white 18%, white 82%, transparent 100%)',
        }}
      >
        <div
          className="ls-curved-carousel__stage absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            perspective: '1000px',
            width: `${slideWidth}px`,
            height: `${slideHeight}px`,
          }}
        >
          {/* Rotating Ring Container */}
          <div
            ref={ringRef}
            className="ls-curved-carousel__ring absolute w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {allSlides.map((slide, index) => {
              const rotateYAngle = index * -anglePerSlide;

              return (
                <div
                  key={`${slide.id}-${index}`}
                  onClick={() => onSelectTool && onSelectTool(slide.toolId)}
                  className="ls-curved-carousel__slide absolute bg-white rounded-[24px] border border-black/[0.08] shadow-2xl shadow-slate-950/10 overflow-hidden flex flex-col justify-between cursor-pointer transition-transform duration-300 hover:scale-[1.05]"
                  style={{
                    width: `${slideWidth}px`,
                    height: `${slideHeight}px`,
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${rotateYAngle}deg) translateZ(-${radius}px)`,
                    transformOrigin: `50% 50% ${radius}px`,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Glassmorphism Edge Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/60 pointer-events-none z-30" />

                  {/* 1. STUDIO TAUPE */}
                  {slide.theme === 'taupe' && (
                    <div className="h-full flex flex-col justify-between bg-[#f5f2eb] p-3">
                      <h4 className="text-stone-700 font-serif italic text-xs tracking-widest text-center pt-2">
                        Studio Taupe
                      </h4>
                      <div className="grid grid-cols-2 gap-1.5 my-auto">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-20 object-cover rounded-md" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. HELIOS */}
                  {slide.theme === 'helios' && (
                    <div className="h-full flex flex-col justify-between bg-[#faf7f2] p-2.5">
                      <div className="h-[120px] bg-amber-300/80 rounded-xl flex items-center justify-center p-2">
                        {slide.headerImg && <img src={slide.headerImg} alt="" className="h-full w-full object-cover rounded-lg" />}
                      </div>
                      <div className="grid grid-cols-3 gap-1 my-auto">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-14 object-cover rounded" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. MONICA VINADER */}
                  {slide.theme === 'monica' && (
                    <div className="h-full flex flex-col justify-between bg-white p-2.5">
                      <div className="relative h-[110px] rounded-xl overflow-hidden">
                        {slide.headerImg && <img src={slide.headerImg} alt="" className="w-full h-full object-cover" />}
                        <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-bold text-xs tracking-widest uppercase">
                          MONICA VINADER
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 my-1">
                        {slide.gridImgs.slice(0, 3).map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-14 object-cover rounded" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. WEDDING / AISLE */}
                  {slide.theme === 'wedding' && (
                    <div className="h-full flex flex-col justify-between bg-white p-2.5">
                      <div className="h-[100px] rounded-xl overflow-hidden">
                        {slide.headerImg && <img src={slide.headerImg} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="grid grid-cols-3 gap-1 my-1">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. G LOOPSCALE (ELECTRIC BLUE) */}
                  {slide.theme === 'loopscale' && (
                    <div className="h-full flex flex-col justify-between bg-[#3545ff] text-white p-3">
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="font-bold text-sm italic">G</span>
                        <span className="font-bold text-sm tracking-tight">loopscale</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 my-auto">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded-md" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. LARSEN SOTELO */}
                  {slide.theme === 'larsen' && (
                    <div className="h-full flex flex-col justify-between bg-black text-white p-2.5">
                      <div className="relative h-[110px] rounded-xl overflow-hidden">
                        {slide.headerImg && <img src={slide.headerImg} alt="" className="w-full h-full object-cover opacity-80" />}
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs">
                          Larsen Sotelo
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 my-1">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. A-K-R-I-S- */}
                  {slide.theme === 'akris' && (
                    <div className="h-full flex flex-col justify-between bg-white p-2.5">
                      <div className="relative h-[95px] rounded-xl overflow-hidden">
                        {slide.headerImg && <img src={slide.headerImg} alt="" className="w-full h-full object-cover" />}
                        <span className="absolute inset-0 bg-black/25 flex items-center justify-center text-white font-black text-xs tracking-widest uppercase">
                          A-K-R-I-S-
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 my-1">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. SANDS OF TIME */}
                  {slide.theme === 'sands' && (
                    <div className="h-full flex flex-col justify-between bg-[#faf7f2] p-2.5">
                      <div className="relative h-[100px] rounded-xl overflow-hidden">
                        {slide.headerImg && <img src={slide.headerImg} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="grid grid-cols-2 gap-1 my-1">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 9. JAPANESE RESTAURANT */}
                  {slide.theme === 'japanese' && (
                    <div className="h-full flex flex-col justify-between bg-[#18181b] text-white p-2.5">
                      <div className="relative h-[100px] rounded-xl overflow-hidden">
                        {slide.headerImg && <img src={slide.headerImg} alt="" className="w-full h-full object-cover opacity-80" />}
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs tracking-widest uppercase">
                          Japanese Restaurant
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 my-1">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 10. NORMAL STUDIO */}
                  {slide.theme === 'normal' && (
                    <div className="h-full flex flex-col justify-between bg-white p-2.5">
                      <div className="h-[60px] w-full bg-white flex items-center justify-start px-2 pt-2 border-b border-slate-100">
                        <h3 className="text-slate-950 font-black text-xl tracking-tighter uppercase font-mono">
                          NORMAL
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 my-auto">
                        {slide.gridImgs.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-20 object-cover rounded-lg" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Title & Subtitle matching Picflow Hero */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 px-4 pt-6">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#111319] tracking-tight leading-[1.06]">
          Client Galleries for Photographers
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#5d6e82] font-normal leading-relaxed">
          Create branded galleries and impress clients with a simple link. Let them favorite, comment, and download — all without signing up.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#select-tools"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-600/25 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <span>Try for Free</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
