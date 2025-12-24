import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const Article = ({ article, content }) => {

    const date = new Date(article.published_at);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });


    const MarkdownComponents = {
        // Heading styles (Responsive sizes)
        h1: ({ children }) => <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 mt-10">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 mt-8 pb-2 border-b border-slate-100">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">{children}</h3>,

        // Body Text
        p: ({ children }) => <p className="text-slate-600 leading-relaxed mb-5">{children}</p>,

        // Blockquotes (Styled for blogs)
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 italic pl-4 my-6 text-slate-700 bg-slate-50 py-2 rounded-r-md">
                {children}
            </blockquote>
        ),

        // Lists
        ul: ({ children }) => <ul className="list-disc list-outside pl-6 mb-5 space-y-2 text-slate-600">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-outside pl-6 mb-5 space-y-2 text-slate-600">{children}</ol>,

        // Custom Image (No NextImg)
        img: ({ src, alt }) => (
            <span className="block my-8">
                <img
                    src={src}
                    alt={alt}
                    className="rounded-xl w-full h-auto object-cover"
                />
                {alt && <span className="block text-center text-sm text-slate-400 mt-3">{alt}</span>}
            </span>
        ),

        // Code blocks (Fenced)
        pre: ({ children }) => (
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto my-6 text-sm leading-6 shadow-inner">
                {children}
            </pre>
        ),
        code: ({ children }) => <code className="bg-slate-100 text-rose-500 px-1.5 py-0.5 rounded font-mono text-sm">{children}</code>,

        // Links
        a: ({ href, children }) => (
            <a href={href} className="text-indigo-600 font-medium underline underline-offset-4 hover:text-indigo-800 transition-colors">
                {children}
            </a>
        ),

        // Horizontal Rule
        hr: () => <hr className="my-10 border-slate-200" />,
    };



    return (
        <article className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col align-center">
            <div className="w-full flex flex-col align-center text-center gap-4">
                <span className="text-gray-600">{formattedDate}</span>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light">{article.title}</h1>

                <p className="text-gray-600 max-w-[70ch] mx-auto text-lg tracking-normal leading-tight">{article.description}</p>
            </div>

            <div className="">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                >
                    {content || article.content}
                </ReactMarkdown>
            </div>


        </article>
    )

}


export default Article;