'use client';

import React, { useState } from 'react';
import { LayoutTemplate, Zap, Download, PenTool, Globe } from 'lucide-react';

export default function StratOS() {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
 
  // 1. ANALYSIS ENGINE
  const analyze = async () => {
    if (!url && !notes) return alert("Please provide a URL or Context Notes.");
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url, context: notes })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      alert("Analysis error. Try adding more context notes.");
    } finally {
      setLoading(false);
    }
  };

  // 2. CANVAS GENERATOR (High-Fidelity)
  const downloadAsset = () => {
    if (!result) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set Professional Resolution
    canvas.width = 1080;
    canvas.height = 1350;

    // Background
    ctx.fillStyle = '#09090b'; // Zinc-950
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic Accent Logic
    const colors: any = {
      'bg-blue-600': '#2563eb', 'bg-emerald-500': '#10b981',
      'bg-orange-500': '#f97316', 'bg-purple-600': '#9333ea',
      'bg-slate-900': '#1e293b', 'bg-rose-500': '#f43f5e'
    };
    const accent = colors[result.brand_color] || '#2563eb';

    // Design Elements
    ctx.strokeStyle = '#27272a'; // Zinc-800
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 980, 1250); // Frame

    // Typography
    ctx.fillStyle = accent;
    ctx.font = 'bold 40px Courier New';
    ctx.fillText(result.stat_label.toUpperCase(), 100, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px Helvetica';
    ctx.fillText(result.stats, 100, 320);

    ctx.fillStyle = '#e4e4e7'; // Zinc-200
    ctx.font = 'bold 70px Arial';
   
    // Text Wrapping
    const words = result.headline.split(' ');
    let line = '';
    let y = 600;
    words.forEach((word: string) => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 800) {
        ctx.fillText(line, 100, y);
        line = word + ' ';
        y += 90;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, 100, y);

    // Export
    const link = document.createElement('a');
    link.download = 'stratos-asset.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-white selection:text-black flex flex-col md:flex-row">
     
      {/* SIDEBAR / CONTROLS */}
      <div className="w-full md:w-[450px] bg-zinc-900 border-r border-zinc-800 p-8 flex flex-col h-screen overflow-y-auto">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-black font-bold text-xl">S</div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">StratOS</h1>
            <p className="text-zinc-500 text-xs tracking-wider">COMMUNICATIONS ENGINE</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-2 block flex items-center gap-2">
              <Globe size={12}/> SOURCE URL
            </label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded text-sm focus:border-white outline-none transition-colors"
              placeholder="https://company.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-2 block flex items-center gap-2">
              <PenTool size={12}/> CONTEXT / NOTES
            </label>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded text-sm focus:border-white outline-none h-32 resize-none transition-colors"
              placeholder="Paste press release text, key stats, or campaign goals here..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading}
            className="w-full bg-white text-black font-bold h-14 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-pulse">PROCESSING...</span> : <><Zap size={18}/> GENERATE STRATEGY</>}
          </button>
        </div>

        {result && (
          <div className="mt-10 pt-10 border-t border-zinc-800 animate-fade-in">
            <h3 className="text-xs font-bold text-zinc-500 mb-4">GENERATED COPY</h3>
            <div className="bg-zinc-950 p-4 rounded border border-zinc-800 mb-4">
              <p className="text-sm text-zinc-300 leading-relaxed">{result.tweet_body}</p>
              <p className="text-blue-400 text-sm mt-2">{result.hashtags}</p>
            </div>
            <div className="flex gap-2">
               <span className="text-xs border border-zinc-800 px-2 py-1 rounded text-zinc-500">Tone: Professional</span>
               <span className="text-xs border border-zinc-800 px-2 py-1 rounded text-zinc-500">Source: Real-time</span>
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW AREA */}
      <div className="flex-1 bg-zinc-950 flex items-center justify-center p-10 relative">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
       
        {result ? (
          <div className="flex flex-col items-center gap-6 animate-up">
            <div className="w-[400px] h-[500px] bg-zinc-900 border border-zinc-800 shadow-2xl relative p-8 flex flex-col justify-between group">
               {/* PREVIEW OF CANVAS */}
               <div className={`absolute top-0 right-0 w-64 h-64 ${result.brand_color} opacity-20 blur-[80px]`}></div>
               <div className="relative z-10">
                 <p className={`font-mono text-xs font-bold ${result.brand_color.replace('bg-', 'text-')} mb-2`}>{result.stat_label.toUpperCase()}</p>
                 <h2 className="text-5xl font-bold tracking-tighter">{result.stats}</h2>
               </div>
               <div className="relative z-10">
                 <h3 className="text-3xl font-bold leading-tight">{result.headline}</h3>
                 <div className={`h-1 w-20 ${result.brand_color} mt-6`}></div>
               </div>
            </div>

            <button
              onClick={downloadAsset}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <Download size={16} /> DOWNLOAD HIGH-RES ASSET
            </button>
          </div>
        ) : (
          <div className="text-zinc-600 flex flex-col items-center gap-4">
            <LayoutTemplate size={48} strokeWidth={1} />
            <p>Ready to Analyze</p>
          </div>
        )}
      </div>
    </div>
  );
}