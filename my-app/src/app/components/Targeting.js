const Targeting = ({ targeting }) => {
    // 1. Safety check: If no targeting object exists, return nothing.
    if (!targeting) return null;

    // Destructure for easier access
    const {
        primary_search_term,
        content_summary,
        ideal_audience,
        pain_points,
        secondary_keywords
    } = targeting;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-10">

            {/* --- SECTION 1: HEADER (Always Present) --- */}
            <div className="text-center max-w-3xl space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {primary_search_term}
                </h1>

                {/* Content Summary (Optional) */}
                {content_summary && (
                    <p className="text-lg text-slate-600 leading-relaxed">
                        {content_summary}
                    </p>
                )}
            </div>

            {/* --- SECTION 3: AUDIENCE & PAIN POINTS (Optional) --- */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

                {/* Ideal Audience Column */}
                {ideal_audience && ideal_audience.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 border-b pb-2">
                            Ideal Audience
                        </h3>
                        <ul className="space-y-3">
                            {ideal_audience.map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="text-slate-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Pain Points Column */}
                {pain_points && pain_points.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 border-b pb-2">
                            Pain Points
                        </h3>
                        <ul className="space-y-3">
                            {pain_points.map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                    <span className="text-slate-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* --- SECTION 4: SECONDARY KEYWORDS (Optional) --- */}
            {secondary_keywords && secondary_keywords.length > 0 && (
                <div className="w-full bg-slate-50 rounded-xl p-6 md:p-8">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                        Secondary Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {secondary_keywords.map((keyword, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm rounded-md shadow-sm"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for clean layout (Internal helper)
const PositioningCard = ({ title, value }) => {
    if (!value) return null; // Don't render empty cards
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-sm font-medium text-slate-500 uppercase mb-2">
                {title}
            </h4>
            <p className="text-slate-900 font-medium leading-snug">
                {value}
            </p>
        </div>
    );
};

export default Targeting;