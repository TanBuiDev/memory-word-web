import type { InteractionLog } from "../types/interaction"

// ================================
//   CONFIG
// ================================

// URL Cloud Function v2 --- dùng URL Cloud Run, KHÔNG dùng cloudfunctions.net
const LOG_API_URL = "https://savelogs-rsjs2ja4da-uc.a.run.app"

// Gửi batch mỗi X mili giây
const BATCH_INTERVAL = 5000 // 5 giây

// Nếu buffer >= số lượng này → gửi ngay
const BATCH_SIZE = 20

// ================================
//   INTERNAL STATE
// ================================

// Lưu log trong RAM
let buffer: InteractionLog[] = []

// Timer để gửi batch
let timer: number | null = null

// Chống spam — mỗi key chỉ được log sau N ms
const throttleMap: Map<string, number> = new Map()

// ================================
//   PUBLIC FUNCTION: addLog
// ================================

export function addLog(log: InteractionLog) {
    const now = Date.now()

    // ============ CHỐNG SPAM ============
    const key = log.type + "_" + log.wordId
    const last = throttleMap.get(key)

    // Nếu log cùng loại xảy ra < 300ms → SPAM → bỏ
    if (last && now - last < 300) {
        return
    }

    throttleMap.set(key, now)

    // ============ THÊM LOG VÀO BUFFER ============
    buffer.push(log)

    // Nếu buffer lớn → gửi ngay
    if (buffer.length >= BATCH_SIZE) {
        flushLogs()
        return
    }

    // Tạo timer nếu chưa có
    if (timer === null) {
        timer = window.setTimeout(() => {
            flushLogs()
        }, BATCH_INTERVAL)
    }
}

// ================================
//   INTERNAL FUNCTION: flushLogs
// ================================

async function flushLogs() {
    if (buffer.length === 0) return

    // Copy batch ra để gửi
    const batch = [...buffer]
    buffer = []

    // Xoá timer
    if (timer !== null) {
        clearTimeout(timer)
        timer = null
    }

    try {
        const res = await fetch(LOG_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logs: batch })
        })

        if (!res.ok) {
            console.error("saveLogs error:", res.status, await res.text())
            // retry: add lại vào buffer
            buffer = [...batch, ...buffer]
        }
    } catch (err) {
        console.error("Failed to send logs:", err)
        // retry: add lại vào buffer
        buffer = [...batch, ...buffer]
    }
}
