import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ListBlogs from "./components/ListBlogs";
import Footer from "./components/Footer";


export const revalidate = false;


async function getArticles() {

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API}/all`);
    const data = await response.json();

    data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    return data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}


export default async function Home() {

  const articles = await getArticles();

  console.log(articles);


  return (
    <>
      <header>
        <Navbar />
      </header>
      {
        articles && articles.length > 1 ? (
          <main>
            <Hero articles={[articles[0], articles[1]]} />
            <ListBlogs articles={articles.slice(2)} />
          </main>
        ) : (
          <p className="text-center text-xl">No articles found</p>
        )
      }
      <Footer />
    </>
  );
}
