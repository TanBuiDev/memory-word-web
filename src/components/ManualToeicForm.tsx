import type { WordList } from "../types/list"

interface Props {
    lists: WordList[]

    manualTerm: string
    setManualTerm: (v: string) => void

    manualPhonetic: string
    setManualPhonetic: (v: string) => void

    manualAudio: string
    setManualAudio: (v: string) => void

    manualExample: string
    setManualExample: (v: string) => void

    manualMeanings: { pos: string; meaning: string }[]
    addMoreMeaning: () => void
    updateMeaning: (idx: number, field: "pos" | "meaning", val: string) => void
    removeMeaning: (idx: number) => void

    unit: string
    setUnit: (v: string) => void

    manualTags?: string
    setManualTags?: (v: string) => void

    save: () => void
    update: () => void
    close: () => void
    edit: boolean
}

export default function ManualToeicForm({
    lists,
    manualTerm,
    setManualTerm,

    manualPhonetic,
    setManualPhonetic,

    manualAudio,
    setManualAudio,

    manualExample,
    setManualExample,

    manualMeanings,
    addMoreMeaning,
    updateMeaning,
    removeMeaning,

    unit,
    setUnit,
    manualTags,
    setManualTags,

    save,
    update,
    close,
    edit
}: Props) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-fuchsia-200 mt-4 space-y-5 animate-fade-in relative">

            {/* Close button */}
            <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                onClick={close}
            >
                ✖
            </button>

            <h2 className="text-2xl font-bold text-fuchsia-700">
                {edit ? "🛠 Cập nhật từ TOEIC" : "✍️ Nhập từ TOEIC thủ công"}
            </h2>

            {/* Cụm từ */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Cụm từ</label>
                <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-400"
                    value={manualTerm}
                    onChange={e => setManualTerm(e.target.value)}
                    placeholder="Ví dụ: abide by, take part in..."
                />
            </div>

            {/* Phiên âm */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Phiên âm</label>
                <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-400"
                    value={manualPhonetic}
                    onChange={e => setManualPhonetic(e.target.value)}
                    placeholder="Ví dụ: /əˈbaɪd baɪ/"
                />
            </div>

            {/* Nghĩa + loại từ */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                    Loại từ + Nghĩa
                </label>

                {manualMeanings.map((m, idx) => (
                    <div key={idx} className="flex gap-2">
                        <select
                            className="border px-3 py-2 rounded-lg"
                            value={m.pos}
                            onChange={e => updateMeaning(idx, "pos", e.target.value)}
                        >
                            <option value="">Loại từ</option>
                            <option value="noun">(n)</option>
                            <option value="verb">(v)</option>
                            <option value="adjective">(adj)</option>
                            <option value="adverb">(adv)</option>
                            <option value="phrasal verb">phrasal verb</option>
                        </select>

                        <input
                            className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-fuchsia-400"
                            placeholder="Nghĩa tiếng Việt"
                            value={m.meaning}
                            onChange={e => updateMeaning(idx, "meaning", e.target.value)}
                        />

                        {manualMeanings.length > 1 && (
                            <button
                                onClick={() => removeMeaning(idx)}
                                className="px-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                                ✖
                            </button>
                        )}
                    </div>
                ))}

                <button
                    onClick={addMoreMeaning}
                    className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-lg hover:bg-fuchsia-200"
                >
                    ➕ Thêm nghĩa
                </button>
            </div>

            {/* Ví dụ */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Ví dụ</label>
                <textarea
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-400"
                    value={manualExample}
                    onChange={e => setManualExample(e.target.value)}
                    placeholder="Ví dụ minh họa..."
                />
            </div>

            {/* Audio */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                    Audio (URL hoặc để trống)
                </label>

                <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-400"
                    value={manualAudio}
                    onChange={e => setManualAudio(e.target.value)}
                    placeholder="https://...mp3"
                />
            </div>

            {/* Tags */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Tags (phân tách bằng dấu phẩy)</label>
                <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-400"
                    value={manualTags ?? ""}
                    onChange={e => setManualTags?.(e.target.value)}
                    placeholder="ví dụ: phrasal, business, beginner"
                />
            </div>

            {/* Unit */}
            <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Chọn Unit (danh mục)
                </label>

                <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-400"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                >
                    <option value="">-- Chọn Unit TOEIC --</option>
                    {lists.map(list => (
                        <option key={list.id} value={list.id}>
                            {list.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    onClick={close}
                >
                    Hủy
                </button>

                <button
                    className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow"
                    onClick={edit ? update : save}
                >
                    {edit ? "Cập nhật từ" : "Lưu từ TOEIC"}
                </button>
            </div>
        </div>
    )
}
