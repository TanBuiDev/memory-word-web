import { useState } from "react"
import { X, Filter, BarChart3, ChevronDown, ChevronUp } from "lucide-react"
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
                    w-80 bg-white/70 backdrop-blur-sm
                    border-l border-gray-200 shadow-xl lg:shadow-none
                    transform transition-transform duration-300 ease-in-out z-40
                    ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
                    flex flex-col
                `}
            >
                {/* Header - Mobile Only */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
                    <h2 className="text-lg font-bold text-gray-800">Filters & Stats</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 lg:overflow-visible">
                    {/* Stats Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition rounded-t-xl"
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-semibold text-gray-800">Statistics</h3>
                            </div>
                            {showStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showStats && (
                            <div className="p-4 pt-0">
                                <WordStats
                                    totalWords={totalWords}
                                    memorizedCount={memorizedCount}
                                    listCount={listCount}
                                />
                            </div>
                        )}
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition rounded-t-xl"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-semibold text-gray-800">Advanced Filters</h3>
                            </div>
                            {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showFilters && (
                            <div className="p-4 pt-0">
                                <AdvancedFilters
                                    defaultValue={filters}
                                    onChange={onFiltersChange}
                                    difficulties={difficulties}
                                    user={user}
                                />
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Quick Info</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-indigo-700">
                                    {totalWords > 0 ? Math.round((memorizedCount / totalWords) * 100) : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Remaining</span>
                                <span className="font-semibold text-orange-600">
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

