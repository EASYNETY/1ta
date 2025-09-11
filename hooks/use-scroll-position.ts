// src/hooks/use-scroll-position.ts
'use client';

import { useState, useEffect } from 'react';

export function useScrollPosition(threshold: number = 10) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Initial check in case the page loads already scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]); // Re-run effect if threshold changes

  return isScrolled;
}
