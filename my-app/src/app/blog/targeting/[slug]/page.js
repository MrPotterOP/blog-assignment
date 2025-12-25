import Navbar from "@/app/components/Navbar";
import Targeting from "@/app/components/Targeting";
import TabsNav from "@/app/components/TabsNav";
import Footer from "@/app/components/Footer";
import { redirect } from "next/navigation";

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

    if (!article || !article.targeting.primary_search_term) {
        redirect("/404");
    }

    return (
        <>
            <header>
                <Navbar />
            </header>
            <main>
                <Targeting targeting={article.targeting} />
            </main>

            <TabsNav slug={slug} />
            <Footer />
        </>
    );
}
