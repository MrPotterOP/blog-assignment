"use client";
import axios from "axios";
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
            // Optional: Revalidate homepage on delete as well
            triggerRevalidation("/");
        } catch (error) {
            console.error("Error deleting article:", error);
            alert("Failed to delete.");
        }
    };

    /**
     * Handles the streaming response from Node.js
     * Uses native fetch() to handle streams correctly in the browser.
     */
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

            // Revalidate the specific Article Page (assuming route is /slug or /blog/slug)
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">Manage blog content and AI generation pipelines.</p>
                    </div>

                    <form onSubmit={handleCreateArticle} className="flex gap-2 w-full md:w-auto">
                        <input
                            type="url"
                            placeholder="Paste Article URL here..."
                            className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-96 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newArticleUrl}
                            onChange={(e) => setNewArticleUrl(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Adding..." : "Add Blog"}
                        </button>
                    </form>
                </div>

                <hr className="border-gray-200" />

                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse">Loading dashboard data...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <div className="col-span-full text-center py-10 text-gray-400">
                                No articles found. Add one above to get started.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {streamModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">System Stream Output</h3>
                            <button
                                onClick={() => setStreamModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-gray-900 text-green-400 font-mono p-6 overflow-y-auto flex-1 text-sm space-y-1">
                            {streamLogs.map((log, index) => (
                                <div key={index} className="break-words">
                                    <span className="opacity-50 mr-2">{new Date().toLocaleTimeString()}</span>
                                    {log}
                                </div>
                            ))}
                            {streamStatus === "processing" && (
                                <div className="animate-pulse mt-2">_ Processing stream...</div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setStreamModalOpen(false)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${streamStatus === 'processing'
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
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

    if (!hasTargeting && !hasUpdatedContent) {
        actionButton = (
            <button
                onClick={onGenerateTargeting}
                className="w-full py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition border border-indigo-200"
            >
                ⚡ Generate Targeting
            </button>
        );
    } else if (hasTargeting && !hasUpdatedContent) {
        actionButton = (
            <button
                onClick={onGenerateContent}
                className="w-full py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition border border-emerald-200"
            >
                📝 Generate Content
            </button>
        );
    } else {
        actionButton = (
            <button disabled className="w-full py-2 bg-gray-100 text-gray-400 font-semibold rounded-lg border border-gray-200 cursor-default">
                ✓ Optimization Complete
            </button>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
            <div className="h-48 overflow-hidden bg-gray-100 relative group">
                {article.cover_image ? (
                    <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🖼️</div>
                )}

                <div className="absolute top-2 left-2 flex gap-1">
                    <StatusBadge label="Targeting" active={article.targeting} />
                    <StatusBadge label="Content" active={article.updated_content} />
                </div>

                <button
                    onClick={onDelete}
                    className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    title="Delete Article"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 leading-snug mb-2 line-clamp-2" title={article.title}>
                        {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                        {article.description}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    {actionButton}
                </div>

                <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                    <span>Published: {new Date(article.published_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ label, active }) {
    return (
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm ${active ? 'bg-green-500 text-white' : 'bg-gray-800/60 text-white backdrop-blur-md'}`}>
            {label}: {active ? 'Done' : 'Pending'}
        </span>
    );
}