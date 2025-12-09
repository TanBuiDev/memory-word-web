import { useState } from "react"
import { Link } from "react-router-dom"
import type { WordList } from "../../../types/list"
import type { Word } from "../../../types/word"
import type { User } from "firebase/auth"
import Dropdown from "../../../components/ui/Dropdown"
import StreakDisplay from "./StreakDisplay"
import {
    Brain, Zap, Target,
    Settings, LogOut, Plus,
    Trash2, Edit, ChevronRight, BarChart3,
    AlertCircle, HelpCircle, ListFilter
} from "lucide-react"

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

    // Tính khả năng nhớ trung bình
    const memoryValues = (words ?? []).map(w => typeof w.p_recall === 'number' ? w.p_recall : NaN).filter(v => !Number.isNaN(v))
    const averageMemory = memoryValues.length > 0
        ? Math.round((memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length) * 100)
        : 0

    // Tính từ cần ôn tập
    const needsReviewWords = (words ?? []).filter((w) => w.needsReview)
    const reviewCount = needsReviewWords.length

    if (!user) return null

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 h-screen lg:h-auto
                    w-80 bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950
                    border-r border-white/10 shadow-2xl lg:shadow-2xl
                    transform transition-transform duration-300 ease-in-out z-50
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    flex flex-col backdrop-blur-xl
                `}
            >
                {/* Close button for mobile */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 lg:hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-lg font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                            Learning Hub
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-white"
                        aria-label="Close menu"
                    >
                        <span className="text-2xl">×</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2 space-y-6">
                    {/* Streak & Memory Stats */}
                    <div className="bg-gradient-to-br from-gray-900/80 to-indigo-900/80 rounded-2xl border border-white/10 p-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
                                    <Zap className="h-5 w-5 text-yellow-400" />
                                </div>
                                <h3 className="font-semibold text-white">Tiến độ học tập</h3>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>

                        <StreakDisplay userId={user.uid} />

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
                                        <Brain className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <span className="text-sm text-gray-300">Khả năng nhớ</span>
                                </div>
                                <div className={`text-lg font-bold ${averageMemory >= 70 ? 'text-emerald-400' : averageMemory >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {averageMemory || 0}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full"></div>
                            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                                Học tập & Ôn tập
                            </h3>
                        </div>

                        <Link to="/quiz" onClick={onClose} className="block">
                            <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer">
                                <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 group-hover:scale-110 transition-transform">
                                    <Target className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">Quiz Ôn tập</div>
                                    <div className="text-xs text-gray-400">Kiểm tra kiến thức cơ bản</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        <Link to="/smart-quiz" onClick={onClose} className="block">
                            <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer">
                                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 group-hover:scale-110 transition-transform">
                                    <Brain className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">Smart Quiz AI</div>
                                    <div className="text-xs text-gray-400">Lộ trình thông minh với AI</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        {reviewCount > 0 && (
                            <Link to="/smart-quiz" onClick={onClose} className="block">
                                <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-900/40 to-pink-900/40 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    <div className="relative p-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="relative flex-1">
                                        <div className="font-semibold text-white">Cần ôn tập gấp</div>
                                        <div className="text-xs text-red-300">{reviewCount} từ sắp quên</div>
                                    </div>
                                    <div className="relative px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                                        {reviewCount}
                                    </div>
                                </div>
                            </Link>
                        )}

                        <Link to="/analytics" onClick={onClose} className="block">
                            <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer">
                                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">Thống kê học tập</div>
                                    <div className="text-xs text-gray-400">Phân tích chi tiết tiến độ</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                        </Link>
                    </div>

                    {/* Lists Section */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
                            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                                Danh sách học
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <div className="bg-gradient-to-r from-gray-900/50 to-indigo-900/30 rounded-xl p-3 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <ListFilter className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm font-medium text-white">Chọn danh mục</span>
                                    </div>
                                </div>

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
                                        if (item.value === "__add") return (
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Thêm danh mục
                                            </div>
                                        )
                                        if (item.value === "__default__") return "Mặc định"

                                        const list = lists.find(l => l.id === item.value)
                                        if (!list) return item.label

                                        return (
                                            <div className="flex justify-between items-center gap-2 w-full group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                                                    <span className="truncate max-w-[120px] text-white" title={list.name}>
                                                        {list.name}
                                                    </span>
                                                </div>

                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-1 hover:bg-white/10 rounded"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            const newName = prompt("Đổi tên danh mục:", list.name)
                                                            if (newName && onRenameList) onRenameList(list.id, newName)
                                                        }}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="h-3 w-3 text-gray-400 hover:text-blue-400" />
                                                    </button>

                                                    <button
                                                        className="p-1 hover:bg-white/10 rounded"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setConfirmDelete({ id: list.id, name: list.name })
                                                        }}
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    }}
                                />
                            </div>

                            {lists.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {lists.slice(0, 4).map(list => (
                                        <button
                                            key={list.id}
                                            onClick={() => setDefaultListId?.(list.id)}
                                            className={`p-2 rounded-lg text-sm transition-all ${defaultListId === list.id
                                                ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/50 text-white'
                                                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300'
                                                }`}
                                        >
                                            <div className="truncate text-xs">{list.name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User & Tools Section */}
                    <div className="space-y-3 pt-4 border-t border-white/10 mt-auto">
                        {onShowQuickStart && (
                            <button
                                onClick={() => {
                                    onShowQuickStart()
                                    onClose?.()
                                }}
                                className="group w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 hover:from-emerald-900/40 hover:to-teal-900/40 border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
                            >
                                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:scale-110 transition-transform">
                                    <HelpCircle className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-white">Hướng dẫn sử dụng</div>
                                    <div className="text-xs text-gray-400">Xem hướng dẫn chi tiết</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                            </button>
                        )}

                        <Link to="/settings" onClick={onClose} className="block">
                            <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 cursor-pointer">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 group-hover:scale-110 transition-transform">
                                    <Settings className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">Cài đặt</div>
                                    <div className="text-xs text-gray-400">Tùy chỉnh ứng dụng</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                        </Link>
                    </div>

                    {/* User Profile */}
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-900/50 to-indigo-900/30 border border-white/10">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {user.displayName?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-gray-900"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate">
                                    {user.displayName || "Người học"}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onSignOut}
                            className="w-full mt-3 flex items-center justify-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-900/40 to-pink-900/40 hover:from-red-900/50 hover:to-pink-900/50 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 font-semibold transition-all duration-300 group"
                        >
                            <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl border border-white/10 shadow-2xl p-6 w-80 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600">
                                <Plus className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white">
                                Thêm danh mục mới
                            </h3>
                        </div>

                        <input
                            className="w-full mt-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                                onClick={() => {
                                    setShowAddModal(false)
                                    setNewListName("")
                                }}
                            >
                                Hủy
                            </button>

                            <button
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl border border-white/10 shadow-2xl p-6 w-80 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600">
                                <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white">
                                Xác nhận xóa
                            </h3>
                        </div>

                        <p className="text-gray-300">
                            Bạn có chắc muốn xóa danh mục <b className="text-white">{confirmDelete.name}</b>?
                            <br />
                            <span className="text-sm text-red-400">Hành động này không thể hoàn tác</span>
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Hủy
                            </button>

                            <button
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
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