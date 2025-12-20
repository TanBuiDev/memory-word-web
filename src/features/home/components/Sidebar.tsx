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
    AlertCircle, HelpCircle, ListFilter,
    X, User as UserIcon, Mail, BookOpen, FolderOpen,
    CheckCircle2, XCircle, Clock, Sparkles,
    FileText, Trophy
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

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 h-screen lg:h-auto
                    w-80 bg-white/80 backdrop-blur-md
                    border-r border-gray-200/80 shadow-xl lg:shadow-sm
                    transform transition-transform duration-300 ease-in-out z-50
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    flex flex-col
                `}
            >
                {/* Close button for mobile */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200/60 lg:hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50">
                            <Brain className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Learning Hub
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 lg:overflow-visible">

                    {/* Streak & Memory Stats */}
                    <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl border border-gray-200/60 shadow-lg shadow-indigo-100/20 p-5 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-yellow-50">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                </div>
                                <h3 className="font-semibold text-gray-800">Tiến độ học tập</h3>
                            </div>
                        </div>

                        {/* Note: You might need to update StreakDisplay styles internally as well if it uses hardcoded colors */}
                        <StreakDisplay userId={user.uid} />

                        <div className="mt-4 pt-4 border-t border-gray-100/60">
                            <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-indigo-50/50 transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-50">
                                        <Brain className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Khả năng nhớ</span>
                                </div>
                                <div className={`flex items-center gap-1.5 text-lg font-bold ${averageMemory >= 70 ? 'text-emerald-600' : averageMemory >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                                    {averageMemory >= 70 ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    ) : averageMemory >= 40 ? (
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    {averageMemory || 0}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Link - Gamification Element */}
                    <Link to="/leaderboard" onClick={onClose} className="block">
                        <div className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-2 border-yellow-200/60 hover:border-yellow-400 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden">
                            {/* Animated background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/0 via-yellow-300/20 to-yellow-200/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                            <div className="relative p-3 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 group-hover:scale-110 transition-transform shadow-lg">
                                <Trophy className="h-5 w-5 text-yellow-900" fill="currentColor" />
                            </div>
                            <div className="relative flex-1">
                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                    Leaderboard
                                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full animate-pulse">
                                        NEW
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 font-medium">Compete & climb the ranks!</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-yellow-600 transition-colors relative" />
                        </div>
                    </Link>

                    {/* Navigation Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Học tập & Ôn tập
                            </h3>
                        </div>

                        <Link to="/quiz" onClick={onClose} className="block">
                            <div className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200/60 shadow-sm hover:border-indigo-300 hover:shadow-lg hover:bg-indigo-50/50 transition-all duration-300 cursor-pointer">
                                <div className="p-3 rounded-lg bg-cyan-50 group-hover:scale-110 transition-transform">
                                    <Target className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">Quiz Ôn tập</div>
                                    <div className="text-xs text-gray-500">Kiểm tra kiến thức cơ bản</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </Link>

                        <Link to="/smart-quiz" onClick={onClose} className="block" data-tour="smart-quiz">
                            <div className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200/60 shadow-sm hover:border-purple-300 hover:shadow-lg hover:bg-purple-50/50 transition-all duration-300 cursor-pointer">
                                <div className="p-3 rounded-lg bg-purple-50 group-hover:scale-110 transition-transform">
                                    <Brain className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">Smart Quiz AI</div>
                                    <div className="text-xs text-gray-500">Lộ trình thông minh với AI</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                        </Link>

                        {reviewCount > 0 && (
                            <Link to="/smart-quiz" onClick={onClose} className="block">
                                <div className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 hover:border-red-300 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden">
                                    <div className="relative p-3 rounded-lg bg-red-100 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="relative flex-1">
                                        <div className="font-semibold text-gray-800">Cần ôn tập gấp</div>
                                        <div className="text-xs text-red-500">{reviewCount} từ sắp quên</div>
                                    </div>
                                    <div className="relative flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold border border-red-200">
                                        <AlertCircle className="h-3 w-3" />
                                        {reviewCount}
                                    </div>
                                </div>
                            </Link>
                        )}

                        <Link to="/analytics" onClick={onClose} className="block" data-tour="analytics">
                            <div className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200/60 shadow-sm hover:border-emerald-300 hover:shadow-lg hover:bg-emerald-50/50 transition-all duration-300 cursor-pointer">
                                <div className="p-3 rounded-lg bg-emerald-50 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">Thống kê học tập</div>
                                    <div className="text-xs text-gray-500">Phân tích chi tiết tiến độ</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                            </div>
                        </Link>
                    </div>

                    {/* Lists Section */}
                    <div className="space-y-3 pt-4 border-t border-gray-200/60">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                            <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Danh sách học
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <ListFilter className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">Chọn danh mục</span>
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
                                        { label: "Thêm danh mục", value: "__add" }
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
                                            <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                                <Plus className="h-4 w-4" />
                                                Thêm danh mục
                                            </div>
                                        )
                                        if (item.value === "__default__") return (
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                                                Mặc định
                                            </div>
                                        )

                                        const list = lists.find(l => l.id === item.value)
                                        if (!list) return item.label

                                        return (
                                            <div className="flex justify-between items-center gap-2 w-full group">
                                                <div className="flex items-center gap-3">
                                                    <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="truncate max-w-[120px] text-gray-700" title={list.name}>
                                                        {list.name}
                                                    </span>
                                                </div>

                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            const newName = prompt("Đổi tên danh mục:", list.name)
                                                            if (newName && onRenameList) onRenameList(list.id, newName)
                                                        }}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </button>

                                                    <button
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setConfirmDelete({ id: list.id, name: list.name })
                                                        }}
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
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
                                            className={`p-2.5 rounded-lg text-sm transition-all border flex items-center gap-2 ${defaultListId === list.id
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium shadow-sm'
                                                : 'bg-white border-gray-200/60 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                        >
                                            <FolderOpen className={`h-3.5 w-3.5 ${defaultListId === list.id ? 'text-indigo-600' : 'text-gray-500'}`} />
                                            <div className="truncate text-xs">{list.name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User & Tools Section */}
                    <div className="space-y-3 pt-4 border-t border-gray-200 mt-auto">
                        {onShowQuickStart && (
                            <button
                                onClick={() => {
                                    onShowQuickStart()
                                    onClose?.()
                                }}
                                className="group w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100/60 hover:border-teal-300 hover:shadow-lg hover:bg-teal-100/50 transition-all duration-300"
                            >
                                <div className="p-2 rounded-lg bg-teal-100 group-hover:scale-110 transition-transform">
                                    <HelpCircle className="h-5 w-5 text-teal-600" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-gray-800">Hướng dẫn sử dụng</div>
                                    <div className="text-xs text-gray-500">Xem hướng dẫn chi tiết</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                            </button>
                        )}

                        <Link to="/settings" onClick={onClose} className="block">
                            <div className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200/60 hover:border-gray-300 hover:shadow-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                                <div className="p-2 rounded-lg bg-gray-100 group-hover:scale-110 transition-transform">
                                    <Settings className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">Cài đặt</div>
                                    <div className="text-xs text-gray-500">Tùy chỉnh ứng dụng</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                        </Link>
                    </div>

                    {/* User Profile */}
                    <div className="pt-4 border-t border-gray-200/60">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-indigo-50/30 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg border-2 border-indigo-200">
                                    {user.displayName?.[0]?.toUpperCase() || <UserIcon className="h-6 w-6 text-indigo-600" />}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                                    <div className="font-semibold text-gray-800 truncate">
                                        {user.displayName || "Người học"}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onSignOut}
                            className="w-full mt-3 flex items-center justify-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-100/60 hover:border-red-200 hover:shadow-lg text-red-600 font-semibold transition-all duration-300 group"
                        >
                            <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Modals - Giữ lại style tối cho modal nếu muốn hoặc chuyển sang sáng luôn. Ở đây tôi chuyển sang sáng */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl border border-gray-200/60 shadow-2xl shadow-indigo-100/20 p-8 w-96 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-indigo-100">
                                <Plus className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Thêm danh mục mới
                            </h3>
                        </div>

                        <div className="relative mt-2">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium"
                                onClick={() => {
                                    setShowAddModal(false)
                                    setNewListName("")
                                }}
                            >
                                <XCircle className="h-4 w-4" />
                                Hủy
                            </button>

                            <button
                                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                disabled={!newListName.trim()}
                                onClick={() => {
                                    if (onAddList) onAddList(newListName.trim())
                                    setShowAddModal(false)
                                    setNewListName("")
                                }}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl border border-gray-200/60 shadow-2xl shadow-red-100/20 p-8 w-96 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-red-100">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Xác nhận xóa
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <p className="text-gray-600">
                                Bạn có chắc muốn xóa danh mục <b className="text-gray-900">{confirmDelete.name}</b>?
                            </p>
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                <span>Hành động này không thể hoàn tác</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium"
                                onClick={() => setConfirmDelete(null)}
                            >
                                <XCircle className="h-4 w-4" />
                                Hủy
                            </button>

                            <button
                                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 font-medium"
                                onClick={() => {
                                    if (onDeleteList) onDeleteList(confirmDelete.id)
                                    setConfirmDelete(null)
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}