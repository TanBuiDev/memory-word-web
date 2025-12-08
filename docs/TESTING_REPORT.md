## MemoWord – AI & UI Testing Report

### 1. Build, Runtime & Scope

- **Environment**: Local Vite dev server (`npm run dev`), production build via `npm run build`.
- **Backend AI**: Tested `functions/main.py` inside `functions/venv` to verify model, scaler, and metadata loading.
- **Scope limitations**: Could not complete real Google sign‑in or hit deployed Firebase Functions from this environment; authenticated flows are validated by code and local Python execution, not production data.

---

### 2. LSTM Model & Cloud Function (Backend)

**Artifacts & loading**

- Artifacts in `functions/`: `model.keras`, `scaler.joblib`, `metadata.json`.
- `ensure_model_loaded()` lazily loads:
  - Keras model from `model.keras`.
  - Scaler from `scaler.joblib`.
  - `TIMESTEP`, `FEATURES`, `columns_to_scale` from `metadata.json`.
- Local sanity check:
  - Command: `cd functions && .\venv\Scripts\python.exe -c "import main; print(main.ensure_model_loaded())"`.
  - Result: **`True`**, model and scaler successfully loaded; TensorFlow logs only, plus a scikit‑learn version mismatch warning.

**Feature engineering (`create_features`)**

- Input: list of quiz interaction dicts from `interaction_log`.
- Steps:
  - Sort by `timestamp` ascending.
  - Compute:
    - `delta`: time gaps between attempts (seconds).
    - `history_seen`: running index (0,1,2,…).
    - `history_correct`: cumulative correct count, **shifted by 1** to avoid leaking current outcome.
    - `correctness_rate`: `history_correct / (history_seen + 1e-6)`.
  - Ensure all `COLUMNS_TO_SCALE` exist (e.g. fill `p_recall` with 0 if needed).
  - Pad at the **front** if there are fewer than `TIMESTEP` interactions.
  - Take the last `TIMESTEP` rows, reorder columns to `COLUMNS_TO_SCALE`, apply scaler if available.

**Callable function (`predict_recall`)**

- Signature: Firebase callable (`https_fn.on_call`) at `asia-southeast1`, memory `GB_2`.
- Logic:
  - Requires `req.auth.uid` and `wordId`.
  - Fetches up to `TIMESTEP * 2` `interaction_log` docs for `(userId, wordId)`, newest first; filters to `type` starting with `"quiz_"`.
  - If no quiz interactions: returns `{ p_recall: 0.0, status: "new_word" }`.
  - Otherwise:
    - Builds feature window via `create_features()`.
    - Reshapes to `(1, TIMESTEP, 4)` and calls `model.predict`.
    - Returns `{ p_recall }` as a float.
  - Failure modes:
    - Model not loaded or Firestore client missing → safe fallback `{ p_recall: 0.5, error: ... }`.

**Firestore trigger (`on_interaction_log_written`)**

- Triggered on writes to `interaction_log/{docId}`.
- For each write:
  - Gathers all quiz interactions for `(userId, wordId)` ordered ascending.
  - Computes:
    - `seenCount`, `correctCount`, `incorrectCount`.
    - `consecutiveWrong` by scanning from most recent backwards.
    - `memorized`/`needsReview` based on `consecutiveWrong` and current correctness.
  - Optionally recomputes `p_recall` with the LSTM model.
  - Updates the corresponding `words/{wordId}` document with stats, flags, `lastSeenAt`, and `lastResult`.

**Backend feedback**

- **Correctness**: Feature engineering and prediction path are coherent and consistent between callable and trigger.
- **Robustness**:
  - Good use of lazy loading and safe fallbacks.
  - Recommend clamping outputs: `p_recall = max(0.0, min(1.0, p_recall))` before returning/updating Firestore.
- **Dependencies**:
  - `scaler.joblib` was trained on scikit‑learn 1.6.1; runtime uses 1.7.2, causing an `InconsistentVersionWarning`.
  - Recommendation: pin the same scikit‑learn version in `functions/requirements.txt` to avoid subtle issues.

---

### 3. Smart Quiz Selection (SSA‑Style Behavior)

**Frontend integration (`src/utils/aiService.ts`)**

- Uses `getFunctions(app, 'asia-southeast1')` and `httpsCallable(..., 'predict_recall')`.
- For each `Word`:
  - Calls `predict_recall({ wordId })`.
  - On success: attaches `p_recall` to the word (default 0.5 if missing).
  - On error: falls back to `p_recall = 0.5` or a heuristic (`getFallbackRecall`) based on `memorized` and age.

**Weighted sampling (SSA‑like logic)**

- For the AI‑enriched list:
  - Parameters:
    - `BETA = 1.4` (emphasizes lower recall).
    - `P_MIN = 0.01`, `P_MAX = 0.99` (bounds).
  - Weight for each word: `w_i = (1 - p_i)^BETA`, where `p_i` is clamped `p_recall`.
  - Performs **weighted sampling without replacement**:
    - Repeatedly draws an index based on current weights.
    - Removes the chosen word and its weight.
    - Stops when pool is empty or all weights are zero (then appends the rest).

**Behavioral summary**

- Low‑recall words (small `p_recall`) are much more likely to appear early.
- Medium‑difficulty words still appear due to without‑replacement sampling, preventing “getting stuck” on a few items.
- This acts as a **soft priority queue** that is similar in spirit to a sparrow search or other metaheuristics: focused on exploitation of hard items with inherent exploration via randomness.

**Sampler feedback & ideas**

- Current design is reasonable and user‑friendly:
  - Balances review of weakest words with variety.
- Potential enhancements for more “SSA‑like” adaptivity:
  - Make `BETA` dynamic (e.g. increase as the session progresses or as user accuracy rises).
  - Add a small exploration probability that picks a truly random word independent of weights.
  - Log per‑session stats (mean/min/max `p_recall` in sampled lists) to validate difficulty curves.

---

### 4. Frontend & UX (Quiz, Smart Quiz, Home)

**Type & state correctness**

- Fixed TypeScript issues and aligned shapes across:
  - `Word` (`src/types/word.ts`) now includes optional:
    - `seenCount`, `correctCount`, `incorrectCount`, `consecutiveWrong`, `lastSeenAt`, `needsReview`.
  - `WordCard` props now accept `lastSeenAt?: number | null`.
  - `Quiz.tsx` list loading typed safely instead of spreading `unknown`.
  - `selectionMode` typed as a discriminated union instead of a loose cast.
  - Removed an unused `deleteDoc` import in `Settings.tsx`.
- After fixes, `npm run build` succeeds and Vite successfully produces a production bundle.

**Quiz page behavior (`src/pages/Quiz.tsx`)**

- Supports:
  - Modes: `"flashcard" | "mcq" | "fill"`.
  - Selection modes: `"random" | "byList" | "chooseNumber"`.
- On answer:
  - Optimistically increments `seenCount` in local state for both `words` and `quizQueue`.
  - Writes an `interaction_log` entry with:
    - `userId`, `wordId`, `type` (e.g. `quiz_flashcard`), `correct`, `timestamp`.
  - Updates the `words/{wordId}` document with:
    - `seenCount` (increment), `lastSeenAt`, `lastResult`.
- This is aligned with what the Firestore trigger and LSTM model expect.

**Home & Word cards**

- `Home.tsx` listens to `words` and `lists` with `onSnapshot` and maps Firestore documents into `Word`.
- `WordCard.tsx` displays:
  - Memorized toggle and “Needs review” badge.
  - `seenCount`, `incorrectCount`, `lastSeenAt` (date).
  - Notes with edit/delete, and per‑list assignment via a dropdown.
- Once triggers are active and interactions are logged, the UI will reflect:
  - Updated SRS stats.
  - Updated `needsReview` and `memorized` flags.

**Login & general UI/UX**

- Login page:
  - Clear branding (“MemoryWord”), tagline and a single Google OAuth CTA.
  - Brief privacy reassurance message under the button.
- Main app:
  - Cohesive gradient backgrounds (fuchsia/rose/violet), rounded cards, and consistent typography.
  - Quick Start Guide auto‑shows for new users or when explicitly requested.
  - Good use of toasts/messages for feedback on actions (add word, bulk delete, settings).

---

### 5. Key Recommendations

**Backend / AI**

- **Pin scikit‑learn** to the version used for training `scaler.joblib` (likely 1.6.1) in `functions/requirements.txt`.
- Clamp `p_recall` in both `predict_recall` and the trigger:
  - `p_recall = max(0.0, min(1.0, float(prediction[0][0])))`.
- Monitor logs after deployment:
  - `firebase functions:log --only predict_recall` and for the Firestore trigger, to catch any scaler or Firestore auth issues early.

**Smart Quiz / SSA‑style sampling**

- Consider adjusting the sampler to:
  - Vary `BETA` dynamically based on session progress or recent performance.
  - Introduce a small exploration rate for pure random picks.
  - Add a small debug panel in Smart Quiz to display:
    - List of words with `p_recall`.
    - Aggregate stats (mean/min/max).
    - Optional visualization of weights.

**UI/UX**

- On Smart Quiz, surface:
  - A compact label like “Recall: 32%” per word (rounded `p_recall * 100`).
  - An AI status chip (“AI model active” vs “Fallback heuristic in use”) based on the presence of `data.error`.
- Run a quick accessibility pass:
  - Verify color contrast for buttons/text on gradients meets WCAG AA.
  - Ensure labels on sliders, dropdowns and destructive actions (e.g. delete) are clear and localized.

---

### 6. Summary

- The **LSTM model and associated artifacts load and run correctly** in the Python functions environment.
- The **Smart Quiz pipeline** (Firestore → feature engineering → prediction → weighted sampling) is well‑designed and coherent.
- The **UI is modern and consistent**, with a solid quiz experience and onboarding; small enhancements to transparency and accessibility will further improve user trust and usability.


