# MemoryWord - System Architecture & Data Flow (Updated 2025)

**Key Optimization**: Background AI model warm-up eliminates cold start delays
**Status**: Production Ready
**Last Updated**: December 2025

---

# MemoryWord - System Architecture & Data Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Frontend (SmartQuiz.tsx)                          │   │
│  │  ├─ Quiz UI Components                                  │   │
│  │  ├─ Weighted Sampling Algorithm                         │   │
│  │  └─ Optimistic UI Updates                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  aiService.ts                                            │   │
│  │  ├─ getSmartQuizList()                                  │   │
│  │  ├─ warmUpAIModel()                                     │   │
│  │  └─ updateWordRecall()                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   Firebase Services                  │
        │  ├─ Authentication                   │
        │  ├─ Firestore Database               │
        │  ├─ Cloud Functions                  │
        │  └─ Cloud Storage                    │
        └──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD FUNCTIONS (Python)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  predict_recall (Callable HTTP Function)                │   │
│  │  ├─ Auth Check                                          │   │
│  │  ├─ Firestore Query (interaction_log)                   │   │
│  │  ├─ Feature Engineering                                 │   │
│  │  ├─ LSTM Prediction                                     │   │
│  │  └─ Return p_recall                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  on_interaction_log_written (Firestore Trigger)         │   │
│  │  ├─ Fetch interaction history                           │   │
│  │  ├─ Recompute statistics                                │   │
│  │  ├─ Update memorized status                             │   │
│  │  ├─ Run LSTM prediction                                 │   │
│  │  └─ Update word document                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TensorFlow/Keras LSTM Model                            │   │
│  │  ├─ model.keras (trained weights)                       │   │
│  │  ├─ scaler.joblib (feature normalization)               │   │
│  │  └─ metadata.json (configuration)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   Firestore Collections              │
        │  ├─ words                            │
        │  ├─ interaction_log                  │
        │  ├─ users                            │
        │  └─ quiz_sessions                    │
        └──────────────────────────────────────┘
```

---

## Quiz Session Data Flow

### Timeline: From Click to Quiz Display

```
T=0ms: User clicks "Smart Quiz AI"
  │
  ├─→ refreshAndStartQuiz()
  │   └─→ Query Firestore: words where userId == current_user
  │
T=50ms: Fresh words loaded from Firestore
  │
  ├─→ startQuizSession(freshWords)
  │   └─→ getSmartQuizList(freshWords)
  │       ├─ Step 1: Map cached p_recall values (instant)
  │       ├─ Step 2: Identify words needing predictions
  │       ├─ Step 3: Start background predictions (Promise.all)
  │       ├─ Step 4: Calculate sampling weights
  │       └─ Step 5: Weighted sampling → Return 10 words
  │
T=100ms: Quiz list ready
  │
  ├─→ setQuizQueue(smartList)
  ├─→ setLoading(false)  ← QUIZ VISIBLE HERE
  │
T=150ms: Quiz rendered on screen
  │
  └─→ Background: Promise.all() predictions complete
      └─→ updateDoc() saves p_recall to Firestore
```

**Key Insight**: Quiz visible at T=100ms, background updates at T=150ms

---

## Answer Processing Data Flow

```
User selects answer
  │
  ├─→ Optimistic UI Update (instant)
  │   └─ Green/Red highlight appears
  │
  ├─→ logQuizInteraction() [non-blocking]
  │   └─→ Firestore: interaction_log.add({
  │       userId, wordId, type, correct, timestamp
  │   })
  │
  ├─→ updateWordRecall() [non-blocking]
  │   └─→ Cloud Function: predict_recall(wordId)
  │       └─→ LSTM prediction with updated history
  │
  ├─→ Update local state
  │   ├─ score++
  │   ├─ results.push(result)
  │   └─ currentIndex++
  │
  └─→ Display next question
```

**Firestore Trigger** (automatic):

```
interaction_log document written
  │
  ├─→ on_interaction_log_written trigger activates
  │
  ├─→ Fetch all interactions for this word
  │
  ├─→ Recompute statistics
  │   ├─ seenCount
  │   ├─ correctCount
  │   ├─ consecutiveWrong
  │   └─ memorized status
  │
  ├─→ Run LSTM prediction
  │   └─ Get new p_recall
  │
  └─→ Update words/{wordId}
      ├─ p_recall: [new value]
      ├─ seenCount: [incremented]
      ├─ memorized: [true/false]
      └─ lastSeenAt: [timestamp]
```

---

## Weighted Sampling Algorithm Flow

```
Input: words[] with p_recall values

Step 1: Calculate weights
  for each word:
    weight = (1 - p_recall)^1.4

  Example:
  ├─ p_recall=0.2 → weight=0.72 (hard word, high weight)
  ├─ p_recall=0.5 → weight=0.42 (medium word)
  └─ p_recall=0.9 → weight=0.008 (easy word, low weight)

Step 2: Weighted sampling without replacement
  pool = words.copy()
  sampled = []

  while sampled.length < 10:
    total_weight = sum(weights)
    r = random(0, total_weight)

    accumulated = 0
    for i in range(pool.length):
      accumulated += weights[i]
      if r <= accumulated:
        sampled.push(pool[i])
        pool.remove(i)
        weights.remove(i)
        break

Output: sampled[] (10 words in weighted order)
```

---

## Feature Engineering Pipeline

```
Raw Interaction Data
  │
  ├─ timestamp: 2025-12-09T10:30:00Z
  ├─ correct: true
  ├─ type: "quiz_mcq"
  └─ ...
  │
  ↓
Sort by timestamp (oldest → newest)
  │
  ↓
Extract Features
  │
  ├─ Delta (Δt)
  │  └─ Time gap between interactions (seconds)
  │     Example: [0, 3600, 7200, 86400, ...]
  │
  ├─ History Seen
  │  └─ Cumulative count: [0, 1, 2, 3, ...]
  │
  ├─ History Correct
  │  └─ Cumulative correct (shifted): [0, 0, 1, 1, ...]
  │
  └─ Correctness Rate
     └─ Ratio: history_correct / (history_seen + ε)
        Example: [0.0, 0.0, 0.5, 0.67, ...]
  │
  ↓
Padding (if < 10 interactions)
  │
  ├─ Add zeros at start
  └─ Result: 10 rows
  │
  ↓
Windowing (take last 10 rows)
  │
  ↓
Scaling (StandardScaler)
  │
  ├─ Normalize each feature
  └─ Result: mean=0, std=1
  │
  ↓
Reshape to (1, 10, 4)
  │
  ├─ Batch size: 1
  ├─ Timesteps: 10
  └─ Features: 4
  │
  ↓
LSTM Input
```

---

## Caching Strategy

```
Session 1:
  ├─ Quiz starts
  ├─ Fetch words from Firestore
  ├─ No p_recall values yet
  ├─ Call predict_recall for all words
  ├─ Get p_recall values
  └─ Save to Firestore

Session 2 (next day):
  ├─ Quiz starts
  ├─ Fetch words from Firestore
  ├─ 60 words have cached p_recall (instant)
  ├─ 11 new words need predictions (background)
  ├─ Quiz starts immediately with cached values
  └─ Fresh predictions update Firestore in background

Session 3 (next day):
  ├─ Quiz starts
  ├─ Fetch words from Firestore
  ├─ All words have cached p_recall (instant)
  ├─ Quiz starts immediately
  └─ No API calls needed
```

---

## Error Handling & Fallbacks

```
predict_recall() called
  │
  ├─ Model not loaded?
  │  └─ Return p_recall = 0.5 (neutral)
  │
  ├─ Firestore unavailable?
  │  └─ Return p_recall = 0.5 (neutral)
  │
  ├─ Word not found?
  │  └─ Return p_recall = 0.0 (new word)
  │
  ├─ No interaction history?
  │  └─ Return p_recall = 0.0 (new word)
  │
  └─ Success?
     └─ Return p_recall = [0.0-1.0]

Frontend: updateWordRecall() fails
  │
  ├─ Log error silently
  ├─ Don't block quiz
  └─ Retry in background

Frontend: logQuizInteraction() fails
  │
  ├─ Log error silently
  ├─ Don't block quiz
  └─ Retry in background
```

---

## Database Schema

### Collection: words

```
words/{wordId}
├─ userId: string
├─ term: string
├─ meaning: string
├─ shortMeaning: string
├─ pronunciation: string
├─ example: string
├─ imageUrl: string
├─ p_recall: number (0.0-1.0)
├─ memorized: boolean
├─ needsReview: boolean
├─ seenCount: number
├─ correctCount: number
├─ incorrectCount: number
├─ consecutiveWrong: number
├─ lastSeenAt: timestamp
├─ lastResult: "correct" | "wrong"
├─ createdAtClient: timestamp
└─ updatedAt: timestamp
```

### Collection: interaction_log

```
interaction_log/{docId}
├─ userId: string
├─ wordId: string
├─ type: "quiz_mcq" | "quiz_flashcard" | "quiz_fill"
├─ correct: boolean
├─ timestamp: timestamp
└─ extra: {
     selectedAnswer?: string
     correctAnswer?: string
   }
```

---

## Performance Metrics

### Cold Start (First Request)

- Model loading: 2-3 seconds
- Feature engineering: 100ms
- LSTM prediction: 200ms
- **Total: 2.5-3.5 seconds**

### Warm Start (Cached Model)

- Feature engineering: 100ms
- LSTM prediction: 200ms
- **Total: 300ms**

### Quiz Load Time

- Firestore query: 50-100ms
- Weighted sampling: 10-20ms
- UI render: 30-50ms
- **Total: 100-170ms** (instant to user)

### Background Operations

- Fresh predictions: 300-500ms (non-blocking)
- Firestore updates: 100-200ms (non-blocking)
- Trigger execution: 1-2 seconds (automatic)

---

## Scalability Considerations

### Current Limits

- Free Tier: 2M Cloud Function invocations/month
- Free Tier: 50K Firestore reads/day
- Model memory: 300MB (within 2GB limit)

### Optimization Strategies

1. **Caching**: Reuse p_recall across sessions
2. **Batching**: Send array of wordIds in single request
3. **Limiting**: Predict only 15 new words per session
4. **Async**: Use Pub/Sub for trigger processing
5. **Sharding**: Distribute load across regions

### Estimated Capacity

- Current: 100-1000 concurrent users
- With optimizations: 10,000+ concurrent users
- With scaling: 100,000+ concurrent users
