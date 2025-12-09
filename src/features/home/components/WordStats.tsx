interface WordStatsProps {
    totalWords: number;
    memorizedCount: number;
    listCount: number;
}

export default function WordStats({
    totalWords,
    memorizedCount,
    listCount
}: WordStatsProps) {
    const percentage = totalWords > 0 ? Math.round((memorizedCount / totalWords) * 100) : 0

    return (
        <div className="space-y-3">
            {/* Total Words */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
                <div>
                    <div className="text-xs text-gray-600 font-medium">Total Words</div>
                    <div className="text-2xl font-bold text-indigo-700">{totalWords}</div>
                </div>
                <div className="p-3 bg-indigo-200 rounded-lg">
                    <span className="text-2xl">📚</span>
                </div>
            </div>

            {/* Memorized */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div>
                    <div className="text-xs text-gray-600 font-medium">Memorized</div>
                    <div className="text-2xl font-bold text-green-700">{memorizedCount}</div>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                    <span className="text-2xl">✓</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600 font-medium">Progress</span>
                    <span className="text-sm font-bold text-indigo-700">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div>
                    <div className="text-xs text-gray-600 font-medium">Categories</div>
                    <div className="text-2xl font-bold text-purple-700">{listCount}</div>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                    <span className="text-2xl">📁</span>
                </div>
            </div>
        </div>
    );
}

