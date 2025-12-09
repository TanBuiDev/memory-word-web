import { useEffect, useRef, useState } from "react"
import type { Word } from "../../../types/word"

interface WordSearchBarProps {
    value: string
    onChange: (value: string) => void
    suggestions: Word[]
    onSelect: (word: Word) => void
    placeholder?: string
}

export default function WordSearchBar({
    value,
    onChange,
    suggestions,
    onSelect,
    placeholder = "Tìm kiếm từ vựng của bạn..."
}: WordSearchBarProps) {
    const [isFocused, setIsFocused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false)
            }
        }
        window.addEventListener("click", handleClickOutside)
        return () => window.removeEventListener("click", handleClickOutside)
    }, [])

    const showSuggestions = isFocused && suggestions.length > 0

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <span className="text-2xl" aria-hidden="true">🔍</span>
                <input
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                {value && (
                    <button
                        onClick={() => onChange("")}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        Xóa
                    </button>
                )}
            </div>

            {showSuggestions && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 max-h-72 overflow-y-auto">
                    {suggestions.map((word) => (
                        <button
                            key={word.id}
                            onClick={() => {
                                onSelect(word)
                                setIsFocused(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 transition flex flex-col"
                        >
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{word.term}</span>
                            {word.shortMeaning && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">{word.shortMeaning}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

