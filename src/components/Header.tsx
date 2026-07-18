'use client';

import React from 'react';
import { Sparkles, Settings, Terminal, Cpu, Server } from 'lucide-react';
import { EngineType } from './SettingsModal';

interface HeaderProps {
  engine: EngineType;
  onOpenSettings: () => void;
}

export default function Header({ engine, onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/75 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                ResumeAI Analyzer
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                ATS Optimization Tool
              </p>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            {/* Active Engine Badge */}
            
            {/* Heuristics */}
            {engine === 'heuristics' && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition-colors">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Heuristics Engine</span>
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </div>
            )}

            {/* Gemini */}
            {engine === 'gemini' && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition-colors">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gemini AI Engine</span>
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            )}

            {/* Ollama */}
            {engine === 'ollama' && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 transition-colors">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span>Local Ollama</span>
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              </div>
            )}

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">API Config</span>
            </button>
            
          </div>

        </div>
      </div>
    </header>
  );
}
