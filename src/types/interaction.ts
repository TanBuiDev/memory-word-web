export interface InteractionLog {
    userId: string
    wordId: string
    type:
        | "view_word"
        | "open_definition"
        | "close_definition"
        | "listen_audio"
        | "expand_example"
        | "time_spent"
        | "quiz_flashcard"
        | "quiz_mcq"
        | "quiz_fill"

    timestamp: number

    // chứa mọi dữ liệu thêm (pos, duration, example, ...)
    extra?: Record<string, unknown>
}
