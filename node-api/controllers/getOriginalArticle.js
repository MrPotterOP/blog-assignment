import axios from "axios";

const getOriginalArticle = async (req, res) => {
    const { slug } = req.params;
    const url = `${process.env.DOMAIN}${process.env.URL_ARTICLE}/${slug}`;
    const response = await axios.get(url);
    if (!response.data || !response.data.title || !response.data.content) {
        return res.status(404).json({ message: "Article not found" });
    }
    res.json({
        title: response.data.title,
        slug: response.data.slug,
        description: response.data.description,
        content: response.data.content,
        cover_image: response.data.cover_image,
        source_original_url: response.data.source_original_url,
        author: response.data.author,
        published_at: response.data.published_at,
    });
};


export default getOriginalArticle;