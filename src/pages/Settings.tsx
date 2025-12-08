import { useState, useEffect } from "react"
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore"
import { deleteUser, updateProfile } from "firebase/auth"
import { db, auth } from "../firebase"
import type { User } from "firebase/auth"
import Header from "../features/learning/components/Header"
import { getUserProgress, updateDailyGoal } from "../utils/streakService"
import { useTheme } from "../contexts/themeContext"

export default function Settings({ user }: { user: User }) {
    const { theme, setTheme } = useTheme()
    const [dailyGoal, setDailyGoal] = useState(20)
    const [displayName, setDisplayName] = useState(user.displayName || "")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const progress = await getUserProgress(user.uid)
                setDailyGoal(progress.dailyGoal)
            } catch (error) {
                console.error("Error loading settings:", error)
            }
        }

        loadSettings()
    }, [user.uid])

    const handleSaveDailyGoal = async () => {
        setLoading(true)
        try {
            await updateDailyGoal(user.uid, dailyGoal)
            showMessage("success", "Đã cập nhật mục tiêu hàng ngày!")
        } catch (error) {
            console.error("Error updating daily goal:", error)
            showMessage("error", "Lỗi khi cập nhật mục tiêu")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            showMessage("error", "Tên hiển thị không được để trống")
            return
        }

        setLoading(true)
        try {
            await updateProfile(user, { displayName: displayName.trim() })
            showMessage("success", "Đã cập nhật thông tin tài khoản!")
        } catch (error) {
            console.error("Error updating profile:", error)
            showMessage("error", "Lỗi khi cập nhật thông tin")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "XÓA") {
            showMessage("error", "Vui lòng nhập 'XÓA' để xác nhận")
            return
        }

        setLoading(true)
        try {
            // Delete all user data
            const batch = writeBatch(db)

            // Delete all words
            const wordsQuery = query(collection(db, "words"), where("userId", "==", user.uid))
            const wordsSnapshot = await getDocs(wordsQuery)
            wordsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref)
            })

            // Delete all lists
            const listsQuery = query(collection(db, "lists"), where("userId", "==", user.uid))
            const listsSnapshot = await getDocs(listsQuery)
            listsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref)
            })

            // Delete interaction logs
            const logsQuery = query(collection(db, "interaction_log"), where("userId", "==", user.uid))
            const logsSnapshot = await getDocs(logsQuery)
            logsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref)
            })

            // Delete user progress
            const progressRef = doc(db, "user_progress", user.uid)
            batch.delete(progressRef)

            await batch.commit()

            // Delete Firebase Auth account
            await deleteUser(user)

            showMessage("success", "Tài khoản đã được xóa. Đang đăng xuất...")
            setTimeout(() => {
                auth.signOut()
            }, 2000)
        } catch (error) {
            console.error("Error deleting account:", error)
            if (typeof error === "object" && error !== null && "code" in error) {
                const err = error as { code?: string; message?: string }
                if (err.code === "auth/requires-recent-login") {
                    showMessage("error", "Vui lòng đăng nhập lại để xóa tài khoản")
                } else {
                    showMessage("error", "Lỗi khi xóa tài khoản: " + (err.message ?? ""))
                }
            } else {
                showMessage("error", "Lỗi khi xóa tài khoản")
            }
        } finally {
            setLoading(false)
            setShowDeleteConfirm(false)
            setDeleteConfirmText("")
        }
    }

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 5000)
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-fuchsia-50 via-rose-50 to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Header user={user} simple />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">⚙️ Cài đặt</h1>
                    <p className="text-gray-600 dark:text-gray-400">Quản lý tài khoản và tùy chỉnh ứng dụng</p>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-lg animate-scale-in ${message.type === "success"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Account Information */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        👤 Thông tin tài khoản
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user.email || ""}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Email không thể thay đổi
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tên hiển thị
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-fuchsia-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Nhập tên hiển thị"
                            />
                        </div>

                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading || displayName === user.displayName}
                            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang lưu..." : "💾 Lưu thay đổi"}
                        </button>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        🎨 Giao diện
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Chế độ hiển thị
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setTheme("light")}
                                    className={`p-4 rounded-xl border-2 transition ${theme === "light"
                                        ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    <div className="text-2xl mb-2">☀️</div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-white">Sáng</div>
                                </button>

                                <button
                                    onClick={() => setTheme("dark")}
                                    className={`p-4 rounded-xl border-2 transition ${theme === "dark"
                                        ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🌙</div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-white">Tối</div>
                                </button>

                                <button
                                    onClick={() => setTheme("system")}
                                    className={`p-4 rounded-xl border-2 transition ${theme === "system"
                                        ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    <div className="text-2xl mb-2">💻</div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-white">Hệ thống</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learning Goals */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        🎯 Mục tiêu học tập
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Số từ mục tiêu mỗi ngày: <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">{dailyGoal}</span>
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                step="5"
                                value={dailyGoal}
                                onChange={(e) => setDailyGoal(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>5 từ</span>
                                <span>100 từ</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveDailyGoal}
                            disabled={loading}
                            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-semibold shadow-lg transition disabled:opacity-50"
                        >
                            {loading ? "Đang lưu..." : "💾 Lưu mục tiêu"}
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                        ⚠️ Vùng nguy hiểm
                    </h2>

                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300">
                            Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn bao gồm:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                            <li>Tất cả từ vựng đã lưu</li>
                            <li>Tất cả danh sách từ vựng</li>
                            <li>Lịch sử học tập và thống kê</li>
                            <li>Tiến độ và streak</li>
                        </ul>

                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg transition"
                        >
                            🗑️ Xóa tài khoản
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                            ⚠️ Xác nhận xóa tài khoản
                        </h3>

                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nhập <span className="font-bold text-red-600">XÓA</span> để xác nhận:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                                placeholder="XÓA"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setDeleteConfirmText("")
                                }}
                                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-semibold transition"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading || deleteConfirmText !== "XÓA"}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Đang xóa..." : "Xóa tài khoản"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
