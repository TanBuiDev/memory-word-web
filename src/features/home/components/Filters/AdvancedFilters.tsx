import { useEffect, useState } from "react"
import { CheckCircle2, Calendar, Gauge, RotateCcw, Tag } from "lucide-react"
import type { User } from "firebase/auth"
import type { FilterShape } from "../../../../types/filters"
import { defaultFilters } from "../../../../types/filters"

interface Props {
    // CHỈ DÙNG defaultValue + onChange → kiểu “uncontrolled with callback”
    // → tránh vòng lặp khi parent truyền object mới mỗi lần render
    defaultValue?: FilterShape
    onChange?: (v: FilterShape) => void
    difficulties: string[]
    user: User | null
}

export default function AdvancedFilters({
    defaultValue,
    onChange,
    difficulties,
    //user,
}: Props) {
    // 1. FIXED: Dùng defaultValue thay vì value → tránh reference thay đổi liên tục
    const [local, setLocal] = useState<FilterShape>(() => ({
        ...defaultFilters,
        ...defaultValue,
    }))

    // const [presetName, setPresetName] = useState("")
    // const [savedPresets, setSavedPresets] = useState<
    //     Array<{ name: string; filter: FilterShape }>
    // >([])

    // 2. FIXED: Khi defaultValue thay đổi từ bên ngoài (ví dụ reset filter)
    //     thì đồng bộ lại local state – chỉ chạy khi thực sự cần
    useEffect(() => {
        if (defaultValue) {
            setLocal((prev) => {
                // So sánh đơn giản để tránh setState không cần thiết
                const keys: (keyof FilterShape)[] = [
                    "filterMemorized",
                    "filterDateFrom",
                    "filterDateTo",
                    "filterDifficulty",
                    "filterTags",
                ]
                const changed = keys.some(
                    (k) => prev[k] !== defaultValue[k]
                )
                return changed ? { ...defaultFilters, ...defaultValue } : prev
            })
        }
    }, [defaultValue])

    // 3. FIXED: Load presets chỉ khi user thay đổi
    // useEffect(() => {
    //     if (!user) {
    //         setSavedPresets([])
    //         return
    //     }
    //     try {
    //         const key = `filterPresets_${user.uid}`
    //         const raw = localStorage.getItem(key)
    //         if (raw) setSavedPresets(JSON.parse(raw))
    //     } catch (e) {
    //         console.warn("Failed to load filter presets:", e)
    //     }
    // }, [user])

    // const persistPresets = (
    //     arr: Array<{ name: string; filter: FilterShape }>
    // ) => {
    //     if (!user) return
    //     const key = `filterPresets_${user.uid}`
    //     try {
    //         localStorage.setItem(key, JSON.stringify(arr))
    //         setSavedPresets(arr)
    //     } catch (e) {
    //         console.warn("Failed to save presets:", e)
    //     }
    // }

    // const savePreset = (name: string) => {
    //     if (!user) return
    //     const p = {
    //         name: name || `Preset ${new Date().toLocaleString()}`,
    //         filter: local,
    //     }
    //     const next = [...savedPresets.filter((s) => s.name !== p.name), p]
    //     persistPresets(next)
    //     setPresetName("")
    // }

    // const applyPreset = (p: { name: string; filter: FilterShape }) => {
    //     setLocal({ ...defaultFilters, ...p.filter })
    //     // Thông báo ra ngoài ngay khi người dùng chọn preset
    //     if (onChange) Promise.resolve().then(() => onChange({ ...defaultFilters, ...p.filter }))
    // }

    // const deletePreset = (name: string) => {
    //     const next = savedPresets.filter((p) => p.name !== name)
    //     persistPresets(next)
    // }

    // 4. FIXED: Gọi onChange chỉ khi người dùng thay đổi field
    //     → không gọi trong useEffect chạy mỗi render nữa
    const handleField = <K extends keyof FilterShape>(k: K, v: FilterShape[K]) => {
        setLocal((prev) => {
            const next = { ...prev, [k]: v }
            if (onChange) Promise.resolve().then(() => onChange(next))
            return next
        })
    }

    return (
        <div className="space-y-4">
            {/* Status Filter */}
            <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                    Status
                </label>
                <select
                    value={local.filterMemorized ?? "all"}
                    onChange={(e) =>
                        handleField(
                            "filterMemorized",
                            e.target.value as FilterShape["filterMemorized"]
                        )
                    }
                    className="w-full px-3 py-2.5 border border-gray-300/60 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white hover:border-gray-400"
                >
                    <option value="all">All Words</option>
                    <option value="memorized">✓ Memorized</option>
                    <option value="not_memorized">○ Not Memorized</option>
                </select>
            </div>

            {/* Date Range */}
            <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                    Date Range
                </label>
                <div className="space-y-2">
                    <input
                        type="date"
                        value={local.filterDateFrom ?? ""}
                        onChange={(e) =>
                            handleField("filterDateFrom", e.target.value || undefined)
                        }
                        placeholder="From"
                        className="w-full px-3 py-2.5 border border-gray-300/60 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white hover:border-gray-400"
                    />
                    <input
                        type="date"
                        value={local.filterDateTo ?? ""}
                        onChange={(e) =>
                            handleField("filterDateTo", e.target.value || undefined)
                        }
                        placeholder="To"
                        className="w-full px-3 py-2.5 border border-gray-300/60 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white hover:border-gray-400"
                    />
                </div>
            </div>

            {/* Difficulty */}
            <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                    <Gauge className="h-3.5 w-3.5 text-indigo-600" />
                    Difficulty Level
                </label>
                <select
                    value={local.filterDifficulty ?? ""}
                    onChange={(e) =>
                        handleField("filterDifficulty", e.target.value || undefined)
                    }
                    className="w-full px-3 py-2.5 border border-gray-300/60 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white hover:border-gray-400"
                >
                    <option value="">All Levels</option>
                    {difficulties.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
            </div>

            {/* Reset Button */}
            {(local.filterMemorized !== "all" || local.filterDateFrom || local.filterDateTo || local.filterDifficulty) && (
                <button
                    onClick={() => {
                        const reset = {
                            filterMemorized: "all" as const,
                            filterDateFrom: undefined,
                            filterDateTo: undefined,
                            filterDifficulty: undefined,
                            filterTags: undefined
                        }
                        setLocal(reset)
                        if (onChange) onChange(reset)
                    }}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset Filters
                </button>
            )}
        </div>
    )
}