import ArticleCard from "./ArticleCard";

const ListBlogs = ({ articles }) => {
    return (
        <section className="w-full">
            <div className="mx-auto max-w-7xl w-full py-8 px-2">
                <div className="flex justify-start">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-light">All Blogs</h1>
                </div>

                <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">

                    {articles.slice().reverse().map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ListBlogs;
