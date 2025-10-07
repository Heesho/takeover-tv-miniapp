'use client';

interface StartOverlayProps {
  onStart: () => void;
}

export function StartOverlay({ onStart }: StartOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-around h-full p-4 text-center">
      <div></div>

      <div>
        <div className="mb-10 inline-block">
          <h1 className="text-6xl glitch-text" data-text="TAKE0VER">
            TAKE0VER
          </h1>
          <h1 className="text-8xl flex justify-between w-full">
            <span className="glitch-text" data-text="•">•</span>
            <span className="glitch-text" data-text="TV">TV</span>
            <span className="glitch-text" data-text="•">•</span>
          </h1>
        </div>

        <button
          onClick={onStart}
          className="w-20 h-20 rounded-full border-4 border-gray-700 flex items-center justify-center text-retro-pink hover:bg-retro-pink hover:text-black transition-all duration-300 mx-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
            />
          </svg>
        </button>
        <p className="mt-8 text-lg">PRESS TO POWER ON</p>
      </div>

      <p className="text-sm text-gray-400">Community Controlled Television</p>
    </div>
  );
}
