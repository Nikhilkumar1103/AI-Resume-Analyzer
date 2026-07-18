'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  Terminal, 
  Cpu, 
  Layers,
  CheckCircle2, 
  Server
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: () => void;
}

export type EngineType = 'heuristics' | 'gemini' | 'ollama';

export default function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const [engine, setEngine] = useState<EngineType>('ollama');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2:3b');

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEngine = localStorage.getItem('resume_analyzer_engine') as EngineType || 'ollama';
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      const savedHost = localStorage.getItem('ollama_host') || 'http://localhost:11434';
      const savedModel = localStorage.getItem('ollama_model') || 'llama3.2:3b';

      setEngine(savedEngine);
      setApiKey(savedKey);
      setOllamaHost(savedHost);
      setOllamaModel(savedModel);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resume_analyzer_engine', engine);
      localStorage.setItem('gemini_api_key', apiKey.trim());
      localStorage.setItem('ollama_host', ollamaHost.trim());
      localStorage.setItem('ollama_model', ollamaModel.trim());

      setIsSaved(true);
      onSettingsChange();
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Engine Configuration</h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-6">
          
          {/* Engine Selector Radio Cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Choose Analysis Engine
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Heuristics Option */}
              <div 
                onClick={() => setEngine('heuristics')}
                className={`flex flex-col p-3.5 border rounded-xl cursor-pointer transition-all ${
                  engine === 'heuristics'
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`p-1 rounded-lg ${engine === 'heuristics' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Terminal className="w-4 h-4" />
                  </span>
                  <input 
                    type="radio" 
                    checked={engine === 'heuristics'} 
                    onChange={() => setEngine('heuristics')} 
                    className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800">Heuristics</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">Instant offline matches</span>
              </div>

              {/* Gemini Option */}
              <div 
                onClick={() => setEngine('gemini')}
                className={`flex flex-col p-3.5 border rounded-xl cursor-pointer transition-all ${
                  engine === 'gemini'
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`p-1 rounded-lg ${engine === 'gemini' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Cpu className="w-4 h-4" />
                  </span>
                  <input 
                    type="radio" 
                    checked={engine === 'gemini'} 
                    onChange={() => setEngine('gemini')} 
                    className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800">Gemini AI</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">Advanced cloud engine</span>
              </div>

              {/* Ollama Option */}
              <div 
                onClick={() => setEngine('ollama')}
                className={`flex flex-col p-3.5 border rounded-xl cursor-pointer transition-all ${
                  engine === 'ollama'
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`p-1 rounded-lg ${engine === 'ollama' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Server className="w-4 h-4" />
                  </span>
                  <input 
                    type="radio" 
                    checked={engine === 'ollama'} 
                    onChange={() => setEngine('ollama')} 
                    className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800">Local Ollama</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">Private local LLM</span>
              </div>

            </div>
          </div>

          {/* Heuristics Details */}
          {engine === 'heuristics' && (
            <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4 space-y-2">
              <div className="flex gap-2 text-blue-700">
                <Terminal className="w-4 h-4 shrink-0 mt-0.5" />
                <h4 className="text-sm font-semibold">Offline Base Heuristics Active</h4>
              </div>
              <p className="text-xs text-blue-800/80 leading-relaxed">
                No external servers are contacted. Your resume text is parsed directly using local matching regex patterns and computed scores. Great for speed and absolute privacy.
              </p>
            </div>
          )}

          {/* Gemini AI Details & Fields */}
          {engine === 'gemini' && (
            <div className="space-y-4 animate-slideDown">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-normal">
                  Requires a Gemini API Key. Your key is stored locally in your browser and is only sent directly to Google Gemini endpoints.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter API Key (AIzaSy...)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ollama Details & Fields */}
          {engine === 'ollama' && (
            <div className="space-y-4 animate-slideDown">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-start gap-2.5">
                <Server className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-normal">
                  Requires **Ollama** running locally on your computer. Make sure you have started Ollama and pulled the selected model (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">ollama run llama3.2:3b</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Ollama Host Endpoint
                  </label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434"
                    value={ollamaHost}
                    onChange={(e) => setOllamaHost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Model Name
                  </label>
                  <input
                    type="text"
                    placeholder="llama3.2:3b, gemma, mistral"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white py-2.5 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaved}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 active:bg-blue-800 disabled:bg-green-600 transition-colors"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
