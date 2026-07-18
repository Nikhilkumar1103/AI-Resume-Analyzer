'use client';

import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Brain, 
  Briefcase, 
  BookOpen, 
  Cpu, 
  Terminal,
  Server,
  ArrowRight,
  Download,
  RefreshCw
} from 'lucide-react';
import { AnalysisResult } from '@/lib/parser';
import CircularProgressBar from './CircularProgressBar';

interface DashboardProps {
  result: AnalysisResult;
  isAI: boolean;
  engineUsed?: string;
  fileName: string;
  fileSize: number;
  onReset: () => void;
}

export default function Dashboard({ result, isAI, engineUsed = 'heuristics', fileName, fileSize, onReset }: DashboardProps) {
  const { score, strengths, weaknesses, missingSkills, suggestedRoles, suggestions } = result;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Report Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Report</span>
            {engineUsed === 'gemini' && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border bg-emerald-50 border-emerald-100 text-emerald-700">
                <Cpu className="w-3 h-3" />
                Gemini AI Generated
              </span>
            )}
            {engineUsed === 'ollama' && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border bg-indigo-50 border-indigo-100 text-indigo-700">
                <Server className="w-3 h-3" />
                Local Ollama AI
              </span>
            )}
            {engineUsed === 'heuristics' && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border bg-blue-50 border-blue-100 text-blue-700">
                <Terminal className="w-3 h-3" />
                Heuristic Calculation
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-800 truncate max-w-md" title={fileName}>
            {fileName}
          </h2>
          <p className="text-xs text-slate-400">
            Size: {formatFileSize(fileSize)} &bull; Analyzed just now
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Print Report
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-colors active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Upload New
          </button>
        </div>
      </div>

      {/* Main Grid: Score, Strengths, Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">ATS Score</h3>
          <CircularProgressBar score={score} />
          <p className="mt-4 text-xs text-slate-500 max-w-[200px] leading-relaxed">
            This score reflects parsing compatibility, formatting alignment, and skill density for tech roles.
          </p>
        </div>

        {/* Strengths Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Strengths</h3>
          </div>
          <ul className="space-y-3.5 flex-1">
            {strengths.map((strength, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm text-slate-600 leading-normal">
                <span className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Weaknesses</h3>
          </div>
          <ul className="space-y-3.5 flex-1">
            {weaknesses.map((weakness, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm text-slate-600 leading-normal">
                <span className="h-5 w-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  !
                </span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Grid: AI Suggestions & Core Skills/Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Suggestions (2/3 size) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">AI Suggestions</h3>
          </div>
          
          <ul className="space-y-4">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="group flex gap-3.5 items-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {suggestion}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Roles & Missing Skills (1/3 size) */}
        <div className="space-y-6">
          
          {/* Missing Skills Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Missing Skills</h3>
            </div>
            
            <p className="text-xs text-slate-400">
              Incorporate these high-demand keywords based on your profile to pass ATS filters:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {missingSkills.map((skill, i) => (
                <span 
                  key={i} 
                  className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Roles Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Suggested Roles</h3>
            </div>
            
            <p className="text-xs text-slate-400">
              Roles matching your expertise and keyword matches:
            </p>

            <div className="space-y-2 pt-1">
              {suggestedRoles.map((role, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/20 hover:border-blue-100 transition-all group cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                    {role}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
