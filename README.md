StratOS | Intelligent Communications Engine

StratOS is an autonomous strategic communications tool designed to standardize brand messaging and automate high-fidelity asset generation.
Unlike standard generative AI tools that hallucinate data, StratOS utilizes a hybrid ingestion layer to anchor content generation in real-time source truth (live website data), ensuring strategic alignment for high-volume campaigns.

🚀 Key Features
1. Hybrid Data Ingestion (Cheerio + Fallback)
The system attempts to scrape live DOM data from target URLs. If blocked (403/WAF), it gracefully degrades to a "Context Mode," allowing manual strategic input. This ensures 100% operational reliability.
2. Auto-Negotiating AI Backend
The API layer (/api/analyze) bypasses brittle SDK dependencies by communicating directly with Google's REST endpoints. It implements an Auto-Discovery Protocol to query available models dynamically, preventing version mismatches (e.g., gemini-1.5-flash vs gemini-pro).
3. Generative Canvas Engine (v3.0)
Instead of CSS-based screenshots, StratOS uses a server-side equivalent Canvas engine to draw pixels mathematically.
Procedural Textures: Generates noise and grid patterns on the fly.
Dynamic layout: Typography scales based on content length.
Brand Alignment: Automatically maps brand sentiment to Tailwind color palettes.
4. Enterprise-Grade Security
SSRF Protection: Blocks local network scanning (127.0.0.1, metadata IPs).
Input Sanitization: Prevents XSS and payload overflow attacks.
Error Masking: Client-side errors are genericized to prevent leakage of stack traces.

🛠️ Tech Stack
Frontend: Next.js 14 (App Router), Tailwind CSS, Lucide React.
Backend: Vercel Serverless Functions (Node.js).
Intelligence: Google Gemini 1.5 Flash (via REST).
Extraction: Cheerio (DOM Parser).
Graphics: HTML5 Canvas API (2D Context).

⚡ Quick Start
Prerequisites
Node.js 18+
Google AI Studio API Key
Installation
# Clone repository
git clone [https://github.com/yourusername/stratos-engine.git](https://github.com/yourusername/stratos-engine.git)

# Install dependencies
npm install

# Configure Environment
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run Development Server
npm run dev

📸 Usage Workflow
Input: Enter a target URL (e.g., https://solana.com) or paste campaign context.
Analyze: The Agent negotiates with the LLM to extract UVP (Unique Value Proposition) and key metrics.
Generate: The system outputs a 4:5 aspect ratio poster (X/LinkedIn standard) and accompanying copy.
Export: Download high-resolution PNG assets directly to local storage.
Engineered for the modern communications stack.