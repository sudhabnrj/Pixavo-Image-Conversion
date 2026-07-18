import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import logoUrl from '../assets/logo.png';

interface NavigationItem {
  label: string;
  href: string;
  sectionId: string;
}

const navigationItems: NavigationItem[] = [
  { label: 'Features', href: '#features', sectionId: 'features' },
  { label: 'Supported Formats', href: '#supported-formats', sectionId: 'supported-formats' },
  { label: 'Why Pixavo', href: '#why-pixavo', sectionId: 'why-pixavo' },
  { label: 'FAQ', href: '#faq', sectionId: 'faq' },
  { label: 'Blog', href: '#blog', sectionId: 'blog' },
  { label: 'Contact', href: '#contact', sectionId: 'contact' },
];

export function PixavoLogo() {
  return (
    <span className="inline-flex items-center gap-2.5 text-slate-900">
      <span className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg shadow-brand-violet/10">
        <img
          src={logoUrl}
          alt=""
          className="absolute left-1/2 top-0 h-auto w-[3.85rem] max-w-none -translate-x-1/2"
          aria-hidden="true"
        />
      </span>
      <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">Pixavo</span>
    </span>
  );
}

export function Header() {
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
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? 'border-b border-slate-200/60 bg-white/85 shadow-sm backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <a href="#converter" onClick={closeMenu} aria-label="Pixavo home">
          <PixavoLogo />
        </a>

        <div className="hidden items-center gap-1 lg:flex ml-auto">
          {navigationItems.map((item) => (
            <a
              key={item.sectionId}
              href={item.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                activeSection === item.sectionId
                  ? 'bg-brand-violet/10 text-brand-violet shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              aria-current={activeSection === item.sectionId ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden shadow-sm"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 lg:hidden ${
          isMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="mx-auto max-w-7xl space-y-1 border-t border-slate-100 px-4 py-4 sm:px-6 bg-slate-50/50">
            {navigationItems.map((item) => (
              <a
                key={item.sectionId}
                href={item.href}
                onClick={closeMenu}
                className={`block rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  activeSection === item.sectionId
                    ? 'bg-brand-violet/10 text-brand-violet'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}
            {/* CTA button removed */}
          </div>
        </div>
      </div>
    </header>
  );
}
