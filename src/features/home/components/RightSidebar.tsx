import { useState } from "react"
import { X, Filter, BarChart3, ChevronDown, ChevronUp, TrendingUp, BookOpen, Info } from "lucide-react"
import type { User } from "firebase/auth"
import type { FilterShape } from "../../../types/filters"
import AdvancedFilters from "./Filters/AdvancedFilters"
import WordStats from "./WordStats"

interface RightSidebarProps {
    user: User | null
    isOpen: boolean
    onClose: () => void
    filters: FilterShape
    onFiltersChange: (filters: FilterShape) => void
    difficulties: string[]
    totalWords: number
    memorizedCount: number
    listCount: number
}

export default function RightSidebar({
    user,
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    difficulties,
    totalWords,
    memorizedCount,
    listCount
}: RightSidebarProps) {
    const [showFilters, setShowFilters] = useState(true)
    const [showStats, setShowStats] = useState(true)

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Right Sidebar */}
            <div
                className={`
                    fixed lg:static top-0 right-0 h-screen lg:h-full
                    w-80 bg-white/80 backdrop-blur-md
                    border-l border-gray-200/80 shadow-xl lg:shadow-sm
                    transform transition-transform duration-300 ease-in-out z-40
                    ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
                    flex flex-col
                `}
            >
                {/* Header - Mobile Only */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200/60 lg:hidden">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <Filter className="h-4 w-4 text-indigo-600" />
                        </div>
                    <h2 className="text-lg font-bold text-gray-800">Filters & Stats</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        aria-label="Close sidebar"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 lg:overflow-visible">
                    {/* Stats Section */}
                    <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-lg shadow-indigo-100/20 border border-gray-200/60 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300">
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="w-full flex items-center justify-between p-5 hover:bg-indigo-50/50 transition-all duration-300 rounded-t-2xl"
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-semibold text-gray-800">Statistics</h3>
                            </div>
                            {showStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showStats && (
                            <div className="p-5 pt-0 pb-5">
                                <WordStats
                                    totalWords={totalWords}
                                    memorizedCount={memorizedCount}
                                    listCount={listCount}
                                />
                            </div>
                        )}
                    </div>

                    {/* Filters Section */}
                    <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-lg shadow-purple-100/20 border border-gray-200/60 overflow-hidden hover:shadow-xl hover:shadow-purple-100/30 transition-all duration-300">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full flex items-center justify-between p-5 hover:bg-purple-50/50 transition-all duration-300 rounded-t-2xl"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-semibold text-gray-800">Advanced Filters</h3>
                            </div>
                            {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showFilters && (
                            <div className="p-5 pt-0 pb-5">
                                <AdvancedFilters
                                    defaultValue={filters}
                                    onChange={onFiltersChange}
                                    difficulties={difficulties}
                                    user={user}
                                />
                            </div>
                        )}
                    </div>

                    {/* Quick Info */}
                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-indigo-100/60 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-indigo-100 rounded-lg">
                                <Info className="h-4 w-4 text-indigo-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm">Quick Info</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between p-2.5 bg-white/60 rounded-lg hover:bg-white/80 transition-colors">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                                    <span className="text-gray-700 font-medium">Progress</span>
                                </div>
                                <span className="font-bold text-indigo-700">
                                    {totalWords > 0 ? Math.round((memorizedCount / totalWords) * 100) : 0}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white/60 rounded-lg hover:bg-white/80 transition-colors">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-orange-600" />
                                    <span className="text-gray-700 font-medium">Remaining</span>
                                </div>
                                <span className="font-bold text-orange-600">
                                    {totalWords - memorizedCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

