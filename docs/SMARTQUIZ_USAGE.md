# SmartQuiz — Hướng dẫn sử dụng, nguyên lý AI và khắc phục

Version: 1.0

Mục đích: giải thích vì sao **Khả năng nhớ (Remembering Ability / p_recall)** không tự động tăng ngay khi trả lời đúng trong `SmartQuiz`, mô tả ngắn gọn cách AI model hoạt động, và cung cấp các cách sửa/tuỳ chọn để cải thiện trải nghiệm.

---

## Tóm tắt vấn đề

- `SmartQuiz` khởi tạo `quizQueue` với `p_recall` cho từng từ bằng cách gọi hàm Firebase Callable `predict_recall` (qua `getSmartQuizList`).
- Khi bạn trả lời đúng, code hiện tại đánh dấu `memorized: true` cho document `words` trong Firestore. Tuy nhiên `quizQueue` (và giá trị `currentWord.p_recall`) không được cập nhật sau đó — vì vậy chỉ số hiển thị (ví dụ `p_recall * 100%`) vẫn giữ giá trị cũ.

Kết quả: giao diện không thay đổi ngay, nên bạn thấy “Khả năng nhớ” không tăng ngay lúc trả lời đúng.

---

## Nguyên lý hoạt động của AI (tóm tắt)

- Endpoint: `predict_recall` (Firebase Function callable).
- Dữ liệu đầu vào: `wordId`, hàm lấy các interaction từ collection `interaction_log` cho `userId` + `wordId`.
- Tiền xử lý: lọc các interaction liên quan đến quiz, sắp xếp từ cũ -> mới, tạo 4 đặc trưng: `delta` (thời gian giữa các lần), `history_seen`, `history_correct`, `correctness_rate`.
- Padding: tạo window có độ dài `TIMESTEP` (mặc định 10) — nếu ít interaction sẽ pad bằng 0.
- Scale: dùng `scaler.joblib` để chuẩn hoá input (nếu có).
- Mô hình: Keras LSTM (mô hình được load lazy trên lần gọi đầu tiên trong runtime). Đầu ra là một số float 0..1 = `p_recall`.
- Fallbacks: nếu không có interaction trả `p_recall = 0.0` (mới hoàn toàn). Nếu model/scaler không load được, hàm trả lỗi hoặc `p_recall` trung tính (0.5) tùy kịch bản.

Ghi chú vận hành: model được load lazy (tránh load lúc import để không gây lỗi deploy/emulator). Việc gọi `predict_recall` nhiều lần song song có thể gây cold-starts/latency vì mỗi call có thể khởi động runtime model.

---

## Các cách sửa để `Remembering Ability` cập nhật ngay khi trả lời đúng

Bạn có 3 lựa chọn chính. Chọn một tuỳ theo mong muốn về độ chính xác so với tốc độ/UX:

1. Optimistic local update (nhanh, đơn giản)

- Sau khi update `memorized` thành công, cập nhật `quizQueue` tại client để tăng `p_recall` (ví dụ 1.0 hoặc 0.95) ngay lập tức. Không gọi lại model.
- Ưu: phản hồi UX tức thì, đơn giản.
- Nhược: giá trị không chính xác so với model, nhưng hợp lý vì vừa đánh thuộc.

Mã mẫu (thêm vào `handleNext` trong `SmartQuiz.tsx`):

```ts
// Sau await updateDoc(...)
setQuizQueue((prev) =>
  prev.map((w) =>
    w.id === currentWord.id ? { ...w, memorized: true, p_recall: 1 } : w
  )
);
```

2. Re-call model for that word (chính xác, chậm hơn)

- Gọi lại `predict_recall` cho từ vừa trả lời (1 request, không phải toàn bộ danh sách). Lấy kết quả và cập nhật `quizQueue` cho từ đó.
- Ưu: chính xác theo model.
- Nhược: latency, có thể tốn quota hoặc kích cold start.

Ví dụ logic:

```ts
// import lại hoặc gọi helper để gọi callable for a single word
const result = await predictRecall({ wordId: currentWord.id });
const p = result.data?.p_recall ?? 0.5;
setQuizQueue((prev) =>
  prev.map((w) => (w.id === currentWord.id ? { ...w, p_recall: p } : w))
);
```

3. Server-side / background update (scale, persistent)

- Đặt `p_recall` vào chính document `words` và cập nhật trên server (ví dụ khi interaction_log thay đổi, Cloud Function onWrite tính lại p_recall và ghi vào `words`).
- Khi client cần, chỉ đọc `words` (ít gọi function, nhanh hơn, hợp lý cho dashboard/aggregate).
- Ưu: tiết kiệm calls, ổn định, chính xác nếu bạn thiết kế trigger/queue hợp lý.
- Nhược: cần thay đổi backend (Cloud Function onWrite hoặc scheduled job), cần chỉnh Firestore rules.

---

## Các vấn đề kỹ thuật cần kiểm tra / chú ý

- Xác thực: callable function dùng `req.auth` để lấy uid; đảm bảo user đang đăng nhập để auth được truyền tự động.
- Region/Configuration: `aiService.ts` dùng `asia-southeast1` — hàm `predict_recall` cũng được deploy ở region này; nếu mismatch thì gọi sẽ fail.
- Cold-start & RAM: model load cần memory (function set memory GB_2 in `main.py`) và có cold-start — tránh gọi song song quá nhiều request khi nhiều từ.
- Quota & Cost: gọi model nhiều lần (mỗi từ) có thể tốn thời gian và chi phí; cân nhắc cache/persist.

---

## Gợi ý nâng cao (nếu muốn tiếp tục phát triển)

- Thay vì gọi model cho mỗi từ trong client khi bắt đầu quiz, bạn có thể:

  - Precompute p_recall cho tất cả từ và lưu vào `words` khi interaction_log thay đổi (Cloud Function trigger).
  - Hoặc group calls (batch) ở server và trả về top-N list để giảm số callable invocations.

- Cải thiện UX tag/difficulty: nếu dùng `p_recall` để sắp xếp, cân nhắc pha trộn heuristic + model để tránh bias nếu model lỗi.

---

## Quick checklist để sửa nhanh (tốc hành)

1. Nếu bạn muốn kết quả ngay và đơn giản: thêm đoạn `setQuizQueue(...)` như ví dụ (optimistic update).
2. Nếu bạn muốn chính xác: gọi lại `predict_recall` cho từ vừa trả lời và cập nhật `quizQueue` bằng kết quả đó.
3. Nếu bạn muốn scale: triển khai Cloud Function onWrite để cập nhật `p_recall` trong document `words`.

---

Nếu bạn muốn, tôi có thể áp dụng sửa nhanh (patch) vào `SmartQuiz.tsx` để làm optimistic update ngay — bạn muốn tôi thêm patch đó bây giờ không?

---

Tác giả: Assistant — Hướng dẫn ngắn cho `SmartQuiz` và AI model
