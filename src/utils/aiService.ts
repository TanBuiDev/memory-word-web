import type { Word } from "../types/word"
import { getFunctions, httpsCallable } from "firebase/functions"
import { app } from "../firebase"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

// Mở rộng type Word để thêm thuộc tính p_recall (xác suất nhớ)
export type WordWithRecall = Word & { p_recall?: number }

// Initialize Firebase Functions với region asia-southeast1
const functions = getFunctions(app, 'asia-southeast1')
const predictRecall = httpsCallable(functions, 'predict_recall')

/**
 * Gọi Firebase Function để dự đoán xác suất nhớ từ bằng LSTM model
 * Dựa trên lịch sử quiz của user
 * 
 * OPTIMIZED: Uses cached p_recall from Firestore first, only predicts words that need updates.
 * This allows the quiz to start immediately (no waiting for API calls).
 */
export const getSmartQuizList = async (words: Word[]): Promise<WordWithRecall[]> => {
    console.log(`🧠 Analyzing ${words.length} words with AI model...`)
    
    // Step 1: Use cached p_recall from Firestore immediately (fast path - no API calls)
    const wordsWithCachedRecall: WordWithRecall[] = words.map(word => ({
        ...word,
        p_recall: typeof word.p_recall === 'number' ? word.p_recall : undefined
    }))

    // Step 2: Identify words that need fresh predictions (only words without p_recall)
    // Limit to 15 words max to control costs and speed
    const wordsNeedingPrediction = wordsWithCachedRecall
        .filter(w => w.p_recall === undefined || w.p_recall === null)
        .slice(0, 15) // Limit predictions (cost control)

    const cachedCount = wordsWithCachedRecall.length - wordsNeedingPrediction.length
    console.log(`📊 Using cached p_recall for ${cachedCount} words (instant)`)
    if (wordsNeedingPrediction.length > 0) {
        console.log(`🔄 Predicting fresh p_recall for ${wordsNeedingPrediction.length} words (background)`)
    }

    // Step 3: Start predictions in background (non-blocking)
    // These will update Firestore for next time, but we don't wait for them
    if (wordsNeedingPrediction.length > 0) {
        // Fire and forget - update Firestore in background
        Promise.all(
            wordsNeedingPrediction.map(async (word) => {
                try {
                    const result = await predictRecall({ wordId: word.id })
                    const data = result.data as { p_recall?: number; status?: string; error?: string }
                    
                    if (!data.error && typeof data.p_recall === 'number') {
                        // Update Firestore in background (for next quiz session)
                        // Note: This is done in SmartQuiz.tsx after getting results
                        return { wordId: word.id, p_recall: data.p_recall }
                    }
                    return { wordId: word.id, p_recall: getFallbackRecall(word) }
                } catch {
                    return { wordId: word.id, p_recall: getFallbackRecall(word) }
                }
            })
        ).then(predictions => {
            console.log(`✅ Background predictions completed for ${predictions.length} words`)
        }).catch(() => {
            // Silently ignore background prediction errors
        })
    }

    // Step 4: Return immediately with cached values + fallback for missing ones
    const results = wordsWithCachedRecall.map(word => {
        // If word has cached p_recall, use it
        if (typeof word.p_recall === 'number') {
            return word
        }
        // Otherwise use fallback (will be updated in background for next time)
        return { 
            ...word, 
            p_recall: getFallbackRecall(word) 
        }
    })

    // Previously we returned a strict sort by p_recall (lowest first). That makes
    // a few very-low-p_recall words dominate the sessions when gaps are large.
    // Instead, sample without replacement using soft weights so medium-difficulty
    // words also appear and we avoid repeating the same handful.

    // Parameters you can tune
    const BETA = 1.4 // >1 focuses more on low p_recall, <1 flattens distribution
    const P_MIN = 0.01
    const P_MAX = 0.99

    // Build arrays for sampling weights
    const pool = results.slice() // copy
    const weights = pool.map(w => {
        const p = Math.max(P_MIN, Math.min(P_MAX, w.p_recall ?? 0.5))
        // weight proportional to (1 - p)^beta so lower recall -> higher weight
        return Math.pow(1 - p, BETA)
    })

    // Weighted sampling without replacement
    const sampled: WordWithRecall[] = []
    while (pool.length > 0) {
        const total = weights.reduce((s, x) => s + x, 0)
        if (total <= 0) {
            // fallback: append rest
            sampled.push(...pool)
            break
        }
        let r = Math.random() * total
        let idx = 0
        for (; idx < weights.length; idx++) {
            if (r <= weights[idx]) break
            r -= weights[idx]
        }
        if (idx >= pool.length) idx = pool.length - 1
        sampled.push(pool.splice(idx, 1)[0])
        weights.splice(idx, 1)
    }

    console.log(`✅ Smart quiz list ready. Top priority (sampled): ${sampled[0]?.term} (${Math.round(((sampled[0]?.p_recall || 0) * 100))}%)`)
    return sampled
}

/**
 * Heuristic dự phòng khi AI model lỗi hoặc không khả dụng
 */
function getFallbackRecall(word: Word): number {
    const now = Date.now()
    const daysOld = (now - (word.createdAtClient || now)) / (1000 * 60 * 60 * 24)

    if (word.memorized) {
        // Đã thuộc -> recall cao nhưng giảm dần theo thời gian
        return Math.max(0.7, 1 - (daysOld * 0.01))
    } else {
        // Chưa thuộc -> recall thấp
        return Math.max(0.1, 0.5 - (daysOld * 0.05))
    }
}

/**
 * Warm up the Cloud Function by calling predict_recall with a dummy wordId.
 * This pre-loads the LSTM model in the background so it's ready when the user
 * navigates to Smart Quiz. Non-blocking and silent (errors are ignored).
 * 
 * @param wordId Optional real wordId to use. If not provided, uses a dummy ID.
 */
export const warmUpAIModel = async (wordId?: string): Promise<void> => {
    try {
        // Use a dummy wordId if none provided - the function will still load the model
        // even if the word doesn't exist (it will return p_recall: 0.0 for new words)
        const dummyWordId = wordId || "__warmup__"
        
        // Fire and forget - don't await, don't log errors to console
        predictRecall({ wordId: dummyWordId }).catch(() => {
            // Silently ignore errors - this is just a warm-up call
        })
        
        console.log("🔥 AI model warm-up initiated (background)")
    } catch {
        // Silently ignore - warm-up failures shouldn't affect the app
    }
}

/**
 * Update word's p_recall by calling AI model with latest interaction history.
 * This is called AFTER a user answers a question to ensure the word's p_recall
 * reflects the most recent learning state for the next quiz session.
 * 
 * Flow:
 * 1. User answers question -> interaction_log is saved
 * 2. This function calls predict_recall (which reads latest interaction_log)
 * 3. AI model calculates new p_recall based on updated history
 * 4. New p_recall is saved to Firestore word document
 * 5. Next quiz session uses this updated p_recall value
 * 
 * @param wordId The word ID to update
 * @returns Promise that resolves with the new p_recall value (or undefined if failed)
 */
export const updateWordRecall = async (wordId: string): Promise<number | undefined> => {
    try {
        console.log(`🔄 Updating p_recall for word: ${wordId}`)
        
        // Call AI model to recalculate p_recall with latest interaction history
        const result = await predictRecall({ wordId })
        const data = result.data as { p_recall?: number; status?: string; error?: string }
        
        if (data.error) {
            console.warn(`⚠️ Error updating p_recall for word ${wordId}:`, data.error)
            return undefined
        }
        
        const newPRecall = data.p_recall
        if (typeof newPRecall !== 'number') {
            console.warn(`⚠️ Invalid p_recall value for word ${wordId}:`, newPRecall)
            return undefined
        }
        
        // Update Firestore with new p_recall value
        try {
            await updateDoc(doc(db, "words", wordId), {
                p_recall: newPRecall
            })
            console.log(`✅ Updated p_recall for word ${wordId}: ${Math.round(newPRecall * 100)}%`)
            return newPRecall
        } catch (firestoreError) {
            console.error(`❌ Failed to update Firestore for word ${wordId}:`, firestoreError)
            return newPRecall // Return value even if Firestore update fails
        }
    } catch (err) {
        console.error(`❌ Failed to update p_recall for word ${wordId}:`, err)
        return undefined
    }
}