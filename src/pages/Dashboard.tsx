import { useEffect, useState, useRef, useMemo } from "react"
import Sidebar from "../features/home/components/Sidebar"
import RightSidebar from "../features/home/components/RightSidebar"
import QuickStartGuide from "../features/home/components/QuickStartGuide"
import WordSearchBar from "../features/vocabulary/components/WordSearchBar"
import Header from "../components/layout/Header"
import Background from "../components/layout/Background"
import ScrollToTopButton from "../components/ui/ScrollToTopButton"
import Pagination from "../components/ui/Pagination"

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "firebase/firestore"

import { db, auth } from "../firebase"
import ManualToeicForm from "../features/vocabulary/components/ManualToeicForm"
// import AdvancedFilters from "../features/home/components/Filters/AdvancedFilters"
import { warmUpAIModel } from "../utils/aiService"
import { useAuthStore } from "../stores/useAuthStore"

// Icons
import { Menu, X } from "lucide-react"

// Components
import WelcomeBanner from "../features/home/components/WelcomeBanner"
import AddWordForm from "../features/home/components/AddWordForm"
// import WordStats from "../features/home/components/WordStats"
import CategoryFilter from "../features/home/components/CategoryFilter"
import SortAndActions from "../features/home/components/SortAndActions"
import WordListSection from "../features/home/components/WordListSection"
import DeleteConfirmationModal from "../features/home/components/DeleteConfirmationModal"

// Custom Hooks
import { useWordCollection } from "../features/home/hooks/useWordCollection"
import { useWordActions } from "../features/home/hooks/useWordActions"
import { useDashboardState } from "../features/home/hooks/useDashboardState"

export default function Dashboard() {
    const { user } = useAuthStore();

    // Fetch data from Firestore
    const { words, lists } = useWordCollection(user)

    // Word actions (CRUD operations)
    const [defaultListId, setDefaultListId] = useState<string | "__default__" | null>(null)
    const {
        loading,
        message,
        setMessage,
        addWord: handleAddWord,
        toggleMemorized,
        deleteWord,
        addNote,
        addToList,
        deleteAllWords,
        playAudio
    } = useWordActions(user, lists, defaultListId)

    // Dashboard state (filters, search, sort)
    const {
        searchInput,
        setSearchInput,
        searchSuggestions,
        activeListId,
        setActiveListId,
        sortMode,
        setSortMode,
        filters,
        setFilters,
        filteredWords,
        difficulties,
        deleteTargetName,
        deleteCount
    } = useDashboardState(words, lists)

    // Local UI state
    const [term, setTerm] = useState("")
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
    const [showQuickStart, setShowQuickStart] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [showRightSidebar, setShowRightSidebar] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(20) // 20 words per page

    // Form nhập tay TOEIC
    const [showManualForm, setShowManualForm] = useState(false)
    const [manualTerm, setManualTerm] = useState("")
    const [manualPhonetic, setManualPhonetic] = useState("")
    const [manualAudio, setManualAudio] = useState("")
    const [manualExample, setManualExample] = useState("")
    const [manualMeanings, setManualMeanings] = useState([{ pos: "", meaning: "" }])
    const [manualTags, setManualTags] = useState("")
    const [unit, setUnit] = useState("")
    const [isEditingToeic, setIsEditingToeic] = useState(false)
    const [editingWordId, setEditingWordId] = useState("")

    // Track if AI model has been warmed up
    const aiWarmedUpRef = useRef(false)

    // Show last quiz recall notification
    useEffect(() => {
        if (!user) return
        const key = `lastQuizRecall_${user.uid}`
        const v = localStorage.getItem(key)
        if (v) {
            setMessage(`Phiên vừa xong — Khả năng nhớ trung bình: ${v}%`)
            localStorage.removeItem(key)
            setTimeout(() => setMessage(""), 4500)
        }
    }, [user, setMessage])

    // Warm up AI model
    useEffect(() => {
        if (!user) {
            aiWarmedUpRef.current = false
            return
        }

        if (aiWarmedUpRef.current) return

        const timeoutId = setTimeout(() => {
            if (words.length > 0 && !aiWarmedUpRef.current) {
                warmUpAIModel(words[0].id)
                aiWarmedUpRef.current = true
            } else if (words.length === 0 && !aiWarmedUpRef.current) {
                warmUpAIModel()
                aiWarmedUpRef.current = true
            }
        }, 1500)

        return () => clearTimeout(timeoutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, words.length])

    // Hàm thêm trường nghĩa
    const addMoreMeaning = () => {
        setManualMeanings([...manualMeanings, { pos: "", meaning: "" }])
    }

    const removeMeaning = (i: number) => {
        setManualMeanings(manualMeanings.filter((_, idx) => idx !== i))
    }

    const updateMeaning = (i: number, field: "pos" | "meaning", value: string) => {
        const updated = [...manualMeanings]
        updated[i][field] = value
        setManualMeanings(updated)
    }

    // RESET FORM
    const resetForm = () => {
        setShowManualForm(false)
        setIsEditingToeic(false)
        setEditingWordId("")
        setManualTerm("")
        setManualPhonetic("")
        setManualAudio("")
        setManualExample("")
        setUnit("")
        setManualMeanings([{ pos: "", meaning: "" }])
        setManualTags("")
    }

    // LƯU TỪ TOEIC MỚI
    const saveToeicWord = async () => {
        if (!user) return

        const tagsArr = manualTags.split(",").map(t => t.trim()).filter(Boolean)

        await addDoc(collection(db, "words"), {
            term: manualTerm,
            phonetic: manualPhonetic,
            audio: manualAudio,
            shortMeaning: manualMeanings[0]?.meaning || "",
            meanings: manualMeanings.map(m => ({
                partOfSpeech: m.pos,
                definitions: [
                    {
                        definition: m.meaning,
                        example: manualExample
                    }
                ]
            })),
            note: "",
            memorized: false,
            tags: tagsArr,
            difficulty: "",
            userId: user.uid,
            createdAt: serverTimestamp(),
            createdAtClient: Date.now(),
            toeic: {
                isToeic: true,
                unit
            }
        })

        resetForm()
    }

    // CẬP NHẬT TỪ TOEIC
    const updateToeicWord = async () => {
        if (!editingWordId) return

        const tagsArr = manualTags.split(",").map(t => t.trim()).filter(Boolean)

        await updateDoc(doc(db, "words", editingWordId), {
            term: manualTerm,
            phonetic: manualPhonetic,
            audio: manualAudio,
            shortMeaning: manualMeanings[0]?.meaning || "",
            meanings: manualMeanings.map(m => ({
                partOfSpeech: m.pos,
                definitions: [
                    {
                        definition: m.meaning,
                        example: manualExample
                    }
                ]
            })),
            tags: tagsArr,
            difficulty: "",
            toeic: { isToeic: true, unit }
        })

        resetForm()
    }

    // Add word handler
    const addWord = async (wordToAdd?: string) => {
        const termToProcess = wordToAdd || term
        if (!termToProcess.trim()) return

        const result = await handleAddWord(termToProcess, words)

        if (result.needsManualForm) {
            setManualTerm(termToProcess.trim().toLowerCase())
            setShowManualForm(true)
            return
        }

        if (result.success) {
            setTerm("")
        }
    }

    // Delete all words handler
    const handleDeleteAllWords = async () => {
        await deleteAllWords(filteredWords)
        setShowDeleteAllConfirm(false)
    }

    // Quick Start Guide
    useEffect(() => {
        if (!user) return

        const hasSeenGuide = localStorage.getItem(`quickStart_${user.uid}`)
        const isFirstTime = words.length === 0 && !hasSeenGuide

        const shouldShow = localStorage.getItem(`showQuickStart_${user.uid}`) === "true" || isFirstTime
        setShowQuickStart(shouldShow)
    }, [user, words.length])

    const handleQuickStartComplete = () => {
        if (user) {
            localStorage.setItem(`quickStart_${user.uid}`, "true")
            localStorage.removeItem(`showQuickStart_${user.uid}`)
        }
        setShowQuickStart(false)
    }

    // Pagination logic
    const totalPages = Math.ceil(filteredWords.length / itemsPerPage)
    const paginatedWords = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredWords.slice(startIndex, endIndex)
    }, [filteredWords, currentPage, itemsPerPage])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filters, activeListId, searchInput, sortMode])

    // RENDER
    return (
        <div className="min-h-screen">
            <Header />
            <Background />

            {/* Mobile Menu Buttons */}
            <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="fixed top-24 left-4 z-40 lg:hidden p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg"
            >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            <button
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className="fixed top-24 right-4 z-40 lg:hidden p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg"
            >
                {showRightSidebar ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Main Layout - Three Column */}
            <div className="flex min-h-screen pt-24">
                {/* Left Sidebar - Desktop */}
                <aside className="hidden lg:block shrink-0 border-r border-gray-200 bg-white/50 backdrop-blur-sm sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
                    <Sidebar
                        user={user}
                        words={words}
                        lists={lists}
                        onAddList={async (name: string) => {
                            if (!user) return
                            await addDoc(collection(db, "lists"), {
                                name,
                                words: [],
                                userId: user.uid
                            })
                        }}
                        onRenameList={async (id: string, name: string) => {
                            await updateDoc(doc(db, "lists", id), { name })
                        }}
                        onDeleteList={async (id: string) => {
                            await deleteDoc(doc(db, "lists", id))
                        }}
                        onSignOut={() => auth.signOut()}
                        defaultListId={defaultListId}
                        setDefaultListId={setDefaultListId}
                        onShowQuickStart={() => {
                            if (user) {
                                localStorage.setItem(`showQuickStart_${user.uid}`, "true")
                                setShowQuickStart(true)
                            }
                        }}
                        isOpen={showMobileMenu}
                        onClose={() => setShowMobileMenu(false)}
                    />
                </aside>

                {/* Main Content - Center Column */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Welcome Header */}
                        <WelcomeBanner user={user} />

                        {/* Search Bar */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-4 relative z-30">
                            <WordSearchBar
                                value={searchInput}
                                onChange={setSearchInput}
                                suggestions={searchSuggestions}
                                onSelect={(word) => {
                                    setSearchInput(word.term)
                                    const element = document.getElementById(`word-${word.id}`)
                                    if (element) {
                                        element.scrollIntoView({ behavior: "smooth", block: "center" })
                                    }
                                }}
                            />
                        </div>

                        {/* Add Word Section */}
                        <div className="relative z-20">
                            <AddWordForm
                                term={term}
                                setTerm={setTerm}
                                loading={loading}
                                onAddWord={addWord}
                                message={message}
                            />
                        </div>

                        {/* FORM NHẬP TAY TOEIC */}
                        {showManualForm && (
                            <div className="mt-6">
                                <ManualToeicForm
                                    lists={lists}
                                    manualTerm={manualTerm}
                                    setManualTerm={setManualTerm}
                                    manualPhonetic={manualPhonetic}
                                    setManualPhonetic={setManualPhonetic}
                                    manualAudio={manualAudio}
                                    setManualAudio={setManualAudio}
                                    manualExample={manualExample}
                                    setManualExample={setManualExample}
                                    manualMeanings={manualMeanings}
                                    addMoreMeaning={addMoreMeaning}
                                    updateMeaning={updateMeaning}
                                    removeMeaning={removeMeaning}
                                    unit={unit}
                                    setUnit={setUnit}
                                    close={resetForm}
                                    save={saveToeicWord}
                                    edit={isEditingToeic}
                                    update={updateToeicWord}
                                    manualTags={manualTags}
                                    setManualTags={setManualTags}
                                />
                            </div>
                        )}

                        {/* Category & Sort Section */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-5">
                            {/* Category Tabs */}
                            <CategoryFilter
                                lists={lists}
                                activeListId={activeListId}
                                setActiveListId={setActiveListId}
                                totalWords={words.length}
                            />

                            {/* Sort & Filter Controls */}
                            <SortAndActions
                                sortMode={sortMode}
                                setSortMode={setSortMode}
                                onDeleteAllClick={() => setShowDeleteAllConfirm(true)}
                                wordCount={filteredWords.length}
                                loading={loading}
                            />
                        </div>

                        {/* Word List with Pagination */}
                        <div className="space-y-4">
                            <WordListSection
                                words={paginatedWords}
                                onDelete={deleteWord}
                                onToggleMemorized={toggleMemorized}
                                onPlayAudio={playAudio}
                                onAddNote={addNote}
                                onAddToList={addToList}
                                lists={lists}
                                searchInput={searchInput}
                            />

                            {/* Pagination */}
                            {filteredWords.length > 0 && (
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredWords.length}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Filters & Stats */}
                <aside className="hidden lg:block shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
                    <RightSidebar
                        user={user}
                        isOpen={showRightSidebar}
                        onClose={() => setShowRightSidebar(false)}
                        filters={filters}
                        onFiltersChange={setFilters}
                        difficulties={difficulties}
                        totalWords={words.length}
                        memorizedCount={words.filter(w => w.memorized).length}
                        listCount={lists.length}
                    />
                </aside>
            </div>

            {/* Mobile Left Sidebar */}
            <div className="lg:hidden">
                <Sidebar
                    user={user}
                    words={words}
                    lists={lists}
                    onAddList={async (name: string) => {
                        if (!user) return
                        await addDoc(collection(db, "lists"), {
                            name,
                            words: [],
                            userId: user.uid
                        })
                    }}
                    onRenameList={async (id: string, name: string) => {
                        await updateDoc(doc(db, "lists", id), { name })
                    }}
                    onDeleteList={async (id: string) => {
                        await deleteDoc(doc(db, "lists", id))
                    }}
                    onSignOut={() => auth.signOut()}
                    defaultListId={defaultListId}
                    setDefaultListId={setDefaultListId}
                    onShowQuickStart={() => {
                        if (user) {
                            localStorage.setItem(`showQuickStart_${user.uid}`, "true")
                            setShowQuickStart(true)
                        }
                    }}
                    isOpen={showMobileMenu}
                    onClose={() => setShowMobileMenu(false)}
                />
            </div>

            {/* MODAL XÁC NHẬN XÓA */}
            <DeleteConfirmationModal
                isOpen={showDeleteAllConfirm}
                onClose={() => setShowDeleteAllConfirm(false)}
                onConfirm={handleDeleteAllWords}
                count={deleteCount}
                targetName={deleteTargetName}
            />

            {/* Quick Start Guide */}
            {showQuickStart && user && (
                <QuickStartGuide
                    onComplete={handleQuickStartComplete}
                    userHasWords={words.length > 0}
                />
            )}

            <ScrollToTopButton />
        </div>
    )
}