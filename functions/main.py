import joblib
import json
import numpy as np
import pandas as pd
from firebase_functions import https_fn, options
from firebase_admin import initialize_app, firestore
# Enable CORS for browser preflight requests.
# Note: https_fn.on_call automatically handles CORS for client SDK calls.
# If manual HTTP endpoints are added later, handle CORS within those functions or using a supported method.

# Do NOT create a Firestore client at import time.
# During `firebase deploy` / emulator analysis the runtime may not have
# Application Default Credentials (ADC) available which causes an exception
# when calling `firestore.client()` at import time. Instead we initialize
# the admin SDK (best-effort) and create the client lazily when a request
# arrives.
try:
    initialize_app()
except Exception as e:
    # Initialization may fail locally if credentials are missing; that's OK
    # as long as we avoid calling firestore.client() until runtime.
    print(f"Firebase Admin initialize_app() skipped at import time: {e}")

# Lazy Firestore client (created on first use)
_db = None
def get_db():
    global _db
    if _db is None:
        try:
            _db = firestore.client()
        except Exception as e:
            # If credentials are missing, fail gracefully and leave _db as None
            print(f"Could not create Firestore client: {e}")
            _db = None
    return _db

# --- MODEL & SCALER LAZY LOADING (avoid heavy import-time work) ---
# Defaults (used if metadata.json missing)
TIMESTEP = 10
# Default features (may be overridden by metadata.json)
FEATURES = ['delta', 'history_seen', 'history_correct', 'correctness_rate']
# Columns expected by the scaler/transform pipeline (may include extra cols like 'p_recall')
COLUMNS_TO_SCALE = list(FEATURES)

# Placeholders; real objects will be loaded on first use
model = None
scaler = None

def ensure_model_loaded():
    """Load model, scaler and metadata on first use. Returns True if model loaded."""
    global model, scaler, TIMESTEP, FEATURES
    if model is not None and scaler is not None:
        return True

    print("Loading AI Artifacts on first request...")
    try:
        import os
        print(f"Current working directory: {os.getcwd()}")
        print(f"Files in current directory: {os.listdir('.')}")

        # Import TensorFlow only when needed (not during deployment)
        from tensorflow.keras.models import load_model
        # Tải model Keras
        print("Loading model.keras...")
        model = load_model('model.keras')

        # Tải Scaler
        print("Loading scaler.joblib...")
        scaler = joblib.load('scaler.joblib')

        # Tải Metadata để lấy thông số (TIMESTEP, FEATURES, columns_to_scale)
        try:
            print("Loading metadata.json...")
            with open('metadata.json', 'r') as f:
                metadata = json.load(f)
            TIMESTEP = metadata.get('TIMESTEP', TIMESTEP)
            FEATURES = metadata.get('FEATURES', FEATURES)
            # columns_to_scale describes the exact column names the scaler expects
            COLUMNS_TO_SCALE = metadata.get('columns_to_scale', list(FEATURES))
            print(f"Metadata loaded. TIMESTEP={TIMESTEP}, FEATURES={FEATURES}, COLUMNS_TO_SCALE={COLUMNS_TO_SCALE}")
        except Exception as e:
            # If metadata missing, keep defaults
            print(f"Warning: Could not load metadata.json: {e}")
            pass
        print(f"AI Model Loaded. Timestep: {TIMESTEP}, Features: {len(FEATURES)}")
        return True
    except Exception as e:
        print(f"Error loading artifacts at runtime: {e}")
        import traceback
        traceback.print_exc()
        model = None
        scaler = None
        return False

# --- HÀM XỬ LÝ DỮ LIỆU (Feature Engineering) ---
def create_features(interactions):
    """
    Chuyển đổi lịch sử tương tác thô thành 4 đặc trưng đầu vào cho model.
    """
    # 1. Chuyển đổi dữ liệu lịch sử thành DataFrame
    if not interactions:
        # Return empty DataFrame with FEATURES columns to keep downstream code consistent
        return pd.DataFrame(columns=FEATURES)
    
    df = pd.DataFrame(interactions)
    
    # 2. Sắp xếp cũ nhất -> mới nhất để tính toán đúng trình tự thời gian
    # (Lưu ý: Firestore query thường trả về mới nhất trước, nên cần sort lại)
    if 'timestamp' in df.columns:
         # Chuyển đổi timestamp sang datetime nếu cần thiết, hoặc sort trực tiếp
         df = df.sort_values('timestamp')
    
    # 3. Tính toán đặc trưng (Feature Engineering)
    
    # [Feature 1] Delta: Khoảng cách thời gian giữa các lần học (giây)
    # Chuyển timestamp sang float (seconds)
    # Firestore timestamp có method timestamp() để lấy Unix timestamp
    def convert_timestamp(x):
        if hasattr(x, 'timestamp'):
            return x.timestamp()
        elif isinstance(x, (int, float)):
            return float(x)
        else:
            return 0.0
    
    df['ts_float'] = df['timestamp'].apply(convert_timestamp)
    df['delta'] = df['ts_float'].diff().fillna(0) # Lần đầu tiên học thì delta = 0
    
    # [Feature 2] History Seen: Số lần đã học tích lũy (0, 1, 2...)
    # Reset index để đảm bảo nó chạy từ 0..N
    df = df.reset_index(drop=True)
    df['history_seen'] = df.index
    
    # [Feature 3] History Correct: Số lần đúng tích lũy TRƯỚC ĐÓ
    # CORRECTED: The 'correct' field is at the top level of the interaction document, not nested in 'extra'.
    # This now correctly reads the boolean 'correct' field, defaulting to False if it's missing.
    if 'correct' in df.columns:
        df['correct'] = df['correct'].fillna(False).astype(bool)
    else:
        df['correct'] = False
    
    # Shift(1) vì kết quả của lần hiện tại chưa xảy ra khi ta dự đoán
    df['history_correct'] = df['correct'].astype(int).cumsum().shift(1).fillna(0)
    
    # [Feature 4] Correctness Rate: Tỷ lệ đúng
    # Thêm 1e-6 để tránh chia cho 0
    df['correctness_rate'] = df['history_correct'] / (df['history_seen'] + 1e-6)
    
    # 4. Chọn đúng 4 đặc trưng và xử lý Padding
    df_features = df[FEATURES]

    # Ensure scaler column set is present; add missing columns (e.g., 'p_recall') with zeros
    for col in COLUMNS_TO_SCALE:
        if col not in df_features.columns:
            df_features[col] = 0.0

    # Padding: Nếu học ít hơn TIMESTEP lần, điền số 0 vào TRƯỚC dữ liệu
    if len(df_features) < TIMESTEP:
        padding_rows = TIMESTEP - len(df_features)
        padding = pd.DataFrame(0.0, index=range(padding_rows), columns=df_features.columns)
        df_features = pd.concat([padding, df_features], ignore_index=True)

    # 5. Lấy đúng cửa sổ (Window) cuối cùng (TIMESTEP dòng)
    final_window = df_features.tail(TIMESTEP)

    # 6. Scale dữ liệu (Chuẩn hóa) - ensure columns order matches COLUMNS_TO_SCALE
    if scaler:
        try:
            ordered = final_window.reindex(columns=COLUMNS_TO_SCALE, fill_value=0.0)
            return scaler.transform(ordered)
        except Exception as e:
            print(f"Scaler transform error: {e}")
            return final_window.values
    else:
        return final_window.values # Fallback nếu scaler lỗi (không nên xảy ra)
    
# --- API FUNCTION ---
@https_fn.on_call(
    region="asia-southeast1", # Thay đổi region nếu cần (vd: us-central1)
    memory=options.MemoryOption.GB_2 # Cần RAM để chạy TensorFlow/Keras
)
def predict_recall(req: https_fn.CallableRequest) -> https_fn.Response:
    """
    API nhận wordId, lấy lịch sử, dự đoán p_recall.
    Input: { "wordId": "..." }
    Output: { "p_recall": 0.85 }
    """
    # Ensure model is loaded (lazy). If loading fails, return safe fallback.
    if not ensure_model_loaded():
        print("Model not available at runtime.")
        return {"error": "Server AI Error: Model not loaded", "p_recall": 0.5}

    # Lấy thông tin user
    uid = req.auth.uid if req.auth else None
    if not uid:
         return {"error": "Unauthorized"}

    word_id = req.data.get('wordId')
    if not word_id:
        return {"error": "Missing wordId"}

    try:
        # 1. Lấy lịch sử học của từ này từ Firestore
        # Lấy nhiều hơn TIMESTEP một chút để tính delta chính xác hơn nếu cần,
        # nhưng lấy đúng TIMESTEP cũng ổn cho MVP.
        _client = get_db()
        if not _client:
            print("Firestore client not available. Ensure ADC or set GOOGLE_APPLICATION_CREDENTIALS.")
            return {"error": "Server Error: Firestore not available", "p_recall": 0.5}

        logs_ref = _client.collection('interaction_log')

        # Query: Lấy các lần tương tác quiz của user với từ này, mới nhất trước
        # Lọc các type bắt đầu với "quiz_" (quiz_flashcard, quiz_mcq, quiz_fill)
        query = logs_ref.where('userId', '==', uid)\
                        .where('wordId', '==', word_id)\
                        .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                        .limit(TIMESTEP * 2)  # Lấy nhiều hơn vì cần filter

        docs = query.get()

        # Chuyển docs thành list of dicts và filter chỉ lấy quiz interactions
        interactions = []
        for d in docs:
            data = d.to_dict()
            # Chỉ lấy các interaction liên quan đến quiz
            if data.get('type', '').startswith('quiz_'):
                interactions.append(data)
                # Dừng khi đủ TIMESTEP
                if len(interactions) >= TIMESTEP:
                    break

        # Đảo ngược lại danh sách vì query lấy Mới -> Cũ, nhưng ta cần tính toán từ Cũ -> Mới
        interactions.reverse()

        # Nếu chưa học bao giờ (từ mới tinh)
        if not interactions:
            # Từ mới thường có p_recall thấp (cần học ngay) hoặc mặc định 0.5
            # Ở đây trả về 0.0 để ưu tiên học
            return {"p_recall": 0.0, "status": "new_word"}

        # 2. Tạo input cho model (Feature Engineering)
        # Kết quả là mảng 2D (10, 4) đã scale
        input_features = create_features(interactions)
        
        # 3. Reshape thành 3D (1, 10, 4) cho LSTM
        # (Batch Size, Timesteps, Features)
        input_data = np.reshape(input_features, (1, TIMESTEP, 4))
        
        # 4. Dự đoán
        # model.predict trả về [[0.85]]
        prediction = model.predict(input_data)
        p_recall = float(prediction[0][0])
        
        print(f"Predicted p_recall for word {word_id}: {p_recall}")
        
        return {"p_recall": p_recall}
        
    except Exception as e:
        print(f"Prediction Error: {e}")
        # Trả về lỗi hoặc giá trị mặc định an toàn
        return {"error": str(e), "p_recall": 0.5}


# --- CONTACT FORM API ---
@https_fn.on_call(
    region="asia-southeast1",
    memory=options.MemoryOption.MB_256 # Nhẹ nhàng cho tác vụ lưu DB
)
def submit_contact(req: https_fn.CallableRequest) -> https_fn.Response:
    """
    API nhận tin nhắn từ form liên hệ.
    Input: { "name": "...", "email": "...", "message": "..." }
    Output: { "success": true, "id": "..." }
    """
    try:
        data = req.data
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        # Basic validation
        if not name or not email or not message:
            return {"error": "Missing required fields (name, email, message)"}

        # Lưu vào Firestore
        _client = get_db()
        if not _client:
             return {"error": "Server Error: Database not available"}

        doc_ref = _client.collection('contact_messages').add({
            'name': name,
            'email': email,
            'message': message,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'userId': req.auth.uid if req.auth else None, # Optional: link to user if logged in
            'status': 'new'
        })
        
        return {"success": True, "id": doc_ref[1].id}

    except Exception as e:
        print(f"Contact Submit Error: {e}")
        return {"error": str(e)}


# --- FIRESTORE TRIGGER: Recompute stats & p_recall on new interaction ---
from firebase_functions import firestore_fn

@firestore_fn.on_document_written(
    document="interaction_log/{docId}",
    region="asia-southeast1"
)
def on_interaction_log_written(event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None]) -> None:
    """
    Trigger on write to interaction_log/{docId}.
    Recomputes per-word stats (consecutiveWrong, seenCount, etc.) and p_recall,
    then updates the words document with new flags and fresh prediction.
    """
    doc_id = event.params.get('docId')
    after = event.data
    if not after:
        # Document was deleted, skip
        return

    interaction = after.to_dict()
    user_id = interaction.get('userId')
    word_id = interaction.get('wordId')
    is_correct = interaction.get('correct', False)

    if not user_id or not word_id:
        print(f"Skipping interaction: missing userId or wordId")
        return

    try:
        db = get_db()
        if not db:
            print("Firestore client not available in trigger")
            return

        word_ref = db.collection('words').document(word_id)
        word_snap = word_ref.get()

        if not word_snap.exists:
            print(f"Word {word_id} not found")
            return

        word_data = word_snap.to_dict()

        # 1. Fetch all quiz interactions for this user + word (old + new)
        logs_ref = db.collection('interaction_log')
        query = logs_ref.where('userId', '==', user_id)\
                        .where('wordId', '==', word_id)\
                        .order_by('timestamp', direction=firestore.Query.ASCENDING)
        docs = query.get()

        interactions = [d.to_dict() for d in docs]
        quiz_interactions = [i for i in interactions if i.get('type', '').startswith('quiz_')]

        # 2. Recompute stats
        seen_count = len(quiz_interactions)
        correct_count = sum(1 for i in quiz_interactions if i.get('correct'))
        incorrect_count = seen_count - correct_count

        # Compute consecutive wrongs (scan from most recent backwards)
        consecutive_wrong = 0
        for i in reversed(quiz_interactions):
            if not i.get('correct'):
                consecutive_wrong += 1
            else:
                break

        # 3. Decide memorized status based on threshold
        memorized = word_data.get('memorized', False)
        threshold_revert = 2  # Revert after 2 consecutive wrongs
        needs_review = False

        if memorized and consecutive_wrong >= threshold_revert:
            # Too many wrongs -> revert
            memorized = False
            needs_review = True
        elif is_correct and consecutive_wrong == 0:
            # Just got it right with no prior wrongs in this session
            memorized = True
            needs_review = False

        # 4. Optionally recompute p_recall if model available
        p_recall = None
        if ensure_model_loaded():
            try:
                # Use the same feature engineering as predict_recall
                input_features = create_features(quiz_interactions)
                input_data = np.reshape(input_features, (1, TIMESTEP, 4))
                prediction = model.predict(input_data)
                p_recall = float(prediction[0][0])
                print(f"[Trigger] Recomputed p_recall for word {word_id}: {p_recall}")

                # ---- START MODIFICATION: Update interaction_log with p_recall_after ----
                if doc_id and p_recall is not None:
                    log_ref_to_update = db.collection('interaction_log').document(doc_id)
                    log_ref_to_update.update({'p_recall_after': p_recall})
                    print(f"[Trigger] Updated interaction_log {doc_id} with p_recall_after.")
                # ---- END MODIFICATION ----

            except Exception as e:
                print(f"[Trigger] Failed to recompute p_recall: {e}")
                # Keep existing p_recall if available
                p_recall = word_data.get('p_recall')

        # 5. Update word document
        update_data = {
            'seenCount': seen_count,
            'correctCount': correct_count,
            'incorrectCount': incorrect_count,
            'consecutiveWrong': consecutive_wrong,
            'memorized': memorized,
            'needsReview': needs_review,
            'lastSeenAt': interaction.get('timestamp'),
            'lastResult': 'correct' if is_correct else 'wrong',
        }
        if p_recall is not None:
            update_data['p_recall'] = p_recall

        word_ref.update(update_data)
        print(f"[Trigger] Updated word {word_id}: memorized={memorized}, consecutive_wrong={consecutive_wrong}, p_recall={update_data.get('p_recall', 'N/A')}")

    except Exception as e:
        print(f"[Trigger] Error processing interaction for word {word_id}: {e}")
        import traceback
        traceback.print_exc()