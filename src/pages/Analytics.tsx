import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebase"
import type { User } from "firebase/auth"
import type { Word } from "../types/word"
import { getUserProgress } from "../utils/streakService"
import { getUserAnalytics } from "../utils/analyticsService"
import type { UserProgress } from "../types/userProgress"
import Header from "../features/learning/components/Header"

interface AnalyticsData {
    totalAttempts: number
    totalCorrect: number
    overallAccuracy: number
    accuracyByDay: { date: string; accuracy: number; total: number }[]
    hardestWordIds: string[]
    typeBreakdown: { flashcard: number; mcq: number; fill: number }
    uniqueWordsStudied: number
}

export default function Analytics({ user }: { user: User }) {
    const [progress, setProgress] = useState<UserProgress | null>(null)
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [hardestWords, setHardestWords] = useState<Word[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Inline the async loader to avoid missing-hook dependency warnings
        const loadData = async () => {
            setLoading(true)
            try {
                const [progressData, analyticsData] = await Promise.all([
                    getUserProgress(user.uid),
                    getUserAnalytics(user.uid)
                ])

                setProgress(progressData)
                setAnalytics(analyticsData)

                // Load hardest words details
                if (analyticsData.hardestWordIds.length > 0) {
                    const wordsRef = collection(db, "words")
                    const q = query(wordsRef, where("userId", "==", user.uid))
                    const snapshot = await getDocs(q)
                    const allWords = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Word))
                    const hardest = allWords.filter(w => analyticsData.hardestWordIds.includes(w.id))
                    setHardestWords(hardest)
                }
            } catch (error) {
                console.error("Error loading analytics:", error)
            } finally {
                setLoading(false)
            }
        }

        // only run when `user` changes
        loadData()
    }, [user])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">📊</div>
                    <p className="text-gray-600 font-medium">Đang tải thống kê...</p>
                </div>
            </div>
        )
    }

    if (!progress || !analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">Không có dữ liệu thống kê</p>
            </div>
        )
    }

    const accuracyPercent = Math.round(analytics.overallAccuracy * 100)
    const last7Days = analytics.accuracyByDay.slice(-7)

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Header user={user} simple />

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Thống kê học tập</h1>
                    <p className="text-gray-600">Theo dõi tiến độ và phân tích hiệu quả học tập của bạn</p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Streak */}
                    <div className="bg-linear-to-br from-orange-400 to-red-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="text-5xl mb-2">🔥</div>
                        <div className="text-3xl font-bold">{progress.currentStreak}</div>
                        <div className="text-sm opacity-90">Ngày liên tiếp</div>
                        <div className="text-xs mt-2 opacity-75">Kỷ lục: {progress.longestStreak} ngày</div>
                    </div>

                    {/* Total Words */}
                    <div className="bg-linear-to-br from-blue-400 to-cyan-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="text-5xl mb-2">📚</div>
                        <div className="text-3xl font-bold">{analytics.uniqueWordsStudied}</div>
                        <div className="text-sm opacity-90">Từ đã học</div>
                        <div className="text-xs mt-2 opacity-75">Tổng: {progress.totalWordsStudied} lượt</div>
                    </div>

                    {/* Accuracy */}
                    <div className="bg-linear-to-br from-green-400 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="text-5xl mb-2">🎯</div>
                        <div className="text-3xl font-bold">{accuracyPercent}%</div>
                        <div className="text-sm opacity-90">Độ chính xác</div>
                        <div className="text-xs mt-2 opacity-75">{analytics.totalCorrect}/{analytics.totalAttempts} đúng</div>
                    </div>

                    {/* Quizzes */}
                    <div className="bg-linear-to-br from-purple-400 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="text-5xl mb-2">✅</div>
                        <div className="text-3xl font-bold">{progress.totalQuizzesTaken}</div>
                        <div className="text-sm opacity-90">Bài kiểm tra</div>
                        <div className="text-xs mt-2 opacity-75">Hôm nay: {progress.todayProgress}/{progress.dailyGoal}</div>
                    </div>
                </div>

                {/* Quiz Type Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Accuracy Trend */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Xu hướng 7 ngày</h2>
                        <div className="space-y-3">
                            {last7Days.length > 0 ? last7Days.map((day, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="text-xs text-gray-500 w-20">{day.date.slice(5)}</div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="bg-linear-to-r from-green-400 to-emerald-500 h-full flex items-center justify-end pr-2 text-xs text-white font-bold transition-all"
                                            style={{ width: `${Math.round(day.accuracy * 100)}%` }}
                                        >
                                            {Math.round(day.accuracy * 100)}%
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 w-12">{day.total} từ</div>
                                </div>
                            )) : (
                                <p className="text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                            )}
                        </div>
                    </div>

                    {/* Quiz Type Breakdown */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">🎮 Loại câu hỏi</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">🃏 Flashcard</span>
                                    <span className="text-sm font-bold text-gray-800">{analytics.typeBreakdown.flashcard}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-linear-to-r from-cyan-400 to-blue-500 h-full"
                                        style={{ width: `${(analytics.typeBreakdown.flashcard / analytics.totalAttempts) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">📝 Trắc nghiệm</span>
                                    <span className="text-sm font-bold text-gray-800">{analytics.typeBreakdown.mcq}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-linear-to-r from-purple-400 to-pink-500 h-full"
                                        style={{ width: `${(analytics.typeBreakdown.mcq / analytics.totalAttempts) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">✍️ Điền từ</span>
                                    <span className="text-sm font-bold text-gray-800">{analytics.typeBreakdown.fill}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-linear-to-r from-green-400 to-emerald-500 h-full"
                                        style={{ width: `${(analytics.typeBreakdown.fill / analytics.totalAttempts) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hardest Words */}
                {hardestWords.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">😰 Từ khó nhất (cần ôn lại)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {hardestWords.slice(0, 6).map((word) => (
                                <div key={word.id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{word.term}</h3>
                                            <p className="text-sm text-gray-600">{word.shortMeaning}</p>
                                        </div>
                                        <span className="text-2xl">⚠️</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Motivational Message */}
                <div className="bg-linear-to-r from-fuchsia-500 to-purple-600 text-white rounded-2xl p-8 text-center shadow-lg">
                    <div className="text-6xl mb-4">
                        {progress.currentStreak >= 7 ? "🏆" : progress.currentStreak >= 3 ? "🌟" : "💪"}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        {progress.currentStreak >= 7
                            ? "Xuất sắc! Bạn đang rất kiên trì!"
                            : progress.currentStreak >= 3
                                ? "Tuyệt vời! Tiếp tục phát huy!"
                                : "Hãy học đều đặn mỗi ngày!"}
                    </h2>
                    <p className="opacity-90">
                        {accuracyPercent >= 80
                            ? "Độ chính xác của bạn rất cao. Hãy thử thách bản thân với nhiều từ mới hơn!"
                            : "Hãy tiếp tục luyện tập để cải thiện độ chính xác!"}
                    </p>
                </div>
            </div>
        </div>
    )
}
