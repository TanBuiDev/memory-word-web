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
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Sort by:</span>
                <button
                    onClick={() => setSortMode("newest")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${sortMode === "newest"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                    <SortDesc size={16} />
                    Newest First
                </button>
                <button
                    onClick={() => setSortMode("az")}
                    className={`px-4 py-2 rounded-lg ${sortMode === "az"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                    A → Z
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onDeleteAllClick}
                    disabled={loading || wordCount === 0}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 
                             transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    Delete All ({wordCount})
                </button>
            </div>
        </div>
    );
}

