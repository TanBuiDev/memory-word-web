# 🚀 Firebase Functions Deployment Guide

## ✅ Problem Fixed

**Issue:** Firebase Functions deployment was timing out because TensorFlow model was loading during initialization (10s timeout).

**Solution:** Implemented **lazy loading** - the model only loads when the function is first called, not during deployment.

---

## 🔧 Changes Made to `main.py`

### 1. **Lazy Loading Implementation**

**Before (❌ Caused timeout):**
```python
# Model loaded during initialization
model = load_model('model.keras')
scaler = joblib.load('scaler.joblib')
```

**After (✅ Fixed):**
```python
# Model loaded only when function is first called
model = None
scaler = None

def load_model_if_needed():
    global model, scaler
    if model is not None:
        return  # Already loaded
    
    print("🤖 Loading AI Artifacts (lazy loading)...")
    model = load_model('model.keras')
    scaler = joblib.load('scaler.joblib')
    # ...
```

### 2. **Increased Memory & Timeout**

```python
@https_fn.on_call(
    region="asia-southeast1",
    memory=options.MemoryOption.GB_1,  # Increased from 512MB to 1GB
    timeout_sec=60  # Increased from default 10s to 60s
)
```

### 3. **Function Call Pattern**

```python
def predict_recall(req: https_fn.CallableRequest):
    # Lazy load model on first call
    try:
        load_model_if_needed()
    except Exception as e:
        return {"error": "Model not loaded", "details": str(e)}
    
    # ... rest of the function
```

---

## 📦 Deployment Steps

### **Step 1: Navigate to functions directory**
```bash
cd functions
```

### **Step 2: Verify files exist**
Make sure these files are present:
- ✅ `main.py` (updated with lazy loading)
- ✅ `model.keras` (your LSTM model)
- ✅ `scaler.joblib` (your scaler)
- ✅ `metadata.json` (model metadata)
- ✅ `requirements.txt` (Python dependencies)

### **Step 3: Deploy to Firebase**
```bash
firebase deploy --only functions
```

**Expected output:**
```
✔ functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔ functions: required API cloudfunctions.googleapis.com is enabled
✔ functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing codebase default for deployment
i  functions: ensuring required API artifactregistry.googleapis.com is enabled...
✔ functions: required API artifactregistry.googleapis.com is enabled
i  functions: Loading and analyzing source code for codebase default to determine what to deploy
Serving function...
i  functions: preparing functions directory for uploading...
i  functions: packaged /path/to/functions (XX MB) for uploading
✔ functions: functions folder uploaded successfully
i  functions: creating Python 3.11 function predict_recall(asia-southeast1)...
✔ functions[predict_recall(asia-southeast1)] Successful create operation.
Function URL (predict_recall(asia-southeast1)): https://predict_recall-XXXXX-uc.a.run.app

✔ Deploy complete!
```

---

## 🧪 Testing After Deployment

### **Test 1: Check Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Functions** section
3. Verify `predict_recall` function is deployed
4. Check region: `asia-southeast1`
5. Check memory: `1 GB`

### **Test 2: Test from Frontend**
1. Run your app: `npm run dev`
2. Login and click "🧠 Smart Quiz"
3. Open browser console (F12)
4. Look for logs:
   ```
   🤖 Calling LSTM model for word: [word_id]
   ✅ LSTM prediction: p_recall = 0.XX
   ```

### **Test 3: Check Firebase Logs**
```bash
firebase functions:log --only predict_recall
```

**Expected logs on first call:**
```
🤖 Loading AI Artifacts (lazy loading)...
✅ AI Model Loaded. Timestep: 10, Features: 4
Predicted p_recall for word abc123: 0.75
```

**Expected logs on subsequent calls:**
```
Predicted p_recall for word xyz789: 0.42
```
(No loading message because model is already loaded)

---

## ⚡ Performance Notes

### **First Call (Cold Start)**
- **Time:** ~5-10 seconds (loading TensorFlow + model)
- **Memory:** ~800 MB
- **User Experience:** Slight delay on first quiz

### **Subsequent Calls (Warm)**
- **Time:** ~100-500 ms (just prediction)
- **Memory:** ~800 MB (model stays in memory)
- **User Experience:** Fast and smooth

### **After 15 Minutes Idle**
- Function instance shuts down
- Next call will be a cold start again
- This is normal Firebase Functions behavior

---

## 🔍 Troubleshooting

### **Issue: Still getting timeout error**

**Solution 1:** Increase timeout further
```python
timeout_sec=120  # 2 minutes
```

**Solution 2:** Use smaller model
- Consider quantizing your model
- Use TensorFlow Lite instead of full TensorFlow

**Solution 3:** Pre-warm the function
```bash
# Call the function once after deployment to warm it up
curl -X POST https://predict_recall-XXXXX.cloudfunctions.net/predict_recall \
  -H "Content-Type: application/json" \
  -d '{"wordId": "test"}'
```

### **Issue: Out of memory error**

**Solution:** Increase memory to 2GB
```python
memory=options.MemoryOption.GB_2
```

### **Issue: Model file not found**

**Solution:** Verify files are in `functions/` directory
```bash
ls -la functions/
# Should see: model.keras, scaler.joblib, metadata.json
```

### **Issue: Import errors**

**Solution:** Check `requirements.txt` has all dependencies
```txt
firebase-functions
firebase-admin
tensorflow
joblib
numpy
pandas
```

Then redeploy:
```bash
firebase deploy --only functions
```

---

## 💰 Cost Considerations

### **Pricing (Firebase Blaze Plan)**

**Per invocation:**
- First 2 million invocations/month: FREE
- After that: $0.40 per million

**Memory (1GB):**
- First 400,000 GB-seconds/month: FREE
- After that: $0.0000025 per GB-second

**Example calculation:**
- 1000 users
- 10 quizzes per day per user
- 10 words per quiz
- = 100,000 function calls/day
- = 3 million calls/month
- **Cost:** ~$0.40/month (very cheap!)

**Cold start cost:**
- First call takes 5-10s = more GB-seconds
- But happens rarely (every 15 min idle)
- Negligible impact on total cost

---

## ✅ Deployment Checklist

Before deploying, verify:

- [ ] `main.py` has lazy loading implemented
- [ ] Memory set to `GB_1` or higher
- [ ] Timeout set to `60` seconds or higher
- [ ] All model files exist in `functions/` directory
- [ ] `requirements.txt` has all dependencies
- [ ] Firebase project is on **Blaze Plan** (required for Cloud Functions)
- [ ] Region is set correctly (`asia-southeast1`)

After deploying, verify:

- [ ] Deployment completed without timeout errors
- [ ] Function appears in Firebase Console
- [ ] Function URL is generated
- [ ] First test call succeeds (may take 5-10s)
- [ ] Subsequent calls are fast (<1s)
- [ ] Frontend can call the function successfully
- [ ] Logs show model loading on first call only

---

## 🎉 Success!

If deployment succeeds, you should see:

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/memory-word-55e28/overview
```

Your AI-powered Smart Quiz is now live! 🚀

---

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [TensorFlow in Cloud Functions](https://cloud.google.com/functions/docs/tutorials/tensorflow)
- [Optimizing Cold Starts](https://firebase.google.com/docs/functions/tips#optimize_cold_start_time)

