export interface Word {
  id: string
  term: string
  phonetic?: string
  audio?: string
  shortMeaning?: string
  meanings: {
    partOfSpeech: string
    definitions: { definition: string; example?: string }[]
  }[]
  memorized: boolean
  p_recall?: number
  note?: string
  userId: string
  createdAt?: number
  createdAtClient?: number
  tags?: string[]
  difficulty?: string

  // Optional TOEIC metadata
  toeic?: {
    unit: number
    index: number
    isToeic: boolean
  }

  // Optional spaced-repetition stats, populated by Firestore / triggers
  seenCount?: number
  correctCount?: number
  incorrectCount?: number
  consecutiveWrong?: number
  lastSeenAt?: number | null
  needsReview?: boolean
}
