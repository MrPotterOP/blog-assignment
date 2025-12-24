import Link from "next/link";

const ArticleCard = ({ article, className, h, w }) => {

    const imgUrl = article.cover_image || 'https://res.cloudinary.com/dx7zhktvq/image/upload/v1766568815/stock/th/kailun-zhang-ys_wRNuBeM0-unsplash_iccyuv.jpg';

    const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <Link href={`/blog/${article.slug}`}>
            <div key={article.id} className={`flex flex-col gap-4 ${className}`}>
                <img className={`${w} ${h} rounded-xl object-cover`} src={imgUrl} alt={article.title} />

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-(--clr-prime)">{formattedDate}</span>
                    <h1 className="text-lg md:text-xl lg:text-2xl font-light">{article.title}</h1>
                </div>

            </div>
        </Link>
    );
}


export default ArticleCard;