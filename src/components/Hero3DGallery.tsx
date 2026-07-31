import React, { useState, useEffect, useRef } from 'react';

interface Hero3DGalleryProps {
  onSelectTool?: (toolId: string) => void;
}

export const Hero3DGallery: React.FC<Hero3DGalleryProps> = ({ onSelectTool }) => {
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Smooth continuous auto-rotation from left to right (clockwise)
  useEffect(() => {
    if (isPaused || isDragging) return;

    let lastTime = performance.now();
    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      // Increment rotation angle smoothly (Left-to-Right rotation)
      setRotationAngle((prev) => (prev + delta * 0.012) % 360);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
    setRotationAngle(startAngleRef.current + deltaX * 0.35);
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
    setRotationAngle(startAngleRef.current + deltaX * 0.35);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 8 Cards arranged around 3D cylinder
  const cards = [
    { id: 'taupe', toolId: 'raw-jpg', type: 'taupe' },
    { id: 'helios', toolId: 'heic-jpg', type: 'helios' },
    { id: 'monica', toolId: 'png-jpg', type: 'monica' },
    { id: 'wedding', toolId: 'raw-png', type: 'wedding' },
    { id: 'loopscale', toolId: 'jpg-webp', type: 'loopscale' },
    { id: 'larsen', toolId: 'webp-png', type: 'larsen' },
    { id: 'akris', toolId: 'png-webp', type: 'akris' },
    { id: 'sands', toolId: 'png-raw', type: 'sands' },
  ];

  const numCards = cards.length;
  const angleStep = 360 / numCards; // 45 degrees
  const radius = 620; // 3D cylinder radius in px

  return (
    <section className="relative w-full overflow-hidden bg-[#faf8f5] pt-24 pb-16 select-none">
      {/* Background Lighting */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-radial from-amber-100/40 via-blue-50/30 to-transparent blur-3xl pointer-events-none" />

      {/* 3D Perspective Viewport */}
      <div
        className="relative w-full h-[470px] sm:h-[520px] my-2 cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
        style={{ perspective: '1300px', perspectiveOrigin: '50% 45%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setIsPaused(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
      >
        {/* True 3D Rotating Cylinder Stage */}
        <div
          className="relative w-[210px] sm:w-[235px] h-[380px] sm:h-[420px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotationAngle}deg)`,
            transition: isDragging ? 'none' : 'transform 0.05s linear',
          }}
        >
          {cards.map((card, idx) => {
            const cardAngle = idx * angleStep;

            return (
              <div
                key={card.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectTool) onSelectTool(card.toolId);
                }}
                className="absolute inset-0 w-full h-full bg-white rounded-[26px] border border-black/[0.08] shadow-2xl shadow-slate-950/10 overflow-hidden flex flex-col justify-between cursor-pointer transition-transform duration-300 hover:scale-[1.04]"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* 1. STUDIO TAUPE */}
                {card.type === 'taupe' && (
                  <div className="h-full flex flex-col justify-between bg-[#f5f2eb] p-3">
                    <h4 className="text-stone-700 font-serif italic text-xs tracking-widest text-center pt-2">
                      Studio Taupe
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 my-auto">
                      <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-20 object-cover rounded-md" />
                      <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-20 object-cover rounded-md" />
                      <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-20 object-cover rounded-md" />
                      <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-20 object-cover rounded-md" />
                    </div>
                  </div>
                )}

                {/* 2. HELIOS */}
                {card.type === 'helios' && (
                  <div className="h-full flex flex-col justify-between bg-[#faf7f2] p-2.5">
                    <div className="h-[120px] bg-amber-300/80 rounded-xl flex items-center justify-center p-2">
                      <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80" alt="" className="h-full w-full object-cover rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-1 my-auto">
                      <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-14 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-14 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-14 object-cover rounded" />
                    </div>
                    <div className="h-[80px] bg-amber-100/50 rounded-xl p-1">
                      <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  </div>
                )}

                {/* 3. MONICA VINADER */}
                {card.type === 'monica' && (
                  <div className="h-full flex flex-col justify-between bg-white p-2.5">
                    <div className="relative h-[110px] rounded-xl overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-bold text-xs tracking-widest uppercase">
                        MONICA VINADER
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 my-1">
                      <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-14 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-14 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-14 object-cover rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-20 object-cover rounded-lg" />
                      <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-20 object-cover rounded-lg" />
                    </div>
                  </div>
                )}

                {/* 4. WEDDING / AISLE */}
                {card.type === 'wedding' && (
                  <div className="h-full flex flex-col justify-between bg-white p-2.5">
                    <div className="h-[100px] rounded-xl overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-3 gap-1 my-1">
                      <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                    </div>
                  </div>
                )}

                {/* 5. G LOOPSCALE (ELECTRIC BLUE) */}
                {card.type === 'loopscale' && (
                  <div className="h-full flex flex-col justify-between bg-[#3545ff] text-white p-3">
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="font-bold text-sm italic">G</span>
                      <span className="font-bold text-sm tracking-tight">loopscale</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 my-auto">
                      <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded-md" />
                      <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded-md" />
                      <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded-md" />
                      <img src="https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded-md" />
                      <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded-md" />
                      <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded-md" />
                    </div>
                  </div>
                )}

                {/* 6. LARSEN SOTELO */}
                {card.type === 'larsen' && (
                  <div className="h-full flex flex-col justify-between bg-black text-white p-2.5">
                    <div className="relative h-[110px] rounded-xl overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover opacity-80" />
                      <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs">
                        Larsen Sotelo
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 my-1">
                      <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-16 object-cover rounded" />
                    </div>
                  </div>
                )}

                {/* 7. A-K-R-I-S- */}
                {card.type === 'akris' && (
                  <div className="h-full flex flex-col justify-between bg-white p-2.5">
                    <div className="relative h-[95px] rounded-xl overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/25 flex items-center justify-center text-white font-black text-xs tracking-widest uppercase">
                        A-K-R-I-S-
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 my-1">
                      <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-16 object-cover rounded" />
                    </div>
                  </div>
                )}

                {/* 8. SANDS OF TIME */}
                {card.type === 'sands' && (
                  <div className="h-full flex flex-col justify-between bg-[#faf7f2] p-2.5">
                    <div className="relative h-[100px] rounded-xl overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-2 gap-1 my-1">
                      <img src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-16 object-cover rounded" />
                      <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-16 object-cover rounded" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Title & Subtitle matching Picflow */}
      <div className="max-w-4xl mx-auto text-center space-y-4 px-4 pt-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#111319] tracking-tight leading-[1.06]">
          Client Galleries for Photographers
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#5d6e82] font-normal leading-relaxed">
          Create branded galleries and impress clients with a simple link. Let them favorite, comment, and download — all without signing up.
        </p>
      </div>
    </section>
  );
};
