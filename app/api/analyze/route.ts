import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// --- 1. SECURITY LAYERS ---
function isValidUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) { return false; }
}

function isSafeUrl(string: string) {
  try {
    const url = new URL(string);
    const hostname = url.hostname.toLowerCase();
    // Block Localhost and Cloud Metadata IPs (SSRF Protection)
    const forbidden = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254', 'vercel.app'];
    if (forbidden.includes(hostname)) return false;
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) return false;
    return true;
  } catch (_) { return false; }
}

export async function POST(req: Request) {
  try {
    // Check API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Server Configuration Error: Missing API Key" }, { status: 500 });

    const body = await req.json();
    const { url, context, mode } = body;

    console.log(`▶️ Processing: ${url ? 'URL Mode' : 'Context Mode'} | Strategy: ${mode}`);

    // --- 2. DATA INGESTION ---
    let sourceMaterial = "";
    if (url) {
      if (!isValidUrl(url)) return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      if (!isSafeUrl(url)) return NextResponse.json({ error: "Security Alert: Restricted URL" }, { status: 403 });

      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 6000); // 6s Timeout
        
        const response = await fetch(url, { 
          headers: { 'User-Agent': 'StratOS-Enterprise/4.0' }, 
          signal: controller.signal 
        });
        
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          $('script, style, nav, footer, header, svg, iframe').remove();
          sourceMaterial += `WEBSITE LIVE DATA: ${$('body').text().replace(/\s+/g, ' ').slice(0, 3500)} \n\n`;
        }
      } catch (e) {
        sourceMaterial += `URL: ${url} (Connection blocked or timed out) \n\n`;
      }
    }
    
    if (context) sourceMaterial += `STRATEGIC CONTEXT: ${context.slice(0, 2000)}`;
    if (!sourceMaterial.trim()) return NextResponse.json({ error: "Input required: Please provide a URL or Notes." }, { status: 400 });

    // --- 3. MODEL AUTO-DISCOVERY ---
    // We ask Google which model is available to avoid 404 errors
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!modelsRes.ok) throw new Error("AI Service Unavailable");
    const modelsData = await modelsRes.json();
    const viableModel = modelsData.models?.find((m: any) => m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent'));
    if (!viableModel) throw new Error("No AI capacity available");

    // --- 4. STRATEGIC GENERATION ---
    const strategyPrompt = `
      Act as a Senior Brand Strategist.
      CAMPAIGN OBJECTIVE: ${mode || 'General Awareness'}
      SOURCE DATA: "${sourceMaterial}"
      
      Generate a JSON object containing:
      1. "headline": Short, high-impact poster headline (max 7 words).
      2. "tweet_body": A professional LinkedIn/X post (max 280 chars).
      3. "stats": A key metric (e.g. "99.9% Uptime"). If missing, infer a realistic one.
      4. "stat_label": Label for the stat.
      5. "hashtags": 3 strategic tags space separated.
      6. "brand_color": A Tailwind class based on the vibe (options: 'bg-blue-600', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-600', 'bg-zinc-100', 'bg-rose-500').

      Return ONLY raw JSON.
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${viableModel.name}:generateContent?key=${apiKey}`;
    const aiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: strategyPrompt }] }] })
    });

    if (!aiRes.ok) throw new Error("AI Processing Failed");
    const aiData = await aiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Server Error:", error.message);
    return NextResponse.json({ error: "Strategy generation failed." }, { status: 500 });
  }
}