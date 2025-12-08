import { useState, useEffect } from "react"
import { getUserProgress } from "../utils/streakService"
import type { UserProgress } from "../types/userProgress"

interface StreakDisplayProps {
    userId: string
}

export default function StreakDisplay({ userId }: StreakDisplayProps) {
    const [progress, setProgress] = useState<UserProgress | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                const data = await getUserProgress(userId)
                if (!cancelled) setProgress(data)
            } catch (error) {
                console.error("Error loading progress:", error)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [userId])

    if (loading || !progress) {
        return null
    }

    const progressPercent = Math.min(100, (progress.todayProgress / progress.dailyGoal) * 100)
    const isGoalReached = progress.todayProgress >= progress.dailyGoal

    return (
        <div className="flex items-center gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-2 bg-linear-to-r from-orange-100 to-red-100 px-3 py-1.5 rounded-full border border-orange-200">
                <span className="text-xl">🔥</span>
                <div className="flex flex-col">
                    <span className="text-xs text-orange-600 font-medium leading-none">Streak</span>
                    <span className="text-sm font-bold text-orange-700 leading-none">{progress.currentStreak} ngày</span>
                </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="flex items-center gap-2 bg-linear-to-r from-blue-100 to-cyan-100 px-3 py-1.5 rounded-full border border-blue-200">
                <span className="text-xl">{isGoalReached ? "🎯" : "📊"}</span>
                <div className="flex flex-col">
                    <span className="text-xs text-blue-600 font-medium leading-none">Hôm nay</span>
                    <span className="text-sm font-bold text-blue-700 leading-none">
                        {progress.todayProgress}/{progress.dailyGoal}
                    </span>
                </div>
                {/* Mini progress bar */}
                <div className="w-12 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

