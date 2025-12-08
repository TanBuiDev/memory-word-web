# Filter & Presets — Usage Guide

This document explains how to use the advanced filters and saved filter presets in MemoryWord.

## Where to find the filters

- Open the app and go to the **Home** page. The filters panel is above the word list, under the category row.
- The panel contains controls for memorized status, date range, difficulty, tags, and a small preset manager.

## Controls

- Trạng thái (Status)

  - `Tất cả`: show all words
  - `Đã nhớ`: show only memorized words
  - `Chưa nhớ`: show only not-memorized words

- Ngày từ / đến (Date range)

  - Choose `Ngày từ` and `đến` to filter words added during the selected period.
  - The filter uses the `createdAtClient` fallback to `createdAt` timestamp.

- Difficulty

  - If you used difficulty tags on words, pick one to limit the list to that difficulty.

- Tags
  - Enter comma-separated tags (e.g. `phrasal,business`) to show only words that include all the listed tags.
  - Tags are matched case-insensitively.

## Saved filter presets

- To save the current filter set, enter a name in the `Tên preset` field and click `Lưu filter`.
- Presets are stored in your browser's `localStorage` (key: `filterPresets_{yourUid}`) so they persist across reloads on the same device and browser.
- Click a preset in the list to apply it. Use the ✖ button next to a preset to delete it.

## Tagging words

- When adding a word manually (Manual TOEIC form), use the `Tags` field to enter comma-separated tags.
- Tags are saved to the `words` document as an array `tags: string[]`.
- Words added via the dictionary API are created with `tags: []` by default.

## Best practices & troubleshooting

- Use short tag tokens (no spaces) like `phrasal`, `business`, `basic` for reliable matching.
- If presets are not showing after signing in, confirm you're using the same browser and that localStorage is enabled.
- If you want presets to be available on multiple devices, ask to enable server-side presets (Firestore persistence) — this requires a small backend change and Firestore rules update.

## Next steps (optional enhancements you can request)

- Persist presets in Firestore so they sync across devices.
- Convert the tags input to chips with autocomplete and suggestions.
- Add an inline tag editor inside each word card for quick edits.

If you'd like, I can implement any of the improvements above — tell me which one to prioritize.
