import type { WordList } from "../../../types/list";

interface CategoryFilterProps {
    lists: WordList[];
    activeListId: string | null;
    setActiveListId: (id: string | null) => void;
    totalWords: number;
}

export default function CategoryFilter({
    lists,
    activeListId,
    setActiveListId,
    totalWords
}: CategoryFilterProps) {
    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveListId(null)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${activeListId === null
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-200/60"
                        }`}
                >
                    All Words ({totalWords})
                </button>

                {lists.map(list => (
                    <button
                        key={list.id}
                        onClick={() => setActiveListId(list.id)}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${activeListId === list.id
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-200/60"
                            }`}
                    >
                        {list.name} ({list.words.length})
                    </button>
                ))}
            </div>
        </div>
    );
}

