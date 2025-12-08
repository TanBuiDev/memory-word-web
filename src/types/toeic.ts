export interface ToeicWord {
    term: string;
    meaning: string;
    translation: string;
    phonetic: string;
    example: string;
    audio: string;
}

export interface ToeicUnit {
    id: string;
    title: string;
    description: string;
    order: number;
    words: ToeicWord[];
}
