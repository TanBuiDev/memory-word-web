import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import type { FilterShape } from "../../types/filters"
import { defaultFilters } from "../../types/filters"

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
        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
                {/* Trạng thái */}
                <div className="flex items-center gap-2 min-w-[150px]">
                    <label className="text-sm text-gray-600">Trạng thái</label>
                    <select
                        value={local.filterMemorized ?? "all"}
                        onChange={(e) =>
                            handleField(
                                "filterMemorized",
                                e.target.value as FilterShape["filterMemorized"]
                            )
                        }
                        className="px-2 py-1 border rounded w-36"
                    >
                        <option value="all">Tất cả</option>
                        <option value="memorized">Đã nhớ</option>
                        <option value="not_memorized">Chưa nhớ</option>
                    </select>
                </div>

                {/* Ngày từ → đến */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Ngày từ</label>
                    <input
                        type="date"
                        value={local.filterDateFrom ?? ""}
                        onChange={(e) =>
                            handleField("filterDateFrom", e.target.value || undefined)
                        }
                        className="px-2 py-1 border rounded w-36"
                    />
                    <label className="text-sm text-gray-600">đến</label>
                    <input
                        type="date"
                        value={local.filterDateTo ?? ""}
                        onChange={(e) =>
                            handleField("filterDateTo", e.target.value || undefined)
                        }
                        className="px-2 py-1 border rounded w-36"
                    />
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-2 min-w-40">
                    <label className="text-sm text-gray-600">Difficulty</label>
                    <select
                        value={local.filterDifficulty ?? ""}
                        onChange={(e) =>
                            handleField("filterDifficulty", e.target.value || undefined)
                        }
                        className="px-2 py-1 border rounded w-40"
                    >
                        <option value="">-- Any --</option>
                        {difficulties.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tags */}
                {/* <div className="flex-1 min-w-56">
                    <label className="text-sm text-gray-600">
                        Tags (comma separated)
                    </label>
                    <input
                        value={local.filterTags ?? ""}
                        onChange={(e) => handleField("filterTags", e.target.value)}
                        placeholder="e.g. phrasal,business"
                        className="w-full px-3 py-1 border rounded"
                    />
                </div> */}

                {/* Lưu preset */}
                {/* <div className="flex items-center gap-2 ml-auto">
                    <input
                        className="px-2 py-1 border rounded w-48"
                        placeholder="Tên preset"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && savePreset(presetName)}
                    />
                    <button
                        className="px-3 py-1 bg-fuchsia-600 text-white rounded"
                        onClick={() => savePreset(presetName)}
                    >
                        Lưu filter
                    </button>
                </div> */}
            </div>

            {/* Saved presets */}
            {/* {savedPresets.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                    {savedPresets.map((p) => (
                        <div
                            key={p.name}
                            className="bg-gray-100 px-3 py-1 rounded flex items-center gap-2"
                        >
                            <button
                                onClick={() => applyPreset(p)}
                                className="text-sm text-gray-700 hover:underline"
                            >
                                {p.name}
                            </button>
                            <button
                                onClick={() => deletePreset(p.name)}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                ✖
                            </button>
                        </div>
                    ))}
                </div>
            )} */}
        </div>
    )
}