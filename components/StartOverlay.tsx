'use client';

import { useState } from 'react';

interface StartOverlayProps {
  onStart: () => void;
}

export function StartOverlay({ onStart }: StartOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPoweringOn, setIsPoweringOn] = useState(false);

  const handleStart = () => {
    setIsPoweringOn(true);

    // Start TV power-on sequence
    setTimeout(() => {
      setIsExiting(true);
    }, 1500);

    // Complete transition
    setTimeout(() => {
      onStart();
    }, 2300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-700 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* TV power-on flash effect */}
      {isPoweringOn && (
        <div className="absolute inset-0 tv-power-on" />
      )}

      {/* Animated TV static background */}
      <div className={`absolute inset-0 tv-static transition-opacity duration-300 ${isPoweringOn ? 'opacity-100' : 'opacity-30'}`} />

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

        {/* Power button (TV remote style) */}
        <button
          onClick={handleStart}
          className="group relative mx-auto"
        >
          {/* Power button */}
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 flex items-center justify-center transition-all duration-200 group-hover:border-red-500 group-hover:shadow-xl group-hover:shadow-red-500/40 group-active:scale-95 group-active:bg-gray-950">
            {/* Power icon */}
            <svg
              className="w-12 h-12 md:w-14 md:h-14 text-gray-400 group-hover:text-red-500 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 6v6m0 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
              />
            </svg>
          </div>

          {/* Button label */}
          <div className="mt-6 text-gray-400 text-sm uppercase tracking-widest group-hover:text-red-500 transition-colors duration-200">
            Press to Power On
          </div>
        </button>

        {/* Subtitle */}
        <p className="mt-8 text-gray-400 text-sm md:text-base max-w-md mx-auto">
          Community Controlled Television
        </p>
      </div>

      {/* CRT vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-black opacity-50" />
    </div>
  );
}
