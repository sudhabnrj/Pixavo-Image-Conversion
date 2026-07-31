import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowRight, Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GalleryCardItem {
  id: string;
  toolId: string;
  title: string;
  subtitle: string;
  badge?: string;
  theme: 'taupe' | 'helios' | 'monica' | 'wedding' | 'loopscale' | 'larsen' | 'akris' | 'sands';
  headerImg?: string;
  gridImgs: string[];
}

export interface Hero3DGalleryProps {
  cards?: GalleryCardItem[];
  radius?: number;
  spacing?: number;
  rotationSpeed?: number;
  autoPlay?: boolean;
  enableMouseParallax?: boolean;
  enableScrollTrigger?: boolean;
  onSelectTool?: (toolId: string) => void;
}

const defaultCardsData: GalleryCardItem[] = [
  {
    id: 'taupe',
    toolId: 'raw-jpg',
    title: 'Studio Taupe',
    subtitle: 'RAW to JPG Development',
    badge: 'RAW .CR2',
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
    badge: 'HEIC / HEIF',
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
    badge: 'PNG to JPG',
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
    badge: 'RAW .NEF',
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
    badge: 'JPG to WebP',
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
    badge: 'WebP to PNG',
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
    badge: 'PNG to WebP',
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
    badge: 'PNG to RAW',
    theme: 'sands',
    headerImg: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=200&q=80',
    ],
  },
];

export const Hero3DGallery: React.FC<Hero3DGalleryProps> = ({
  cards = defaultCardsData,
  radius = 920,
  spacing = 0.38,
  rotationSpeed = 0.0003,
  autoPlay = true,
  enableMouseParallax = true,
  enableScrollTrigger = true,
  onSelectTool,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(0);
  const scrollRotationRef = useRef<number>(0);
  const hoveredCardIdRef = useRef<string | null>(null);
  const [, setHoveredCardId] = useState<string | null>(null);

  // Mouse Parallax Lerp State
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [cardTransforms, setCardTransforms] = useState<
    Array<{
      id: string;
      x: number;
      z: number;
      rotateY: number;
      scale: number;
      opacity: number;
      blur: number;
      zIndex: number;
    }>
  >([]);

  const [stageTilt, setStageTilt] = useState<{ rotateX: number; rotateY: number }>({
    rotateX: 0,
    rotateY: 0,
  });

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

  // Initialize GSAP ScrollTrigger for Hero Scroll Rotation
  useEffect(() => {
    if (!enableScrollTrigger || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        onUpdate: (self) => {
          scrollRotationRef.current = self.progress * Math.PI * 0.8;
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [enableScrollTrigger]);

  // Mouse Movement Parallax Event Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableMouseParallax || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

    // Max tilt: rotateX +- 5 deg, rotateY +- 8 deg
    mouseTargetRef.current = {
      x: relativeY * 10,  // tilt X based on vertical cursor
      y: relativeX * 16,  // tilt Y based on horizontal cursor
    };
  };

  const handleMouseLeave = () => {
    mouseTargetRef.current = { x: 0, y: 0 };
  };

  // Main 60fps RequestAnimationFrame Loop
  useEffect(() => {
    let animationFrameId: number;

    const numCards = cards.length;
    const centerIdx = (numCards - 1) / 2;

    const render = () => {
      // Auto-rotation (paused when hovering)
      if (autoPlay && !hoveredCardIdRef.current) {
        rotationRef.current += rotationSpeed;
      }

      // Lerp mouse parallax
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.08;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.08;

      setStageTilt({
        rotateX: mouseCurrentRef.current.x,
        rotateY: mouseCurrentRef.current.y,
      });

      const totalRotation = rotationRef.current + scrollRotationRef.current;

      // Compute 3D cylinder positioning math for each card
      const transforms = cards.map((card, index) => {
        const cardAngle = (index - centerIdx) * spacing + totalRotation;

        let x = Math.sin(cardAngle) * radius;
        let z = Math.cos(cardAngle) * radius - radius;
        const rotateYDeg = cardAngle * (180 / Math.PI);

        const distance = Math.abs(x);
        let scale = Math.max(0.68, 1 - Math.pow(distance / (radius * 0.8), 2) * 0.28);
        let opacity = Math.max(0.35, 1 - Math.pow(distance / (radius * 0.8), 2) * 0.45);
        const blur = Math.min(6, (distance / radius) * 12);
        let zIndex = Math.round(100 + z);

        // Hover Boost handling
        if (hoveredCardIdRef.current === card.id) {
          z += 70;
          scale *= 1.08;
          opacity = 1;
          zIndex += 200;
        }

        return {
          id: card.id,
          x,
          z,
          rotateY: rotateYDeg,
          scale,
          opacity,
          blur,
          zIndex,
        };
      });

      setCardTransforms(transforms);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [cards, radius, spacing, rotationSpeed, autoPlay]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-white text-slate-900 pt-20 pb-16 select-none"
    >
      {/* Background Soft Radial Glow & Vignette */}
      <div className="absolute inset-0 bg-radial from-slate-50 via-white to-slate-100/50 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-gradient-to-tr from-brand-violet/10 via-blue-100/20 to-indigo-100/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette opacity-20 pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 text-center pt-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-violet/15 bg-white/80 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-brand-violet shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Browser Image Converter Engine</span>
        </span>
      </div>

      {/* 3D Perspective Gallery Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[460px] sm:h-[520px] my-auto flex items-center justify-center overflow-visible px-4"
        style={{
          perspective: '2000px',
          perspectiveOrigin: '50% 46%',
        }}
      >
        {/* Gallery Base Shadow Bloom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] max-w-[1200px] h-12 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        {/* 3D Stage Container with Mouse Parallax Tilting */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${stageTilt.rotateX}deg) rotateY(${stageTilt.rotateY}deg)`,
            transition: 'transform 0.1s ease-out',
            willChange: 'transform',
          }}
        >
          {cards.map((card) => {
            const transformState = cardTransforms.find((t) => t.id === card.id);
            if (!transformState) return null;

            return (
              <motion.div
                key={card.id}
                onMouseEnter={() => {
                  setHoveredCardId(card.id);
                  hoveredCardIdRef.current = card.id;
                }}
                onMouseLeave={() => {
                  setHoveredCardId(null);
                  hoveredCardIdRef.current = null;
                }}
                onClick={() => onSelectTool && onSelectTool(card.toolId)}
                className="absolute w-[190px] sm:w-[215px] md:w-[235px] h-[370px] sm:h-[420px] bg-white rounded-[24px] border border-white/80 shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col justify-between cursor-pointer group"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `translate3d(${transformState.x}px, 0px, ${transformState.z}px) rotateY(${transformState.rotateY}deg) scale(${transformState.scale})`,
                  opacity: transformState.opacity,
                  filter: `blur(${transformState.blur}px)`,
                  zIndex: transformState.zIndex,
                  willChange: 'transform, opacity',
                  transition: 'transform 0.15s ease-out, filter 0.2s ease, opacity 0.2s ease',
                }}
              >
                {/* Edge Reflection Glassmorphism Highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/60 pointer-events-none z-30" />

                {/* CARD THEMES MATCHING EXACT SCREENSHOT */}

                {/* 1. STUDIO TAUPE */}
                {card.theme === 'taupe' && (
                  <div className="h-full flex flex-col justify-between bg-[#f5f2eb] p-3">
                    <h4 className="text-stone-700 font-serif italic text-xs tracking-widest text-center pt-2">
                      Studio Taupe
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 my-auto">
                      {card.gridImgs.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-20 object-cover rounded-md" loading="lazy" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. HELIOS */}
                {card.theme === 'helios' && (
                  <div className="h-full flex flex-col justify-between bg-[#faf7f2] p-2.5">
                    <div className="h-[120px] bg-amber-300/80 rounded-xl flex items-center justify-center p-2">
                      {card.headerImg && <img src={card.headerImg} alt="" className="h-full w-full object-cover rounded-lg" />}
                    </div>
                    <div className="grid grid-cols-3 gap-1 my-auto">
                      {card.gridImgs.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-14 object-cover rounded" loading="lazy" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. MONICA VINADER */}
                {card.theme === 'monica' && (
                  <div className="h-full flex flex-col justify-between bg-white p-2.5">
                    <div className="relative h-[110px] rounded-xl overflow-hidden">
                      {card.headerImg && <img src={card.headerImg} alt="" className="w-full h-full object-cover" />}
                      <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-bold text-xs tracking-widest uppercase">
                        MONICA VINADER
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 my-1">
                      {card.gridImgs.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-14 object-cover rounded" loading="lazy" />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {card.gridImgs.slice(3, 5).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-20 object-cover rounded-lg" loading="lazy" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. WEDDING / AISLE */}
                {card.theme === 'wedding' && (
                  <div className="h-full flex flex-col justify-between bg-white p-2.5">
                    <div className="h-[100px] rounded-xl overflow-hidden">
                      {card.headerImg && <img src={card.headerImg} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="grid grid-cols-3 gap-1 my-1">
                      {card.gridImgs.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. G LOOPSCALE (ELECTRIC BLUE) */}
                {card.theme === 'loopscale' && (
                  <div className="h-full flex flex-col justify-between bg-[#3545ff] text-white p-3">
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="font-bold text-sm italic">G</span>
                      <span className="font-bold text-sm tracking-tight">loopscale</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 my-auto">
                      {card.gridImgs.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded-md" loading="lazy" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. LARSEN SOTELO */}
                {card.theme === 'larsen' && (
                  <div className="h-full flex flex-col justify-between bg-black text-white p-2.5">
                    <div className="relative h-[110px] rounded-xl overflow-hidden">
                      {card.headerImg && <img src={card.headerImg} alt="" className="w-full h-full object-cover opacity-80" />}
                      <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs">
                        Larsen Sotelo
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 my-1">
                      {card.gridImgs.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. A-K-R-I-S- */}
                {card.theme === 'akris' && (
                  <div className="h-full flex flex-col justify-between bg-white p-2.5">
                    <div className="relative h-[95px] rounded-xl overflow-hidden">
                      {card.headerImg && <img src={card.headerImg} alt="" className="w-full h-full object-cover" />}
                      <span className="absolute inset-0 bg-black/25 flex items-center justify-center text-white font-black text-xs tracking-widest uppercase">
                        A-K-R-I-S-
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 my-1">
                      {card.gridImgs.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. SANDS OF TIME */}
                {card.theme === 'sands' && (
                  <div className="h-full flex flex-col justify-between bg-[#faf7f2] p-2.5">
                    <div className="relative h-[100px] rounded-xl overflow-hidden">
                      {card.headerImg && <img src={card.headerImg} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="grid grid-cols-2 gap-1 my-1">
                      {card.gridImgs.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-16 object-cover rounded" loading="lazy" />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Title & Subtitle matching Picflow Hero layout */}
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
