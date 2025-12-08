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
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeListId === null
                        ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    All Words ({totalWords})
                </button>

                {lists.map(list => (
                    <button
                        key={list.id}
                        onClick={() => setActiveListId(list.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeListId === list.id
                            ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {list.name} ({list.words.length})
                    </button>
                ))}
            </div>
        </div>
    );
}

