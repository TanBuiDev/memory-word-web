import { useEffect, useRef, useState } from "react"
import useDebounce from "../hooks/useDebounce"

interface Props {
    value: string
    onChange: (v: string) => void
    onSelect: (v: string) => void
    onEnter: (word?: string) => void
}

export default function WordInput({ value, onChange, onSelect, onEnter }: Props) {
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [highlightIndex, setHighlightIndex] = useState(-1)

    const listRef = useRef<HTMLUListElement>(null) // Ref cho <ul>
    const itemRefs = useRef<(HTMLLIElement | null)[]>([]) // Ref cho mảng các <li>

    useEffect(() => {
        // Reset mảng refs khi suggestions thay đổi
        itemRefs.current = itemRefs.current.slice(0, suggestions.length)
    }, [suggestions])

    useEffect(() => {
        // Khi highlightIndex thay đổi, cuộn tới item đó
        if (highlightIndex < 0 || !itemRefs.current[highlightIndex]) {
            return
        }
        itemRefs.current[highlightIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest" // Chỉ cuộn nếu nó nằm ngoài tầm nhìn
        })
    }, [highlightIndex])

    const debouncedValue = useDebounce(value, 250)

    useEffect(() => {
        if (!debouncedValue.trim()) {
            setSuggestions([])
            return
        }

        const controller = new AbortController()
        const fetchSuggestions = async () => {
            try {
                const res = await fetch(
                    `https://api.datamuse.com/words?sp=${encodeURIComponent(debouncedValue)}*&max=15`,
                    { signal: controller.signal }
                )

                if (!res.ok) return

                const data: { word: string }[] = await res.json()
                setSuggestions(data.map(d => d.word))
            } catch (error) {
                if ((error as DOMException).name !== "AbortError") {
                    console.error("Failed to fetch suggestions:", error)
                }
            }
        }

        fetchSuggestions()
        return () => controller.abort()
    }, [debouncedValue])

    useEffect(() => {
        const close = () => setSuggestions([])
        window.addEventListener("click", close)
        return () => window.removeEventListener("click", close)
    }, [])

    return (
        <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <input
                // 🎨 Thay đổi màu Focus Ring và Border sang fuchsia-400 (Màu Chủ đạo nhẹ)
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400"
                placeholder="Nhập từ tiếng Anh..."
                value={value}
                onChange={(e) => {
                    const v = e.target.value
                    onChange(v)
                    setHighlightIndex(-1)
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault()
                        if (highlightIndex >= 0 && suggestions.length > 0) {
                            // 1. Lấy từ được chọn
                            const selected = suggestions[highlightIndex]
                            onSelect(selected) // Cập nhật input (cho đẹp)
                            setSuggestions([])
                            setHighlightIndex(-1)
                            // 2. Truyền TRỰC TIẾP từ đã chọn vào onEnter
                            onEnter(selected)
                            return
                        }
                        if (value.trim()) {
                            setSuggestions([])
                            setHighlightIndex(-1)
                            // 3. Không có gợi ý, gọi onEnter không tham số
                            onEnter()
                        }
                    }
                    if (e.key === "ArrowDown" && suggestions.length > 0) {
                        e.preventDefault()
                        setHighlightIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0)
                    }
                    if (e.key === "ArrowUp" && suggestions.length > 0) {
                        e.preventDefault()
                        setHighlightIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1)
                    }
                }}
            />

            {suggestions.length > 0 && (
                <ul
                    ref={listRef} // <-- Gắn ref cho <ul>
                    className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-md mt-1 z-20 max-h-72 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            ref={el => { itemRefs.current[i] = el }} // <-- Gắn ref cho <li>
                            onClick={() => {
                                onSelect(s)
                                setSuggestions([])
                                setHighlightIndex(-1)
                                onEnter(s) // <-- Thêm onEnter(s) vào cả onClick
                            }}
                            className={`px-3 py-2 cursor-pointer ${i === highlightIndex ? "bg-cyan-600 text-white" : "hover:bg-gray-100"
                                }`}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}