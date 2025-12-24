import Navbar from "@/app/components/Navbar";
import Article from "@/app/components/Article";
import TabsNav from "@/app/components/TabsNav";
import Footer from "@/app/components/Footer";


export const revalidate = false;


async function getArticles(slug) {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API}/article/${slug}`);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
}


export default async function Home({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const article = await getArticles(slug);

    if (!article) {
        return <div>Article not found.</div>;
    }

    return (
        <>
            <header>
                <Navbar />
            </header>
            <main className="max-w-7xl px-4 mx-auto">
                <Article article={article} content={article.updated_content} />

                <div className="mt-6 mb-6 border-t pt-3">
                    <p className="text-xs text-gray-500">
                        Source:&nbsp;
                        <a
                            href={article.source_original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:text-violet-700 underline underline-offset-2"
                        >
                            {article.source_original_url}
                        </a>
                    </p>
                </div>

            </main>
            <TabsNav slug={slug} />
            <Footer />
        </>
    );
}
