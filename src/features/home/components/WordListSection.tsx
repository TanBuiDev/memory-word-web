import type { Word } from "../../../types/word";
import type { WordList } from "../../../types/list";
import WordCard from "../../../features/vocabulary/components/WordCard";

interface WordListSectionProps {
    words: Word[];
    onDelete: (word: Word) => void;
    onToggleMemorized: (word: Word) => void;
    onPlayAudio: (url?: string) => void;
    onAddNote: (word: Word, note: string) => void;
    onAddToList: (word: Word, listId: string) => void;
    lists: WordList[];
    searchInput: string;
}

export default function WordListSection({
    words,
    onDelete,
    onToggleMemorized,
    onPlayAudio,
    onAddNote,
    onAddToList,
    lists,
    searchInput
}: WordListSectionProps) {
    if (words.length === 0) {
        return (
            <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg shadow-indigo-100/20 border border-gray-200/60">
                <div className="text-7xl mb-6 animate-float">📚</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                    No words found
                </h3>
                <p className="text-gray-600 text-lg font-medium">
                    {searchInput ? 'Try a different search term' : 'Start by adding your first word!'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {words.map(word => (
                <div key={word.id} id={`word-${word.id}`} className="h-full">
                    <WordCard
                        word={word}
                        onToggleMemorized={() => onToggleMemorized(word)}
                        onDelete={() => onDelete(word)}
                        onPlayAudio={url => onPlayAudio(url)}
                        onAddNote={note => onAddNote(word, note)}
                        lists={lists}
                        onAddToList={listId => onAddToList(word, listId)}
                    />
                </div>
            ))}
        </div>
    );
}

