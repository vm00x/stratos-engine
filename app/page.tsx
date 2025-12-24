'use client';

// --- IMPORTS ---
import React, { useState } from 'react';
import { Zap, Download, PenTool, Globe, Cpu, LayoutTemplate, Layers, ShieldAlert, CheckCircle2, Terminal } from 'lucide-react';


export default function StratOS() {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
 
  // New State for System Notifications
  const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error' | 'security', message: string}>({ type: 'idle', message: 'SYSTEM READY' });
 
  // 1. ANALYSIS ENGINE
  const analyze = async () => {
    if (!url && !notes) {
      setStatus({ type: 'error', message: 'INPUT REQUIRED: Provide Source or Context' });
      return;
    }


    setLoading(true);
    setStatus({ type: 'idle', message: 'INITIALIZING SECURE HANDSHAKE...' });
    setResult(null);


    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, context: notes })
      });
     
      const data = await res.json();
     
      if (!res.ok) {
        // Handle Security Blocks specifically
        if (res.status === 403) {
            throw new Error(`SECURITY PROTOCOL: ${data.error}`);
        }
        throw new Error(data.error || "Generation Failed");
      }
     
      setResult(data);
      setStatus({ type: 'success', message: 'GENERATION COMPLETE' });


    } catch (e: any) {
      // Determine if it was a security event or a generic error
      if (e.message.includes('SECURITY')) {
          setStatus({ type: 'security', message: e.message });
      } else {
          setStatus({ type: 'error', message: `ERROR: ${e.message}` });
      }
    } finally {
      setLoading(false);
    }
  };


  // 2. PRO GRAPHICS ENGINE
  const downloadAsset = () => {
    if (!result) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;


    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;


    const colors: any = {
      'bg-blue-600': '#3b82f6', 'bg-emerald-500': '#10b981',
      'bg-orange-500': '#f97316', 'bg-purple-600': '#a855f7',
      'bg-slate-900': '#64748b', 'bg-rose-500': '#f43f5e'
    };
    const accent = colors[result.brand_color] || '#3b82f6';


    // Layer 1: Base
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);


    // Layer 2: Glows
    const grad1 = ctx.createRadialGradient(W, 0, 0, W, 0, 900);
    grad1.addColorStop(0, accent);
    grad1.addColorStop(1, 'rgba(5, 5, 5, 0)');
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, W, H);


    const grad2 = ctx.createRadialGradient(0, H, 0, 0, H, 1000);
    grad2.addColorStop(0, '#1e293b');
    grad2.addColorStop(1, 'rgba(5, 5, 5, 0)');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1.0;


    // Layer 3: Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }


    // Layer 4: Abstract Geo
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(W - 100, 200, 300, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.globalAlpha = 1.0;


    // Layer 5: Glass Box
    const boxH = 600;
    const gradBox = ctx.createLinearGradient(0, H - boxH, 0, H);
    gradBox.addColorStop(0, 'rgba(20, 20, 25, 0)');
    gradBox.addColorStop(0.3, 'rgba(20, 20, 25, 0.8)');
    gradBox.addColorStop(1, '#000000');
    ctx.fillStyle = gradBox;
    ctx.fillRect(0, H - boxH, W, boxH);


    // Layer 6: Text
    const label = result.stat_label.toUpperCase();
    ctx.font = 'bold 32px Arial, sans-serif';
    const labelWidth = ctx.measureText(label).width;
   
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(80, 140, labelWidth + 60, 80, 40);
    ctx.fill();
   
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, 110, 192);


    const fontSize = result.stats.length > 6 ? 180 : 250;
    ctx.font = `bold ${fontSize}px Inter, Helvetica, sans-serif`;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 40;
    ctx.fillText(result.stats, 80, 500);
    ctx.shadowBlur = 0;


    ctx.fillStyle = '#e4e4e7';
    ctx.font = '500 64px Inter, Helvetica, sans-serif';
   
    const words = result.headline.split(' ');
    let line = '';
    let y = 950;
    const maxWidth = 900;
    const lineHeight = 80;


    words.forEach((word: string) => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, 80, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, 80, y);


    ctx.fillStyle = accent;
    ctx.fillRect(80, y + 60, 120, 8);


    ctx.fillStyle = '#52525b';
    ctx.font = 'bold 30px monospace';
    ctx.fillText("STRATOS INTELLIGENCE // GEN_V3", 80, H - 80);


    const link = document.createElement('a');
    link.download = `stratos_pro_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };


  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white flex flex-col md:flex-row overflow-hidden relative">
     
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[128px] pointer-events-none" />


      {/* SIDEBAR / CONTROLS */}
      <div className="w-full md:w-[480px] bg-zinc-950/80 backdrop-blur-xl border-r border-white/10 p-8 flex flex-col h-screen overflow-y-auto relative z-10">
       
        {/* Header */}
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">S</div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">StratOS <span className="text-zinc-600 font-normal">v3.1</span></h1>
            <p className="text-zinc-500 text-xs tracking-wider font-mono">INTELLIGENCE ENGINE</p>
          </div>
        </div>


        {/* NOTIFICATION CONSOLE */}
        <div className={`mb-8 p-4 rounded-lg border flex items-start gap-3 transition-all duration-300 ${
            status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
            status.type === 'security' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
            status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' :
            'bg-zinc-900 border-white/5 text-zinc-500'
        }`}>
            {status.type === 'security' ? <ShieldAlert size={18} className="shrink-0 animate-pulse" /> :
             status.type === 'error' ? <ShieldAlert size={18} className="shrink-0" /> :
             status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> :
             <Terminal size={18} className="shrink-0" />}
           
            <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                    {status.type === 'security' ? 'SECURITY ALERT' : 'SYSTEM STATUS'}
                </p>
                <p className="text-xs font-mono font-medium">{status.message}</p>
            </div>
        </div>


        {/* Input Form */}
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-2">
              <Globe size={14} className="text-indigo-500"/> TARGET SOURCE
            </label>
            <div className="group relative">
              <input
                className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-700 font-mono"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-2">
              <PenTool size={14} className="text-indigo-500"/> STRATEGIC CONTEXT
            </label>
            <textarea
              className="w-full bg-zinc-900/50 border border-white/10 p-4 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none h-32 resize-none transition-all placeholder:text-zinc-700 leading-relaxed"
              placeholder="Paste press release text, key stats, or specific campaign goals here..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>


          <button
            onClick={analyze}
            disabled={loading}
            className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200 hover:shadow-white/10 hover:scale-[1.01]'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Cpu size={18} className="animate-spin" /> RUNNING PROTOCOLS...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap size={18} className="fill-black" /> EXECUTE STRATEGY
              </span>
            )}
          </button>
        </div>


        {/* Results Panel */}
        {result && (
          <div className="mt-12 pt-10 border-t border-white/10 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-500 tracking-wider">GENERATED COPY</h3>
              <div className="flex gap-2">
                 <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">AI_MODEL: GEMINI</span>
              </div>
            </div>
           
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
              <p className="text-sm text-zinc-300 leading-relaxed font-light">{result.tweet_body}</p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {result.hashtags.split(' ').map((tag: string, i: number) => (
                  <span key={i} className="text-xs text-blue-400">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}
       
        {/* Footer */}
        <div className="mt-auto pt-8 text-zinc-700 text-[10px] flex justify-between">
            <span>STRATOS ENGINE V3.1</span>
            <span>SECURE CONNECTION</span>
        </div>
      </div>


      {/* PREVIEW AREA */}
      <div className="flex-1 bg-black flex items-center justify-center p-10 relative overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}></div>
       
        {/* Radial Fade for Grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>


        {result ? (
          <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700 relative z-10">
            {/* The "Poster" Preview */}
            <div className="relative group">
               {/* Ambient Glow */}
               <div className={`absolute -inset-1 bg-gradient-to-br ${result.brand_color.replace('bg-', 'from-').replace('600', '500').replace('500', '400')} to-zinc-900 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
               
               {/* PRO CARD PREVIEW */}
               <div className="w-[400px] h-[500px] bg-zinc-950 border border-zinc-800 shadow-2xl relative flex flex-col justify-between overflow-hidden rounded-lg">
                 
                  {/* Internal Glows */}
                  <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-bl ${result.brand_color.replace('bg-', 'from-').replace('600', '500')} to-transparent opacity-10 pointer-events-none`}></div>
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>


                  {/* Top Section */}
                  <div className="relative z-10 p-8">
                    <span className={`inline-block px-4 py-2 rounded-full ${result.brand_color} text-white text-xs font-bold shadow-lg`}>
                       {result.stat_label.toUpperCase()}
                    </span>
                  </div>
                 
                  {/* Middle Section (Big Stat) */}
                  <div className="relative z-10 px-8 flex-1 flex items-center">
                    <h2 className="text-7xl font-bold tracking-tighter text-white leading-none drop-shadow-2xl">
                      {result.stats}
                    </h2>
                  </div>
                 
                  {/* Bottom Section */}
                  <div className="relative z-10 p-8 bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-2xl font-medium leading-tight text-zinc-200">
                      {result.headline}
                    </h3>
                    <div className={`h-1 w-12 ${result.brand_color} mt-4`}></div>
                  </div>
               </div>
            </div>


            <button
              onClick={downloadAsset}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs tracking-widest uppercase font-bold border border-white/10 px-6 py-3 rounded-full hover:bg-white/5 hover:border-white/20"
            >
              <Download size={14} /> Download Pro Asset
            </button>
          </div>
        ) : (
          <div className="text-zinc-800 flex flex-col items-center gap-6 animate-pulse">
            <Layers size={64} strokeWidth={0.5} />
            <p className="tracking-[0.2em] text-xs font-bold">SYSTEM READY</p>
          </div>
        )}
      </div>
    </div>
  );
}