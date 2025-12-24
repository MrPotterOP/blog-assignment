import axios from "axios";
import generateUpdatedContent from "../services/generateUpdatedContent.js";

const getUpdatedArticle = async (req, res) => {
    const { slug } = req.params;

    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    const send = (payload) => {
        res.write(JSON.stringify(payload) + "\n");
    };

    if (!slug) {
        send({ type: "error", message: "Slug is required" });
        return res.end();
    }

    try {
        send({ type: "status", message: "Fetching article" });

        const url = `${process.env.DOMAIN}${process.env.URL_ARTICLE}/${slug}`;
        const response = await axios.get(url);

        if (!response.data || !response.data.title) {
            send({ type: "error", message: "No article found" });
            return res.end();
        }

        const article = response.data;

        // CASE 1: already updated
        if (article.updated_content && article.updated_content.length > 0) {
            send({ type: "done", data: article });
            return res.end();
        }

        if (!article.targeting || !article.targeting.primary_search_term) {
            send({ type: "error", message: "Targeting not found" });
            return res.end();
        }

        await generateUpdatedContent({ content: article.content, slug, targeting: article.targeting, title: article.title, description: article.description, cover_image: article.cover_image, author: article.author, published_at: article.published_at, source_references: article.source_references }, send);
        res.end();
    } catch (error) {
        console.log(error);
        send({ type: "error", message: "Failed to fetch article - Internal server error" });
        res.end();
    }
};


export default getUpdatedArticle;