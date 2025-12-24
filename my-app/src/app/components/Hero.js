import ArticleCard from "./ArticleCard";

export default function Hero({ articles }) {

    return (
        <section className="w-full">
            <div className="mx-auto max-w-7xl w-full py-8 px-2">
                <div className="flex justify-start">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-light">Latest Blogs</h1>
                </div>

                <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <ArticleCard article={articles[0]} h="h-[360px]" />
                    <ArticleCard article={articles[1]} h="h-[360px]" />
                </div>
            </div>
        </section>
    );
}