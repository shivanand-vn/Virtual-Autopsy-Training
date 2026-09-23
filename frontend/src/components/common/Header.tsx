import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  page?: 'login' | 'register';
}

export const Header: React.FC<HeaderProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/70 backdrop-blur-md border-b border-white/40 shadow-lg shadow-slate-900/5 py-0'
          : 'bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-none py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Official Brand Logo */}
        <Link to="/register" className="flex items-center group transition-transform duration-200 hover:scale-[1.02]">
          <img
            src="/logo.png"
            alt="Virtual Autopsy Global Solutions"
            className="h-12 sm:h-14 w-auto object-contain py-1"
          />
        </Link>
      </div>
    </header>
  );
};
