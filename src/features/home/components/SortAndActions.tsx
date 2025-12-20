import { SortDesc, Trash2 } from "lucide-react";

interface SortAndActionsProps {
    sortMode: "newest" | "az";
    setSortMode: (mode: "newest" | "az") => void;
    onDeleteAllClick: () => void;
    wordCount: number;
    loading: boolean;
}

export default function SortAndActions({
    sortMode,
    setSortMode,
    onDeleteAllClick,
    wordCount,
    loading
}: SortAndActionsProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200/60 pt-6">
            <div className="flex items-center gap-3">
                <span className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Sort by:</span>
                <button
                    onClick={() => setSortMode("newest")}
                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 ${sortMode === "newest"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:shadow-lg hover:scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-200/60"}`}
                >
                    <SortDesc size={18} />
                    Newest First
                </button>
                <button
                    onClick={() => setSortMode("az")}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${sortMode === "az"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:shadow-lg hover:scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-200/60"}`}
                >
                    A → Z
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onDeleteAllClick}
                    disabled={loading || wordCount === 0}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100 
                             transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                             border border-red-200/60 hover:shadow-md hover:scale-105 font-medium"
                >
                    <Trash2 size={18} />
                    Delete All ({wordCount})
                </button>
            </div>
        </div>
    );
}

