# 🔐 Firestore Security Rules - Hướng dẫn thiết lập

## 📋 Tổng quan

File `firestore.rules` đã được tạo với các quy tắc bảo mật cho Leaderboard feature và các collection khác.

## 🚀 Các bước triển khai

### 1. Deploy Firestore Rules

Chạy lệnh sau để deploy rules lên Firebase:

```bash
firebase deploy --only firestore:rules
```

Hoặc deploy tất cả:

```bash
firebase deploy
```

### 2. Tạo Firestore Indexes (Bắt buộc)

Firestore cần indexes cho các queries trong leaderboard. Chạy lệnh sau:

```bash
firebase deploy --only firestore:indexes
```

Hoặc tạo indexes thủ công trong Firebase Console:

1. Vào **Firestore Database** → **Indexes**
2. Click **Create Index**
3. Tạo 2 indexes sau:

#### Index 1: Weekly XP Leaderboard
- **Collection ID**: `users`
- **Fields to index**:
  - `stats.weeklyXP` (Descending)
- **Query scope**: Collection

#### Index 2: Total XP Leaderboard
- **Collection ID**: `users`
- **Fields to index**:
  - `stats.totalXP` (Descending)
- **Query scope**: Collection

### 3. Kiểm tra Rules

Sau khi deploy, kiểm tra rules trong Firebase Console:
- **Firestore Database** → **Rules**
- Xác nhận rules đã được cập nhật

## 📝 Giải thích Rules

### Users Collection

```javascript
match /users/{userId} {
  // Đọc document của chính mình
  allow read: if isOwner(userId);
  
  // Đọc document của user khác (cho leaderboard)
  allow read: if isAuthenticated();
  
  // Chỉnh sửa document của chính mình
  allow create, update, delete: if isOwner(userId);
}
```

**Lý do**: 
- Users cần đọc được thông tin của user khác để hiển thị leaderboard
- Nhưng chỉ có thể chỉnh sửa document của chính mình

### Words, Lists, Interaction Log Collections

Tất cả đều có quy tắc tương tự:
- Chỉ đọc/ghi document của chính mình
- Kiểm tra `userId` trong document phải khớp với `request.auth.uid`

## ⚠️ Lưu ý bảo mật

1. **Email privacy**: Rules hiện tại cho phép đọc email của user khác. Nếu muốn bảo vệ privacy hơn, có thể:
   - Không lưu email trong leaderboard query
   - Hoặc tạo một collection riêng `leaderboard_public` chỉ chứa dữ liệu công khai

2. **Performance**: 
   - Queries sử dụng `.limit(30)` để tối ưu
   - Indexes giúp queries chạy nhanh hơn

3. **Testing**: 
   - Sử dụng Firebase Emulator để test rules trước khi deploy
   - Kiểm tra trong Firebase Console → Rules → Test

## 🧪 Test Rules

### Test Case 1: Đọc leaderboard
```javascript
// Should PASS
- User authenticated
- Reading /users/{otherUserId}
```

### Test Case 2: Chỉnh sửa user khác
```javascript
// Should FAIL
- User authenticated
- Updating /users/{otherUserId} where userId != auth.uid
```

### Test Case 3: Chỉnh sửa user của mình
```javascript
// Should PASS
- User authenticated
- Updating /users/{userId} where userId == auth.uid
```

## 🔧 Troubleshooting

### Lỗi: "Missing or insufficient permissions"

1. **Kiểm tra rules đã deploy chưa**:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Kiểm tra user đã đăng nhập chưa**:
   - Xác nhận `request.auth.uid` không null

3. **Kiểm tra indexes**:
   - Vào Firebase Console → Firestore → Indexes
   - Đảm bảo indexes đã được tạo và build xong

### Lỗi: "The query requires an index"

1. Click vào link trong error message để tạo index tự động
2. Hoặc tạo index thủ công như hướng dẫn ở trên

## 📚 Tài liệu tham khảo

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

