import { useState } from "react"
import type { Word } from "../../../types/word"
import type { WordList } from "../../../types/list"
import Dropdown from "../../../components/ui/Dropdown"

interface Props {
    word: Word & { needsReview?: boolean; seenCount?: number; incorrectCount?: number; lastSeenAt?: number | null }
    onToggleMemorized: () => void
    onDelete: () => void
    onPlayAudio: (url?: string) => void
    onAddNote: (note: string) => void
    lists: WordList[]
    onAddToList: (listId: string) => void
}

export default function WordCard({
    word, onToggleMemorized, onDelete, onPlayAudio, onAddNote, lists, onAddToList
}: Props) {

    const shortMeaning = word.shortMeaning ?? ""
    const pos = word.meanings[0]?.partOfSpeech ?? ""
    const [editingNote, setEditingNote] = useState(false)
    const [tempNote, setTempNote] = useState(word.note ?? "")
    const [openedIndex, setOpenedIndex] = useState<number | null>(null)
    const currentList = lists.find(l => l.words.includes(word.id));
    const [showConfirm, setShowConfirm] = useState(false)
    const [wordToDelete, setWordToDelete] = useState<Word | null>(null)

    return (
        <div className={`bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition ${word.memorized ? "opacity-50" : ""} flex flex-col min-h-[200px]`}>
            {/* Header row */}
            <div className="flex justify-between items-start mb-2">
                <div className="text-lg leading-relaxed flex-1">
                    <span className={`text-2xl font-bold text-gray-900 ${word.memorized ? "line-through" : ""}`}>{word.term}</span>{" "}
                    {pos && <span className="text-gray-600">({pos})</span>}
                    {shortMeaning && <span className="text-gray-700">: {shortMeaning}</span>}

                    {/* Needs Review Badge */}
                    {word.needsReview && (
                        <div className="inline-block ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                            🔴 Cần ôn tập
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 items-center">
                    {/* toggle */}
                    <div className="flex items-center gap-2 select-none">
                        <span className={`text-sm font-medium ${word.memorized ? "text-green-600" : "text-gray-500"}`}>
                            {word.memorized ? "Đã nhớ" : "Chưa nhớ"}
                        </span>
                        <button
                            onClick={onToggleMemorized}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${word.memorized ? "bg-green-500" : "bg-gray-300"}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${word.memorized ? "translate-x-5" : "translate-x-1"}`}></span>
                        </button>
                    </div>

                    <button
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200 transition min-w-[80px] justify-center"
                        onClick={() => {
                            setWordToDelete(word)
                            setShowConfirm(true)
                        }}
                    >
                        <span>❌ Xóa</span>
                    </button>
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-80 border border-red-200 animate-scaleIn">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
                                ❗
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Xóa từ "<span className="font-bold text-red-600">{wordToDelete?.term}</span>"?
                            </h2>
                        </div>

                        <p className="text-gray-600 mt-3">
                            Từ này sẽ bị xóa khỏi danh sách vĩnh viễn.
                        </p>

                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                                onClick={() => setShowConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-red-500 text-white shadow hover:bg-red-600"
                                onClick={() => { onDelete(); setShowConfirm(false); }}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* phonetic + audio */}
            <div className="flex items-center gap-3 text-gray-500 mb-3">
                {word.phonetic && <span>{word.phonetic}</span>}
                {word.audio && (
                    <button
                        onClick={() => onPlayAudio(word.audio)}
                        className="hover:text-cyan-600 transition"
                    >
                        🔊
                    </button>
                )}
            </div>

            {/* Stat Counters (seenCount, incorrectCount, lastSeen) */}
            <div className="mb-3 flex gap-3 text-xs">
                {/* Seen Count */}
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg text-blue-700 font-semibold">
                    <span>👀</span>
                    <span>Xem: {word.seenCount || 0}</span>
                </div>

                {/* Incorrect Count */}
                {word.incorrectCount && word.incorrectCount > 0 && (
                    <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg text-red-700 font-semibold">
                        <span>❌</span>
                        <span>Sai: {word.incorrectCount}</span>
                    </div>
                )}

                {/* Last Seen */}
                {word.lastSeenAt && (
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-gray-600 text-xs">
                        <span>⏰</span>
                        <span>
                            {new Date(word.lastSeenAt).toLocaleDateString('vi-VN', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                )}
            </div>

            {/* Add note */}
            <div className="mb-3">
                <button
                    onClick={() => setEditingNote(true)}
                    className="text-cyan-600 hover:text-cyan-800 font-medium"
                >
                    ➕ Add Note
                </button>
            </div>

            {word.note && !editingNote && (
                <div className="mb-3 bg-gray-100 p-3 rounded-lg text-gray-800 flex justify-between items-center">
                    <span>📝 {word.note}</span>
                    <div className="flex gap-2 text-sm">
                        <button
                            className="text-cyan-600 hover:text-cyan-800"
                            onClick={() => { setTempNote(word.note ?? ""); setEditingNote(true) }}
                        >
                            Sửa
                        </button>
                        <button className="text-red-600 hover:text-red-800" onClick={() => onAddNote("")}>
                            Xóa
                        </button>
                    </div>
                </div>
            )}

            {editingNote && (
                <div className="mb-3 flex gap-2 items-center">
                    <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-cyan-400"
                        value={tempNote}
                        placeholder="Nhập ghi chú..."
                        onChange={(e) => setTempNote(e.target.value)}
                    />
                    <button
                        className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 min-w-[60px]"
                        onClick={() => { onAddNote(tempNote); setEditingNote(false) }}
                    >Lưu</button>
                    <button className="px-3 py-1 text-gray-600 hover:text-gray-900 min-w-[60px]" onClick={() => setEditingNote(false)}>Hủy</button>
                </div>
            )}

            {/* POS tabs and Add to list - Now on the same line */}
            <div className="mt-auto pt-4 flex justify-between items-center">
                {/* POS tabs */}
                <div className="flex flex-wrap gap-2">
                    {word.meanings.map((m, i) => (
                        <button
                            key={i}
                            onClick={() => setOpenedIndex(openedIndex === i ? null : i)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${openedIndex === i ? "bg-fuchsia-600 text-white shadow" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                }`}
                        >
                            {m.partOfSpeech}
                        </button>
                    ))}
                </div>

                {/* Add to list */}
                <div className="ml-4">
                    <Dropdown
                        label={currentList ? currentList.name : "Add to List"}
                        width="w-40"
                        items={[
                            { label: "— None —", value: "__none__" },
                            ...lists.map(l => ({ label: l.name, value: l.id }))
                        ]}
                        onSelect={(listId) => onAddToList(listId)}
                    />
                </div>
            </div>

            {/* Definitions (when POS tab is opened) */}
            {openedIndex !== null && (
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    {word.meanings[openedIndex].definitions.map((d, idx) => (
                        <div key={idx} className="text-gray-800 leading-relaxed">
                            • {d.definition}
                            {d.example && <p className="text-gray-500 text-sm italic mt-1">"{d.example}"</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}