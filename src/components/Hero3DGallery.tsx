import React, { useState, useEffect } from 'react';

interface CardItem {
  id: string;
  toolId: string;
  title: string;
  headerType: 'dark' | 'white' | 'warm' | 'gradient' | 'minimal';
  headerText: string;
  headerImg?: string;
  gridImgs: string[];
  gridCols: 2 | 3;
}

const initialCards: CardItem[] = [
  {
    id: 'larsen',
    toolId: 'raw-jpg',
    title: 'Larsen Sotelo',
    headerType: 'dark',
    headerText: 'Larsen Sotelo',
    headerImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    gridCols: 2,
    gridImgs: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    ],
  },
  {
    id: 'akris',
    toolId: 'heic-jpg',
    title: 'A-K-R-I-S-',
    headerType: 'white',
    headerText: 'A-K-R-I-S-',
    gridCols: 3,
    gridImgs: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=250&q=80',
    ],
  },
  {
    id: 'sands',
    toolId: 'png-jpg',
    title: 'Sands of Time',
    headerType: 'warm',
    headerText: 'Sands of Time',
    headerImg: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=500&q=80',
    gridCols: 3,
    gridImgs: [
      'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1471922694854-ff24a5691694?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=250&q=80',
    ],
  },
  {
    id: 'dota',
    toolId: 'webp-png',
    title: 'HELLO DOTA',
    headerType: 'gradient',
    headerText: 'HELLO DOTA',
    headerImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
    gridCols: 2,
    gridImgs: [
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=350&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=350&q=80',
      'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=350&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=350&q=80',
    ],
  },
  {
    id: 'agostino',
    toolId: 'jpg-webp',
    title: 'Agostino Cocktails',
    headerType: 'dark',
    headerText: 'Agostino Cocktails',
    headerImg: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=500&q=80',
    gridCols: 3,
    gridImgs: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=250&q=80',
    ],
  },
  {
    id: 'japanese',
    toolId: 'raw-png',
    title: 'Japanese Restaurant',
    headerType: 'dark',
    headerText: 'Japanese Restaurant',
    headerImg: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=500&q=80',
    gridCols: 2,
    gridImgs: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=350&q=80',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=350&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=350&q=80',
      'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=350&q=80',
    ],
  },
  {
    id: 'normal',
    toolId: 'png-raw',
    title: 'NORMAL',
    headerType: 'minimal',
    headerText: 'NORMAL',
    gridCols: 2,
    gridImgs: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
    ],
  },
];

interface Hero3DGalleryProps {
  onSelectTool: (toolId: string) => void;
}

export const Hero3DGallery: React.FC<Hero3DGalleryProps> = ({ onSelectTool }) => {
  const [cards] = useState<CardItem[]>(initialCards);
  const [activeOffset, setActiveOffset] = useState<number>(0);

  // Gentle auto animation sliding cards slowly
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOffset((prev) => (prev + 0.05) % cards.length);
    }, 50);
    return () => clearInterval(timer);
  }, [cards.length]);

  // 3D positioning transform for 7 slots in a wide horizontal arch
  const getSlotTransform = (index: number) => {
    // Relative position centered around 3 (middle card)
    const position = (index - activeOffset + cards.length) % cards.length;
    const centerIndex = 3;
    const offsetFromCenter = position - centerIndex;

    // Angle curve across viewport
    const rotateY = -offsetFromCenter * 10; // e.g. -30deg to +30deg
    const translateZ = -Math.abs(offsetFromCenter) * 45; // Depth drop off
    const scale = 1 - Math.abs(offsetFromCenter) * 0.04;
    const opacity = 1 - Math.abs(offsetFromCenter) * 0.08;

    return {
      transform: `perspective(1400px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity: Math.max(0.6, opacity),
      zIndex: 10 - Math.round(Math.abs(offsetFromCenter)),
    };
  };

  return (
    <section className="relative w-full overflow-hidden pt-24 pb-16 bg-[#fafafa]">
      {/* 3D Panoramic Gallery Arc Container */}
      <div className="relative w-full max-w-[1600px] mx-auto h-[440px] sm:h-[480px] flex items-center justify-center overflow-visible px-2">
        <div className="w-full flex items-center justify-center gap-3 sm:gap-4 md:gap-5 transition-all duration-300">
          {cards.map((card, idx) => {
            const style = getSlotTransform(idx);

            return (
              <div
                key={card.id}
                onClick={() => onSelectTool(card.toolId)}
                style={style}
                className="shrink-0 w-[180px] sm:w-[210px] md:w-[230px] h-[360px] sm:h-[410px] bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/60 overflow-hidden flex flex-col justify-between cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-slate-300 select-none"
              >
                {/* Card Top Banner Header */}
                {card.headerType === 'dark' && (
                  <div className="relative h-[110px] sm:h-[125px] w-full bg-slate-950 overflow-hidden flex items-center justify-center p-3">
                    {card.headerImg && (
                      <img
                        src={card.headerImg}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <h3 className="relative z-10 text-white font-extrabold text-sm sm:text-base tracking-tight text-center drop-shadow-md">
                      {card.headerText}
                    </h3>
                  </div>
                )}

                {card.headerType === 'white' && (
                  <div className="h-[55px] sm:h-[65px] w-full bg-white flex items-center justify-center border-b border-slate-100 px-3">
                    <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-widest uppercase">
                      {card.headerText}
                    </h3>
                  </div>
                )}

                {card.headerType === 'warm' && (
                  <div className="relative h-[110px] sm:h-[125px] w-full bg-[#3a3028] overflow-hidden flex items-center justify-center p-3">
                    {card.headerImg && (
                      <img
                        src={card.headerImg}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-65"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 to-transparent" />
                    <h3 className="relative z-10 text-amber-100 font-bold text-xs sm:text-sm tracking-wide text-center drop-shadow-md font-serif italic">
                      {card.headerText}
                    </h3>
                  </div>
                )}

                {card.headerType === 'gradient' && (
                  <div className="relative h-[100px] sm:h-[115px] w-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 overflow-hidden flex items-center justify-center p-3">
                    {card.headerImg && (
                      <img
                        src={card.headerImg}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                      />
                    )}
                    <h3 className="relative z-10 text-white font-black text-sm sm:text-base tracking-wider uppercase drop-shadow-lg">
                      {card.headerText}
                    </h3>
                  </div>
                )}

                {card.headerType === 'minimal' && (
                  <div className="h-[60px] sm:h-[70px] w-full bg-white flex items-center justify-start px-4 pt-3">
                    <h3 className="text-black font-black text-xl sm:text-2xl tracking-tighter uppercase font-mono">
                      {card.headerText}
                    </h3>
                  </div>
                )}

                {/* Card Interior Image Grid Layout */}
                <div className="flex-1 p-2 sm:p-2.5 flex flex-col justify-center bg-white">
                  <div
                    className={`grid gap-1.5 ${
                      card.gridCols === 3 ? 'grid-cols-3' : 'grid-cols-2'
                    }`}
                  >
                    {card.gridImgs.map((imgUrl, gIdx) => (
                      <div
                        key={gIdx}
                        className="aspect-square rounded-lg overflow-hidden bg-slate-100 shadow-inner"
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Badge */}
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span className="truncate">{card.title}</span>
                  <span className="text-brand-violet font-mono uppercase text-[9px]">
                    {card.toolId.replace('-', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Title & Subtitle exact match to Picflow layout */}
      <div className="max-w-4xl mx-auto text-center space-y-4 px-4 pt-8">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
          Client Galleries for Photographers
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-500 font-normal leading-relaxed">
          Create branded galleries and impress clients with a simple link. Let them favorite, comment, and download — all without signing up.
        </p>
      </div>
    </section>
  );
};
