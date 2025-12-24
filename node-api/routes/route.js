import express from "express";

const router = express.Router();

import generateUpdatedContent from "../services/generateUpdatedContent.js";

import getAllArticles from "../controllers/getAllArticles.js";
import getOriginalArticle from "../controllers/getOriginalArticle.js";
import getArticleTargeting from "../controllers/getArticelTargeting.js";
import getUpdatedArticle from "../controllers/getUpdatedArticle.js";
import getArticle from "../controllers/getArticle.js";


router.get("/", getAllArticles);
// router.get("/article/:slug", getArticle);

router.get("/article/original/:slug", getOriginalArticle);
router.get("/article/targeting/:slug", getArticleTargeting);
router.get("/article/updated/:slug", getUpdatedArticle);

router.post("/search", async (req, res) => {
    const { content, slug, primary_search_term } = req.body;

    // 🔥 STREAM HEADERS
    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    const send = (payload) => {
        res.write(JSON.stringify(payload) + "\n");
    };

    await generateUpdatedContent({ content, slug, primary_search_term }, send);
});

export default router;
