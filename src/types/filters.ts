export type FilterShape = {
  filterMemorized?: "all" | "memorized" | "not_memorized"
  filterDateFrom?: string
  filterDateTo?: string
  filterDifficulty?: string
  filterTags?: string
  activeListId?: string | null
  sortMode?: "newest" | "az"
}

export const defaultFilters: FilterShape = {
  filterMemorized: "all",
  filterDateFrom: "",
  filterDateTo: "",
  filterDifficulty: "",
  filterTags: "",
  activeListId: null,
  sortMode: "newest"
}
