import axios from "axios";
import generateTargeting from "../services/generateTargeting.js";

const getArticleTargeting = async (req, res) => {
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

        if (!response.data?.title || !response.data?.content) {
            send({ type: "error", message: "Article not found" });
            return res.end();
        }

        if (response.data.targeting?.primary_search_term) {
            send({
                type: "targeting",
                data: {
                    title: response.data.title,
                    content: response.data.content,
                    targeting: response.data.targeting,
                    slug: response.data.slug,
                    description: response.data.description,
                    cover_image: response.data.cover_image,
                },
            });

            send({ type: "done" });
            return res.end();
        }

        send({ type: "status", message: "Generating targeting" });

        await generateTargeting(
            { content: response.data.content, slug, title: response.data.title, description: response.data.description, cover_image: response.data.cover_image },
            send
        );

        res.end();

    } catch (error) {
        send({ type: "error", message: "Internal server error" });
        res.end();
    }
};

export default getArticleTargeting;
