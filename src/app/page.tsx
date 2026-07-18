'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import UploadZone from '@/components/UploadZone';
import Dashboard from '@/components/Dashboard';
import SettingsModal, { EngineType } from '@/components/SettingsModal';
import { AnalysisResult } from '@/lib/parser';
import { Sparkles, BrainCircuit, AlertCircle } from 'lucide-react';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAI, setIsAI] = useState(false);
  const [engineUsed, setEngineUsed] = useState<string>('heuristics');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Track currently configured engine (defaults to ollama local engine)
  const [engine, setEngine] = useState<EngineType>('ollama');
  
  // Progress steps for premium loading experience
  const [progressStep, setProgressStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadingSteps = [
    'Uploading document securely...',
    'Extracting raw resume text...',
    'Analyzing structure and formatting...',
    'Running ATS pattern matching...',
    'Generating actionable AI suggestions...',
    'Finalizing optimization report...'
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEngine = localStorage.getItem('resume_analyzer_engine') as EngineType || 'ollama';
      setEngine(savedEngine);
    }
  }, []);

  const handleSettingsChange = () => {
    if (typeof window !== 'undefined') {
      const savedEngine = localStorage.getItem('resume_analyzer_engine') as EngineType || 'ollama';
      setEngine(savedEngine);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setProgressStep(0);
      interval = setInterval(() => {
        setProgressStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorMsg(null);
    setFileName(file.name);
    setFileSize(file.size);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('engine', engine);
    
    // Add client-side settings dynamically
    if (engine === 'gemini') {
      const savedKey = localStorage.getItem('gemini_api_key');
      if (savedKey) {
        formData.append('apiKey', savedKey);
      }
    } else if (engine === 'ollama') {
      const savedHost = localStorage.getItem('ollama_host') || 'http://localhost:11434';
      const savedModel = localStorage.getItem('ollama_model') || 'llama3.2:3b';
      formData.append('ollamaHost', savedHost);
      formData.append('ollamaModel', savedModel);
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to analyze resume.');
      }

      // Add a slight delay at the end of progress steps to make it feel natural
      setTimeout(() => {
        setAnalysisResult(result.data);
        setIsAI(result.isAI);
        setEngineUsed(result.engineUsed || 'heuristics');
        setIsAnalyzing(false);
      }, 800);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during resume analysis. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMsg(null);
    setFileName('');
    setFileSize(0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-100">
      
      {/* Navigation Header */}
      <Header 
        engine={engine} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
        
        {/* Upload & Instructions Area (If no results and not analyzing) */}
        {!isAnalyzing && !analysisResult && (
          <div className="w-full flex flex-col items-center text-center space-y-8 mt-4 md:mt-8">
            
            {/* Tagline */}
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1 text-xs font-bold text-blue-700">
                <BrainCircuit className="w-3.5 h-3.5" />
                ATS Checker
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Optimize Your Resume for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ATS Systems</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                Upload your resume to get instant AI-powered recommendations, structural checks, missing skill identification, and scoring.
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="w-full max-w-2xl flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="text-left font-medium">
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="text-xs text-red-600/90 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <UploadZone 
              onAnalyze={handleAnalyze} 
              isAnalyzing={isAnalyzing} 
            />

            {/* Features Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8 border-t border-slate-200/60 mt-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="text-blue-600 font-bold mb-1 text-lg">95%+</div>
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Accuracy</div>
                <div className="text-[11px] text-slate-400 text-center">Precise keyword matching matching real ATS algorithms</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="text-blue-600 font-bold mb-1 text-lg">Instant</div>
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Fast Parsing</div>
                <div className="text-[11px] text-slate-400 text-center">Text extraction completes in under a few seconds</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="text-blue-600 font-bold mb-1 text-lg">Private</div>
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Local Settings</div>
                <div className="text-[11px] text-slate-400 text-center">Your files and keys are parsed locally and securely</div>
              </div>
            </div>

          </div>
        )}

        {/* Loading Spinner Area (If analyzing) */}
        {isAnalyzing && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center py-20 space-y-6">
            
            {/* Spinning Circle */}
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            {/* Step Message */}
            <div className="space-y-1.5 animate-pulse">
              <h3 className="text-lg font-bold text-slate-800">Analyzing Resume...</h3>
              <p className="text-sm font-semibold text-blue-600">
                {loadingSteps[progressStep]}
              </p>
            </div>

            {/* Spinner Progress bar indicator */}
            <div className="w-64 bg-slate-200 rounded-full h-1.5 dark:bg-slate-700 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${((progressStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>

          </div>
        )}

        {/* Dashboard Results (If analysis done) */}
        {analysisResult && !isAnalyzing && (
          <Dashboard 
            result={analysisResult} 
            isAI={isAI} 
            engineUsed={engineUsed}
            fileName={fileName} 
            fileSize={fileSize} 
            onReset={handleReset} 
          />
        )}

      </main>

      {/* Settings Modal Component */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSettingsChange={handleSettingsChange} 
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} ResumeAI Analyzer. Powered by Next.js and local LLMs.
          </p>
          <div className="flex gap-4 text-xs font-semibold text-slate-400">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer" onClick={() => setIsSettingsOpen(true)}>API Settings</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
