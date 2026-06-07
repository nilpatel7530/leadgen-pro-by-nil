# LeadGen Pro Architect 🚀

An AI-powered B2B Lead Discovery and Enrichment Platform designed for digital agencies, consultants, and developers to find, score, and contact local B2B prospects. 

This React & TypeScript application leverages the **Google Gen AI SDK** and **Gemini 3.5 Flash** to analyze business profiles, evaluate digital bottlenecks, calculate lead scoring metrics, and generate tailored multi-channel outreach scripts.

---

## ⚡ Core Capabilities

1. **Intelligent Lead Discovery**
   * Target specific business types/industries within any major metropolitan city.
   * Generate localized lead lists with contact names, categories, and website presence.
   * Toggle filters to isolate prime targets (e.g., businesses with **No Website** or **No Social Media**).

2. **AI-Driven Data Enrichment & Scoring**
   * Automatically enrich raw lead records with realistic B2B email addresses, phone numbers, social media links, and tech stack information.
   * Calculate a **Lead Targetability Score (1–100)** utilizing rule-based heuristics:
     * **Website Absence**: `+40 pts` (High priority for web design/dev services)
     * **Legacy Tech Stack**: `+25 pts` (Outdated frameworks or non-responsive designs)
     * **No E-Commerce/Automation**: `+20 pts` (Retailers lacking digital transaction channels)
     * **Social Inactivity**: `+15 pts` (Low engagement signal across FB/IG/LinkedIn)

3. **Multi-Channel Cold Outreach Engine**
   * Generate personalized pitches optimized for four formats:
     * 📞 **Cold Call Scripts**: Patterns interrupts, introductory hooks, and objection handlers.
     * 📧 **Cold Emails**: Three high-converting subject line options and a 150-word conversational body.
     * 💼 **LinkedIn Messages**: A 2-step strategy comprising a connection note and a follow-up pitch.
     * 💬 **WhatsApp Messages**: Short, emoji-optimized, scannable pitches.
   * Custom sender configurations to inject personal developer branding and portfolio links directly into the AI prompts.

4. **CSV Export**
   * Download fully enriched B2B leads datasets instantly for CRM ingestion (HubSpot, Salesforce, etc.).

---

## 🛠️ Technology Stack

* **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 6](https://vite.dev/)
* **AI Engine**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini 3.5 Flash)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* A Google Gemini API Key

### Installation

1. Clone the repository and navigate to the directory:
   ```bash
   cd leadgen-pro-by-nil
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   * Create or open `.env.local`
   * Add your Gemini API Key:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` to explore the dashboard.

---

## 🏗️ System Architecture

The application is structured into two main layout tabs:

### 1. Discovery Dashboard
The interactive client-facing hub where searches are initiated, filters are configured, leads are displayed in real-time, and cold scripts are generated.

### 2. Infrastructure Documentation
Integrated system blueprint highlighting:
* **Intelligence Layer**: Client-side state orchestration and LLM integrations.
* **Geographic Sub-sampling Grid**: Systems designed to generate bounding boxes to systematically bypass API density constraints and ensure 100% geographic coverage of a metropolitan area.
* **Database Pipeline (Target Design)**: Workers, task managers (Redis), relational sync (PostgreSQL), and indexing (ElasticSearch) for enterprise scaling.
