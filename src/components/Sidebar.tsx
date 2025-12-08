import { useState } from "react"
import { Link } from "react-router-dom"
import type { WordList } from "../types/list"
import type { Word } from "../types/word"
import type { User } from "firebase/auth"
import Dropdown from "./Dropdown"
import StreakDisplay from "./StreakDisplay"

interface SidebarProps {
    user: User | null
    lists?: WordList[]
    words?: Array<Word & { p_recall?: number; needsReview?: boolean }>
    onAddList?: (name: string) => void
    onRenameList?: (id: string, name: string) => void
    onDeleteList?: (id: string) => void
    onSignOut?: () => void
    defaultListId?: string | "__default__" | null
    setDefaultListId?: (v: string | "__default__" | null) => void
    onShowQuickStart?: () => void
    isOpen?: boolean
    onClose?: () => void
}

export default function Sidebar({
    user,
    lists = [],
    onAddList,
    onRenameList,
    onDeleteList,
    onSignOut,
    defaultListId = null,
    setDefaultListId,
    onShowQuickStart,
    isOpen = true,
    onClose,
    words = [],
}: SidebarProps) {
    const [confirmDelete, setConfirmDelete] = useState<null | { id: string, name: string }>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newListName, setNewListName] = useState("")

    // Tên hiển thị cho dropdown
    let labelText = "Chọn danh mục"
    if (defaultListId && defaultListId !== "__default__") {
        const list = lists.find(l => l.id === defaultListId)
        if (list) labelText = list.name
    } else if (defaultListId === "__default__") {
        labelText = "Mặc định"
    }

    if (!user) return null

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 h-screen lg:h-auto
                    w-80 bg-white dark:bg-gray-800 shadow-2xl lg:shadow-lg
                    transform transition-transform duration-300 ease-in-out z-50
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    flex flex-col
                `}
            >
                {/* Close button for mobile */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 lg:hidden">
                    <h2 className="text-lg font-bold text-fuchsia-600 dark:text-fuchsia-400">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-700 dark:text-gray-300"
                        aria-label="Close menu"
                    >
                        <span className="text-2xl">×</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Streak Display + Remembering Ability */}
                    <div className="flex flex-col items-center bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-2 border border-orange-100">
                        <StreakDisplay userId={user.uid} />
                        <div className="mt-2 text-center">
                            <div className="text-xs text-gray-500 uppercase font-bold">Khả năng nhớ (tổng quan)</div>
                            <div className="text-lg font-bold text-fuchsia-600">
                                {(() => {
                                    const vals = (words ?? []).map(w => typeof w.p_recall === 'number' ? w.p_recall : NaN).filter(v => !Number.isNaN(v))
                                    if (vals.length === 0) return "—"
                                    const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100)
                                    return `${avg}%`
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                            Học tập
                        </h3>

                        <Link to="/quiz" onClick={onClose}>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition group cursor-pointer">
                                <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition">
                                    🎯
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">Quiz</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Ôn tập cơ bản</div>
                                </div>
                            </div>
                        </Link>

                        <Link to="/smart-quiz" onClick={onClose}>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition group cursor-pointer">
                                <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition">
                                    🧠
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">Smart Quiz</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">AI tối ưu lộ trình</div>
                                </div>
                            </div>
                        </Link>

                        {(() => {
                            const needsReview = (words ?? []).filter((w) => w.needsReview);
                            return needsReview.length > 0 ? (
                                <Link to="/smart-quiz" onClick={onClose}>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-l-4 border-red-500 transition group cursor-pointer">
                                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition">
                                            🔴
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-red-700 dark:text-red-400">Ôn tập lại</div>
                                            <div className="text-xs text-red-600 dark:text-red-300">{needsReview.length} từ cần ôn</div>
                                        </div>
                                    </div>
                                </Link>
                            ) : null;
                        })()}

                        <Link to="/analytics" onClick={onClose}>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group cursor-pointer">
                                <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition">
                                    📊
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">Thống kê</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Theo dõi tiến độ</div>
                                </div>
                            </div>
                        </Link>

                        {onShowQuickStart && (
                            <button
                                onClick={() => {
                                    onShowQuickStart()
                                    onClose?.()
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition group"
                            >
                                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition">
                                    ❓
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">Hướng dẫn</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Xem hướng dẫn sử dụng</div>
                                </div>
                            </button>
                        )}

                        <Link to="/settings" onClick={onClose}>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group cursor-pointer">
                                <div className="w-10 h-10 bg-linear-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition">
                                    ⚙️
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">Cài đặt</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Tùy chỉnh ứng dụng</div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Lists Section */}
                    <div className="space-y-2 pt-4 border-t dark:border-gray-700">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                            Danh mục
                        </h3>

                        <div className="px-2">
                            <Dropdown
                                label={labelText}
                                width="w-full"
                                items={[
                                    { label: "Mặc định", value: "__default__" },
                                    ...lists.map(list => ({
                                        label: list.name,
                                        value: list.id
                                    })),
                                    { label: "➕ Thêm danh mục", value: "__add" }
                                ]}
                                onSelect={(value) => {
                                    if (value === "__add") {
                                        setShowAddModal(true)
                                        return
                                    }
                                    if (setDefaultListId) setDefaultListId(value)
                                }}
                                renderItem={(item) => {
                                    if (item.value === "__add") return item.label
                                    if (item.value === "__default__") return "Mặc định"

                                    const list = lists.find(l => l.id === item.value)
                                    if (!list) return item.label

                                    return (
                                        <div className="flex justify-between items-center gap-2 w-full">
                                            <span className="truncate max-w-[120px]" title={list.name}>
                                                {list.name}
                                            </span>

                                            <div className="flex gap-2 text-sm">
                                                <button
                                                    className="text-cyan-600 hover:text-cyan-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        const newName = prompt("Đổi tên danh mục:", list.name)
                                                        if (newName && onRenameList) onRenameList(list.id, newName)
                                                    }}
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setConfirmDelete({ id: list.id, name: list.name })
                                                    }}
                                                >
                                                    ➖
                                                </button>
                                            </div>
                                        </div>
                                    )
                                }}
                            />
                        </div>
                    </div>

                    {/* User Section */}
                    <div className="pt-4 border-t dark:border-gray-700 mt-auto">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                            <div className="w-10 h-10 bg-fuchsia-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user.displayName?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {user.displayName || "User"}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onSignOut}
                            className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold transition"
                        >
                            <span>🚪</span>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center animate-scale-in">
                        <h3 className="text-lg font-bold text-gray-800">
                            ➕ Thêm danh mục mới
                        </h3>

                        <input
                            className="w-full mt-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-400"
                            placeholder="Nhập tên danh mục..."
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && newListName.trim()) {
                                    if (onAddList) onAddList(newListName.trim())
                                    setShowAddModal(false)
                                    setNewListName("")
                                }
                            }}
                        />

                        <div className="flex justify-center gap-3 mt-6">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                                onClick={() => {
                                    setShowAddModal(false)
                                    setNewListName("")
                                }}
                            >
                                Hủy
                            </button>

                            <button
                                className="px-4 py-2 bg-fuchsia-600 text-white rounded-full hover:bg-fuchsia-700 transition shadow disabled:opacity-50"
                                disabled={!newListName.trim()}
                                onClick={() => {
                                    if (onAddList) onAddList(newListName.trim())
                                    setShowAddModal(false)
                                    setNewListName("")
                                }}
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center animate-scale-in">
                        <h3 className="text-lg font-bold text-gray-800">
                            Xóa danh mục?
                        </h3>

                        <p className="text-gray-600 mt-2">
                            Bạn có chắc muốn xóa <b className="text-fuchsia-600">{confirmDelete.name}</b>?
                        </p>

                        <div className="flex justify-center gap-3 mt-6">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Hủy
                            </button>

                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow"
                                onClick={() => {
                                    if (onDeleteList) onDeleteList(confirmDelete.id)
                                    setConfirmDelete(null)
                                }}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

