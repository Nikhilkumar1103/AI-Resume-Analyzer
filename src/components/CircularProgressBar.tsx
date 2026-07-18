'use client';

import React, { useState, useEffect } from 'react';

interface CircularProgressBarProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgressBar({ score, size = 180, strokeWidth = 14 }: CircularProgressBarProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    // Smooth transition from 0 to target score
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine score color scheme and text labels
  let strokeColorClass = 'stroke-blue-600';
  let bgColorClass = 'bg-blue-50';
  let textColorClass = 'text-blue-700';
  let tierLabel = 'Needs Work';
  let tierDesc = 'Action required';

  if (score >= 90) {
    strokeColorClass = 'stroke-indigo-600';
    bgColorClass = 'bg-indigo-50';
    textColorClass = 'text-indigo-700';
    tierLabel = 'Excellent';
    tierDesc = 'Ready to apply';
  } else if (score >= 75) {
    strokeColorClass = 'stroke-blue-600';
    bgColorClass = 'bg-blue-50';
    textColorClass = 'text-blue-700';
    tierLabel = 'Good';
    tierDesc = 'Highly competitive';
  } else if (score >= 60) {
    strokeColorClass = 'stroke-sky-500';
    bgColorClass = 'bg-sky-50';
    textColorClass = 'text-sky-700';
    tierLabel = 'Fair';
    tierDesc = 'Minor gaps found';
  } else {
    strokeColorClass = 'stroke-slate-500';
    bgColorClass = 'bg-slate-50';
    textColorClass = 'text-slate-700';
    tierLabel = 'Needs Work';
    tierDesc = 'Critical gaps found';
  }

  return (
    <div className="flex flex-col items-center justify-center select-none">
      
      {/* Circle Container */}
      <div className="relative" style={{ width: size, height: size }}>
        
        {/* Background Track Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Active Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${strokeColorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-slate-800">
            {animatedScore}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Out of 100
          </span>
        </div>

      </div>

      {/* Tier Label */}
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${bgColorClass} ${textColorClass}`}>
          {tierLabel}
        </span>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          {tierDesc}
        </p>
      </div>

    </div>
  );
}
