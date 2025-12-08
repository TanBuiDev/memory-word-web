import { useEffect, useState } from "react"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import type { DocumentData } from "firebase/firestore"
import { db } from "../../../firebase"
import type { Word } from "../../../types/word"
import type { WordList } from "../../../types/list"
import type { User } from "firebase/auth"

/**
 * Hook để fetch và lắng nghe thay đổi từ Firestore
 * Trả về words và lists từ database
 */
export function useWordCollection(user: User | null) {
    const [words, setWords] = useState<Word[]>([])
    const [lists, setLists] = useState<WordList[]>([])

    useEffect(() => {
        if (!user) {
            setWords([])
            setLists([])
            return
        }

        // Subscribe to words collection
        const wordsQ = query(
            collection(db, "words"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        )

        const unsubWords = onSnapshot(wordsQ, snap => {
            const data = snap.docs.map(d => {
                const docData = d.data() as DocumentData

                return {
                    id: d.id,
                    term: docData.term || "",
                    phonetic: docData.phonetic || "",
                    audio: docData.audio || "",
                    shortMeaning: docData.shortMeaning || "",
                    meanings: Array.isArray(docData.meanings) ? docData.meanings : [],
                    memorized: !!docData.memorized,
                    p_recall: typeof docData.p_recall === "number" ? docData.p_recall : undefined,
                    note: docData.note || "",
                    tags: Array.isArray(docData.tags) ? docData.tags : [],
                    difficulty: docData.difficulty || "",
                    userId: docData.userId,
                    createdAt: docData.createdAt?.toMillis?.() ?? 0,
                    createdAtClient: docData.createdAtClient ?? 0
                } satisfies Word
            })
            setWords(data)
        })

        // Subscribe to lists collection
        const listsQ = query(collection(db, "lists"), where("userId", "==", user.uid))
        const unsubLists = onSnapshot(listsQ, snap => {
            const data = snap.docs.map(d => {
                const docData = d.data()

                return {
                    id: d.id,
                    name: docData.name || "Unnamed",
                    words: Array.isArray(docData.words) ? docData.words : [],
                    userId: docData.userId
                } satisfies WordList
            })
            setLists(data)
        })

        return () => {
            unsubWords()
            unsubLists()
        }
    }, [user])

    return { words, lists }
}

