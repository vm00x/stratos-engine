import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    const { url, context } = await req.json();
    console.log(`▶️ Processing: ${url || 'Context Only'}`);

    // --- STEP 1: AUTO-DISCOVER AVAILABLE MODELS ---
    // We stop guessing. We ask Google what models your key has access to.
    console.log("▶️ Discovering available models...");
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
   
    if (!modelsResponse.ok) {
      const err = await modelsResponse.text();
      console.error("❌ Failed to list models:", err);
      throw new Error("API Key is invalid or cannot list models.");
    }

    const modelsData = await modelsResponse.json();
   
    // Find the first model that supports 'generateContent' and is a Gemini model
    const viableModel = modelsData.models?.find((m: any) =>
      m.name.includes('gemini') &&
      m.supportedGenerationMethods?.includes('generateContent')
    );

    if (!viableModel) {
      throw new Error("No text-generation models available for this API Key.");
    }

    console.log(`✅ Selected Model: ${viableModel.name}`); // Logs the actual working model name

    // --- STEP 2: DATA INGESTION ---
    let sourceMaterial = "";
    if (url) {
      try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          $('script, style, nav, footer, header, svg').remove();
          sourceMaterial += `WEBSITE CONTENT: ${$('body').text().replace(/\s+/g, ' ').slice(0, 4000)} \n\n`;
          console.log("✅ Scrape Success");
        } else {
          sourceMaterial += `URL: ${url} (Content inaccessible) \n\n`;
        }
      } catch (e) {
        sourceMaterial += `URL: ${url} (Network error) \n\n`;
      }
    }
    if (context) sourceMaterial += `USER NOTES: ${context}`;

    // --- STEP 3: EXECUTE WITH SELECTED MODEL ---
    // We use the viableModel.name we found dynamically
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
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`Google API Error (${aiResponse.status}): ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
   
    if (!rawText) throw new Error("AI returned empty response");

    // Clean and Parse
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
   
    return NextResponse.json(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("❌ SERVER ERROR:", error.message);
    return NextResponse.json(
      { error: error.message || "Strategy generation failed." },
      { status: 500 }
    );
  }
}
