import React from 'react';

interface Hero3DGalleryProps {
  onSelectTool?: (toolId: string) => void;
}

export const Hero3DGallery: React.FC<Hero3DGalleryProps> = ({ onSelectTool }) => {
  return (
    <section className="relative w-full overflow-hidden bg-white pt-24 pb-16">
      {/* 3D Perspective Panoramic Cards Arch */}
      <div className="relative w-full max-w-[1440px] mx-auto h-[440px] sm:h-[490px] flex items-center justify-center overflow-hidden px-4">
        <div
          className="relative w-full flex items-center justify-center gap-3 sm:gap-4 md:gap-5"
          style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        >
          {/* Card 1: Larsen Sotelo (Far Left) */}
          <div
            onClick={() => onSelectTool && onSelectTool('raw-jpg')}
            className="w-[180px] sm:w-[210px] md:w-[225px] h-[360px] sm:h-[410px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-300/40 overflow-hidden flex flex-col justify-between shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-slate-400/50"
            style={{
              transform: 'rotateY(24deg) translateZ(-50px) scale(0.92)',
              transformOrigin: 'right center',
            }}
          >
            <div className="relative h-[120px] w-full bg-black overflow-hidden flex items-center justify-center p-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
                alt="Larsen Sotelo"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <h3 className="relative z-10 text-white font-bold text-base tracking-tight text-center drop-shadow-md">
                Larsen Sotelo
              </h3>
            </div>
            <div className="flex-1 p-2 bg-white flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-1.5">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[65px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[65px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[65px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[65px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[65px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[65px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Card 2: A-K-R-I-S- (Left) */}
          <div
            onClick={() => onSelectTool && onSelectTool('heic-jpg')}
            className="w-[180px] sm:w-[210px] md:w-[225px] h-[360px] sm:h-[410px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-300/40 overflow-hidden flex flex-col justify-between shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-slate-400/50"
            style={{
              transform: 'rotateY(15deg) translateZ(-20px) scale(0.96)',
              transformOrigin: 'right center',
            }}
          >
            <div className="h-[60px] w-full bg-white flex items-center justify-center border-b border-slate-100 px-2">
              <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-[0.25em] uppercase">
                A-K-R-I-S-
              </h3>
            </div>
            <div className="flex-1 p-2 bg-white flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-1">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[85px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[85px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[85px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[85px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[85px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[85px] object-cover rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Sands of Time (Inner Left) */}
          <div
            onClick={() => onSelectTool && onSelectTool('png-jpg')}
            className="w-[180px] sm:w-[210px] md:w-[225px] h-[360px] sm:h-[410px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-300/40 overflow-hidden flex flex-col justify-between shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-slate-400/50"
            style={{
              transform: 'rotateY(7deg) translateZ(0px) scale(0.99)',
              transformOrigin: 'right center',
            }}
          >
            <div className="relative h-[110px] w-full bg-[#4a3e35] overflow-hidden flex items-center justify-center p-3">
              <img
                src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=500&q=80"
                alt="Sands of Time"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/70 to-transparent" />
              <h3 className="relative z-10 text-amber-100 font-serif italic text-sm sm:text-base tracking-wide text-center drop-shadow-md">
                Sands of Time
              </h3>
            </div>
            <div className="flex-1 p-2 bg-white flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-1">
                <img
                  src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1471922694854-ff24a5691694?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Card 4: HELLO DOTA (Center) */}
          <div
            onClick={() => onSelectTool && onSelectTool('webp-png')}
            className="w-[180px] sm:w-[210px] md:w-[225px] h-[360px] sm:h-[410px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-blue-500/20 overflow-hidden flex flex-col justify-between shrink-0 z-20 cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              transform: 'rotateY(0deg) translateZ(35px) scale(1.03)',
            }}
          >
            <div className="relative h-[95px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden flex items-center justify-center p-3">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80"
                alt="HELLO DOTA"
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
              />
              <h3 className="relative z-10 text-white font-black text-sm sm:text-base tracking-wider uppercase drop-shadow-md">
                HELLO DOTA
              </h3>
            </div>
            <div className="flex-1 p-2 bg-white flex flex-col gap-1.5 justify-center">
              <img
                src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=350&q=80"
                alt=""
                className="w-full h-[115px] object-cover rounded-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=350&q=80"
                alt=""
                className="w-full h-[115px] object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Card 5: Agostino Cocktails (Inner Right) */}
          <div
            onClick={() => onSelectTool && onSelectTool('jpg-webp')}
            className="w-[180px] sm:w-[210px] md:w-[225px] h-[360px] sm:h-[410px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-300/40 overflow-hidden flex flex-col justify-between shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-slate-400/50"
            style={{
              transform: 'rotateY(-7deg) translateZ(0px) scale(0.99)',
              transformOrigin: 'left center',
            }}
          >
            <div className="relative h-[110px] w-full bg-slate-900 overflow-hidden flex items-center justify-center p-3">
              <img
                src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=500&q=80"
                alt="Agostino Cocktails"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <h3 className="relative z-10 text-white font-serif italic text-xs sm:text-sm tracking-wide text-center drop-shadow-md">
                Agostino Cocktails
              </h3>
            </div>
            <div className="flex-1 p-2 bg-white flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-1">
                <img
                  src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=200&q=80"
                  alt=""
                  className="w-full h-[75px] object-cover rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Japanese Restaurant (Right) */}
          <div
            onClick={() => onSelectTool && onSelectTool('raw-png')}
            className="w-[180px] sm:w-[210px] md:w-[225px] h-[360px] sm:h-[410px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-300/40 overflow-hidden flex flex-col justify-between shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-slate-400/50"
            style={{
              transform: 'rotateY(-15deg) translateZ(-20px) scale(0.96)',
              transformOrigin: 'left center',
            }}
          >
            <div className="relative h-[110px] w-full bg-stone-900 overflow-hidden flex items-center justify-center p-3">
              <img
                src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=500&q=80"
                alt="Japanese Restaurant"
                className="absolute inset-0 w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <h3 className="relative z-10 text-white font-medium text-xs sm:text-sm tracking-widest uppercase text-center drop-shadow-md">
                Japanese Restaurant
              </h3>
            </div>
            <div className="flex-1 p-2 bg-white flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-1.5">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[105px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[105px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[105px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[105px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Card 7: NORMAL (Far Right) */}
          <div
            onClick={() => onSelectTool && onSelectTool('png-raw')}
            className="w-[180px] sm:w-[210px] md:w-[225px] h-[360px] sm:h-[410px] bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-300/40 overflow-hidden flex flex-col justify-between shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-slate-400/50"
            style={{
              transform: 'rotateY(-24deg) translateZ(-50px) scale(0.92)',
              transformOrigin: 'left center',
            }}
          >
            <div className="h-[60px] w-full bg-white flex items-center justify-start px-4 pt-2 border-b border-slate-100">
              <h3 className="text-slate-950 font-black text-2xl tracking-tighter uppercase font-mono">
                NORMAL
              </h3>
            </div>
            <div className="flex-1 p-2 bg-white flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-1.5">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[70px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[70px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[70px] object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=250&q=80"
                  alt=""
                  className="w-full h-[70px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Title & Subtitle identical to Picflow layout */}
      <div className="max-w-4xl mx-auto text-center space-y-4 px-4 pt-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08]">
          Client Galleries for Photographers
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-500 font-normal leading-relaxed">
          Create branded galleries and impress clients with a simple link. Let them favorite, comment, and download — all without signing up.
        </p>
      </div>
    </section>
  );
};
