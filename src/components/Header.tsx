import { useEffect, useState } from 'react';
import { Menu, X, ArrowLeft, Grid } from 'lucide-react';
import logoUrl from '../assets/logo.png';
import { conversionTools } from '../utils/conversionTools';

interface HeaderProps {
  currentPage?: 'home' | 'converter';
  activeToolId?: string;
  onNavigateHome?: () => void;
  onNavigateTool?: (toolId: string) => void;
}

interface NavigationItem {
  label: string;
  href: string;
  sectionId: string;
}

const navigationItems: NavigationItem[] = [
  { label: 'Tools', href: '#select-tools', sectionId: 'select-tools' },
  { label: 'Features', href: '#features', sectionId: 'features' },
  { label: 'Supported Formats', href: '#supported-formats', sectionId: 'supported-formats' },
  { label: 'Why Pixavo', href: '#why-pixavo', sectionId: 'why-pixavo' },
  { label: 'FAQ', href: '#faq', sectionId: 'faq' },
  { label: 'Blog', href: '#blog', sectionId: 'blog' },
  { label: 'Contact', href: '#contact', sectionId: 'contact' },
];

export function PixavoLogo({ onClick }: { onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-2.5 text-slate-900 cursor-pointer group"
    >
      <span className="relative h-10 w-10 overflow-hidden rounded-xl group-hover:scale-105 transition-transform duration-200">
        <img
          src={logoUrl}
          alt="Pixavo"
          className="absolute left-1/2 top-0 h-auto w-[3.85rem] max-w-none -translate-x-1/2"
        />
      </span>
      <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
        Pixavo
      </span>
    </span>
  );
}

export function Header({ currentPage = 'home', onNavigateHome, onNavigateTool }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (currentPage !== 'home') return;
    const sections = navigationItems
      .map((item) => document.getElementById(item.sectionId))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) setActiveSection(visibleSection.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [currentPage]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const handleNavClick = (sectionId: string) => {
    closeMenu();
    if (currentPage !== 'home') {
      if (onNavigateHome) onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? 'border-b border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-xl'
          : 'border-b border-transparent bg-white/50 backdrop-blur-md'
      }`}
    >
      <nav
        className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-6">
          <PixavoLogo onClick={() => { closeMenu(); if (onNavigateHome) onNavigateHome(); }} />

          {currentPage === 'converter' && (
            <button
              onClick={() => { closeMenu(); if (onNavigateHome) onNavigateHome(); }}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/80 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Tools</span>
            </button>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex ml-auto">
          {navigationItems.map((item) => (
            <a
              key={item.sectionId}
              href={currentPage === 'home' ? item.href : '#home'}
              onClick={(e) => {
                if (currentPage !== 'home') {
                  e.preventDefault();
                  handleNavClick(item.sectionId);
                }
              }}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                activeSection === item.sectionId && currentPage === 'home'
                  ? 'bg-brand-violet/10 text-brand-violet shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {item.label}
            </a>
          ))}

          {currentPage === 'home' ? (
            <a
              href="#select-tools"
              className="ml-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-violet to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-violet/20 hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Select Tool</span>
            </a>
          ) : (
            <button
              onClick={() => { if (onNavigateHome) onNavigateHome(); }}
              className="ml-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All 10 Tools</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          {currentPage === 'converter' && (
            <button
              type="button"
              onClick={() => { closeMenu(); if (onNavigateHome) onNavigateHome(); }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile navigation drawer */}
      <div
        id="mobile-navigation"
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 lg:hidden ${
          isMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="mx-auto max-w-7xl space-y-1 border-t border-slate-100 px-4 py-4 sm:px-6 bg-slate-50/90 backdrop-blur-lg">
            {currentPage === 'converter' && (
              <button
                onClick={() => { closeMenu(); if (onNavigateHome) onNavigateHome(); }}
                className="w-full text-left font-bold text-brand-violet rounded-xl px-3 py-3 text-sm bg-brand-violet/10 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to All Image Tools</span>
              </button>
            )}

            {navigationItems.map((item) => (
              <a
                key={item.sectionId}
                href={currentPage === 'home' ? item.href : '#home'}
                onClick={(e) => {
                  if (currentPage !== 'home') {
                    e.preventDefault();
                    handleNavClick(item.sectionId);
                  } else {
                    closeMenu();
                  }
                }}
                className={`block rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  activeSection === item.sectionId && currentPage === 'home'
                    ? 'bg-brand-violet/10 text-brand-violet'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Conversion Tools</span>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {conversionTools.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      closeMenu();
                      if (onNavigateTool) onNavigateTool(t.id);
                    }}
                    className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-violet"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
