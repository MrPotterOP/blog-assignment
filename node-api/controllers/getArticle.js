import axios from "axios";
import generateUpdatedContent from "../services/generateUpdatedContent.js";
import generateTargeting from "../services/generateTargeting.js";

const getArticle = async (req, res) => {
    if (!req.params.slug) {
        return res.status(400).json({ message: "Slug is required" });
    }

    // 🔥 STREAM HEADERS
    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    const send = (payload) => {
        res.write(JSON.stringify(payload) + "\n");
    };

    try {
        send({ type: "status", message: "Fetching article" });

        const url = `${process.env.DOMAIN}${process.env.URL_ARTICLE}/${req.params.slug}`;
        const response = await axios.get(url);

        if (!response.data || !response.data.title) {
            send({ type: "error", message: "No article found" });
            return res.end();
        }

        const article = response.data;

        // CASE 1: already updated
        if (article.updated_content) {
            send({ type: "done", data: article });
            return res.end();
        }

        // CASE 2: targeting exists
        if (article.targeting) {
            send({ type: "status", message: "Generating updated content" });

            await generateUpdatedContent(article, send);

            send({ type: "done" });
            return res.end();
        }

        // CASE 3: full pipeline
        send({ type: "status", message: "Generating targeting" });

        const targetedArticle = await generateTargeting(
            { content: article.content, slug: req.params.slug },
            send
        );

        send({ type: "status", message: "Generating updated content" });

        await generateUpdatedContent(targetedArticle, send);

        send({ type: "done" });
        res.end();

    } catch (error) {
        send({ type: "error", message: "Failed to fetch article - Internal server error" });
        res.end();
    }
};

export default getArticle;
