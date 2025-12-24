import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// SECURITY: Allow only HTTP and HTTPS protocols
function isValidUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// SECURITY: SSRF Protection
// Block attempts to scan local/private networks
function isSafeUrl(string: string) {
  try {
    const url = new URL(string);
    const hostname = url.hostname.toLowerCase();
    
    const forbidden = [
      'localhost', '127.0.0.1', '0.0.0.0', '::1', // Local
      '169.254.169.254', // AWS/Cloud Metadata
      'vercel.app' // Prevent recursive scanning of self
    ];

    if (forbidden.includes(hostname)) return false;
    if (hostname.startsWith('192.168.')) return false;
    if (hostname.startsWith('10.')) return false;
    
    return true;
  } catch (_) {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // 1. AUTHENTICATION CHECK
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Configuration Error: Missing API Key");
      return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    // 2. INPUT VALIDATION & SANITIZATION
    const body = await req.json();
    const { url, context } = body;

    // Limit context length to prevent token overflow attacks
    const safeContext = context ? String(context).slice(0, 2000) : "";
    
    console.log(`▶️ Secure Processing: ${url ? 'URL Mode' : 'Context Mode'}`);

    // 3. STEP 1: AUTO-DISCOVER MODELS (Same logic as before)
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!modelsResponse.ok) throw new Error("AI Service Unavailable");
    const modelsData = await modelsResponse.json();
    
    const viableModel = modelsData.models?.find((m: any) => 
      m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent')
    );
    if (!viableModel) throw new Error("No AI capacity available.");

    // 4. STEP 2: SECURE SCRAPING
    let sourceMaterial = "";
    if (url) {
      if (!isValidUrl(url)) {
        return NextResponse.json({ error: "Invalid URL format. Use http:// or https://" }, { status: 400 });
      }
      if (!isSafeUrl(url)) {
        console.warn(`⚠️ SSRF Attempt Blocked: ${url}`);
        return NextResponse.json({ error: "Restricted URL." }, { status: 403 });
      }

      try {
        // Set a timeout so the server doesn't hang forever on a slow site
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url, { 
          headers: { 'User-Agent': 'StratOS-Bot/1.0 (Portfolio Project)' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          $('script, style, nav, footer, header, svg, iframe').remove(); // Remove frames/scripts
          sourceMaterial += `WEBSITE CONTENT: ${$('body').text().replace(/\s+/g, ' ').slice(0, 4000)} \n\n`;
        } else {
          sourceMaterial += `URL: ${url} (Content inaccessible) \n\n`;
        }
      } catch (e) {
        sourceMaterial += `URL: ${url} (Network error) \n\n`;
      }
    }
    
    if (safeContext) sourceMaterial += `USER NOTES: ${safeContext}`;

    if (!sourceMaterial.trim()) {
      return NextResponse.json({ error: "No data to analyze. Please provide a URL or Notes." }, { status: 400 });
    }

    // 5. STEP 3: EXECUTE WITH AI
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${viableModel.name}:generateContent?key=${apiKey}`;
    
    const prompt = `
      Act as a Senior Communications Strategist.
      Analyze this Source Data: "${sourceMaterial}"
      
      Output a valid JSON object with:
      {
        "headline": "Short typographic headline (max 8 words)",
        "tweet_body": "Professional post text (max 280 chars)",
        "stats": "Key data point (e.g. '$5M Revenue')",
        "stat_label": "Label for stat",
        "hashtags": "#Tag1 #Tag2 #Tag3",
        "brand_color": "Tailwind color class (options: 'bg-blue-600', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-600', 'bg-slate-900', 'bg-rose-500')"
      }
      Return ONLY JSON.
    `;

    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!aiResponse.ok) throw new Error("AI Processing Failed");

    const aiData = await aiResponse.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty AI Response");

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("❌ SERVER ERROR:", error.message);
    // SECURITY: Return generic error to client, hide stack trace
    return NextResponse.json(
      { error: "Strategy generation failed." }, 
      { status: 500 }
    );
  }
}

