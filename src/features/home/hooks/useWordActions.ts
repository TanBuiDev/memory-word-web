import { useState } from "react"
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    writeBatch
} from "firebase/firestore"
import { db } from "../../../firebase"
import type { Word } from "../../../types/word"
import type { WordList } from "../../../types/list"
import type { DicEntry } from "../../../types/dictionary"
import type { User } from "firebase/auth"

/**
 * Hook để quản lý các hành động CRUD với từ vựng
 */
export function useWordActions(user: User | null, lists: WordList[], defaultListId: string | "__default__" | null) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [messageCooldown, setMessageCooldown] = useState(false)

    // Fetch word data from dictionary API
    const fetchWordData = async (word: string): Promise<Omit<Word, "id" | "userId"> | null> => {
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)

            if (!res.ok) return null

            const data = (await res.json()) as DicEntry[]
            if (!Array.isArray(data) || !data[0]) return null

            const entry = data[0]

            const phonetic = entry.phonetic ?? entry.phonetics?.[0]?.text ?? ""
            const audio = entry.phonetics?.find(p => p.audio)?.audio ?? ""

            const meanings = entry.meanings?.map(m => ({
                partOfSpeech: m.partOfSpeech ?? "",
                definitions: m.definitions?.map(d => ({
                    definition: d.definition ?? "",
                    example: d.example ?? ""
                })) ?? []
            })) ?? []

            let shortMeaning = entry.word ?? word;

            // Translate EN → VI
            try {
                const resVi = await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(entry.word)}&langpair=en|vi`
                );

                if (resVi.ok) {
                    const json = await resVi.json();
                    const text = json?.responseData?.translatedText;
                    if (text) shortMeaning = text;
                }
            } catch (e) {
                console.warn("Translate failed:", e);
            }

            return {
                term: entry.word ?? word,
                phonetic,
                audio,
                memorized: false,
                meanings,
                note: "",
                shortMeaning
            }
        } catch {
            return null
        }
    }

    // Add word from API or manual form
    const addWord = async (wordToAdd: string, existingWords: Word[]): Promise<{ success: boolean; needsManualForm?: boolean }> => {
        if (!user) {
            setMessage("Vui lòng đăng nhập.")
            return { success: false }
        }

        if (!wordToAdd.trim()) return { success: false }

        const newTerm = wordToAdd.trim().toLowerCase()

        if (messageCooldown) return { success: false }

        // Check duplicate
        if (existingWords.some(w => w.term.toLowerCase() === newTerm)) {
            setMessage("Từ này đã có trong danh sách!");
            setMessageCooldown(true);

            setTimeout(() => {
                setMessage("");
                setMessageCooldown(false);
            }, 2000);

            return { success: false }
        }

        setLoading(true)
        const payload = await fetchWordData(newTerm)
        setLoading(false)

        // If API doesn't return data, need manual form
        if (!payload || payload.term.toLowerCase() !== newTerm) {
            return { success: false, needsManualForm: true }
        }

        // Add to Firestore
        const ref = await addDoc(collection(db, "words"), {
            ...payload,
            tags: [],
            difficulty: "",
            userId: user.uid,
            createdAt: serverTimestamp(),
            createdAtClient: Date.now()
        })

        setMessage("Đã thêm từ.")

        // Add to default list if exists
        if (defaultListId && defaultListId !== "__default__") {
            await updateDoc(doc(db, "lists", defaultListId), {
                words: arrayUnion(ref.id)
            })
        }

        return { success: true }
    }

    // Toggle memorized status
    const toggleMemorized = async (word: Word) => {
        await updateDoc(doc(db, "words", word.id), { memorized: !word.memorized })
    }

    // Delete word
    const deleteWord = async (word: Word) => {
        // Remove from all lists
        await Promise.all(
            lists.map(async l => {
                if (l.words.includes(word.id)) {
                    await updateDoc(doc(db, "lists", l.id), { words: arrayRemove(word.id) })
                }
            })
        )

        // Delete word document
        await deleteDoc(doc(db, "words", word.id))
    }

    // Add note to word
    const addNote = async (word: Word, note: string) => {
        await updateDoc(doc(db, "words", word.id), { note })
    }

    // Add word to list
    const addToList = async (word: Word, listId: string) => {
        const previous = lists.find(l => l.words.includes(word.id))

        if (listId === "__none__") {
            if (previous) {
                await updateDoc(doc(db, "lists", previous.id), { words: arrayRemove(word.id) })
            }
            return
        }

        if (previous && previous.id !== listId) {
            await updateDoc(doc(db, "lists", previous.id), { words: arrayRemove(word.id) })
        }

        await updateDoc(doc(db, "lists", listId), { words: arrayUnion(word.id) })
    }

    // Delete multiple words
    const deleteAllWords = async (targetWords: Word[]) => {
        if (!user || targetWords.length === 0) return

        const targetWordIds = targetWords.map(w => w.id)
        const targetWordIdsSet = new Set(targetWordIds)

        setLoading(true)

        try {
            const batch = writeBatch(db)

            // Delete all word documents
            for (const wordId of targetWordIds) {
                batch.delete(doc(db, "words", wordId))
            }

            // Update all lists
            for (const list of lists) {
                const newWordsArray = list.words.filter(wordId => !targetWordIdsSet.has(wordId))
                if (newWordsArray.length !== list.words.length) {
                    batch.update(doc(db, "lists", list.id), { words: newWordsArray })
                }
            }

            await batch.commit()
            setMessage(`Đã xóa thành công ${targetWords.length} từ.`)
        } catch (error) {
            console.error("Lỗi khi xóa hàng loạt:", error)
            setMessage("Đã xảy ra lỗi khi xóa từ.")
        }

        setLoading(false)
    }

    // Play audio
    const playAudio = (url?: string) => {
        if (url) new Audio(url).play().catch(() => { })
    }

    return {
        loading,
        message,
        setMessage,
        addWord,
        toggleMemorized,
        deleteWord,
        addNote,
        addToList,
        deleteAllWords,
        playAudio
    }
}

