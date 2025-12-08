import type { User } from "firebase/auth"
import { Link } from "react-router-dom"

interface HeaderProps {
    user: User | null
    simple?: boolean
    onMenuClick?: () => void
}


export default function Header({
    user,
    simple = false,
    onMenuClick
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="mx-4 py-3 flex items-center justify-between">
                {/* Logo and Menu Button */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    {!simple && user && onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}

                    <Link to="/" className="flex items-center gap-2">
                        <div className="text-2xl font-bold bg-linear-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                            MemoryWord
                        </div>
                    </Link>
                </div>

                {/* Right side - Simple mode or empty */}
                {simple ? (
                    <Link to="/">
                        <button className="px-4 py-2 bg-yellow-400 text-fuchsia-900 rounded-full shadow hover:bg-yellow-300 transition">
                            Home
                        </button>
                    </Link>
                ) : (
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="hidden lg:flex items-center gap-3">
                                <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-40">
                                    {user.displayName}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}
