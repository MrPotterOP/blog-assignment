"use client";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API || "http://localhost:8000/api";
const NODE_API_BASE = process.env.NEXT_PUBLIC_NODE_API || "http://localhost:8080/api";

export default function Dashboard() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newArticleUrl, setNewArticleUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [streamModalOpen, setStreamModalOpen] = useState(false);
    const [streamLogs, setStreamLogs] = useState([]);
    const [streamStatus, setStreamStatus] = useState("idle");
    const bottomRef = useRef(null);

    // Helper to trigger Next.js On-Demand Revalidation
    const triggerRevalidation = async (path) => {
        try {
            await axios.post("/api/revalidate", { path });
            console.log(`Revalidation triggered for: ${path}`);
        } catch (error) {
            console.error(`Failed to revalidate ${path}:`, error);
        }
    };

    const fetchArticles = async () => {
        try {
            const response = await axios.get(`${LARAVEL_API_BASE}/all`);
            setArticles(response.data);
        } catch (error) {
            console.error("Failed to fetch articles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateArticle = async (e) => {
        e.preventDefault();
        if (!newArticleUrl) return;

        setIsSubmitting(true);
        try {
            await axios.post(`${LARAVEL_API_BASE}/article`, { url: newArticleUrl });
            setNewArticleUrl("");
            alert("Blog listed successfully!");

            // Refresh list and revalidate the Homepage
            await fetchArticles();
            await triggerRevalidation("/");
        } catch (error) {
            console.error("Error creating article:", error);
            alert("Failed to create article.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteArticle = async (slug) => {
        if (!confirm("Are you sure you want to delete this article?")) return;

        try {
            await axios.delete(`${LARAVEL_API_BASE}/article/${slug}`);
            setArticles((prev) => prev.filter((art) => art.slug !== slug));
            triggerRevalidation("/");
        } catch (error) {
            console.error("Error deleting article:", error);
            alert("Failed to delete.");
        }
    };

    const handleNodeAction = async (endpoint, slug) => {
        setStreamModalOpen(true);
        setStreamLogs(["Initializing connection...", `Target: ${slug}`]);
        setStreamStatus("processing");

        try {
            const response = await fetch(`${NODE_API_BASE}${endpoint}/${slug}`);

            if (!response.ok || !response.body) {
                throw new Error(response.statusText);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n").filter(line => line.trim() !== "");
                    setStreamLogs((prev) => [...prev, ...lines]);
                }
            }

            setStreamStatus("done");
            setStreamLogs((prev) => [...prev, "Process completed successfully."]);

            await fetchArticles();

            setStreamLogs((prev) => [...prev, "Triggering cache revalidation..."]);
            const path = (endpoint == "/article/targeting") ? `/blog/targeting/${slug}` : `/blog/updated/${slug}`;
            await triggerRevalidation(path);
        } catch (error) {
            console.error("Stream error:", error);
            setStreamLogs((prev) => [...prev, `ERROR: ${error.message}`]);
            setStreamStatus("error");
        }
    };

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [streamLogs]);

    useEffect(() => {
        fetchArticles();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-3">
                        {/* Home Button added here */}
                        <Link href="/" className="btn-cta inline-flex items-center gap-2 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                            <p className="text-gray-500">Manage blog content and AI generation pipelines.</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateArticle} className="flex gap-2 w-full md:w-auto items-stretch">
                        <input
                            type="url"
                            placeholder="Paste Article URL here..."
                            className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-96 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            value={newArticleUrl}
                            onChange={(e) => setNewArticleUrl(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                            {isSubmitting ? "Adding..." : "Add Blog"}
                        </button>
                    </form>
                </div>

                <hr className="border-gray-200" />

                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse flex flex-col items-center gap-4">
                        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading dashboard data...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <ArticleCard
                                key={article.slug}
                                article={article}
                                onDelete={() => handleDeleteArticle(article.slug)}
                                onGenerateTargeting={() => handleNodeAction("/article/targeting", article.slug)}
                                onGenerateContent={() => handleNodeAction("/article/updated", article.slug)}
                            />
                        ))}
                        {articles.length === 0 && (
                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                                No articles found. Add one above to get started.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {streamModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${streamStatus === 'processing' ? 'bg-yellow-400 animate-pulse' : streamStatus === 'done' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                System Stream Output
                            </h3>
                            <button
                                onClick={() => setStreamModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-[#0f172a] text-green-400 font-mono p-6 overflow-y-auto flex-1 text-sm space-y-1 shadow-inner">
                            {streamLogs.map((log, index) => (
                                <div key={index} className="break-words font-light">
                                    <span className="opacity-30 select-none mr-3 text-xs">{new Date().toLocaleTimeString()}</span>
                                    {log}
                                </div>
                            ))}
                            {streamStatus === "processing" && (
                                <div className="animate-pulse mt-2 text-green-500/70">_ Processing stream...</div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setStreamModalOpen(false)}
                                className={`px-5 py-2 rounded-lg font-medium transition-all shadow-sm ${streamStatus === 'processing'
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md cursor-pointer'
                                    }`}
                                disabled={streamStatus === 'processing'}
                            >
                                {streamStatus === 'processing' ? 'Wait for finish...' : 'Close & Refresh'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ArticleCard({ article, onDelete, onGenerateTargeting, onGenerateContent }) {
    const hasTargeting = article.targeting;
    const hasUpdatedContent = article.updated_content;

    let actionButton;

    // Button Styling Logic
    const btnBase = "w-full py-2.5 font-semibold rounded-lg transition-all duration-200 border flex items-center justify-center gap-2 cursor-pointer relative z-20";

    if (!hasTargeting && !hasUpdatedContent) {
        actionButton = (
            <button
                onClick={(e) => { e.preventDefault(); onGenerateTargeting(); }}
                className={`${btnBase} bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:shadow-sm`}
            >
                ⚡ Generate Targeting
            </button>
        );
    } else if (hasTargeting && !hasUpdatedContent) {
        actionButton = (
            <button
                onClick={(e) => { e.preventDefault(); onGenerateContent(); }}
                className={`${btnBase} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:shadow-sm`}
            >
                📝 Generate Content
            </button>
        );
    } else {
        actionButton = (
            <button disabled className={`${btnBase} bg-gray-50 text-gray-400 border-gray-100 cursor-default`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Optimization Complete
            </button>
        );
    }

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">

            {/* LINK OVERLAY: This makes the whole card clickable.
               We use inset-0 to cover everything, but z-10 allows it to sit below 
               the specific buttons (z-20) defined elsewhere in this component.
            */}
            <Link href={`/blog/${article.slug}`} className="absolute inset-0 z-10 cursor-pointer" aria-label={`View ${article.title}`}>
                <span className="sr-only">View Article</span>
            </Link>

            {/* Image Container */}
            <div className="h-48 overflow-hidden bg-gray-100 relative">
                {article.cover_image ? (
                    <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl bg-gray-50">
                        🖼️
                    </div>
                )}

                <div className="absolute top-3 left-3 flex gap-1.5 z-0">
                    <StatusBadge label="Targeting" active={article.targeting} />
                    <StatusBadge label="Content" active={article.updated_content} />
                </div>

                <button
                    onClick={(e) => {
                        e.preventDefault(); // Prevent Link click
                        e.stopPropagation(); // Stop event bubbling
                        onDelete();
                    }}
                    className="absolute top-3 right-3 bg-white/90 text-red-500 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 cursor-pointer z-20"
                    title="Delete Article"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-1 relative">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-5 leading-relaxed">
                        {article.description}
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 relative z-20">
                    {/* The Action Button sits here with z-20 so it's clickable over the card link */}
                    {actionButton}
                </div>

                <div className="mt-3 flex justify-between items-center text-xs text-gray-400 font-medium">
                    <span>Published: {new Date(article.published_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ label, active }) {
    return (
        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md shadow-sm border border-white/10 ${active
            ? 'bg-green-500 text-white'
            : 'bg-gray-800/80 text-white backdrop-blur-md'
            }`}>
            {label}: {active ? 'Done' : 'Pending'}
        </span>
    );
}