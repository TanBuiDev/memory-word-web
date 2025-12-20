import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore"
import { db } from "../firebase"
import type { UserProgress } from "../types/userProgress"

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayString(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterdayString(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
}

/**
 * Initialize user progress document if it doesn't exist
 */
export async function initializeUserProgress(userId: string): Promise<UserProgress> {
    const progressRef = doc(db, "user_progress", userId)
    const progressSnap = await getDoc(progressRef)
    
    if (progressSnap.exists()) {
        return progressSnap.data() as UserProgress
    }
    
    // Create new progress document
    const newProgress: UserProgress = {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: "",
        dailyGoal: 20,  // Default: 20 words per day
        todayProgress: 0,
        totalWordsStudied: 0,
        totalQuizzesTaken: 0,
        totalCorrectAnswers: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
    
    await setDoc(progressRef, newProgress)
    return newProgress
}

/**
 * Get user progress
 */
export async function getUserProgress(userId: string): Promise<UserProgress> {
    const progressRef = doc(db, "user_progress", userId)
    const progressSnap = await getDoc(progressRef)
    
    if (!progressSnap.exists()) {
        return await initializeUserProgress(userId)
    }
    
    return progressSnap.data() as UserProgress
}

/**
 * Update streak when user studies
 */
export async function updateStreak(userId: string): Promise<{ 
    currentStreak: number
    isNewRecord: boolean
    streakBroken: boolean
}> {
    const progressRef = doc(db, "user_progress", userId)
    const progress = await getUserProgress(userId)
    
    const today = getTodayString()
    const yesterday = getYesterdayString()
    
    let newStreak = progress.currentStreak
    let streakBroken = false
    
    // If already studied today, don't update streak
    if (progress.lastStudyDate === today) {
        return {
            currentStreak: newStreak,
            isNewRecord: false,
            streakBroken: false
        }
    }
    
    // Check if streak continues
    if (progress.lastStudyDate === yesterday) {
        // Streak continues!
        newStreak = progress.currentStreak + 1
    } else if (progress.lastStudyDate === "") {
        // First time studying
        newStreak = 1
    } else {
        // Streak broken 💔
        newStreak = 1
        streakBroken = true
    }
    
    const isNewRecord = newStreak > progress.longestStreak
    
    // Only reset todayProgress if this is a new day (streak was updated)
    // Don't reset if user already studied today
    const updateData: any = {
        currentStreak: newStreak,
        longestStreak: isNewRecord ? newStreak : progress.longestStreak,
        lastStudyDate: today,
        updatedAt: Date.now()
    }
    
    // Only reset todayProgress if lastStudyDate changed (new day)
    if (progress.lastStudyDate !== today) {
        updateData.todayProgress = 0
    }
    
    await updateDoc(progressRef, updateData)
    
    return {
        currentStreak: newStreak,
        isNewRecord,
        streakBroken
    }
}

/**
 * Increment today's progress
 */
export async function incrementDailyProgress(userId: string, wordsCount: number = 1): Promise<void> {
    const progressRef = doc(db, "user_progress", userId)
    
    await updateDoc(progressRef, {
        todayProgress: increment(wordsCount),
        totalWordsStudied: increment(wordsCount),
        updatedAt: Date.now()
    })
}

/**
 * Record quiz completion and update XP for leaderboard
 */
export async function recordQuizCompletion(
    userId: string, 
    correctCount: number, 
    totalCount: number
): Promise<void> {
    const progressRef = doc(db, "user_progress", userId)
    const userRef = doc(db, "users", userId)
    
    // Calculate XP: 10 XP per correct answer, 5 XP per question attempted
    const xpGained = (correctCount * 10) + (totalCount * 5)
    
    // Update user_progress
    await updateDoc(progressRef, {
        totalQuizzesTaken: increment(1),
        totalCorrectAnswers: increment(correctCount),
        todayProgress: increment(totalCount),
        totalWordsStudied: increment(totalCount),
        updatedAt: Date.now()
    })
    
    // Update users collection for leaderboard
    try {
        // Get current week start (Monday)
        const now = new Date()
        const dayOfWeek = now.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - daysToMonday)
        weekStart.setHours(0, 0, 0, 0)
        const weekStartTimestamp = weekStart.getTime()
        
        // Get user document to check last week reset
        const userSnap = await getDoc(userRef)
        const userData = userSnap.exists() ? userSnap.data() : null
        const currentStats = userData?.stats || {}
        const lastWeekReset = currentStats.lastWeekReset || 0
        
        // Check if we need to reset weekly XP (new week)
        const isNewWeek = weekStartTimestamp > lastWeekReset
        
        // Calculate new values
        const newWeeklyXP = isNewWeek ? xpGained : ((currentStats.weeklyXP || 0) + xpGained)
        const newTotalXP = (currentStats.totalXP || 0) + xpGained
        const newWordsLearned = (currentStats.wordsLearned || 0) + totalCount
        
        // If user document doesn't exist, create it
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                displayName: userData?.displayName || "Anonymous",
                email: userData?.email || "",
                photoURL: userData?.photoURL || null,
                stats: {
                    weeklyXP: xpGained,
                    totalXP: xpGained,
                    streak: currentStats.streak || 0,
                    wordsLearned: totalCount,
                    lastActive: new Date().toISOString(),
                    lastWeekReset: weekStartTimestamp
                }
            })
        } else {
            // Update existing user document with calculated values
            await updateDoc(userRef, {
                [`stats.weeklyXP`]: newWeeklyXP,
                [`stats.totalXP`]: newTotalXP,
                [`stats.wordsLearned`]: newWordsLearned,
                [`stats.lastActive`]: new Date().toISOString(),
                [`stats.lastWeekReset`]: isNewWeek ? weekStartTimestamp : lastWeekReset
            })
        }
    } catch (error) {
        // Non-critical error - log but don't fail the quiz completion
        console.warn("Failed to update user stats for leaderboard:", error)
    }
}

/**
 * Update daily goal
 */
export async function updateDailyGoal(userId: string, newGoal: number): Promise<void> {
    const progressRef = doc(db, "user_progress", userId)
    
    await updateDoc(progressRef, {
        dailyGoal: newGoal,
        updatedAt: Date.now()
    })
}

