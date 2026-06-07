
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessLead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enrichAndScoreLead = async (leadData: Partial<BusinessLead>): Promise<BusinessLead> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze this business for B2B lead generation. Generate comprehensive target data.
      Business: ${leadData.name}
      City: ${leadData.city}
      Category: ${leadData.category}
      Website: ${leadData.website || 'None'}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER, description: "Lead targetability score 1-100" },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            email: { type: Type.STRING, description: "Realistic B2B email address for the company or owner" },
            phone: { type: Type.STRING, description: "Realistic formatted local phone number" },
            address: { type: Type.STRING, description: "Realistic physical street address in this city" },
            state: { type: Type.STRING, description: "State or administrative region abbreviation, e.g., NY, CA, MH, TX" },
            zip: { type: Type.STRING, description: "ZIP or postal code" },
            facebook: { type: Type.STRING, description: "Realistic Facebook page URL or empty string" },
            instagram: { type: Type.STRING, description: "Realistic Instagram profile URL or empty string" },
            linkedin: { type: Type.STRING, description: "Realistic LinkedIn profile or page URL or empty string" },
            twitter: { type: Type.STRING, description: "Realistic X/Twitter profile URL or empty string" }
          },
          required: [
            "description", 
            "techStack", 
            "score", 
            "opportunities", 
            "email", 
            "phone", 
            "address", 
            "state", 
            "zip"
          ]
        }
      }
    });

    const analysis = JSON.parse(response.text);
    
    return {
      id: leadData.id || Math.random().toString(36).substr(2, 9),
      name: leadData.name || "Unknown Entity",
      category: leadData.category || "General Business",
      description: analysis.description,
      address: analysis.address || leadData.address || "Street Address Hidden",
      city: leadData.city || "Mumbai",
      state: analysis.state || leadData.state || "MH",
      country: leadData.country || "IN",
      zip: analysis.zip || leadData.zip || "000000",
      phone: analysis.phone || leadData.phone || "N/A",
      email: analysis.email || leadData.email || "N/A",
      website: leadData.website || "",
      googleMapsUrl: leadData.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((leadData.name || "Business") + " " + (leadData.city || ""))}`,
      hasWebsite: !!leadData.website,
      techStack: analysis.techStack,
      socialLinks: {
        facebook: analysis.facebook || "",
        instagram: analysis.instagram || "",
        linkedin: analysis.linkedin || "",
        twitter: analysis.twitter || ""
      },
      score: analysis.score,
      opportunities: analysis.opportunities,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("Enrichment error:", err);
    throw err;
  }
};

export const generateBulkLeads = async (
  city: string, 
  type: string, 
  filters?: { noWebsite?: boolean; noSocial?: boolean }
): Promise<Partial<BusinessLead>[]> => {
  try {
    let focusInstructions = "Include a mix of established ones and those that clearly need digital help.";
    
    if (filters?.noWebsite && filters?.noSocial) {
      focusInstructions = "CRITICAL MANDATE: Every single business generated MUST NOT have a website (website field must be empty or blank) AND MUST NOT have social media profiles. We are looking for ultra-offline local cash-flow businesses with zero digital signature.";
    } else if (filters?.noWebsite) {
      focusInstructions = "CRITICAL MANDATE: Every single business in the response MUST NOT have a website. The website field MUST be an empty string. Focus exclusively on businesses operating without any website presence (high-priority development targets).";
    } else if (filters?.noSocial) {
      focusInstructions = "CRITICAL MANDATE: The returned businesses should have non-existent or completely missing social media channels (e.g. facebook, instagram, linkedin fields should evaluate to empty/null). They need active outreach/social media management.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a high-performance lead discovery engine. Return 8 unique, real-world-style high-quality B2B leads for '${type}' businesses located in '${city}'. 
      
      Constraint Guidance:
      ${focusInstructions}
      
      Make the names, types, details, and phone numbers look highly authentic to the geography representing '${city}'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              website: { type: Type.STRING, description: "Official website URL, or empty string if none exists" },
              address: { type: Type.STRING },
              phone: { type: Type.STRING }
            },
            required: ["name", "category"]
          }
        }
      }
    });

    const rawLeads = JSON.parse(response.text);
    if (!Array.isArray(rawLeads)) return [];
    return rawLeads.map((l: any) => ({ ...l, city }));
  } catch (err) {
    console.error("Discovery error:", err);
    return [];
  }
};

export const generateColdScript = async (
  lead: BusinessLead,
  options?: {
    customSender?: boolean;
    senderName?: string;
    senderPortfolio?: string;
    format?: 'call' | 'email' | 'linkedin' | 'whatsapp';
  }
): Promise<string> => {
  try {
    const isCustom = options?.customSender ?? false;
    const senderName = options?.senderName || "Nil Patel";
    const senderPortfolio = options?.senderPortfolio || "https://nilpatel.vercel.app/";
    const format = options?.format || 'call';

    let promptContext = "";
    if (isCustom) {
      promptContext = `The outreach is sent directly from digital designer & developer **${senderName}** (Portfolio: ${senderPortfolio}). 
      Refer to his portfolio link (${senderPortfolio}) as the official credential of his work and design standard. The pitch must sound professional, authentic, personal (written/spoken by him as an expert freelancer/agency engineer), and compellingly plug his personal portfolio to build immediate trust.`;
    } else {
      promptContext = `The outreach is a generic agency lead generation script without specific personal branding.`;
    }

    let formatInstructions = "";
    if (format === 'email') {
      formatInstructions = `
      Format: **Cold Email Pitch**
      - Write a highly personalized, magnetic B2B Cold Email.
      - Subject Line: Generate 3 high-converting, curiosity-inducing subject line options.
      - Body: Short, conversational, 150-200 words. Absolutely NO generic buzzwords or corporate fluff.
      - Personalization: Connect ${isCustom ? `how ${senderName}'s work` : 'how our team'} specifically resolves their opportunities: ${lead.opportunities.join(", ")}.
      - Call to Action: A single, low-friction request (e.g., "Are you open to a quick 5-minute screen share next Thursday?").
      - Sign-off: Professional signature ${isCustom ? `referencing ${senderName} and his portfolio website: ${senderPortfolio}` : ''}.`;
    } else if (format === 'linkedin') {
      formatInstructions = `
      Format: **LinkedIn Connection & Outreach Message**
      - Render a 2-step LinkedIn outreach strategy:
        1. **Connection Request Note** (Strictly under 300 characters - friendly, pattern-interrupting note citing a specific opportunity).
        2. **Follow-up Pitch Message** (Crisp, relationship-first B2B conversational note under 150 words referencing portfolio: ${isCustom ? senderPortfolio : 'our digital portfolio'}).
      - Hook: Highlight target details: Category '${lead.category}' in ${lead.city}.`;
    } else if (format === 'whatsapp') {
      formatInstructions = `
      Format: **WhatsApp Outreach Message**
      - Write a friendly, highly professional, but concise WhatsApp message (no more than 100-120 words).
      - Use professional but conversational emojis naturally to structure the message (👋, 💼, 🚀, 🔗).
      - Keep paragraphs short and scannable.
      - Detail how ${isCustom ? `digital master ${senderName}` : 'we'} can solve their biggest growth bottleneck: ${lead.opportunities[0] || 'digital presence'} with high efficiency.
      - Explicitly include their portfolio URL (${isCustom ? senderPortfolio : 'our portfolio'}) as a clickable asset link.
      - Make the CTA direct and extremely lightweight, encouraging a simple, one-tap reply.`;
    } else {
      // Default: Cold call script
      formatInstructions = `
      Format: **Cold Calling Script**
      - Short, conversational, highly energetic, and sound like a pattern interrupt.
      - Hook the prospect in the first 15 seconds by acknowledging a relevant fact (e.g. Website status, Google maps location, or technical stack: ${lead.techStack.slice(0, 3).join(", ")}).
      - Include clearly styled script dialogue lines that the user can read directly:
         - **Intro Hook Dialogue**
         - **Value Statement Dialogue**
         - **Soft Close / Phone Call to Action Dialogue**
         - **Objection Handlers Dialogue** (such as "Not interested", "Who is this?", "No budget" or "Send an email").
      - Keep speech segments ultra easy to read at a glance with inline behavior guides like "[Action: Pause and listen]".`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Draft a high-converting B2B outreach pitch targeting this business.
      
      Business Details:
      - Name: ${lead.name}
      - Category: ${lead.category}
      - Description: ${lead.description}
      - Website: ${lead.website || 'No Website Found'}
      - Tech Stack: ${lead.techStack.join(", ")}
      - Opportunities Identified: ${lead.opportunities.join(", ")}
      
      Outreach Context:
      ${promptContext}

      ${formatInstructions}
      
      Requirements:
      1. Write in a clean, professional, and natural human tone. Avoid robotic "dear sir/madam" styling.
      2. Keep it compact, highly targeted to this business's category (${lead.category}) and location (${lead.city}, ${lead.state}).
      3. Use clean, elegant markdown formatting. Apply standard headings (###) for sections so it looks beautifully separated in the UI.`,
    });
    return response.text || "";
  } catch (err: any) {
    console.error("Script generation error:", err);
    throw err;
  }
};
