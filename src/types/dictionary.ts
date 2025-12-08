export interface DicDefinition { definition: string; example?: string }
export interface DicMeaning { partOfSpeech: string; definitions: DicDefinition[] }
export interface DicEntry {
  word: string
  phonetic?: string
  phonetics?: { text?: string; audio?: string }[]
  meanings: DicMeaning[]
}
