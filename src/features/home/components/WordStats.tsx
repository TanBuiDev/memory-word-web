import { BookOpen, CheckCircle2, FolderOpen, TrendingUp } from "lucide-react"

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
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200/50 hover:shadow-md transition-all duration-300 group">
                <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Total Words</div>
                    <div className="text-2xl font-bold text-indigo-700">{totalWords}</div>
                </div>
                <div className="p-3 bg-indigo-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6 text-indigo-700" />
                </div>
            </div>

            {/* Memorized */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-300 group">
                <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Memorized</div>
                    <div className="text-2xl font-bold text-green-700">{memorizedCount}</div>
                </div>
                <div className="p-3 bg-green-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="h-6 w-6 text-green-700" />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Progress</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-700">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-300 group">
                <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Categories</div>
                    <div className="text-2xl font-bold text-purple-700">{listCount}</div>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FolderOpen className="h-6 w-6 text-purple-700" />
                </div>
            </div>
        </div>
    );
}

