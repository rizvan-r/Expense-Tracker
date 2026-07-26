import React from 'react';

export const IlluminatiLogo = ({ className = "w-6 h-6", glow = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${glow ? 'drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]' : ''}`}>
      <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pyramidGrad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>

          <linearGradient id="eyeGrad" x1="35" y1="50" x2="65" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Radiant Light Rays */}
        <g stroke="url(#eyeGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
          <line x1="50" y1="5" x2="50" y2="0" />
          <line x1="25" y1="15" x2="20" y2="10" />
          <line x1="75" y1="15" x2="80" y2="10" />
          <line x1="10" y1="40" x2="3" y2="38" />
          <line x1="90" y1="40" x2="97" y2="38" />
        </g>

        {/* Illuminati Outer Pyramid Triangle */}
        <polygon
          points="50,12 90,88 10,88"
          fill="url(#pyramidGrad)"
          stroke="#a5b4fc"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Inner Capstone Separation Lines */}
        <line x1="33" y1="44" x2="67" y2="44" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="3 2" />

        {/* Pyramid Brick Texture Details */}
        <line x1="20" y1="70" x2="80" y2="70" stroke="#4338ca" strokeWidth="1.5" opacity="0.6" />
        <line x1="27" y1="57" x2="73" y2="57" stroke="#4338ca" strokeWidth="1.5" opacity="0.6" />
        <line x1="40" y1="70" x2="40" y2="88" stroke="#4338ca" strokeWidth="1" opacity="0.4" />
        <line x1="60" y1="70" x2="60" y2="88" stroke="#4338ca" strokeWidth="1" opacity="0.4" />

        {/* All-Seeing Eye of Providence (Outer Almond shape) */}
        <path
          d="M 32 30 Q 50 18 68 30 Q 50 42 32 30 Z"
          fill="#0f172a"
          stroke="url(#eyeGrad)"
          strokeWidth="2"
        />

        {/* Iris & Pupil */}
        <circle cx="50" cy="30" r="6" fill="url(#eyeGrad)" filter="url(#glowFilter)" />
        <circle cx="50" cy="30" r="2.5" fill="#ffffff" />
        <circle cx="52" cy="28.5" r="0.8" fill="#ffffff" />
      </svg>
    </div>
  );
};
