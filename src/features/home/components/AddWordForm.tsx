import { Plus } from "lucide-react";
import WordInput from "../../../components/WordInput";

interface AddWordFormProps {
    term: string;
    setTerm: (value: string) => void;
    loading: boolean;
    onAddWord: (wordToAdd?: string) => void;
    message: string;
}

export default function AddWordForm({
    term,
    setTerm,
    loading,
    onAddWord,
    message
}: AddWordFormProps) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <WordInput
                        value={term}
                        onChange={setTerm}
                        onSelect={s => setTerm(s)}
                        onEnter={onAddWord}
                    />
                </div>

                <button
                    onClick={() => onAddWord()}
                    disabled={loading || !term.trim()}
                    className="bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                             text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl 
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Searching...
                        </>
                    ) : (
                        <>
                            <Plus size={20} />
                            Add Word
                        </>
                    )}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className="mt-3 animate-fade-in">
                    <p className="text-sm bg-linear-to-r from-blue-50 to-cyan-50 text-cyan-700 
                                px-4 py-2 rounded-lg border border-cyan-200">
                        {message}
                    </p>
                </div>
            )}
        </div>
    );
}

