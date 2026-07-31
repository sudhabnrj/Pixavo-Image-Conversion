import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface GalleryCardData {
  id: string;
  toolId: string;
  title: string;
  subtitle: string;
  badge: string;
  theme: 'dark' | 'light' | 'warm' | 'cool' | 'minimal';
  mainImg: string;
  gridImgs: string[];
}

const cardsData: GalleryCardData[] = [
  {
    id: '1',
    toolId: 'raw-jpg',
    title: 'Larsen Sotelo',
    subtitle: 'RAW to JPG Development',
    badge: 'RAW .CR2',
    theme: 'dark',
    mainImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: '2',
    toolId: 'heic-jpg',
    title: 'A-K-R-I-S-',
    subtitle: 'Apple HEIC Photo Studio',
    badge: 'HEIC / HEIF',
    theme: 'light',
    mainImg: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: '3',
    toolId: 'png-jpg',
    title: 'Sands of Time',
    subtitle: 'PNG Transparency Compression',
    badge: 'PNG to JPG',
    theme: 'warm',
    mainImg: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1471922694854-ff24a5691694?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: '4',
    toolId: 'webp-png',
    title: 'HELLO DOTA',
    subtitle: 'WebP Digital Asset Pipeline',
    badge: 'WebP to PNG',
    theme: 'cool',
    mainImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: '5',
    toolId: 'jpg-webp',
    title: 'Agostino Cocktails',
    subtitle: 'Commercial JPG to WebP',
    badge: 'JPG to WebP',
    theme: 'dark',
    mainImg: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: '6',
    toolId: 'raw-png',
    title: 'Japanese Restaurant',
    subtitle: 'Architecture RAW to PNG',
    badge: 'RAW .NEF',
    theme: 'dark',
    mainImg: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: '7',
    toolId: 'png-raw',
    title: 'Normal Studio',
    subtitle: 'PNG to Uncompressed DNG',
    badge: 'PNG to RAW',
    theme: 'minimal',
    mainImg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    gridImgs: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1460353581641-37babbab0fa2?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=300&q=80',
    ],
  },
];

interface Hero3DGalleryProps {
  onSelectTool: (toolId: string) => void;
}

export const Hero3DGallery: React.FC<Hero3DGalleryProps> = ({ onSelectTool }) => {
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Smooth continuous rotation loop
  useEffect(() => {
    if (isPaused || isDragging) return;

    let lastTime = performance.now();
    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      setRotationAngle((prev) => (prev + delta * 0.008) % 360);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPaused, isDragging]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startAngleRef.current = rotationAngle;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setRotationAngle(startAngleRef.current + deltaX * 0.3);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      startAngleRef.current = rotationAngle;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    setRotationAngle(startAngleRef.current + deltaX * 0.3);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const rotateLeft = () => setRotationAngle((prev) => prev - 25);
  const rotateRight = () => setRotationAngle((prev) => prev + 25);

  const numCards = cardsData.length;
  const angleStep = 360 / numCards;

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden pt-24 pb-12 select-none">
      {/* Subtle Background Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-brand-violet/10 via-indigo-400/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 text-center space-y-3 px-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-brand-violet/15 bg-white/80 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-brand-violet shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Local Browser Image Converter</span>
        </div>
      </div>

      {/* 3D Perspective Gallery Viewport */}
      <div
        className="relative w-full h-[520px] sm:h-[580px] my-4 cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ perspective: '1600px', perspectiveOrigin: '50% 38%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 3D Carousel Stage */}
        <div
          className="relative w-[280px] sm:w-[320px] h-[460px] sm:h-[500px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${-rotationAngle}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {cardsData.map((card, idx) => {
            const cardAngle = idx * angleStep;
            // Radius of 3D cylinder arc
            const radius = 620;

            const themeStyles = {
              dark: 'bg-slate-900 text-white border-slate-800 shadow-2xl shadow-black/40',
              light: 'bg-white text-slate-900 border-slate-200/80 shadow-2xl shadow-slate-300/40',
              warm: 'bg-[#fcf8f2] text-amber-950 border-amber-200/60 shadow-2xl shadow-amber-900/15',
              cool: 'bg-slate-950 text-cyan-50 border-cyan-900/40 shadow-2xl shadow-cyan-950/50',
              minimal: 'bg-zinc-50 text-zinc-900 border-zinc-200 shadow-2xl shadow-zinc-300/40',
            }[card.theme];

            return (
              <div
                key={card.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTool(card.toolId);
                }}
                className={`absolute inset-0 rounded-[2rem] border p-4 sm:p-5 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.03] group ${themeStyles}`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Card Top Title & Badge */}
                <div className="space-y-1 z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
                      {card.title}
                    </h3>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-brand-violet/15 text-brand-violet border border-brand-violet/20">
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 font-medium">{card.subtitle}</p>
                </div>

                {/* Card Main Image Hero */}
                <div className="relative my-3 h-[180px] sm:h-[200px] w-full rounded-2xl overflow-hidden shadow-inner shrink-0 group-hover:shadow-md transition-shadow">
                  <img
                    src={card.mainImg}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-bold text-white tracking-wide uppercase drop-shadow-md">
                    {card.title}
                  </span>
                </div>

                {/* Grid Thumbnails Container */}
                <div className="grid grid-cols-3 gap-1.5">
                  {card.gridImgs.map((imgUrl, gIdx) => (
                    <div
                      key={gIdx}
                      className="h-[55px] sm:h-[62px] rounded-xl overflow-hidden bg-slate-200/50"
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>

                {/* Bottom Card Action */}
                <div className="pt-2 flex items-center justify-between text-xs font-bold opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] group-hover:text-brand-violet transition-colors">
                    Convert Format &rarr;
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Pixavo Studio</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Control Buttons Overlay */}
        <div className="absolute inset-x-4 sm:inset-x-12 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
          <button
            onClick={rotateLeft}
            className="p-3 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-slate-200/80 shadow-lg backdrop-blur-md transition-all hover:scale-110 pointer-events-auto cursor-pointer"
            aria-label="Rotate left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={rotateRight}
            className="p-3 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-slate-200/80 shadow-lg backdrop-blur-md transition-all hover:scale-110 pointer-events-auto cursor-pointer"
            aria-label="Rotate right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Bottom Heading & Description (Exact layout matching Picflow style) */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 px-4 pt-2">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
          Client Galleries for Photographers
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Create branded galleries and impress clients with a simple link. Let them favorite, comment, and download — all without signing up.
        </p>

        {/* Call-to-action Action Buttons */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#select-tools"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-violet via-violet-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-brand-violet/25 hover:shadow-brand-violet/40 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <span>Try for Free</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-200 bg-white/90 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 text-brand-violet" /> : <Pause className="w-4 h-4 text-slate-400" />}
            <span>{isPaused ? 'Resume Rotation' : 'Pause Rotation'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
