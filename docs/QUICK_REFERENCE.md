# MemoryWord Smart Quiz - Quick Reference Guide

## 🎯 One-Minute Summary

**MemoryWord** uses an LSTM AI model to predict how well users remember vocabulary words. The system:
1. **Predicts** recall probability (p_recall) based on learning history
2. **Samples** questions using weighted algorithm (harder words more likely)
3. **Adapts** in real-time as users answer questions
4. **Optimizes** for instant loading through caching and background processing

---

## 🔑 Key Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **SmartQuiz.tsx** | Quiz UI & flow | React + TypeScript |
| **aiService.ts** | AI integration | Firebase Functions |
| **predict_recall()** | LSTM inference | TensorFlow/Keras |
| **on_interaction_log_written()** | Auto-update stats | Firestore Trigger |
| **Weighted Sampling** | Question selection | Custom algorithm |

---

## 📊 Key Metrics

| Metric | Value | Note |
|--------|-------|------|
| Quiz load time | 100-170ms | Instant (cached) |
| Cold start | 2.5-3.5s | First request only |
| Warm start | 300ms | Cached model |
| LSTM input | (1, 10, 4) | Batch, timesteps, features |
| p_recall range | 0.0 - 1.0 | Probability user remembers |
| Sampling beta | 1.4 | Weight exponent |

---

## 🔄 Quick Flow

```
User clicks "Smart Quiz"
    ↓
Load words + cached p_recall (instant)
    ↓
Predict fresh p_recall (background)
    ↓
Weighted sampling → 10 questions
    ↓
User answers → Optimistic UI (instant)
    ↓
Log interaction (background)
    ↓
Trigger updates p_recall
    ↓
Next quiz uses updated values
```

---

## 💡 Key Optimizations

### 1. Caching
- **What**: Store p_recall in Firestore
- **Why**: Reuse across sessions
- **Result**: Instant quiz load

### 2. Warm-up
- **What**: Pre-load model in background
- **Why**: Avoid cold start delay
- **Result**: Model ready when needed

### 3. Non-blocking
- **What**: Background predictions & logging
- **Why**: Don't block UI
- **Result**: Instant feedback to user

### 4. Fallback
- **What**: Heuristic formula if AI fails
- **Why**: Ensure app works always
- **Result**: Reliable learning experience

---

## 🧠 LSTM Model

**Input Features** (4 dimensions):
1. **Delta**: Time gap between interactions (seconds)
2. **History Seen**: Cumulative count (0, 1, 2, ...)
3. **History Correct**: Cumulative correct (shifted)
4. **Correctness Rate**: Accuracy ratio

**Processing**:
```
Raw interactions
    ↓
Feature engineering
    ↓
Padding (if < 10)
    ↓
Windowing (last 10)
    ↓
Scaling (normalize)
    ↓
Reshape to (1, 10, 4)
    ↓
LSTM prediction
    ↓
p_recall (0.0-1.0)
```

---

## 📈 Weighted Sampling

**Formula**: `weight = (1 - p_recall)^1.4`

**Examples**:
- p_recall = 0.2 (hard) → weight = 0.72 (HIGH)
- p_recall = 0.5 (medium) → weight = 0.42 (MEDIUM)
- p_recall = 0.9 (easy) → weight = 0.008 (LOW)

**Algorithm**:
1. Calculate weight for each word
2. Generate random number [0, total_weight]
3. Select word where random falls
4. Remove selected word
5. Repeat until 10 words selected

---

## 🔌 API Endpoints

### predict_recall (Callable Function)
```
Input:  { wordId: "word_id" }
Output: { p_recall: 0.35 }
Region: asia-southeast1
Memory: 2GB
```

### on_interaction_log_written (Trigger)
```
Trigger: interaction_log/{docId} write
Action:  Recompute stats + LSTM prediction
Update:  words/{wordId} document
```

---

## 📁 File Locations

**Frontend**:
- `src/pages/SmartQuiz.tsx` - Main component
- `src/utils/aiService.ts` - AI integration
- `src/utils/logQuiz.ts` - Logging

**Backend**:
- `functions/main.py` - Cloud Functions
- `functions/model.keras` - LSTM model
- `functions/scaler.joblib` - Feature scaler
- `functions/metadata.json` - Config

**Database**:
- `words` - Vocabulary with p_recall
- `interaction_log` - User interactions

---

## 🐛 Debugging Tips

### Console Logs to Look For
```
🔥 AI model warm-up initiated (background)
👤 Current user UID: [uid]
📚 Loaded 71 fresh words for quiz
🧠 Analyzing 71 words with AI model...
📊 Using cached p_recall for 60 words (instant)
🔄 Predicting fresh p_recall for 11 words (background)
✅ Smart quiz list ready. Top priority: [word] (XX%)
✅ Logged interaction: word=[term], correct=[true/false]
🔄 Updating p_recall for word: [wordId]
✅ Updated p_recall for word [wordId]: XX%
```

### Network Tab
- Filter: "predict_recall" or "functions"
- Look for: POST requests with wordId
- Response: `{ p_recall: 0.35 }`

### Firestore Console
- Collection: `interaction_log`
- Collection: `words`
- Check: p_recall, seenCount, memorized fields

---

## ❓ FAQ Quick Answers

**Q: Why LSTM instead of SRS?**
A: LSTM learns individual patterns. SRS uses fixed formulas.

**Q: What if AI fails?**
A: Fallback formula ensures app works: `p_recall = 0.7 - (daysOld * 0.01)`

**Q: How much does it cost?**
A: Fits in Firebase free tier. Optimized with caching & limiting.

**Q: How accurate is it?**
A: Learns from user's unique learning history. More accurate than generic SRS.

**Q: Can users see p_recall?**
A: Currently internal. Can add analytics dashboard in future.

---

## 🚀 Performance Checklist

- [ ] Quiz loads in < 1 second
- [ ] Warm-up logs appear in console
- [ ] Cached p_recall used for existing words
- [ ] Fresh predictions run in background
- [ ] Weighted sampling produces varied questions
- [ ] Optimistic UI updates work instantly
- [ ] Logging completes in background
- [ ] p_recall updates reflect in next quiz
- [ ] Fallback formula works if API fails
- [ ] Streak updates correctly

---

## 📚 Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| **README.md** | Overview & index | Everyone |
| **PRESENTATION_SCRIPT.md** | Full presentation | Presenters |
| **DEMO_WALKTHROUGH.md** | Live demo guide | Presenters |
| **BACKEND_TECHNICAL_DETAILS.md** | Backend code | Developers |
| **FRONTEND_TECHNICAL_DETAILS.md** | Frontend code | Developers |
| **SYSTEM_ARCHITECTURE.md** | Design & flow | Architects |
| **QUICK_REFERENCE.md** | This file | Quick lookup |

---

## 🎓 Learning Path

1. **Start**: Read README.md (overview)
2. **Understand**: Read PRESENTATION_SCRIPT.md (full story)
3. **Deep Dive**: Read SYSTEM_ARCHITECTURE.md (design)
4. **Code**: Read FRONTEND_TECHNICAL_DETAILS.md (frontend)
5. **Code**: Read BACKEND_TECHNICAL_DETAILS.md (backend)
6. **Demo**: Follow DEMO_WALKTHROUGH.md (live)
7. **Reference**: Use QUICK_REFERENCE.md (lookup)

---

## 🔗 Key Concepts Map

```
User Learning
    ↓
Interaction Log (Firestore)
    ↓
Feature Engineering (4 features)
    ↓
LSTM Model (TensorFlow)
    ↓
p_recall Prediction (0.0-1.0)
    ↓
Weighted Sampling (weight = (1-p)^1.4)
    ↓
Question Selection (10 words)
    ↓
Quiz Display (React)
    ↓
User Answers
    ↓
[Loop back to Interaction Log]
```

---

## 📞 Quick Help

**Quiz won't load?**
- Check Firestore connection
- Check user authentication
- Check Cloud Functions deployed

**p_recall not updating?**
- Check Firestore trigger deployed
- Check interaction_log has data
- Wait 1-2 seconds for trigger

**AI model slow?**
- First request: Cold start (2-3s)
- Subsequent: Warm start (300ms)
- Check model.keras file exists

**Questions not varied?**
- Check p_recall values exist
- Check weighted sampling algorithm
- Check beta parameter (1.4)

---

**Last Updated**: December 2025
**Version**: 2.0 (Optimized)
**Status**: Production Ready

