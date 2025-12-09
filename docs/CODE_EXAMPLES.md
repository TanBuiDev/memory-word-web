# MemoryWord - Code Examples & Snippets

Quick reference for key code implementations.

---

## Frontend: Smart Quiz Initialization

### SmartQuiz.tsx - Start Quiz Session

```typescript
const startQuizSession = async (wordsInput: Word[]) => {
    try {
        setLoading(true);
        
        // Get smart quiz list with weighted sampling
        const smartList = await getSmartQuizList(wordsInput);
        
        // Set quiz queue (first 10 words)
        setQuizQueue(smartList.slice(0, 10));
        
        // IMPORTANT: Set loading to false BEFORE background updates
        setLoading(false);
        
        // Background: Update p_recall in Firestore (non-blocking)
        // This happens after quiz is visible
        
    } catch (error) {
        console.error('Error starting quiz:', error);
        setLoading(false);
    }
};
```

**Key Point**: `setLoading(false)` called before background updates

---

## Frontend: Weighted Sampling Algorithm

### aiService.ts - getSmartQuizList()

```typescript
export const getSmartQuizList = async (
    words: Word[]
): Promise<WordWithRecall[]> => {
    // Step 1: Use cached p_recall immediately
    const wordsWithRecall = words.map(word => ({
        ...word,
        p_recall: word.p_recall || 0.5
    }));
    
    // Step 2: Identify words needing fresh predictions
    const newWords = words.filter(w => !w.p_recall).slice(0, 15);
    
    // Step 3: Start background predictions (non-blocking)
    if (newWords.length > 0) {
        Promise.all(
            newWords.map(w => updateWordRecall(w.id))
        ).catch(() => {});
    }
    
    // Step 4: Calculate weights
    const weights = wordsWithRecall.map(
        w => Math.pow(1 - w.p_recall, 1.4)
    );
    
    // Step 5: Weighted sampling without replacement
    const sampled: WordWithRecall[] = [];
    const pool = [...wordsWithRecall];
    const poolWeights = [...weights];
    
    while (sampled.length < 10 && pool.length > 0) {
        const totalWeight = poolWeights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < pool.length; i++) {
            random -= poolWeights[i];
            if (random <= 0) {
                sampled.push(pool[i]);
                pool.splice(i, 1);
                poolWeights.splice(i, 1);
                break;
            }
        }
    }
    
    return sampled;
};
```

---

## Frontend: Warm-up AI Model

### aiService.ts - warmUpAIModel()

```typescript
export const warmUpAIModel = async (wordId?: string): Promise<void> => {
    try {
        const dummyWordId = wordId || "__warmup__";
        
        // Fire and forget - don't wait for response
        predictRecall({ wordId: dummyWordId }).catch(() => {
            // Silently ignore errors
        });
        
        console.log("🔥 AI model warm-up initiated (background)");
    } catch {
        // Silently ignore
    }
};
```

**Called from**: Dashboard component on mount

---

## Frontend: Handle User Answer

### SmartQuiz.tsx - handleAnswer()

```typescript
const handleAnswer = async (isCorrect: boolean) => {
    // Step 1: Optimistic UI update (instant)
    setScore(prev => isCorrect ? prev + 1 : prev);
    setResults(prev => [...prev, {
        wordId: currentWord.id,
        correct: isCorrect,
        timestamp: new Date()
    }]);
    
    // Step 2: Log interaction (non-blocking)
    logQuizInteraction({
        wordId: currentWord.id,
        correct: isCorrect,
        type: 'quiz_mcq'
    }).catch(err => console.error('Logging failed:', err));
    
    // Step 3: Update p_recall (non-blocking)
    updateWordRecall(currentWord.id).catch(err => 
        console.error('Update failed:', err)
    );
    
    // Step 4: Move to next question
    setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
    }, 500);
};
```

---

## Backend: LSTM Prediction

### main.py - predict_recall()

```python
@https_fn.callable_request
def predict_recall(req: https_fn.CallableRequest) -> https_fn.Response:
    try:
        # Auth check
        claims = req.auth.token
        user_id = claims['uid']
        
        # Get wordId from request
        word_id = req.json.get('wordId')
        
        # Query interaction history
        db = firestore.client()
        interactions = db.collection('interaction_log').where(
            'userId', '==', user_id
        ).where(
            'wordId', '==', word_id
        ).order_by(
            'timestamp', direction=firestore.Query.DESCENDING
        ).limit(TIMESTEP * 2).stream()
        
        # Filter quiz interactions only
        quiz_interactions = [
            doc.to_dict() for doc in interactions
            if doc.get('type', '').startswith('quiz_')
        ]
        
        # Feature engineering
        features = create_features(quiz_interactions)
        
        # Ensure model loaded
        if not ensure_model_loaded():
            return {'p_recall': 0.5}
        
        # LSTM prediction
        prediction = model.predict(features, verbose=0)
        p_recall = float(prediction[0][0])
        
        return {'p_recall': p_recall}
        
    except Exception as e:
        print(f"Error: {e}")
        return {'p_recall': 0.5}
```

---

## Backend: Feature Engineering

### main.py - create_features()

```python
def create_features(interactions):
    """Transform raw interactions to LSTM features"""
    
    if not interactions:
        # New word - return zeros
        return np.zeros((1, TIMESTEP, FEATURES))
    
    # Sort by timestamp (oldest first)
    interactions = sorted(
        interactions, 
        key=lambda x: x['timestamp']
    )
    
    # Extract features
    deltas = []
    history_seen = []
    history_correct = []
    correctness_rate = []
    
    for i, interaction in enumerate(interactions):
        # Delta: time gap
        if i == 0:
            delta = 0
        else:
            delta = (
                interaction['timestamp'] - 
                interactions[i-1]['timestamp']
            ).total_seconds()
        deltas.append(delta)
        
        # History seen
        history_seen.append(i)
        
        # History correct (shifted)
        correct_count = sum(
            1 for j in range(i) 
            if interactions[j]['correct']
        )
        history_correct.append(correct_count)
        
        # Correctness rate
        rate = correct_count / (i + 1e-8)
        correctness_rate.append(rate)
    
    # Padding
    if len(deltas) < TIMESTEP:
        pad_size = TIMESTEP - len(deltas)
        deltas = [0] * pad_size + deltas
        history_seen = [0] * pad_size + history_seen
        history_correct = [0] * pad_size + history_correct
        correctness_rate = [0] * pad_size + correctness_rate
    
    # Windowing (last TIMESTEP)
    deltas = deltas[-TIMESTEP:]
    history_seen = history_seen[-TIMESTEP:]
    history_correct = history_correct[-TIMESTEP:]
    correctness_rate = correctness_rate[-TIMESTEP:]
    
    # Stack features
    features = np.column_stack([
        deltas,
        history_seen,
        history_correct,
        correctness_rate
    ])
    
    # Scaling
    features = scaler.transform(features)
    
    # Reshape to (1, TIMESTEP, FEATURES)
    return features.reshape(1, TIMESTEP, FEATURES)
```

---

## Backend: Firestore Trigger

### main.py - on_interaction_log_written()

```python
@firestore_fn.on_document_written(
    path='interaction_log/{docId}'
)
def on_interaction_log_written(event: firestore_fn.Event) -> None:
    """Auto-update word stats when interaction logged"""
    
    try:
        # Get interaction data
        interaction = event.data.get()
        user_id = interaction['userId']
        word_id = interaction['wordId']
        
        # Fetch word document
        db = firestore.client()
        word_doc = db.collection('words').document(word_id).get()
        word_data = word_doc.to_dict()
        
        # Recompute statistics
        interactions = db.collection('interaction_log').where(
            'userId', '==', user_id
        ).where(
            'wordId', '==', word_id
        ).stream()
        
        quiz_interactions = [
            doc.to_dict() for doc in interactions
            if doc.get('type', '').startswith('quiz_')
        ]
        
        seen_count = len(quiz_interactions)
        correct_count = sum(
            1 for i in quiz_interactions if i['correct']
        )
        
        # Update memorized status
        consecutive_wrong = 0
        for i in reversed(quiz_interactions):
            if not i['correct']:
                consecutive_wrong += 1
            else:
                break
        
        memorized = (
            consecutive_wrong < 2 and 
            correct_count > 0
        )
        
        # Predict new p_recall
        features = create_features(quiz_interactions)
        if ensure_model_loaded():
            p_recall = float(
                model.predict(features, verbose=0)[0][0]
            )
        else:
            p_recall = word_data.get('p_recall', 0.5)
        
        # Update word document
        db.collection('words').document(word_id).update({
            'seenCount': seen_count,
            'correctCount': correct_count,
            'consecutiveWrong': consecutive_wrong,
            'memorized': memorized,
            'p_recall': p_recall,
            'lastSeenAt': firestore.SERVER_TIMESTAMP,
            'lastResult': interaction['correct']
        })
        
    except Exception as e:
        print(f"[Trigger] Error: {e}")
```

---

## Database: Firestore Schema

### Word Document

```json
{
  "userId": "user123",
  "term": "serendipity",
  "meaning": "The occurrence of events by chance in a happy or beneficial way",
  "p_recall": 0.75,
  "memorized": true,
  "seenCount": 5,
  "correctCount": 4,
  "consecutiveWrong": 0,
  "lastSeenAt": "2025-12-09T10:30:00Z",
  "lastResult": "correct"
}
```

### Interaction Log Document

```json
{
  "userId": "user123",
  "wordId": "word456",
  "type": "quiz_mcq",
  "correct": true,
  "timestamp": "2025-12-09T10:30:00Z",
  "extra": {
    "selectedAnswer": "option_a",
    "correctAnswer": "option_a"
  }
}
```

---

## Testing: Console Logs

```javascript
// Expected logs in order:
console.log("🔥 AI model warm-up initiated (background)");
console.log("👤 Current user UID: abc123");
console.log("📚 Loaded 71 fresh words for quiz");
console.log("🧠 Analyzing 71 words with AI model...");
console.log("📊 Using cached p_recall for 60 words (instant)");
console.log("🔄 Predicting fresh p_recall for 11 words (background)");
console.log("✅ Smart quiz list ready. Top priority: strong (20%)");
console.log("✅ Logged interaction: word=strong, correct=true");
console.log("🔄 Updating p_recall for word: word456");
console.log("✅ Updated p_recall for word word456: 0.85");
```

---

## Configuration: metadata.json

```json
{
  "TIMESTEP": 10,
  "FEATURES": 4,
  "FEATURE_NAMES": [
    "delta",
    "history_seen",
    "history_correct",
    "correctness_rate"
  ],
  "COLUMNS_TO_SCALE": [
    "delta",
    "history_seen",
    "history_correct",
    "correctness_rate"
  ],
  "MODEL_VERSION": "1.0",
  "TRAINING_DATE": "2025-11-01"
}
```

---

**Last Updated**: December 2025
**Status**: Production Ready

