# MemoryWord - Smart Quiz Presentation Script (Updated 2025)

**Status**: Optimized for instant quiz loading with background AI model warm-up
**Last Updated**: December 2025
**Presenter Notes**: This script reflects the current production implementation with performance optimizations

---

# MemoryWord - Smart Quiz Presentation Script

## Project Overview

**MemoryWord** is an AI-powered vocabulary learning platform that combines:

- **Deep Learning (LSTM)**: Predicts user recall probability based on learning history
- **Weighted Sampling Algorithm (SSA-inspired)**: Optimizes quiz question selection
- **Serverless Architecture**: Real-time updates via Firebase Cloud Functions
- **Adaptive Learning**: System adjusts difficulty based on user performance

---

## Phase 1: AI Model Initialization & Warm-up

### Background Optimization (NEW)

The system now **pre-loads the AI model in the background** to avoid waiting when users navigate to Smart Quiz.

**Key Improvement:**

- When user opens Dashboard → `warmUpAIModel()` is called silently
- TensorFlow + LSTM model loads in background (non-blocking)
- By the time user clicks "Smart Quiz" → Model is already ready
- **Result**: Quiz starts instantly without loading delays

**Technical Details:**

- Location: `src/utils/aiService.ts` (lines 147-162)
- Function: `warmUpAIModel(wordId?: string)`
- Behavior: Fire-and-forget, errors silently ignored
- Cost: Minimal (uses Free Tier)

---

## Phase 2: Smart Quiz Initialization

### Step 2.1: Load User's Vocabulary

When user clicks "Smart Quiz":

```
Frontend → Firestore Query
↓
Load all words for current user
↓
Get cached p_recall values (instant)
```

**Console Log:**

```
👤 Current user UID: [uid]
📚 Loaded 71 fresh words for quiz
```

### Step 2.2: Intelligent Caching Strategy

The system uses a **two-tier approach**:

1. **Cached p_recall** (Instant - No API calls)

   - Words with existing p_recall values use cached data
   - Quiz starts immediately
   - Example: 60 words with cached values → instant

2. **Fresh Predictions** (Background - Non-blocking)
   - Words without p_recall get fresh predictions
   - Predictions run in background via Promise.all()
   - Results update Firestore for next session
   - Example: 11 new words → predict in background

**Console Logs:**

```
🧠 Analyzing 71 words with AI model...
📊 Using cached p_recall for 60 words (instant)
🔄 Predicting fresh p_recall for 11 words (background)
```

---

## Phase 3: Weighted Sampling Algorithm (SSA-inspired)

### Step 3.1: Calculate Sampling Weights

**Formula:**

```
weight = (1 - p_recall)^β
where β = 1.4 (tunable parameter)
```

**Examples:**

- Word with p_recall = 0.2 (hard) → weight = 0.8^1.4 ≈ 0.72 (HIGH)
- Word with p_recall = 0.5 (medium) → weight = 0.5^1.4 ≈ 0.42 (MEDIUM)
- Word with p_recall = 0.9 (easy) → weight = 0.1^1.4 ≈ 0.008 (LOW)

**Key Insight:**

- Harder words get higher weights → More likely to be selected
- Easier words get lower weights → Less likely but still possible
- Balances **Exploitation** (focus on weak areas) vs **Exploration** (maintain diversity)

### Step 3.2: Weighted Sampling Without Replacement

Algorithm:

1. Calculate total weight sum
2. Generate random number [0, total_weight]
3. Select word where random falls in weight range
4. Remove selected word from pool
5. Repeat until 10 words selected

**Result:**

```
✅ Smart quiz list ready. Top priority (sampled):
   "strong" (20% recall probability)
```

**Why Not Simple Sorting?**

- Simple sort: Always same 10 hardest words → Boring, demotivating
- Weighted sampling: Mix of hard + medium + easy → Engaging, sustainable

---

## Phase 4: Quiz Interaction & Logging

### Step 4.1: User Answers Question

When user selects answer:

1. **Optimistic UI Update** (Instant feedback)

   - Green/Red highlight appears immediately
   - User sees result without waiting

2. **Background Logging** (Non-blocking)
   - Log sent to Firestore `interaction_log` collection
   - Contains: userId, wordId, type (quiz_mcq/quiz_flashcard/quiz_fill), correct, timestamp

**Console Log:**

```
✅ Logged interaction: word=[term], correct=[true/false]
```

### Step 4.2: Firestore Trigger Activation

**Automatic Process** (No user action needed):

When interaction_log document is written:

1. **Firestore Trigger** activates automatically
2. Fetches all quiz interactions for this word
3. Recomputes statistics:
   - seenCount: Total times seen
   - correctCount: Times answered correctly
   - consecutiveWrong: Recent failures
4. Updates memorized status based on logic:
   - 2+ consecutive wrongs → Mark as "needs review"
   - Correct answer with no recent wrongs → Mark as "memorized"
5. **Runs LSTM model** with updated history
6. Calculates new p_recall
7. Updates word document in Firestore

**Firestore Update:**

```
words/{wordId}
├── p_recall: 0.35 (updated)
├── memorized: false
├── seenCount: 5
├── correctCount: 3
├── consecutiveWrong: 1
└── lastSeenAt: [timestamp]
```

---

## Phase 5: Adaptive Learning Loop

### Step 5.1: Next Quiz Session

When user clicks "Learn 10 More Words":

1. System fetches fresh words from Firestore
2. **New p_recall values** (just updated by trigger) are used
3. Weighted sampling creates **completely new quiz**
4. Words user struggled with appear more frequently
5. Words user mastered appear less frequently

**Closed-Loop System:**

```
User Answer → Trigger Updates p_recall → Next Quiz Adapts
     ↑                                          ↓
     └──────────────────────────────────────────┘
```

---

## Technical Architecture

### Frontend Stack

- **React + TypeScript**: Component-based UI
- **Vite**: Fast build tool
- **Tailwind CSS**: Styling
- **Firebase SDK**: Real-time database & auth

### Backend Stack

- **Firebase Cloud Functions 2nd Gen**: Python 3.12 runtime
- **TensorFlow/Keras**: LSTM model inference
- **scikit-learn**: Feature scaling
- **Firestore**: Real-time database

### AI Model

- **Architecture**: LSTM (Long Short-Term Memory)
- **Input**: 4 features × 10 timesteps = (1, 10, 4)
- **Features**:
  - delta: Time gap between interactions (seconds)
  - history_seen: Cumulative times seen
  - history_correct: Cumulative correct answers (shifted)
  - correctness_rate: Accuracy ratio
- **Output**: p_recall (0.0 - 1.0)

---

## Performance Optimizations

### 1. Lazy Loading

- TensorFlow loaded only on first API call
- Avoids cold start delays
- Model cached in memory for subsequent calls

### 2. Background Processing

- Predictions run in background (Promise.all)
- Quiz starts immediately with cached values
- Fresh predictions update Firestore for next session

### 3. Fallback Mechanism

- If AI model fails → Use heuristic formula
- Formula: `recall = 0.7 - (daysOld * 0.01)` for memorized words
- Ensures app works even if backend fails

### 4. Cost Optimization

- Limit predictions to 15 words per session
- Use cached values when available
- Batch processing via Promise.all
- Free Tier compatible

---

## Key Metrics & Monitoring

### Console Logs for Debugging

```
🔥 AI model warm-up initiated (background)
👤 Current user UID: [uid]
📚 Loaded 71 fresh words for quiz
🧠 Analyzing 71 words with AI model...
📊 Using cached p_recall for 60 words (instant)
🔄 Predicting fresh p_recall for 11 words (background)
✅ Smart quiz list ready. Top priority: "strong" (20%)
✅ Logged interaction: word=strong, correct=true
🔄 Updating p_recall for word: [wordId]
✅ Updated p_recall for word [wordId]: 35%
```

### Network Tab Monitoring

- Filter by "predict_recall" or "functions"
- See parallel API calls for fresh predictions
- Each call contains wordId
- Response: `{ p_recall: 0.35 }`

---

## Frequently Asked Questions (FAQ)

### Q1: Why LSTM instead of traditional Spaced Repetition (SRS)?

**Answer:**
Traditional SRS (like SuperMemo/Anki) uses fixed formulas. LSTM learns individual patterns:

- Example: User forgets word exactly 2 days after learning
- SRS: Applies generic formula
- LSTM: Learns this specific pattern from history
- Result: More personalized, adaptive learning

### Q2: What if the AI server fails?

**Answer:**
Fallback mechanism ensures app works:

- If `predict_recall` times out → Use heuristic formula
- Formula based on word age and memorized status
- User can still learn normally
- Fresh predictions retry in background

### Q3: Doesn't calling API for every word cost too much?

**Answer:**
Multiple optimizations control costs:

- **Caching**: Reuse p_recall from previous sessions
- **Limiting**: Only predict 15 new words per session
- **Batching**: Promise.all sends parallel requests
- **Free Tier**: Current usage fits within Firebase free tier
- **Scaling**: Can implement batching (send array of IDs) for larger scale

### Q4: How does the system handle new users?

**Answer:**

- New words (no interaction history) → p_recall = 0.0
- Trigger: Fallback formula returns 0.5
- Result: New words prioritized in quiz
- After first interaction → LSTM learns from history

### Q5: Can users see their p_recall values?

**Answer:**

- Currently: p_recall used internally for quiz ordering
- Future: Can add analytics dashboard showing recall trends
- Helps users understand learning progress

---

## Demo Walkthrough

### Step 1: Open Dashboard

- Show left sidebar with word lists
- Show right sidebar with statistics
- Explain pagination (20 words per page)

### Step 2: Navigate to Smart Quiz

- Click "Smart Quiz AI" button
- Show loading state (should be instant due to warm-up)
- Explain background model loading

### Step 3: Open DevTools

- **Console Tab**: Show warm-up and initialization logs
- **Network Tab**: Filter by "predict_recall", show API calls
- Explain cached vs fresh predictions

### Step 4: Answer Questions

- Select answer (correct or incorrect)
- Show instant UI feedback
- Explain background logging

### Step 5: Check Firestore

- Open Firebase Console
- Show interaction_log collection
- Show updated word document with new p_recall

### Step 6: Start New Quiz

- Click "Learn 10 More Words"
- Show different words appear
- Explain adaptive selection based on updated p_recall

---

## Conclusion

MemoryWord's Smart Quiz demonstrates:

1. **AI Integration**: LSTM model for personalized learning
2. **Algorithm Design**: Weighted sampling for optimal question selection
3. **System Architecture**: Serverless, real-time, scalable
4. **Performance**: Optimized for instant feedback and background processing
5. **Reliability**: Fallback mechanisms ensure robustness

The system creates a **closed-loop adaptive learning experience** where:

- User actions → AI learns → System adapts → Better learning outcomes

---

## Technical References

- **Frontend**: `src/pages/SmartQuiz.tsx`, `src/utils/aiService.ts`
- **Backend**: `functions/main.py`
- **Database**: Firestore collections: `words`, `interaction_log`
- **Model**: `model.keras`, `scaler.joblib`, `metadata.json`
