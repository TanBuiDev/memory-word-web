import { useState } from "react"
import type { Word } from "../../../../types/word"
import { logQuiz } from "../../../../utils/logQuiz"

interface FlashcardProps {
    word: Word
    onNext: (isCorrect: boolean) => void
}

export default function Flashcard({ word, onNext }: FlashcardProps) {
    const [flipped, setFlipped] = useState(false)
    const [answered, setAnswered] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)

    const handleFlip = () => {
        setFlipped(!flipped)
    }

    const handleAnswer = (isCorrect: boolean) => {
        logQuiz(word.id, "flashcard", isCorrect)
        setAnswered(true)
        setSelectedAnswer(isCorrect)

        // Reset state and move to next after 2 seconds for wrong answers, 500ms for correct
        const delay = isCorrect ? 500 : 2000
        setTimeout(() => {
            setFlipped(false)
            setAnswered(false)
            setSelectedAnswer(null)
            onNext(isCorrect)
        }, delay)
    }

    return (
        <div className="flex flex-col items-center space-y-6">

            {/* Flashcard with feedback */}
            <div
                onClick={() => !answered && handleFlip()}
                className={`relative w-80 h-48 cursor-pointer perspective rounded-2xl shadow-xl transition-all ${
                    answered && selectedAnswer === false ? "ring-4 ring-red-400" : ""
                }`}
            >
                <div
                    className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
                        }`}
                >
                    {/* Front */}
                    <div className="absolute inset-0 bg-white rounded-2xl shadow-xl
                        flex items-center justify-center text-3xl font-bold backface-hidden">
                        {word.term}
                    </div>

                    {/* Back */}
                    <div className={`absolute inset-0 rounded-2xl shadow-xl
                        flex items-center justify-center text-2xl font-semibold rotate-y-180 backface-hidden p-6 ${
                        answered && selectedAnswer === false
                            ? "bg-linear-to-br from-red-100 to-pink-100"
                            : "bg-fuchsia-600 text-white"
                    }`}>
                        <div className="text-center">
                            <p className={`text-2xl font-bold mb-2 ${answered && selectedAnswer === false ? "text-gray-800" : ""}`}>
                                {word.shortMeaning}
                            </p>
                            {word.phonetic && <p className={`text-sm opacity-90 italic ${answered && selectedAnswer === false ? "text-gray-600" : ""}`}>{word.phonetic}</p>}
                            {answered && selectedAnswer === false && (
                                <p className="text-xs text-red-600 font-bold mt-2">❌ Sai! Đáp án đúng ở trên.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Self-Assessment Buttons */}
            {!flipped && !answered && (
                <p className="text-gray-500 text-sm">👆 Nhấn vào thẻ để xem nghĩa</p>
            )}

            {flipped && !answered && (
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <p className="text-center text-gray-600 font-medium mb-2">Bạn có nhớ từ này không?</p>
                    <button
                        onClick={() => handleAnswer(true)}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>✅</span>
                        <span>Nhớ rõ</span>
                    </button>
                    <button
                        onClick={() => handleAnswer(false)}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>❌</span>
                        <span>Chưa nhớ</span>
                    </button>
                </div>
            )}

            {answered && selectedAnswer === false && (
                <p className="text-red-600 text-sm font-semibold animate-pulse">⏳ Đang chuyển câu tiếp theo...</p>
            )}

            {answered && selectedAnswer === true && (
                <p className="text-green-600 text-sm font-semibold animate-pulse">🎉 Tuyệt vời!</p>
            )}
        </div>
    )
}