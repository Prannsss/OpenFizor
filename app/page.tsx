'use client';

import { useState } from 'react';
import { FileArchive, Terminal, Monitor, Github } from 'lucide-react';
import WebCompressor from '@/components/WebCompressor';
import PythonCliView from '@/components/PythonCliView';

import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'web' | 'cli'>('cli');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-cyan-900/50 relative">
      
      {/* Background Base */}
      <div className="fixed inset-0 bg-[#0a0a0a] pointer-events-none" />
      
      {/* Orthogonal Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Soft Glow Behind Main Content */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/25 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 pt-6 pb-2">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between border border-gray-800/60 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-full shadow-[0_0_15px_-3px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              <img src="/favicon.ico" alt="Logo" className="w-6 h-6 rounded-full object-cover" />
              OpenFizor
            </h1>
          </div>
          
          {/* Tabs - Pill Shaped */}
          <div className="flex items-center bg-[#111318]/80 backdrop-blur-md p-1 rounded-full border border-gray-800/50">
            <button
              onClick={() => setActiveTab('cli')}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'cli' 
                  ? 'bg-[#1a1d24] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1d24]/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Python CLI
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'web' 
                  ? 'bg-[#1a1d24] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1d24]/50'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Web Tool
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 justify-end w-[150px]">
             <a 
               href="https://github.com/Prannsss/OpenFizor" 
               target="_blank"
               rel="noopener noreferrer"
               className="text-xs text-gray-400 border border-gray-800 px-3 py-1.5 rounded-full hover:text-white hover:border-gray-600 transition-colors flex items-center gap-2 bg-[#111318]"
             >
               <Github className="w-3.5 h-3.5" />
               Star on GitHub
             </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10 min-h-[800px]">
        {/* Soft Fade Wrapper */}
        <div key={activeTab} className="animate-in fade-in duration-700 ease-out fill-mode-forwards">
          {activeTab === 'cli' ? <PythonCliView /> : <WebCompressor />}
        </div>
      </main>
    </div>
  );
}
