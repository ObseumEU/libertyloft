import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo-liberty-loft.png';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { key: 'nav.about', href: '#about' },
    { key: 'nav.events', href: '#events' },
    { key: 'nav.join', href: '#join' },
    { key: 'nav.contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-narrow">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <img src={logo} alt="LibertyLoft" className="h-8 md:h-10 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          {/* Language Toggle & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'cs' ? 'en' : 'cs')}
              className="text-xs font-medium px-3 py-1.5 rounded border border-border hover:border-ghost transition-colors"
            >
              {language === 'cs' ? 'EN' : 'CZ'}
            </button>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="container-narrow py-6 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t(item.key)}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
