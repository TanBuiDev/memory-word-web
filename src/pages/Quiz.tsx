import { useState, useEffect } from "react"
import Flashcard from "../features/learning/components/quiz/Flashcard"
import MultipleChoice from "../features/learning/components/quiz/MultipleChoice"
import FillInBlank from "../features/learning/components/quiz/FillInBlank"
import { collection, getDocs, query, where, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore"
import { db } from "../firebase"
import type { Word } from "../types/word"
import type { User } from "firebase/auth"
import Header from "../features/learning/components/Header"

export default function Quiz({ user }: { user: User }) {
    const [words, setWords] = useState<Word[]>([])
    const [lists, setLists] = useState<Array<{ id: string; name: string; words: string[] }>>([])
    const [current, setCurrent] = useState(0)
    const [mode, setMode] = useState<"flashcard" | "mcq" | "fill">("flashcard")
    const [selectionMode, setSelectionMode] = useState<"random" | "byList" | "chooseNumber">("random")
    const [selectedListId, setSelectedListId] = useState<string | null>(null)
    const [numWords, setNumWords] = useState<number>(10)
    const [quizQueue, setQuizQueue] = useState<Word[]>([])

    useEffect(() => {
        async function load() {
            const q = query(collection(db, "words"), where("userId", "==", user.uid))
            const snap = await getDocs(q)
            const list = snap.docs.map((d) => {
                const docData = d.data()
                return {
                    id: d.id,
                    term: docData.term ?? "",
                    phonetic: docData.phonetic ?? "",
                    audio: docData.audio ?? "",
                    shortMeaning: docData.shortMeaning ?? "",
                    meanings: Array.isArray(docData.meanings) ? docData.meanings : [],
                    memorized: !!docData.memorized,
                    note: docData.note ?? "",
                    userId: docData.userId,
                    createdAt: docData.createdAt?.toMillis?.() ?? 0,
                    createdAtClient: docData.createdAtClient ?? 0,
                    // optional stats if present
                    seenCount: docData.seenCount ?? 0,
                    incorrectCount: docData.incorrectCount ?? 0,
                    lastSeenAt: docData.lastSeenAt ?? null
                } satisfies Word
            })

            setWords(list)

            // Load lists (categories) to allow choosing by list
            try {
                const listsSnap = await getDocs(query(collection(db, "lists"), where("userId", "==", user.uid)))
                const l = listsSnap.docs.map(d => {
                    const data = d.data() as { name?: string; words?: string[] } | undefined
                    return {
                        id: d.id,
                        name: data?.name ?? d.id,
                        words: Array.isArray(data?.words) ? data!.words : [],
                    }
                })
                setLists(l)
            } catch (e) {
                // non-critical
                console.warn("Failed to load lists:", e)
            }
        }

        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const next = () => {
        setCurrent(prev => (prev + 1 < quizQueue.length ? prev + 1 : 0))
    }

    // Build quiz queue according to selectionMode
    useEffect(() => {
        // Build queue helper: separated so UI can trigger rebuild explicitly
        const rebuildQueue = () => {
            if (!words || words.length === 0) return

            let pool = words.slice()
            if (selectionMode === "byList" && selectedListId) {
                // find list and filter
                const list = lists.find(l => l.id === selectedListId)
                if (list && Array.isArray(list.words)) {
                    pool = pool.filter(w => list.words.includes(w.id))
                }
            }

            // shuffle
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                    ;[pool[i], pool[j]] = [pool[j], pool[i]]
            }

            let q = pool
            if (selectionMode === "chooseNumber") {
                q = pool.slice(0, Math.max(1, Math.min(pool.length, numWords)))
            }

            // default random uses first N (numWords) if smaller than pool
            if (selectionMode === "random") {
                q = pool.slice(0, Math.max(1, Math.min(pool.length, numWords)))
            }

            setQuizQueue(q)
            setCurrent(0)
        }

        // call on deps change
        rebuildQueue()
    }, [words, lists, selectionMode, selectedListId, numWords])

    // expose rebuild function for manual control (Start/Refresh button)
    const rebuildQueue = () => {
        if (!words || words.length === 0) return

        let pool = words.slice()
        if (selectionMode === "byList" && selectedListId) {
            const list = lists.find(l => l.id === selectedListId)
            if (list && Array.isArray(list.words)) {
                pool = pool.filter(w => list.words.includes(w.id))
            }
        }

        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[pool[i], pool[j]] = [pool[j], pool[i]]
        }

        let q = pool
        if (selectionMode === "chooseNumber") {
            q = pool.slice(0, Math.max(1, Math.min(pool.length, numWords)))
        }
        if (selectionMode === "random") {
            q = pool.slice(0, Math.max(1, Math.min(pool.length, numWords)))
        }

        setQuizQueue(q)
        setCurrent(0)
    }

    // Handler wrapper for answers: record interaction and increment seenCount optimistically
    const handleAnswer = async (isCorrect: boolean) => {
        const currentWord = quizQueue[current]
        if (!currentWord) return

        // Local optimistic update: update local arrays so UI updates even if server rules block writes
        setWords(prev => prev.map(w => w.id === currentWord.id ? { ...w, seenCount: (w.seenCount ?? 0) + 1 } : w))
        setQuizQueue(prev => prev.map(w => w.id === currentWord.id ? { ...w, seenCount: (w.seenCount ?? 0) + 1 } : w))

        // record lightweight interaction (non-blocking)
        addDoc(collection(db, "interaction_log"), {
            userId: user.uid,
            wordId: currentWord.id,
            type: `quiz_${mode}`,
            correct: !!isCorrect,
            timestamp: serverTimestamp(),
        }).catch((e) => console.warn("Failed to record interaction (Quiz):", e))

        // attempt optimistic server update; if rules block this will fail but local state already reflects the change
        updateDoc(doc(db, "words", currentWord.id), {
            seenCount: increment(1),
            lastSeenAt: serverTimestamp(),
            lastResult: isCorrect ? 'correct' : 'wrong'
        }).catch((e) => {
            console.warn("Optimistic update failed (Quiz) — leaving local state in place:", e)
        })

        // advance
        next()
    }

    if (!quizQueue || quizQueue.length === 0) return <p>Đang tải...</p>

    const word = quizQueue[current]

    return (
        <div>
            {/* 🎨 Nền Gradient: Đồng bộ với Home (fuchsia/rose/violet nhẹ) */}
            <div className="min-h-screen bg-linear-to-br from-fuchsia-50 via-rose-50 to-violet-50 py-1">
                <Header user={user} simple />
                <div className="max-w-xl mx-auto my-10 bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {/* 🎨 Tiêu đề: Dùng màu fuchsia đậm */}
                    <h1 className="text-3xl font-bold text-center text-fuchsia-700">📝 Quiz Ôn Tập</h1>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setMode("flashcard")}
                            // 🎨 Nút Active: bg-fuchsia-600
                            className={`px-4 py-2 rounded-lg font-semibold shadow transition ${mode === "flashcard"
                                ? "bg-fuchsia-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Flashcard
                        </button>

                        <button
                            onClick={() => setMode("mcq")}
                            // 🎨 Nút Active: bg-fuchsia-600
                            className={`px-4 py-2 rounded-lg font-semibold shadow transition ${mode === "mcq"
                                ? "bg-fuchsia-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Trắc nghiệm
                        </button>

                        <button
                            onClick={() => setMode("fill")}
                            // 🎨 Nút Active: bg-fuchsia-600
                            className={`px-4 py-2 rounded-lg font-semibold shadow transition ${mode === "fill"
                                ? "bg-fuchsia-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Điền từ
                        </button>
                    </div>

                    {/* Selection controls */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <label className="text-sm">Chọn từ:</label>
                        <select
                            value={selectionMode}
                            onChange={(e) => setSelectionMode(e.target.value as "random" | "byList" | "chooseNumber")}
                            className="px-3 py-2 rounded-lg border"
                        >
                            <option value="random">Ngẫu nhiên</option>
                            <option value="byList">Theo danh sách</option>
                            <option value="chooseNumber">Số lượng</option>
                        </select>

                        {selectionMode === "byList" && (
                            <select
                                value={selectedListId ?? ""}
                                onChange={(e) => setSelectedListId(e.target.value || null)}
                                className="px-3 py-2 rounded-lg border"
                            >
                                <option value="">-- Chọn danh sách --</option>
                                {lists.map(l => (
                                    <option key={l.id} value={l.id}>{l.name ?? l.id}</option>
                                ))}
                            </select>
                        )}

                        {(selectionMode === "chooseNumber" || selectionMode === "random") && (
                            <input
                                type="number"
                                min={1}
                                max={Math.max(1, words.length)}
                                value={numWords}
                                onChange={(e) => setNumWords(Math.max(1, Number(e.target.value) || 1))}
                                className="w-20 px-2 py-2 rounded-lg border"
                            />
                        )}

                        <button onClick={rebuildQueue} className="px-4 py-2 rounded bg-fuchsia-600 text-white">Bắt đầu / Làm mới</button>
                    </div>

                    {mode === "flashcard" && <Flashcard word={word} onNext={(isCorrect: boolean) => handleAnswer(isCorrect)} />}
                    {mode === "mcq" && <MultipleChoice words={quizQueue} correctWord={word} onNext={(isCorrect: boolean) => handleAnswer(isCorrect)} />}
                    {mode === "fill" && <FillInBlank word={word} onNext={(isCorrect: boolean) => handleAnswer(isCorrect)} />}
                </div>
            </div>
        </div>
    )
}