# Live Demo Script: Smart Quiz Feature
## Capstone Project Defense - Vocabulary Learning App

**Role:** Technical Lead  
**Feature:** Smart Quiz with LSTM Model & Sparrow Search Algorithm (SSA) Integration  
**Duration:** ~8-10 minutes

---

## Pre-Demo Setup

### Action:
- Open browser with Developer Tools (F12)
- Navigate to Network tab
- Navigate to Console tab
- Ensure Firebase Functions logs are accessible (if possible)

### Talking Point:
"Good morning/afternoon, esteemed jury members. Today I'll demonstrate our Smart Quiz feature, which integrates an LSTM neural network for memory prediction with a Sparrow Search Algorithm-inspired weighted sampling mechanism. This creates an adaptive learning system that prioritizes words the user struggles with while maintaining exploration."

---

## Stage 1: Initialization & Prediction (The "Brain")

### Action 1.1: Navigate to Smart Quiz
- Click on "🧠 Smart Quiz" in the sidebar
- Observe the loading screen: "AI đang tối ưu lộ trình học cho bạn..."

### Talking Point:
"Stage 1 demonstrates the LSTM model's prediction phase. When the user initiates Smart Quiz, the frontend loads all their vocabulary words from Firestore and prepares to send them to our Python Cloud Function for AI analysis."

### Action 1.2: Open Network Tab
- Switch to Network tab in DevTools
- Filter by "predict_recall" or "functions"
- Wait for API calls to appear

### Talking Point:
"Here in the Network tab, you can see multiple parallel HTTP requests being made to our Firebase Cloud Function `predict_recall`, located in the `asia-southeast1` region. Each request contains a `wordId` and is authenticated with the user's Firebase Auth token."

### Technical Highlight:
- **Why this proves LSTM works:** The parallel requests show we're sending each word's ID to the backend, where the LSTM model will analyze its learning history. This is the first step of our AI pipeline.

### Action 1.3: Inspect Request Payload
- Click on one of the `predict_recall` requests
- Show the Request Payload: `{ "wordId": "abc123..." }`
- Show the Response: `{ "p_recall": 0.35, "status": "..." }`

### Talking Point:
"The request payload is minimal—just the `wordId`. The backend uses this to query Firestore for the word's interaction history. Notice the response contains `p_recall`, a value between 0 and 1 representing the probability the user will recall this word correctly."

### Action 1.4: Explain Backend Processing (Reference Code)
- Open `functions/main.py` (if available) or reference it verbally
- Point to `predict_recall` function (lines 189-269)

### Talking Point:
"On the backend, our Cloud Function performs several critical steps:

1. **Authentication:** It verifies the user's identity from the Firebase Auth token.
2. **History Retrieval:** It queries the `interaction_log` collection, filtering for quiz interactions (`type` starts with `quiz_`) for this specific word and user, ordered by timestamp.
3. **Feature Engineering:** The raw interaction history is transformed into 4 engineered features:
   - **Delta:** Time intervals between study sessions (in seconds)
   - **History Seen:** Cumulative count of times the word has been studied
   - **History Correct:** Cumulative count of correct answers (shifted by 1 to avoid data leakage)
   - **Correctness Rate:** Ratio of correct answers to total attempts
4. **Padding & Windowing:** If the word has fewer than 10 interactions (our TIMESTEP), we pad with zeros. We then extract the most recent 10-interaction window.
5. **Scaling:** The features are normalized using a pre-trained StandardScaler to match the model's training distribution.
6. **LSTM Prediction:** The scaled features are reshaped into a 3D tensor `(1, 10, 4)`—batch size 1, 10 timesteps, 4 features—and fed into our Keras LSTM model. The model outputs a single probability value."

### Technical Highlight:
- **Why this proves LSTM works:** The feature engineering transforms raw timestamps and boolean correct/wrong flags into temporal sequences that the LSTM can learn from. The padding and windowing ensure consistent input shape, while the scaler ensures the model receives data in the same distribution it was trained on.

### Action 1.5: Show Model Loading
- Check Console for logs: "Loading AI Artifacts on first request..."
- Show that model.keras, scaler.joblib, and metadata.json are loaded lazily

### Talking Point:
"The model, scaler, and metadata are loaded lazily on the first request to minimize cold start time. The metadata.json file contains our TIMESTEP value (10) and the exact feature names, ensuring consistency between training and inference."

---

## Stage 2: Selection Strategy (The "SSA/Sampler")

### Action 2.1: Show Frontend Processing
- Switch to Console tab
- Look for logs: "🧠 Analyzing X words with AI model..."
- Show logs: "📊 [word]: XX% recall probability"

### Talking Point:
"Once all words have received their `p_recall` predictions from the LSTM, the frontend receives an array of words with their associated recall probabilities. Now we implement our Sparrow Search Algorithm-inspired weighted sampling."

### Action 2.2: Reference aiService.ts Code
- Open `src/utils/aiService.ts` (if available) or reference lines 56-95

### Talking Point:
"Instead of simply sorting by `p_recall` (lowest first), which would always show the same few hardest words, we use weighted sampling without replacement. This simulates the exploration-exploitation balance of the Sparrow Search Algorithm:

1. **Weight Calculation:** For each word, we compute a weight using the formula: `weight = (1 - p_recall)^β`, where β (beta) is set to 1.4. This means:
   - Words with low `p_recall` (e.g., 0.2) get high weights (0.8^1.4 ≈ 0.73)
   - Words with high `p_recall` (e.g., 0.9) get low weights (0.1^1.4 ≈ 0.04)
   - But the randomness ensures medium-difficulty words also appear

2. **Sampling Without Replacement:** We repeatedly:
   - Calculate total weight
   - Generate a random number between 0 and total weight
   - Select the word whose cumulative weight contains this random number
   - Remove the selected word from the pool
   - Repeat until the pool is empty

This creates a prioritized but diverse selection that adapts to the user's learning state."

### Technical Highlight:
- **Why this proves SSA works:** The weighted sampling ensures that words the LSTM predicts the user will struggle with (low `p_recall`) are more likely to appear, but not exclusively. This prevents the user from being overwhelmed by only the hardest words, maintaining engagement while still focusing on areas needing improvement.

### Action 2.3: Show Final Queue
- In Console, find: "✅ Smart quiz list ready. Top priority (sampled): [word] (XX%)"
- Note that the displayed word may not be the absolute lowest `p_recall`, demonstrating the sampling effect

### Talking Point:
"The final quiz queue is now ready. Notice that while the system prioritizes words with lower recall probabilities, the sampling introduces variety. This is the core of our SSA-inspired approach: exploitation of weak areas balanced with exploration of the entire vocabulary space."

---

## Stage 3: User Interaction (The "Test")

### Action 3.1: Start Quiz
- Wait for quiz to load (should show first question)
- Observe the quiz interface: question number, progress bar, quiz mode options

### Talking Point:
"The quiz interface presents one word at a time. The user can choose between three interaction modes: Flashcard, Multiple Choice, or Fill-in-the-Blank. Each mode tests different aspects of recall."

### Action 3.2: Answer a Question
- Select an answer (correct or incorrect)
- Observe immediate UI feedback (green for correct, red for incorrect)
- Watch the progress bar advance

### Talking Point:
"When the user submits an answer, the frontend immediately updates the UI optimistically—showing visual feedback and advancing the progress bar. This provides instant responsiveness, but the real learning happens in the background."

### Action 3.3: Show Answer Recording
- Open Network tab again
- Look for POST request to `interaction_log` collection
- Show the payload structure

### Talking Point:
"Simultaneously, the frontend writes a new document to the `interaction_log` collection in Firestore. This document contains:
- `userId`: The authenticated user's ID
- `wordId`: The word that was tested
- `type`: The quiz mode (e.g., `quiz_mcq`, `quiz_flashcard`, `quiz_fill`)
- `correct`: Boolean indicating if the answer was correct
- `timestamp`: Server timestamp for accurate time tracking
- `extra`: Additional metadata (e.g., the quiz mode)

This log entry is the foundation for our feedback loop."

### Technical Highlight:
- **Why this proves the system works:** The interaction log creates a continuous learning history. Each answer becomes a data point that will influence future `p_recall` predictions, creating a self-improving system.

---

## Stage 4: The Feedback Loop (The "Update")

### Action 4.1: Explain Firestore Trigger
- Reference `functions/main.py` lines 275-385 (the `on_interaction_log_written` trigger)

### Talking Point:
"Immediately after the interaction log is written, a Firestore Cloud Function trigger fires automatically. This trigger, `on_interaction_log_written`, performs several critical updates:

1. **History Re-fetch:** It queries all quiz interactions for this word and user, ordered chronologically.
2. **Stat Recalculation:** It recomputes:
   - `seenCount`: Total number of quiz attempts
   - `correctCount`: Total number of correct answers
   - `incorrectCount`: Total number of incorrect answers
   - `consecutiveWrong`: Number of consecutive wrong answers (scanned from most recent backwards)
3. **Memorization Logic:** It updates the `memorized` flag based on performance:
   - If the word was `memorized` but the user gets 2+ consecutive wrong answers, it reverts to `memorized: false` and sets `needsReview: true`
   - If the user just got it correct with no prior wrongs in the session, it sets `memorized: true`
4. **LSTM Re-prediction:** Most importantly, it re-runs the LSTM model with the updated interaction history, computing a fresh `p_recall` value.
5. **Word Document Update:** All these stats and the new `p_recall` are written back to the word document in Firestore."

### Technical Highlight:
- **Why this proves the feedback loop works:** The trigger ensures that every user interaction immediately updates the word's learning state. The LSTM re-prediction means that the next time this word is considered for a quiz, it will have an updated `p_recall` based on the most recent performance, creating a true adaptive learning system.

### Action 4.2: Show Updated Word Document
- Open Firestore Console (if accessible) or explain what happens
- Show that `p_recall`, `seenCount`, `consecutiveWrong`, etc. are updated

### Talking Point:
"The word document now contains the latest statistics and the updated `p_recall`. This means:
- If the user answered correctly, the `p_recall` should increase (the model predicts better future recall)
- If the user answered incorrectly, especially multiple times in a row, the `p_recall` should decrease
- The `needsReview` flag helps the UI surface words that require immediate attention"

### Action 4.3: Demonstrate Adaptive Behavior
- Complete the current quiz
- Click "🔄 Học tiếp 10 từ khác" to start a new session
- Observe that the new quiz queue may differ based on updated `p_recall` values

### Talking Point:
"When the user starts a new quiz session, the system:
1. Re-fetches all words from Firestore (now with updated `p_recall` values)
2. Sends them through the LSTM prediction again (in case there are new words or the model wants to re-evaluate)
3. Applies the weighted sampling again
4. The new queue reflects the user's current learning state

This creates a truly adaptive system: words the user struggles with appear more frequently, while words they've mastered appear less often, but not never—maintaining the exploration-exploitation balance."

### Technical Highlight:
- **Why this proves the complete system works:** The feedback loop is closed. User actions → interaction logs → trigger updates → LSTM re-prediction → updated word stats → next quiz selection. This creates a self-improving learning system that adapts in real-time to the user's performance.

---

## Closing Summary

### Talking Point:
"To summarize, our Smart Quiz feature demonstrates:

1. **LSTM Model Integration:** A deep learning model hosted in Python Cloud Functions that predicts recall probability based on temporal learning patterns, using engineered features from interaction history.

2. **SSA-Inspired Sampling:** A weighted sampling algorithm that prioritizes difficult words while maintaining diversity, preventing user fatigue and ensuring comprehensive vocabulary coverage.

3. **Real-time Adaptation:** A closed feedback loop where every user interaction triggers model re-evaluation and stat updates, ensuring the system continuously adapts to the user's learning progress.

4. **Scalable Architecture:** The system handles parallel predictions, lazy model loading, and serverless triggers, making it production-ready and cost-effective.

This combination of AI prediction, intelligent sampling, and continuous adaptation creates an effective personalized learning experience that optimizes study time and improves retention rates."

### Action:
- Thank the jury
- Open for questions

---

## Key Technical Points to Emphasize

1. **LSTM handles temporal sequences:** The model processes 10 timesteps of interaction history, learning patterns like "user tends to forget words after 3 days" or "user struggles with words they got wrong twice in a row."

2. **Feature engineering is critical:** Raw timestamps and boolean flags are transformed into meaningful features (delta, cumulative counts, rates) that the LSTM can learn from.

3. **Weighted sampling prevents overfitting:** Pure lowest-first selection would always show the same words. SSA-inspired sampling ensures variety while maintaining focus on weak areas.

4. **Serverless architecture enables scalability:** Cloud Functions handle the compute-intensive LSTM predictions, while Firestore triggers ensure real-time updates without polling.

5. **Optimistic UI updates:** The frontend provides instant feedback while background processes handle the heavy lifting, creating a responsive user experience.

---

## Potential Questions & Answers

**Q: Why not use a simpler algorithm like spaced repetition?**  
A: "Spaced repetition uses fixed intervals, while our LSTM learns personalized patterns. For example, if a user consistently forgets words after 2 days, the LSTM will predict lower recall for words studied 2 days ago, even if spaced repetition suggests they should be fine. This personalization improves accuracy."

**Q: How do you handle cold starts with the LSTM model?**  
A: "The model is loaded lazily on first request and kept in memory for subsequent requests. For production, we could use Cloud Functions with minimum instances or a dedicated prediction service. The metadata.json ensures consistent feature engineering even if the model is reloaded."

**Q: What if the LSTM model fails or is unavailable?**  
A: "We have a fallback heuristic in `getFallbackRecall()` that uses word age and memorization status. The system gracefully degrades, ensuring the quiz still works even if the AI service is down."

**Q: How do you ensure the weighted sampling doesn't always select the same words?**  
A: "The randomness in the sampling process ensures variety. Even with β=1.4 (which strongly favors low p_recall), there's still a chance for medium-difficulty words to be selected. Additionally, we sample without replacement, so once a word is selected, it's removed from the pool for that session."

**Q: What's the performance impact of calling the LSTM for every word?**  
A: "We make parallel requests using `Promise.all()`, so all predictions happen concurrently. The Cloud Function is optimized with 2GB RAM and runs in asia-southeast1 for low latency. For users with hundreds of words, we could implement batching or caching strategies, but for typical vocabulary sizes (50-200 words), the current approach is efficient."

---

## Demo Checklist

- [ ] Browser DevTools open (Network + Console tabs)
- [ ] Firebase project accessible
- [ ] User account with at least 10-20 words
- [ ] Some words should have interaction history (for meaningful p_recall values)
- [ ] Network tab filtered to show API calls
- [ ] Console logs visible
- [ ] Code files accessible (main.py, aiService.ts, SmartQuiz.tsx) for reference
- [ ] Firestore Console accessible (optional, for showing document updates)
- [ ] Stable internet connection
- [ ] Backup: Screenshots/video of the demo flow

---

**End of Script**

