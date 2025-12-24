'use client';

import React, { useState } from 'react';
import { 
  Zap, Download, Globe, Cpu, LayoutTemplate, 
  Target, Rocket, BarChart3, 
  Megaphone, AlertTriangle, CheckCircle2, ShieldCheck,
  Edit3, Monitor, FileText
} from 'lucide-react';

export default function StratOS() {
  // --- STATE ---
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('Product Launch');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>({ type: 'idle', msg: 'Ready' });
  
  // Design State
  const [visualStyle, setVisualStyle] = useState<'dark' | 'light'>('dark');

  // The "Result" is now editable state
  const [data, setData] = useState<any>(null);

  const strategies = [
    { id: 'Product Launch', icon: Rocket, desc: 'New feature debut' },
    { id: 'Growth', icon: BarChart3, desc: 'User acquisition' },
    { id: 'Brand Identity', icon: Target, desc: 'Core values' },
    { id: 'Community', icon: Megaphone, desc: 'Engagement' },
  ];

  // --- ANALYSIS ENGINE ---
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
      
      const json = await res.json();
      
      if (!res.ok) {
        if (res.status === 403) throw new Error("Security Block: Restricted URL");
        throw new Error(json.error || "Generation Failed");
      }
      
      // Set initial data, allowing user to edit it later
      setData(json);
      setStatus({ type: 'success', msg: 'Strategy Generated' });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  // --- CANVAS ENGINE (Themable) ---
  const downloadAsset = () => {
    if (!data) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // Palette Mapping
    const accentMap: any = {
      'bg-blue-600': '#2563eb', 'bg-emerald-500': '#10b981',
      'bg-orange-500': '#f97316', 'bg-purple-600': '#9333ea',
      'bg-zinc-100': visualStyle === 'light' ? '#18181b' : '#f4f4f5', 
      'bg-rose-500': '#f43f5e'
    };
    const accent = accentMap[data.brand_color] || '#2563eb';

    // Theme Variables
    const bg = visualStyle === 'dark' ? '#09090b' : '#ffffff';
    const textPrimary = visualStyle === 'dark' ? '#ffffff' : '#000000';
    const textSecondary = visualStyle === 'dark' ? '#a1a1aa' : '#52525b';
    const boxBg = visualStyle === 'dark' ? '#000000' : '#f4f4f5';
    const boxBorder = visualStyle === 'dark' ? '#27272a' : '#e4e4e7';

    // 1. Background
    ctx.fillStyle = bg; 
    ctx.fillRect(0, 0, W, H);

    // 2. Gradients
    const grad = ctx.createRadialGradient(W, 0, 0, W, 0, 1000);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = visualStyle === 'dark' ? 0.15 : 0.05;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1.0;

    // 3. Grid Texture
    ctx.strokeStyle = visualStyle === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 2;
    for(let i=0; i<W; i+=80) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
    for(let i=0; i<H; i+=80) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

    // 4. Content Container
    ctx.fillStyle = boxBg;
    ctx.fillRect(60, 60, W-120, H-120);
    ctx.strokeStyle = boxBorder;
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, W-120, H-120);

    // 5. Typography
    // Pill
    ctx.fillStyle = accent;
    ctx.beginPath();
    // basic rect fallback for broad compatibility
    ctx.rect(120, 140, 400, 60); 
    ctx.fill();
    
    ctx.fillStyle = visualStyle === 'dark' ? '#000000' : '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText(data.stat_label.toUpperCase(), 150, 182);

    // Big Stat
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 180px Inter, sans-serif';
    ctx.fillText(data.stats, 110, 450);

    // Headline
    ctx.fillStyle = textSecondary;
    ctx.font = '500 70px Inter, sans-serif';
    
    const words = data.headline.split(' ');
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
    ctx.fillStyle = textSecondary;
    ctx.font = '40px monospace';
    ctx.fillText("STRATOS // ENGINE v4.2", 120, H - 120);

    // Export
    const link = document.createElement('a');
    link.download = `stratos_${visualStyle}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans flex flex-col lg:flex-row overflow-hidden">
      
      {/* LEFT PANEL: INPUTS & CONTROLS */}
      <div className="w-full lg:w-[500px] border-r border-zinc-800 bg-[#0a0a0a] flex flex-col h-screen relative z-10">
        
        {/* Header */}
        <div className="p-8 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold">S</div>
            <h1 className="font-bold text-lg tracking-tight">StratOS <span className="text-zinc-600 font-mono text-xs ml-2">v4.2 PRO</span></h1>
          </div>
          <p className="text-xs text-zinc-500">Automated Communications Intelligence</p>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* 1. Objective */}
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

          {/* 2. Intelligence */}
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

      {/* RIGHT PANEL: EDITOR WORKSPACE */}
      <div className="flex-1 bg-[#050505] relative flex items-center justify-center p-8 overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}></div>

        {data ? (
          <div className="w-full max-w-5xl h-full flex flex-col lg:flex-row gap-8 items-start animate-in fade-in zoom-in-95 duration-500 relative z-10 overflow-y-auto">
            
            {/* COLUMN 1: VISUAL ASSET (Live Preview) */}
            <div className="flex-1 w-full lg:sticky lg:top-0">
               <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-xs font-bold text-zinc-500 tracking-wider">VISUAL ASSET</h3>
                  <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button 
                      onClick={() => setVisualStyle('dark')}
                      className={`p-2 rounded ${visualStyle === 'dark' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                    ><Monitor size={14}/></button>
                    <button 
                      onClick={() => setVisualStyle('light')}
                      className={`p-2 rounded ${visualStyle === 'light' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-white'}`}
                    ><FileText size={14}/></button>
                  </div>
               </div>

               <div className="relative group cursor-pointer" onClick={downloadAsset}>
                  <div className={`absolute -inset-1 bg-gradient-to-tr ${data.brand_color.replace('bg-', 'from-').replace('600', '500').replace('500', '400')} to-zinc-900 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-700`}></div>
                  
                  {/* Dynamic HTML Preview matching Canvas Logic */}
                  <div className={`w-full aspect-[4/5] ${visualStyle === 'dark' ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'} border rounded-xl relative p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-colors duration-500`}>
                      <div className={`absolute top-[-50%] right-[-50%] w-full h-full bg-radial ${data.brand_color.replace('bg-', 'from-').replace('600', '500')} to-transparent ${visualStyle === 'dark' ? 'opacity-20' : 'opacity-10'} blur-3xl pointer-events-none`}></div>
                      
                      <div className="relative z-10">
                        <span className={`inline-flex px-3 py-1 rounded-full ${data.brand_color} ${data.brand_color === 'bg-zinc-100' ? 'text-black' : 'text-white'} text-[10px] font-bold tracking-widest`}>
                          {data.stat_label.toUpperCase()}
                        </span>
                        <h2 className={`text-6xl font-bold ${visualStyle === 'dark' ? 'text-white' : 'text-black'} mt-6 tracking-tighter leading-none`}>{data.stats}</h2>
                      </div>

                      <div className={`relative z-10 border-t ${visualStyle === 'dark' ? 'border-zinc-800' : 'border-zinc-200'} pt-6`}>
                        <h3 className={`text-2xl font-medium ${visualStyle === 'dark' ? 'text-zinc-300' : 'text-zinc-700'} leading-tight`}>{data.headline}</h3>
                      </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button className="text-xs font-bold text-zinc-500 hover:text-white flex items-center justify-center gap-2 w-full transition-colors">
                        <Download size={12} /> DOWNLOAD PNG
                    </button>
                  </div>
               </div>
            </div>

            {/* COLUMN 2: EDITABLE COPY */}
            <div className="flex-1 w-full space-y-6">
               <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl relative group">
                  <Edit3 size={14} className="absolute top-4 right-4 text-zinc-600 opacity-50 group-hover:opacity-100" />
                  <h3 className="text-xs font-bold text-zinc-500 tracking-wider mb-2">HEADLINE (EDITABLE)</h3>
                  <input 
                    value={data.headline}
                    onChange={(e) => setData({...data, headline: e.target.value})}
                    className="w-full bg-transparent text-xl font-medium text-white outline-none border-b border-transparent focus:border-zinc-700 pb-2 transition-colors placeholder:text-zinc-700"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                    <h3 className="text-[10px] font-bold text-zinc-500 tracking-wider mb-2 uppercase">Metric</h3>
                    <input 
                      value={data.stats}
                      onChange={(e) => setData({...data, stats: e.target.value})}
                      className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                    />
                 </div>
                 <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                    <h3 className="text-[10px] font-bold text-zinc-500 tracking-wider mb-2 uppercase">Label</h3>
                    <input 
                      value={data.stat_label}
                      onChange={(e) => setData({...data, stat_label: e.target.value})}
                      className="w-full bg-transparent text-sm font-mono text-zinc-400 outline-none"
                    />
                 </div>
               </div>

               <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                  <h3 className="text-xs font-bold text-zinc-500 tracking-wider mb-4">SOCIAL MESSAGE</h3>
                  <textarea 
                    value={data.tweet_body}
                    onChange={(e) => setData({...data, tweet_body: e.target.value})}
                    className="w-full bg-transparent text-zinc-300 leading-relaxed text-sm outline-none resize-none h-32 border-b border-transparent focus:border-zinc-700"
                  />
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-2 flex-wrap">
                    {data.hashtags.split(' ').map((tag: string, i: number) => (
                      <span key={i} className="text-xs border border-zinc-700 px-3 py-1.5 rounded-full text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors cursor-pointer">
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