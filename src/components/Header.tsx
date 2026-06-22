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
    <span className="inline-flex items-center gap-2.5 text-white">
      <span className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg shadow-brand-violet/15">
        <img
          src={logoUrl}
          alt=""
          className="absolute left-1/2 top-0 h-auto w-[3.85rem] max-w-none -translate-x-1/2"
          aria-hidden="true"
        />
      </span>
      <span className="text-lg font-bold tracking-tight">Pixavo</span>
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
          ? 'border-b border-zinc-800/80 bg-zinc-950/80 shadow-lg shadow-black/10 backdrop-blur-xl'
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

        <div className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <a
              key={item.sectionId}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === item.sectionId
                  ? 'bg-white/5 text-white'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
              }`}
              aria-current={activeSection === item.sectionId ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#converter"
            className="hidden rounded-xl bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-violet/20 transition-all hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-brand-violet/30 sm:inline-flex"
          >
            Convert Images
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/70 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
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
          <div className="mx-auto max-w-7xl space-y-1 border-t border-zinc-800/70 px-4 py-4 sm:px-6">
            {navigationItems.map((item) => (
              <a
                key={item.sectionId}
                href={item.href}
                onClick={closeMenu}
                className={`block rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  activeSection === item.sectionId
                    ? 'bg-brand-violet/10 text-brand-violet'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#converter"
              onClick={closeMenu}
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-brand-violet px-4 py-3 text-sm font-semibold text-white sm:hidden"
            >
              Convert Images
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
