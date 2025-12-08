import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db, auth } from "../firebase"

export type QuizLogType = "flashcard" | "mcq" | "fill";

/**
 * Ghi log kết quả quiz vào Firestore collection 'interaction_log'
 * để AI model có thể phân tích và dự đoán
 */
export async function logQuiz(
    wordId: string,
    type: QuizLogType,
    correct: boolean
) {
    const userId = auth.currentUser?.uid
    if (!userId) {
        console.error("Cannot log quiz: user not authenticated")
        return
    }

    try {
        await addDoc(collection(db, "interaction_log"), {
            userId,
            wordId,
            type: `quiz_${type}`,  // quiz_flashcard, quiz_mcq, quiz_fill
            timestamp: serverTimestamp(),
            extra: {
                correct,
                quizType: type
            }
        })
    } catch (error) {
        console.error("Error logging quiz result:", error)
    }
}