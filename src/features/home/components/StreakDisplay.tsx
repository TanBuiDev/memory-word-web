import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../../../firebase"
import { getUserProgress } from "../../../utils/streakService"
import type { UserProgress } from "../../../types/userProgress"

interface StreakDisplayProps {
    userId: string
}

export default function StreakDisplay({ userId }: StreakDisplayProps) {
    const [progress, setProgress] = useState<UserProgress | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        // Initial load
        const loadInitial = async () => {
            try {
                const data = await getUserProgress(userId)
                setProgress(data)
                setLoading(false)
            } catch (error) {
                console.error("Error loading progress:", error)
                setLoading(false)
            }
        }

        loadInitial()

        // Set up real-time listener for automatic updates
        const progressRef = doc(db, "user_progress", userId)
        const unsubscribe = onSnapshot(
            progressRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setProgress(snapshot.data() as UserProgress)
                    setLoading(false)
                } else {
                    // Document doesn't exist, initialize it
                    getUserProgress(userId).then(data => {
                        setProgress(data)
                        setLoading(false)
                    })
                }
            },
            (error) => {
                console.error("Error listening to progress updates:", error)
                setLoading(false)
            }
        )

        return () => {
            unsubscribe()
        }
    }, [userId])

    if (loading || !progress) {
        return null
    }

    const isGoalReached = progress.todayProgress >= progress.dailyGoal

    return (
        <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 px-4 py-2.5 rounded-xl border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="relative">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🔥</span>
                    <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-orange-600 font-semibold leading-tight uppercase tracking-wide">Streak</span>
                    <span className="text-base font-bold text-orange-700 leading-tight">{progress.currentStreak} ngày</span>
                </div>
            </div>

            {/* Daily Goal Progress */}
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 group ${isGoalReached
                ? 'bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-emerald-200/60'
                : 'bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-blue-200/60'
                }`}>
                <div className="relative">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{isGoalReached ? "🎯" : "📊"}</span>
                    <div className={`absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isGoalReached ? 'bg-emerald-400/20' : 'bg-blue-400/20'
                        }`}></div>
                </div>
                <div className="flex flex-col">
                    <span className={`text-xs font-semibold leading-tight uppercase tracking-wide ${isGoalReached ? 'text-emerald-600' : 'text-blue-600'
                        }`}>Hôm nay</span>
                    <span className={`text-base font-bold leading-tight ${isGoalReached ? 'text-emerald-700' : 'text-blue-700'
                        }`}>
                        {progress.todayProgress}/{progress.dailyGoal}
                    </span>
                </div>
            </div>
        </div>
    )
}

