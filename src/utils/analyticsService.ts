import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "../firebase"
import type { WordStats } from "../types/userProgress"

/**
 * Calculate word statistics from interaction logs
 */
export async function getWordStats(userId: string, wordId: string): Promise<WordStats | null> {
    const logsRef = collection(db, "interaction_log")
    const q = query(
        logsRef,
        where("userId", "==", userId),
        where("wordId", "==", wordId),
        where("type", "in", ["quiz_flashcard", "quiz_mcq", "quiz_fill"])
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
        return null
    }
    
    let totalAttempts = 0
    let correctAttempts = 0
    let firstAttempt = Infinity
    let lastAttempt = 0
    
    snapshot.forEach(doc => {
        const data = doc.data()
        totalAttempts++
        
        if (data.extra?.correct) {
            correctAttempts++
        }
        
        const timestamp = data.timestamp?.toMillis?.() || data.timestamp || 0
        if (timestamp < firstAttempt) firstAttempt = timestamp
        if (timestamp > lastAttempt) lastAttempt = timestamp
    })
    
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0
    
    // Determine difficulty level
    let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium'
    if (accuracy >= 0.8) difficultyLevel = 'easy'
    else if (accuracy < 0.5) difficultyLevel = 'hard'
    
    // Simple Leitner box calculation
    let box = 0
    if (accuracy >= 0.9 && totalAttempts >= 5) box = 3
    else if (accuracy >= 0.7 && totalAttempts >= 3) box = 2
    else if (totalAttempts >= 1) box = 1
    
    // Calculate next review time (simple spaced repetition)
    const intervals = [0, 1, 3, 7, 14]  // days
    const nextReview = lastAttempt + (intervals[box] * 24 * 60 * 60 * 1000)
    
    return {
        wordId,
        userId,
        totalAttempts,
        correctAttempts,
        accuracy,
        lastAttempt: lastAttempt || Date.now(),
        firstAttempt: firstAttempt === Infinity ? Date.now() : firstAttempt,
        difficultyLevel,
        box,
        nextReview
    }
}

/**
 * Get overall analytics for user
 */
export async function getUserAnalytics(userId: string) {
    const logsRef = collection(db, "interaction_log")
    const q = query(
        logsRef,
        where("userId", "==", userId),
        where("type", "in", ["quiz_flashcard", "quiz_mcq", "quiz_fill"]),
        orderBy("timestamp", "desc"),
        limit(1000)  // Last 1000 quiz attempts
    )
    
    const snapshot = await getDocs(q)
    
    const wordMap = new Map<string, { correct: number; total: number }>()
    const dailyMap = new Map<string, { correct: number; total: number }>()
    const typeMap = { flashcard: 0, mcq: 0, fill: 0 }
    
    let totalCorrect = 0
    let totalAttempts = 0
    
    snapshot.forEach(doc => {
        const data = doc.data()
        const wordId = data.wordId
        const isCorrect = data.extra?.correct || false
        const timestamp = data.timestamp?.toMillis?.() || data.timestamp || Date.now()
        const date = new Date(timestamp).toISOString().split('T')[0]
        const type = data.type.replace('quiz_', '') as 'flashcard' | 'mcq' | 'fill'
        
        // Word stats
        if (!wordMap.has(wordId)) {
            wordMap.set(wordId, { correct: 0, total: 0 })
        }
        const wordStat = wordMap.get(wordId)!
        wordStat.total++
        if (isCorrect) wordStat.correct++
        
        // Daily stats
        if (!dailyMap.has(date)) {
            dailyMap.set(date, { correct: 0, total: 0 })
        }
        const dayStat = dailyMap.get(date)!
        dayStat.total++
        if (isCorrect) dayStat.correct++
        
        // Type stats
        typeMap[type]++
        
        // Overall stats
        totalAttempts++
        if (isCorrect) totalCorrect++
    })
    
    // Calculate accuracy by day
    const accuracyByDay = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
            date,
            accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
            total: stats.total
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    
    // Find hardest words (lowest accuracy)
    const wordAccuracies = Array.from(wordMap.entries())
        .map(([wordId, stats]) => ({
            wordId,
            accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
            attempts: stats.total
        }))
        .filter(w => w.attempts >= 3)  // Only words with 3+ attempts
        .sort((a, b) => a.accuracy - b.accuracy)
    
    const hardestWordIds = wordAccuracies.slice(0, 10).map(w => w.wordId)
    
    return {
        totalAttempts,
        totalCorrect,
        overallAccuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
        accuracyByDay,
        hardestWordIds,
        typeBreakdown: typeMap,
        uniqueWordsStudied: wordMap.size
    }
}

