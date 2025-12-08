import { useState, useEffect } from "react"
import { collection, getDocs, query, where, updateDoc, doc, addDoc, serverTimestamp, increment } from "firebase/firestore"
import { db } from "../firebase"
import type { User } from "firebase/auth"
import type { Word } from "../types/word"
import { getSmartQuizList, updateWordRecall, type WordWithRecall } from "../utils/aiService"
import { updateStreak, recordQuizCompletion } from "../utils/streakService"

import Flashcard from "../components/quiz/Flashcard"
import MultipleChoice from "../components/quiz/MultipleChoice"
import FillInBlank from "../components/quiz/FillInBlank"
import Header from "../components/Header"
import StreakCelebration from "../components/StreakCelebration"
import WelcomeModal from "../components/WelcomeModal"
import { Link } from "react-router-dom"

interface QuizResult {
    word: WordWithRecall
    isCorrect: boolean
}

export default function SmartQuiz({ user }: { user: User }) {
    const [quizQueue, setQuizQueue] = useState<WordWithRecall[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [currentIndex, setCurrentIndex] = useState(0)
    const [mode, setMode] = useState<"flashcard" | "mcq" | "fill">("mcq")
    const [isAnswering, setIsAnswering] = useState(false)

    const [quizFinished, setQuizFinished] = useState(false)
    const [score, setScore] = useState(0)
    // rawWordsData removed: we now always refresh from Firestore when starting sessions

    const [results, setResults] = useState<QuizResult[]>([])
    const [showDetail, setShowDetail] = useState(false)

    const [showStreakCelebration, setShowStreakCelebration] = useState(false)
    const [streakData, setStreakData] = useState<{ streak: number; isNewRecord: boolean } | null>(null)
    const [showWelcomeModal, setShowWelcomeModal] = useState(false)

    const startQuizSession = async (wordsInput: Word[]) => {
        // Reset answering state when starting a new quiz session
        setIsAnswering(false)
        setLoading(true)
        try {
            // Use the passed wordsInput to produce the smart list
            // OPTIMIZED: Returns immediately with cached p_recall values
            const smartList = await getSmartQuizList(wordsInput)

            // Start quiz immediately (don't wait for Firestore updates)
            setQuizQueue(smartList.slice(0, 10))
            setCurrentIndex(0)
            setScore(0)
            setResults([])
            setShowDetail(false)
            setQuizFinished(false)
            setLoading(false) // Hide loading immediately

            // Write back p_recall to Firestore in background (non-blocking)
            // This updates the cache for next time and updates Sidebar aggregate
            Promise.all(
                smartList
                    .filter(w => typeof w.p_recall === 'number' && w.id)
                    .map(w => updateDoc(doc(db, "words", w.id), { p_recall: w.p_recall }))
            ).catch(e => {
                // non-critical, just log
                console.warn("Failed to update p_recall in Firestore (background):", e)
            })
        } catch (err) {
            console.error(err)
            setError("Lỗi khi tạo bài học mới.")
            setLoading(false)
        }
    }

    // Re-fetch latest words from Firestore before starting a quiz session.
    // This prevents using stale `rawWordsData` that may not reflect recent
    // memorized updates (avoids repeating just-learned words).
    const refreshAndStartQuiz = async () => {
        setLoading(true)
        setError(null)
        try {
            console.log(`👤 Current user UID: ${user.uid}`)
            const q = query(collection(db, "words"), where("userId", "==", user.uid))
            const snap = await getDocs(q)
            const freshWords = snap.docs.map(d => ({ id: d.id, ...d.data() } as Word))

            console.log(`📚 Loaded ${freshWords.length} fresh words for quiz`)
            await startQuizSession(freshWords)
        } catch (err) {
            console.error("Error refreshing words before starting quiz:", err)
            setError("Không thể tải từ mới. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        async function initSmartQuiz() {
            setLoading(true)
            setError(null)
            try {
                console.log(`🚀 Initializing Smart Quiz for user: ${user.uid}`)

                // Check if user has seen the welcome modal
                const hasSeenWelcome = localStorage.getItem(`smartQuizWelcome_${user.uid}`)
                if (!hasSeenWelcome) {
                    setShowWelcomeModal(true)
                }

                const q = query(collection(db, "words"), where("userId", "==", user.uid))
                const snap = await getDocs(q)
                const rawWords = snap.docs.map(d => ({ id: d.id, ...d.data() } as Word))

                console.log(`📚 Loaded ${rawWords.length} words from Firestore`)

                if (rawWords.length === 0) {
                    console.log(`⚠️ No words found for user`)
                    setLoading(false)
                    return
                }

                await startQuizSession(rawWords)
            } catch (err) {
                console.error("Error initializing Smart Quiz:", err)
                setError("Không thể tải Smart Quiz. Vui lòng thử lại sau.")
                setLoading(false)
            }
        }
        initSmartQuiz()
    }, [user])

    const handleWelcomeClose = () => {
        if (user) {
            localStorage.setItem(`smartQuizWelcome_${user.uid}`, "true")
        }
        setShowWelcomeModal(false)
    }

    const handleWelcomeStart = () => {
        handleWelcomeClose()
        // Quiz will start automatically after modal closes
    }

    const handleNext = async (isCorrect: boolean = true) => {
        // Prevent double-submission
        if (isAnswering) return
        setIsAnswering(true)

        const currentIdx = currentIndex
        const currentWord = quizQueue[currentIdx]

        // Update score immediately
        if (isCorrect) {
            setScore(prev => prev + 1)
        }

        // Update results and maybe record quiz completion
        setResults(prev => {
            const newResults = [...prev, { word: currentWord, isCorrect }]
            if (currentIdx + 1 >= quizQueue.length) {
                const correctCount = newResults.filter(r => r.isCorrect).length
                handleQuizComplete(correctCount, newResults.length)
            }
            return newResults
        })

        // Record interaction to Firestore (server-side trigger will recompute stats)
        try {
            await addDoc(collection(db, "interaction_log"), {
                userId: user.uid,
                wordId: currentWord.id,
                type: `quiz_${mode}`,
                correct: !!isCorrect,
                timestamp: serverTimestamp(),
                extra: { mode: mode }
            })
        } catch (err) {
            console.warn("Failed to record interaction:", err)
        }

        // Optimistic update: increment seen count and set last seen/result so UI shows stats immediately.
        try {
            await updateDoc(doc(db, "words", currentWord.id), {
                seenCount: increment(1),
                lastSeenAt: serverTimestamp(),
                lastResult: isCorrect ? 'correct' : 'wrong'
            })
        } catch (e) {
            console.warn("Optimistic update failed:", e)
        }

        // Update p_recall in background after interaction is saved
        // This ensures the word's p_recall reflects the latest learning state for next quiz
        // Non-blocking: doesn't affect current quiz flow
        updateWordRecall(currentWord.id).catch(err => {
            // Silently ignore errors - this is background update, shouldn't block quiz
            console.warn("Background p_recall update failed (non-critical):", err)
        })

        // Move to next question or finish
        if (currentIdx + 1 < quizQueue.length) {
            setCurrentIndex(currentIdx + 1)
            // Reset answering state after a short delay
            setTimeout(() => setIsAnswering(false), 100)
        } else {
            setQuizFinished(true)
        }
    }

    const handleQuizComplete = async (correctCount: number, totalCount: number) => {
        try {
            // Record quiz completion and update streak
            const [, streakResult] = await Promise.all([
                recordQuizCompletion(user.uid, correctCount, totalCount),
                updateStreak(user.uid)
            ])

            console.log(`✅ Quiz completed: ${correctCount}/${totalCount}`)

            // Show celebration if streak is significant (3+ days) or new record
            if (streakResult.currentStreak >= 3 || streakResult.isNewRecord) {
                setStreakData({
                    streak: streakResult.currentStreak,
                    isNewRecord: streakResult.isNewRecord
                })
                setShowStreakCelebration(true)
            }
            // Save session average p_recall to localStorage so Home/Sidebar can surface it
            try {
                const recalls = results.map(r => typeof r.word.p_recall === 'number' ? r.word.p_recall : NaN).filter(v => !Number.isNaN(v))
                if (recalls.length > 0 && user) {
                    const avg = Math.round((recalls.reduce((a, b) => a + b, 0) / recalls.length) * 100)
                    localStorage.setItem(`lastQuizRecall_${user.uid}`, String(avg))
                }
            } catch {
                // non-critical
            }
        } catch (error) {
            console.error("Error recording quiz completion:", error)
        }
    }

    const handleFinishEarly = async () => {
        if (results.length === 0) {
            alert("Bạn chưa trả lời câu hỏi nào!")
            return
        }

        const confirmFinish = window.confirm(
            `Bạn đã trả lời ${results.length}/${quizQueue.length} câu hỏi.\n\nBạn có chắc muốn kết thúc bài học sớm không?`
        )

        if (!confirmFinish) return

        // Calculate score from answered questions
        const correctCount = results.filter(r => r.isCorrect).length

        // Recalculate p_recall for answered words using AI
        try {
            console.log(`🔄 Recalculating p_recall for ${results.length} answered words...`)

            // Get fresh words data for answered words
            const answeredWordIds = results.map(r => r.word.id)
            const q = query(collection(db, "words"), where("userId", "==", user.uid))
            const snap = await getDocs(q)
            const allWords = snap.docs.map(d => ({ id: d.id, ...d.data() } as Word))
            const answeredWords = allWords.filter(w => answeredWordIds.includes(w.id))

            // Recalculate p_recall using AI
            const updatedWords = await getSmartQuizList(answeredWords)

            // Update p_recall in Firestore for answered words
            const batch = []
            for (const w of updatedWords) {
                if (typeof w.p_recall === 'number' && w.id) {
                    batch.push(updateDoc(doc(db, "words", w.id), { p_recall: w.p_recall }))
                }
            }
            await Promise.all(batch)

            console.log(`✅ Updated p_recall for ${updatedWords.length} words`)
        } catch (err) {
            console.warn("Failed to recalculate p_recall:", err)
        }

        // Complete the quiz
        await handleQuizComplete(correctCount, results.length)
        setQuizFinished(true)
    }

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 space-y-4">
            <div className="animate-spin text-4xl">🤖</div>
            <p className="text-indigo-600 font-medium">AI đang tối ưu lộ trình học cho bạn...</p>
        </div>
    )

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 space-y-4">
            <div className="text-6xl">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700">Thử lại</button>
        </div>
    )

    if (quizQueue.length === 0 && !loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
            <div className="text-6xl">📚</div>
            <p className="text-gray-600 font-medium">Bạn chưa có từ vựng nào để học!</p>
            <Link to="/" className="text-fuchsia-600 hover:underline">Về trang chủ thêm từ</Link>
        </div>
    )

    if (quizFinished) {
        if (showDetail) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Header user={user} simple />
                    <div className="max-w-2xl mx-auto w-full p-4 pb-20">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Chi tiết kết quả</h2>
                            <button onClick={() => setShowDetail(false)} className="text-fuchsia-600 font-medium hover:underline">⬅ Quay lại</button>
                        </div>
                        <div className="space-y-4">
                            {results.map((res, idx) => (
                                <div key={idx} className={`bg-white p-4 rounded-xl border-l-8 shadow-sm ${res.isCorrect ? "border-green-500" : "border-red-500"}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{res.word.term}</h3>
                                            <p className="text-gray-600">{res.word.phonetic}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${res.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {res.isCorrect ? "Đúng" : "Sai"}
                                        </span>
                                    </div>
                                    {!res.isCorrect && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 bg-red-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                                            <p className="text-xs text-red-500 font-bold uppercase">Đáp án đúng:</p>
                                            <p className="text-gray-800 font-medium mt-1">{res.word.shortMeaning}</p>
                                            {res.word.meanings[0]?.definitions[0]?.example && (
                                                <p className="text-sm text-gray-500 italic mt-1">Ex: {res.word.meanings[0].definitions[0].example}</p>
                                            )}
                                        </div>
                                    )}
                                    {res.isCorrect && <p className="text-gray-500 mt-2">{res.word.shortMeaning}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex justify-center">
                        <button onClick={() => refreshAndStartQuiz()} className="w-full max-w-md py-3 bg-fuchsia-600 text-white rounded-xl font-bold shadow-lg">🔄 Học tiếp bài mới</button>
                    </div>
                </div>
            )
        }

        const answeredCount = results.length
        const percentage = Math.round((score / answeredCount) * 100)
        let message = "Cố gắng hơn nhé!"
        let icon = "😅"
        if (percentage >= 80) { message = "Tuyệt vời!"; icon = "🏆" }
        else if (percentage >= 50) { message = "Làm tốt lắm!"; icon = "👍" }

        const isEarlyFinish = answeredCount < quizQueue.length

        return (
            <div className="min-h-screen bg-linear-to-br from-fuchsia-50 via-rose-50 to-violet-50 flex flex-col">
                <Header user={user} simple />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 animate-scale-in">
                        <div className="text-8xl mb-4">{icon}</div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Hoàn thành!</h2>
                            <p className="text-gray-500 mt-2">{message}</p>
                            {isEarlyFinish && (
                                <p className="text-sm text-orange-600 mt-1">
                                    (Kết thúc sớm: {answeredCount}/{quizQueue.length} câu)
                                </p>
                            )}
                        </div>
                        <div className="bg-fuchsia-50 rounded-2xl p-6 border border-fuchsia-100">
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Kết quả</p>
                            <div className="text-5xl font-extrabold text-fuchsia-600 mt-2">{score} / {answeredCount}</div>
                            <p className="text-sm text-gray-400 mt-1">Câu trả lời đúng</p>
                        </div>
                        <button onClick={() => setShowDetail(true)} className="text-fuchsia-600 font-semibold hover:underline py-2">📄 Xem chi tiết đáp án</button>
                        <div className="flex flex-col gap-3 pt-2">
                            <button onClick={() => refreshAndStartQuiz()} className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold transition shadow-lg transform hover:scale-105">🔄 Học tiếp 10 từ khác</button>
                            <Link to="/"><button className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold transition">🏠 Về trang chủ</button></Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const currentWord = quizQueue[currentIndex]
    if (!currentWord) return null;

    return (
        <div className="min-h-screen bg-linear-to-br from-fuchsia-50 via-rose-50 to-violet-50">
            <Header user={user} simple />
            <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-3xl shadow-xl transition-all duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-fuchsia-700">🧠 Smart Learning</h1>
                        <p className="text-sm text-gray-500">Câu {currentIndex + 1} / {quizQueue.length}</p>
                    </div>
                    {/* Khả năng nhớ intentionally hidden during active quiz to avoid bias */}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                    <div className="bg-fuchsia-500 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentIndex) / quizQueue.length) * 100}%` }}></div>
                </div>

                <div className="min-h-[300px]">
                    {/* --- SỬA LỖI Ở ĐÂY: THÊM KEY --- */}
                    {/* key={currentWord.id} sẽ buộc React tạo mới component khi đổi câu hỏi */}
                    {mode === "flashcard" && (
                        <Flashcard
                            key={currentWord.id}
                            word={currentWord}
                            onNext={(isCorrect) => handleNext(isCorrect)}
                        />
                    )}

                    {mode === "mcq" && (
                        <MultipleChoice
                            key={currentWord.id}
                            words={quizQueue}
                            correctWord={currentWord}
                            onNext={(isCorrect) => handleNext(isCorrect)}
                        />
                    )}

                    {mode === "fill" && (
                        <FillInBlank
                            key={currentWord.id}
                            word={currentWord}
                            onNext={(isCorrect) => handleNext(isCorrect)}
                        />
                    )}
                </div>

                <div className="flex justify-center gap-2 mt-8 pt-4 border-t">
                    <button
                        onClick={() => setMode("flashcard")}
                        disabled={isAnswering}
                        className={`p-2 rounded-lg text-sm transition ${mode === "flashcard" ? "bg-fuchsia-100 text-fuchsia-700 font-bold" : "text-gray-500 hover:bg-gray-100"} ${isAnswering ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        Thẻ học
                    </button>
                    <button
                        onClick={() => setMode("mcq")}
                        disabled={isAnswering}
                        className={`p-2 rounded-lg text-sm transition ${mode === "mcq" ? "bg-fuchsia-100 text-fuchsia-700 font-bold" : "text-gray-500 hover:bg-gray-100"} ${isAnswering ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        Trắc nghiệm
                    </button>
                    <button
                        onClick={() => setMode("fill")}
                        disabled={isAnswering}
                        className={`p-2 rounded-lg text-sm transition ${mode === "fill" ? "bg-fuchsia-100 text-fuchsia-700 font-bold" : "text-gray-500 hover:bg-gray-100"} ${isAnswering ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        Điền từ
                    </button>
                </div>

                {/* Finish Early Button */}
                {results.length > 0 && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={handleFinishEarly}
                            disabled={isAnswering}
                            className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition shadow-md ${isAnswering ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            ⏹️ Kết thúc sớm ({results.length}/{quizQueue.length})
                        </button>
                    </div>
                )}
            </div>

            {/* Streak Celebration Modal */}
            {showStreakCelebration && streakData && (
                <StreakCelebration
                    streak={streakData.streak}
                    isNewRecord={streakData.isNewRecord}
                    onClose={() => setShowStreakCelebration(false)}
                />
            )}

            {/* Welcome Modal */}
            {showWelcomeModal && (
                <WelcomeModal
                    onClose={handleWelcomeClose}
                    onStartQuiz={handleWelcomeStart}
                />
            )}
        </div>
    )
}