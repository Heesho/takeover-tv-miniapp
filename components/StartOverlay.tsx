'use client';

import { useState } from 'react';

interface StartOverlayProps {
  onStart: () => void;
}

export function StartOverlay({ onStart }: StartOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      onStart();
    }, 800);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-700 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated TV static background */}
      <div className="absolute inset-0 tv-static opacity-30" />

      {/* Scanlines effect */}
      <div className="absolute inset-0 scanlines opacity-20" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo/Title with glitch effect */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 glitch-text" data-text="TAKEOVER">
            TAKEOVER
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-2xl md:text-4xl font-bold text-red-500 tracking-[0.5em] animate-pulse">
              TV
            </h2>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Click to start button */}
        <button
          onClick={handleStart}
          className="group relative px-12 py-6 bg-transparent border-4 border-white text-white text-xl md:text-2xl font-bold uppercase tracking-wider overflow-hidden transition-all duration-300 hover:border-red-500 hover:text-red-500"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

          {/* Animated border corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <span className="relative z-10">CLICK TO START</span>
        </button>

        {/* Subtitle */}
        <p className="mt-8 text-gray-400 text-sm md:text-base max-w-md mx-auto">
          The decentralized TV channel where anyone can take control
        </p>
      </div>

      {/* CRT vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-black opacity-50" />
    </div>
  );
}
