import { useState, useEffect, useMemo } from "react"
import type { Word } from "../../types/word"
import { logQuiz } from "../../utils/logQuiz"

interface MultipleChoiceProps {
    words: Word[]
    correctWord: Word
    // CẬP NHẬT: onNext nhận thêm tham số boolean để báo cáo kết quả về cha
    onNext: (isCorrect: boolean) => void
}

export default function MultipleChoice({
    words,
    correctWord,
    onNext
}: MultipleChoiceProps) {

    // Compute 3 wrong answers + correct answer per question.
    // Recompute when `words` or `correctWord.id` changes so answers update per question.
    const answers = useMemo(() => {
        const wrongOptions = words
            .filter(w => w.id !== correctWord.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)

        // Mix correct answer in
        return [...wrongOptions, correctWord].sort(() => Math.random() - 0.5)
    }, [words, correctWord.id])

    const [selected, setSelected] = useState<string | null>(null)

    // Reset selection when question changes
    useEffect(() => {
        setSelected(null)
    }, [correctWord.id])

    const handleSelect = (choice: Word) => {
        if (selected) return // Ngăn chọn lại sau khi đã chọn

        setSelected(choice.id)
        const isCorrect = choice.id === correctWord.id

        // Ghi log
        logQuiz(correctWord.id, "mcq", isCorrect)

        // Chờ 1 giây để hiển thị màu đúng/sai rồi mới chuyển câu
        setTimeout(() => {
            setSelected(null)
            // QUAN TRỌNG: Truyền kết quả đúng/sai lên component cha (SmartQuiz)
            onNext(isCorrect)
        }, 1000)
    }

    return (
        <div className="space-y-6">
            {/* Câu hỏi */}
            <div className="text-center space-y-2">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Chọn nghĩa đúng cho:</p>
                <h2 className="text-3xl font-extrabold text-fuchsia-700 drop-shadow-sm">{correctWord.term}</h2>
                <p className="text-gray-400 italic">{correctWord.phonetic}</p>
            </div>

            {/* Danh sách đáp án */}
            <div className="grid gap-3">
                {answers.map((option) => {
                    let btnClass = "bg-white border-gray-200 hover:bg-fuchsia-50 hover:border-fuchsia-300 text-gray-700"

                    // Logic hiển thị màu sắc khi đã chọn
                    if (selected) {
                        if (option.id === correctWord.id) {
                            btnClass = "bg-green-100 border-green-500 text-green-800 font-bold ring-2 ring-green-200" // Đáp án đúng luôn hiện xanh
                        } else if (selected === option.id) {
                            btnClass = "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-200" // Chọn sai hiện đỏ
                        } else {
                            btnClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-50" // Các câu khác mờ đi
                        }
                    }

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option)}
                            disabled={!!selected}
                            className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-3 ${btnClass}`}
                        >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${selected && option.id === correctWord.id ? 'border-green-600 bg-green-200 text-green-800' : 'border-gray-300 text-gray-500'}`}>
                                {selected && option.id === correctWord.id ? "✓" : "●"}
                            </span>
                            <span className="flex-1">{option.shortMeaning}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}