import axios from "axios";

const getAllArticles = async (req, res) => {
    const url = `${process.env.DOMAIN}${process.env.URL_INDEX}`;
    try {
        const response = await axios.get(url);

        if (!response.data || response.data.length === 0) {
            return res.status(404).json({ message: "No articles found" });
        }

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }

}


export default getAllArticles;