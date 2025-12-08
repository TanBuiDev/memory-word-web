import { useEffect, useRef, useState } from "react";
import type React from "react" // Cần thiết cho React.ReactNode

interface DropdownProps {
    label: string
    items: { label: string; value: string }[]
    onSelect: (value: string) => void
    width?: string
    renderItem?: (item: { label: string; value: string }) => React.ReactNode
}

export default function Dropdown({
    label,
    items,
    onSelect,
    width = "w-40",
    renderItem
}: DropdownProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        window.addEventListener("click", handler)
        return () => window.removeEventListener("click", handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                // 🎨 Thay đổi màu nền sang Yellow (Màu Điểm nhấn)
                className={`px-4 py-2 rounded-full bg-yellow-400 text-fuchsia-900 hover:bg-yellow-300 transition text-left ${width} flex justify-between items-center font-medium`}
            >
                <span className="truncate max-w-[120px]">{label}</span> ▼
            </button>

            {open && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border py-1 z-50 min-w-40 max-h-64 overflow-y-auto">
                    {items.map(item => (
                        <div
                            key={item.value}
                            // 🎨 Thay đổi màu Hover sang fuchsia-50 (Màu Chủ đạo rất nhạt)
                            className="px-3 py-2 hover:bg-fuchsia-50 cursor-pointer select-none"
                            onClick={() => {
                                setOpen(false)
                                onSelect(item.value)
                            }}
                        >
                            {renderItem ? renderItem(item) : item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}