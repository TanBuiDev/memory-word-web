import { useState, useEffect, useRef } from "react"
import type { Word } from "../../types/word"
import { logQuiz } from "../../utils/logQuiz"

interface FillInBlankProps {
    word: Word
    // CẬP NHẬT: onNext nhận thêm tham số boolean
    onNext: (isCorrect: boolean) => void
}

export default function FillInBlank({ word, onNext }: FillInBlankProps) {
    const [input, setInput] = useState("")
    const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle")
    const inputRef = useRef<HTMLInputElement>(null)

    // Tự động focus vào ô input khi render
    useEffect(() => {
        inputRef.current?.focus()
    }, [word])

    const check = () => {
        if (!input.trim()) return

        // So sánh không phân biệt hoa thường
        const isCorrect = input.trim().toLowerCase() === word.term.toLowerCase()

        setStatus(isCorrect ? "correct" : "wrong")
        logQuiz(word.id, "fill", isCorrect)

        setTimeout(() => {
            setStatus("idle")
            setInput("")
            // QUAN TRỌNG: Truyền kết quả đúng/sai lên cha
            onNext(isCorrect)
        }, 1500) // Chờ 1.5s để user kịp nhìn kết quả
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && status === "idle") {
            check()
        }
    }

    return (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Gõ lại từ vựng có nghĩa:</p>
                <h3 className="text-2xl font-bold text-gray-800 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    "{word.shortMeaning}"
                </h3>
            </div>

            <div className="relative">
                <input
                    ref={inputRef}
                    disabled={status !== "idle"}
                    className={`w-full text-center text-2xl p-4 border-b-4 outline-none transition-colors bg-transparent
                        ${status === "idle" ? "border-gray-300 focus:border-fuchsia-500 text-gray-800 placeholder-gray-300" : ""}
                        ${status === "correct" ? "border-green-500 text-green-600" : ""}
                        ${status === "wrong" ? "border-red-500 text-red-600" : ""}
                    `}
                    placeholder="Nhập từ tiếng Anh..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />

                {/* Feedback Icon */}
                <div className="absolute right-4 top-4 text-2xl animate-bounce">
                    {status === "correct" && "🎉"}
                    {status === "wrong" && "❌"}
                </div>
            </div>

            {status === "idle" && (
                <button
                    onClick={check}
                    disabled={!input.trim()}
                    className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-300 text-white rounded-xl font-bold shadow-lg transition transform active:scale-95"
                >
                    Kiểm tra
                </button>
            )}

            {/* Hiển thị kết quả */}
            <div className={`text-center transition-opacity duration-300 ${status !== "idle" ? "opacity-100" : "opacity-0"}`}>
                {status === "correct" && (
                    <p className="text-green-600 font-bold text-lg animate-pulse">Chính xác! Xuất sắc.</p>
                )}
                {status === "wrong" && (
                    <div className="text-red-600">
                        <p className="font-bold text-lg">Sai rồi!</p>
                        <p>Đáp án đúng là: <span className="font-bold text-fuchsia-700 text-xl">{word.term}</span></p>
                    </div>
                )}
            </div>
        </div>
    )
}