'use client';

import { useState } from 'react';
import { FileArchive, Terminal, Monitor } from 'lucide-react';
import WebCompressor from '@/components/WebCompressor';
import PythonCliView from '@/components/PythonCliView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'web' | 'cli'>('cli');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FileArchive className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">High-Fidelity Compressor</h1>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('cli')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'cli' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Python CLI
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'web' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Web Tool
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {activeTab === 'cli' ? <PythonCliView /> : <WebCompressor />}
      </main>
    </div>
  );
}
