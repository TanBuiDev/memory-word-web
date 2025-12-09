# MemoryWord Frontend - Technical Deep Dive

## Smart Quiz Flow Architecture

### File Structure
```
src/
├── pages/SmartQuiz.tsx          # Main quiz page component
├── utils/aiService.ts           # AI model integration
├── utils/logQuiz.ts             # Quiz logging
├── utils/streakService.ts       # Streak tracking
├── features/learning/
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── Flashcard.tsx
│   │   │   ├── MultipleChoice.tsx
│   │   │   └── FillInBlank.tsx
│   │   ├── StreakCelebration.tsx
│   │   └── WelcomeModal.tsx
```

---

## Core Component: SmartQuiz.tsx

**Location**: `src/pages/SmartQuiz.tsx`

### State Management

```typescript
const [quizQueue, setQuizQueue] = useState<WordWithRecall[]>([])
const [loading, setLoading] = useState(true)
const [currentIndex, setCurrentIndex] = useState(0)
const [mode, setMode] = useState<"flashcard" | "mcq" | "fill">("mcq")
const [quizFinished, setQuizFinished] = useState(false)
const [score, setScore] = useState(0)
const [results, setResults] = useState<QuizResult[]>([])
```

### Key Functions

#### 1. `refreshAndStartQuiz()` (lines 81-98)
**Purpose**: Fetch fresh words and start quiz session

**Flow**:
```
User clicks "Smart Quiz"
    ↓
refreshAndStartQuiz()
    ↓
Query Firestore: words where userId == current_user
    ↓
Get fresh word list (reflects recent memorized updates)
    ↓
startQuizSession(freshWords)
```

**Why Fresh Fetch?**
- Prevents using stale data
- Reflects recent "memorized" status updates
- Avoids repeating just-learned words

#### 2. `startQuizSession(wordsInput)` (lines 43-76)
**Purpose**: Generate smart quiz and start immediately

**Flow**:
```
startQuizSession(freshWords)
    ↓
getSmartQuizList(wordsInput)  [from aiService.ts]
    ↓
Return immediately with cached p_recall values
    ↓
setQuizQueue(smartList.slice(0, 10))
    ↓
setLoading(false)  [Quiz visible immediately]
    ↓
Background: Promise.all() updates p_recall in Firestore
```

**Key Optimization**:
- `setLoading(false)` called BEFORE background updates
- Quiz starts instantly
- Fresh predictions update Firestore in background
- Next session uses updated values

#### 3. `handleAnswer(isCorrect)` (lines 150-200)
**Purpose**: Process user's answer and log interaction

**Flow**:
```
User selects answer
    ↓
Optimistic UI Update (instant green/red feedback)
    ↓
logQuizInteraction() [non-blocking]
    ↓
updateWordRecall() [non-blocking]
    ↓
Update local state (score, results)
    ↓
Move to next question
```

**Optimistic Updates**:
- UI updates immediately (no waiting for server)
- Logging happens in background
- If logging fails, user doesn't notice

#### 4. `handleQuizFinish()` (lines 201-220)
**Purpose**: Handle quiz completion

**Actions**:
- Calculate final score
- Update streak
- Record quiz completion
- Show results summary
- Offer "Learn 10 More" option

---

## AI Service Integration: aiService.ts

**Location**: `src/utils/aiService.ts`

### Function 1: `getSmartQuizList(words)` (lines 21-122)

**Purpose**: Generate smart quiz list using weighted sampling

**Algorithm**:

```
Step 1: Use cached p_recall immediately
├── Map words to include existing p_recall values
└── Return instantly (no API calls)

Step 2: Identify words needing fresh predictions
├── Filter words without p_recall
├── Limit to 15 words (cost control)
└── Log: "Using cached for X words, predicting Y words"

Step 3: Start background predictions (non-blocking)
├── Promise.all() calls predict_recall for each word
├── Results update Firestore in background
└── Don't wait for completion

Step 4: Calculate sampling weights
├── For each word: weight = (1 - p_recall)^1.4
├── Higher weight = harder word = more likely selected
└── Lower weight = easier word = less likely selected

Step 5: Weighted sampling without replacement
├── Generate random number [0, total_weight]
├── Select word where random falls
├── Remove selected word from pool
├── Repeat until 10 words selected
└── Return sampled list
```

**Console Output**:
```
🧠 Analyzing 71 words with AI model...
📊 Using cached p_recall for 60 words (instant)
🔄 Predicting fresh p_recall for 11 words (background)
✅ Smart quiz list ready. Top priority: "strong" (20%)
```

### Function 2: `warmUpAIModel(wordId?)` (lines 147-162)

**Purpose**: Pre-load LSTM model in background

**When Called**:
- Dashboard component mounts
- Before user navigates to Smart Quiz
- Silent, non-blocking

**Implementation**:
```typescript
export const warmUpAIModel = async (wordId?: string): Promise<void> => {
    try {
        const dummyWordId = wordId || "__warmup__"
        
        // Fire and forget
        predictRecall({ wordId: dummyWordId }).catch(() => {
            // Silently ignore errors
        })
        
        console.log("🔥 AI model warm-up initiated (background)")
    } catch {
        // Silently ignore
    }
}
```

**Benefits**:
- Model loads while user browses dashboard
- By time user clicks "Smart Quiz" → Model ready
- No waiting for cold start
- Transparent to user

### Function 3: `updateWordRecall(wordId)` (lines 179-213)

**Purpose**: Update word's p_recall after user answers

**Flow**:
```
User answers question
    ↓
logQuizInteraction() saves to Firestore
    ↓
Firestore trigger runs (backend)
    ↓
updateWordRecall() called (frontend)
    ↓
Call predict_recall with latest history
    ↓
Get new p_recall value
    ↓
Update Firestore word document
    ↓
Next quiz uses updated value
```

**Error Handling**:
- If API fails: Return undefined
- If Firestore update fails: Still return p_recall value
- Doesn't block quiz flow

### Function 4: `getFallbackRecall(word)` (lines 127-138)

**Purpose**: Calculate p_recall if AI model unavailable

**Formula**:
```
If word.memorized:
    p_recall = max(0.7, 1 - (daysOld * 0.01))
    // Memorized words decay slowly
Else:
    p_recall = max(0.1, 0.5 - (daysOld * 0.05))
    // New words stay low
```

**Example**:
- New word, 0 days old: p_recall = 0.5
- New word, 10 days old: p_recall = 0.0 (prioritized)
- Memorized word, 0 days old: p_recall = 1.0
- Memorized word, 30 days old: p_recall = 0.7

---

## Quiz Logging: logQuiz.ts

**Location**: `src/utils/logQuiz.ts`

### Function: `logQuizInteraction()`

**Purpose**: Record user's answer to Firestore

**Data Logged**:
```typescript
{
    userId: string
    wordId: string
    type: "quiz_mcq" | "quiz_flashcard" | "quiz_fill"
    correct: boolean
    timestamp: Firestore.Timestamp
    extra?: {
        selectedAnswer?: string
        correctAnswer?: string
    }
}
```

**Firestore Collection**: `interaction_log`

**Trigger**: Automatically activates backend trigger

---

## Weighted Sampling Algorithm

### Mathematical Foundation

**Weight Formula**:
```
weight(word) = (1 - p_recall)^β
where β = 1.4
```

**Intuition**:
- p_recall = 0.0 (new word) → weight = 1.0^1.4 = 1.0 (MAX)
- p_recall = 0.5 (medium) → weight = 0.5^1.4 ≈ 0.42
- p_recall = 1.0 (mastered) → weight = 0.0^1.4 = 0.0 (MIN)

### Sampling Without Replacement

**Algorithm**:
```
1. Calculate total_weight = sum of all weights
2. Loop until 10 words selected:
   a. Generate random r in [0, total_weight]
   b. Iterate through words, accumulating weights
   c. Select word where accumulated weight >= r
   d. Remove selected word from pool
   e. Remove weight from total_weight
3. Return selected 10 words
```

**Why This Approach?**
- **Exploitation**: Focuses on weak areas (low p_recall)
- **Exploration**: Includes medium/easy words (prevents boredom)
- **Randomness**: Different quiz each time (prevents memorization)
- **Adaptive**: Adjusts as p_recall changes

---

## Performance Optimizations

### 1. Lazy Loading
- TensorFlow model loads on first predict_recall call
- Warm-up call pre-loads model in background
- Subsequent calls use cached model

### 2. Caching Strategy
- p_recall cached in Firestore
- Reused across quiz sessions
- Only fresh predictions for new words

### 3. Non-blocking Operations
- Background predictions via Promise.all()
- Firestore updates don't block UI
- Optimistic UI updates for instant feedback

### 4. Batch Processing
- Promise.all() sends parallel requests
- Reduces total latency
- Efficient API usage

### 5. Cost Control
- Limit predictions to 15 words per session
- Reuse cached values when available
- Free Tier compatible

---

## User Experience Flow

### Timeline

```
T=0s: User clicks "Smart Quiz"
  ├─ refreshAndStartQuiz() starts
  └─ Query Firestore for fresh words

T=0.1s: Fresh words loaded
  ├─ startQuizSession() called
  ├─ getSmartQuizList() returns immediately
  └─ Quiz visible (loading = false)

T=0.2s: Quiz rendered
  ├─ First question displayed
  ├─ Background: predict_recall() for new words
  └─ Background: updateDoc() saves p_recall

T=0.5s: User sees first question
  └─ Can start answering immediately

T=1.0s: User selects answer
  ├─ Optimistic UI update (instant)
  ├─ logQuizInteraction() in background
  └─ updateWordRecall() in background

T=1.1s: Next question displayed
  └─ User continues quiz

T=5.0s: Quiz finished
  ├─ Show results
  ├─ Update streak
  └─ Offer "Learn 10 More"
```

---

## Error Handling

### Scenario 1: Network Error During Quiz
- **Impact**: Logging fails silently
- **User Experience**: Quiz continues normally
- **Recovery**: Logs retry in background

### Scenario 2: AI Model Unavailable
- **Impact**: Use fallback formula
- **User Experience**: Quiz still works
- **Recovery**: Fresh predictions retry

### Scenario 3: Firestore Unavailable
- **Impact**: Can't fetch fresh words
- **User Experience**: Show error message
- **Recovery**: User can retry

---

## Testing Checklist

- [ ] Quiz loads instantly (< 1s)
- [ ] Warm-up logs appear in console
- [ ] Cached p_recall used for existing words
- [ ] Fresh predictions run in background
- [ ] Weighted sampling produces varied questions
- [ ] Optimistic UI updates work
- [ ] Logging completes in background
- [ ] p_recall updates reflect in next quiz
- [ ] Fallback formula works if API fails
- [ ] Streak updates correctly

