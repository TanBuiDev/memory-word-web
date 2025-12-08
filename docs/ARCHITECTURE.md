# Cấu Trúc Dự Án React (Feature-based / Bulletproof React)

Tài liệu này mô tả kiến trúc feature-based được áp dụng trong dự án. Mục tiêu: tính mở rộng (scalability), dễ bảo trì (maintainability) và phân tách trách nhiệm rõ ràng.

---

## 1. Tổng quan thư mục

Dưới đây là cấu trúc thư mục tiêu chuẩn (ví dụ):

```text
my-app/
├── public/              # File tĩnh (favicon, robots.txt, manifest.json)
├── src/
│   ├── assets/          # Images, Fonts, Icons
│   ├── components/      # Shared UI components (dùng chung toàn app)
│   ├── config/          # Config môi trường, constants
│   ├── features/        # [CORE] Modules theo tính năng (feature-based)
│   ├── hooks/           # Custom hooks (useTheme, useLocalStorage)
│   ├── layouts/         # Layouts (MainLayout, AuthLayout)
│   ├── lib/             # Wrapper cho 3rd-party libs (axios, firebase...)
│   ├── pages/           # Route-level pages (lắp ghép features)
│   ├── routes/          # React Router config
│   ├── stores/          # Global state (Redux, Zustand...)
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Helpers (formatters, validators)
│   ├── App.tsx
│   └── main.tsx
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 2. Chi tiết các thư mục quan trọng

- `src/features/` — Trái tim của kiến trúc: gom code theo tính năng (feature). Mỗi feature là một module độc lập.

  Ví dụ cấu trúc một feature (`src/features/auth`):

  ```text
  src/features/auth/
  ├── api/        # API calls riêng cho feature (login, logout)
  ├── components/ # Components riêng feature (LoginForm)
  ├── hooks/      # Custom hooks riêng feature (useAuth)
  ├── types/      # Types riêng feature
  └── index.ts    # Public API của feature
  ```

- `src/components/` — Shared (presentational) components: Button, Input, Modal, LoadingSpinner, Card. Không chứa business logic, chỉ nhận props và render.

- `src/lib/` — Cấu hình / wrapper cho thư viện: ví dụ `lib/axios.ts` (interceptors, base URL), `lib/react-query.ts` (QueryClient), `lib/firebase.ts`.

- `src/pages/` — Route-level components: kết hợp features vào layout. Pages nên chứa ít logic; logic chính nằm trong features/hook.

## 3. Best practices & quy ước

- Absolute imports (configure `tsconfig.json` và `vite.config.ts`) — dùng alias để tránh `../../../`:

```ts
import { LoginForm } from "@/features/auth";
```

- Barrel files: mỗi thư mục public API nên có `index.ts` để gom exports.

- Quy tắc 80/20:
  - Component chỉ dùng trong 1 feature → đặt trong `features/{feature}/components`.
  - Component dùng trong nhiều feature → đặt trong `src/components`.

## 4. Luồng dữ liệu (Data Flow)

1. UI Component (page/feature) kích hoạt hành động.
2. Hook (React Query / custom hook) gọi API từ `feature/api`.
3. API sử dụng instance trong `lib` (axios, fetch wrapper) để gửi request.
4. Dữ liệu trả về cập nhật global store hoặc cache (React Query, Redux).
5. UI tự động re-render theo state/cache.

## 5. Gợi ý triển khai

- Tách rõ: presentation (dumb) vs container (smart) components.
- Giữ `pages/` nhẹ — chỉ compose components + pass props.
- Viết tests cho `features` (unit + integration) thay vì cho từng file UI nhỏ.
- Với Firebase: tách logic đọc/ghi ra `lib/firebase.ts` và chỉ dùng client SDK trong UI/hook, admin SDK trong Cloud Functions.

---

Tài liệu này là một khuôn khổ chung — điều chỉnh những quy ước cho phù hợp với đội/scale dự án.
