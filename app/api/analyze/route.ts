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

    // --- 2. DATA INGESTION (DEEP SCRAPER) ---
    let sourceMaterial = "";
    
    if (url) {
      if (!isValidUrl(url)) return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      if (!isSafeUrl(url)) return NextResponse.json({ error: "Security Alert: Restricted URL" }, { status: 403 });

      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000); // Increased timeout for heavier sites
        
        // Advanced Headers to mimic a real Chrome browser (bypasses basic blocks)
        const response = await fetch(url, { 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          }, 
          signal: controller.signal 
        });
        
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          
          // A. Clean noise
          $('script, style, nav, footer, header, svg, iframe, noscript, .cookie-banner, .ads').remove();

          // B. Extract Meta Data (Critical for Social/News Links)
          const metaTitle = $('meta[property="og:title"]').attr('content') || $('title').text();
          const metaDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
          const metaSite = $('meta[property="og:site_name"]').attr('content');
          
          // C. Smart Content Targeting
          // Look for 'article' or 'main' tags first. If not found, use body.
          let mainContent = $('article').text() || $('main').text() || $('#content').text() || $('.post-content').text();
          
          // Fallback if specific tags are empty (common in some React apps)
          if (mainContent.length < 200) {
             mainContent = $('body').text();
          }

          // D. Format the Source Material
          sourceMaterial += `--- METADATA ---\nTitle: ${metaTitle}\nDescription: ${metaDesc}\nSite: ${metaSite}\n\n`;
          sourceMaterial += `--- MAIN CONTENT ---\n${mainContent.replace(/\s+/g, ' ').slice(0, 4500)}`; // Increased token limit
          
        } else {
          sourceMaterial += `URL: ${url} (Access Denied: ${response.status}). Using Context Only. \n\n`;
        }
      } catch (e) {
        sourceMaterial += `URL: ${url} (Network/Timeout Error). Using Context Only. \n\n`;
      }
    }
    
    if (context) sourceMaterial += `\n\n--- STRATEGIC NOTES ---\n${context.slice(0, 2000)}`;
    
    // Fail if we have absolutely nothing
    if (!sourceMaterial.trim() || sourceMaterial.length < 50) {
        return NextResponse.json({ error: "Input required: Could not read URL data. Please paste text into 'Notes'." }, { status: 400 });
    }

    // --- 3. MODEL AUTO-DISCOVERY ---
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!modelsRes.ok) throw new Error("AI Service Unavailable");
    const modelsData = await modelsRes.json();
    const viableModel = modelsData.models?.find((m: any) => m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent'));
    if (!viableModel) throw new Error("No AI capacity available");

    // --- 4. STRATEGIC GENERATION ---
    const strategyPrompt = `
      Act as a Senior Brand Strategist.
      
      CAMPAIGN OBJECTIVE: ${mode || 'General Awareness'}
      
      SOURCE DATA:
      ${sourceMaterial}
      
      INSTRUCTIONS:
      1. Analyze the METADATA first—this often contains the core news or summary.
      2. If this is a News Article/Blog: Extract the specific announcement or event.
      3. If this is a Project Home: Extract the Unique Value Proposition (UVP).
      
      OUTPUT FORMAT (JSON Only):
      {
        "headline": "Short, punchy poster headline (max 7 words). Focus on the 'New' or 'Value'.",
        "tweet_body": "Professional LinkedIn/X post (max 280 chars). Use data/facts from the text.",
        "stats": "A key metric found in text (e.g., '$5M Funding', 'v2.0 Live'). If none, infer a strong summary label like 'Major Update'.",
        "stat_label": "Label for the stat (e.g. 'Status', 'Metric', 'News').",
        "hashtags": "3 relevant tags space separated (e.g. #Crypto #Launch #News).",
        "brand_color": "Pick ONE Tailwind class based on the extracted sentiment/industry: 'bg-blue-600' (Tech/Trust), 'bg-emerald-500' (Growth/Money), 'bg-orange-500' (Innovation/Bitcoin), 'bg-purple-600' (Creative/NFT), 'bg-rose-500' (Alert/Excitement), 'bg-zinc-100' (Minimal/Neutral)."
      }
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