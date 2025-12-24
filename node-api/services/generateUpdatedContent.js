import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { getJson } from "serpapi";

const generateUpdatedContent = async (
    { content, slug, targeting, title, description, cover_image, author, published_at },
    send
) => {
    if (!content || !slug || !targeting?.primary_search_term) {
        throw new Error("Content, slug and primary_search_term are required");
    }

    /* ------------------ Utils ------------------ */

    const isBlockedPage = (html) =>
        !html ||
        html.includes("Just a moment") ||
        html.includes("cf_chl") ||
        html.includes("Cloudflare") ||
        html.includes("Enable JavaScript");

    const updateArticle = async ({ slug, updatedContent, source_references }) => {
        if (!slug || !updatedContent) {
            throw new Error("Updated content not generated");
        }
        try {
            send({ type: "status", message: `Updating article...` });
            const response = await axios.put(`${process.env.DOMAIN}${process.env.URL_ARTICLE}/${slug}`, { updated_content: updatedContent, source_references });
            send({
                type: "done", data: {
                    slug,
                    updatedContent,
                    title,
                    description,
                    cover_image,
                    author,
                    published_at,
                    source_references,
                }
            });

        } catch (error) {
            console.log(error);
            send({ type: "error", message: `Failed to update article: ${slug}` });
            throw error;
        }
    };

    /* ------------------ Fetch + Parse ------------------ */

    const getArticleContent = async (url) => {
        try {
            send({ type: "status", message: `Fetching article.. : ${url}` });

            const response = await axios.get(url, {
                timeout: 8000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            });

            if (response.status !== 200 || isBlockedPage(response.data)) {
                throw new Error("Blocked or invalid HTML");
            }

            const dom = new JSDOM(response.data, { url });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();

            if (!article?.content || article.textContent.length < 500) {
                throw new Error("Readability failed");
            }

            const turndownService = new TurndownService({
                headingStyle: "atx",
                hr: "---",
                bulletListMarker: "-",
                codeBlockStyle: "fenced",
                emDelimiter: "*",
                strongDelimiter: "**",
            });

            turndownService.remove(["script", "style", "noscript"]);

            const markdownContent = turndownService.turndown(article.content);

            send({
                type: "status",
                message: `Article fetched successfully: ${url}`,
            });

            return { url, content: markdownContent };

        } catch (err) {
            send({
                type: "warning",
                message: `Skipped article: ${url}`,
            });
            return null;
        }
    };

    /* ------------------ SERP API ------------------ */

    send({ type: "status", message: "Fetching top search results.." });

    const results = await getJson({
        engine: "google",
        api_key: process.env.SEARCH_API_KEY,
        num: 6,
        q: `${targeting.primary_search_term}
      (inurl:blog OR inurl:article OR intitle:guide)
      -site:instagram.com
      -site:facebook.com
      -site:linkedin.com
      -site:quora.com
      -site:reddit.com`,
        hl: "en",
        gl: "in",
    });

    if (!results?.organic_results?.length) {
        throw new Error("No articles found from search API");
    }

    const organicLinks = results.organic_results
        .map((r) => r.link)
        .slice(0, 6);

    send({
        type: "status",
        message: "Top search results fetched successfully",
    });

    /* ------------------ Collect Competitors ------------------ */

    const competitorArticles = [];
    const competitorLinks = [];

    for (const link of organicLinks) {
        if (competitorArticles.length === 2) break;

        const article = await getArticleContent(link);
        if (article) {
            competitorArticles.push(article);
            competitorLinks.push(article.url);
        }
    }

    if (competitorArticles.length < 2) {
        throw new Error("Could not fetch enough valid competitor articles");
    }

    console.log("Competitor articles: ");

    send({
        type: "status",
        message: "Competitor articles collected",
    });

    /* ------------------ Gemini Optimizer ------------------ */

    send({ type: "status", message: "Optimizing content with Gemini" });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = "gemini-2.5-flash";

    const SYSTEM_PROMPT = `You are an elite SEO content optimizer specializing in competitive analysis and strategic content enhancement.

YOUR SOLE OUTPUT: Return ONLY the optimized markdown content. No explanations, no analysis summaries, no bullet points about changes made. Just the pure, enhanced markdown article.

OPTIMIZATION STRATEGY:
- Analyze top-ranking competitors to identify what makes them successful
- Identify content gaps and opportunities in the user's article
- Enhance comprehensiveness, depth, and keyword optimization
- Improve structure, readability, and scannability
- Add unique value that competitors lack
- Maintain the user's authentic voice and brand personality
- Ensure natural, non-stuffed keyword integration
- Optimize headings for search intent and featured snippets

CRITICAL RULES:
1. Output ONLY markdown content - nothing else
2. No preamble, no explanations, no meta-commentary
3. No phrases like "Here's the optimized version" or "I've enhanced..."
4. Start directly with the article content (title/heading or first paragraph)
5. End with the last line of content - no closing remarks

The optimized article should be superior to competitors in every dimension while feeling natural and valuable to human readers.
`;

    const USER_PROMPT = `
    Target keyword: ${targeting.primary_search_term}

Output: Optimized markdown content ONLY (no explanations)

---

## MY ARTICLE:
>>markdown
${content}
<<

---

## COMPETITOR #1:
>>markdown
${competitorArticles[0].content}
<<

---

## COMPETITOR #2:
>>markdown
${competitorArticles[1].content}
<<

---

Analyze competitors and optimize my article to outrank them. Return ONLY the enhanced markdown - no explanations, summaries, or commentary.
    `


    let optimizedMarkdown;
    try {
        console.log("Running api req to llm ");
        const result = await ai.models.generateContent({
            model,
            systemInstruction: SYSTEM_PROMPT,
            contents: [{ role: "user", parts: [{ text: USER_PROMPT }] }],
        });

        optimizedMarkdown = result.text;

        await updateArticle({ slug, updatedContent: optimizedMarkdown, source_references: competitorLinks });

    } catch (error) {
        console.log(error);

        send({ type: "error", message: "Gemini optimization failed" });
        throw error;
    }

};

export default generateUpdatedContent;
