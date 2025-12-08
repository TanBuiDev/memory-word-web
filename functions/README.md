# AI-Powered Smart Quiz - Firebase Functions Setup

This directory contains the Firebase Cloud Functions that power the AI-based Smart Quiz feature using a trained LSTM model for predicting word recall probability.

## 📁 Files Overview

- **`main.py`**: Main Firebase Function that handles AI predictions
- **`model.keras`**: Trained LSTM model for predicting recall probability
- **`scaler.joblib`**: Scikit-learn scaler for feature normalization
- **`metadata.json`**: Model configuration (timesteps, features)
- **`requirements.txt`**: Python dependencies

## 🧠 How It Works

1. **User takes a quiz** → Quiz interactions are logged to `interaction_log` collection
2. **Smart Quiz is opened** → Frontend calls `predict_recall` function for each word
3. **AI analyzes history** → Function fetches quiz history and extracts features:
   - `delta`: Time between quiz attempts (seconds)
   - `history_seen`: Number of times the word was seen
   - `history_correct`: Cumulative correct answers
   - `correctness_rate`: Ratio of correct answers
4. **Model predicts** → LSTM model outputs probability of recall (0-1)
5. **Words are sorted** → Frontend displays words with lowest recall probability first

## 🚀 Deployment Steps

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Functions (if not already done)

```bash
firebase init functions
# Select Python as the language
# Select the project: memory-word-55e28
```

### 3. Install Python Dependencies

```bash
cd functions
pip install -r requirements.txt
```

### 4. Deploy the Function

```bash
firebase deploy --only functions
```

**Important**: The function is configured to run in `asia-southeast1` region with 512MB memory to handle TensorFlow/Keras models.

## 📊 Data Flow

### Frontend → Backend
```typescript
// aiService.ts calls the function
const result = await predictRecall({ wordId: word.id })
```

### Backend Processing
```python
# main.py processes the request
1. Fetch quiz history from Firestore (interaction_log collection)
2. Filter only quiz interactions (quiz_flashcard, quiz_mcq, quiz_fill)
3. Extract features from history
4. Normalize features using scaler
5. Predict using LSTM model
6. Return p_recall value
```

### Response
```json
{
  "p_recall": 0.85  // 85% probability of recall
}
```

## 🔧 Configuration

### Region
The function is deployed to `asia-southeast1`. Update in both:
- `functions/main.py`: `@https_fn.on_call(region="asia-southeast1")`
- `src/utils/aiService.ts`: `getFunctions(app, 'asia-southeast1')`

### Memory
Set to 512MB to handle TensorFlow operations:
```python
@https_fn.on_call(
    region="asia-southeast1",
    memory=options.MemoryOption.MB_512
)
```

## 📝 Firestore Schema

### `interaction_log` Collection
```typescript
{
  userId: string
  wordId: string
  type: "quiz_flashcard" | "quiz_mcq" | "quiz_fill"
  timestamp: Timestamp
  extra: {
    correct: boolean
    quizType: string
  }
}
```

## 🐛 Troubleshooting

### Function not found
- Ensure the function is deployed: `firebase deploy --only functions`
- Check the region matches in both frontend and backend

### Model not loading
- Verify all files exist: `model.keras`, `scaler.joblib`, `metadata.json`
- Check function logs: `firebase functions:log`

### Prediction errors
- Ensure user has quiz history (at least 1 quiz interaction)
- Check that `correct` field exists in `extra` object

## 📈 Performance Notes

- First prediction may be slow (cold start ~3-5s)
- Subsequent predictions are faster (~500ms)
- Consider implementing caching for frequently accessed words

## 🔐 Security

- Function requires authentication (`req.auth.uid`)
- Only returns predictions for the authenticated user's words
- Firestore security rules should restrict `interaction_log` access

## 📚 Next Steps

1. Monitor function performance in Firebase Console
2. Implement caching layer for predictions
3. Add batch prediction endpoint for better performance
4. Consider using Cloud Run for more control over scaling

