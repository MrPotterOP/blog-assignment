import axios from "axios";
import { GoogleGenAI, Type } from "@google/genai";

const generateTargeting = async ({ content, slug, title, description, cover_image }, stream) => {

    if (!content || content.length === 0) {
        throw new Error("Content is required");
    }

    stream?.({ type: "status", message: "Analyzing article content" });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = "gemini-2.5-flash";

    const SYSTEM_PROMPT = `You are an elite content strategist and SEO analyst with 15+ years of experience in digital marketing, content optimization, and search intent analysis.

Your expertise includes:
- Semantic SEO and keyword research
- User intent mapping across the buyer's journey
- Content positioning and competitive analysis
- Conversion-focused content strategy
- Pain point identification and messaging optimization

You provide precise, actionable insights that content teams can immediately implement. Your analyses are data-informed, strategically sound, and focused on driving measurable business outcomes.

CRITICAL: You respond ONLY with valid JSON. No markdown, no code blocks, no preamble, no explanation - just pure JSON.`;

    const USER_PROMPT = `Analyze the provided article content and extract strategic insights for content marketing optimization.

## Analysis Framework

### 1. PRIMARY SEARCH TERM
Identify the **single most valuable search term** this content should rank for. Consider:
- Search volume potential vs competition
- Commercial intent alignment
- Content depth and relevance match
- Long-tail specificity that drives qualified traffic

### 2. CONTENT SUMMARY
Provide a strategic content brief covering:
- **Content Type**: (e.g., ToFu educational guide, comparison article, how-to tutorial, case study)
- **Funnel Stage**: Where this fits in the buyer's journey (ToFu/MoFu/BoFu)
- **Core Value Proposition**: What unique insight or value does this deliver?
- **Content Angle**: The specific approach or perspective taken
- **Technical Depth**: Beginner-friendly, intermediate, or advanced

### 3. IDEAL AUDIENCE PROFILE
Define who gets the most value from this content:
- **Primary Persona**: Role/title (e.g., "Non-technical business owners")
- **Secondary Personas**: Additional beneficiaries
- **Experience Level**: Their familiarity with the topic
- **Decision-Making Power**: Are they researchers, influencers, or decision-makers?
- **Context**: What situation brings them to this content?

### 4. PAIN POINTS ADDRESSED
List specific problems this content solves as first-person statements:
- Frame each as "I am [problem]..." or "I struggle with..."
- Focus on emotional and practical pain points
- Include both explicit and implicit problems
- Prioritize by urgency/impact

### 5. CONTENT POSITIONING
- **Intent Match**: What search intent does this serve? (Informational, Commercial Investigation, Transactional, Navigational)
- **Competitive Angle**: What makes this perspective unique or differentiated?
- **Conversion Potential**: What natural next steps does this enable?

### 6. SECONDARY KEYWORDS
Identify 3-5 related keywords/phrases this content naturally supports

### 7. CONTENT GAPS & OPPORTUNITIES
Identify what's missing or could be enhanced

---

## Response JSON Schema:

{
  "primary_search_term": "string",
  "content_summary": "string",
  "ideal_audience": {
    "primary_persona": "string",
    "secondary_personas": ["string"],
    "experience_level": "string",
    "context": "string"
  },
  "pain_points": ["string"],
  "content_positioning": {
    "intent_match": "string",
    "competitive_angle": "string",
    "conversion_potential": "string"
  },
  "secondary_keywords": ["string"]
}

---

>> Article Content to Analyze:

${content}

<<
---

Respond ONLY with the raw JSON object. No markdown, no code blocks, no explanations.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            primary_search_term: { type: Type.STRING },
            content_summary: { type: Type.STRING },
            ideal_audience: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            pain_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            content_positioning: {
                type: Type.OBJECT,
                properties: {
                    intent_match: { type: Type.STRING },
                    competitive_angle: { type: Type.STRING },
                    conversion_potential: { type: Type.STRING }
                },
                required: ["intent_match", "competitive_angle", "conversion_potential"]
            },
            secondary_keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        },
        required: [
            "primary_search_term",
            "content_summary",
            "ideal_audience",
            "pain_points",
            "content_positioning",
            "secondary_keywords"
        ]
    };

    stream?.({ type: "status", message: "Processing targeting" });

    let targeting;

    try {
        const results = await ai.models.generateContent({
            model,
            systemInstruction: SYSTEM_PROMPT,
            contents: [
                {
                    role: 'user',
                    parts: [{ text: USER_PROMPT }]
                }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        })

        if (!results.text) {
            throw new Error("Unable to generate targeting");
        }

        targeting = JSON.parse(results.text);

        stream?.({
            type: "status",
            message: "Targeting generated successfully"
        });

    } catch (error) {
        stream?.({ type: "error", message: "Targeting generation failed" });
        throw error;
    }

    // ----------------------------
    // Update article with targeting
    // ----------------------------

    stream?.({ type: "status", message: "Saving targeting to article" });

    try {
        const response = await axios.put(
            `${process.env.DOMAIN}${process.env.URL_ARTICLE}/${slug}`,
            { targeting }
        );

        stream?.({
            type: "done", data: {
                title: title,
                content: content,
                targeting: targeting,
                slug: slug,
                description: description,
                cover_image: cover_image,
            }
        });


    } catch (error) {
        console.log("Error updating article: ", error);
        stream?.({ type: "error", message: "Failed to update article with targeting" });
        throw error;
    }
};

export default generateTargeting;