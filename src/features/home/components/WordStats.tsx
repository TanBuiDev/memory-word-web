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
    return (
        <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3">
                    <div className="text-2xl font-bold text-indigo-700">{totalWords}</div>
                    <div className="text-sm text-gray-600">Total Words</div>
                </div>
                <div className="text-center p-3">
                    <div className="text-2xl font-bold text-green-600">
                        {memorizedCount}
                    </div>
                    <div className="text-sm text-gray-600">Memorized</div>
                </div>
                <div className="text-center p-3">
                    <div className="text-2xl font-bold text-purple-600">{listCount}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                </div>
            </div>
        </div>
    );
}

