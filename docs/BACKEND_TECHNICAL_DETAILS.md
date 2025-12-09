# MemoryWord Backend - Technical Deep Dive

## Cloud Functions Architecture

### Function 1: `predict_recall` (Callable HTTP Function)

**Location**: `functions/main.py` (lines 185-269)

**Purpose**: Predict user's recall probability for a specific word using LSTM model

**Input**:
```json
{
  "wordId": "word_document_id"
}
```

**Output**:
```json
{
  "p_recall": 0.35,
  "status": "success"
}
```

**Processing Pipeline**:

1. **Authentication Check**
   - Verify user is authenticated via Firebase Auth
   - Extract user UID from request context
   - Return 401 if unauthorized

2. **Firestore Query**
   - Query `interaction_log` collection
   - Filter: userId == current_user AND wordId == target_word
   - Order by timestamp (newest first)
   - Limit to TIMESTEP * 2 (20 records) for efficiency
   - Filter only quiz interactions (type starts with "quiz_")

3. **Feature Engineering** (lines 104-182)
   - **Delta**: Time gap between interactions (seconds)
     - Calculated from timestamp differences
     - First interaction: delta = 0
   - **History Seen**: Cumulative count (0, 1, 2, ...)
     - Represents how many times user has seen word
   - **History Correct**: Cumulative correct answers (shifted by 1)
     - Shifted to avoid data leakage
     - Represents past performance
   - **Correctness Rate**: Ratio of correct / total
     - Indicates user's accuracy trend

4. **Data Preparation**
   - Padding: If < 10 interactions, pad with zeros at start
   - Windowing: Take last 10 interactions (TIMESTEP)
   - Scaling: Normalize using pre-trained StandardScaler
   - Reshape: Convert to (1, 10, 4) for LSTM input

5. **LSTM Prediction**
   - Load pre-trained Keras model
   - Input shape: (batch=1, timesteps=10, features=4)
   - Output: Single float value (0.0 - 1.0)
   - Represents probability user will remember word

6. **Fallback Handling**
   - New word (no interactions): Return p_recall = 0.0
   - Model error: Return p_recall = 0.5 (neutral)
   - Firestore error: Return p_recall = 0.5

---

## Function 2: `on_interaction_log_written` (Firestore Trigger)

**Location**: `functions/main.py` (lines 275-386)

**Purpose**: Automatically update word statistics and p_recall when user answers quiz question

**Trigger**: Document write to `interaction_log/{docId}`

**Processing Steps**:

1. **Extract Interaction Data**
   - userId: Who answered
   - wordId: Which word
   - correct: Was answer correct?
   - timestamp: When answered

2. **Fetch Word Document**
   - Get current word data from `words/{wordId}`
   - Retrieve existing stats and memorized status

3. **Recompute Statistics**
   - **seenCount**: Total quiz interactions for this word
   - **correctCount**: How many answered correctly
   - **incorrectCount**: How many answered incorrectly
   - **consecutiveWrong**: Recent failures (scan backwards)
     - Count consecutive wrong answers from most recent
     - Stop at first correct answer

4. **Update Memorized Status**
   - **Revert to not memorized**: If 2+ consecutive wrongs
   - **Mark as memorized**: If just answered correctly with no recent wrongs
   - **Keep status**: Otherwise unchanged

5. **Recompute p_recall** (if model available)
   - Fetch all quiz interactions for this word
   - Run feature engineering (same as predict_recall)
   - Run LSTM prediction
   - Get new p_recall value
   - If model fails: Keep existing p_recall

6. **Update Word Document**
   ```
   words/{wordId}
   ├── seenCount: [number]
   ├── correctCount: [number]
   ├── incorrectCount: [number]
   ├── consecutiveWrong: [number]
   ├── memorized: [boolean]
   ├── needsReview: [boolean]
   ├── lastSeenAt: [timestamp]
   ├── lastResult: "correct" | "wrong"
   └── p_recall: [0.0-1.0]
   ```

---

## Model Loading & Caching

### Lazy Loading Strategy

**Why Lazy Loading?**
- TensorFlow is heavy (~500MB)
- Loading at import time causes deployment issues
- Loading on first request is acceptable (cold start ~2-3s)
- Subsequent requests use cached model (instant)

**Implementation** (lines 57-101):

```python
def ensure_model_loaded():
    global model, scaler, TIMESTEP, FEATURES
    
    if model is not None and scaler is not None:
        return True  # Already loaded
    
    # Load on first use
    from tensorflow.keras.models import load_model
    model = load_model('model.keras')
    scaler = joblib.load('scaler.joblib')
    
    # Load metadata for configuration
    with open('metadata.json', 'r') as f:
        metadata = json.load(f)
    TIMESTEP = metadata.get('TIMESTEP', 10)
    FEATURES = metadata.get('FEATURES', [...])
    
    return True
```

**Artifacts Required**:
- `model.keras`: Trained LSTM model (Keras format)
- `scaler.joblib`: StandardScaler fitted on training data
- `metadata.json`: Configuration (TIMESTEP, FEATURES, columns_to_scale)

---

## Feature Engineering Details

### Input Features (4 dimensions)

1. **Delta (Δt)**
   - Time gap between consecutive interactions (seconds)
   - Range: 0 to millions (depends on user behavior)
   - First interaction: 0
   - Captures: How long user waited before reviewing

2. **History Seen**
   - Cumulative count: 0, 1, 2, 3, ...
   - Represents: Total exposure to word
   - Captures: Familiarity level

3. **History Correct**
   - Cumulative correct answers (shifted by 1)
   - Shifted to prevent data leakage
   - Represents: Past success rate
   - Captures: User's learning trajectory

4. **Correctness Rate**
   - Ratio: history_correct / (history_seen + epsilon)
   - Range: 0.0 to 1.0
   - Captures: User's accuracy trend

### Data Transformation Pipeline

```
Raw Interactions
    ↓
Sort by timestamp (oldest → newest)
    ↓
Extract features (delta, history_seen, history_correct, correctness_rate)
    ↓
Padding (if < 10 interactions, pad with zeros at start)
    ↓
Windowing (take last 10 interactions)
    ↓
Scaling (normalize using StandardScaler)
    ↓
Reshape to (1, 10, 4)
    ↓
LSTM Input
```

---

## Error Handling & Fallbacks

### Scenario 1: Model Not Available
- **Cause**: TensorFlow loading fails
- **Handling**: Return p_recall = 0.5 (neutral)
- **Impact**: Quiz still works, uses fallback formula

### Scenario 2: Firestore Unavailable
- **Cause**: Network error or credentials missing
- **Handling**: Return p_recall = 0.5
- **Impact**: Quiz uses cached values from previous session

### Scenario 3: Word Not Found
- **Cause**: wordId doesn't exist in Firestore
- **Handling**: Return p_recall = 0.0 (new word)
- **Impact**: Word treated as new, prioritized in quiz

### Scenario 4: No Interaction History
- **Cause**: User hasn't answered this word yet
- **Handling**: Return p_recall = 0.0
- **Impact**: Word prioritized for learning

---

## Performance Characteristics

### Cold Start (First Request)
- Model loading: ~2-3 seconds
- Feature engineering: ~100ms
- LSTM prediction: ~200ms
- Total: ~2.5-3.5 seconds

### Warm Start (Cached Model)
- Feature engineering: ~100ms
- LSTM prediction: ~200ms
- Total: ~300ms

### Firestore Query
- Typical: 50-200ms
- Depends on interaction history size
- Limited to 20 records for efficiency

### Memory Usage
- TensorFlow model: ~200-300MB
- Scaler: ~1MB
- Per-request data: ~1MB
- Total: ~300MB (within 2GB limit)

---

## Deployment Configuration

### Cloud Function Settings
- **Runtime**: Python 3.12
- **Memory**: 2GB (required for TensorFlow)
- **Timeout**: 60 seconds
- **Region**: asia-southeast1
- **Concurrency**: 100 (default)

### Environment Variables
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account key
- `FIRESTORE_EMULATOR_HOST`: For local testing (optional)

### Firestore Indexes
- Collection: `interaction_log`
- Composite index: (userId, wordId, timestamp)
- Status: Auto-created by Firebase

---

## Monitoring & Debugging

### Console Logs
```
Loading AI Artifacts on first request...
Loading model.keras...
Loading scaler.joblib...
Loading metadata.json...
AI Model Loaded. Timestep: 10, Features: 4
Predicted p_recall for word [wordId]: 0.35
[Trigger] Recomputed p_recall for word [wordId]: 0.35
[Trigger] Updated word [wordId]: memorized=false, consecutive_wrong=1
```

### Error Logs
```
Error loading artifacts at runtime: [error message]
Prediction Error: [error message]
[Trigger] Error processing interaction for word [wordId]: [error message]
```

### Metrics to Monitor
- Function execution time
- Error rate
- Cold start frequency
- Firestore read/write count
- Model prediction accuracy (offline)

---

## Future Optimizations

1. **Model Caching**: Store model in Cloud Storage, load once
2. **Batch Predictions**: Accept array of wordIds, predict all at once
3. **Async Updates**: Use Pub/Sub for trigger processing
4. **Model Versioning**: Support multiple model versions
5. **A/B Testing**: Compare different LSTM architectures
6. **Personalization**: User-specific model fine-tuning

