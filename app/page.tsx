'use client';

import React, { useState } from 'react';
import { 
  Zap, Download, Globe, Cpu, LayoutTemplate, 
  Target, Rocket, ShieldCheck, BarChart3, 
  Megaphone, AlertTriangle, CheckCircle2 
} from 'lucide-react';

export default function StratOS() {
  // State
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('Product Launch'); // Default Use Case
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<any>({ type: 'idle', msg: 'Ready' });

  // Use Cases Configuration
  const strategies = [
    { id: 'Product Launch', icon: Rocket, desc: 'New feature or token debut' },
    { id: 'Growth', icon: BarChart3, desc: 'User acquisition & metrics' },
    { id: 'Brand Identity', icon: Target, desc: 'Core values & mission' },
    { id: 'Community', icon: Megaphone, desc: 'Engagement & updates' },
  ];

  // Logic
  const analyze = async () => {
    if (!url && !notes) {
      setStatus({ type: 'error', msg: 'Source Required' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'loading', msg: 'Negotiating Secure Handshake...' });

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, context: notes, mode })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 403) throw new Error("Security Block: Restricted URL");
        throw new Error(data.error || "Generation Failed");
      }
      
      setResult(data);
      setStatus({ type: 'success', msg: 'Strategy Generated' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  // High-End Canvas Renderer
  const downloadAsset = () => {
    if (!result) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // Palette
    const accentMap: any = {
      'bg-blue-600': '#2563eb', 'bg-emerald-500': '#10b981',
      'bg-orange-500': '#f97316', 'bg-purple-600': '#9333ea',
      'bg-zinc-100': '#f4f4f5', 'bg-rose-500': '#f43f5e'
    };
    const accent = accentMap[result.brand_color] || '#2563eb';
    const isLightAccent = result.brand_color === 'bg-zinc-100';

    // 1. Background
    ctx.fillStyle = '#09090b'; 
    ctx.fillRect(0, 0, W, H);

    // 2. Mesh Gradients
    const grad = ctx.createRadialGradient(W, 0, 0, W, 0, 1000);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1.0;

    // 3. Grid Texture
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    for(let i=0; i<W; i+=80) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
    for(let i=0; i<H; i+=80) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

    // 4. Content Container
    ctx.fillStyle = '#000000';
    ctx.fillRect(60, 60, W-120, H-120);
    ctx.strokeStyle = '#27272a';
    ctx.strokeRect(60, 60, W-120, H-120);

    // 5. Typography
    // Label Pill
    ctx.fillStyle = accent;
    ctx.beginPath();
    // roundRect fallback logic
    if (ctx.roundRect) {
      ctx.roundRect(120, 140, 400, 60, 30);
    } else {
      ctx.rect(120, 140, 400, 60);
    }
    ctx.fill();
    
    ctx.fillStyle = isLightAccent ? '#000000' : '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText(result.stat_label.toUpperCase(), 150, 182);

    // Big Stat
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 180px Inter, sans-serif';
    ctx.fillText(result.stats, 110, 450);

    // Headline
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '500 70px Inter, sans-serif';
    
    const words = result.headline.split(' ');
    let line = '';
    let y = 800;
    words.forEach((w: string) => {
      if (ctx.measureText(line + w).width > 800) {
        ctx.fillText(line, 120, y);
        line = w + ' ';
        y += 90;
      } else line += w + ' ';
    });
    ctx.fillText(line, 120, y);

    // Footer
    ctx.fillStyle = '#52525b';
    ctx.font = '40px monospace';
    ctx.fillText("STRATOS // ENGINE v4.0", 120, H - 120);

    // Export
    const link = document.createElement('a');
    link.download = `stratos_${mode}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans flex flex-col lg:flex-row overflow-hidden">
      
      {/* LEFT PANEL: CONTROLS */}
      <div className="w-full lg:w-[500px] border-r border-zinc-800 bg-[#0a0a0a] flex flex-col h-screen relative z-10">
        
        {/* Header */}
        <div className="p-8 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold">S</div>
            <h1 className="font-bold text-lg tracking-tight">StratOS <span className="text-zinc-600 font-mono text-xs ml-2">v4.0 ENTERPRISE</span></h1>
          </div>
          <p className="text-xs text-zinc-500">Automated Communications Intelligence</p>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Section 1: Use Case */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">1. Campaign Objective</label>
            <div className="grid grid-cols-2 gap-2">
              {strategies.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setMode(s.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    mode === s.id 
                      ? 'bg-zinc-100 text-black border-zinc-100 shadow-lg' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon size={14} />
                    <span className="text-xs font-bold">{s.id}</span>
                  </div>
                  <p className="text-[10px] opacity-70 leading-tight">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Data Source */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">2. Intelligence Source</label>
            <div className="space-y-4">
              <div className="relative group">
                <Globe className="absolute top-3.5 left-3 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
                <input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
              
              <div className="relative group">
                <LayoutTemplate className="absolute top-3.5 left-3 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context: KPIs, target audience, or raw data points..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-700 h-32 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={analyze}
            disabled={loading}
            className="w-full bg-white text-black font-bold h-12 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Cpu size={18} className="animate-spin"/> : <Zap size={18} />}
            {loading ? 'ANALYZING...' : 'GENERATE ASSETS'}
          </button>

        </div>

        {/* Status Bar */}
        <div className={`p-4 border-t border-zinc-800 text-xs font-mono flex items-center gap-3 ${
          status.type === 'error' ? 'text-red-400 bg-red-950/30' : 
          status.type === 'success' ? 'text-emerald-400 bg-emerald-950/30' : 'text-zinc-500'
        }`}>
          {status.type === 'error' ? <AlertTriangle size={14}/> : 
           status.type === 'success' ? <CheckCircle2 size={14}/> : 
           <ShieldCheck size={14}/>}
          <span>STATUS: {status.msg}</span>
        </div>
      </div>

      {/* RIGHT PANEL: WORKSPACE */}
      <div className="flex-1 bg-[#050505] relative flex items-center justify-center p-8 overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}></div>

        {result ? (
          <div className="flex flex-col lg:flex-row gap-12 items-center w-full max-w-5xl animate-in fade-in zoom-in-95 duration-500 relative z-10">
            
            {/* 1. Visual Asset Preview */}
            <div className="relative group cursor-pointer" onClick={downloadAsset}>
               <div className={`absolute -inset-1 bg-gradient-to-tr ${result.brand_color.replace('bg-', 'from-').replace('600', '500').replace('500', '400')} to-zinc-900 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-700`}></div>
               
               <div className="w-[360px] h-[450px] bg-black border border-zinc-800 rounded-xl relative p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
                  {/* Mesh Gradient */}
                  <div className={`absolute top-[-50%] right-[-50%] w-full h-full bg-radial ${result.brand_color.replace('bg-', 'from-').replace('600', '500')} to-transparent opacity-20 blur-3xl pointer-events-none`}></div>
                  
                  <div className="relative z-10">
                    <span className={`inline-flex px-3 py-1 rounded-full ${result.brand_color} ${result.brand_color === 'bg-zinc-100' ? 'text-black' : 'text-white'} text-[10px] font-bold tracking-widest`}>
                      {result.stat_label.toUpperCase()}
                    </span>
                    <h2 className="text-6xl font-bold text-white mt-6 tracking-tighter">{result.stats}</h2>
                  </div>

                  <div className="relative z-10 border-t border-zinc-800 pt-6">
                    <h3 className="text-xl font-medium text-zinc-300 leading-tight">{result.headline}</h3>
                  </div>
               </div>
               
               <div className="mt-4 text-center">
                 <button className="text-xs font-bold text-zinc-500 hover:text-white flex items-center justify-center gap-2 w-full transition-colors">
                    <Download size={12} /> DOWNLOAD HIGH-RES PNG
                 </button>
               </div>
            </div>

            {/* 2. Strategy Copy */}
            <div className="flex-1 space-y-6">
               <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-bold text-zinc-500 tracking-wider">PRIMARY MESSAGE</h3>
                     <span className="text-[10px] px-2 py-1 bg-zinc-800 rounded text-zinc-400 font-mono">264 chars</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed text-sm whitespace-pre-wrap">{result.tweet_body}</p>
               </div>

               <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                  <h3 className="text-xs font-bold text-zinc-500 tracking-wider mb-4">STRATEGIC TAGS</h3>
                  <div className="flex gap-2 flex-wrap">
                    {result.hashtags.split(' ').map((tag: string, i: number) => (
                      <span key={i} className="text-xs border border-zinc-700 px-3 py-1.5 rounded-full text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>
               </div>
            </div>

          </div>
        ) : (
          <div className="text-center space-y-4 opacity-30 select-none">
            <LayoutTemplate size={80} strokeWidth={0.5} className="mx-auto" />
            <p className="text-2xl font-light tracking-tight">STRATOS WORKSPACE</p>
            <p className="text-xs font-mono">WAITING FOR INTELLIGENCE SOURCE</p>
          </div>
        )}

      </div>
    </div>
  );
}