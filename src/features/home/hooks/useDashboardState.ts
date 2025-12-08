import { useState, useEffect, useMemo } from "react"
import useDebounce from "../../../hooks/useDebounce"
import type { FilterShape } from "../../../types/filters"
import { defaultFilters } from "../../../types/filters"
import type { Word } from "../../../types/word"
import type { WordList } from "../../../types/list"

/**
 * Hook để quản lý state của Dashboard (filters, search, sort, etc.)
 */
export function useDashboardState(words: Word[], lists: WordList[]) {
    // Search state
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 300)

    // Filter & Sort state
    const [activeListId, setActiveListId] = useState<string | null>(null)
    const [sortMode, setSortMode] = useState<"newest" | "az">("newest")
    const [filters, setFilters] = useState<FilterShape>(defaultFilters)

    // Sync filters.activeListId with activeListId
    useEffect(() => {
        if ((filters.activeListId ?? null) !== activeListId) {
            setActiveListId(filters.activeListId ?? null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.activeListId])

    useEffect(() => {
        if ((filters.activeListId ?? null) !== activeListId) {
            setFilters(prev => ({ ...prev, activeListId }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeListId])

    // Filter and sort words
    const filteredWords = useMemo(() => {
        let result = words.filter(w =>
            activeListId === null
                ? true
                : lists.find(l => l.id === activeListId)?.words.includes(w.id)
        )

        // Apply search filter
        const normalizedSearch = debouncedSearch.trim().toLowerCase()
        if (normalizedSearch) {
            result = result.filter(w =>
                w.term.toLowerCase().includes(normalizedSearch) ||
                (w.shortMeaning ?? "").toLowerCase().includes(normalizedSearch)
            )
        }

        // Apply advanced filters
        if ((filters.filterMemorized ?? "all") !== "all") {
            result = result.filter(w => 
                filters.filterMemorized === "memorized" ? !!w.memorized : !w.memorized
            )
        }

        if (filters.filterDateFrom) {
            const fromMs = new Date(filters.filterDateFrom).setHours(0, 0, 0, 0)
            result = result.filter(w => (w.createdAtClient ?? w.createdAt ?? 0) >= fromMs)
        }

        if (filters.filterDateTo) {
            const toMs = new Date(filters.filterDateTo).setHours(23, 59, 59, 999)
            result = result.filter(w => (w.createdAtClient ?? w.createdAt ?? 0) <= toMs)
        }

        if (filters.filterDifficulty) {
            result = result.filter(w => (w.difficulty ?? "") === filters.filterDifficulty)
        }

        const tagFilterVal = (filters.filterTags ?? "").trim()
        if (tagFilterVal) {
            const wanted = tagFilterVal.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
            if (wanted.length > 0) {
                result = result.filter(w => {
                    const tags = (w.tags ?? []).map((t: string) => t.toLowerCase())
                    return wanted.every(t => tags.includes(t))
                })
            }
        }

        // Sort
        result = [...result].sort((a, b) => {
            if (sortMode === "az") return a.term.localeCompare(b.term)
            return (a.createdAtClient ?? 0) < (b.createdAtClient ?? 0) ? 1 : -1
        })

        return result
    }, [words, lists, activeListId, debouncedSearch, filters, sortMode])

    // Search suggestions
    const searchSuggestions = useMemo(() => {
        const normalizedSearch = debouncedSearch.trim().toLowerCase()
        if (!normalizedSearch) return []
        return words
            .filter(w =>
                w.term.toLowerCase().includes(normalizedSearch) ||
                (w.shortMeaning ?? "").toLowerCase().includes(normalizedSearch)
            )
            .slice(0, 5)
    }, [debouncedSearch, words])

    // Difficulties list
    const difficulties = useMemo(() => {
        const s = new Set<string>()
        words.forEach(w => { if (w.difficulty) s.add(w.difficulty) })
        return Array.from(s)
    }, [words])

    // Delete confirmation data
    const activeList = lists.find(l => l.id === activeListId)
    const deleteTargetName = activeList ? `danh mục "${activeList.name}"` : "tài khoản của bạn"
    const deleteCount = filteredWords.length

    return {
        // Search
        searchInput,
        setSearchInput,
        searchSuggestions,
        
        // Filter & Sort
        activeListId,
        setActiveListId,
        sortMode,
        setSortMode,
        filters,
        setFilters,
        
        // Computed values
        filteredWords,
        difficulties,
        deleteTargetName,
        deleteCount
    }
}

