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
            <div className="text-center py-12 bg-white/70 rounded-2xl shadow-sm">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No words found</h3>
                <p className="text-gray-500">
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

