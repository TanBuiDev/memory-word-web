/**
 * User progress tracking for streak system and daily goals
 */
export interface UserProgress {
    userId: string
    
    // Streak tracking
    currentStreak: number
    longestStreak: number
    lastStudyDate: string  // YYYY-MM-DD format
    
    // Daily goals
    dailyGoal: number      // Number of words to study per day
    todayProgress: number  // Words studied today
    
    // Statistics
    totalWordsStudied: number
    totalQuizzesTaken: number
    totalCorrectAnswers: number
    
    // Timestamps
    createdAt: number
    updatedAt: number
}

/**
 * Daily statistics for analytics
 */
export interface DailyStats {
    date: string  // YYYY-MM-DD
    userId: string
    
    wordsStudied: number
    quizzesTaken: number
    correctAnswers: number
    totalAnswers: number
    accuracy: number  // 0-1
    
    timeSpent: number  // seconds
    
    // Breakdown by quiz type
    flashcardCount: number
    mcqCount: number
    fillCount: number
}

/**
 * Word performance analytics
 */
export interface WordStats {
    wordId: string
    userId: string
    
    totalAttempts: number
    correctAttempts: number
    accuracy: number  // 0-1
    
    lastAttempt: number  // timestamp
    firstAttempt: number  // timestamp
    
    // Difficulty level based on performance
    difficultyLevel: 'easy' | 'medium' | 'hard'
    
    // Leitner box (for spaced repetition)
    box: number  // 0-4
    nextReview: number  // timestamp
}

