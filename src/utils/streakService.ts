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
    
    await updateDoc(progressRef, {
        currentStreak: newStreak,
        longestStreak: isNewRecord ? newStreak : progress.longestStreak,
        lastStudyDate: today,
        todayProgress: 0,  // Reset daily progress
        updatedAt: Date.now()
    })
    
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
 * Record quiz completion
 */
export async function recordQuizCompletion(
    userId: string, 
    correctCount: number, 
    totalCount: number
): Promise<void> {
    const progressRef = doc(db, "user_progress", userId)
    
    await updateDoc(progressRef, {
        totalQuizzesTaken: increment(1),
        totalCorrectAnswers: increment(correctCount),
        todayProgress: increment(totalCount),
        totalWordsStudied: increment(totalCount),
        updatedAt: Date.now()
    })
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

