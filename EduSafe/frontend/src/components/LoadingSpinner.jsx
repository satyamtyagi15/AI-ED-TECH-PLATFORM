// src/components/LoadingSpinner.jsx
import React, { useEffect, useState } from 'react';

const LoadingSpinner = ({ 
  size = 'large',   // Changed default to 'large'
  text = 'Loading...',
  minDisplayTime = 2000  // Minimum milliseconds to display (optional)
}) => {
  const [shouldRender, setShouldRender] = useState(true);

  // If minDisplayTime is provided, ensure the spinner doesn't disappear too soon
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true); // No effect, just to demonstrate; actual hiding is parent-controlled
      // To use this feature, parent should pass a `onMinimumTimeReached` callback
    }, minDisplayTime);
    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  // Size mapping – now 'large' is the default, but we also scale up further
  const containerSizes = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-64 h-64'   // Increased from w-48 h-48
  };

  const ringSizes = {
    small: 'w-20 h-20',
    medium: 'w-28 h-28',
    large: 'w-56 h-56'
  };

  const coreSizes = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-28 h-28'
  };

  const getContainerSize = () => containerSizes[size] || containerSizes.large;
  const getRingSize = () => ringSizes[size] || ringSizes.large;
  const getCoreSize = () => coreSizes[size] || coreSizes.large;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in-up">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      {/* Omnitrix Container with extra scaling for larger appearance */}
      <div className={`relative ${getContainerSize()} animate-float-slow transform scale-150`}>
        {/* Outer Glow Ring */}
        <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 opacity-50 blur-xl animate-pulse-slow"></div>
        
        {/* Main Outer Ring - Rotating (slower) */}
        <div className={`absolute inset-0 rounded-full border-8 border-cyan-500/50 shadow-neon-cyan animate-spin-slow`}></div>
        
        {/* Second Ring - Counter Rotating (slower) */}
        <div className={`absolute inset-0 rounded-full border-8 border-purple-500/50 shadow-neon-purple animate-spin-reverse`}></div>
        
        {/* Inner Ring - Pulsing */}
        <div className={`absolute inset-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-4 border-cyan-400/30 animate-pulse-soft`}></div>
        
        {/* Omnitrix Core */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`${getCoreSize()} rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-neon-cyan animate-pulse-soft`}>
            {/* Omnitrix symbol */}
            <svg className="w-2/3 h-2/3 text-white animate-pulse" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50,10 L70,30 L70,70 L50,90 L30,70 L30,30 Z" stroke="white" strokeWidth="4" fill="none">
                <animate attributeName="stroke-dasharray" values="0 400;400 0" dur="3s" repeatCount="indefinite" />
              </path>
              <circle cx="50" cy="50" r="12" fill="white">
                <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
              </circle>
              <line x1="50" y1="30" x2="50" y2="50" stroke="white" strokeWidth="4">
                <animate attributeName="y2" values="50;70;50" dur="2.5s" repeatCount="indefinite" />
              </line>
              <line x1="50" y1="70" x2="50" y2="50" stroke="white" strokeWidth="4">
                <animate attributeName="y2" values="50;30;50" dur="2.5s" repeatCount="indefinite" />
              </line>
            </svg>
          </div>
        </div>
      </div>

      {/* Loading Text with Neon Glow - larger font */}
      {text && (
        <div className="mt-12 text-center">
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse-soft neon-text">
            {text}
          </p>
          <p className="text-base text-cyan-300/70 mt-3 animate-pulse">⚡ Initializing Safety Protocols ⚡</p>
        </div>
      )}

      {/* Note: To increase display duration, set loading state to true for longer in parent component */}
    </div>
  );
};

export default LoadingSpinner;